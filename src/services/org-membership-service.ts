import type { OrgMembershipRole as PrismaOrgRole } from "@/generated/prisma/client";

import {
  FOCUS_CLUB_SLUGS,
  type FocusClubSlug,
} from "@/config/focused-clubs";
import {
  normalizeOrgRole,
  type OrgMembershipRole,
} from "@/config/roles";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { ensureFocusClubOrganization } from "@/services/focus-club-org-service";

export type FocusClubMembershipSummary = {
  organizationId: string;
  slug: FocusClubSlug;
  name: string;
  orgRole: OrgMembershipRole;
  status: string;
};

function toPrismaOrgRole(role: OrgMembershipRole): PrismaOrgRole {
  return role.toUpperCase() as PrismaOrgRole;
}

/** Active focus-club memberships for one user. */
export async function listUserFocusClubMemberships(
  userId: string,
): Promise<FocusClubMembershipSummary[]> {
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
      include: {
        organization: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { joinedAt: "desc" },
    }),
  );

  if (!rows) {
    return [];
  }

  const summaries: FocusClubMembershipSummary[] = [];
  for (const row of rows) {
    const slug = row.organization.slug;
    if (!(FOCUS_CLUB_SLUGS as readonly string[]).includes(slug)) {
      continue;
    }
    const orgRole = normalizeOrgRole(row.orgRole);
    if (!orgRole) {
      continue;
    }
    summaries.push({
      organizationId: row.organization.id,
      slug: slug as FocusClubSlug,
      name: row.organization.name,
      orgRole,
      status: row.status,
    });
  }
  return summaries;
}

/** Map of userId → active focus-club memberships (for admin account lists). */
export async function listFocusClubMembershipsByUserIds(
  userIds: string[],
): Promise<Record<string, FocusClubMembershipSummary[]>> {
  const empty: Record<string, FocusClubMembershipSummary[]> = {};
  if (
    userIds.length === 0 ||
    !isDatabaseConfigured() ||
    !isPrismaReady()
  ) {
    return empty;
  }

  const rows = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: {
        userId: { in: userIds },
        status: "ACTIVE",
        organization: { slug: { in: [...FOCUS_CLUB_SLUGS] } },
      },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
      },
      orderBy: { joinedAt: "desc" },
    }),
  );

  if (!rows) {
    return empty;
  }

  const byUser: Record<string, FocusClubMembershipSummary[]> = {};
  for (const row of rows) {
    const slug = row.organization.slug;
    if (!(FOCUS_CLUB_SLUGS as readonly string[]).includes(slug)) {
      continue;
    }
    const orgRole = normalizeOrgRole(row.orgRole);
    if (!orgRole) {
      continue;
    }
    const entry: FocusClubMembershipSummary = {
      organizationId: row.organization.id,
      slug: slug as FocusClubSlug,
      name: row.organization.name,
      orgRole,
      status: row.status,
    };
    if (!byUser[row.userId]) {
      byUser[row.userId] = [];
    }
    byUser[row.userId].push(entry);
  }
  return byUser;
}

export async function listActiveFocusClubSlugsForUser(
  userId: string,
): Promise<FocusClubSlug[]> {
  const memberships = await listUserFocusClubMemberships(userId);
  return memberships.map((m) => m.slug);
}

/**
 * Create or reactivate an ACTIVE membership in a focus club with the given org role.
 */
export async function assignFocusClubMembership(input: {
  userId: string;
  clubSlug: FocusClubSlug;
  orgRole: OrgMembershipRole;
}): Promise<FocusClubMembershipSummary | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const organization = await ensureFocusClubOrganization(input.clubSlug);
  if (!organization) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.organizationMembership.upsert({
      where: {
        organizationId_userId: {
          organizationId: organization.id,
          userId: input.userId,
        },
      },
      update: {
        status: "ACTIVE",
        orgRole: toPrismaOrgRole(input.orgRole),
        joinedAt: new Date(),
      },
      create: {
        organizationId: organization.id,
        userId: input.userId,
        status: "ACTIVE",
        orgRole: toPrismaOrgRole(input.orgRole),
        joinedAt: new Date(),
      },
      include: {
        organization: { select: { id: true, slug: true, name: true } },
      },
    }),
  );

  if (!row) {
    return null;
  }

  const orgRole = normalizeOrgRole(row.orgRole);
  if (!orgRole) {
    return null;
  }

  return {
    organizationId: row.organization.id,
    slug: input.clubSlug,
    name: row.organization.name,
    orgRole,
    status: row.status,
  };
}

/** Soft-remove: mark membership INACTIVE (keeps history, clears nav access). */
export async function removeFocusClubMembership(input: {
  userId: string;
  clubSlug: FocusClubSlug;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const organization = await ensureFocusClubOrganization(input.clubSlug);
  if (!organization) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.organizationMembership.updateMany({
      where: {
        organizationId: organization.id,
        userId: input.userId,
      },
      data: { status: "INACTIVE" },
    }),
  );

  return Boolean(result && result.count > 0);
}

export async function userHasActiveFocusClubMembership(
  userId: string,
  clubSlug: FocusClubSlug,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const row = await withDatabase((prisma) =>
    prisma.organizationMembership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        organization: { slug: clubSlug },
      },
      select: { id: true },
    }),
  );

  return Boolean(row);
}
