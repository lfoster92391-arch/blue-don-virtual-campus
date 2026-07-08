import { isDatabaseConfigured } from "@/config/env";
import type { AcademyMembershipStatus } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type AcademyWithMembership = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  memberCount: number;
  eventCount: number;
  membership: {
    id: string;
    status: AcademyMembershipStatus;
    joinedAt: Date | null;
  } | null;
};

export type AcademyDetail = AcademyWithMembership & {
  recentEvents: {
    id: string;
    title: string;
    startDate: Date;
    status: string;
  }[];
  openAssignments: number;
};

export async function listAcademiesForUser(
  userId: string,
): Promise<AcademyWithMembership[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const academies = await withDatabase((prisma) =>
    prisma.academy.findMany({
      include: {
        memberships: { where: { userId } },
        _count: { select: { memberships: { where: { status: "ACTIVE" } }, events: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  );

  if (!academies) {
    return [];
  }

  return academies.map((academy) => ({
    id: academy.id,
    slug: academy.slug,
    name: academy.name,
    description: academy.description,
    color: academy.color,
    icon: academy.icon,
    memberCount: academy._count.memberships,
    eventCount: academy._count.events,
    membership: academy.memberships[0]
      ? {
          id: academy.memberships[0].id,
          status: academy.memberships[0].status,
          joinedAt: academy.memberships[0].joinedAt,
        }
      : null,
  }));
}

export async function getAcademyBySlug(
  slug: string,
  userId: string,
): Promise<AcademyDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const academy = await withDatabase((prisma) =>
    prisma.academy.findUnique({
      where: { slug },
      include: {
        memberships: { where: { userId } },
        _count: {
          select: {
            memberships: { where: { status: "ACTIVE" } },
            events: { where: { archiveFlag: false } },
            assignments: { where: { status: { not: "COMPLETED" } } },
          },
        },
        events: {
          where: { archiveFlag: false },
          orderBy: { startDate: "asc" },
          take: 5,
          select: { id: true, title: true, startDate: true, status: true },
        },
      },
    }),
  );

  if (!academy) {
    return null;
  }

  return {
    id: academy.id,
    slug: academy.slug,
    name: academy.name,
    description: academy.description,
    color: academy.color,
    icon: academy.icon,
    memberCount: academy._count.memberships,
    eventCount: academy._count.events,
    openAssignments: academy._count.assignments,
    membership: academy.memberships[0]
      ? {
          id: academy.memberships[0].id,
          status: academy.memberships[0].status,
          joinedAt: academy.memberships[0].joinedAt,
        }
      : null,
    recentEvents: academy.events,
  };
}

export async function requestAcademyMembership(
  userId: string,
  academyId: string,
): Promise<{ id: string; status: AcademyMembershipStatus } | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return withDatabase(async (prisma) => {
    const existing = await prisma.academyMembership.findUnique({
      where: { userId_academyId: { userId, academyId } },
    });

    if (existing) {
      if (existing.status === "INACTIVE" || existing.status === "REJECTED") {
        return prisma.academyMembership.update({
          where: { id: existing.id },
          data: { status: "PENDING" },
          select: { id: true, status: true },
        });
      }
      return { id: existing.id, status: existing.status };
    }

    return prisma.academyMembership.create({
      data: { userId, academyId, status: "PENDING" },
      select: { id: true, status: true },
    });
  });
}

export async function updateMembershipStatus(
  membershipId: string,
  status: AcademyMembershipStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.academyMembership.update({
      where: { id: membershipId },
      data: {
        status,
        joinedAt: status === "ACTIVE" ? new Date() : undefined,
      },
    }),
  );

  return result !== null;
}

export async function listPendingMemberships() {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.academyMembership.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        academy: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  );

  return rows ?? [];
}

export async function countActiveMemberships(userId: string): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const count = await withDatabase((prisma) =>
    prisma.academyMembership.count({
      where: { userId, status: "ACTIVE" },
    }),
  );

  return count ?? 0;
}
