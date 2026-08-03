/**
 * Opportunity Center service — surfaces the Ohio Valley opportunity catalog.
 *
 * Unlike feeds that must stay empty under clean slate, the Opportunity Center
 * ships with a REAL structural catalog of local opportunities so students and
 * staff always have something actionable to explore. When clean slate is on the
 * catalog is flagged as a SAMPLE preview (`isSample: true`) so the school knows
 * to review and replace entries with its own partner-sourced opportunities.
 */

import { CLEAN_SLATE } from "@/config/app-mode";
import {
  getOpportunityById,
  isOpportunityDeadlinePassed,
  OPPORTUNITIES,
  type Opportunity,
  type OpportunityType,
} from "@/config/opportunities";

export type OpportunityFilters = {
  type?: OpportunityType | "all";
  search?: string;
};

export type OpportunityCatalog = {
  opportunities: Opportunity[];
  /** True when the list is placeholder sample content (clean slate on). */
  isSample: boolean;
  totalCount: number;
  openCount: number;
  paidCount: number;
};

function sortByDeadline(a: Opportunity, b: Opportunity): number {
  const aRolling = a.deadline === "rolling";
  const bRolling = b.deadline === "rolling";
  if (aRolling && bRolling) return a.title.localeCompare(b.title);
  if (aRolling) return 1;
  if (bRolling) return -1;
  return a.deadline.localeCompare(b.deadline);
}

function applyFilters(list: Opportunity[], filters: OpportunityFilters): Opportunity[] {
  let result = [...list];

  if (filters.type && filters.type !== "all") {
    result = result.filter((opportunity) => opportunity.type === filters.type);
  }

  if (filters.search?.trim()) {
    const query = filters.search.trim().toLowerCase();
    result = result.filter(
      (opportunity) =>
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.organization.toLowerCase().includes(query) ||
        opportunity.location.toLowerCase().includes(query) ||
        opportunity.description.toLowerCase().includes(query) ||
        opportunity.tags.some((tag) => tag.includes(query)),
    );
  }

  return result.sort(sortByDeadline);
}

export async function getOpportunityCatalog(
  filters: OpportunityFilters = {},
): Promise<OpportunityCatalog> {
  const all = OPPORTUNITIES;
  const opportunities = applyFilters(all, filters);

  return {
    opportunities,
    isSample: CLEAN_SLATE,
    totalCount: all.length,
    openCount: all.filter((o) => !isOpportunityDeadlinePassed(o.deadline)).length,
    paidCount: all.filter((o) => o.pay === "paid" || o.pay === "stipend").length,
  };
}

export async function getOpportunity(
  id: string,
): Promise<{ opportunity: Opportunity; isSample: boolean } | null> {
  const opportunity = getOpportunityById(id);
  if (!opportunity) {
    return null;
  }
  return { opportunity, isSample: CLEAN_SLATE };
}
