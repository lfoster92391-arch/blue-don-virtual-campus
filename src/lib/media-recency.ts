/** Anything published inside this window counts as "recent" in video libraries. */
export const RECENT_WINDOW_DAYS = 30;

/**
 * Cutoff for the Recent tab. Server components compute it and pass it down so
 * the client grid never calls `Date.now()` during render.
 */
export function recentWindowStart(): Date {
  return new Date(Date.now() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
}
