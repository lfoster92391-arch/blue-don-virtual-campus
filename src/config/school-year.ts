/**
 * School-year context for the Digital Forms Center.
 * Agreements are scoped to a school year (e.g. "2025-2026") so annual
 * refresh and compliance reporting can group submissions by year.
 */

/** Month (0-indexed) a new Madonna school year begins. August = 7. */
const SCHOOL_YEAR_START_MONTH = 7;

/** Returns the school-year label for a date, e.g. "2025-2026". */
export function getSchoolYear(date: Date = new Date()): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= SCHOOL_YEAR_START_MONTH ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

/** Current school year label, evaluated at call time. */
export function getCurrentSchoolYear(): string {
  return getSchoolYear();
}
