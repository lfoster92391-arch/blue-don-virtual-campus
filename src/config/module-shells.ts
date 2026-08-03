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
    relatedLinks: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Career Portfolio", href: "/career-portfolio" },
      { label: "College Readiness Passport", href: "/college-passport" },
    ],
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
    title: "Find Your Place",
    description: "Discover clubs, organizations, and where you belong at Madonna.",
    phase: "17.2",
    pillar: "Student Life",
    docHref: "/docs/BLUE_DON_DIGITAL_CAMPUS.md",
    relatedLinks: [{ label: "Find Your Place", href: "/find-your-place" }],
  },
  athletics: {
    slug: "athletics",
    title: "Athletics",
    description: "Teams, schedules, scores, and livestreams.",
    phase: "19.1",
    pillar: "Student Life",
    relatedLinks: [{ label: "All teams", href: "/athletics" }],
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
    relatedLinks: [{ label: "Business Partners", href: "/business-partners" }],
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
    relatedLinks: [
      { label: "Community Partners", href: "/community-partners" },
      { label: "Service Desk (staff)", href: "/service-desk" },
    ],
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
    relatedLinks: [
      { label: "Scholarship Center", href: "/scholarships" },
      { label: "Future Center", href: "/pathways" },
      { label: "Mentor Network", href: "/mentors" },
      { label: "Partners", href: "/partners" },
      { label: "Community Partners", href: "/community-partners" },
      { label: "Career Portfolio", href: "/career-portfolio" },
    ],
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
    relatedLinks: [
      { label: "Weather Station", href: "/weather" },
      { label: "Events", href: "/events" },
      { label: "Community Partners", href: "/community-partners" },
    ],
  },
  weather: {
    slug: "weather",
    title: "Campus Weather Station",
    description:
      "Live weather, air quality, UV, and guidance for athletics and recess at Madonna.",
    phase: "17.5",
    pillar: "Student Life",
    relatedLinks: [{ label: "Campus Life", href: "/campus-life" }],
  },
  arcade: {
    slug: "arcade",
    title: "Blue Don Arcade",
    description: "Play. Learn. Earn. — trivia and puzzles across every subject, streaks, and Campus Quest.",
    phase: "20.0",
    pillar: "Student Life",
    docHref: "/docs/BLUE_DON_ARCADE.md",
  },
  "career-portfolio": {
    slug: "career-portfolio",
    title: "Career Portfolio",
    description:
      "Everything. One Link. — resume, certifications, service, leadership, and transcript for graduates.",
    phase: "18.0",
    pillar: "Student Success",
    relatedLinks: [
      { label: "Portfolio items", href: "/portfolio" },
      { label: "Future Center", href: "/pathways" },
      { label: "Mentor Network", href: "/mentors" },
      { label: "Professional Skills", href: "/professional-skills" },
    ],
  },
  "professional-skills": {
    slug: "professional-skills",
    title: "Professional Skills",
    description:
      "Career-readiness tracks — resume writing, interview prep, business email, and customer service.",
    phase: "22.0",
    pillar: "Student Success",
    relatedLinks: [
      { label: "Future Center", href: "/pathways" },
      { label: "Blue Don AI", href: "/ai" },
      { label: "Career Portfolio", href: "/career-portfolio" },
    ],
  },
  traditions: {
    slug: "traditions",
    title: "Traditions Hub",
    description: "Homecoming, Spirit Week, faith celebrations, and every ritual that makes Madonna home.",
    phase: "23.0",
    pillar: "Student Life",
    relatedLinks: [
      { label: "Madonna History", href: "/history" },
      { label: "Hall of Champions", href: "/hall-of-champions" },
      { label: "Why Madonna?", href: "/why-madonna" },
    ],
  },
};

export function getModuleShell(slug: string): ModuleShellConfig | undefined {
  return MODULE_SHELLS[slug];
}
