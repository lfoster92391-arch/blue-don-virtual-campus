/**
 * The lunch menu calendar staff actually publish.
 *
 * `LUNCH_MENUS` in `src/config/school-hub.ts` is a five-day rotation that
 * repeats forever. It is the fallback here, never the source of truth: any date
 * with a published `LunchMenuDay` row overrides it, and a date without one
 * still shows the rotation so the board is never blank.
 *
 * Drafts are invisible to families. A row counts as published only once
 * `publishedAt` is set, which is what lets the kitchen build three weeks ahead
 * and release a week at a time.
 *
 * Reads soft-fail to the rotating config, so a database outage degrades to the
 * old behaviour instead of an empty cafeteria page.
 */

import { isDatabaseConfigured } from "@/config/env";
import { fromLunchDateKey, toLunchDateKey } from "@/config/lunch";
import { getLunchForWeekday, type LunchMenu } from "@/config/school-hub";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { sendSystemStudentMessages } from "@/services/student-message-service";

export type ResolvedLunchMenu = LunchMenu & {
  /** True when staff published this day; false when it fell back to the rotation. */
  published: boolean;
  /** Day-specific note from the office, e.g. "Early dismissal — cold lunch". */
  note: string | null;
};

export type LunchMenuDraft = {
  dateKey: string;
  entree: string;
  vegetarian: string;
  sides: string[];
  dessert: string | null;
  note: string | null;
};

export type LunchMenuDayRow = LunchMenuDraft & {
  /** Null while the day is still a draft. */
  publishedAt: string | null;
  publishedByName: string | null;
  updatedAt: string | null;
  /** No row yet — the values shown came from the rotating config. */
  isFallback: boolean;
};

function weekdayOf(dateKey: string): number {
  const date = fromLunchDateKey(dateKey);
  return date ? date.getUTCDay() : 0;
}

function dayNameOf(dateKey: string): string {
  const date = fromLunchDateKey(dateKey);
  return date
    ? date.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
    : "";
}

function fallbackFor(dateKey: string): ResolvedLunchMenu | null {
  const menu = getLunchForWeekday(weekdayOf(dateKey));
  if (!menu) {
    return null;
  }
  return { ...menu, published: false, note: null };
}

/**
 * Menus families should see for the given dates: published rows where they
 * exist, the rotating config everywhere else. Keyed by `YYYY-MM-DD`.
 */
export async function resolveLunchMenus(
  dateKeys: readonly string[],
): Promise<Record<string, ResolvedLunchMenu>> {
  const resolved: Record<string, ResolvedLunchMenu> = {};
  for (const dateKey of dateKeys) {
    const fallback = fallbackFor(dateKey);
    if (fallback) {
      resolved[dateKey] = fallback;
    }
  }

  if (dateKeys.length === 0 || !isDatabaseConfigured() || !isPrismaReady()) {
    return resolved;
  }

  const rows = await withDatabase((prisma) =>
    prisma.lunchMenuDay.findMany({
      where: {
        serviceDate: { in: dateKeys.map((key) => new Date(`${key}T00:00:00.000Z`)) },
        publishedAt: { not: null },
      },
      select: {
        serviceDate: true,
        entree: true,
        vegetarian: true,
        sides: true,
        dessert: true,
        note: true,
      },
    }),
  );

  for (const row of rows ?? []) {
    const dateKey = toLunchDateKey(row.serviceDate);
    resolved[dateKey] = {
      weekday: weekdayOf(dateKey) as LunchMenu["weekday"],
      dayName: dayNameOf(dateKey),
      entree: row.entree,
      sides: row.sides,
      vegetarian: row.vegetarian,
      dessert: row.dessert ?? "",
      published: true,
      note: row.note,
    };
  }

  return resolved;
}

/**
 * Every day in the window as the office sees it — drafts included, and dates
 * with no row prefilled from the rotation so a menu can be built by editing
 * rather than typing from scratch.
 */
export async function listLunchMenuDays(
  dateKeys: readonly string[],
): Promise<LunchMenuDayRow[]> {
  const rowsByDate = new Map<string, LunchMenuDayRow>();

  if (dateKeys.length > 0 && isDatabaseConfigured() && isPrismaReady()) {
    const found = await withDatabase((prisma) =>
      prisma.lunchMenuDay.findMany({
        where: {
          serviceDate: {
            in: dateKeys.map((key) => new Date(`${key}T00:00:00.000Z`)),
          },
        },
        select: {
          serviceDate: true,
          entree: true,
          vegetarian: true,
          sides: true,
          dessert: true,
          note: true,
          publishedAt: true,
          updatedAt: true,
          publishedBy: {
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

    for (const row of found ?? []) {
      const dateKey = toLunchDateKey(row.serviceDate);
      const publisher = row.publishedBy;
      rowsByDate.set(dateKey, {
        dateKey,
        entree: row.entree,
        vegetarian: row.vegetarian,
        sides: row.sides,
        dessert: row.dessert,
        note: row.note,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        publishedByName: publisher
          ? (publisher.displayName ??
            [publisher.firstName, publisher.lastName]
              .filter(Boolean)
              .join(" ") ??
            publisher.email)
          : null,
        updatedAt: row.updatedAt.toISOString(),
        isFallback: false,
      });
    }
  }

  return dateKeys.map((dateKey) => {
    const existing = rowsByDate.get(dateKey);
    if (existing) {
      return existing;
    }

    const fallback = fallbackFor(dateKey);
    return {
      dateKey,
      entree: fallback?.entree ?? "",
      vegetarian: fallback?.vegetarian ?? "",
      sides: fallback?.sides ?? [],
      dessert: fallback?.dessert ?? null,
      note: null,
      publishedAt: null,
      publishedByName: null,
      updatedAt: null,
      isFallback: true,
    };
  });
}

export type SaveLunchMenuResult =
  | { ok: true; published: boolean }
  | { ok: false; error: string };

/**
 * Create or update one day. Saving never changes whether the day is published —
 * that is a separate, deliberate step.
 */
export async function saveLunchMenuDay(input: {
  draft: LunchMenuDraft;
  userId: string;
}): Promise<SaveLunchMenuResult> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { ok: false, error: "The menu calendar is unavailable right now." };
  }

  const serviceDate = fromLunchDateKey(input.draft.dateKey);
  if (!serviceDate) {
    return { ok: false, error: "That is not a valid date." };
  }

  const row = await withDatabase((prisma) =>
    prisma.lunchMenuDay.upsert({
      where: { serviceDate },
      create: {
        serviceDate,
        entree: input.draft.entree,
        vegetarian: input.draft.vegetarian,
        sides: input.draft.sides,
        dessert: input.draft.dessert,
        note: input.draft.note,
        updatedById: input.userId,
      },
      update: {
        entree: input.draft.entree,
        vegetarian: input.draft.vegetarian,
        sides: input.draft.sides,
        dessert: input.draft.dessert,
        note: input.draft.note,
        updatedById: input.userId,
      },
      select: { publishedAt: true },
    }),
  );

  if (!row) {
    return { ok: false, error: "Unable to save that day." };
  }

  return { ok: true, published: row.publishedAt !== null };
}

export type PublishLunchMenuResult =
  | { ok: true; publishedCount: number; notifiedCount: number }
  | { ok: false; error: string };

/**
 * Release a set of days to families, optionally telling them it happened.
 *
 * Only days that already have a row are published — there is nothing to release
 * for a date still showing the rotating fallback.
 */
export async function publishLunchMenuDays(input: {
  dateKeys: string[];
  user: { id: string; displayName: string };
  notifyFamilies: boolean;
  rangeLabel: string;
}): Promise<PublishLunchMenuResult> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { ok: false, error: "The menu calendar is unavailable right now." };
  }

  const serviceDates = input.dateKeys
    .map(fromLunchDateKey)
    .filter((date): date is Date => date !== null);

  if (serviceDates.length === 0) {
    return { ok: false, error: "Pick at least one day to publish." };
  }

  const result = await withDatabase((prisma) =>
    prisma.lunchMenuDay.updateMany({
      where: { serviceDate: { in: serviceDates }, publishedAt: null },
      data: { publishedAt: new Date(), publishedById: input.user.id },
    }),
  );

  const publishedCount = result?.count ?? 0;

  if (publishedCount === 0) {
    return {
      ok: false,
      error:
        "Nothing to publish — save a menu for those days first, or they are already published.",
    };
  }

  const notifiedCount = input.notifyFamilies
    ? await notifyFamiliesOfMenu({
        fromUserId: input.user.id,
        rangeLabel: input.rangeLabel,
      })
    : 0;

  return { ok: true, publishedCount, notifiedCount };
}

/** Unpublish, for a menu released by mistake. The day falls back to the rotation. */
export async function unpublishLunchMenuDays(
  dateKeys: string[],
): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const serviceDates = dateKeys
    .map(fromLunchDateKey)
    .filter((date): date is Date => date !== null);

  if (serviceDates.length === 0) {
    return 0;
  }

  const result = await withDatabase((prisma) =>
    prisma.lunchMenuDay.updateMany({
      where: { serviceDate: { in: serviceDates } },
      data: { publishedAt: null, publishedById: null },
    }),
  );

  return result?.count ?? 0;
}

/**
 * One in-app message per parent with a linked student, pointing at the board.
 * Uses the same Command Center inbox as low-balance notices so families have a
 * single place to look.
 */
async function notifyFamiliesOfMenu(input: {
  fromUserId: string;
  rangeLabel: string;
}): Promise<number> {
  const links = await withDatabase((prisma) =>
    prisma.parentStudentLink.findMany({ select: { parentId: true } }),
  );

  const parentIds = [...new Set((links ?? []).map((link) => link.parentId))];
  if (parentIds.length === 0) {
    return 0;
  }

  const result = await sendSystemStudentMessages({
    fromUserId: input.fromUserId,
    toUserIds: parentIds,
    organizationId: null,
    title: `Lunch menu posted for ${input.rangeLabel}`,
    body: "The cafeteria menu is up. Choose hot lunch, the vegetarian option, a packed lunch, or not eating for each day. Orders for a day close at 9:00 AM that morning.",
    actions: [
      { label: "Choose lunches", href: "/lunch", actionType: "link" },
      { label: "View Later", actionType: "view_later" },
    ],
  });

  return result.count;
}

/** Every parent account with a linked student — used for the publish nudge. */
export async function countFamiliesToNotify(): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const links = await withDatabase((prisma) =>
    prisma.parentStudentLink.findMany({ select: { parentId: true } }),
  );

  return new Set((links ?? []).map((link) => link.parentId)).size;
}
