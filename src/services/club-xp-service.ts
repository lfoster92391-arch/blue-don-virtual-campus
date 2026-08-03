/**
 * W20 · Club Worlds — Club XP service.
 *
 * Derives each club's OWN XP/level and milestone completion for display. This
 * is a config + seed MVP: values are computed deterministically from a per-slug
 * seed so the demo feels alive ("IT Club Level 12, Student Council Level 8")
 * without requiring a `ClubMemberProgress` table.
 *
 * If a `ClubMemberProgress` model is added later, `getClubProgress` is the one
 * seam to swap: return real `{ clubXp, level }` and keep the same shape.
 */

import {
  clubLevelForXp,
  clubLevelTitle,
  cumulativeClubXp,
  getClubMilestones,
  type ClubMilestone,
} from "@/config/club-milestones";
import { getClubType } from "@/config/club-workspaces";

export type MilestoneProgress = ClubMilestone & { completed: boolean };

export type ClubProgress = {
  slug: string;
  clubXp: number;
  level: number;
  levelTitle: string;
  /** Cumulative XP at the start of the current level. */
  currentLevelXp: number;
  /** Cumulative XP needed to reach the next level. */
  nextLevelXp: number;
  /** XP earned within the current level. */
  xpIntoLevel: number;
  /** XP remaining to the next level. */
  xpToNextLevel: number;
  /** Progress through the current level, 0–100. */
  levelProgressPct: number;
  milestones: MilestoneProgress[];
  completedMilestones: number;
  totalMilestones: number;
};

/**
 * Seed club XP per slug. Chosen so notable clubs land on evocative levels
 * (IT Club ≈ L12, Student Council ≈ L8). Any slug not listed falls back to a
 * deterministic hash-derived value.
 */
const SEED_CLUB_XP: Record<string, number> = {
  "it-club": 6720, // Level 12
  "student-council-high-school": 2880, // Level 8
  "student-council-junior-high": 1240, // Level 5
  "interact-club-high-school": 3620, // Level 9
  "interact-club-junior-high": 980, // Level 5
  "drama-club": 2260, // Level 7
  "art-club": 1980, // Level 7
  "chess-club": 3180, // Level 8
  "science-club": 1720, // Level 6
  "pep-club": 2540, // Level 8
  "prayer-club": 1180, // Level 5
  sadd: 860, // Level 4
  "national-honor-society": 4120, // Level 10
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seedClubXp(slug: string): number {
  const seeded = SEED_CLUB_XP[slug];
  if (typeof seeded === "number") {
    return seeded;
  }
  // Deterministic fallback: 300–2200 club XP (roughly levels 3–7).
  return 300 + (hashString(slug) % 1900);
}

/**
 * Returns a club's XP/level and milestone checklist. `earnedXpOverride` lets a
 * future DB-backed value flow through without changing the display logic.
 */
export function getClubProgress(
  slug: string,
  earnedXpOverride?: number,
): ClubProgress {
  const clubType = getClubType(slug);
  const clubXp = earnedXpOverride ?? seedClubXp(slug);

  const level = clubLevelForXp(clubXp);
  const currentLevelXp = cumulativeClubXp(level);
  const nextLevelXp = cumulativeClubXp(level + 1);
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const xpIntoLevel = clubXp - currentLevelXp;
  const levelProgressPct = Math.min(
    100,
    Math.max(0, Math.round((xpIntoLevel / span) * 100)),
  );

  const definitions = getClubMilestones(clubType);

  // Milestones are marked complete cumulatively by their XP cost: a club has
  // "spent" its earned XP down the ordered milestone list.
  let remaining = clubXp;
  const milestones: MilestoneProgress[] = definitions.map((milestone) => {
    const completed = remaining >= milestone.xp;
    if (completed) {
      remaining -= milestone.xp;
    }
    return { ...milestone, completed };
  });

  const completedMilestones = milestones.filter((m) => m.completed).length;

  return {
    slug,
    clubXp,
    level,
    levelTitle: clubLevelTitle(level),
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpToNextLevel: Math.max(0, nextLevelXp - clubXp),
    levelProgressPct,
    milestones,
    completedMilestones,
    totalMilestones: milestones.length,
  };
}
