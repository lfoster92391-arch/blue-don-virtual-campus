/**
 * Launch mode for Blue Don Virtual Campus.
 *
 * CLEAN SLATE MODE — the real-launch default.
 * -------------------------------------------
 * When clean slate is on, the campus starts as a blank real instance:
 *   - Structural/catalog data the app NEEDS to function still loads
 *     (organizations, academies, forms, waves, category metadata, traditions,
 *     school history). This is the "menu" real users pick from.
 *   - Fake activity/associations presented as if they were real school data
 *     do NOT preload. Sample feeds, seeded impact numbers, demo partners,
 *     mentors, spotlights, thank-you notes, polls, alumni maps, legacy pages,
 *     etc. return empty so every page renders a graceful EMPTY STATE.
 *
 * Everything real users add later (clubs joined, XP, forms signed, partners,
 * events, spotlights) is genuinely theirs.
 *
 * Toggle with the `BLUE_DON_CLEAN_SLATE` environment variable:
 *   - unset / "1" / "true" / "yes"  -> clean slate ON  (blank real launch, default)
 *   - "0" / "false" / "no"          -> clean slate OFF (show sample/demo content)
 *
 * To walk through a fully populated demo instead, turn clean slate off and/or
 * load the rich demo persona with `npm run db:seed:demo`.
 *
 * FOCUSED CLUBS MODE — soft-wipe pivot (see docs/CLUB_FOCUS_PIVOT.md).
 * ---------------------------------------------------------------
 * When on, primary nav and club IA center on IT Club, Broadcasting, and
 * Cricut Club (calendar, media/live, finances/fundraisers). Other modules
 * stay reachable by URL but are demoted from the sidebar.
 *
 * Toggle with `BLUE_DON_FOCUSED_CLUBS`:
 *   - unset / "1" / "true" / "yes"  -> focused clubs ON  (default)
 *   - "0" / "false" / "no"          -> focused clubs OFF (full campus nav)
 */

function readBoolFlag(
  envValue: string | undefined,
  defaultWhenUnset: boolean,
): boolean {
  const raw = envValue?.trim().toLowerCase();

  if (raw === undefined || raw === "") {
    return defaultWhenUnset;
  }

  return !(raw === "0" || raw === "false" || raw === "no" || raw === "off");
}

function readCleanSlate(): boolean {
  return readBoolFlag(process.env.BLUE_DON_CLEAN_SLATE, true);
}

function readFocusedClubs(): boolean {
  return readBoolFlag(process.env.BLUE_DON_FOCUSED_CLUBS, true);
}

export const CLEAN_SLATE = readCleanSlate();

/** Soft-wipe IA around IT / Broadcasting / Cricut. Default on. */
export const FOCUSED_CLUBS_MODE = readFocusedClubs();

/**
 * Returns `sample` only when clean slate is OFF; otherwise an empty array.
 * Use to gate config sample arrays that render as if they were real data.
 */
export function sampleList<T>(sample: T[]): T[] {
  return CLEAN_SLATE ? [] : sample;
}

/**
 * Returns `sample` only when clean slate is OFF; otherwise `null`.
 * Use to gate a single sample object (e.g. a weekly spotlight).
 */
export function sampleOrNull<T>(sample: T): T | null {
  return CLEAN_SLATE ? null : sample;
}

/**
 * Returns `sample` when clean slate is OFF; otherwise `emptyValue`.
 * Use for scalar sample values (e.g. seeded impact counts -> 0).
 */
export function sampleValue<T>(sample: T, emptyValue: T): T {
  return CLEAN_SLATE ? emptyValue : sample;
}
