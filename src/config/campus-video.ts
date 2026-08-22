/**
 * Campus video upload rules shared by the browser and the server.
 *
 * Kept apart from `broadcast-media.ts` because that module also resolves RTMP
 * stream secrets, and the upload form is a client component — nothing here may
 * read a server-only environment variable.
 */

/**
 * Hard ceiling for a single campus video. Supabase enforces its own global file
 * size limit per project (50 MB on the current plan) and rejects anything
 * larger with `EntityTooLarge`, so this must stay at or below that number —
 * raising it here without raising it in Supabase only moves the failure later.
 */
export const CAMPUS_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const CAMPUS_MEDIA_MAX_LABEL = `${Math.round(
  CAMPUS_MEDIA_MAX_BYTES / (1024 * 1024),
)} MB`;

export const CAMPUS_MEDIA_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type CampusMediaVideoType = (typeof CAMPUS_MEDIA_VIDEO_TYPES)[number];

/**
 * Phone and desktop file pickers hand us wildly inconsistent MIME types for the
 * same clip — an iPhone `.MOV` arrives as `video/quicktime` from Safari but as
 * an empty string or `application/octet-stream` from some Android and Windows
 * pickers. Fall back to the extension before rejecting a legitimate video.
 */
const VIDEO_EXTENSION_TYPES: Record<string, CampusMediaVideoType> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  qt: "video/quicktime",
};

/** File-picker `accept` value — MIME types plus extensions, since some OSes only match one. */
export const CAMPUS_MEDIA_VIDEO_ACCEPT = [
  ...CAMPUS_MEDIA_VIDEO_TYPES,
  ...Object.keys(VIDEO_EXTENSION_TYPES).map((extension) => `.${extension}`),
].join(",");

/**
 * Normalizes a browser-reported type to one of {@link CAMPUS_MEDIA_VIDEO_TYPES},
 * or null when the file is genuinely not a supported video.
 */
export function resolveCampusVideoContentType(
  fileName: string,
  reportedType: string | undefined | null,
): CampusMediaVideoType | null {
  const normalized = (reportedType ?? "").trim().toLowerCase().split(";")[0];

  const direct = CAMPUS_MEDIA_VIDEO_TYPES.find((type) => type === normalized);
  if (direct) {
    return direct;
  }

  const extension = fileName.toLowerCase().split(".").pop() ?? "";
  return VIDEO_EXTENSION_TYPES[extension] ?? null;
}
