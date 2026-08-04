/**
 * Broadcast Control Studio — read-only console snapshot (Phase 3).
 *
 * One serializable payload the console renders from, so the server page and the
 * polling refresh return the exact same shape. Every field traces back to a row
 * that already exists in the campus database: CampusMediaItem, BroadcastSchedule,
 * BroadcastDailyScript / BroadcastScriptTemplate, BroadcastCrewCredit, SportsGame.
 * Nothing here fabricates telemetry — when a source is missing the field is null
 * and the UI says so. See docs/BROADCAST_STUDIO.md.
 */

import {
  renderFullScript,
  type BroadcastSlotType,
} from "@/config/broadcast-script";
import { BROADCAST_PRODUCTION_ROLE_LABELS } from "@/config/broadcast-production";
import { STUDIO_PREVIEW_WINDOW_MINUTES } from "@/config/broadcast-studio";
import { GAME_SITE_LABELS, GAME_STATUS_LABELS } from "@/config/sports-highlights";
import {
  getBroadcastSchedule,
  listCrewCredits,
} from "@/services/broadcast-production-service";
import {
  getTodaysBroadcastScript,
  resolveBroadcastOrgId,
} from "@/services/broadcast-script-service";
import { getActiveLiveStream } from "@/services/media-service";
import { getCurrentOrNextGame } from "@/services/sports-highlights-service";

/** LIVE = on-air record exists. PREVIEW = inside the pre-roll window. */
export type StudioAirState = "LIVE" | "PREVIEW" | "OFFLINE";

export type StudioProgramState = {
  state: StudioAirState;
  mediaId: string | null;
  title: string | null;
  embedUrl: string | null;
  /** ISO publish (or create) time of the on-air record — drives the elapsed clock. */
  onAirSince: string | null;
  operatorName: string | null;
};

export type StudioNextAirState = {
  at: string | null;
  title: string | null;
  notes: string | null;
  setByName: string | null;
};

export type StudioRunOfShowItem = {
  key: string;
  label: string;
  slotType: BroadcastSlotType;
  /** The filled spoken line, or the bare template when nothing is entered yet. */
  line: string;
  filled: boolean;
  required: boolean;
};

export type StudioRunOfShowState = {
  scriptDate: string | null;
  isPersisted: boolean;
  updatedAt: string | null;
  updatedByName: string | null;
  filledCount: number;
  fillableCount: number;
  items: StudioRunOfShowItem[];
};

export type StudioCrewMember = {
  id: string;
  displayName: string;
  roleLabel: string;
};

export type StudioEventContext = {
  label: string | null;
  detail: string | null;
  source: "LIVE_STREAM" | "GAME" | "SCHEDULE" | "NONE";
  startsAt: string | null;
};

export type StudioScoreboardState = {
  gameId: string;
  sportName: string;
  statusLabel: string;
  isLive: boolean;
  homeLabel: string;
  awayLabel: string;
  homeScore: number | null;
  awayScore: number | null;
  siteLabel: string;
  venue: string | null;
  level: string | null;
  kickoffAt: string;
};

export type StudioConsoleSnapshot = {
  fetchedAt: string;
  /** False when the database is unavailable, so panels can say "no data" honestly. */
  dataAvailable: boolean;
  program: StudioProgramState;
  nextAir: StudioNextAirState;
  runOfShow: StudioRunOfShowState | null;
  crew: StudioCrewMember[];
  event: StudioEventContext;
  scoreboard: StudioScoreboardState | null;
};

const CAMPUS_TEAM_LABEL = "MHS";

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}

function buildRunOfShow(
  script: Awaited<ReturnType<typeof getTodaysBroadcastScript>>,
): StudioRunOfShowState | null {
  if (!script) {
    return null;
  }

  const items: StudioRunOfShowItem[] = script.slots.map((slot) => {
    const filled =
      slot.slotType === "FIXED" ? true : slot.value.trim().length > 0;

    return {
      key: slot.key,
      label: slot.label,
      slotType: slot.slotType,
      line: filled
        ? renderFullScript([slot], script.prayerText).trim()
        : slot.template,
      filled,
      required: slot.required,
    };
  });

  const fillable = items.filter((item) => item.slotType !== "FIXED");

  return {
    scriptDate: toIso(script.scriptDate),
    isPersisted: script.isPersisted,
    updatedAt: toIso(script.updatedAt),
    updatedByName: script.updatedByName,
    filledCount: fillable.filter((item) => item.filled).length,
    fillableCount: fillable.length,
    items,
  };
}

function buildScoreboard(
  game: Awaited<ReturnType<typeof getCurrentOrNextGame>>,
): StudioScoreboardState | null {
  if (!game) {
    return null;
  }

  const campusIsHome = game.site !== "AWAY";

  return {
    gameId: game.id,
    sportName: game.sportName,
    statusLabel: GAME_STATUS_LABELS[game.status] ?? game.status,
    isLive: game.status === "LIVE",
    homeLabel: campusIsHome ? CAMPUS_TEAM_LABEL : game.opponentName,
    awayLabel: campusIsHome ? game.opponentName : CAMPUS_TEAM_LABEL,
    homeScore: campusIsHome ? game.teamScore : game.opponentScore,
    awayScore: campusIsHome ? game.opponentScore : game.teamScore,
    siteLabel: GAME_SITE_LABELS[game.site] ?? game.site,
    venue: game.venue,
    level: game.level,
    kickoffAt: game.kickoffAt.toISOString(),
  };
}

/**
 * Pick the one line that answers "what are we covering?" — the on-air program
 * first, then a current/next game, then the scheduled show title.
 */
function buildEventContext(input: {
  liveTitle: string | null;
  game: Awaited<ReturnType<typeof getCurrentOrNextGame>>;
  scheduleTitle: string | null;
  scheduleAt: Date | null;
}): StudioEventContext {
  if (input.liveTitle) {
    return {
      label: input.liveTitle,
      detail: "Campus live stream",
      source: "LIVE_STREAM",
      startsAt: null,
    };
  }

  if (input.game) {
    const site = GAME_SITE_LABELS[input.game.site] ?? input.game.site;
    const detailParts = [
      input.game.level,
      site,
      input.game.venue,
      GAME_STATUS_LABELS[input.game.status] ?? input.game.status,
    ].filter((part): part is string => Boolean(part));

    return {
      label: `${input.game.sportName} vs ${input.game.opponentName}`,
      detail: detailParts.join(" · "),
      source: "GAME",
      startsAt: input.game.kickoffAt.toISOString(),
    };
  }

  if (input.scheduleTitle) {
    return {
      label: input.scheduleTitle,
      detail: "Scheduled broadcast",
      source: "SCHEDULE",
      startsAt: toIso(input.scheduleAt),
    };
  }

  return { label: null, detail: null, source: "NONE", startsAt: null };
}

function resolveAirState(input: {
  live: boolean;
  nextAirAt: Date | null;
  now: number;
}): StudioAirState {
  if (input.live) {
    return "LIVE";
  }

  if (input.nextAirAt) {
    const msToAir = input.nextAirAt.getTime() - input.now;
    const windowMs = STUDIO_PREVIEW_WINDOW_MINUTES * 60_000;
    if (msToAir <= windowMs && msToAir > -windowMs) {
      return "PREVIEW";
    }
  }

  return "OFFLINE";
}

/**
 * Everything the console reads in one pass. Each query soft-fails to null/empty
 * on its own so a missing table never blanks the whole console.
 */
export async function getStudioConsoleSnapshot(): Promise<StudioConsoleSnapshot> {
  const now = Date.now();

  const [activeLive, schedule, crew, game, orgId] = await Promise.all([
    getActiveLiveStream().catch(() => null),
    getBroadcastSchedule().catch(() => null),
    listCrewCredits({ visibleOnly: true }).catch(() => []),
    getCurrentOrNextGame({ withinHours: 36 }).catch(() => null),
    resolveBroadcastOrgId().catch(() => null),
  ]);

  const script = orgId
    ? await getTodaysBroadcastScript(orgId).catch(() => null)
    : null;

  const nextAirAt = schedule?.nextAirAt ?? null;

  return {
    fetchedAt: new Date(now).toISOString(),
    dataAvailable: Boolean(schedule) || Boolean(orgId),
    program: {
      state: resolveAirState({ live: Boolean(activeLive), nextAirAt, now }),
      mediaId: activeLive?.id ?? null,
      title: activeLive?.title ?? null,
      embedUrl: activeLive?.embedUrl ?? null,
      onAirSince: activeLive
        ? (toIso(activeLive.publishedAt) ?? toIso(activeLive.createdAt))
        : null,
      operatorName: activeLive?.uploaderName ?? null,
    },
    nextAir: {
      at: toIso(nextAirAt),
      title: schedule?.title ?? null,
      notes: schedule?.notes ?? null,
      setByName: schedule?.updatedByName ?? null,
    },
    runOfShow: buildRunOfShow(script),
    crew: crew.map((credit) => ({
      id: credit.id,
      displayName: credit.displayName,
      roleLabel:
        BROADCAST_PRODUCTION_ROLE_LABELS[credit.productionRole] ??
        credit.productionRole,
    })),
    event: buildEventContext({
      liveTitle: activeLive?.title ?? null,
      game,
      scheduleTitle: schedule?.title ?? null,
      scheduleAt: nextAirAt,
    }),
    scoreboard: buildScoreboard(game),
  };
}
