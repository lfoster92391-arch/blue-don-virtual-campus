import {
  COLLEGE_READINESS_PASSPORT_ITEMS,
  getCollegeReadinessItemIds,
  type CollegeReadinessItemId,
} from "@/config/college-readiness-passport";
import type { CollegeReadinessStatus } from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type CollegeReadinessItemView = {
  id: CollegeReadinessItemId;
  label: string;
  description: string;
  resourceHref?: string;
  resourceLabel?: string;
  external?: boolean;
  status: CollegeReadinessStatus;
  completedAt: Date | null;
  notes: string | null;
};

export type CollegeReadinessPassportView = {
  items: CollegeReadinessItemView[];
  remainingItems: CollegeReadinessItemView[];
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
  percentComplete: number;
};

type ProgressRow = {
  itemId: string;
  status: CollegeReadinessStatus;
  completedAt: Date | null;
  notes: string | null;
};

const memoryStore = new Map<string, Map<string, ProgressRow>>();

function memoryKey(userId: string): string {
  return userId;
}

function getMemoryProgress(userId: string): Map<string, ProgressRow> {
  if (!memoryStore.has(memoryKey(userId))) {
    memoryStore.set(memoryKey(userId), new Map());
  }
  return memoryStore.get(memoryKey(userId))!;
}

async function loadProgressRows(userId: string): Promise<Map<string, ProgressRow>> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return getMemoryProgress(userId);
  }

  const rows = await withDatabase((prisma) =>
    prisma.collegeReadinessProgress.findMany({
      where: { userId },
      select: {
        itemId: true,
        status: true,
        completedAt: true,
        notes: true,
      },
    }),
  );

  const map = new Map<string, ProgressRow>();
  for (const row of rows ?? []) {
    map.set(row.itemId, {
      itemId: row.itemId,
      status: row.status,
      completedAt: row.completedAt,
      notes: row.notes,
    });
  }
  return map;
}

async function upsertProgressRow(
  userId: string,
  itemId: string,
  status: CollegeReadinessStatus,
  notes?: string | null,
): Promise<boolean> {
  const completedAt = status === "COMPLETE" ? new Date() : null;

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    const store = getMemoryProgress(userId);
    store.set(itemId, {
      itemId,
      status,
      completedAt,
      notes: notes ?? store.get(itemId)?.notes ?? null,
    });
    return true;
  }

  const result = await withDatabase((prisma) =>
    prisma.collegeReadinessProgress.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: {
        userId,
        itemId,
        status,
        completedAt,
        notes: notes ?? null,
      },
      update: {
        status,
        completedAt,
        ...(notes !== undefined ? { notes } : {}),
      },
    }),
  );

  return result !== null;
}

function buildItemViews(
  progressMap: Map<string, ProgressRow>,
  gradeLevel?: number | null,
): CollegeReadinessItemView[] {
  const itemIds = new Set(getCollegeReadinessItemIds(gradeLevel));

  return COLLEGE_READINESS_PASSPORT_ITEMS.filter((item) => itemIds.has(item.id)).map(
    (item) => {
      const progress = progressMap.get(item.id);
      return {
        id: item.id,
        label: item.label,
        description: item.description,
        resourceHref: item.resourceHref,
        resourceLabel: item.resourceLabel,
        external: item.external,
        status: progress?.status ?? "NOT_STARTED",
        completedAt: progress?.completedAt ?? null,
        notes: progress?.notes ?? null,
      };
    },
  );
}

export async function getPassport(
  userId: string,
  gradeLevel?: number | null,
): Promise<CollegeReadinessPassportView> {
  const progressMap = await loadProgressRows(userId);
  const items = buildItemViews(progressMap, gradeLevel);

  const completedCount = items.filter((item) => item.status === "COMPLETE").length;
  const inProgressCount = items.filter((item) => item.status === "IN_PROGRESS").length;
  const totalCount = items.length;
  const remainingItems = items.filter((item) => item.status !== "COMPLETE");

  return {
    items,
    remainingItems,
    completedCount,
    inProgressCount,
    totalCount,
    percentComplete:
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
  };
}

export async function updateItemStatus(
  userId: string,
  itemId: CollegeReadinessItemId,
  status: CollegeReadinessStatus,
  gradeLevel?: number | null,
): Promise<boolean> {
  const validIds = getCollegeReadinessItemIds(gradeLevel);
  if (!validIds.includes(itemId)) {
    return false;
  }

  return upsertProgressRow(userId, itemId, status);
}

/**
 * Optional heuristic: mark scholarships IN_PROGRESS when a student visits
 * the Scholarship Center. Wire from scholarships page when visit tracking lands.
 */
export async function maybeMarkScholarshipsInProgress(userId: string): Promise<void> {
  const progressMap = await loadProgressRows(userId);
  const current = progressMap.get("scholarships");

  if (current?.status === "COMPLETE" || current?.status === "IN_PROGRESS") {
    return;
  }

  await upsertProgressRow(userId, "scholarships", "IN_PROGRESS");
}
