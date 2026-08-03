import type { Scholarship, ScholarshipCategory } from "@/config/scholarships";

export type ScholarshipCard = Scholarship & {
  detailHref: string;
};

export type ScholarshipMatch = ScholarshipCard & {
  matchScore: number;
  matchReasons: string[];
  qualifies: boolean;
};

export type ScholarshipFilters = {
  category?: ScholarshipCategory;
  search?: string;
  minAmount?: number;
  sortBy?: "deadline" | "amount" | "match";
};

export function buildScholarshipCard(scholarship: Scholarship): ScholarshipCard {
  return {
    ...scholarship,
    detailHref: `/scholarships/${scholarship.id}`,
  };
}

export function filterScholarshipCards(
  cards: ScholarshipCard[],
  filters: ScholarshipFilters,
): ScholarshipCard[] {
  let result = [...cards];

  if (filters.category) {
    result = result.filter((card) => card.category === filters.category);
  }

  if (filters.minAmount) {
    result = result.filter((card) => card.amount >= filters.minAmount!);
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter(
      (card) =>
        card.title.toLowerCase().includes(query) ||
        card.description.toLowerCase().includes(query) ||
        card.provider.toLowerCase().includes(query),
    );
  }

  return result;
}

export function sortScholarshipMatches(
  matches: ScholarshipMatch[],
  sortBy: ScholarshipFilters["sortBy"] = "match",
): ScholarshipMatch[] {
  const sorted = [...matches];

  switch (sortBy) {
    case "deadline":
      return sorted.sort((a, b) => a.deadline.localeCompare(b.deadline));
    case "amount":
      return sorted.sort((a, b) => b.amount - a.amount);
    case "match":
    default:
      return sorted.sort((a, b) => {
        if (a.qualifies !== b.qualifies) {
          return a.qualifies ? -1 : 1;
        }
        return b.matchScore - a.matchScore;
      });
  }
}
