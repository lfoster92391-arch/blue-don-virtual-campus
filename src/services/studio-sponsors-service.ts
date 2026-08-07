/**
 * Broadcast Control Studio — the sponsor book (Phase 7).
 *
 * Two rules shape this file.
 *
 *  - **The directory is not duplicated.** Who the school works with lives in
 *    `Partner`; a sponsor can adopt one of those rows (`partnerId`) so a name
 *    and logo are entered once. What lives here is only what a broadcast needs
 *    and a directory does not have: rotation order, billboard duration, and
 *    whether the sponsor is in tonight's book.
 *  - **The card on air is never a copy.** A sponsor graphic stores a
 *    `sponsorId`, resolved on every overlay read, exactly as score cards store
 *    a `gameId`. Fixing a misspelled sponsor name fixes what is on the air.
 *
 * No impression counts. `lastLiveAt` exists so rotation can start from the one
 * that has waited longest, and that is the whole of it.
 *
 * See docs/BROADCAST_STUDIO.md.
 */

import {
  clampSponsorDuration,
  STUDIO_SPONSOR_LOGO_URL_MAX,
  STUDIO_SPONSOR_MAX,
  STUDIO_SPONSOR_NAME_MAX,
  STUDIO_SPONSOR_TAGLINE_MAX,
} from "@/config/broadcast-studio";
import type { CampusRole } from "@/config/roles";
import { withDatabase } from "@/lib/prisma";
import { canManageCampusMedia } from "@/services/media-service";

/* --------------------------------------------------------------- shapes */

/** What the overlay renders for a sponsor. Public marketing copy only. */
export type StudioSponsorBillboard = {
  id: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
};

export type StudioSponsorView = StudioSponsorBillboard & {
  /** The campus `Partner` this sponsor was adopted from, when there is one. */
  partnerId: string | null;
  partnerName: string | null;
  durationSeconds: number;
  priority: number;
  isActive: boolean;
  lastLiveAt: string | null;
  updatedByName: string | null;
};

/** A campus partner the crew can adopt into the book without retyping it. */
export type StudioSponsorPartnerOption = {
  id: string;
  name: string;
  logoUrl: string | null;
  /** Already in the book — the picker greys it out rather than hiding it. */
  adopted: boolean;
};

export type StudioSponsorResult =
  | { sponsor: StudioSponsorView }
  | { error: string };

/* ---------------------------------------------------------- sanitizing */

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim().slice(0, max);
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Logos are rendered by an unauthenticated page, so only absolute http(s)
 * URLs are stored — no `javascript:`, no `data:` payload smuggled into the
 * overlay, and nothing relative that would resolve against the campus origin.
 */
export function parseSponsorLogoUrl(value: unknown): string | null {
  const raw = text(value, STUDIO_SPONSOR_LOGO_URL_MAX);
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------ read side */

type SponsorRow = {
  id: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
  partnerId: string | null;
  durationSeconds: number;
  priority: number;
  isActive: boolean;
  lastLiveAt: Date | null;
  updatedByName: string | null;
  partner: { name: string } | null;
};

const SPONSOR_SELECT = {
  id: true,
  name: true,
  tagline: true,
  logoUrl: true,
  partnerId: true,
  durationSeconds: true,
  priority: true,
  isActive: true,
  lastLiveAt: true,
  updatedByName: true,
  partner: { select: { name: true } },
} as const;

function toSponsorView(row: SponsorRow): StudioSponsorView {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    partnerId: row.partnerId,
    partnerName: row.partner?.name ?? null,
    durationSeconds: row.durationSeconds,
    priority: row.priority,
    isActive: row.isActive,
    lastLiveAt: row.lastLiveAt ? row.lastLiveAt.toISOString() : null,
    updatedByName: row.updatedByName,
  };
}

/** Rotation order: priority first, then name, so the list reads the same everywhere. */
export async function listStudioSponsors(options?: {
  activeOnly?: boolean;
}): Promise<StudioSponsorView[]> {
  const rows = await withDatabase((prisma) =>
    prisma.studioSponsor.findMany({
      where: options?.activeOnly ? { isActive: true } : undefined,
      orderBy: [{ priority: "asc" }, { name: "asc" }],
      take: STUDIO_SPONSOR_MAX,
      select: SPONSOR_SELECT,
    }),
  );

  return rows ? rows.map(toSponsorView) : [];
}

/**
 * Approved campus partners with a logo, for the adopt picker. This is the
 * adapter that keeps the school from maintaining two lists of the same
 * businesses.
 */
export async function listSponsorPartnerOptions(): Promise<
  StudioSponsorPartnerOption[]
> {
  const rows = await withDatabase(async (prisma) => {
    const [partners, adopted] = await Promise.all([
      prisma.partner.findMany({
        where: { status: "APPROVED" },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        take: 200,
        select: { id: true, name: true, logoUrl: true },
      }),
      prisma.studioSponsor.findMany({
        where: { partnerId: { not: null } },
        select: { partnerId: true },
      }),
    ]);

    const taken = new Set(
      adopted
        .map((row) => row.partnerId)
        .filter((id): id is string => Boolean(id)),
    );

    return partners.map((partner) => ({
      id: partner.id,
      name: partner.name,
      logoUrl: partner.logoUrl,
      adopted: taken.has(partner.id),
    }));
  });

  return rows ?? [];
}

/* ----------------------------------------------------------- write side */

export type StudioSponsorInput = {
  id?: string | null;
  name: string;
  tagline?: string | null;
  logoUrl?: string | null;
  partnerId?: string | null;
  durationSeconds?: number | null;
  priority?: number | null;
  isActive?: boolean;
};

/**
 * Add or edit one sponsor. Crew-gated, and re-checked here rather than only in
 * the action, because a server function is reachable by POST on its own.
 */
export async function saveStudioSponsor(input: {
  actorId: string;
  actorName: string;
  role: CampusRole;
  sponsor: StudioSponsorInput;
}): Promise<StudioSponsorResult> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage sponsors." };
  }

  const name = text(input.sponsor.name, STUDIO_SPONSOR_NAME_MAX);
  if (!name) {
    return { error: "A sponsor needs a name." };
  }

  const data = {
    name,
    tagline: text(input.sponsor.tagline, STUDIO_SPONSOR_TAGLINE_MAX),
    logoUrl: parseSponsorLogoUrl(input.sponsor.logoUrl),
    partnerId: input.sponsor.partnerId?.trim() || null,
    durationSeconds: clampSponsorDuration(
      input.sponsor.durationSeconds ?? Number.NaN,
    ),
    priority: Math.min(
      Math.max(Math.round(input.sponsor.priority ?? 0), 0),
      999,
    ),
    isActive: input.sponsor.isActive ?? true,
    updatedById: input.actorId,
    updatedByName: input.actorName,
  };

  const saved = await withDatabase(async (prisma) => {
    if (input.sponsor.id) {
      return prisma.studioSponsor.update({
        where: { id: input.sponsor.id },
        data,
        select: SPONSOR_SELECT,
      });
    }

    // The book is a season's sponsors, not an ad server — refuse rather than
    // let the list grow past what an operator can read under pressure.
    const count = await prisma.studioSponsor.count();
    if (count >= STUDIO_SPONSOR_MAX) {
      return null;
    }

    return prisma.studioSponsor.create({ data, select: SPONSOR_SELECT });
  });

  if (!saved) {
    return {
      error: input.sponsor.id
        ? "Unable to save the sponsor. Check database connectivity."
        : `The sponsor book holds ${STUDIO_SPONSOR_MAX} sponsors. Remove one first.`,
    };
  }

  return { sponsor: toSponsorView(saved) };
}

/**
 * Removes a sponsor from the book. Any graphic pointing at it keeps its typed
 * copy and loses the link (`onDelete: SetNull`), so nothing on air breaks —
 * but a sponsor that is currently live is refused, because a card should be
 * taken off the air deliberately, not by a list edit.
 */
export async function deleteStudioSponsor(input: {
  actorId: string;
  role: CampusRole;
  sponsorId: string;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage sponsors." };
  }

  const done = await withDatabase(async (prisma) => {
    const live = await prisma.studioGraphic.findFirst({
      where: { sponsorId: input.sponsorId, state: "LIVE" },
      select: { id: true },
    });

    if (live) {
      return "LIVE" as const;
    }

    await prisma.studioSponsor.delete({ where: { id: input.sponsorId } });
    return "DELETED" as const;
  });

  if (done === "LIVE") {
    return { error: "That sponsor is on air. Take it off the overlay first." };
  }

  return done === "DELETED"
    ? { ok: true }
    : { error: "Unable to remove the sponsor." };
}

/**
 * The sponsor to take next: the active one after `afterSponsorId` in rotation
 * order, wrapping to the top. Manual, ordered, and boring — which is what a
 * student operator needs at 7:40 in the morning.
 */
export function nextSponsorInRotation(
  sponsors: StudioSponsorView[],
  afterSponsorId: string | null,
): StudioSponsorView | null {
  const active = sponsors.filter((sponsor) => sponsor.isActive);
  if (active.length === 0) {
    return null;
  }

  const index = afterSponsorId
    ? active.findIndex((sponsor) => sponsor.id === afterSponsorId)
    : -1;

  return active[(index + 1) % active.length] ?? null;
}

/** Stamps when a sponsor last went to air. Not an impression count. */
export async function markSponsorTaken(sponsorId: string): Promise<void> {
  await withDatabase((prisma) =>
    prisma.studioSponsor.update({
      where: { id: sponsorId },
      data: { lastLiveAt: new Date() },
      select: { id: true },
    }),
  );
}
