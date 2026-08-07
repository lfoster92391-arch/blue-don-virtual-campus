/**
 * Broadcast Control Studio — graphics and the OBS overlay surface (Phase 6).
 *
 * The overlay is an OBS Browser Source, so the page it loads cannot log in.
 * Control is therefore split: the console (crew-gated) writes what is on air,
 * and the overlay (unauthenticated, reached only through a long session key)
 * reads it. Two rules follow from that and hold everywhere below.
 *
 *  - **Nothing sensitive crosses.** A graphic may only hold copy that is
 *    already public on the campus sports surfaces. No stream key, no OBS
 *    password, no student data beyond a roster name the Sports Desk publishes.
 *  - **The score is never copied.** Score, lineup, and final cards store a
 *    `gameId`; the score itself is read from `SportsGame` when the overlay
 *    polls, so the graphic on screen and `/sports` can never disagree.
 *
 * See docs/BROADCAST_STUDIO.md and docs/STUDIO_OVERLAY_SETUP.md.
 */

import { randomBytes } from "crypto";

import {
  STUDIO_GRAPHIC_ORDER,
  STUDIO_GRAPHIC_TEXT_MAX,
  STUDIO_LINEUP_MAX_ENTRIES,
  STUDIO_OVERLAY_DEFAULT_KEY,
  STUDIO_OVERLAY_HEARTBEAT_INTERVAL_MS,
  STUDIO_OVERLAY_KEY_BYTES,
  STUDIO_OVERLAY_ONLINE_WINDOW_MS,
  STUDIO_OVERLAY_ROUTE_PREFIX,
  studioGraphicRegion,
} from "@/config/broadcast-studio";
import type { CampusRole } from "@/config/roles";
import type {
  StudioGraphicKind,
  StudioGraphicState,
} from "@/generated/prisma/client";
import { withDatabase } from "@/lib/prisma";
import { canManageCampusMedia } from "@/services/media-service";
import {
  markSponsorTaken,
  type StudioSponsorBillboard,
} from "@/services/studio-sponsors-service";

/* --------------------------------------------------------------- shapes */

/** One row of a lineup card. Roster copy only. */
export type StudioGraphicEntry = {
  name: string;
  number: string | null;
  detail: string | null;
};

/**
 * The game clock as the console last pushed it. The clock is session-local to
 * the console (no campus table stores one), so the overlay is handed an anchor
 * — seconds left at `at` — and runs it forward itself rather than the console
 * writing a row every second.
 */
export type StudioGraphicClock = {
  seconds: number;
  running: boolean;
  at: string;
  period: string | null;
};

/** Operator-typed copy. Every field is optional; none of it is required. */
export type StudioGraphicFields = {
  title: string | null;
  subtitle: string | null;
  detail: string | null;
  note: string | null;
  entries: StudioGraphicEntry[];
  clock: StudioGraphicClock | null;
};

export type StudioGraphicView = {
  kind: StudioGraphicKind;
  state: StudioGraphicState;
  fields: StudioGraphicFields;
  gameId: string | null;
  playerId: string | null;
  sponsorId: string | null;
  /**
   * Resolved on every read rather than copied into `fields`, so correcting a
   * sponsor's name or logo in the book corrects the card on air.
   */
  sponsor: StudioSponsorBillboard | null;
  takenAt: string | null;
  updatedAt: string;
  updatedByName: string | null;
};

export type StudioGraphicsState = {
  /** False until an overlay row exists — i.e. the console has never rendered. */
  configured: boolean;
  /** The overlay polled inside the liveness window. The only honest "attached". */
  overlayOnline: boolean;
  overlayLastSeenAt: string | null;
  /** Every stored graphic, cued or live, so the panel can reopen saved copy. */
  items: StudioGraphicView[];
};

/** What the console page needs to print the Browser Source URL. Server only. */
export type StudioOverlayTarget = {
  key: string;
  label: string;
  /** Path including the session key. Never travels in the polled snapshot. */
  path: string;
};

const EMPTY_GRAPHIC_FIELDS: StudioGraphicFields = {
  title: null,
  subtitle: null,
  detail: null,
  note: null,
  entries: [],
  clock: null,
};

const EMPTY_GRAPHICS_STATE: StudioGraphicsState = {
  configured: false,
  overlayOnline: false,
  overlayLastSeenAt: null,
  items: [],
};

/* ---------------------------------------------------------- sanitizing */

function text(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().slice(0, STUDIO_GRAPHIC_TEXT_MAX);
  return trimmed.length > 0 ? trimmed : null;
}

function parseClock(value: unknown): StudioGraphicClock | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const seconds = typeof raw.seconds === "number" ? raw.seconds : null;
  if (seconds === null || !Number.isFinite(seconds)) {
    return null;
  }

  const at = typeof raw.at === "string" ? Date.parse(raw.at) : NaN;

  return {
    // A clock over four hours is a mistake, not a game.
    seconds: Math.min(Math.max(Math.round(seconds), 0), 4 * 60 * 60),
    running: Boolean(raw.running),
    at: new Date(Number.isNaN(at) ? Date.now() : at).toISOString(),
    period: text(raw.period),
  };
}

function parseEntries(value: unknown): StudioGraphicEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return null;
      }
      const raw = entry as Record<string, unknown>;
      const name = text(raw.name);
      return name
        ? { name, number: text(raw.number), detail: text(raw.detail) }
        : null;
    })
    .filter((entry): entry is StudioGraphicEntry => entry !== null)
    .slice(0, STUDIO_LINEUP_MAX_ENTRIES);
}

/**
 * Narrows whatever arrives into the four text lines, the lineup rows, and the
 * clock anchor. Anything else a caller sends is dropped rather than stored —
 * the overlay is public, so this is the boundary that keeps it boring.
 */
export function parseGraphicFields(value: unknown): StudioGraphicFields {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return EMPTY_GRAPHIC_FIELDS;
  }

  const raw = value as Record<string, unknown>;

  return {
    title: text(raw.title),
    subtitle: text(raw.subtitle),
    detail: text(raw.detail),
    note: text(raw.note),
    entries: parseEntries(raw.entries),
    clock: parseClock(raw.clock),
  };
}

/* ------------------------------------------------------------- overlay */

function newSessionKey(): string {
  return randomBytes(STUDIO_OVERLAY_KEY_BYTES).toString("base64url");
}

/** Session keys only ever come from `newSessionKey`, so this is a cheap filter. */
function isPlausibleSessionKey(value: string): boolean {
  return /^[A-Za-z0-9_-]{16,128}$/.test(value);
}

export function studioOverlayPath(sessionKey: string): string {
  return `${STUDIO_OVERLAY_ROUTE_PREFIX}/${sessionKey}`;
}

function overlayLabel(key: string): string {
  return key === STUDIO_OVERLAY_DEFAULT_KEY ? "Studio B overlay" : key;
}

function isFresh(lastSeenAt: Date | null, now: number): boolean {
  return Boolean(
    lastSeenAt && now - lastSeenAt.getTime() <= STUDIO_OVERLAY_ONLINE_WINDOW_MS,
  );
}

/**
 * The overlay row for a surface, created on first use.
 *
 * Only the crew-gated console page calls this, and the session key it returns
 * is rendered once into that page — it is deliberately absent from the polled
 * console snapshot, which is refreshed every few seconds and easier to leave
 * open on a shared screen.
 */
export async function ensureStudioOverlay(options?: {
  overlayKey?: string;
}): Promise<StudioOverlayTarget | null> {
  const key = options?.overlayKey?.trim() || STUDIO_OVERLAY_DEFAULT_KEY;

  const row = await withDatabase((prisma) =>
    prisma.studioOverlay.upsert({
      where: { key },
      create: { key, label: overlayLabel(key), sessionKey: newSessionKey() },
      update: {},
      select: { key: true, label: true, sessionKey: true },
    }),
  );

  return row
    ? { key: row.key, label: row.label, path: studioOverlayPath(row.sessionKey) }
    : null;
}

/**
 * A new session key, which immediately orphans the old Browser Source URL.
 * Cheap to do between shows, and the only recovery if a URL gets shared.
 */
export async function rotateStudioOverlayKey(input: {
  actorId: string;
  role: CampusRole;
  overlayKey?: string;
}): Promise<{ path: string } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can change the overlay URL." };
  }

  const key = input.overlayKey?.trim() || STUDIO_OVERLAY_DEFAULT_KEY;
  const sessionKey = newSessionKey();

  const row = await withDatabase((prisma) =>
    prisma.studioOverlay.upsert({
      where: { key },
      create: { key, label: overlayLabel(key), sessionKey },
      update: { sessionKey, lastSeenAt: null },
      select: { sessionKey: true },
    }),
  );

  return row
    ? { path: studioOverlayPath(row.sessionKey) }
    : { error: "Unable to rotate the overlay URL. Check database connectivity." };
}

/* ---------------------------------------------------------- read side */

type GraphicRow = {
  kind: StudioGraphicKind;
  state: StudioGraphicState;
  fields: unknown;
  gameId: string | null;
  playerId: string | null;
  sponsorId: string | null;
  sponsor: StudioSponsorBillboard | null;
  takenAt: Date | null;
  updatedAt: Date;
  updatedByName: string | null;
};

function toGraphicView(row: GraphicRow): StudioGraphicView {
  return {
    kind: row.kind,
    state: row.state,
    fields: parseGraphicFields(row.fields),
    gameId: row.gameId,
    playerId: row.playerId,
    sponsorId: row.sponsorId,
    sponsor: row.sponsor,
    takenAt: row.takenAt ? row.takenAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    updatedByName: row.updatedByName,
  };
}

const GRAPHIC_SELECT = {
  kind: true,
  state: true,
  fields: true,
  gameId: true,
  playerId: true,
  sponsorId: true,
  sponsor: { select: { id: true, name: true, tagline: true, logoUrl: true } },
  takenAt: true,
  updatedAt: true,
  updatedByName: true,
} as const;

/** Graphics state for the console snapshot. Carries no session key. */
export async function getStudioGraphicsState(options?: {
  overlayKey?: string;
}): Promise<StudioGraphicsState> {
  const key = options?.overlayKey?.trim() || STUDIO_OVERLAY_DEFAULT_KEY;

  const row = await withDatabase((prisma) =>
    prisma.studioOverlay.findUnique({
      where: { key },
      select: {
        lastSeenAt: true,
        graphics: {
          where: { state: { in: ["PREVIEW", "LIVE"] } },
          select: GRAPHIC_SELECT,
        },
      },
    }),
  );

  if (!row) {
    return EMPTY_GRAPHICS_STATE;
  }

  return {
    configured: true,
    overlayOnline: isFresh(row.lastSeenAt, Date.now()),
    overlayLastSeenAt: row.lastSeenAt ? row.lastSeenAt.toISOString() : null,
    items: row.graphics.map(toGraphicView),
  };
}

export type StudioOverlayRead = {
  overlayKey: string;
  /** Only the graphics that are actually on air. PREVIEW never leaves the console. */
  live: StudioGraphicView[];
};

/**
 * What the overlay page and its polling endpoint read.
 *
 * Unknown keys return null so the route can answer 404 without saying whether
 * the key was close. The same call stamps `lastSeenAt`, throttled, which is how
 * the console knows a Browser Source is actually attached.
 */
export async function readStudioOverlay(
  sessionKey: string,
): Promise<StudioOverlayRead | null> {
  if (!isPlausibleSessionKey(sessionKey)) {
    return null;
  }

  const now = new Date();

  const row = await withDatabase(async (prisma) => {
    const overlay = await prisma.studioOverlay.findUnique({
      where: { sessionKey },
      select: {
        id: true,
        key: true,
        lastSeenAt: true,
        graphics: {
          where: { state: "LIVE" },
          select: GRAPHIC_SELECT,
        },
      },
    });

    if (!overlay) {
      return null;
    }

    const stale =
      !overlay.lastSeenAt ||
      now.getTime() - overlay.lastSeenAt.getTime() >=
        STUDIO_OVERLAY_HEARTBEAT_INTERVAL_MS;

    if (stale) {
      await prisma.studioOverlay.update({
        where: { id: overlay.id },
        data: { lastSeenAt: now },
      });
    }

    return overlay;
  });

  return row
    ? { overlayKey: row.key, live: row.graphics.map(toGraphicView) }
    : null;
}

/* --------------------------------------------------------- write side */

/** The other kinds that share this one's region — what a take has to clear. */
function siblingKinds(kind: StudioGraphicKind): StudioGraphicKind[] {
  const region = studioGraphicRegion(kind);

  return STUDIO_GRAPHIC_ORDER.filter(
    (candidate) =>
      candidate !== kind && studioGraphicRegion(candidate) === region,
  );
}

export type StudioGraphicResult =
  | { graphic: StudioGraphicView }
  | { error: string };

export type StudioGraphicIntent = "CUE" | "TAKE";

/**
 * Cue or take one graphic.
 *
 * Two rules make the panel predictable under pressure:
 *  - A take clears whatever else was live in the same region, so a player ID
 *    replaces the lower third instead of landing on top of it.
 *  - Cueing a graphic that is already on air updates the copy in place and
 *    leaves it up. Fixing a misspelled name should not blank the screen.
 */
export async function saveStudioGraphic(input: {
  actorId: string;
  actorName: string;
  role: CampusRole;
  kind: StudioGraphicKind;
  intent: StudioGraphicIntent;
  fields: unknown;
  gameId?: string | null;
  playerId?: string | null;
  /** Sponsor cards point at the book instead of copying a name and a logo. */
  sponsorId?: string | null;
  overlayKey?: string;
}): Promise<StudioGraphicResult> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can put graphics on air." };
  }

  const overlayKey = input.overlayKey?.trim() || STUDIO_OVERLAY_DEFAULT_KEY;
  const fields = parseGraphicFields(input.fields);
  const now = new Date();

  const saved = await withDatabase(async (prisma) => {
    const overlay = await prisma.studioOverlay.upsert({
      where: { key: overlayKey },
      create: {
        key: overlayKey,
        label: overlayLabel(overlayKey),
        sessionKey: newSessionKey(),
      },
      update: {},
      select: { id: true },
    });

    const existing = await prisma.studioGraphic.findUnique({
      where: { overlayId_kind: { overlayId: overlay.id, kind: input.kind } },
      select: { state: true, takenAt: true },
    });

    const goingLive = input.intent === "TAKE" || existing?.state === "LIVE";

    const data = {
      state: (goingLive ? "LIVE" : "PREVIEW") as StudioGraphicState,
      fields: fields as unknown as object,
      gameId: input.gameId ?? null,
      playerId: input.playerId ?? null,
      sponsorId: input.sponsorId ?? null,
      takenAt: goingLive ? (existing?.takenAt ?? now) : null,
      clearedAt: null,
      updatedById: input.actorId,
      updatedByName: input.actorName,
    };

    const write = prisma.studioGraphic.upsert({
      where: { overlayId_kind: { overlayId: overlay.id, kind: input.kind } },
      create: { overlayId: overlay.id, kind: input.kind, ...data },
      update: data,
      select: GRAPHIC_SELECT,
    });

    if (!goingLive) {
      return write;
    }

    // One transaction, so the region never holds two live graphics — and the
    // outgoing one is dropped first, because a blink of nothing on air beats a
    // full-screen card landing under a name strap.
    const [, graphic] = await prisma.$transaction([
      prisma.studioGraphic.updateMany({
        where: {
          overlayId: overlay.id,
          state: "LIVE",
          kind: { in: siblingKinds(input.kind) },
        },
        data: { state: "CLEARED", clearedAt: now },
      }),
      write,
    ]);

    return graphic;
  });

  if (!saved) {
    return { error: "Unable to save the graphic. Check database connectivity." };
  }

  // Rotation reads this to know which sponsor has waited longest. It is a
  // last-taken stamp, not an impression count.
  if (saved.state === "LIVE" && saved.sponsorId) {
    await markSponsorTaken(saved.sponsorId);
  }

  return { graphic: toGraphicView(saved) };
}

/** Takes one graphic off air. The copy stays, so it can be re-taken as is. */
export async function clearStudioGraphic(input: {
  actorId: string;
  role: CampusRole;
  kind: StudioGraphicKind;
  overlayKey?: string;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can clear graphics." };
  }

  const overlayKey = input.overlayKey?.trim() || STUDIO_OVERLAY_DEFAULT_KEY;

  const done = await withDatabase(async (prisma) => {
    const overlay = await prisma.studioOverlay.findUnique({
      where: { key: overlayKey },
      select: { id: true },
    });

    if (!overlay) {
      return false;
    }

    await prisma.studioGraphic.updateMany({
      where: { overlayId: overlay.id, kind: input.kind },
      data: { state: "CLEARED", clearedAt: new Date() },
    });

    return true;
  });

  return done ? { ok: true } : { error: "Unable to clear the graphic." };
}

/** The panic key: everything off air in one write. Cued copy is left alone. */
export async function clearAllStudioGraphics(input: {
  actorId: string;
  role: CampusRole;
  overlayKey?: string;
}): Promise<{ ok: true; cleared: number } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can clear graphics." };
  }

  const overlayKey = input.overlayKey?.trim() || STUDIO_OVERLAY_DEFAULT_KEY;

  const cleared = await withDatabase(async (prisma) => {
    const overlay = await prisma.studioOverlay.findUnique({
      where: { key: overlayKey },
      select: { id: true },
    });

    if (!overlay) {
      return 0;
    }

    const result = await prisma.studioGraphic.updateMany({
      where: { overlayId: overlay.id, state: "LIVE" },
      data: { state: "CLEARED", clearedAt: new Date() },
    });

    return result.count;
  });

  return cleared === null
    ? { error: "Unable to clear the overlay." }
    : { ok: true, cleared };
}
