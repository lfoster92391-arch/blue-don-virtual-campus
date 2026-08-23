/**
 * The cafeteria's prep sheet.
 *
 * `getLunchKitchenCounts` in `lunch-service.ts` answers "how many trays"; this
 * answers the rest of what someone standing in the kitchen actually needs —
 * which dish those trays are, who is eating, and which of them has an allergy
 * on file. One query over the service window, grouped per day.
 *
 * Read-only and soft-failing, so a database hiccup shows an empty prep sheet
 * rather than a broken page in the middle of service.
 */

import { isDatabaseConfigured } from "@/config/env";
import {
  LUNCH_CHOICES,
  LUNCH_CHOICE_META,
  isLunchDateOpen,
  isLunchServiceDay,
  listLunchServiceDates,
  startOfLunchDay,
  toLunchDateKey,
  type LunchChoice,
} from "@/config/lunch";
import type { LunchMenu } from "@/config/school-hub";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { getDietaryProfiles } from "@/services/dietary-service";
import { resolveLunchMenus } from "@/services/lunch-menu-service";

export type KitchenDinerLine = {
  dinerId: string;
  name: string;
  /** True when a faculty or staff member ordered their own tray. */
  isFaculty: boolean;
  choice: LunchChoice;
  allergens: string[];
  restrictions: string[];
  dietaryNotes: string | null;
  /** Free text the family added to that day's order. */
  orderNote: string | null;
};

export type KitchenDayPlan = {
  dateKey: string;
  dayName: string;
  shortLabel: string;
  isToday: boolean;
  /** Still accepting changes, so the count can move before service. */
  isOpen: boolean;
  menu: LunchMenu | null;
  /** True when staff published this menu rather than falling back to the rotation. */
  menuPublished: boolean;
  menuNote: string | null;
  counts: Record<LunchChoice, number>;
  /** Hot + vegetarian — the trays the kitchen has to cook. */
  traysToPrepare: number;
  /** Everyone who answered, including packed and not-eating. */
  totalResponses: number;
  /** Diners eating a cafeteria tray, grouped by which dish. */
  hot: KitchenDinerLine[];
  vegetarian: KitchenDinerLine[];
  /** Anyone eating a tray who has an allergy or restriction on file. */
  dietaryFlags: KitchenDinerLine[];
  /** Notes families left on that day's order. */
  orderNotes: KitchenDinerLine[];
};

export type KitchenPlanTotals = {
  counts: Record<LunchChoice, number>;
  traysToPrepare: number;
  daysCovered: number;
  dietaryFlagCount: number;
};

function emptyCounts(): Record<LunchChoice, number> {
  return { HOT: 0, VEGETARIAN: 0, PACKED: 0, NONE: 0 };
}

function displayNameFor(row: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const joined = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.displayName ?? (joined.length > 0 ? joined : row.email);
}

function sortByName(a: KitchenDinerLine, b: KitchenDinerLine): number {
  return a.name.localeCompare(b.name);
}

/**
 * Per-day prep sheet for the next stretch of service days. Callers must have
 * already checked `lunch:manage`.
 */
export async function getLunchKitchenPlan(): Promise<KitchenDayPlan[]> {
  const now = new Date();
  const today = startOfLunchDay(now);
  const dates = listLunchServiceDates(now);

  if (dates.length === 0 || !isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const first = toLunchDateKey(dates[0]);
  const last = toLunchDateKey(dates[dates.length - 1]);
  const menus = await resolveLunchMenus(dates.map(toLunchDateKey));

  const rows = await withDatabase((prisma) =>
    prisma.lunchOrder.findMany({
      where: {
        serviceDate: {
          gte: new Date(`${first}T00:00:00.000Z`),
          lte: new Date(`${last}T00:00:00.000Z`),
        },
      },
      select: {
        dinerId: true,
        serviceDate: true,
        choice: true,
        note: true,
        diner: {
          select: {
            role: true,
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  );

  const orders = rows ?? [];
  const profiles = await getDietaryProfiles([
    ...new Set(orders.map((row) => row.dinerId)),
  ]);

  const byDate = new Map<string, KitchenDayPlan>();
  for (const date of dates) {
    const menu = menus[toLunchDateKey(date)] ?? null;
    byDate.set(toLunchDateKey(date), {
      dateKey: toLunchDateKey(date),
      dayName:
        menu?.dayName ??
        date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
      shortLabel: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      isToday: date.getTime() === today.getTime(),
      isOpen: isLunchDateOpen(date, now),
      menu,
      menuPublished: menu?.published ?? false,
      menuNote: menu?.note ?? null,
      counts: emptyCounts(),
      traysToPrepare: 0,
      totalResponses: 0,
      hot: [],
      vegetarian: [],
      dietaryFlags: [],
      orderNotes: [],
    });
  }

  for (const row of orders) {
    const plan = byDate.get(toLunchDateKey(row.serviceDate));
    if (!plan) {
      continue;
    }

    const choice = row.choice as LunchChoice;
    const profile = profiles[row.dinerId];
    const line: KitchenDinerLine = {
      dinerId: row.dinerId,
      name: displayNameFor(row.diner),
      isFaculty: row.diner.role !== "STUDENT",
      choice,
      allergens: profile?.allergens ?? [],
      restrictions: profile?.restrictions ?? [],
      dietaryNotes: profile?.notes ?? null,
      orderNote: row.note,
    };

    plan.counts[choice] += 1;
    plan.totalResponses += 1;

    if (LUNCH_CHOICE_META[choice].countsForKitchen) {
      plan.traysToPrepare += 1;
      if (choice === "HOT") {
        plan.hot.push(line);
      } else {
        plan.vegetarian.push(line);
      }
      if (line.allergens.length > 0 || line.restrictions.length > 0) {
        plan.dietaryFlags.push(line);
      }
    }

    if (line.orderNote) {
      plan.orderNotes.push(line);
    }
  }

  for (const plan of byDate.values()) {
    plan.hot.sort(sortByName);
    plan.vegetarian.sort(sortByName);
    plan.dietaryFlags.sort(sortByName);
    plan.orderNotes.sort(sortByName);
  }

  return [...byDate.values()];
}

/**
 * False on Saturday and Sunday. The prep sheet stays open on those days — the
 * cafeteria does its counting for the week ahead on a Sunday — so the page uses
 * this to say so rather than to hide anything.
 */
export function isServiceDayToday(now = new Date()): boolean {
  return isLunchServiceDay(startOfLunchDay(now));
}

export function summarizeKitchenPlan(plan: KitchenDayPlan[]): KitchenPlanTotals {
  const counts = emptyCounts();
  let traysToPrepare = 0;
  let dietaryFlagCount = 0;

  for (const day of plan) {
    for (const choice of LUNCH_CHOICES) {
      counts[choice] += day.counts[choice];
    }
    traysToPrepare += day.traysToPrepare;
    dietaryFlagCount += day.dietaryFlags.length;
  }

  return {
    counts,
    traysToPrepare,
    daysCovered: plan.length,
    dietaryFlagCount,
  };
}
