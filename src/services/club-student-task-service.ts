import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import type {
  ClubStudentTaskStatus,
  ClubStudentTaskView,
} from "@/lib/command-center";
import { CLUB_STUDENT_TASK_STATUS_LABELS } from "@/lib/command-center";
import {
  canAssignClubTasks,
  listActiveClubMemberIds,
} from "@/lib/command-center-permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export { CLUB_STUDENT_TASK_STATUS_LABELS };
export type { ClubStudentTaskStatus, ClubStudentTaskView };

function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "User"
  );
}

function mapTask(row: {
  id: string;
  organizationId: string;
  title: string;
  description: string | null;
  dueAt: Date | null;
  status: ClubStudentTaskStatus;
  assigneeId: string;
  createdAt: Date;
  organization: { slug: string; name: string };
  assignee: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  createdBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}): ClubStudentTaskView {
  const now = Date.now();
  const isPastDue = Boolean(
    row.dueAt &&
      row.dueAt.getTime() < now &&
      row.status !== "COMPLETED" &&
      row.status !== "SUBMITTED",
  );

  return {
    id: row.id,
    organizationId: row.organizationId,
    organizationSlug: row.organization.slug,
    organizationName: row.organization.name,
    title: row.title,
    description: row.description,
    dueAt: row.dueAt,
    status: row.status,
    assigneeId: row.assigneeId,
    assigneeName: displayName(row.assignee),
    createdByName: displayName(row.createdBy),
    createdAt: row.createdAt,
    isPastDue,
  };
}

export async function listTasksForStudent(
  userId: string,
): Promise<ClubStudentTaskView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubStudentTask.findMany({
      where: {
        assigneeId: userId,
        status: { not: "COMPLETED" },
      },
      include: {
        organization: { select: { slug: true, name: true } },
        assignee: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) =>
    mapTask({
      ...row,
      status: row.status as ClubStudentTaskStatus,
    }),
  );
}

export async function listTasksForClub(
  organizationId: string,
): Promise<ClubStudentTaskView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.clubStudentTask.findMany({
      where: { organizationId },
      include: {
        organization: { select: { slug: true, name: true } },
        assignee: {
          select: { displayName: true, firstName: true, lastName: true },
        },
        createdBy: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
      orderBy: [{ status: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    }),
  );

  if (!rows) {
    return [];
  }

  return rows.map((row) =>
    mapTask({
      ...row,
      status: row.status as ClubStudentTaskStatus,
    }),
  );
}

export async function assignClubTasks(input: {
  organizationId: string;
  title: string;
  description?: string | null;
  dueAt?: Date | null;
  assigneeIds: string[];
  createdById: string;
  role: CampusRole;
}): Promise<{ count: number; error?: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { count: 0, error: "Database unavailable." };
  }

  const allowed = await canAssignClubTasks(
    input.createdById,
    input.role,
    input.organizationId,
  );
  if (!allowed) {
    return {
      count: 0,
      error: "Only President, Vice President, or admin can assign tasks.",
    };
  }

  const members = new Set(await listActiveClubMemberIds(input.organizationId));
  const assignees = [...new Set(input.assigneeIds)].filter((id) =>
    members.has(id),
  );
  if (assignees.length === 0) {
    return { count: 0, error: "Select at least one club member." };
  }

  const created = await withDatabase((prisma) =>
    prisma.clubStudentTask.createMany({
      data: assignees.map((assigneeId) => ({
        organizationId: input.organizationId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        dueAt: input.dueAt ?? null,
        status: "NOT_STARTED" as const,
        assigneeId,
        createdById: input.createdById,
      })),
    }),
  );

  return { count: created?.count ?? 0 };
}

export async function updateClubTaskStatus(input: {
  taskId: string;
  userId: string;
  role: CampusRole;
  status: ClubStudentTaskStatus;
}): Promise<{ ok: boolean; error?: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { ok: false, error: "Database unavailable." };
  }

  const task = await withDatabase((prisma) =>
    prisma.clubStudentTask.findUnique({
      where: { id: input.taskId },
      select: { id: true, assigneeId: true, organizationId: true },
    }),
  );

  if (!task) {
    return { ok: false, error: "Task not found." };
  }

  const isAssignee = task.assigneeId === input.userId;
  const isManager = await canAssignClubTasks(
    input.userId,
    input.role,
    task.organizationId,
  );

  if (!isAssignee && !isManager) {
    return { ok: false, error: "You can only update your own tasks." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.clubStudentTask.updateMany({
      where: { id: input.taskId },
      data: { status: input.status },
    }),
  );

  return { ok: (updated?.count ?? 0) > 0 };
}

export async function deleteClubTask(input: {
  taskId: string;
  userId: string;
  role: CampusRole;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const task = await withDatabase((prisma) =>
    prisma.clubStudentTask.findUnique({
      where: { id: input.taskId },
      select: { organizationId: true },
    }),
  );
  if (!task) {
    return false;
  }

  const allowed = await canAssignClubTasks(
    input.userId,
    input.role,
    task.organizationId,
  );
  if (!allowed) {
    return false;
  }

  const deleted = await withDatabase((prisma) =>
    prisma.clubStudentTask.deleteMany({ where: { id: input.taskId } }),
  );
  return (deleted?.count ?? 0) > 0;
}
