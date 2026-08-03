import {
  BUSINESS_PARTNER_SEEDS,
  type BusinessPartnerAlumni,
  type BusinessPartnerEmployee,
} from "@/config/business-partners";
import { CLEAN_SLATE } from "@/config/app-mode";
import { isDatabaseConfigured } from "@/config/env";
import type {
  BusinessPartnerOpportunityType,
  BusinessPartnerStatus,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type BusinessPartnerOpportunity = {
  id: string;
  type: BusinessPartnerOpportunityType;
  title: string;
  description: string;
  isActive: boolean;
};

export type BusinessPartnerSummary = {
  id: string;
  slug: string;
  name: string;
  description: string;
  industry: string;
  logoUrl: string | null;
  website: string | null;
  address: string | null;
  opportunityCount: number;
};

export type BusinessPartnerDetail = BusinessPartnerSummary & {
  careerInfo: string | null;
  employees: BusinessPartnerEmployee[];
  alumni: BusinessPartnerAlumni[];
  opportunities: BusinessPartnerOpportunity[];
};

export type PendingBusinessPartner = {
  id: string;
  slug: string;
  name: string;
  industry: string;
  description: string;
  address: string | null;
  website: string | null;
  createdAt: Date;
};

function parseEmployees(value: unknown): BusinessPartnerEmployee[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is BusinessPartnerEmployee =>
        typeof item === "object" &&
        item !== null &&
        "name" in item &&
        "title" in item &&
        typeof (item as BusinessPartnerEmployee).name === "string" &&
        typeof (item as BusinessPartnerEmployee).title === "string",
    )
    .map((item) => ({ name: item.name, title: item.title }));
}

function parseAlumni(value: unknown): BusinessPartnerAlumni[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is BusinessPartnerAlumni =>
        typeof item === "object" &&
        item !== null &&
        "alumniName" in item &&
        typeof (item as BusinessPartnerAlumni).alumniName === "string",
    )
    .map((item) => ({
      alumniName: item.alumniName,
      graduationYear:
        typeof item.graduationYear === "number" ? item.graduationYear : undefined,
      role: typeof item.role === "string" ? item.role : undefined,
    }));
}

function seedToSummary(
  seed: (typeof BUSINESS_PARTNER_SEEDS)[number],
  index: number,
): BusinessPartnerSummary {
  return {
    id: `seed-${seed.slug}`,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    industry: seed.industry,
    logoUrl: seed.logoUrl ?? null,
    website: seed.website ?? null,
    address: seed.address ?? null,
    opportunityCount: seed.opportunities.filter((o) => o.isActive !== false).length,
  };
}

function seedToDetail(seed: (typeof BUSINESS_PARTNER_SEEDS)[number]): BusinessPartnerDetail {
  const summary = seedToSummary(seed, 0);
  return {
    ...summary,
    careerInfo: seed.careerInfo ?? null,
    employees: seed.employees ?? [],
    alumni: seed.alumni ?? [],
    opportunities: seed.opportunities.map((opp, index) => ({
      id: `seed-${seed.slug}-${index}`,
      type: opp.type,
      title: opp.title,
      description: opp.description,
      isActive: opp.isActive !== false,
    })),
  };
}

function mapPartnerSummary(partner: {
  id: string;
  slug: string;
  name: string;
  description: string;
  industry: string;
  logoUrl: string | null;
  website: string | null;
  address: string | null;
  _count: { opportunities: number };
}): BusinessPartnerSummary {
  return {
    id: partner.id,
    slug: partner.slug,
    name: partner.name,
    description: partner.description,
    industry: partner.industry,
    logoUrl: partner.logoUrl,
    website: partner.website,
    address: partner.address,
    opportunityCount: partner._count.opportunities,
  };
}

function mapPartnerDetail(partner: {
  id: string;
  slug: string;
  name: string;
  description: string;
  industry: string;
  logoUrl: string | null;
  website: string | null;
  address: string | null;
  careerInfo: string | null;
  employees: unknown;
  alumni: unknown;
  opportunities: {
    id: string;
    type: BusinessPartnerOpportunityType;
    title: string;
    description: string;
    isActive: boolean;
  }[];
  _count: { opportunities: number };
}): BusinessPartnerDetail {
  return {
    ...mapPartnerSummary(partner),
    careerInfo: partner.careerInfo,
    employees: parseEmployees(partner.employees),
    alumni: parseAlumni(partner.alumni),
    opportunities: partner.opportunities,
  };
}

function seedPartnerFallback(): BusinessPartnerSummary[] {
  // Clean slate: business partner directory starts empty; the school adds real
  // partners over time. Never fall back to demo seed companies.
  if (CLEAN_SLATE) {
    return [];
  }
  return BUSINESS_PARTNER_SEEDS.filter((seed) => seed.status === "APPROVED").map(
    seedToSummary,
  );
}

export async function listApprovedPartners(): Promise<BusinessPartnerSummary[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return seedPartnerFallback();
  }

  const partners = await withDatabase((prisma) =>
    prisma.businessPartner.findMany({
      where: { status: "APPROVED" },
      include: {
        _count: {
          select: {
            opportunities: { where: { isActive: true } },
          },
        },
      },
      orderBy: [{ name: "asc" }],
    }),
  );

  if (!partners || partners.length === 0) {
    return seedPartnerFallback();
  }

  return partners.map(mapPartnerSummary);
}

export async function getPartnerBySlug(
  slug: string,
): Promise<BusinessPartnerDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    if (CLEAN_SLATE) {
      return null;
    }
    const seed = BUSINESS_PARTNER_SEEDS.find(
      (item) => item.slug === slug && item.status === "APPROVED",
    );
    return seed ? seedToDetail(seed) : null;
  }

  const partner = await withDatabase((prisma) =>
    prisma.businessPartner.findFirst({
      where: { slug, status: "APPROVED" },
      include: {
        opportunities: {
          where: { isActive: true },
          orderBy: [{ type: "asc" }, { title: "asc" }],
        },
        _count: {
          select: {
            opportunities: { where: { isActive: true } },
          },
        },
      },
    }),
  );

  if (!partner) {
    if (CLEAN_SLATE) {
      return null;
    }
    const seed = BUSINESS_PARTNER_SEEDS.find(
      (item) => item.slug === slug && item.status === "APPROVED",
    );
    return seed ? seedToDetail(seed) : null;
  }

  return mapPartnerDetail(partner);
}

export async function listPendingPartners(): Promise<PendingBusinessPartner[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const partners = await withDatabase((prisma) =>
    prisma.businessPartner.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        industry: true,
        description: true,
        address: true,
        website: true,
        createdAt: true,
      },
    }),
  );

  return partners ?? [];
}

export type SubmitPartnerApplicationInput = {
  name: string;
  industry: string;
  description: string;
  address?: string;
  website?: string;
  contactEmail: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function submitPartnerApplication(
  input: SubmitPartnerApplicationInput,
): Promise<{ id: string; slug: string } | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const baseSlug = slugify(input.name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const partner = await withDatabase((prisma) =>
    prisma.businessPartner.create({
      data: {
        slug,
        name: input.name,
        industry: input.industry,
        description: `${input.description}\n\nContact: ${input.contactEmail}`,
        address: input.address ?? null,
        website: input.website ?? null,
        status: "PENDING",
      },
      select: { id: true, slug: true },
    }),
  );

  return partner;
}

export async function updatePartnerStatus(
  partnerId: string,
  status: BusinessPartnerStatus,
  approvedById?: string,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.businessPartner.update({
      where: { id: partnerId },
      data: {
        status,
        approvedById: status === "APPROVED" ? approvedById : null,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    }),
  );

  return result !== null;
}

export async function countPendingPartners(): Promise<number> {
  const pending = await listPendingPartners();
  return pending.length;
}
