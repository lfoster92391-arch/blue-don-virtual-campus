import { isDatabaseConfigured } from "@/config/env";
import type { AssignmentStatus } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { formatRelativeDue } from "@/lib/calendar/utils";

export type AssignmentListItem = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date;
  dueLabel: string;
  status: AssignmentStatus;
  points: number;
  completion: number | null;
  academyName: string | null;
  eventTitle: string | null;
  eventId: string | null;
};

export async function listAssignmentsForUser(
  userId: string,
  options?: { limit?: number; includeUnassigned?: boolean },
): Promise<AssignmentListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const assignments = await withDatabase((prisma) =>
    prisma.assignment.findMany({
      where: {
        OR: [
          { userId },
          ...(options?.includeUnassigned ? [{ userId: null }] : []),
        ],
        status: { not: "COMPLETED" },
      },
      include: {
        academy: { select: { name: true } },
        event: { select: { id: true, title: true } },
      },
      orderBy: { dueDate: "asc" },
      take: options?.limit,
    }),
  );

  if (!assignments) {
    return [];
  }

  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    dueLabel: formatRelativeDue(assignment.dueDate),
    status: assignment.status,
    points: assignment.points,
    completion: assignment.completion,
    academyName: assignment.academy?.name ?? null,
    eventTitle: assignment.event?.title ?? null,
    eventId: assignment.event?.id ?? null,
  }));
}

export async function countDueThisWeek(userId: string): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  const count = await withDatabase((prisma) =>
    prisma.assignment.count({
      where: {
        OR: [{ userId }, { userId: null }],
        dueDate: { gte: now, lte: weekEnd },
        status: { notIn: ["COMPLETED", "SUBMITTED"] },
      },
    }),
  );

  return count ?? 0;
}

export async function getAssignmentById(id: string, userId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return withDatabase((prisma) =>
    prisma.assignment.findFirst({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
      include: {
        academy: { select: { name: true, slug: true } },
        event: { select: { id: true, title: true } },
      },
    }),
  );
}

export async function updateAssignmentStatus(
  id: string,
  userId: string,
  status: AssignmentStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.assignment.updateMany({
      where: {
        id,
        OR: [{ userId }, { userId: null }],
      },
      data: {
        status,
        userId,
        completion:
          status === "COMPLETED" ? 100 : status === "SUBMITTED" ? 100 : undefined,
      },
    }),
  );

  return (result?.count ?? 0) > 0;
}

export async function claimAssignment(id: string, userId: string): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.assignment.updateMany({
      where: { id, userId: null },
      data: { userId, status: "IN_PROGRESS" },
    }),
  );

  return (result?.count ?? 0) > 0;
}
