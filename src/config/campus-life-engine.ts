/**
 * W7 · Campus Life v1 — Today widget, traditions, spirit points.
 */

export type TodayHappening = {
  id: string;
  title: string;
  timeLabel: string;
  category: "event" | "tradition" | "announcement";
  href?: string;
};

export type Tradition = {
  id: string;
  name: string;
  description: string;
  season: string;
  emoji: string;
};

export type SpiritPointsSummary = {
  personal: number;
  classRank: number;
  classTotal: number;
  houseName: string;
  housePoints: number;
};

export const TODAY_HAPPENINGS: TodayHappening[] = [
  { id: "th-1", title: "Morning announcements livestream", timeLabel: "8:05 AM", category: "announcement", href: "/media" },
  { id: "th-2", title: "Prayer Club — chapel", timeLabel: "7:30 AM", category: "tradition", href: "/organizations/prayer-club" },
  { id: "th-3", title: "IT Club help desk shift", timeLabel: "3:15 PM", category: "event", href: "/organizations/it-club" },
  { id: "th-4", title: "Varsity football practice", timeLabel: "4:00 PM", category: "event", href: "/athletics" },
  { id: "th-5", title: "Blue & Gold spirit dress", timeLabel: "All day", category: "tradition" },
];

export const CAMPUS_TRADITIONS: Tradition[] = [
  { id: "tr-spirit", name: "Spirit Week", description: "Five days of themed dress, pep rallies, and class competitions.", season: "Fall", emoji: "🎉" },
  { id: "tr-mass", name: "All-School Mass", description: "Monthly liturgy bringing the entire campus community together.", season: "Monthly", emoji: "⛪" },
  { id: "tr-service", name: "Blue Don Service Day", description: "A full day of community service across the tri-state area.", season: "Spring", emoji: "❤️" },
  { id: "tr-ring", name: "Ring Ceremony", description: "Junior class receives their Madonna rings.", season: "Spring", emoji: "💍" },
  { id: "tr-grad", name: "Baccalaureate & Commencement", description: "Celebrating our graduating Blue Dons.", season: "May", emoji: "🎓" },
];

export const SPIRIT_POINTS: SpiritPointsSummary = {
  personal: 340,
  classRank: 12,
  classTotal: 186,
  houseName: "Blue Don House",
  housePoints: 4820,
};
