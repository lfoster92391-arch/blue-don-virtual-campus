/**
 * Cafeteria lunch ordering — choice metadata and the service-week window.
 *
 * Kept free of icon/menu imports so client components can pull labels without
 * dragging the wider School Hub config into the browser bundle. The rotating
 * weekday menu itself lives in `src/config/school-hub.ts` and is joined in
 * `src/services/lunch-service.ts`.
 */

/** Mirrors the `LunchChoiceKind` Prisma enum. */
export type LunchChoice = "HOT" | "VEGETARIAN" | "PACKED" | "NONE";

export const LUNCH_CHOICES: LunchChoice[] = [
  "HOT",
  "VEGETARIAN",
  "PACKED",
  "NONE",
];

export type LunchChoiceMeta = {
  choice: LunchChoice;
  label: string;
  /** Short helper shown under the label on the ordering board. */
  hint: string;
  /** Counted toward the kitchen's cook numbers. */
  countsForKitchen: boolean;
};

export const LUNCH_CHOICE_META: Record<LunchChoice, LunchChoiceMeta> = {
  HOT: {
    choice: "HOT",
    label: "Hot lunch",
    hint: "The posted entree for that day.",
    countsForKitchen: true,
  },
  VEGETARIAN: {
    choice: "VEGETARIAN",
    label: "Vegetarian",
    hint: "The meat-free option for that day.",
    countsForKitchen: true,
  },
  PACKED: {
    choice: "PACKED",
    label: "Packing lunch",
    hint: "Bringing lunch from home — no tray needed.",
    countsForKitchen: false,
  },
  NONE: {
    choice: "NONE",
    label: "Not eating",
    hint: "Absent, off campus, or skipping the cafeteria.",
    countsForKitchen: false,
  },
};

export function isLunchChoice(value: unknown): value is LunchChoice {
  return typeof value === "string" && LUNCH_CHOICES.includes(value as LunchChoice);
}

export function lunchChoiceLabel(choice: LunchChoice): string {
  return LUNCH_CHOICE_META[choice].label;
}

/**
 * Orders for a given day close at 9:00 AM that morning so the kitchen can shop
 * and cook to a settled count. Past days are always locked.
 */
export const LUNCH_ORDER_CUTOFF_HOUR = 9;

/** How many upcoming service days the ordering board offers at once. */
export const LUNCH_ORDER_WINDOW_DAYS = 10;

/** `YYYY-MM-DD` in UTC — the key shared by the UI, actions, and `@db.Date`. */
export function toLunchDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Map key for one diner's order on one day. Lives here rather than in the lunch
 * service so client components can build it without importing Prisma.
 */
export function lunchOrderKey(dinerId: string, dateKey: string): string {
  return `${dinerId}:${dateKey}`;
}

/** Parses a `YYYY-MM-DD` key back to UTC midnight, or null when malformed. */
export function fromLunchDateKey(key: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return null;
  }

  const date = new Date(`${key}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfLunchDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

/** Cafeteria runs Monday–Friday. */
export function isLunchServiceDay(date: Date): boolean {
  const weekday = date.getUTCDay();
  return weekday >= 1 && weekday <= 5;
}

/**
 * True when a service date is still open for ordering. Today stays open until
 * {@link LUNCH_ORDER_CUTOFF_HOUR}; anything earlier is locked.
 */
export function isLunchDateOpen(serviceDate: Date, now = new Date()): boolean {
  const today = startOfLunchDay(now);
  const target = startOfLunchDay(serviceDate);

  if (target.getTime() > today.getTime()) {
    return true;
  }

  if (target.getTime() < today.getTime()) {
    return false;
  }

  return now.getUTCHours() < LUNCH_ORDER_CUTOFF_HOUR;
}

/**
 * The next {@link LUNCH_ORDER_WINDOW_DAYS} weekday service dates starting today,
 * as UTC midnight dates.
 */
export function listLunchServiceDates(
  now = new Date(),
  windowDays = LUNCH_ORDER_WINDOW_DAYS,
): Date[] {
  const dates: Date[] = [];
  const cursor = startOfLunchDay(now);

  // Scan a generous span of calendar days to collect enough weekdays.
  for (let offset = 0; dates.length < windowDays && offset < windowDays * 3; offset += 1) {
    const candidate = new Date(cursor);
    candidate.setUTCDate(candidate.getUTCDate() + offset);
    if (isLunchServiceDay(candidate)) {
      dates.push(candidate);
    }
  }

  return dates;
}
