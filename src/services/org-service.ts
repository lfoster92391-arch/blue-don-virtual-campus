import type { OrganizationType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function getOrganizationBySlug(slug: string) {
  return prisma.organization.findUnique({
    where: { slug },
    include: {
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
      orgRole: { in: ["LEAD", "OFFICER"] },
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
