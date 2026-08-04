import type { OrganizationType } from "@/generated/prisma/client";
import type { OrganizationCategory } from "@/config/madonna-organizations";
import {
  ORGANIZATION_CATEGORY_META,
  STUDENT_LIFE_CATEGORY_ORDER,
} from "@/config/madonna-organizations";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, prisma, withDatabase } from "@/lib/prisma";

export type OrganizationListItem = {
  id: string;
  slug: string;
  name: string;
  type: OrganizationType;
  category: string | null;
  description: string | null;
  sortOrder: number;
  academy: { slug: string; name: string } | null;
};

export type OrganizationGroup = {
  category: OrganizationCategory;
  label: string;
  emoji: string;
  description: string;
  organizations: OrganizationListItem[];
};

export async function listOrganizations(
  options?: { categories?: OrganizationCategory[] },
): Promise<OrganizationListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  // Hide academy bridge duplicates from the public directory (shown via academies nav).
  const rows = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: {
        slug: { not: { startsWith: "academy-" } },
        ...(options?.categories ? { category: { in: options.categories } } : {}),
      },
      include: {
        academy: { select: { slug: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  );

  return rows ?? [];
}

export async function listOrganizationGroups(
  categoryOrder: OrganizationCategory[] = STUDENT_LIFE_CATEGORY_ORDER,
): Promise<OrganizationGroup[]> {
  const organizations = await listOrganizations();

  return categoryOrder
    .map((category) => {
      const meta = ORGANIZATION_CATEGORY_META[category];
      const items = organizations.filter((org) => org.category === category);

      if (items.length === 0) {
        return null;
      }

      return {
        category,
        label: meta.label,
        emoji: meta.emoji,
        description: meta.description,
        organizations: items,
      };
    })
    .filter((group): group is OrganizationGroup => group !== null);
}

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
      academy: { select: { id: true, slug: true, name: true } },
      memberships: {
        where: { status: "ACTIVE" },
        take: 50,
      },
    },
  });
}

export async function listUserOrganizationMemberships(userId: string) {
  return prisma.organizationMembership.findMany({
    where: {
      userId,
      status: "ACTIVE",
    },
    include: {
      organization: true,
    },
    orderBy: { joinedAt: "desc" },
  });
}

export async function listLedOrganizations(userId: string) {
  return prisma.organizationMembership.findMany({
    where: {
      userId,
      status: "ACTIVE",
      orgRole: { in: ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"] },
    },
    include: {
      organization: true,
    },
  });
}

export async function ensureOrganization(input: {
  slug: string;
  name: string;
  type: OrganizationType;
  description?: string;
  academyId?: string;
}) {
  return prisma.organization.upsert({
    where: { slug: input.slug },
    update: {
      name: input.name,
      description: input.description,
      type: input.type,
      academyId: input.academyId,
    },
    create: {
      slug: input.slug,
      name: input.name,
      type: input.type,
      description: input.description,
      academyId: input.academyId,
    },
  });
}
