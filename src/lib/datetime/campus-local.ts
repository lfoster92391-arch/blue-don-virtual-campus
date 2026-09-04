/**
 * Madonna is in Weirton, WV. `datetime-local` values are naive wall-clock
 * strings (`YYYY-MM-DDTHH:mm`) with no offset. Node on a UTC host treats those
 * as UTC, so 7:00 PM Eastern is stored as 19:00Z and comes back as 3:00 PM EDT.
 *
 * Parse and format every campus form timestamp in this zone, then store a real
 * UTC `Date` in the database.
 */

export const CAMPUS_TIME_ZONE = "America/New_York" as const;

const DATETIME_LOCAL_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

const zonedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type CampusWallClock = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zonedParts(instant: Date): CampusWallClock {
  const parts = zonedFormatter.formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    // Some ICU builds still emit hour 24 at midnight.
    hour: value("hour") % 24,
    minute: value("minute"),
    second: value("second"),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Milliseconds Eastern is ahead of UTC at that instant (negative in this zone). */
function zoneOffsetMs(instant: Date): number {
  const parts = zonedParts(instant);
  return (
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    ) - instant.getTime()
  );
}

function wallClockToUtc(clock: CampusWallClock): Date {
  const naive = Date.UTC(
    clock.year,
    clock.month - 1,
    clock.day,
    clock.hour,
    clock.minute,
    clock.second,
  );

  // Two passes: the offset looked up from the naive UTC guess can sit on the
  // wrong side of a DST boundary. The second pass uses the offset at the
  // corrected instant.
  let instant = new Date(naive - zoneOffsetMs(new Date(naive)));
  instant = new Date(naive - zoneOffsetMs(instant));
  return instant;
}

/**
 * `"2026-09-04"` + `"19:00"` Eastern → the UTC instant to store.
 * Returns null when the pieces are not a real date/time.
 */
export function campusTimeToUtc(date: string, time: string): Date | null {
  const dateMatch = DATE_ONLY_RE.exec(date.trim());
  const timeMatch = TIME_RE.exec(time.trim());
  if (!dateMatch || !timeMatch) {
    return null;
  }

  const clock: CampusWallClock = {
    year: Number(dateMatch[1]),
    month: Number(dateMatch[2]),
    day: Number(dateMatch[3]),
    hour: Number(timeMatch[1]),
    minute: Number(timeMatch[2]),
    second: Number(timeMatch[3] ?? 0),
  };

  if (
    clock.month < 1 ||
    clock.month > 12 ||
    clock.day < 1 ||
    clock.day > 31 ||
    clock.hour > 23 ||
    clock.minute > 59 ||
    clock.second > 59
  ) {
    return null;
  }

  const instant = wallClockToUtc(clock);
  return Number.isNaN(instant.getTime()) ? null : instant;
}

/** `datetime-local` value → UTC instant in campus time. */
export function campusDateTimeLocalToUtc(value: string): Date | null {
  const match = DATETIME_LOCAL_RE.exec(value.trim());
  if (!match) {
    return null;
  }

  return campusTimeToUtc(
    `${match[1]}-${match[2]}-${match[3]}`,
    `${match[4]}:${match[5]}${match[6] ? `:${match[6]}` : ""}`,
  );
}

/** Date-only form value (`YYYY-MM-DD`) → campus local midnight as UTC. */
export function campusDateOnlyToUtc(value: string): Date | null {
  return campusTimeToUtc(value, "00:00");
}

/**
 * Parse a `<input type="datetime-local">` or `type="date"` value as campus
 * wall-clock time. Full ISO strings with a `Z` or offset are kept as instants.
 */
export function parseCampusFormDateTime(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (DATETIME_LOCAL_RE.test(trimmed)) {
    return campusDateTimeLocalToUtc(trimmed);
  }

  if (DATE_ONLY_RE.test(trimmed)) {
    return campusDateOnlyToUtc(trimmed);
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** UTC instant → `YYYY-MM-DDTHH:mm` for a `datetime-local` input. */
export function utcToCampusDateTimeLocal(instant: Date): string {
  const parts = zonedParts(instant);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

/** Eastern calendar date of a stored instant — upsert keys, lunch-style labels. */
export function campusDateKey(instant: Date): string {
  const parts = zonedParts(instant);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

export function formatCampusDateTime(
  instant: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  }).format(instant);
}

export function formatCampusDate(
  instant: Date,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
    ...options,
  }).format(instant);
}
