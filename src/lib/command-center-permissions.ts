import { isDatabaseConfigured } from "@/config/env";
import { FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import type { CampusRole, OrgMembershipRole } from "@/config/roles";
import {
  canManageAcademy,
  hasPermission,
  normalizeOrgRole,
  orgRoleCanAssignTasks,
  orgRoleCanSendMessages,
} from "@/config/roles";
import { getUserOrgMembership } from "@/lib/auth/permissions";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export async function isCampusAdminLike(role: CampusRole): Promise<boolean> {
  return hasPermission(role, "admin:access") || canManageAcademy(role);
}

export async function getActiveOrgRole(
  userId: string,
  organizationId: string,
): Promise<OrgMembershipRole | null> {
  const membership = await getUserOrgMembership(userId, organizationId);
  if (!membership || membership.status !== "ACTIVE") {
    return null;
  }
  return membership.orgRole;
}

/** Admins + President / VP / Secretary of the club. */
export async function canSendClubMessages(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (await isCampusAdminLike(role)) {
    return true;
  }
  const orgRole = await getActiveOrgRole(userId, organizationId);
  return orgRole ? orgRoleCanSendMessages(orgRole) : false;
}

/** Admins + President / VP — assign My Tasks. */
export async function canAssignClubTasks(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (await isCampusAdminLike(role)) {
    return true;
  }
  const orgRole = await getActiveOrgRole(userId, organizationId);
  return orgRole ? orgRoleCanAssignTasks(orgRole) : false;
}

/** Admins + President / VP — create club meetings (not Secretary). */
export async function canCreateClubMeetings(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  return canAssignClubTasks(userId, role, organizationId);
}

/**
 * Mandatory all-hands meetings: campus admin, or IT Club President / VP.
 */
export async function canCreateMandatoryAllMeeting(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (await isCampusAdminLike(role)) {
    return true;
  }

  if (!(await canCreateClubMeetings(userId, role, organizationId))) {
    return false;
  }

  const org = await withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { slug: true },
    }),
  );

  return org?.slug === "it-club";
}

/** Secretary (+ President/VP/admin) may request invoice/receipt documentation. */
export async function canRequestInvoiceReceipt(
  userId: string,
  role: CampusRole,
  organizationId: string,
): Promise<boolean> {
  if (await isCampusAdminLike(role)) {
    return true;
  }
  return canSendClubMessages(userId, role, organizationId);
}

export async function listActiveClubMemberIds(
  organizationId: string,
): Promise<string[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: { userId: true },
    }),
  );

  return rows?.map((r) => r.userId) ?? [];
}

export async function listActiveClubMembers(organizationId: string): Promise<
  {
    userId: string;
    displayName: string;
    orgRole: OrgMembershipRole;
  }[]
> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    }),
  );

  if (!rows) {
    return [];
  }

  return rows
    .map((row) => {
      const orgRole = normalizeOrgRole(row.orgRole);
      if (!orgRole) {
        return null;
      }
      const displayName =
        row.user.displayName?.trim() ||
        [row.user.firstName, row.user.lastName].filter(Boolean).join(" ") ||
        "Student";
      return { userId: row.user.id, displayName, orgRole };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);
}

export async function listUserFocusClubOrganizationIds(
  userId: string,
): Promise<string[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId,
        status: "ACTIVE",
        organization: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      },
      select: { organizationId: true },
    }),
  );

  return rows?.map((r) => r.organizationId) ?? [];
}
