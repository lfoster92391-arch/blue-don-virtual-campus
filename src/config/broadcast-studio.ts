/**
 * Broadcast Control Studio — console scaffolding.
 *
 * What is left in this file is hardware furniture that has no database source
 * yet — Studio B scene names, source tiles, fader labels — plus the shapes the
 * graphics engine works in: which graphic kinds exist, which screen region each
 * one owns, and which fields an operator types. Panels backed by real campus
 * rows read from `broadcast-studio-service.ts` instead. Nothing here talks to
 * hardware; scene, source, and audio state arrive with the OBS bridge.
 * See docs/BROADCAST_STUDIO.md.
 */

import type { StudioGraphicKind } from "@/generated/prisma/client";

export const STUDIO_ROUTE = "/broadcast/studio";

export const STUDIO_PHASE = {
  current: 6,
  label: "Phase 6 · Graphics",
  note: "Scene switching and transport run through the Studio Bridge; graphics are taken to an OBS Browser Source overlay. Audio, sources, and any scoreboard hardware feed arrive later.",
} as const;

/** How often the console re-reads on-air state from the server. */
export const STUDIO_POLL_INTERVAL_MS = 5_000;

/**
 * Minutes on either side of the scheduled air time where the console reports
 * PREVIEW instead of OFFLINE. This is the only honest "armed" signal available
 * without an OBS bridge — it comes from BroadcastSchedule, not from hardware.
 */
export const STUDIO_PREVIEW_WINDOW_MINUTES = 15;

/* ----------------------------------------------------------- studio bridge */

/**
 * The OBS machine the console talks to when no other device key is given. One
 * bridge row per physical machine; Studio B is the only one today.
 */
export const STUDIO_BRIDGE_DEFAULT_KEY = "studio-b";

/** How often the agent on the OBS machine polls for queued commands. */
export const STUDIO_BRIDGE_POLL_INTERVAL_MS = 3_000;

/**
 * How stale `lastSeenAt` may get before the console calls the bridge
 * DISCONNECTED. Generous next to the agent's 3 s poll so one slow request does
 * not blink the lamp, tight enough that a dead agent is caught within a break.
 */
export const STUDIO_BRIDGE_ONLINE_WINDOW_MS = 20_000;

/**
 * A queued command the agent never claimed is dropped rather than run late — a
 * scene taken a minute after the operator pressed it is worse than not taken.
 */
export const STUDIO_COMMAND_TTL_MS = 45_000;

/** Most commands handed to one poll. Enough for a take, never a backlog flood. */
export const STUDIO_COMMAND_BATCH_SIZE = 5;

/** How many finished commands the console shows so failures are visible. */
export const STUDIO_COMMAND_HISTORY_SIZE = 6;

export const STUDIO_COMMAND_LABELS = {
  SET_PROGRAM_SCENE: "Take scene",
  SET_PREVIEW_SCENE: "Preview scene",
  TRIGGER_TRANSITION: "Transition",
  OBS_START_STREAM: "Start OBS stream",
  OBS_STOP_STREAM: "Stop OBS stream",
  OBS_START_RECORD: "Start recording",
  OBS_STOP_RECORD: "Stop recording",
} as const;

/* ----------------------------------------------------------- game control */

/**
 * Scoring buttons per sport, so football gets a touchdown key and basketball
 * gets a three. Keyed by `Sport.slug`; anything unlisted falls back to +1.
 */
export const STUDIO_SCORE_KEYS_BY_SPORT: Record<string, number[]> = {
  football: [1, 2, 3, 6],
  "boys-basketball": [1, 2, 3],
  "girls-basketball": [1, 2, 3],
  wrestling: [1, 2, 3],
};

export const STUDIO_SCORE_KEYS_DEFAULT = [1];

export function studioScoreKeys(sportSlug: string | null): number[] {
  return (
    (sportSlug ? STUDIO_SCORE_KEYS_BY_SPORT[sportSlug] : undefined) ??
    STUDIO_SCORE_KEYS_DEFAULT
  );
}

/**
 * Statuses the console can set. The Sports Desk owns the rest of
 * `SportsGame.status` (postponed, canceled) because those are schedule
 * decisions, not things an operator flips mid-broadcast.
 */
export const STUDIO_GAME_STATUSES = ["SCHEDULED", "LIVE", "FINAL"] as const;

/**
 * Period / clock is deliberately session-local: nothing in the schema stores a
 * game clock, and inventing columns for a value only the operator sees would be
 * worse than losing it on refresh. These are the presets the console offers.
 */
export const STUDIO_PERIOD_LABELS = ["1", "2", "3", "4", "OT"] as const;

export const STUDIO_CLOCK_PRESET_SECONDS = [720, 600, 480, 360] as const;

export type StudioSceneDef = {
  id: string;
  label: string;
  /** Shot description shown under the scene name. */
  shot: string;
};

/**
 * Fallback scene names, shown greyed out when the bridge is offline so the
 * panel still reads as Studio B rather than going blank. When the bridge is up
 * the panel lists the scenes OBS actually reported and ignores this list.
 */
export const STUDIO_SCENES: StudioSceneDef[] = [
  { id: "open", label: "Open", shot: "Title card + music bed" },
  { id: "anchor-2shot", label: "Anchor 2-Shot", shot: "Desk cam wide" },
  { id: "anchor-single", label: "Anchor Single", shot: "Desk cam center" },
  { id: "package", label: "Package", shot: "Full-screen VT playback" },
  { id: "sports", label: "Sports", shot: "Scoreboard + highlight box" },
  { id: "weather", label: "Weather", shot: "Chroma wall + map" },
  { id: "interview", label: "Interview", shot: "Two-box guest split" },
  { id: "close", label: "Close", shot: "Credits + sponsor bumper" },
];

export type StudioSourceDef = {
  id: string;
  label: string;
  kind: "CAMERA" | "CAPTURE" | "MEDIA" | "REMOTE";
  detail: string;
};

export const STUDIO_SOURCES: StudioSourceDef[] = [
  { id: "cam-1", label: "CAM 1", kind: "CAMERA", detail: "Studio B desk" },
  { id: "cam-2", label: "CAM 2", kind: "CAMERA", detail: "Wide / crane" },
  { id: "cam-3", label: "CAM 3", kind: "CAMERA", detail: "Handheld roam" },
  { id: "pc-1", label: "PC 1", kind: "CAPTURE", detail: "Slides / display" },
  { id: "vt-1", label: "VT 1", kind: "MEDIA", detail: "Package playback" },
  { id: "remote", label: "REMOTE", kind: "REMOTE", detail: "Field reporter" },
];

export type StudioAudioChannelDef = {
  id: string;
  label: string;
  detail: string;
  /** Nominal fader position, 0–100, for the static meter. */
  level: number;
  muted?: boolean;
};

export const STUDIO_AUDIO_CHANNELS: StudioAudioChannelDef[] = [
  { id: "host-a", label: "HOST A", detail: "Lav · desk left", level: 72 },
  { id: "host-b", label: "HOST B", detail: "Lav · desk right", level: 70 },
  { id: "guest", label: "GUEST", detail: "Handheld", level: 55, muted: true },
  { id: "music", label: "MUSIC BED", detail: "Show open / close", level: 34 },
  { id: "vt", label: "VT AUDIO", detail: "Package playback", level: 62 },
];

/* --------------------------------------------------------------- graphics */

/** Where the OBS Browser Source lives. The session key follows this prefix. */
export const STUDIO_OVERLAY_ROUTE_PREFIX = "/broadcast/overlay";

/** Stable channel key for the one overlay surface Studio B runs today. */
export const STUDIO_OVERLAY_DEFAULT_KEY = "studio-b";

/**
 * How often the overlay re-reads what is on air. Faster than the console's own
 * 5 s poll because this one is the thing the audience sees: a take should land
 * inside a second, not inside a breath.
 */
export const STUDIO_OVERLAY_POLL_INTERVAL_MS = 1_000;

/**
 * The overlay reads every second but only stamps `lastSeenAt` this often — the
 * console needs to know a Browser Source is attached, not to log every poll.
 */
export const STUDIO_OVERLAY_HEARTBEAT_INTERVAL_MS = 8_000;

/**
 * How stale that stamp may get before the console says no Browser Source is
 * attached. Comfortably wider than the heartbeat so one slow request does not
 * blink the lamp.
 */
export const STUDIO_OVERLAY_ONLINE_WINDOW_MS = 25_000;

/** Bytes of randomness behind the session key in the overlay URL. */
export const STUDIO_OVERLAY_KEY_BYTES = 24;

/** Caps on operator-typed graphic copy, enforced again server-side. */
export const STUDIO_GRAPHIC_TEXT_MAX = 120;
export const STUDIO_LINEUP_MAX_ENTRIES = 12;

/**
 * The three areas of the frame a graphic can own. One live graphic per region,
 * so taking a player ID replaces the lower third instead of stacking on top of
 * it, and a full-screen card never lands under a name strap.
 */
export type StudioGraphicRegion = "LOWER" | "BUG" | "FULL";

export const STUDIO_GRAPHIC_REGION_LABELS: Record<StudioGraphicRegion, string> =
  {
    LOWER: "Lower third",
    BUG: "Corner bug",
    FULL: "Full screen",
  };

/** A text input the panel offers for a kind. */
export type StudioGraphicFieldKey = "title" | "subtitle" | "detail" | "note";

export type StudioGraphicFieldDef = {
  key: StudioGraphicFieldKey;
  label: string;
  placeholder: string;
};

export type StudioGraphicDef = {
  kind: StudioGraphicKind;
  label: string;
  detail: string;
  region: StudioGraphicRegion;
  fields: StudioGraphicFieldDef[];
  /**
   * What fills the parts the operator does not type. `GAME` and `PLAYER` cards
   * read the campus row live, so the panel can say where the numbers come from
   * instead of implying someone typed them.
   */
  source: "MANUAL" | "GAME" | "PLAYER" | "ROSTER";
};

/**
 * Every kind gets a definition — keying by the Prisma enum means adding a kind
 * to the schema without teaching the console what it looks like is a type
 * error, not a blank graphic on air.
 */
export const STUDIO_GRAPHIC_DEFS: Record<StudioGraphicKind, StudioGraphicDef> = {
  LOWER_THIRD: {
    kind: "LOWER_THIRD",
    label: "Lower third",
    detail: "Name, role, secondary line",
    region: "LOWER",
    source: "MANUAL",
    fields: [
      { key: "title", label: "Name", placeholder: "Jordan Ellis" },
      { key: "subtitle", label: "Title / role", placeholder: "Play-by-play" },
      {
        key: "detail",
        label: "Secondary line",
        placeholder: "Quarterback • #12",
      },
    ],
  },
  PLAYER_ID: {
    kind: "PLAYER_ID",
    label: "Player ID",
    detail: "Roster name, number, position",
    region: "LOWER",
    source: "PLAYER",
    fields: [
      { key: "title", label: "Name", placeholder: "Pick a player" },
      { key: "subtitle", label: "Number / position", placeholder: "#12 • QB" },
      { key: "detail", label: "Stat line", placeholder: "14 carries, 96 yds" },
    ],
  },
  SCORE_BUG: {
    kind: "SCORE_BUG",
    label: "Score bug",
    detail: "Live score from the game record",
    region: "BUG",
    source: "GAME",
    fields: [
      { key: "note", label: "Tag line", placeholder: "MHS Broadcasting" },
    ],
  },
  LINEUP: {
    kind: "LINEUP",
    label: "Starting lineup",
    detail: "Roster card for the selected sport",
    region: "FULL",
    source: "ROSTER",
    fields: [
      { key: "title", label: "Heading", placeholder: "Starting lineup" },
      { key: "subtitle", label: "Sub-heading", placeholder: "Blue Dons" },
    ],
  },
  GAME_ANNOUNCEMENT: {
    kind: "GAME_ANNOUNCEMENT",
    label: "Game announcement",
    detail: "Matchup, site, and kickoff",
    region: "FULL",
    source: "GAME",
    fields: [
      { key: "title", label: "Heading", placeholder: "Tonight on MHS" },
      { key: "note", label: "Note", placeholder: "Coverage starts at 6:45" },
    ],
  },
  FINAL_SCORE: {
    kind: "FINAL_SCORE",
    label: "Final score",
    detail: "Final from the game record",
    region: "FULL",
    source: "GAME",
    fields: [
      { key: "title", label: "Heading", placeholder: "Final" },
      { key: "note", label: "Note", placeholder: "Blue Dons take the district" },
    ],
  },
  ANNOUNCEMENT: {
    kind: "ANNOUNCEMENT",
    label: "Announcement",
    detail: "Breaking or school strap",
    region: "LOWER",
    source: "MANUAL",
    fields: [
      { key: "title", label: "Headline", placeholder: "Early release Friday" },
      {
        key: "subtitle",
        label: "Second line",
        placeholder: "Buses roll at 1:15",
      },
      { key: "note", label: "Tag", placeholder: "School announcement" },
    ],
  },
  SPONSOR: {
    kind: "SPONSOR",
    label: "Sponsor",
    detail: "Single billboard — no rotation yet",
    region: "LOWER",
    source: "MANUAL",
    fields: [
      { key: "title", label: "Sponsor", placeholder: "Hometown Hardware" },
      { key: "subtitle", label: "Line", placeholder: "Proud to back the Dons" },
      { key: "note", label: "Tag", placeholder: "Tonight's sponsor" },
    ],
  },
};

/** Picker order in the console — the run of a normal broadcast, roughly. */
export const STUDIO_GRAPHIC_ORDER: StudioGraphicKind[] = [
  "LOWER_THIRD",
  "PLAYER_ID",
  "SCORE_BUG",
  "LINEUP",
  "GAME_ANNOUNCEMENT",
  "FINAL_SCORE",
  "ANNOUNCEMENT",
  "SPONSOR",
];

export function studioGraphicDef(kind: StudioGraphicKind): StudioGraphicDef {
  return STUDIO_GRAPHIC_DEFS[kind];
}

export function studioGraphicRegion(
  kind: StudioGraphicKind,
): StudioGraphicRegion {
  return STUDIO_GRAPHIC_DEFS[kind].region;
}

export type StudioHealthCheckDef = {
  id: string;
  label: string;
  detail: string;
  /**
   * What the console can honestly report today. `NONE` means there is no data
   * source yet, so the row stays "Not linked" rather than claiming a status.
   * The bridge bindings only ever read posted telemetry — a row goes green
   * because the agent said so within the liveness window, never by default.
   */
  binding:
    | "STREAM_TARGET"
    | "CAMPUS_RECORD"
    | "BRIDGE_LINK"
    | "OBS_LINK"
    | "OBS_ENCODER"
    | "NONE";
};

export const STUDIO_HEALTH_CHECKS: StudioHealthCheckDef[] = [
  {
    id: "record",
    label: "Campus stream record",
    detail: "CampusMediaItem on-air row",
    binding: "CAMPUS_RECORD",
  },
  {
    id: "ingest",
    label: "RTMP ingest",
    detail: "Campus stream target",
    binding: "STREAM_TARGET",
  },
  {
    id: "bridge",
    label: "Studio bridge",
    detail: "Agent on the Studio B PC",
    binding: "BRIDGE_LINK",
  },
  {
    id: "obs",
    label: "OBS WebSocket",
    detail: "Agent's link into OBS",
    binding: "OBS_LINK",
  },
  {
    id: "encoder",
    label: "Encoder",
    detail: "Bitrate / dropped frames",
    binding: "OBS_ENCODER",
  },
  {
    id: "scoreboard",
    label: "Scoreboard feed",
    detail: "Daktronics link",
    binding: "NONE",
  },
  {
    id: "storage",
    label: "Recording disk",
    detail: "Local capture space",
    binding: "NONE",
  },
];
