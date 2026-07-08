import { isDatabaseConfigured } from "@/config/env";
import type { ChecklistStatus } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type ChecklistListItem = {
  id: string;
  title: string;
  description: string | null;
  status: ChecklistStatus;
  eventTitle: string | null;
  academyName: string | null;
  totalItems: number;
  completedItems: number;
};

export type ChecklistDetail = ChecklistListItem & {
  items: {
    id: string;
    title: string;
    description: string | null;
    required: boolean;
    completed: boolean;
    completedAt: Date | null;
  }[];
};

export async function listChecklistsForUser(
  userId: string,
): Promise<ChecklistListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const checklists = await withDatabase((prisma) =>
    prisma.checklist.findMany({
      where: { status: "ACTIVE", archiveFlag: false },
      include: {
        event: { select: { title: true } },
        academy: { select: { name: true } },
        items: {
          include: {
            completions: { where: { userId }, select: { completedAt: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  );

  if (!checklists) {
    return [];
  }

  return checklists.map((checklist) => ({
    id: checklist.id,
    title: checklist.title,
    description: checklist.description,
    status: checklist.status,
    eventTitle: checklist.event?.title ?? null,
    academyName: checklist.academy?.name ?? null,
    totalItems: checklist.items.length,
    completedItems: checklist.items.filter((item) => item.completions.length > 0)
      .length,
  }));
}

export async function getChecklistById(
  id: string,
  userId: string,
): Promise<ChecklistDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const checklist = await withDatabase((prisma) =>
    prisma.checklist.findUnique({
      where: { id },
      include: {
        event: { select: { title: true } },
        academy: { select: { name: true } },
        items: {
          include: {
            completions: { where: { userId } },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  );

  if (!checklist) {
    return null;
  }

  const completedItems = checklist.items.filter(
    (item) => item.completions.length > 0,
  ).length;

  return {
    id: checklist.id,
    title: checklist.title,
    description: checklist.description,
    status: checklist.status,
    eventTitle: checklist.event?.title ?? null,
    academyName: checklist.academy?.name ?? null,
    totalItems: checklist.items.length,
    completedItems,
    items: checklist.items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      required: item.required,
      completed: item.completions.length > 0,
      completedAt: item.completions[0]?.completedAt ?? null,
    })),
  };
}

export async function listChecklistsForEvent(eventId: string, userId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const checklists = await withDatabase((prisma) =>
    prisma.checklist.findMany({
      where: { eventId, status: "ACTIVE", archiveFlag: false },
      include: {
        items: {
          include: { completions: { where: { userId } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  );

  return checklists ?? [];
}

export async function toggleChecklistItem(
  itemId: string,
  userId: string,
  complete: boolean,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  if (complete) {
    const result = await withDatabase((prisma) =>
      prisma.checklistItemCompletion.upsert({
        where: { itemId_userId: { itemId, userId } },
        create: { itemId, userId },
        update: { completedAt: new Date() },
      }),
    );
    return result !== null;
  }

  const result = await withDatabase((prisma) =>
    prisma.checklistItemCompletion.deleteMany({
      where: { itemId, userId },
    }),
  );

  return result !== null;
}

export async function createEventChecklist(input: {
  eventId: string;
  academyId: string;
  title: string;
  items: string[];
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const checklist = await withDatabase((prisma) =>
    prisma.checklist.create({
      data: {
        title: input.title,
        eventId: input.eventId,
        academyId: input.academyId,
        status: "ACTIVE",
        items: {
          create: input.items.map((title, index) => ({
            title,
            sortOrder: index,
            required: true,
          })),
        },
      },
      select: { id: true },
    }),
  );

  return checklist?.id ?? null;
}
