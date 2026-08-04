import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy, hasPermission } from "@/config/roles";
import type { ClubProjectStatus } from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import type {
  ClubChecklistView,
  ClubProjectView,
} from "@/lib/club-workspace-types";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type {
  ClubChecklistItemView,
  ClubChecklistView,
  ClubProjectView,
} from "@/lib/club-workspace-types";
export { CLUB_PROJECT_STATUS_LABELS } from "@/lib/club-workspace-types";

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
} | null): string | null {
  if (!user) {
    return null;
  }
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "User"
  );
}

export async function canManageClubProjects(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:projects:manage");
}

export async function canCompleteClubChecklistItems(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (hasPermission(role, "admin:access") || canManageAcademy(role)) {
    return true;
  }
  return hasOrgPermission(userId, organizationId, "org:view");
}

export async function listClubProjects(
  organizationId: string,
): Promise<ClubProjectView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubProject.findMany({
      where: { organizationId },
      include: {
        owner: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    description: row.description,
    status: row.status,
    ownerUserId: row.ownerUserId,
    ownerName: displayName(row.owner),
    createdByName: displayName(row.createdBy) ?? "User",
    updatedAt: row.updatedAt,
  }));
}

export async function listClubChecklists(
  organizationId: string,
): Promise<ClubChecklistView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubProjectChecklist.findMany({
      where: { organizationId },
      include: {
        project: { select: { title: true } },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            doneBy: {
              select: { displayName: true, firstName: true, lastName: true },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) => ({
    id: row.id,
    organizationId: row.organizationId,
    projectId: row.projectId,
    projectTitle: row.project?.title ?? null,
    title: row.title,
    createdByName: displayName(row.createdBy) ?? "User",
    updatedAt: row.updatedAt,
    items: row.items.map((item) => ({
      id: item.id,
      title: item.title,
      done: item.done,
      doneByName: displayName(item.doneBy),
      doneAt: item.doneAt,
      sortOrder: item.sortOrder,
    })),
  }));
}

export async function createClubProject(input: {
  organizationId: string;
  title: string;
  description?: string | null;
  status?: ClubProjectStatus;
  ownerUserId?: string | null;
  userId: string;
}): Promise<ClubProjectView | null> {
  const row = await withDatabase((prisma) =>
    prisma.clubProject.create({
      data: {
        organizationId: input.organizationId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        status: input.status ?? "PLANNING",
        ownerUserId: input.ownerUserId || null,
        createdById: input.userId,
      },
      include: {
        owner: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    }),
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    description: row.description,
    status: row.status,
    ownerUserId: row.ownerUserId,
    ownerName: displayName(row.owner),
    createdByName: displayName(row.createdBy) ?? "User",
    updatedAt: row.updatedAt,
  };
}

export async function updateClubProject(input: {
  projectId: string;
  organizationId: string;
  title: string;
  description?: string | null;
  status: ClubProjectStatus;
  ownerUserId?: string | null;
}): Promise<boolean> {
  const result = await withDatabase((prisma) =>
    prisma.clubProject.updateMany({
      where: { id: input.projectId, organizationId: input.organizationId },
      data: {
        title: input.title.trim(),
        description: input.description?.trim() || null,
        status: input.status,
        ownerUserId: input.ownerUserId || null,
      },
    }),
  );
  return Boolean(result && result.count > 0);
}

export async function deleteClubProject(input: {
  projectId: string;
  organizationId: string;
}): Promise<boolean> {
  const result = await withDatabase((prisma) =>
    prisma.clubProject.deleteMany({
      where: { id: input.projectId, organizationId: input.organizationId },
    }),
  );
  return Boolean(result && result.count > 0);
}

export async function createClubChecklist(input: {
  organizationId: string;
  title: string;
  projectId?: string | null;
  userId: string;
  itemTitles?: string[];
}): Promise<ClubChecklistView | null> {
  const row = await withDatabase((prisma) =>
    prisma.clubProjectChecklist.create({
      data: {
        organizationId: input.organizationId,
        title: input.title.trim(),
        projectId: input.projectId || null,
        createdById: input.userId,
        items: {
          create: (input.itemTitles ?? [])
            .map((t) => t.trim())
            .filter(Boolean)
            .map((title, index) => ({
              title,
              sortOrder: index,
            })),
        },
      },
      include: {
        project: { select: { title: true } },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        items: {
          include: {
            doneBy: {
              select: { displayName: true, firstName: true, lastName: true },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    organizationId: row.organizationId,
    projectId: row.projectId,
    projectTitle: row.project?.title ?? null,
    title: row.title,
    createdByName: displayName(row.createdBy) ?? "User",
    updatedAt: row.updatedAt,
    items: row.items.map((item) => ({
      id: item.id,
      title: item.title,
      done: item.done,
      doneByName: displayName(item.doneBy),
      doneAt: item.doneAt,
      sortOrder: item.sortOrder,
    })),
  };
}

export async function addClubChecklistItem(input: {
  checklistId: string;
  organizationId: string;
  title: string;
}): Promise<boolean> {
  const checklist = await withDatabase((prisma) =>
    prisma.clubProjectChecklist.findFirst({
      where: { id: input.checklistId, organizationId: input.organizationId },
      select: { id: true, items: { select: { sortOrder: true } } },
    }),
  );
  if (!checklist) {
    return false;
  }

  const nextOrder =
    checklist.items.reduce((max, item) => Math.max(max, item.sortOrder), -1) +
    1;

  const created = await withDatabase((prisma) =>
    prisma.clubProjectChecklistItem.create({
      data: {
        checklistId: input.checklistId,
        title: input.title.trim(),
        sortOrder: nextOrder,
      },
    }),
  );

  return Boolean(created);
}

export async function setClubChecklistItemDone(input: {
  itemId: string;
  organizationId: string;
  done: boolean;
  userId: string;
}): Promise<boolean> {
  const item = await withDatabase((prisma) =>
    prisma.clubProjectChecklistItem.findFirst({
      where: {
        id: input.itemId,
        checklist: { organizationId: input.organizationId },
      },
      select: { id: true },
    }),
  );
  if (!item) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.clubProjectChecklistItem.update({
      where: { id: input.itemId },
      data: input.done
        ? { done: true, doneById: input.userId, doneAt: new Date() }
        : { done: false, doneById: null, doneAt: null },
    }),
  );

  return Boolean(result);
}

export async function deleteClubChecklist(input: {
  checklistId: string;
  organizationId: string;
}): Promise<boolean> {
  const result = await withDatabase((prisma) =>
    prisma.clubProjectChecklist.deleteMany({
      where: { id: input.checklistId, organizationId: input.organizationId },
    }),
  );
  return Boolean(result && result.count > 0);
}
