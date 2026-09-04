/**
 * Sports Highlights service — Broadcasting's sports desk.
 *
 * Every read soft-fails to an empty list so the Sports surfaces still render
 * mid-deploy (missing tables, cold Prisma client, or bad DATABASE_URL).
 */

import { CAMPUS_MEDIA_BUCKET } from "@/config/broadcast-media";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import {
  DEFAULT_SPORTS,
  SPORTS_LOGO_MAX_BYTES,
  SPORTS_LOGO_TYPES,
  SPORTS_STORAGE_PREFIX,
  slugifySport,
  summarizeStats,
  type GameResultKey,
  type GameSiteKey,
  type GameStatusKey,
  type HighlightKindKey,
  type HighlightStatusKey,
  type ReportKindKey,
  type ReportStatusKey,
  type SportSeasonKey,
} from "@/config/sports-highlights";
import { CAMPUS_TIME_ZONE } from "@/lib/datetime/campus-local";
import { listActiveClubMemberIds } from "@/lib/command-center-permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBroadcastOrganization } from "@/services/broadcast-production-service";
import { canManageCampusMedia } from "@/services/media-service";
import {
  buildDefaultAdvisorActions,
  sendSystemStudentMessages,
} from "@/services/student-message-service";

export type SportView = {
  id: string;
  slug: string;
  name: string;
  season: SportSeasonKey;
  emoji: string | null;
  headline: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type OpponentSchoolView = {
  id: string;
  slug: string;
  name: string;
  shortName: string | null;
  mascot: string | null;
  city: string | null;
  state: string | null;
  colorPrimary: string | null;
  logoUrl: string | null;
  websiteUrl: string | null;
  notes: string | null;
  isActive: boolean;
  teams: OpponentTeamView[];
};

export type OpponentTeamView = {
  id: string;
  schoolId: string;
  schoolName: string;
  sportId: string;
  sportName: string;
  sportSlug: string;
  teamName: string;
  /** Team logo when set, otherwise the school logo. */
  logoUrl: string | null;
  isActive: boolean;
};

export type SportsGameView = {
  id: string;
  sportId: string;
  sportName: string;
  sportSlug: string;
  sportEmoji: string | null;
  opponentId: string | null;
  opponentTeamId: string | null;
  opponentName: string;
  opponentLogoUrl: string | null;
  kickoffAt: Date;
  site: GameSiteKey;
  venue: string | null;
  level: string | null;
  status: GameStatusKey;
  teamScore: number | null;
  opponentScore: number | null;
  result: GameResultKey | null;
  headline: string | null;
  summary: string | null;
  broadcastNote: string | null;
  streamUrl: string | null;
  isFeatured: boolean;
};

export type SportsHighlightView = {
  id: string;
  sportId: string;
  sportName: string;
  sportSlug: string;
  gameId: string | null;
  gameLabel: string | null;
  title: string;
  description: string | null;
  kind: HighlightKindKey;
  status: HighlightStatusKey;
  videoUrl: string | null;
  imageUrl: string | null;
  credit: string | null;
  isFeatured: boolean;
  publishedAt: Date | null;
  submittedByName: string | null;
  createdAt: Date;
};

export type SportsReportView = {
  id: string;
  gameId: string;
  kind: ReportKindKey;
  authorId: string;
  authorName: string;
  headline: string;
  body: string;
  playerOfGame: string | null;
  keyMoment: string | null;
  whatToWatch: string | null;
  status: ReportStatusKey;
  reviewNote: string | null;
  createdAt: Date;
  gameLabel: string | null;
};

export type SportsPlayerView = {
  id: string;
  sportId: string;
  sportSlug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  jerseyNumber: string | null;
  position: string | null;
  gradeYear: string | null;
  photoUrl: string | null;
  bio: string | null;
  isActive: boolean;
};

export type SportsPlayerStatView = {
  id: string;
  playerId: string;
  playerName: string;
  jerseyNumber: string | null;
  gameId: string;
  gameLabel: string | null;
  stats: Record<string, string>;
  summary: string | null;
  notes: string | null;
};

type ServiceResult<T = object> = ({ ok: true } & T) | { error: string };

function ready(): boolean {
  return isDatabaseConfigured() && isPrismaReady();
}

export function isSportsImageStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

export async function canManageSportsDesk(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  return canManageCampusMedia(userId, role);
}

function toStatRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, string>
  >((acc, [key, raw]) => {
    if (raw !== null && raw !== undefined && String(raw).trim() !== "") {
      acc[key] = String(raw).trim();
    }
    return acc;
  }, {});
}

function gameLabel(game: {
  kickoffAt: Date;
  opponentLabel: string | null;
  opponentTeam?: { teamName: string } | null;
  opponent?: { name: string } | null;
  sport?: { name: string } | null;
}): string {
  const opponent =
    game.opponentTeam?.teamName ??
    game.opponent?.name ??
    game.opponentLabel ??
    "TBD";
  const date = game.kickoffAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: CAMPUS_TIME_ZONE,
  });
  return game.sport ? `${game.sport.name} vs ${opponent} · ${date}` : `vs ${opponent} · ${date}`;
}

/* ------------------------------------------------------------------ sports */

/**
 * Active sports for the switcher. Seeds the default catalog the first time
 * so Broadcasting never lands on an empty page.
 */
export async function listSports(options?: {
  includeInactive?: boolean;
}): Promise<SportView[]> {
  if (!ready()) {
    return [];
  }

  let rows = await withDatabase((prisma) =>
    prisma.sport.findMany({
      where: options?.includeInactive ? {} : { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  );

  if (rows && rows.length === 0) {
    await withDatabase((prisma) =>
      prisma.sport.createMany({
        data: DEFAULT_SPORTS.map((sport) => ({
          slug: sport.slug,
          name: sport.name,
          season: sport.season,
          emoji: sport.emoji,
          sortOrder: sport.sortOrder,
        })),
        skipDuplicates: true,
      }),
    );
    rows = await withDatabase((prisma) =>
      prisma.sport.findMany({
        where: options?.includeInactive ? {} : { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    );
  }

  return (rows ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    season: row.season as SportSeasonKey,
    emoji: row.emoji,
    headline: row.headline,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  }));
}

export async function getSportBySlug(slug: string): Promise<SportView | null> {
  const sports = await listSports({ includeInactive: true });
  return sports.find((sport) => sport.slug === slug) ?? null;
}

export async function upsertSport(input: {
  actorId: string;
  role: CampusRole;
  sportId?: string | null;
  name: string;
  season: SportSeasonKey;
  emoji?: string | null;
  headline?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage the sport list." };
  }

  const name = input.name.trim();
  if (!name) {
    return { error: "Sport name is required." };
  }

  const data = {
    name,
    season: input.season,
    emoji: input.emoji?.trim() || null,
    headline: input.headline?.trim() || null,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
  };

  const saved = input.sportId
    ? await withDatabase((prisma) =>
        prisma.sport.update({
          where: { id: input.sportId! },
          data,
          select: { id: true },
        }),
      )
    : await withDatabase((prisma) =>
        prisma.sport.create({
          data: { ...data, slug: slugifySport(name) },
          select: { id: true },
        }),
      );

  if (!saved) {
    return { error: "Unable to save sport. Check for a duplicate name." };
  }
  return { ok: true };
}

export async function setSportActive(input: {
  actorId: string;
  role: CampusRole;
  sportId: string;
  isActive: boolean;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage the sport list." };
  }
  const updated = await withDatabase((prisma) =>
    prisma.sport.update({
      where: { id: input.sportId },
      data: { isActive: input.isActive },
      select: { id: true },
    }),
  );
  return updated ? { ok: true } : { error: "Sport not found." };
}

/* ------------------------------------------------- opponent school directory */

export async function uploadSportsImage(
  file: File,
  userId: string,
  folder: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  if (file.size <= 0 || file.size > SPORTS_LOGO_MAX_BYTES) {
    return null;
  }
  if (!(SPORTS_LOGO_TYPES as readonly string[]).includes(file.type)) {
    return null;
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const storagePath = `${SPORTS_STORAGE_PREFIX}/${folder}/${userId}/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[sports] Logo upload failed:", error.message);
    return null;
  }

  const { data } = admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: data.publicUrl };
}

export async function listOpponentSchools(options?: {
  includeInactive?: boolean;
}): Promise<OpponentSchoolView[]> {
  if (!ready()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.opponentSchool.findMany({
      where: options?.includeInactive ? {} : { isActive: true },
      orderBy: [{ name: "asc" }],
      include: {
        sportTeams: {
          include: { sport: { select: { name: true, slug: true } } },
          orderBy: { teamName: "asc" },
        },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortName: row.shortName,
    mascot: row.mascot,
    city: row.city,
    state: row.state,
    colorPrimary: row.colorPrimary,
    logoUrl: row.logoUrl,
    websiteUrl: row.websiteUrl,
    notes: row.notes,
    isActive: row.isActive,
    teams: row.sportTeams.map((team) => ({
      id: team.id,
      schoolId: row.id,
      schoolName: row.name,
      sportId: team.sportId,
      sportName: team.sport.name,
      sportSlug: team.sport.slug,
      teamName: team.teamName,
      logoUrl: team.logoUrl ?? row.logoUrl,
      isActive: team.isActive,
    })),
  }));
}

/** Clickable opponent choices for a sport — students never type a school name. */
export async function listOpponentTeamsForSport(
  sportId: string,
): Promise<OpponentTeamView[]> {
  if (!ready()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.opponentSportTeam.findMany({
      where: { sportId, isActive: true, school: { isActive: true } },
      orderBy: { teamName: "asc" },
      include: {
        school: { select: { id: true, name: true, logoUrl: true } },
        sport: { select: { name: true, slug: true } },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    schoolId: row.schoolId,
    schoolName: row.school.name,
    sportId: row.sportId,
    sportName: row.sport.name,
    sportSlug: row.sport.slug,
    teamName: row.teamName,
    logoUrl: row.logoUrl ?? row.school.logoUrl,
    isActive: row.isActive,
  }));
}

export async function upsertOpponentSchool(input: {
  actorId: string;
  role: CampusRole;
  schoolId?: string | null;
  name: string;
  shortName?: string | null;
  mascot?: string | null;
  city?: string | null;
  state?: string | null;
  colorPrimary?: string | null;
  websiteUrl?: string | null;
  notes?: string | null;
  logoUrl?: string | null;
  logoPath?: string | null;
  isActive?: boolean;
}): Promise<ServiceResult<{ schoolId: string }>> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew and admins can manage schools." };
  }

  const name = input.name.trim();
  if (!name) {
    return { error: "School name is required." };
  }

  const base = {
    name,
    shortName: input.shortName?.trim() || null,
    mascot: input.mascot?.trim() || null,
    city: input.city?.trim() || null,
    state: input.state?.trim() || null,
    colorPrimary: input.colorPrimary?.trim() || null,
    websiteUrl: input.websiteUrl?.trim() || null,
    notes: input.notes?.trim() || null,
    isActive: input.isActive ?? true,
  };

  // Keep the existing logo when this save didn't include a new upload/URL.
  const logo =
    input.logoUrl === undefined
      ? {}
      : { logoUrl: input.logoUrl, logoPath: input.logoPath ?? null };

  const saved = input.schoolId
    ? await withDatabase((prisma) =>
        prisma.opponentSchool.update({
          where: { id: input.schoolId! },
          data: { ...base, ...logo },
          select: { id: true },
        }),
      )
    : await withDatabase((prisma) =>
        prisma.opponentSchool.create({
          data: {
            ...base,
            ...logo,
            slug: slugifySport(name) || `school-${Date.now()}`,
            createdById: input.actorId,
          },
          select: { id: true },
        }),
      );

  if (!saved) {
    return { error: "Unable to save the school. A school with that name may already exist." };
  }
  return { ok: true, schoolId: saved.id };
}

export async function removeOpponentSchool(input: {
  actorId: string;
  role: CampusRole;
  schoolId: string;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew and admins can manage schools." };
  }
  const updated = await withDatabase((prisma) =>
    prisma.opponentSchool.update({
      where: { id: input.schoolId },
      data: { isActive: false },
      select: { id: true },
    }),
  );
  return updated ? { ok: true } : { error: "School not found." };
}

/** Link a school to a sport with its own team name (and optional team logo). */
export async function upsertOpponentSportTeam(input: {
  actorId: string;
  role: CampusRole;
  schoolId: string;
  sportId: string;
  teamName: string;
  logoUrl?: string | null;
  logoPath?: string | null;
  notes?: string | null;
  isActive?: boolean;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew and admins can manage schools." };
  }

  const teamName = input.teamName.trim();
  if (!teamName) {
    return { error: "Team name is required." };
  }

  const logo =
    input.logoUrl === undefined
      ? {}
      : { logoUrl: input.logoUrl, logoPath: input.logoPath ?? null };

  const saved = await withDatabase((prisma) =>
    prisma.opponentSportTeam.upsert({
      where: {
        schoolId_sportId: { schoolId: input.schoolId, sportId: input.sportId },
      },
      create: {
        schoolId: input.schoolId,
        sportId: input.sportId,
        teamName,
        notes: input.notes?.trim() || null,
        isActive: input.isActive ?? true,
        ...logo,
      },
      update: {
        teamName,
        notes: input.notes?.trim() || null,
        isActive: input.isActive ?? true,
        ...logo,
      },
      select: { id: true },
    }),
  );

  return saved ? { ok: true } : { error: "Unable to save the team." };
}

export async function removeOpponentSportTeam(input: {
  actorId: string;
  role: CampusRole;
  teamId: string;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew and admins can manage schools." };
  }
  await withDatabase((prisma) =>
    prisma.opponentSportTeam.deleteMany({ where: { id: input.teamId } }),
  );
  return { ok: true };
}

/* ------------------------------------------------------------------- games */

const gameInclude = {
  sport: { select: { name: true, slug: true, emoji: true } },
  opponent: { select: { name: true, logoUrl: true } },
  opponentTeam: {
    select: { teamName: true, logoUrl: true, school: { select: { logoUrl: true } } },
  },
} as const;

type GameRow = {
  id: string;
  sportId: string;
  opponentId: string | null;
  opponentTeamId: string | null;
  opponentLabel: string | null;
  kickoffAt: Date;
  site: string;
  venue: string | null;
  level: string | null;
  status: string;
  teamScore: number | null;
  opponentScore: number | null;
  result: string | null;
  headline: string | null;
  summary: string | null;
  broadcastNote: string | null;
  streamUrl: string | null;
  isFeatured: boolean;
  sport: { name: string; slug: string; emoji: string | null };
  opponent: { name: string; logoUrl: string | null } | null;
  opponentTeam: {
    teamName: string;
    logoUrl: string | null;
    school: { logoUrl: string | null };
  } | null;
};

function toGameView(row: GameRow): SportsGameView {
  return {
    id: row.id,
    sportId: row.sportId,
    sportName: row.sport.name,
    sportSlug: row.sport.slug,
    sportEmoji: row.sport.emoji,
    opponentId: row.opponentId,
    opponentTeamId: row.opponentTeamId,
    opponentName:
      row.opponentTeam?.teamName ??
      row.opponent?.name ??
      row.opponentLabel ??
      "TBD",
    opponentLogoUrl:
      row.opponentTeam?.logoUrl ??
      row.opponentTeam?.school.logoUrl ??
      row.opponent?.logoUrl ??
      null,
    kickoffAt: row.kickoffAt,
    site: row.site as GameSiteKey,
    venue: row.venue,
    level: row.level,
    status: row.status as GameStatusKey,
    teamScore: row.teamScore,
    opponentScore: row.opponentScore,
    result: (row.result as GameResultKey | null) ?? null,
    headline: row.headline,
    summary: row.summary,
    broadcastNote: row.broadcastNote,
    streamUrl: row.streamUrl,
    isFeatured: row.isFeatured,
  };
}

export async function listGames(options?: {
  sportId?: string;
  upcomingOnly?: boolean;
  pastOnly?: boolean;
  take?: number;
}): Promise<SportsGameView[]> {
  if (!ready()) {
    return [];
  }

  const now = new Date();
  const rows = await withDatabase((prisma) =>
    prisma.sportsGame.findMany({
      where: {
        ...(options?.sportId ? { sportId: options.sportId } : {}),
        ...(options?.upcomingOnly
          ? { kickoffAt: { gte: now }, status: { notIn: ["CANCELED"] } }
          : {}),
        ...(options?.pastOnly ? { kickoffAt: { lt: now } } : {}),
      },
      orderBy: { kickoffAt: options?.upcomingOnly ? "asc" : "desc" },
      take: options?.take ?? 50,
      include: gameInclude,
    }),
  );

  return (rows ?? []).map((row) => toGameView(row as GameRow));
}

export async function getGame(gameId: string): Promise<SportsGameView | null> {
  if (!ready()) {
    return null;
  }
  const row = await withDatabase((prisma) =>
    prisma.sportsGame.findUnique({ where: { id: gameId }, include: gameInclude }),
  );
  return row ? toGameView(row as GameRow) : null;
}

/** Banner payload: most recent completed game + the next few upcoming games. */
export async function getSportsBanner(sportId?: string): Promise<{
  lastGame: SportsGameView | null;
  upcoming: SportsGameView[];
}> {
  if (!ready()) {
    return { lastGame: null, upcoming: [] };
  }

  const now = new Date();
  const [lastRow, upcomingRows] = await Promise.all([
    withDatabase((prisma) =>
      prisma.sportsGame.findFirst({
        where: {
          ...(sportId ? { sportId } : {}),
          kickoffAt: { lte: now },
          status: { in: ["FINAL", "LIVE"] },
        },
        orderBy: { kickoffAt: "desc" },
        include: gameInclude,
      }),
    ),
    withDatabase((prisma) =>
      prisma.sportsGame.findMany({
        where: {
          ...(sportId ? { sportId } : {}),
          kickoffAt: { gte: now },
          status: { notIn: ["CANCELED"] },
        },
        orderBy: { kickoffAt: "asc" },
        take: 3,
        include: gameInclude,
      }),
    ),
  ]);

  return {
    lastGame: lastRow ? toGameView(lastRow as GameRow) : null,
    upcoming: (upcomingRows ?? []).map((row) => toGameView(row as GameRow)),
  };
}

/**
 * The game a broadcast would be covering right now: an in-progress game first,
 * otherwise the next one inside `withinHours`. Returns null when nothing is
 * close enough to call "current".
 */
export async function getCurrentOrNextGame(options?: {
  withinHours?: number;
}): Promise<SportsGameView | null> {
  if (!ready()) {
    return null;
  }

  const now = new Date();
  const horizon = new Date(
    now.getTime() + (options?.withinHours ?? 24) * 3_600_000,
  );

  const liveRow = await withDatabase((prisma) =>
    prisma.sportsGame.findFirst({
      where: { status: "LIVE" },
      orderBy: { kickoffAt: "desc" },
      include: gameInclude,
    }),
  );

  if (liveRow) {
    return toGameView(liveRow as GameRow);
  }

  const nextRow = await withDatabase((prisma) =>
    prisma.sportsGame.findFirst({
      where: {
        kickoffAt: { gte: now, lte: horizon },
        status: { notIn: ["CANCELED", "POSTPONED"] },
      },
      orderBy: { kickoffAt: "asc" },
      include: gameInclude,
    }),
  );

  return nextRow ? toGameView(nextRow as GameRow) : null;
}

/**
 * Games a broadcast could be pointed at right now: anything LIVE, plus games
 * with a kickoff inside the window on either side of now. Live games sort first,
 * then by kickoff — the order an operator scans a console picker in.
 */
export async function listCoverableGames(options?: {
  aheadHours?: number;
  behindHours?: number;
  take?: number;
}): Promise<SportsGameView[]> {
  if (!ready()) {
    return [];
  }

  const now = new Date();
  const from = new Date(now.getTime() - (options?.behindHours ?? 6) * 3_600_000);
  const to = new Date(now.getTime() + (options?.aheadHours ?? 36) * 3_600_000);

  const rows = await withDatabase((prisma) =>
    prisma.sportsGame.findMany({
      where: {
        OR: [
          { status: "LIVE" },
          {
            kickoffAt: { gte: from, lte: to },
            status: { notIn: ["CANCELED"] },
          },
        ],
      },
      orderBy: { kickoffAt: "asc" },
      take: options?.take ?? 20,
      include: gameInclude,
    }),
  );

  return (rows ?? [])
    .map((row) => toGameView(row as GameRow))
    .sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === "LIVE") {
          return -1;
        }
        if (b.status === "LIVE") {
          return 1;
        }
      }
      return a.kickoffAt.getTime() - b.kickoffAt.getTime();
    });
}

const MAX_GAME_SCORE = 999;

function clampScore(value: number | null | undefined): number | null {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return null;
  }
  return Math.min(MAX_GAME_SCORE, Math.max(0, Math.trunc(value)));
}

/**
 * Win / loss / tie only means something once a game is final with both scores
 * in. Mirrors `upsertGame` so a score edit from either surface lands the same.
 */
function resolveGameResult(
  status: GameStatusKey,
  teamScore: number | null,
  opponentScore: number | null,
): GameResultKey | null {
  if (status !== "FINAL" || teamScore === null || opponentScore === null) {
    return null;
  }
  if (teamScore > opponentScore) {
    return "WIN";
  }
  if (teamScore < opponentScore) {
    return "LOSS";
  }
  return "TIE";
}

/**
 * Narrow score / status write for live coverage. Touches only the score, status,
 * and derived result columns of an existing `SportsGame`, so the Broadcast
 * Studio and the Sports Desk stay on one row without the console needing the
 * whole schedule form (kickoff, opponent, venue) just to save a point.
 */
export async function setGameScore(input: {
  actorId: string;
  role: CampusRole;
  gameId: string;
  teamScore?: number | null;
  opponentScore?: number | null;
  status?: GameStatusKey;
}): Promise<ServiceResult<{ game: SportsGameView }>> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can update the score." };
  }

  const current = await getGame(input.gameId);
  if (!current) {
    return { error: "That game is no longer on the schedule." };
  }

  const teamScore =
    input.teamScore === undefined
      ? current.teamScore
      : clampScore(input.teamScore);
  const opponentScore =
    input.opponentScore === undefined
      ? current.opponentScore
      : clampScore(input.opponentScore);
  const status = input.status ?? current.status;

  const saved = await withDatabase((prisma) =>
    prisma.sportsGame.update({
      where: { id: input.gameId },
      data: {
        teamScore,
        opponentScore,
        status,
        result: resolveGameResult(status, teamScore, opponentScore),
      },
      include: gameInclude,
    }),
  );

  if (!saved) {
    return { error: "Unable to save the score." };
  }
  return { ok: true, game: toGameView(saved as GameRow) };
}

export async function upsertGame(input: {
  actorId: string;
  role: CampusRole;
  gameId?: string | null;
  sportId: string;
  opponentTeamId?: string | null;
  opponentId?: string | null;
  opponentLabel?: string | null;
  kickoffAt: Date;
  site: GameSiteKey;
  venue?: string | null;
  level?: string | null;
  status?: GameStatusKey;
  teamScore?: number | null;
  opponentScore?: number | null;
  headline?: string | null;
  summary?: string | null;
  broadcastNote?: string | null;
  streamUrl?: string | null;
  isFeatured?: boolean;
}): Promise<ServiceResult<{ gameId: string }>> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage the schedule." };
  }

  // Selecting a team from the directory implies the school — keep both in sync.
  let opponentId = input.opponentId ?? null;
  if (input.opponentTeamId) {
    const team = await withDatabase((prisma) =>
      prisma.opponentSportTeam.findUnique({
        where: { id: input.opponentTeamId! },
        select: { schoolId: true },
      }),
    );
    opponentId = team?.schoolId ?? opponentId;
  }

  const status = input.status ?? "SCHEDULED";
  const teamScore = input.teamScore ?? null;
  const opponentScore = input.opponentScore ?? null;
  const result = resolveGameResult(status, teamScore, opponentScore);

  const data = {
    sportId: input.sportId,
    opponentId,
    opponentTeamId: input.opponentTeamId ?? null,
    opponentLabel: input.opponentLabel?.trim() || null,
    kickoffAt: input.kickoffAt,
    site: input.site,
    venue: input.venue?.trim() || null,
    level: input.level?.trim() || null,
    status,
    teamScore,
    opponentScore,
    result,
    headline: input.headline?.trim() || null,
    summary: input.summary?.trim() || null,
    broadcastNote: input.broadcastNote?.trim() || null,
    streamUrl: input.streamUrl?.trim() || null,
    isFeatured: input.isFeatured ?? false,
  };

  const saved = input.gameId
    ? await withDatabase((prisma) =>
        prisma.sportsGame.update({
          where: { id: input.gameId! },
          data,
          select: { id: true },
        }),
      )
    : await withDatabase((prisma) =>
        prisma.sportsGame.create({
          data: { ...data, createdById: input.actorId },
          select: { id: true },
        }),
      );

  if (!saved) {
    return { error: "Unable to save the game." };
  }
  return { ok: true, gameId: saved.id };
}

export async function removeGame(input: {
  actorId: string;
  role: CampusRole;
  gameId: string;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage the schedule." };
  }
  await withDatabase((prisma) =>
    prisma.sportsGame.deleteMany({ where: { id: input.gameId } }),
  );
  return { ok: true };
}

/* -------------------------------------------------------------- highlights */

export async function listHighlights(options?: {
  sportId?: string;
  gameId?: string;
  publishedOnly?: boolean;
  take?: number;
}): Promise<SportsHighlightView[]> {
  if (!ready()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.sportsHighlight.findMany({
      where: {
        ...(options?.sportId ? { sportId: options.sportId } : {}),
        ...(options?.gameId ? { gameId: options.gameId } : {}),
        ...(options?.publishedOnly ? { status: "PUBLISHED" } : {}),
      },
      orderBy: [
        { isFeatured: "desc" },
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: options?.take ?? 60,
      include: {
        sport: { select: { name: true, slug: true } },
        game: {
          select: {
            kickoffAt: true,
            opponentLabel: true,
            opponent: { select: { name: true } },
            opponentTeam: { select: { teamName: true } },
            sport: { select: { name: true } },
          },
        },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    sportId: row.sportId,
    sportName: row.sport.name,
    sportSlug: row.sport.slug,
    gameId: row.gameId,
    gameLabel: row.game ? gameLabel(row.game) : null,
    title: row.title,
    description: row.description,
    kind: row.kind as HighlightKindKey,
    status: row.status as HighlightStatusKey,
    videoUrl: row.videoUrl,
    imageUrl: row.imageUrl,
    credit: row.credit,
    isFeatured: row.isFeatured,
    publishedAt: row.publishedAt,
    submittedByName: row.submittedByName,
    createdAt: row.createdAt,
  }));
}

export async function createHighlight(input: {
  actorId: string;
  actorName: string;
  role: CampusRole;
  sportId: string;
  gameId?: string | null;
  title: string;
  description?: string | null;
  kind: HighlightKindKey;
  videoUrl?: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
  credit?: string | null;
  isFeatured?: boolean;
}): Promise<ServiceResult> {
  if (!ready()) {
    return { error: "Database unavailable." };
  }

  const canManage = await canManageSportsDesk(input.actorId, input.role);
  const created = await withDatabase((prisma) =>
    prisma.sportsHighlight.create({
      data: {
        sportId: input.sportId,
        gameId: input.gameId || null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        kind: input.kind,
        // Crew posts publish immediately; student submissions wait for review.
        status: canManage ? "PUBLISHED" : "PENDING",
        publishedAt: canManage ? new Date() : null,
        videoUrl: input.videoUrl?.trim() || null,
        imageUrl: input.imageUrl?.trim() || null,
        imagePath: input.imagePath || null,
        credit: input.credit?.trim() || null,
        isFeatured: canManage ? (input.isFeatured ?? false) : false,
        submittedById: input.actorId,
        submittedByName: input.actorName,
      },
      select: { id: true },
    }),
  );

  if (!created) {
    return { error: "Unable to save the highlight." };
  }

  if (!canManage) {
    await notifySportsCrew({
      fromUserId: input.actorId,
      title: `Highlight submitted: ${input.title.trim()}`,
      body: `${input.actorName} submitted a sports highlight for review.`,
      href: "/organizations/broadcasting?tab=sports-desk",
    });
  }

  return { ok: true };
}

export async function updateHighlightStatus(input: {
  actorId: string;
  role: CampusRole;
  highlightId: string;
  status: HighlightStatusKey;
  isFeatured?: boolean;
  reviewNote?: string | null;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can review highlights." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.sportsHighlight.update({
      where: { id: input.highlightId },
      data: {
        status: input.status,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        ...(input.isFeatured === undefined ? {} : { isFeatured: input.isFeatured }),
        reviewedById: input.actorId,
        reviewNote: input.reviewNote?.trim() || null,
      },
      select: { id: true, submittedById: true, title: true },
    }),
  );

  if (!updated) {
    return { error: "Highlight not found." };
  }

  if (updated.submittedById && updated.submittedById !== input.actorId) {
    await notifyUsers({
      fromUserId: input.actorId,
      toUserIds: [updated.submittedById],
      title: `Highlight ${input.status.toLowerCase()}: ${updated.title}`,
      body: `Your sports highlight is now ${input.status.toLowerCase()}.`,
      href: "/sports",
    });
  }

  return { ok: true };
}

export async function removeHighlight(input: {
  actorId: string;
  role: CampusRole;
  highlightId: string;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can remove highlights." };
  }
  await withDatabase((prisma) =>
    prisma.sportsHighlight.deleteMany({ where: { id: input.highlightId } }),
  );
  return { ok: true };
}

/* --------------------------------------------- student recaps and previews */

export async function listGameReports(options?: {
  gameId?: string;
  sportId?: string;
  publishedOnly?: boolean;
  take?: number;
}): Promise<SportsReportView[]> {
  if (!ready()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.sportsGameReport.findMany({
      where: {
        ...(options?.gameId ? { gameId: options.gameId } : {}),
        ...(options?.sportId ? { game: { sportId: options.sportId } } : {}),
        ...(options?.publishedOnly ? { status: "PUBLISHED" } : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: options?.take ?? 60,
      include: {
        game: {
          select: {
            kickoffAt: true,
            opponentLabel: true,
            opponent: { select: { name: true } },
            opponentTeam: { select: { teamName: true } },
            sport: { select: { name: true } },
          },
        },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    gameId: row.gameId,
    kind: row.kind as ReportKindKey,
    authorId: row.authorId,
    authorName: row.authorName,
    headline: row.headline,
    body: row.body,
    playerOfGame: row.playerOfGame,
    keyMoment: row.keyMoment,
    whatToWatch: row.whatToWatch,
    status: row.status as ReportStatusKey,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt,
    gameLabel: row.game ? gameLabel(row.game) : null,
  }));
}

export async function submitGameReport(input: {
  actorId: string;
  actorName: string;
  role: CampusRole;
  gameId: string;
  kind: ReportKindKey;
  headline: string;
  body: string;
  playerOfGame?: string | null;
  keyMoment?: string | null;
  whatToWatch?: string | null;
}): Promise<ServiceResult> {
  if (!ready()) {
    return { error: "Database unavailable." };
  }

  const created = await withDatabase((prisma) =>
    prisma.sportsGameReport.create({
      data: {
        gameId: input.gameId,
        kind: input.kind,
        authorId: input.actorId,
        authorName: input.actorName,
        headline: input.headline.trim(),
        body: input.body.trim(),
        playerOfGame: input.playerOfGame?.trim() || null,
        keyMoment: input.keyMoment?.trim() || null,
        whatToWatch: input.whatToWatch?.trim() || null,
        status: "PENDING",
      },
      select: { id: true },
    }),
  );

  if (!created) {
    return { error: "Unable to submit. Pick a game and try again." };
  }

  await notifySportsCrew({
    fromUserId: input.actorId,
    title: `${input.kind === "RECAP" ? "Game recap" : "Game preview"}: ${input.headline.trim()}`,
    body: `${input.actorName} submitted a sports write-up for review.`,
    href: "/organizations/broadcasting?tab=sports-desk",
  });

  return { ok: true };
}

export async function updateReportStatus(input: {
  actorId: string;
  role: CampusRole;
  reportId: string;
  status: ReportStatusKey;
  reviewNote?: string | null;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can review submissions." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.sportsGameReport.update({
      where: { id: input.reportId },
      data: {
        status: input.status,
        reviewNote: input.reviewNote?.trim() || null,
        reviewedById: input.actorId,
        reviewedAt: new Date(),
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
      select: { id: true, authorId: true, headline: true },
    }),
  );

  if (!updated) {
    return { error: "Submission not found." };
  }

  if (updated.authorId !== input.actorId) {
    await notifyUsers({
      fromUserId: input.actorId,
      toUserIds: [updated.authorId],
      title: `Write-up ${input.status.toLowerCase()}: ${updated.headline}`,
      body: `Your sports write-up is now ${input.status.toLowerCase()}.`,
      href: "/sports",
    });
  }

  return { ok: true };
}

/* ------------------------------------------------- roster and player stats */

export async function listPlayers(options?: {
  sportId?: string;
  includeInactive?: boolean;
}): Promise<SportsPlayerView[]> {
  if (!ready()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.sportsPlayer.findMany({
      where: {
        ...(options?.sportId ? { sportId: options.sportId } : {}),
        ...(options?.includeInactive ? {} : { isActive: true }),
      },
      orderBy: [{ sortOrder: "asc" }, { lastName: "asc" }],
      take: 200,
      include: { sport: { select: { slug: true } } },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    sportId: row.sportId,
    sportSlug: row.sport.slug,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`.trim(),
    jerseyNumber: row.jerseyNumber,
    position: row.position,
    gradeYear: row.gradeYear,
    photoUrl: row.photoUrl,
    bio: row.bio,
    isActive: row.isActive,
  }));
}

export async function upsertPlayer(input: {
  actorId: string;
  role: CampusRole;
  playerId?: string | null;
  sportId: string;
  firstName: string;
  lastName: string;
  jerseyNumber?: string | null;
  position?: string | null;
  gradeYear?: string | null;
  photoUrl?: string | null;
  photoPath?: string | null;
  bio?: string | null;
  isActive?: boolean;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage rosters." };
  }

  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || !lastName) {
    return { error: "Player first and last name are required." };
  }

  const photo =
    input.photoUrl === undefined
      ? {}
      : { photoUrl: input.photoUrl, photoPath: input.photoPath ?? null };

  const data = {
    sportId: input.sportId,
    firstName,
    lastName,
    jerseyNumber: input.jerseyNumber?.trim() || null,
    position: input.position?.trim() || null,
    gradeYear: input.gradeYear?.trim() || null,
    bio: input.bio?.trim() || null,
    isActive: input.isActive ?? true,
    ...photo,
  };

  const saved = input.playerId
    ? await withDatabase((prisma) =>
        prisma.sportsPlayer.update({
          where: { id: input.playerId! },
          data,
          select: { id: true },
        }),
      )
    : await withDatabase((prisma) =>
        prisma.sportsPlayer.create({ data, select: { id: true } }),
      );

  return saved ? { ok: true } : { error: "Unable to save the player." };
}

export async function removePlayer(input: {
  actorId: string;
  role: CampusRole;
  playerId: string;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can manage rosters." };
  }
  const updated = await withDatabase((prisma) =>
    prisma.sportsPlayer.update({
      where: { id: input.playerId },
      data: { isActive: false },
      select: { id: true },
    }),
  );
  return updated ? { ok: true } : { error: "Player not found." };
}

export async function listPlayerStats(options: {
  gameId?: string;
  playerId?: string;
}): Promise<SportsPlayerStatView[]> {
  if (!ready()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.sportsPlayerStat.findMany({
      where: {
        ...(options.gameId ? { gameId: options.gameId } : {}),
        ...(options.playerId ? { playerId: options.playerId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        player: {
          select: { firstName: true, lastName: true, jerseyNumber: true },
        },
        game: {
          select: {
            kickoffAt: true,
            opponentLabel: true,
            opponent: { select: { name: true } },
            opponentTeam: { select: { teamName: true } },
            sport: { select: { name: true } },
          },
        },
      },
    }),
  );

  return (rows ?? []).map((row) => ({
    id: row.id,
    playerId: row.playerId,
    playerName: `${row.player.firstName} ${row.player.lastName}`.trim(),
    jerseyNumber: row.player.jerseyNumber,
    gameId: row.gameId,
    gameLabel: row.game ? gameLabel(row.game) : null,
    stats: toStatRecord(row.stats),
    summary: row.summary,
    notes: row.notes,
  }));
}

export async function savePlayerStat(input: {
  actorId: string;
  role: CampusRole;
  playerId: string;
  gameId: string;
  sportSlug: string;
  stats: Record<string, string>;
  notes?: string | null;
}): Promise<ServiceResult> {
  if (!(await canManageSportsDesk(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can record stats." };
  }

  const cleaned = Object.entries(input.stats).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      const trimmed = String(value ?? "").trim();
      if (trimmed) {
        acc[key] = trimmed;
      }
      return acc;
    },
    {},
  );

  const summary = summarizeStats(input.sportSlug, cleaned);

  const saved = await withDatabase((prisma) =>
    prisma.sportsPlayerStat.upsert({
      where: {
        playerId_gameId: { playerId: input.playerId, gameId: input.gameId },
      },
      create: {
        playerId: input.playerId,
        gameId: input.gameId,
        stats: cleaned,
        summary: summary || null,
        notes: input.notes?.trim() || null,
        recordedById: input.actorId,
      },
      update: {
        stats: cleaned,
        summary: summary || null,
        notes: input.notes?.trim() || null,
        recordedById: input.actorId,
      },
      select: { id: true },
    }),
  );

  return saved ? { ok: true } : { error: "Unable to save stats." };
}

/* --------------------------------------------------------- page composition */

export type SportsHubData = {
  sports: SportView[];
  activeSport: SportView | null;
  lastGame: SportsGameView | null;
  upcoming: SportsGameView[];
  highlights: SportsHighlightView[];
  recentGames: SportsGameView[];
  publishedReports: SportsReportView[];
  players: SportsPlayerView[];
  reportableGames: SportsGameView[];
};

/** One round-trip bundle for the Sports hub and the Broadcasting Sports tab. */
export async function getSportsHubData(
  sportSlug?: string | null,
): Promise<SportsHubData> {
  const sports = await listSports();
  const activeSport = sportSlug
    ? (sports.find((sport) => sport.slug === sportSlug) ?? null)
    : null;
  const sportId = activeSport?.id;

  const [banner, highlights, recentGames, upcomingAll, publishedReports, players] =
    await Promise.all([
      getSportsBanner(sportId),
      listHighlights({ sportId, publishedOnly: true, take: 24 }),
      listGames({ sportId, pastOnly: true, take: 12 }),
      listGames({ sportId, upcomingOnly: true, take: 12 }),
      listGameReports({ sportId, publishedOnly: true, take: 12 }),
      sportId ? listPlayers({ sportId }) : Promise.resolve([]),
    ]);

  return {
    sports,
    activeSport,
    lastGame: banner.lastGame,
    upcoming: banner.upcoming,
    highlights,
    recentGames,
    publishedReports,
    players,
    // Students write about anything recently played or coming up.
    reportableGames: [...recentGames, ...upcomingAll],
  };
}

export type SportsDeskData = {
  sports: SportView[];
  schools: OpponentSchoolView[];
  teams: OpponentTeamView[];
  games: SportsGameView[];
  highlights: SportsHighlightView[];
  reports: SportsReportView[];
  players: SportsPlayerView[];
};

/** Crew production bundle for the Sports desk tab. */
export async function getSportsDeskData(
  sportSlug?: string | null,
): Promise<SportsDeskData> {
  const sports = await listSports({ includeInactive: true });
  const activeSport = sportSlug
    ? (sports.find((sport) => sport.slug === sportSlug) ?? null)
    : null;
  const sportId = activeSport?.id;

  const [schools, games, highlights, reports, players] = await Promise.all([
    listOpponentSchools(),
    listGames({ sportId, take: 40 }),
    listHighlights({ sportId, take: 40 }),
    listGameReports({ sportId, take: 40 }),
    listPlayers({ sportId }),
  ]);

  return {
    sports,
    schools,
    teams: schools.flatMap((school) => school.teams),
    games,
    highlights,
    reports,
    players,
  };
}

/* ----------------------------------------------------- Command Center pings */

async function notifySportsCrew(input: {
  fromUserId: string;
  title: string;
  body: string;
  href: string;
}): Promise<void> {
  const org = await getBroadcastOrganization();
  if (!org) {
    return;
  }
  const memberIds = await listActiveClubMemberIds(org.id);
  const recipients = memberIds.filter((id) => id !== input.fromUserId);
  if (recipients.length === 0) {
    return;
  }
  await sendSystemStudentMessages({
    fromUserId: input.fromUserId,
    toUserIds: recipients,
    organizationId: org.id,
    kind: "SPORTS_COVERAGE",
    title: input.title,
    body: input.body,
    actions: buildDefaultAdvisorActions(input.href),
  });
}

async function notifyUsers(input: {
  fromUserId: string;
  toUserIds: string[];
  title: string;
  body: string;
  href: string;
}): Promise<void> {
  const org = await getBroadcastOrganization();
  await sendSystemStudentMessages({
    fromUserId: input.fromUserId,
    toUserIds: input.toUserIds,
    organizationId: org?.id ?? null,
    kind: "SPORTS_COVERAGE",
    title: input.title,
    body: input.body,
    actions: buildDefaultAdvisorActions(input.href),
  });
}
