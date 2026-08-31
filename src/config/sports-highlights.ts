/**
 * Sports Highlights — Broadcasting's sports desk.
 *
 * Sport list is data-driven (the `sports` table); the defaults below are only
 * used to seed a first-run catalog so the switcher is never empty.
 * No XP / gamification on these surfaces.
 */

import { IMAGE_UPLOAD_MAX_BYTES } from "@/config/uploads";

export const SPORTS_STORAGE_PREFIX = "sports-schools";

/**
 * Madonna's own athletics identity, in one place.
 *
 * Opponent marks come from the Opponent directory (`OpponentSchool.logoUrl` /
 * `OpponentSportTeam.logoUrl`, uploaded to Supabase). Our side has no such row,
 * so the mark ships as a static public asset and every scoreboard, score bug,
 * and matchup card reads it from here rather than hardcoding the path.
 */
export const CAMPUS_TEAM_NAME = "Blue Dons";

/** Short form for the two-line score bug and console readouts. */
export const CAMPUS_TEAM_LABEL = "MHS";

export const CAMPUS_TEAM_LOGO_URL = "/images/sports/madonna-dons-logo.png";

export const SPORTS_LOGO_MAX_BYTES = IMAGE_UPLOAD_MAX_BYTES;

export const SPORTS_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
] as const;

export const SPORT_SEASON_LABELS = {
  FALL: "Fall",
  WINTER: "Winter",
  SPRING: "Spring",
  YEAR_ROUND: "Year-round",
} as const;

export type SportSeasonKey = keyof typeof SPORT_SEASON_LABELS;

export const GAME_SITE_LABELS = {
  HOME: "Home",
  AWAY: "Away",
  NEUTRAL: "Neutral site",
} as const;

export type GameSiteKey = keyof typeof GAME_SITE_LABELS;

export const GAME_STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  LIVE: "In progress",
  FINAL: "Final",
  POSTPONED: "Postponed",
  CANCELED: "Canceled",
} as const;

export type GameStatusKey = keyof typeof GAME_STATUS_LABELS;

export const GAME_RESULT_LABELS = {
  WIN: "Win",
  LOSS: "Loss",
  TIE: "Tie",
} as const;

export type GameResultKey = keyof typeof GAME_RESULT_LABELS;

export const HIGHLIGHT_KIND_LABELS = {
  CLIP: "Game clip",
  PHOTO: "Photo",
  STORY: "Story",
  REEL: "Highlight reel",
  INTERVIEW: "Interview",
} as const;

export type HighlightKindKey = keyof typeof HIGHLIGHT_KIND_LABELS;

export const HIGHLIGHT_STATUS_LABELS = {
  PENDING: "Pending review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
} as const;

export type HighlightStatusKey = keyof typeof HIGHLIGHT_STATUS_LABELS;

export const REPORT_KIND_LABELS = {
  RECAP: "Game recap",
  PREVIEW: "Game preview",
} as const;

export type ReportKindKey = keyof typeof REPORT_KIND_LABELS;

export const REPORT_STATUS_LABELS = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  PUBLISHED: "Published",
  DECLINED: "Declined",
} as const;

export type ReportStatusKey = keyof typeof REPORT_STATUS_LABELS;

/** Seeded on first run so the sport switcher always has something to show. */
export const DEFAULT_SPORTS = [
  { slug: "football", name: "Football", season: "FALL", emoji: "🏈", sortOrder: 10 },
  { slug: "volleyball", name: "Volleyball", season: "FALL", emoji: "🏐", sortOrder: 20 },
  { slug: "cross-country", name: "Cross Country", season: "FALL", emoji: "🏃", sortOrder: 30 },
  { slug: "soccer", name: "Soccer", season: "FALL", emoji: "⚽", sortOrder: 40 },
  { slug: "boys-basketball", name: "Boys Basketball", season: "WINTER", emoji: "🏀", sortOrder: 50 },
  { slug: "girls-basketball", name: "Girls Basketball", season: "WINTER", emoji: "🏀", sortOrder: 60 },
  { slug: "wrestling", name: "Wrestling", season: "WINTER", emoji: "🤼", sortOrder: 70 },
  { slug: "cheer", name: "Cheer", season: "WINTER", emoji: "📣", sortOrder: 80 },
  { slug: "baseball", name: "Baseball", season: "SPRING", emoji: "⚾", sortOrder: 90 },
  { slug: "softball", name: "Softball", season: "SPRING", emoji: "🥎", sortOrder: 100 },
  { slug: "track-field", name: "Track & Field", season: "SPRING", emoji: "🏅", sortOrder: 110 },
  { slug: "golf", name: "Golf", season: "FALL", emoji: "⛳", sortOrder: 120 },
] as const;

export type StatFieldDef = {
  key: string;
  label: string;
  short: string;
};

const BASKETBALL_STATS: StatFieldDef[] = [
  { key: "points", label: "Points", short: "PTS" },
  { key: "rebounds", label: "Rebounds", short: "REB" },
  { key: "assists", label: "Assists", short: "AST" },
  { key: "steals", label: "Steals", short: "STL" },
  { key: "blocks", label: "Blocks", short: "BLK" },
  { key: "threes", label: "3-pointers", short: "3PT" },
];

const DIAMOND_STATS: StatFieldDef[] = [
  { key: "atBats", label: "At bats", short: "AB" },
  { key: "hits", label: "Hits", short: "H" },
  { key: "runs", label: "Runs", short: "R" },
  { key: "rbi", label: "RBI", short: "RBI" },
  { key: "homeRuns", label: "Home runs", short: "HR" },
  { key: "strikeouts", label: "Strikeouts (pitching)", short: "K" },
];

const GENERIC_STATS: StatFieldDef[] = [
  { key: "points", label: "Points / score", short: "PTS" },
  { key: "personalBest", label: "Personal best", short: "PB" },
  { key: "place", label: "Place / finish", short: "PL" },
];

/** Per-sport stat sheet used by the player stats form and tables. */
export const SPORT_STAT_FIELDS: Record<string, StatFieldDef[]> = {
  football: [
    { key: "passingYards", label: "Passing yards", short: "PASS" },
    { key: "rushingYards", label: "Rushing yards", short: "RUSH" },
    { key: "receivingYards", label: "Receiving yards", short: "REC" },
    { key: "touchdowns", label: "Touchdowns", short: "TD" },
    { key: "tackles", label: "Tackles", short: "TKL" },
    { key: "interceptions", label: "Interceptions", short: "INT" },
  ],
  volleyball: [
    { key: "kills", label: "Kills", short: "K" },
    { key: "assists", label: "Assists", short: "AST" },
    { key: "digs", label: "Digs", short: "DIG" },
    { key: "blocks", label: "Blocks", short: "BLK" },
    { key: "aces", label: "Aces", short: "ACE" },
  ],
  "boys-basketball": BASKETBALL_STATS,
  "girls-basketball": BASKETBALL_STATS,
  basketball: BASKETBALL_STATS,
  soccer: [
    { key: "goals", label: "Goals", short: "G" },
    { key: "assists", label: "Assists", short: "A" },
    { key: "shots", label: "Shots", short: "SH" },
    { key: "saves", label: "Saves", short: "SV" },
  ],
  baseball: DIAMOND_STATS,
  softball: DIAMOND_STATS,
  wrestling: [
    { key: "wins", label: "Wins", short: "W" },
    { key: "losses", label: "Losses", short: "L" },
    { key: "pins", label: "Pins", short: "PIN" },
    { key: "teamPoints", label: "Team points", short: "TP" },
  ],
  "cross-country": [
    { key: "time", label: "Time", short: "TIME" },
    { key: "place", label: "Place", short: "PL" },
  ],
  "track-field": [
    { key: "event", label: "Event", short: "EVENT" },
    { key: "mark", label: "Mark / time", short: "MARK" },
    { key: "place", label: "Place", short: "PL" },
  ],
  golf: [
    { key: "score", label: "Score", short: "SCORE" },
    { key: "place", label: "Place", short: "PL" },
  ],
};

export function statFieldsForSport(slug: string | null | undefined): StatFieldDef[] {
  if (!slug) {
    return GENERIC_STATS;
  }
  return SPORT_STAT_FIELDS[slug] ?? GENERIC_STATS;
}

/** "14 PTS · 7 REB" summary line from a stored stat JSON blob. */
export function summarizeStats(
  sportSlug: string | null | undefined,
  stats: Record<string, unknown> | null | undefined,
): string {
  if (!stats) {
    return "";
  }
  return statFieldsForSport(sportSlug)
    .map((field) => {
      const raw = stats[field.key];
      if (raw === undefined || raw === null || String(raw).trim() === "") {
        return null;
      }
      return `${String(raw).trim()} ${field.short}`;
    })
    .filter(Boolean)
    .join(" · ");
}

export const STUDENT_REPORT_INSTRUCTIONS = [
  "Pick the game, then tell us what happened (recap) or what to watch for (preview).",
  "Choose the opponent from the school directory — logos and names come from Broadcasting.",
  "Add a player of the game and the key moment so hosts can read it on air.",
  "Crew reviews every submission before it publishes to the Sports page.",
] as const;

/** Madonna is in Weirton, WV — pin formatting so server and client agree. */
const GAME_TIME_ZONE = "America/New_York";

export function formatGameDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: GAME_TIME_ZONE,
  }).format(value);
}

export function formatGameDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: GAME_TIME_ZONE,
  }).format(value);
}

export function slugifySport(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
