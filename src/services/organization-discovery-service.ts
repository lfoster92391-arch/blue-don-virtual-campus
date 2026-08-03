import { getOrganizationProfile } from "@/config/organization-profiles";
import { MADONNA_ORGANIZATIONS } from "@/config/madonna-organizations";
import { isFocusClubSlug } from "@/config/focused-clubs";
import { isDatabaseConfigured } from "@/config/env";
import type { OrganizationType } from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import type {
  OrganizationDiscoveryCard,
  OrganizationMatch,
} from "@/lib/organization-discovery";
import { ensureAllFocusClubOrganizations } from "@/services/focus-club-org-service";

export type { OrganizationDiscoveryCard, OrganizationMatch } from "@/lib/organization-discovery";
export { filterDiscoveryCards, searchDiscoveryCards } from "@/lib/organization-discovery";

const DISCOVERABLE_TYPES: OrganizationType[] = ["CLUB", "TEAM"];

type UserDiscoverySignals = {
  academySlugs: string[];
  orgSlugs: string[];
  interestTags: string[];
};

const ACADEMY_INTEREST_MAP: Record<string, string[]> = {
  it: ["technology", "cybersecurity", "computers", "problem-solving", "it"],
  cybersecurity: ["technology", "cybersecurity", "problem-solving"],
  broadcast: ["broadcasting", "media", "photography", "technology"],
  photography: ["photography", "arts", "media"],
  "graphic-design": ["art", "design", "creativity"],
  "theater-production": ["theater", "arts", "performance"],
  robotics: ["technology", "stem", "engineering"],
  "student-leadership": ["leadership", "government", "organizing"],
};

async function getUserDiscoverySignals(userId: string): Promise<UserDiscoverySignals> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { academySlugs: [], orgSlugs: [], interestTags: [] };
  }

  const result = await withDatabase((prisma) =>
    Promise.all([
      prisma.academyMembership.findMany({
        where: { userId, status: "ACTIVE" },
        include: { academy: { select: { slug: true } } },
      }),
      prisma.organizationMembership.findMany({
        where: { userId, status: "ACTIVE" },
        include: { organization: { select: { slug: true } } },
      }),
    ]),
  );

  if (!result) {
    return { academySlugs: [], orgSlugs: [], interestTags: [] };
  }

  const [academies, orgs] = result;
  const academySlugs = academies.map((row) => row.academy.slug);
  const orgSlugs = orgs.map((row) => row.organization.slug);

  const interestTags = new Set<string>(["campus", "madonna"]);

  for (const slug of academySlugs) {
    for (const tag of ACADEMY_INTEREST_MAP[slug] ?? []) {
      interestTags.add(tag);
    }
  }

  return {
    academySlugs,
    orgSlugs,
    interestTags: [...interestTags],
  };
}

function scoreOrganization(
  card: OrganizationDiscoveryCard,
  signals: UserDiscoverySignals,
): { score: number; reasons: string[] } {
  if (signals.orgSlugs.includes(card.slug)) {
    return { score: 100, reasons: ["You are already a member."] };
  }

  let score = 40;
  const reasons: string[] = [];
  const profile = getOrganizationProfile(card.slug, {
    name: card.name,
    description: card.pitch,
    category: card.category ?? undefined,
  });

  const overlapping = profile.interestTags.filter((tag) =>
    signals.interestTags.includes(tag),
  );

  for (const tag of overlapping) {
    score += 12;
  }

  if (overlapping.includes("technology")) {
    reasons.push("You enjoy technology.");
  }

  if (overlapping.includes("service") || overlapping.includes("volunteering")) {
    reasons.push("You are interested in service.");
  }

  if (overlapping.includes("photography") || overlapping.includes("media")) {
    reasons.push("You enjoy photography and media.");
  }

  if (overlapping.includes("leadership")) {
    reasons.push("You show leadership potential.");
  }

  if (overlapping.includes("cybersecurity")) {
    reasons.push("You selected Cybersecurity.");
  }

  if (signals.academySlugs.some((slug) => profile.interestTags.includes(slug))) {
    score += 15;
    reasons.push("It connects to an academy you joined.");
  }

  const config = MADONNA_ORGANIZATIONS.find((entry) => entry.slug === card.slug);

  if (config?.href?.includes("cybersecurity")) {
    score += 8;
  }

  if (reasons.length === 0 && overlapping.length > 0) {
    reasons.push(`It matches your interests in ${overlapping.slice(0, 2).join(" and ")}.`);
  }

  if (reasons.length === 0) {
    reasons.push("Popular with students exploring campus life.");
  }

  return { score: Math.min(99, score), reasons: reasons.slice(0, 4) };
}

function buildDiscoveryCard(org: {
  id: string;
  slug: string;
  name: string;
  type: OrganizationType;
  category: string | null;
  description: string | null;
  academy: { id: string; slug: string } | null;
  _count?: { memberships: number };
}): OrganizationDiscoveryCard {
  const profile = getOrganizationProfile(org.slug, {
    name: org.name,
    description: org.description ?? "",
    category: org.category ?? undefined,
  });

  const config = MADONNA_ORGANIZATIONS.find((entry) => entry.slug === org.slug);

  let joinHref: string | null = `/organizations/${org.slug}#join`;

  if (profile.invitationRequired) {
    joinHref = null;
  } else if (config?.href?.startsWith("/academies/")) {
    joinHref = config.href;
  }

  return {
    id: org.id,
    slug: org.slug,
    name: org.name,
    type: org.type,
    category: org.category,
    icon: profile.icon,
    tagline: profile.tagline,
    pitch: profile.pitch,
    skills: profile.skills,
    xpOpportunities: profile.xpOpportunities,
    memberCount: org._count?.memberships ?? 0,
    meetingSchedule: profile.meetingSchedule ?? null,
    advisor: profile.advisor ?? null,
    invitationRequired: profile.invitationRequired ?? false,
    learnMoreHref: `/organizations/${org.slug}`,
    joinHref,
    discoveryFilters: profile.discoveryFilters,
    academyId: org.academy?.id ?? null,
  };
}

export async function listDiscoverableOrganizations(): Promise<OrganizationDiscoveryCard[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.organization.findMany({
      where: {
        type: { in: DISCOVERABLE_TYPES },
        slug: { not: { startsWith: "academy-" } },
      },
      include: {
        academy: { select: { id: true, slug: true } },
        _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
  );

  return (rows ?? []).map((org) =>
    buildDiscoveryCard({
      ...org,
      _count: { memberships: org._count.memberships },
    }),
  );
}

async function loadOrganizationDiscoveryRow(slug: string) {
  return withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { slug },
      include: {
        academy: { select: { id: true, slug: true, name: true } },
        memberships: {
          where: { status: "ACTIVE" },
          take: 12,
          include: {
            user: {
              select: { displayName: true, firstName: true, lastName: true },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
        _count: { select: { memberships: { where: { status: "ACTIVE" } } } },
      },
    }),
  );
}

export async function getOrganizationDiscoveryDetail(slug: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  // Focus clubs are primary nav destinations. Production may predate the
  // Madonna org catalog seed — upsert IT / Broadcasting / Cricut on visit.
  if (isFocusClubSlug(slug)) {
    await ensureAllFocusClubOrganizations();
  }

  const org = await loadOrganizationDiscoveryRow(slug);

  if (!org) {
    return null;
  }

  const profile = getOrganizationProfile(org.slug, {
    name: org.name,
    description: org.description ?? "",
    category: org.category ?? undefined,
  });

  const card = buildDiscoveryCard({
    ...org,
    _count: { memberships: org._count.memberships },
  });

  return { organization: org, profile, card };
}

export async function getRecommendedOrganizations(
  userId: string,
  limit = 4,
): Promise<OrganizationMatch[]> {
  const [cards, signals] = await Promise.all([
    listDiscoverableOrganizations(),
    getUserDiscoverySignals(userId),
  ]);

  const scored = cards
    .filter((card) => !signals.orgSlugs.includes(card.slug))
    .map((card) => {
      const { score, reasons } = scoreOrganization(card, signals);
      return { ...card, matchScore: score, matchReasons: reasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return scored.slice(0, limit);
}

export async function getOrganizationMatch(
  userId: string,
  slug: string,
): Promise<OrganizationMatch | null> {
  const detail = await getOrganizationDiscoveryDetail(slug);

  if (!detail) {
    return null;
  }

  const signals = await getUserDiscoverySignals(userId);
  const { score, reasons } = scoreOrganization(detail.card, signals);

  return {
    ...detail.card,
    matchScore: score,
    matchReasons: reasons,
  };
}
