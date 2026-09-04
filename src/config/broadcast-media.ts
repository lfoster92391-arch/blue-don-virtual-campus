/**
 * Campus media hub — Broadcasting org, academy, and Blue Don Live streaming.
 */

export const BROADCAST_ORG_SLUG = "broadcasting";
export const BROADCAST_ACADEMY_SLUG = "broadcast";

export const CAMPUS_MEDIA_BUCKET =
  process.env.SUPABASE_CAMPUS_MEDIA_BUCKET?.trim() || "campus-media";

export {
  CAMPUS_MEDIA_MAX_BYTES,
  CAMPUS_MEDIA_MAX_LABEL,
  CAMPUS_MEDIA_VIDEO_ACCEPT,
  CAMPUS_MEDIA_VIDEO_TYPES,
  resolveCampusVideoContentType,
  type CampusMediaVideoType,
} from "./campus-video";

const OBS_CHECKLIST = [
  "Open OBS → Settings → Stream",
  "Service: Custom",
  "Reveal the studio stream target below, then paste the RTMP server URL",
  "Paste your stream key",
  "Start Streaming in OBS",
  "Paste a YouTube Live / Vimeo embed URL for campus viewers (optional)",
  "Click Go Live on this page so the campus sees you on air",
];

const OBS_SCENE_TIPS = [
  {
    label: "Camera",
    tip: "Add a Video Capture Device source for the studio camera. Keep it as your default Program scene.",
  },
  {
    label: "Mic",
    tip: "Add an Audio Input Capture for the desk mic. Watch the meters — stay out of the red.",
  },
  {
    label: "Screen share",
    tip: "Add a Display or Window Capture source for slides. Switch scenes in OBS, then keep this page on Go Live.",
  },
];

/**
 * The five steps a student crew member actually performs. Nothing here names a
 * protocol, a port, or a bitrate — the technical setup is the advisor's job and
 * lives behind the Advanced disclosure.
 */
const STUDENT_GO_LIVE_STEPS = [
  {
    title: "Open the camera",
    detail:
      "From your phone, open the phone studio — it turns this device's camera on. In Studio B, open OBS (already set up) and Broadcast Studio for scenes and graphics.",
  },
  {
    title: "Pick today's show",
    detail: "Name what campus should see on the player.",
  },
  {
    title: "Check your preview",
    detail:
      "You should see yourself (or the desk) on this screen, and the mic should pick up your voice. On a phone, allow Camera and Microphone when Safari or Chrome asks.",
  },
  {
    title: "Go live",
    detail:
      "This starts the camera and puts you on air at Watch Broadcasting LIVE. Nothing goes out before you press it.",
  },
  {
    title: "End broadcast",
    detail:
      "When the show is over, end it here. The phone stops recording; in Studio B, OBS stops if the bridge is up. The show saves to Past Broadcasts.",
  },
];

/** One tap fills the show name for the broadcasts Madonna runs every week. */
const SHOW_PRESETS = [
  "Morning Announcements",
  "Blue Don News",
  "Pep Rally",
  "Game Night",
  "Mass",
];

/** Matches STUDIO_PREVIEW_WINDOW_MINUTES so every surface calls "Preview" alike. */
const AIR_PREVIEW_WINDOW_MINUTES = 15;

/**
 * True inside the quarter hour either side of the scheduled air time. Resolved
 * on the server so the status badge does not flip during hydration.
 */
export function isWithinAirPreviewWindow(
  nextAirAt: Date | null | undefined,
): boolean {
  if (!nextAirAt) {
    return false;
  }
  const minutesAway = (nextAirAt.getTime() - Date.now()) / 60_000;
  return Math.abs(minutesAway) <= AIR_PREVIEW_WINDOW_MINUTES;
}

/** Plain checks a student can confirm by looking at the desk and the screen. */
const PREVIEW_CHECKS = [
  "The camera shows the desk (or the field), not the ceiling.",
  "You can hear yourself / the mic is not muted.",
  "On a phone: Camera and Microphone are allowed for this site.",
];

/**
 * "How we go live at Madonna" — the house rules for the crew, in school
 * language. Not a feature list; this is what an advisor would say out loud.
 */
export const MADONNA_GO_LIVE_NOTES = [
  {
    label: "Who runs the show",
    text: "Two students at minimum — one on camera and mic in Studio B, one on this page. Your advisor is the backup, not the operator.",
  },
  {
    label: "When we air",
    text: "Morning Announcements go out at 8:05. Games, assemblies, and Mass air whenever the Next live countdown says so.",
  },
  {
    label: "Who is watching",
    text: "Anyone can watch at Watch Broadcasting LIVE — no login. Share the public watch link. Families also see the archive after the show ends.",
  },
  {
    label: "If something breaks",
    text: "End the broadcast, fix it, and go live again — the archive keeps whatever already aired. Ask your advisor before touching OBS settings.",
  },
];

/**
 * Display-safe streaming guidance. Contains no credentials, so it is the only
 * RTMP shape allowed to cross a server → client component boundary.
 */
export type BlueDonLiveRtmpPublicConfig = {
  /** True when the school configured a shared studio key in the environment. */
  hasSharedStreamKey: boolean;
  streamKeyHint: string;
  /** The student path. Everything below this line is Advanced-only copy. */
  goLiveSteps: { title: string; detail: string }[];
  showPresets: string[];
  previewChecks: string[];
  obsChecklist: string[];
  sceneTips: { label: string; tip: string }[];
};

/**
 * Server-only stream credentials. Never pass this object (or its fields) into
 * client component props — hand it out through a crew-gated server action.
 */
export type BlueDonLiveStreamSecrets = {
  ingestUrl: string;
  /** School-shared key from env, or null when advisors issue keys manually. */
  streamKey: string | null;
};

export function getBlueDonLiveStreamSecrets(): BlueDonLiveStreamSecrets {
  return {
    ingestUrl:
      process.env.BLUE_DON_LIVE_RTMP_URL?.trim() ||
      "rtmp://live.bluedon.madonna.edu/app",
    streamKey: process.env.BLUE_DON_LIVE_STREAM_KEY?.trim() || null,
  };
}

export function getBlueDonLiveRtmpPublicConfig(): BlueDonLiveRtmpPublicConfig {
  const hasSharedStreamKey = Boolean(
    process.env.BLUE_DON_LIVE_STREAM_KEY?.trim(),
  );

  return {
    hasSharedStreamKey,
    streamKeyHint: hasSharedStreamKey
      ? "School studio stream key — reveal it here when you are ready to configure OBS."
      : "Ask your Broadcast Academy advisor for your studio stream key, or reveal the per-session key after you Go Live.",
    goLiveSteps: STUDENT_GO_LIVE_STEPS,
    showPresets: SHOW_PRESETS,
    previewChecks: PREVIEW_CHECKS,
    obsChecklist: OBS_CHECKLIST,
    sceneTips: OBS_SCENE_TIPS,
  };
}

export const DEMO_SCHOOL_BROADCASTS = [
  {
    id: "demo-ls-1",
    title: "Morning Announcements",
    description: "Daily Blue Don News from Studio B.",
    type: "LIVE_STREAM" as const,
    status: "ENDED" as const,
    publicUrl: null,
    embedUrl: null,
    uploaderName: "Broadcasting Club",
    publishedAtLabel: "Yesterday 8:05 AM",
  },
  {
    id: "demo-vid-1",
    title: "Robotics Showcase Highlights",
    description: "Student-produced recap from the STEM fair.",
    type: "VIDEO_UPLOAD" as const,
    status: "PUBLISHED" as const,
    publicUrl: null,
    embedUrl: null,
    uploaderName: "Broadcasting Club",
    publishedAtLabel: "Mar 2025",
  },
];

export const DEMO_DAILY_ANNOUNCEMENT = {
  id: "demo-announce-1",
  title: "Blue Don News — Studio B is live at 8:05",
  body: "Morning announcements air today from Studio B. Wear spirit colors for Friday's pep rally preview segment.",
  announcementDate: new Date(),
  authorName: "Broadcasting Club",
  mediaItemId: null as string | null,
};
