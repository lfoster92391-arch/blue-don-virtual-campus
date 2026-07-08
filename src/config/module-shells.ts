export type ModuleShellConfig = {
  slug: string;
  title: string;
  description: string;
  phase: string;
  pillar: string;
  docHref?: string;
  relatedLinks?: { label: string; href: string }[];
};

export const MODULE_SHELLS: Record<string, ModuleShellConfig> = {
  "my-journey": {
    slug: "my-journey",
    title: "My Journey",
    description:
      "Your longitudinal home at Madonna — timeline, achievements, portfolio, and graduation progress.",
    phase: "17.1",
    pillar: "Student Success",
    docHref: "/docs/BLUE_DON_MY_MADONNA_JOURNEY.md",
    relatedLinks: [{ label: "Portfolio", href: "/portfolio" }],
  },
  hub: {
    slug: "hub",
    title: "School Hub",
    description:
      "Announcements, bell schedule, lunch menu, directory, and school resources.",
    phase: "17.1",
    pillar: "School Operations",
    relatedLinks: [
      { label: "Knowledge Vault", href: "/knowledge" },
      { label: "Forms", href: "/forms" },
    ],
  },
  "student-life": {
    slug: "student-life",
    title: "Student Life",
    description: "Clubs, class pages, organizations, and campus culture.",
    phase: "17.2",
    pillar: "Student Life",
    docHref: "/docs/BLUE_DON_DIGITAL_CAMPUS.md",
  },
  athletics: {
    slug: "athletics",
    title: "Athletics",
    description: "Teams, schedules, scores, and livestreams.",
    phase: "19.1",
    pillar: "Student Life",
  },
  corner: {
    slug: "corner",
    title: "Blue Don Corner",
    description: "Spirit wear, club stores, tickets, and the campus marketplace.",
    phase: "19.1",
    pillar: "Student Life",
    relatedLinks: [{ label: "Impact Fund", href: "/impact-fund" }],
  },
  community: {
    slug: "community",
    title: "Community",
    description: "Campus feed, celebrations, and positive school culture.",
    phase: "19.0",
    pillar: "Student Life",
  },
  media: {
    slug: "media",
    title: "Media Center",
    description: "Photos, videos, albums, and the digital yearbook.",
    phase: "19.0",
    pillar: "Student Life",
  },
  ai: {
    slug: "ai",
    title: "Blue Don AI",
    description: "Scoped campus assistant for homework, careers, and planning.",
    phase: "20.0",
    pillar: "Intelligence",
  },
  service: {
    slug: "service",
    title: "Service Center",
    description: "Volunteer opportunities, service hours, and community impact.",
    phase: "18.0",
    pillar: "Student Life",
    relatedLinks: [{ label: "Service Desk (staff)", href: "/service-desk" }],
  },
  rewards: {
    slug: "rewards",
    title: "Rewards",
    description: "XP, Blue Don Coins, badges, and the Blue Don Shop.",
    phase: "18.0",
    pillar: "Digital Identity",
  },
  opportunities: {
    slug: "opportunities",
    title: "Opportunity Center",
    description: "Discover internships, clubs, scholarships, and What If? career paths.",
    phase: "18.0",
    pillar: "Student Success",
    docHref: "/docs/BLUE_DON_OPPORTUNITY_CENTER.md",
    relatedLinks: [{ label: "Future Center", href: "/pathways" }],
  },
  discover: {
    slug: "discover",
    title: "Daily Discovery",
    description: "Learn something new every day — saints, careers, countries, and more.",
    phase: "18.0",
    pillar: "Student Success",
    docHref: "/docs/BLUE_DON_DAILY_DISCOVERY.md",
  },
  "campus-life": {
    slug: "campus-life",
    title: "Campus Life",
    description: "Traditions, spirit, today's happenings, and Blue Don Live.",
    phase: "17.5",
    pillar: "Student Life",
    docHref: "/docs/BLUE_DON_CAMPUS_LIFE.md",
    relatedLinks: [{ label: "Events", href: "/events" }],
  },
  arcade: {
    slug: "arcade",
    title: "Blue Don Arcade",
    description: "Play. Learn. Earn. — brain games, streaks, and Campus Quest.",
    phase: "20.0",
    pillar: "Student Life",
    docHref: "/docs/BLUE_DON_ARCADE.md",
  },
};

export function getModuleShell(slug: string): ModuleShellConfig | undefined {
  return MODULE_SHELLS[slug];
}
