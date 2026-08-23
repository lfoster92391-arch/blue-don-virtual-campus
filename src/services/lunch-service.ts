/**
 * Cafeteria lunch ordering.
 *
 * Parents order for their linked students; teachers, staff, and students order
 * for themselves. A user who is both (a teacher who is also a Madonna parent)
 * gets their own tray plus each linked child on the same board.
 *
 * Menus come from the rotating weekday config in `src/config/school-hub.ts` —
 * only the per-diner decision is persisted, in `LunchOrder`.
 *
 * Every read soft-fails to an empty board so the page still renders when the
 * database is unreachable, matching the rest of the campus services.
 */

import { isDatabaseConfigured } from "@/config/env";
import { withDatabase } from "@/lib/prisma";
import {
  LUNCH_CHOICE_META,
  isLunchDateOpen,
  listLunchServiceDates,
  lunchOrderKey,
  startOfLunchDay,
  toLunchDateKey,
  type LunchChoice,
} from "@/config/lunch";
import type { LunchMenu } from "@/config/school-hub";
import { resolveLunchMenus } from "@/services/lunch-menu-service";
import {
  PARENT_PREVIEW_DIETARY,
  PARENT_PREVIEW_RELATIONSHIP,
  PARENT_PREVIEW_STUDENT_ID,
  PARENT_PREVIEW_STUDENT_NAME,
} from "@/config/parent-preview";
import { canOrderLunch, ordersLunchForSelf, type CampusRole } from "@/config/roles";
import { listLinkedStudents } from "@/services/parent-student-service";
import { getDietaryProfiles, type DietaryProfile } from "@/services/dietary-service";

/** Who the tray is for. */
export type LunchDiner = {
  id: string;
  displayName: string;
  /** `self` — the signed-in user's own lunch. `student` — a linked child. */
  kind: "self" | "student";
  relationship: string | null;
  /**
   * The office-accepted dietary record, when one exists. Surfaced next to the
   * choices so whoever orders sees the allergy before picking the entree.
   */
  dietary: DietaryProfile | null;
  /** Synthetic stand-in shown while an admin previews the parent view. */
  isPreview?: boolean;
};

export type LunchDay = {
  /** `YYYY-MM-DD`, the shared key across UI, actions, and the database. */
  dateKey: string;
  dayName: string;
  /** e.g. "Mon, Aug 24". */
  shortLabel: string;
  isToday: boolean;
  /** False once the 9:00 AM cutoff has passed for that day. */
  isOpen: boolean;
  menu: LunchMenu | null;
  /** Office note for the day, e.g. "Early dismissal — cold lunch only". */
  menuNote: string | null;
};

export type LunchOrderView = {
  dinerId: string;
  dateKey: string;
  choice: LunchChoice;
  note: string | null;
  orderedByName: string | null;
  /** True when the diner placed it themselves rather than a parent/office. */
  orderedBySelf: boolean;
  updatedAt: string;
};

export type LunchBoard = {
  days: LunchDay[];
  diners: LunchDiner[];
  /** Keyed `${dinerId}:${dateKey}`. */
  orders: Record<string, LunchOrderView>;
  canOrder: boolean;
  /**
   * Admin previewing the family view. The board is fully interactive so the
   * chrome can be checked, but choices stay in the browser and never reach an
   * action or the kitchen counts.
   */
  previewOnly: boolean;
};

function displayNameFor(row: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const joined = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.displayName ?? (joined.length > 0 ? joined : row.email);
}

/**
 * Everyone the given user may order for: themselves when their role eats on
 * campus, plus any linked students. Parents always see their children even
 * though they never get a tray of their own.
 */
export async function listLunchDiners(user: {
  id: string;
  displayName: string;
  role: CampusRole;
}): Promise<LunchDiner[]> {
  const diners: LunchDiner[] = [];

  if (ordersLunchForSelf(user.role)) {
    diners.push({
      id: user.id,
      displayName: user.displayName,
      kind: "self",
      relationship: null,
      dietary: null,
    });
  }

  // A teacher or staff member may also be a parent here; linked students are
  // additive rather than an either/or with their own tray.
  const linked = await listLinkedStudents(user.id);
  for (const student of linked) {
    if (diners.some((diner) => diner.id === student.id)) {
      continue;
    }
    diners.push({
      id: student.id,
      displayName: student.displayName,
      kind: "student",
      relationship: student.relationship,
      dietary: null,
    });
  }

  if (diners.length === 0) {
    return diners;
  }

  const profiles = await getDietaryProfiles(diners.map((diner) => diner.id));
  return diners.map((diner) => ({
    ...diner,
    dietary: profiles[diner.id] ?? null,
  }));
}

async function buildDays(now: Date): Promise<LunchDay[]> {
  const today = startOfLunchDay(now);
  const dates = listLunchServiceDates(now);

  // Published menus win over the rotating weekday config; dates the office has
  // not published fall back to it, so the board is never blank.
  const menus = await resolveLunchMenus(dates.map(toLunchDateKey));

  return dates.map((date) => {
    const menu = menus[toLunchDateKey(date)] ?? null;
    return {
      dateKey: toLunchDateKey(date),
      dayName: menu?.dayName ?? date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
      shortLabel: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      isToday: date.getTime() === today.getTime(),
      isOpen: isLunchDateOpen(date, now),
      menu,
      menuNote: menu?.note ?? null,
    };
  });
}

/** The stand-in child an admin orders for while previewing the parent view. */
function previewDiner(): LunchDiner {
  return {
    id: PARENT_PREVIEW_STUDENT_ID,
    displayName: PARENT_PREVIEW_STUDENT_NAME,
    kind: "student",
    relationship: PARENT_PREVIEW_RELATIONSHIP,
    dietary: {
      studentId: PARENT_PREVIEW_STUDENT_ID,
      allergens: [...PARENT_PREVIEW_DIETARY.allergens],
      restrictions: [...PARENT_PREVIEW_DIETARY.restrictions],
      notes: PARENT_PREVIEW_DIETARY.notes,
      appliedByName: null,
      appliedAt: null,
      updatedAt: new Date().toISOString(),
    },
    isPreview: true,
  };
}

export async function getLunchBoard(
  user: {
    id: string;
    displayName: string;
    role: CampusRole;
  },
  options: { parentPreview?: boolean } = {},
): Promise<LunchBoard> {
  const now = new Date();
  const days = await buildDays(now);
  const canOrder = canOrderLunch(user.role);

  // Nothing real is read or written in preview: the admin's own tray is left out
  // so a stray tap cannot order their actual lunch either.
  if (options.parentPreview) {
    return {
      days,
      diners: [previewDiner()],
      orders: {},
      canOrder: true,
      previewOnly: true,
    };
  }

  if (!canOrder) {
    return { days, diners: [], orders: {}, canOrder, previewOnly: false };
  }

  const diners = await listLunchDiners(user);

  if (diners.length === 0 || !isDatabaseConfigured() || days.length === 0) {
    return { days, diners, orders: {}, canOrder, previewOnly: false };
  }

  const first = days[0];
  const last = days[days.length - 1];

  const rows = await withDatabase((prisma) =>
    prisma.lunchOrder.findMany({
      where: {
        dinerId: { in: diners.map((diner) => diner.id) },
        serviceDate: {
          gte: new Date(`${first.dateKey}T00:00:00.000Z`),
          lte: new Date(`${last.dateKey}T00:00:00.000Z`),
        },
      },
      select: {
        dinerId: true,
        orderedById: true,
        serviceDate: true,
        choice: true,
        note: true,
        updatedAt: true,
        orderedBy: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
  );

  const orders: Record<string, LunchOrderView> = {};
  for (const row of rows ?? []) {
    const dateKey = toLunchDateKey(row.serviceDate);
    orders[lunchOrderKey(row.dinerId, dateKey)] = {
      dinerId: row.dinerId,
      dateKey,
      choice: row.choice as LunchChoice,
      note: row.note,
      orderedByName: row.orderedBy ? displayNameFor(row.orderedBy) : null,
      orderedBySelf: row.orderedById === row.dinerId,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  return { days, diners, orders, canOrder, previewOnly: false };
}

export type PlaceLunchOrderInput = {
  user: { id: string; displayName: string; role: CampusRole };
  dinerId: string;
  dateKey: string;
  choice: LunchChoice;
  note?: string | null;
};

export type PlaceLunchOrderResult =
  | { ok: true; order: LunchOrderView }
  | { ok: false; error: string };

/**
 * Records or updates one diner's choice for one service date. Callers must
 * already have validated that the actor may order for `dinerId`.
 */
export async function placeLunchOrder(
  input: PlaceLunchOrderInput,
): Promise<PlaceLunchOrderResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Lunch ordering is unavailable right now." };
  }

  const serviceDate = new Date(`${input.dateKey}T00:00:00.000Z`);
  const note = input.note?.trim() || null;

  const row = await withDatabase((prisma) =>
    prisma.lunchOrder.upsert({
      where: {
        dinerId_serviceDate: {
          dinerId: input.dinerId,
          serviceDate,
        },
      },
      create: {
        dinerId: input.dinerId,
        orderedById: input.user.id,
        serviceDate,
        choice: input.choice,
        note,
      },
      update: {
        orderedById: input.user.id,
        choice: input.choice,
        note,
      },
      select: {
        dinerId: true,
        orderedById: true,
        serviceDate: true,
        choice: true,
        note: true,
        updatedAt: true,
      },
    }),
  );

  if (!row) {
    return { ok: false, error: "Unable to save that lunch order." };
  }

  return {
    ok: true,
    order: {
      dinerId: row.dinerId,
      dateKey: toLunchDateKey(row.serviceDate),
      choice: row.choice as LunchChoice,
      note: row.note,
      orderedByName: input.user.displayName,
      orderedBySelf: row.orderedById === row.dinerId,
      updatedAt: row.updatedAt.toISOString(),
    },
  };
}

export type LunchKitchenCount = {
  dateKey: string;
  shortLabel: string;
  counts: Record<LunchChoice, number>;
  /** Trays the kitchen actually has to prepare (hot + vegetarian). */
  traysToPrepare: number;
  total: number;
};

/**
 * Per-day order counts for the kitchen and front office. Read-only, and safe to
 * call for any `lunch:manage` role.
 */
export async function getLunchKitchenCounts(): Promise<LunchKitchenCount[]> {
  const now = new Date();
  const days = await buildDays(now);

  if (!isDatabaseConfigured() || days.length === 0) {
    return [];
  }

  const first = days[0];
  const last = days[days.length - 1];

  const rows = await withDatabase((prisma) =>
    prisma.lunchOrder.groupBy({
      by: ["serviceDate", "choice"],
      where: {
        serviceDate: {
          gte: new Date(`${first.dateKey}T00:00:00.000Z`),
          lte: new Date(`${last.dateKey}T00:00:00.000Z`),
        },
      },
      _count: { _all: true },
    }),
  );

  if (!rows) {
    return [];
  }

  const byDate = new Map<string, LunchKitchenCount>();
  for (const day of days) {
    byDate.set(day.dateKey, {
      dateKey: day.dateKey,
      shortLabel: day.shortLabel,
      counts: { HOT: 0, VEGETARIAN: 0, PACKED: 0, NONE: 0 },
      traysToPrepare: 0,
      total: 0,
    });
  }

  for (const row of rows) {
    const dateKey = toLunchDateKey(row.serviceDate);
    const entry = byDate.get(dateKey);
    if (!entry) {
      continue;
    }

    const choice = row.choice as LunchChoice;
    const count = row._count._all;
    entry.counts[choice] += count;
    entry.total += count;
    if (LUNCH_CHOICE_META[choice].countsForKitchen) {
      entry.traysToPrepare += count;
    }
  }

  return [...byDate.values()];
}
