import { getOrganizationProfile } from "@/config/organization-profiles";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type StudentOrgLink = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  href: string;
  role: string;
};

export type StudentContext = {
  clubs: StudentOrgLink[];
  teams: StudentOrgLink[];
  classes: StudentOrgLink[];
};

const EMPTY_CONTEXT: StudentContext = { clubs: [], teams: [], classes: [] };

/**
 * Resolves every community a student belongs to, grouped for the
 * "MY CLUBS / MY TEAMS / MY CLASS" navigation and dashboard shortcuts.
 */
export async function getStudentContext(userId: string): Promise<StudentContext> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return EMPTY_CONTEXT;
  }

  const memberships = await withDatabase((prisma) =>
    prisma.organizationMembership.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        organization: {
          select: { id: true, slug: true, name: true, type: true },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
  );

  if (!memberships) {
    return EMPTY_CONTEXT;
  }

  const context: StudentContext = { clubs: [], teams: [], classes: [] };

  for (const membership of memberships) {
    const org = membership.organization;

    if (org.slug.startsWith("academy-")) {
      continue;
    }

    const link: StudentOrgLink = {
      id: org.id,
      slug: org.slug,
      name: org.name,
      icon: getOrganizationProfile(org.slug, { name: org.name, description: "" }).icon,
      href: `/organizations/${org.slug}`,
      role: membership.orgRole,
    };

    if (org.type === "TEAM") {
      context.teams.push(link);
    } else if (org.type === "CLASS") {
      context.classes.push(link);
    } else if (org.type === "CLUB") {
      context.clubs.push(link);
    }
  }

  return context;
}
