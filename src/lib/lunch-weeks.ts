/**
 * Grouping service dates into school weeks.
 *
 * The cafeteria thinks in weeks — a menu is published for a week, and Sunday
 * prep is about the week ahead — while the ordering board is a flat list of the
 * next ten weekdays. This is the bridge.
 */

import { fromLunchDateKey, toLunchDateKey } from "@/config/lunch";

export type ServiceWeek<T> = {
  /** `YYYY-MM-DD` of that week's Monday — stable key for lists and forms. */
  key: string;
  /** e.g. "Mon, Aug 24 – Fri, Aug 28". */
  label: string;
  /** Shorter form for a heading, e.g. "Week of Aug 24". */
  shortLabel: string;
  dateKeys: string[];
  days: T[];
};

function mondayOf(date: Date): Date {
  const monday = new Date(date);
  // getUTCDay: Sunday is 0, so Sunday belongs to the week that starts the next
  // day rather than the one six days behind it.
  const weekday = monday.getUTCDay();
  const offset = weekday === 0 ? 1 : 1 - weekday;
  monday.setUTCDate(monday.getUTCDate() + offset);
  return monday;
}

function shortDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Groups days into weeks, preserving order. `dateKeyOf` pulls the `YYYY-MM-DD`
 * out of whatever shape the caller is carrying.
 */
export function groupIntoServiceWeeks<T>(
  days: readonly T[],
  dateKeyOf: (day: T) => string,
): ServiceWeek<T>[] {
  const weeks = new Map<string, ServiceWeek<T>>();

  for (const day of days) {
    const dateKey = dateKeyOf(day);
    const date = fromLunchDateKey(dateKey);
    if (!date) {
      continue;
    }

    const key = toLunchDateKey(mondayOf(date));
    let week = weeks.get(key);
    if (!week) {
      const monday = fromLunchDateKey(key);
      week = {
        key,
        label: "",
        shortLabel: monday
          ? `Week of ${monday.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}`
          : key,
        dateKeys: [],
        days: [],
      };
      weeks.set(key, week);
    }

    week.dateKeys.push(dateKey);
    week.days.push(day);
  }

  for (const week of weeks.values()) {
    const first = fromLunchDateKey(week.dateKeys[0]);
    const last = fromLunchDateKey(week.dateKeys[week.dateKeys.length - 1]);
    week.label =
      first && last
        ? first.getTime() === last.getTime()
          ? shortDate(first)
          : `${shortDate(first)} – ${shortDate(last)}`
        : week.shortLabel;
  }

  return [...weeks.values()];
}
