import { CLEAN_SLATE } from "@/config/app-mode";
import {
  COMMUNITY_IMPACT_HEADLINE,
  COMMUNITY_IMPACT_HIGHLIGHTS,
  COMMUNITY_IMPACT_STATS,
  COMMUNITY_IMPACT_SUBHEADLINE,
  type CommunityImpactStat,
} from "@/config/community-impact";

export type CommunityImpactDashboard = {
  headline: string;
  subheadline: string;
  stats: CommunityImpactStat[];
  highlights: typeof COMMUNITY_IMPACT_HIGHLIGHTS;
  lastUpdated: string;
};

export function getCommunityImpactDashboard(): CommunityImpactDashboard {
  // Clean slate: keep the labels/structure so the dashboard renders, but show
  // 0 for every metric — no seeded impact numbers presented as truth. Totals
  // grow as real service hours, funds, and projects are logged.
  const stats = CLEAN_SLATE
    ? COMMUNITY_IMPACT_STATS.map((stat) => ({ ...stat, value: 0 }))
    : COMMUNITY_IMPACT_STATS;

  return {
    headline: COMMUNITY_IMPACT_HEADLINE,
    subheadline: COMMUNITY_IMPACT_SUBHEADLINE,
    stats,
    highlights: COMMUNITY_IMPACT_HIGHLIGHTS,
    lastUpdated: CLEAN_SLATE ? "No data yet" : "2025–2026 school year",
  };
}

export function formatImpactStat(stat: CommunityImpactStat): string {
  const formatted = stat.value.toLocaleString("en-US");
  if (stat.prefix) {
    return `${stat.prefix}${formatted}`;
  }
  if (stat.unit) {
    return `${formatted} ${stat.unit}`;
  }
  return formatted;
}
