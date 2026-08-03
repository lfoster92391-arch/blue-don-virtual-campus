import { hasPermission, type CampusRole } from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import { withDatabase } from "@/lib/prisma";
import { mapCampusUser } from "@/services/user-service";

export type LinkedStudent = {
  id: string;
  displayName: string;
  email: string;
  relationship: string | null;
};

export async function listLinkedStudents(
  parentId: string,
): Promise<LinkedStudent[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const links = await withDatabase((prisma) =>
    prisma.parentStudentLink.findMany({
      where: { parentId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  );

  if (!links) {
    return [];
  }

  return links.map((link) => ({
    id: link.student.id,
    displayName:
      link.student.displayName ??
      [link.student.firstName, link.student.lastName].filter(Boolean).join(" ") ??
      link.student.email,
    email: link.student.email,
    relationship: link.relationship,
  }));
}

export async function linkParentToStudent(input: {
  parentId: string;
  studentId: string;
  relationship?: string;
}): Promise<LinkedStudent | null> {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const link = await withDatabase((prisma) =>
    prisma.parentStudentLink.upsert({
      where: {
        parentId_studentId: {
          parentId: input.parentId,
          studentId: input.studentId,
        },
      },
      update: {
        relationship: input.relationship?.trim() || undefined,
      },
      create: {
        parentId: input.parentId,
        studentId: input.studentId,
        relationship: input.relationship?.trim() || null,
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  );

  if (!link) {
    return null;
  }

  return {
    id: link.student.id,
    displayName:
      link.student.displayName ??
      [link.student.firstName, link.student.lastName].filter(Boolean).join(" ") ??
      link.student.email,
    relationship: link.relationship,
    email: link.student.email,
  };
}

export async function unlinkParentFromStudent(
  parentId: string,
  studentId: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.parentStudentLink.deleteMany({
      where: { parentId, studentId },
    }),
  );

  return Boolean(result && result.count > 0);
}

export type PendingParent = {
  id: string;
  email: string;
  displayName: string;
  relationshipNote: string | null;
  createdAt: Date;
};

export async function listPendingParents(): Promise<PendingParent[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const parents = await withDatabase((prisma) =>
    prisma.user.findMany({
      where: { role: "PARENT", status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
        relationshipNote: true,
        createdAt: true,
      },
    }),
  );

  if (!parents) {
    return [];
  }

  return parents.map((parent) => ({
    id: parent.id,
    email: parent.email,
    displayName:
      parent.displayName ??
      [parent.firstName, parent.lastName].filter(Boolean).join(" ") ??
      parent.email,
    relationshipNote: parent.relationshipNote,
    createdAt: parent.createdAt,
  }));
}

export async function listStudentOptions(): Promise<
  Array<{ id: string; displayName: string; email: string }>
> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const students = await withDatabase((prisma) =>
    prisma.user.findMany({
      where: { role: "STUDENT", status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        email: true,
        displayName: true,
        firstName: true,
        lastName: true,
      },
    }),
  );

  if (!students) {
    return [];
  }

  return students.map((student) => ({
    id: student.id,
    displayName:
      student.displayName ??
      [student.firstName, student.lastName].filter(Boolean).join(" ") ??
      student.email,
    email: student.email,
  }));
}

export async function parentHasLinkedStudents(parentId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const count = await withDatabase((prisma) =>
    prisma.parentStudentLink.count({ where: { parentId } }),
  );

  return (count ?? 0) > 0;
}

export async function studentHasLinkedParent(studentId: string): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const count = await withDatabase((prisma) =>
    prisma.parentStudentLink.count({ where: { studentId } }),
  );

  return (count ?? 0) > 0;
}

export async function isParentLinkedToStudent(
  parentId: string,
  studentId: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) {
    return false;
  }

  const count = await withDatabase((prisma) =>
    prisma.parentStudentLink.count({ where: { parentId, studentId } }),
  );

  return (count ?? 0) > 0;
}

export async function getParentCampusUser(parentId: string) {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.findUnique({ where: { id: parentId } }),
  );

  return user ? mapCampusUser(user) : null;
}

export function parentNeedsStudentLink(role: CampusRole): boolean {
  return role === "parent";
}

/** Parent portal and parent-only forms — role=parent or any user with linked students. */
export function canAccessParentPortal(
  role: CampusRole,
  hasLinkedStudents: boolean,
): boolean {
  return hasPermission(role, "parent:portal") || hasLinkedStudents;
}

export async function userCanAccessParentPortal(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  if (hasPermission(role, "parent:portal")) {
    return true;
  }
  return parentHasLinkedStudents(userId);
}
