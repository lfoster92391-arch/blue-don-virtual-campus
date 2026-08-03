import { isDatabaseConfigured } from "@/config/env";
import {
  COMMUNITY_CATEGORY_META,
  COMMUNITY_CATEGORY_ORDER,
} from "@/config/partners";
import type {
  BusinessCategory,
  CommunityCategory,
  PartnerOpportunityStatus,
  PartnerOpportunityType,
  PartnerStatus,
  PartnerType,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type PartnerListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  partnerType: PartnerType;
  communityCategory: CommunityCategory | null;
  businessCategory: BusinessCategory | null;
  schoolApproved: boolean;
  sortOrder: number;
  opportunityCount: number;
};

export type PartnerOpportunityItem = {
  id: string;
  title: string;
  description: string | null;
  type: PartnerOpportunityType;
  status: PartnerOpportunityStatus;
  gradeLevels: string[];
  spots: number | null;
  deadline: Date | null;
};

export type PartnerDetail = PartnerListItem & {
  status: PartnerStatus;
  logoUrl: string | null;
  websiteUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  madonnaConnections: string[];
  serviceAreas: string[];
  opportunities: PartnerOpportunityItem[];
};

export type PartnerCategoryGroup = {
  category: CommunityCategory;
  label: string;
  emoji: string;
  description: string;
  partners: PartnerListItem[];
};

const publicCommunityWhere = {
  partnerType: "COMMUNITY" as const,
  status: "APPROVED" as const,
  schoolApproved: true,
};

export async function listCommunityPartners(options?: {
  communityCategory?: CommunityCategory;
}): Promise<PartnerListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.partner.findMany({
      where: {
        ...publicCommunityWhere,
        ...(options?.communityCategory
          ? { communityCategory: options.communityCategory }
          : {}),
      },
      include: {
        _count: {
          select: {
            opportunities: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  );

  return (
    rows?.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      partnerType: row.partnerType,
      communityCategory: row.communityCategory,
      businessCategory: row.businessCategory,
      schoolApproved: row.schoolApproved,
      sortOrder: row.sortOrder,
      opportunityCount: row._count.opportunities,
    })) ?? []
  );
}

export async function listCommunityPartnerGroups(
  categoryFilter?: CommunityCategory,
): Promise<PartnerCategoryGroup[]> {
  const partners = await listCommunityPartners({
    communityCategory: categoryFilter,
  });

  return COMMUNITY_CATEGORY_ORDER.map((category) => {
    const meta = COMMUNITY_CATEGORY_META[category];
    const items = partners.filter((partner) => partner.communityCategory === category);

    if (items.length === 0) {
      return null;
    }

    return {
      category,
      label: meta.label,
      emoji: meta.emoji,
      description: meta.description,
      partners: items,
    };
  }).filter((group): group is PartnerCategoryGroup => group !== null);
}

export async function getCommunityPartnerBySlug(slug: string): Promise<PartnerDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.partner.findFirst({
      where: {
        slug,
        ...publicCommunityWhere,
      },
      include: {
        opportunities: {
          where: { status: "PUBLISHED" },
          orderBy: [{ type: "asc" }, { title: "asc" }],
        },
        _count: {
          select: {
            opportunities: {
              where: { status: "PUBLISHED" },
            },
          },
        },
      },
    }),
  );

  if (!row) {
    return null;
  }

  return mapPartnerDetail(row);
}

export async function listPendingCommunityPartners(): Promise<PartnerDetail[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.partner.findMany({
      where: { partnerType: "COMMUNITY", status: "PENDING" },
      include: {
        opportunities: {
          orderBy: { title: "asc" },
        },
        _count: {
          select: { opportunities: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  );

  return rows?.map(mapPartnerDetail) ?? [];
}

export async function countPendingCommunityPartners(): Promise<number> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return 0;
  }

  const count = await withDatabase((prisma) =>
    prisma.partner.count({
      where: { partnerType: "COMMUNITY", status: "PENDING" },
    }),
  );

  return count ?? 0;
}

export async function approveCommunityPartner(partnerId: string): Promise<void> {
  await withDatabase((prisma) =>
    prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: "APPROVED",
        schoolApproved: true,
      },
    }),
  );
}

export async function rejectCommunityPartner(partnerId: string): Promise<void> {
  await withDatabase((prisma) =>
    prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: "SUSPENDED",
        schoolApproved: false,
      },
    }),
  );
}

function mapPartnerDetail(row: {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  partnerType: PartnerType;
  communityCategory: CommunityCategory | null;
  businessCategory: BusinessCategory | null;
  status: PartnerStatus;
  schoolApproved: boolean;
  logoUrl: string | null;
  websiteUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  madonnaConnections: string[];
  serviceAreas: string[];
  sortOrder: number;
  opportunities: Array<{
    id: string;
    title: string;
    description: string | null;
    type: PartnerOpportunityType;
    status: PartnerOpportunityStatus;
    gradeLevels: string[];
    spots: number | null;
    deadline: Date | null;
  }>;
  _count: { opportunities: number };
}): PartnerDetail {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    partnerType: row.partnerType,
    communityCategory: row.communityCategory,
    businessCategory: row.businessCategory,
    status: row.status,
    schoolApproved: row.schoolApproved,
    sortOrder: row.sortOrder,
    logoUrl: row.logoUrl,
    websiteUrl: row.websiteUrl,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    address: row.address,
    madonnaConnections: row.madonnaConnections,
    serviceAreas: row.serviceAreas,
    opportunityCount: row._count.opportunities,
    opportunities: row.opportunities.map((opportunity) => ({
      id: opportunity.id,
      title: opportunity.title,
      description: opportunity.description,
      type: opportunity.type,
      status: opportunity.status,
      gradeLevels: opportunity.gradeLevels,
      spots: opportunity.spots,
      deadline: opportunity.deadline,
    })),
  };
}
