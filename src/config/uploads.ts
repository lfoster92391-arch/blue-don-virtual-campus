/**
 * Rules for every file that reaches the server inside a Server Action body.
 *
 * `next.config.ts` caps a Server Action at 4 MB because Vercel rejects any
 * function request over 4.5 MB at the infrastructure level — the request never
 * reaches our code, so the form cannot show a useful error. The whole multipart
 * payload counts against that budget, not just the file, hence the headroom
 * between the target and the ceiling.
 *
 * Campus video is the one exception: it PUTs straight to Supabase Storage from
 * the browser, so it lives under `campus-video.ts` with a 50 MB limit.
 */

/** Matches `experimental.serverActions.bodySizeLimit` in next.config.ts. */
export const SERVER_ACTION_BODY_LIMIT_BYTES = 4 * 1024 * 1024;

/** Largest file a Server Action upload can accept, server-side. */
export const IMAGE_UPLOAD_MAX_BYTES = SERVER_ACTION_BODY_LIMIT_BYTES;

/**
 * What the browser compresses a photo down to before submitting. The gap to
 * {@link IMAGE_UPLOAD_MAX_BYTES} leaves room for the rest of the form fields
 * and multipart overhead.
 */
export const IMAGE_UPLOAD_TARGET_BYTES = Math.floor(3.4 * 1024 * 1024);

/** Longest edge kept when a photo has to be resized to fit. */
export const IMAGE_UPLOAD_MAX_DIMENSION = 2400;

/**
 * Accepted photo types. HEIC/HEIF are here because that is what an iPhone
 * hands over by default — the browser converts those to JPEG on the way out
 * when it can decode them, and the server stores them as-is when it cannot.
 */
export const CAMPUS_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
] as const;

export type CampusImageType = (typeof CAMPUS_IMAGE_TYPES)[number];

const IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
];

/**
 * File-picker `accept` value. Extensions ride along with the MIME types
 * because Android and Windows pickers routinely report an empty type for HEIC
 * and would otherwise grey the file out.
 */
export const CAMPUS_IMAGE_ACCEPT = [
  ...CAMPUS_IMAGE_TYPES,
  ...IMAGE_EXTENSIONS,
].join(",");

/** Sports marks are often vector art, so those surfaces also take SVG. */
export const CAMPUS_IMAGE_ACCEPT_WITH_SVG = [
  ...CAMPUS_IMAGE_TYPES,
  "image/svg+xml",
  ...IMAGE_EXTENSIONS,
  ".svg",
].join(",");

/** Receipts arrive as a phone photo or a vendor PDF. */
export const CAMPUS_IMAGE_ACCEPT_WITH_PDF = [
  ...CAMPUS_IMAGE_TYPES,
  "application/pdf",
  ...IMAGE_EXTENSIONS,
  ".pdf",
].join(",");

export function formatUploadSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : mb.toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export const IMAGE_UPLOAD_MAX_LABEL = formatUploadSize(IMAGE_UPLOAD_MAX_BYTES);
