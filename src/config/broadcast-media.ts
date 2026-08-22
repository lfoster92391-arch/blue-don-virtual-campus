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
 * Display-safe streaming guidance. Contains no credentials, so it is the only
 * RTMP shape allowed to cross a server → client component boundary.
 */
export type BlueDonLiveRtmpPublicConfig = {
  /** True when the school configured a shared studio key in the environment. */
  hasSharedStreamKey: boolean;
  streamKeyHint: string;
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
