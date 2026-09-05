/**
 * Phone go-live — browser camera on this device.
 *
 * Safe to import from client components. No stream keys, no bridge tokens.
 * The phone records short self-contained segments and uploads them to campus
 * storage; the public watch page plays those segments.
 */

export const PUBLIC_WATCH_PATH = "/watch";
export const PHONE_LIVE_ROUTE = "/broadcast/phone";
export const PHONE_LIVE_API_PATH = "/api/watch/live";

/**
 * Sentinel stored on `CampusMediaItem.embedUrl` when the encoder is a phone
 * browser. Never pass this to an iframe — the watch player reads it as a flag.
 */
export const PHONE_LIVE_EMBED = "campus:phone-live";

export const PHONE_LIVE_STORAGE_PREFIX = "live";

/** Independent MediaRecorder takes so each upload is a playable file. */
export const PHONE_LIVE_SEGMENT_MS = 4_000;

/** How often the public player re-reads the segment list. */
export const PHONE_LIVE_POLL_MS = 2_500;

/** Soft ceiling per 4s live segment — well under the campus-video bucket limit. */
export const PHONE_LIVE_MAX_SEGMENT_BYTES = 20 * 1024 * 1024;

export function isPhoneLiveEmbed(
  url: string | null | undefined,
): boolean {
  return (url ?? "").trim() === PHONE_LIVE_EMBED;
}

export function phoneLiveStorageFolder(itemId: string): string {
  return `${PHONE_LIVE_STORAGE_PREFIX}/${itemId}`;
}

export function extensionForLiveMime(mime: string): "mp4" | "webm" {
  return mime.toLowerCase().includes("mp4") ? "mp4" : "webm";
}

/**
 * Prefer MP4 on iPhone Safari; WebM is the Android Chrome fallback.
 * Empty string means "let the browser pick" — some iOS versions only accept that.
 */
export function pickMediaRecorderMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  const candidates = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}
