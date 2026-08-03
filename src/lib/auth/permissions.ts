import {
  hasOrgRolePermission,
  hasPermission,
  normalizeOrgRole,
  type CampusRole,
  type OrgMembershipRole,
} from "@/config/roles";
import { withDatabase } from "@/lib/prisma";

export async function hasOrgPermission(
  userId: string,
  orgId: string,
  permission: string,
): Promise<boolean> {
  const membership = await withDatabase((prisma) =>
    prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
      select: {
        orgRole: true,
        status: true,
      },
    }),
  );

  if (!membership || membership.status !== "ACTIVE") {
    return false;
  }

  const orgRole = normalizeOrgRole(membership.orgRole);
  if (!orgRole) {
    return false;
  }

  return hasOrgRolePermission(orgRole, permission);
}

export async function getUserOrgMembership(
  userId: string,
  orgId: string,
): Promise<{ orgRole: OrgMembershipRole; status: string } | null> {
  const membership = await withDatabase((prisma) =>
    prisma.organizationMembership.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId,
        },
      },
      select: {
        orgRole: true,
        status: true,
      },
    }),
  );

  if (!membership) {
    return null;
  }

  const orgRole = normalizeOrgRole(membership.orgRole);
  if (!orgRole) {
    return null;
  }

  return { orgRole, status: membership.status };
}

export function requireGlobalPermission(role: CampusRole, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

export async function requireOrgPermission(
  userId: string,
  orgId: string,
  permission: string,
): Promise<void> {
  const allowed = await hasOrgPermission(userId, orgId, permission);
  if (!allowed) {
    throw new Error(`Missing org permission: ${permission}`);
  }
}
