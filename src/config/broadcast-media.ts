/**
 * Campus media hub — Broadcasting org, academy, and Blue Don Live streaming.
 */

export const BROADCAST_ORG_SLUG = "broadcasting";
export const BROADCAST_ACADEMY_SLUG = "broadcast";

export const CAMPUS_MEDIA_BUCKET =
  process.env.SUPABASE_CAMPUS_MEDIA_BUCKET?.trim() || "campus-media";

export const CAMPUS_MEDIA_MAX_BYTES = 100 * 1024 * 1024;

export const CAMPUS_MEDIA_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type BlueDonLiveRtmpConfig = {
  ingestUrl: string;
  /** School-shared key from env, or null when advisors issue keys manually. */
  streamKey: string | null;
  streamKeyHint: string;
  obsChecklist: string[];
  sceneTips: { label: string; tip: string }[];
};

export function getBlueDonLiveRtmpConfig(): BlueDonLiveRtmpConfig {
  const streamKey = process.env.BLUE_DON_LIVE_STREAM_KEY?.trim() || null;

  return {
    ingestUrl:
      process.env.BLUE_DON_LIVE_RTMP_URL?.trim() ||
      "rtmp://live.bluedon.madonna.edu/app",
    streamKey,
    streamKeyHint: streamKey
      ? "School studio stream key (shared with Broadcasting producers)."
      : "Ask your Broadcast Academy advisor for your studio stream key, or use the per-session key shown when you Go Live.",
    obsChecklist: [
      "Open OBS → Settings → Stream",
      "Service: Custom",
      "Paste the RTMP server URL below",
      "Paste your stream key",
      "Start Streaming in OBS",
      "Paste a YouTube Live / Vimeo embed URL for campus viewers (optional)",
      "Click Go Live on this page so the campus sees you on air",
    ],
    sceneTips: [
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
    ],
  };
}

/** @deprecated Prefer getBlueDonLiveRtmpConfig() for env-aware values. */
export const BLUE_DON_LIVE_RTMP = getBlueDonLiveRtmpConfig();

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
