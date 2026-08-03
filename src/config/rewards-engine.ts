/**
 * W5 · Rewards Engine v1 — XP ledger and badges.
 */

export type XpLedgerEntry = {
  id: string;
  description: string;
  amount: number;
  dateLabel: string;
  source: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earned: boolean;
  earnedLabel?: string;
  tier: "bronze" | "silver" | "gold";
};

export type RewardsSummary = {
  totalXp: number;
  level: number;
  levelLabel: string;
  coinsBalance: number;
  nextLevelXp: number;
  currentLevelXp: number;
};

export const REWARDS_SUMMARY: RewardsSummary = {
  totalXp: 2340,
  level: 7,
  levelLabel: "Blue Don Scholar",
  coinsBalance: 185,
  nextLevelXp: 3000,
  currentLevelXp: 2340,
};

export const XP_LEDGER: XpLedgerEntry[] = [
  { id: "xp-1", description: "Robotics Showcase participation", amount: 75, dateLabel: "Mar 12", source: "Events" },
  { id: "xp-2", description: "Cybersecurity Foundations certification", amount: 200, dateLabel: "Nov 8", source: "Academy" },
  { id: "xp-3", description: "25 service hours milestone", amount: 100, dateLabel: "Jan 20", source: "Service" },
  { id: "xp-4", description: "Honor Roll Q3", amount: 150, dateLabel: "Apr 3", source: "Achievement" },
  { id: "xp-5", description: "Daily Discovery streak (7 days)", amount: 35, dateLabel: "This week", source: "Campus Life" },
  { id: "xp-6", description: "IT Club meeting attendance", amount: 25, dateLabel: "Yesterday", source: "Organizations" },
];

export const BADGES: Badge[] = [
  { id: "b-starter", name: "First Steps", description: "Complete your campus profile", emoji: "👋", earned: true, earnedLabel: "Sep 2024", tier: "bronze" },
  { id: "b-service", name: "Heart of a Blue Don", description: "Log 25 service hours", emoji: "❤️", earned: true, earnedLabel: "Jan 2025", tier: "silver" },
  { id: "b-cyber", name: "Cyber Guardian", description: "Earn a cybersecurity certification", emoji: "🛡️", earned: true, earnedLabel: "Nov 2024", tier: "gold" },
  { id: "b-streak", name: "On a Roll", description: "7-day Daily Discovery streak", emoji: "🔥", earned: true, earnedLabel: "This week", tier: "bronze" },
  { id: "b-leader", name: "Club Leader", description: "Hold an officer role in a club", emoji: "⭐", earned: true, earnedLabel: "Oct 2024", tier: "silver" },
  { id: "b-honor", name: "Honor Scholar", description: "Make honor roll", emoji: "📚", earned: true, earnedLabel: "Apr 2025", tier: "gold" },
  { id: "b-arcade", name: "Game On", description: "Win 10 arcade challenges", emoji: "🎮", earned: true, earnedLabel: "Feb 2025", tier: "bronze" },
  { id: "b-grad", name: "Graduation Ready", description: "Complete all graduation milestones", emoji: "🎓", earned: false, tier: "gold" },
  { id: "b-quest", name: "Campus Quest Champion", description: "Complete a monthly Campus Quest season", emoji: "🏆", earned: false, tier: "gold" },
];
