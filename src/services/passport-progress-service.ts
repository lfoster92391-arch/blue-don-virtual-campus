import type { PassportType } from "@/generated/prisma/client";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type PassportItemProgress = {
  id: string;
  completed: boolean;
};

export type PassportDashboard = {
  passportType: PassportType;
  items: PassportItemProgress[];
  completedCount: number;
  totalCount: number;
  percentComplete: number;
};

type CompletedItemsMap = Record<string, boolean>;

const memoryStore = new Map<string, CompletedItemsMap>();

function memoryKey(userId: string, passportType: PassportType): string {
  return `${userId}:${passportType}`;
}

async function loadCompletedItems(
  userId: string,
  passportType: PassportType,
): Promise<CompletedItemsMap> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return memoryStore.get(memoryKey(userId, passportType)) ?? {};
  }

  const row = await withDatabase((prisma) =>
    prisma.passportProgress.findUnique({
      where: { userId_passportType: { userId, passportType } },
      select: { completedItems: true },
    }),
  );

  if (!row?.completedItems || typeof row.completedItems !== "object") {
    return {};
  }

  return row.completedItems as CompletedItemsMap;
}

async function saveCompletedItems(
  userId: string,
  passportType: PassportType,
  completedItems: CompletedItemsMap,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    memoryStore.set(memoryKey(userId, passportType), completedItems);
    return true;
  }

  const result = await withDatabase((prisma) =>
    prisma.passportProgress.upsert({
      where: { userId_passportType: { userId, passportType } },
      create: { userId, passportType, completedItems },
      update: { completedItems },
    }),
  );

  return result !== null;
}

export async function getPassportDashboard(
  userId: string,
  passportType: PassportType,
  itemIds: string[],
): Promise<PassportDashboard> {
  const completedItems = await loadCompletedItems(userId, passportType);
  const items = itemIds.map((id) => ({
    id,
    completed: completedItems[id] === true,
  }));
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;

  return {
    passportType,
    items,
    completedCount,
    totalCount,
    percentComplete:
      totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
  };
}

export async function togglePassportItem(
  userId: string,
  passportType: PassportType,
  itemId: string,
  completed: boolean,
  validItemIds: string[],
): Promise<boolean> {
  if (!validItemIds.includes(itemId)) {
    return false;
  }

  const completedItems = await loadCompletedItems(userId, passportType);
  if (completed) {
    completedItems[itemId] = true;
  } else {
    delete completedItems[itemId];
  }

  return saveCompletedItems(userId, passportType, completedItems);
}
