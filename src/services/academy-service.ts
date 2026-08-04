import { canManageAcademy, type CampusRole } from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import {
  CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
  getClubCommitmentContextKey,
} from "@/config/club-commitment";
import type { AcademyMembershipStatus } from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type PendingMembershipView = {
  id: string;
  userId: string;
  academyId: string;
  status: AcademyMembershipStatus;
  createdAt: Date;
  user: { id: string; displayName: string | null; email: string };
  academy: { id: string; name: string; slug: string };
  organizationSlug: string | null;
  commitmentSignature: string | null;
  commitmentSignedAt: Date | null;
  parentApproved: boolean | null;
};

export type AcademyJoinPipelineStatus = {
  membershipStatus: AcademyMembershipStatus | null;
  stage: "none" | "waiting_parent" | "advisor_review" | "active" | "declined";
  stageLabel: string;
  detail: string;
  failedStep?: "parent" | "advisor";
};

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

export async function setMembershipStatusByUserAcademy(
  userId: string,
  academyId: string,
  status: AcademyMembershipStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.academyMembership.updateMany({
      where: { userId, academyId },
      data: {
        status,
        joinedAt: status === "ACTIVE" ? new Date() : undefined,
      },
    }),
  );

  return Boolean(result && result.count > 0);
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

async function enrichPendingMemberships(
  rows: Array<{
    id: string;
    userId: string;
    academyId: string;
    status: AcademyMembershipStatus;
    createdAt: Date;
    user: { id: string; displayName: string | null; email: string };
    academy: { id: string; name: string; slug: string };
  }>,
): Promise<PendingMembershipView[]> {
  if (rows.length === 0) {
    return [];
  }

  const academyIds = [...new Set(rows.map((row) => row.academyId))];
  const orgsByAcademy = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: { academyId: { in: academyIds } },
      select: { academyId: true, slug: true },
    }),
  );
  const orgSlugByAcademyId = new Map(
    (orgsByAcademy ?? []).map((org) => [org.academyId, org.slug]),
  );

  const commitments = await withDatabase((prisma) =>
    prisma.formSubmission.findMany({
      where: {
        formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
        userId: { in: rows.map((row) => row.userId) },
      },
      select: {
        userId: true,
        contextKey: true,
        signatureName: true,
        submittedAt: true,
        parentApproved: true,
      },
    }),
  );

  return rows.map((row) => {
    const commitment = commitments?.find(
      (entry) =>
        entry.userId === row.userId &&
        entry.contextKey === getClubCommitmentContextKey(row.academyId),
    );

    return {
      ...row,
      organizationSlug: orgSlugByAcademyId.get(row.academyId) ?? null,
      commitmentSignature: commitment?.signatureName ?? null,
      commitmentSignedAt: commitment?.submittedAt ?? null,
      parentApproved: commitment?.parentApproved ?? null,
    };
  });
}

export async function listPendingMemberships(
  academyId?: string,
): Promise<PendingMembershipView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.academyMembership.findMany({
      where: {
        status: "PENDING",
        ...(academyId ? { academyId } : {}),
      },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        academy: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  );

  if (!rows) {
    return [];
  }

  return enrichPendingMemberships(rows);
}

/** Whether the user may approve or reject join requests for an academy. */
export async function canReviewAcademyMembership(
  userId: string,
  role: CampusRole,
  academyId: string,
): Promise<boolean> {
  if (canManageAcademy(role)) {
    return true;
  }

  const org = await withDatabase((prisma) =>
    prisma.organization.findFirst({
      where: { academyId },
      select: { id: true },
    }),
  );

  if (!org) {
    return false;
  }

  return hasOrgPermission(userId, org.id, "org:members:manage");
}

/** Pending join requests across academies linked to orgs the user leads or officers. */
export async function listPendingMembershipsForLedOrgs(
  userId: string,
  role: CampusRole,
): Promise<PendingMembershipView[]> {
  if (canManageAcademy(role)) {
    return listPendingMemberships();
  }

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const ledOrgs = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        orgRole: { in: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"] },
      },
      include: {
        organization: { select: { academyId: true } },
      },
    }),
  );

  const academyIds = (ledOrgs ?? [])
    .map((membership) => membership.organization.academyId)
    .filter((id): id is string => Boolean(id));

  if (academyIds.length === 0) {
    return [];
  }

  const permittedAcademyIds: string[] = [];
  for (const academyId of academyIds) {
    const org = ledOrgs?.find(
      (membership) => membership.organization.academyId === academyId,
    );
    if (
      org &&
      (await hasOrgPermission(userId, org.organizationId, "org:members:manage"))
    ) {
      permittedAcademyIds.push(academyId);
    }
  }

  if (permittedAcademyIds.length === 0) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.academyMembership.findMany({
      where: {
        status: "PENDING",
        academyId: { in: permittedAcademyIds },
      },
      include: {
        user: { select: { id: true, displayName: true, email: true } },
        academy: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  );

  if (!rows) {
    return [];
  }

  return enrichPendingMemberships(rows);
}

/** Student-facing pipeline for a single academy join request. */
export async function getAcademyJoinPipelineStatus(
  userId: string,
  academyId: string,
): Promise<AcademyJoinPipelineStatus> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      membershipStatus: null,
      stage: "none",
      stageLabel: "Not applied",
      detail: "Sign the club commitment to request membership.",
    };
  }

  const result = await withDatabase(async (prisma) => {
    const membership = await prisma.academyMembership.findUnique({
      where: { userId_academyId: { userId, academyId } },
      select: { status: true },
    });

    const commitment = await prisma.formSubmission.findUnique({
      where: {
        formId_userId_contextKey: {
          formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
          userId,
          contextKey: getClubCommitmentContextKey(academyId),
        },
      },
      select: { parentApproved: true, signed: true },
    });

    return { membership, commitment };
  });

  const membershipStatus = result?.membership?.status ?? null;
  const parentApproved = result?.commitment?.parentApproved;

  if (membershipStatus === "ACTIVE") {
    return {
      membershipStatus,
      stage: "active",
      stageLabel: "Approved",
      detail: "You are an active member of this club or academy.",
    };
  }

  if (
    membershipStatus === "REJECTED" ||
    parentApproved === false
  ) {
    return {
      membershipStatus,
      stage: "declined",
      stageLabel: "Declined",
      failedStep: parentApproved === false ? "parent" : "advisor",
      detail:
        parentApproved === false
          ? "A parent declined this request. You can submit a new request after talking with your family."
          : "An advisor declined this request. You can submit a new request if you still want to join.",
    };
  }

  if (membershipStatus === "PENDING") {
    if (parentApproved === null) {
      return {
        membershipStatus,
        stage: "waiting_parent",
        stageLabel: "Waiting for parent",
        detail:
          "Your commitment is signed. A linked parent must approve before an advisor can review your request.",
      };
    }

    return {
      membershipStatus,
      stage: "advisor_review",
      stageLabel: "Pending advisor review",
      detail:
        "Your request is in the advisor queue. You will see Member on this page once approved.",
    };
  }

  if (result?.commitment?.signed) {
    return {
      membershipStatus,
      stage: "advisor_review",
      stageLabel: "Request submitted",
      detail: "Your commitment is on file. Advisor review is the next step.",
    };
  }

  return {
    membershipStatus,
    stage: "none",
    stageLabel: "Not applied",
    detail: "Sign the club membership commitment to request to join.",
  };
}

/**
 * Parent-approval state of the club commitment tied to a pending membership.
 * Returns "not_required" when no parent approval step applies.
 */
export async function getMembershipCommitmentApproval(
  membershipId: string,
): Promise<"approved" | "pending" | "declined" | "not_required"> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return "not_required";
  }

  const result = await withDatabase(async (prisma) => {
    const membership = await prisma.academyMembership.findUnique({
      where: { id: membershipId },
      select: { userId: true, academyId: true },
    });

    if (!membership) {
      return "not_required" as const;
    }

    const commitment = await prisma.formSubmission.findUnique({
      where: {
        formId_userId_contextKey: {
          formId: CLUB_MEMBERSHIP_COMMITMENT_FORM_ID,
          userId: membership.userId,
          contextKey: getClubCommitmentContextKey(membership.academyId),
        },
      },
      select: { parentApproved: true },
    });

    if (!commitment || commitment.parentApproved === undefined) {
      return "not_required" as const;
    }
    if (commitment.parentApproved === null) {
      return "pending" as const;
    }
    return commitment.parentApproved ? ("approved" as const) : ("declined" as const);
  });

  return result ?? "not_required";
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
