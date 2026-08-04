/**
 * Broadcast Control Studio — console scaffolding.
 *
 * What is left in this file is hardware furniture that has no database source
 * yet: Studio B scene names, source tiles, fader labels, graphics and sponsor
 * slots. Panels backed by real campus rows read from
 * `broadcast-studio-service.ts` instead. Nothing here talks to hardware; scene,
 * source, and audio state arrive with the OBS bridge.
 * See docs/BROADCAST_STUDIO.md.
 */

export const STUDIO_ROUTE = "/broadcast/studio";

export const STUDIO_PHASE = {
  current: 3,
  label: "Phase 3 · Read-only console",
  note: "Program, run of show, crew, countdown, and scoreboard read live campus data. Scene switching, graphics, audio, and scoreboard control arrive with the OBS bridge.",
} as const;

/** How often the console re-reads on-air state from the server. */
export const STUDIO_POLL_INTERVAL_MS = 5_000;

/**
 * Minutes on either side of the scheduled air time where the console reports
 * PREVIEW instead of OFFLINE. This is the only honest "armed" signal available
 * without an OBS bridge — it comes from BroadcastSchedule, not from hardware.
 */
export const STUDIO_PREVIEW_WINDOW_MINUTES = 15;

export type StudioSceneDef = {
  id: string;
  label: string;
  /** Shot description shown under the scene name. */
  shot: string;
};

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

export type StudioGraphicDef = {
  id: string;
  label: string;
  detail: string;
};

export const STUDIO_GRAPHICS: StudioGraphicDef[] = [
  { id: "lower-third", label: "Lower third", detail: "Name + title" },
  { id: "headline", label: "Headline bar", detail: "Top story strap" },
  { id: "ticker", label: "Ticker", detail: "Scrolling announcements" },
  { id: "bug", label: "Channel bug", detail: "MHS mark, corner" },
  { id: "fullscreen", label: "Full screen", detail: "Stat / quote card" },
];

export type StudioSponsorDef = {
  id: string;
  label: string;
  detail: string;
};

export const STUDIO_SPONSORS: StudioSponsorDef[] = [
  { id: "slot-1", label: "Sponsor slot 1", detail: "Pre-show bumper" },
  { id: "slot-2", label: "Sponsor slot 2", detail: "Mid-show billboard" },
  { id: "slot-3", label: "Sponsor slot 3", detail: "Sports segment" },
  { id: "slot-4", label: "Sponsor slot 4", detail: "Close / credits" },
];

export type StudioHealthCheckDef = {
  id: string;
  label: string;
  detail: string;
  /**
   * What the console can honestly report today. `NONE` means there is no data
   * source yet, so the row stays "Not linked" rather than claiming a status.
   */
  binding: "STREAM_TARGET" | "CAMPUS_RECORD" | "NONE";
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
    id: "obs",
    label: "OBS bridge",
    detail: "WebSocket link to Studio B PC",
    binding: "NONE",
  },
  {
    id: "encoder",
    label: "Encoder",
    detail: "Bitrate / dropped frames",
    binding: "NONE",
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
