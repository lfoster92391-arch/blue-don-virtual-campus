import type { DiscoveryFilter } from "@/config/organization-profiles";
import {
  getOrganizationProfile,
  matchesDiscoveryFilter,
} from "@/config/organization-profiles";

export type OrganizationDiscoveryCard = {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string | null;
  icon: string;
  tagline: string;
  pitch: string;
  skills: string[];
  xpOpportunities: string[];
  memberCount: number;
  meetingSchedule: string | null;
  advisor: string | null;
  invitationRequired: boolean;
  learnMoreHref: string;
  joinHref: string | null;
  discoveryFilters: DiscoveryFilter[];
  academyId?: string | null;
  applicationStatus?: "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED" | null;
};

export type OrganizationMatch = OrganizationDiscoveryCard & {
  matchScore: number;
  matchReasons: string[];
};

export function filterDiscoveryCards(
  cards: OrganizationDiscoveryCard[],
  filter: DiscoveryFilter,
): OrganizationDiscoveryCard[] {
  return cards.filter((card) =>
    matchesDiscoveryFilter(
      getOrganizationProfile(card.slug, {
        name: card.name,
        description: card.pitch,
        category: card.category ?? undefined,
      }),
      filter,
    ),
  );
}

export function searchDiscoveryCards(
  cards: OrganizationDiscoveryCard[],
  query: string,
): OrganizationDiscoveryCard[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return cards;
  }

  return cards.filter((card) => {
    const haystack = [
      card.name,
      card.tagline,
      card.pitch,
      card.advisor ?? "",
      ...card.skills,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
