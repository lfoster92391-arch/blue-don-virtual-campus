export type DiscoveryFilter =
  | "all"
  | "technology"
  | "leadership"
  | "service"
  | "faith"
  | "arts"
  | "academics"
  | "athletics";

export const DISCOVERY_FILTER_LABELS: Record<DiscoveryFilter, string> = {
  all: "All",
  technology: "Technology",
  leadership: "Leadership",
  service: "Service",
  faith: "Faith",
  arts: "Arts",
  academics: "Academics",
  athletics: "Athletics",
};

export type ClubProject = {
  name: string;
  description: string;
};

export type ClubLab = {
  label: string;
  href?: string;
};

export type OrganizationProfile = {
  icon: string;
  tagline: string;
  pitch: string;
  skills: string[];
  xpOpportunities: string[];
  interestTags: string[];
  discoveryFilters: DiscoveryFilter[];
  invitationRequired?: boolean;
  advisor?: string;
  meetingSchedule?: string;
  careerConnections?: string[];
  relatedSlugs?: string[];
  projects?: ClubProject[];
  currentProject?: string;
  certifications?: string[];
  labs?: ClubLab[];
  leadership?: { role: string; name: string }[];
};

const DEFAULT_PROFILE: Omit<OrganizationProfile, "icon" | "tagline" | "pitch"> = {
  skills: ["Collaboration", "Leadership", "Campus involvement"],
  xpOpportunities: ["Participation XP", "Event attendance"],
  interestTags: ["campus"],
  discoveryFilters: ["all"],
  meetingSchedule: "See club page for meeting times",
};

export const ORGANIZATION_PROFILES: Record<string, OrganizationProfile> = {
  "it-club": {
    icon: "💻",
    tagline: "Technology • Broadcasting • Innovation",
    pitch: "Learn real-world technology skills while helping the school.",
    skills: ["Help desk", "Networking", "Device repair", "Cybersecurity basics"],
    xpOpportunities: ["Lab completions", "Service hours", "Certification prep"],
    interestTags: ["technology", "cybersecurity", "computers", "problem-solving", "it"],
    discoveryFilters: ["all", "technology"],
    advisor: "IT Academy Advisor",
    meetingSchedule: "Wednesdays · 3:15 PM · Room 214",
    careerConnections: ["IT support", "Cybersecurity", "Broadcast engineering"],
    relatedSlugs: ["broadcasting"],
    projects: [
      {
        name: "Broadcasting",
        description: "Livestream games, run morning announcements, and produce video.",
      },
      {
        name: "Digital Design",
        description: "Design graphics, signage, and the school's digital presence.",
      },
      {
        name: "IT Operations",
        description: "Email the help desk for device and classroom tech support.",
      },
      {
        name: "Innovation",
        description: "Prototype new tech projects and compete in challenges.",
      },
    ],
    currentProject: "Upgrading the studio for full 1080p live game broadcasts.",
    certifications: ["CompTIA ITF+", "CompTIA A+", "Google IT Support"],
    labs: [
      { label: "Networking Fundamentals", href: "/labs" },
      { label: "Cybersecurity Basics", href: "/labs" },
      { label: "Help Desk Simulator", href: "/simulators" },
    ],
    leadership: [
      { role: "President", name: "Student Lead" },
      { role: "Broadcast Director", name: "Student Officer" },
    ],
  },
  "geek-club": {
    icon: "🎮",
    tagline: "Games • Code • Community",
    pitch: "Games, coding culture, and technology enthusiasm at Madonna.",
    skills: ["Game design", "Coding", "Team strategy"],
    xpOpportunities: ["Arcade challenges", "Club events"],
    interestTags: ["technology", "games", "coding"],
    discoveryFilters: ["all", "technology"],
    advisor: "Technology Department",
    meetingSchedule: "Thursdays · 3:30 PM",
  },
  "student-council-high-school": {
    icon: "🏛",
    tagline: "Lead. Organize. Make a difference.",
    pitch: "Represent your classmates and shape campus culture.",
    skills: ["Public speaking", "Planning", "Governance", "Event leadership"],
    xpOpportunities: ["Leadership XP", "Service milestones"],
    interestTags: ["leadership", "government", "organizing"],
    discoveryFilters: ["all", "leadership", "service"],
    advisor: "Student Leadership Advisor",
    meetingSchedule: "Mondays · 7:45 AM · Student Center",
  },
  "student-council-junior-high": {
    icon: "🏛",
    tagline: "Lead. Organize. Make a difference.",
    pitch: "Junior high student government and campus voice.",
    skills: ["Leadership", "Teamwork", "Planning"],
    xpOpportunities: ["Leadership XP"],
    interestTags: ["leadership", "junior-high"],
    discoveryFilters: ["all", "leadership"],
    advisor: "Junior High Coordinator",
    meetingSchedule: "Tuesdays · 3:15 PM",
  },
  "interact-club-high-school": {
    icon: "❤️",
    tagline: "Service • Fellowship • Impact",
    pitch: "Serve the community through meaningful volunteer work.",
    skills: ["Volunteering", "Project planning", "Community outreach"],
    xpOpportunities: ["Service hours", "Impact Fund projects"],
    interestTags: ["service", "volunteering", "community"],
    discoveryFilters: ["all", "service", "leadership"],
    advisor: "Campus Ministry / Service",
    meetingSchedule: "Thursdays · 3:15 PM",
  },
  "interact-club-junior-high": {
    icon: "❤️",
    tagline: "Service • Fellowship • Impact",
    pitch: "Junior high service and leadership with Rotary Interact.",
    skills: ["Service", "Teamwork"],
    xpOpportunities: ["Service hours"],
    interestTags: ["service", "junior-high"],
    discoveryFilters: ["all", "service"],
    advisor: "Junior High Coordinator",
    meetingSchedule: "Wednesdays · 3:15 PM",
  },
  "science-club": {
    icon: "🧪",
    tagline: "STEM • Experiments • Discovery",
    pitch: "Experiments, competitions, and STEM exploration.",
    skills: ["Lab skills", "Research", "Scientific method"],
    xpOpportunities: ["Science fair", "Challenge XP"],
    interestTags: ["science", "stem", "experiments"],
    discoveryFilters: ["all", "academics"],
    advisor: "Science Department",
    meetingSchedule: "Tuesdays · 3:30 PM · Science Lab",
  },
  "drama-club": {
    icon: "🎭",
    tagline: "Act • Produce • Perform",
    pitch: "Acting, stage production, and live performances.",
    skills: ["Acting", "Stage crew", "Lighting", "Sound"],
    xpOpportunities: ["Production XP", "Performance milestones"],
    interestTags: ["theater", "arts", "performance"],
    discoveryFilters: ["all", "arts"],
    advisor: "Theater Production Academy",
    meetingSchedule: "Mon & Wed · 3:30 PM · Auditorium",
    careerConnections: ["Theater", "Broadcast media", "Event production"],
  },
  "art-club": {
    icon: "🎨",
    tagline: "Create • Exhibit • Inspire",
    pitch: "Drawing, painting, digital art, and creative expression.",
    skills: ["Drawing", "Painting", "Digital art", "Design"],
    xpOpportunities: ["Portfolio items", "Showcase XP"],
    interestTags: ["art", "creativity", "design"],
    discoveryFilters: ["all", "arts"],
    advisor: "Fine Arts Department",
    meetingSchedule: "Thursdays · 3:15 PM · Art Studio",
  },
  "chess-club": {
    icon: "♟",
    tagline: "Strategy • Focus • Competition",
    pitch: "Friendly competition and strategic thinking.",
    skills: ["Strategy", "Critical thinking", "Patience"],
    xpOpportunities: ["Tournament XP"],
    interestTags: ["chess", "strategy", "academics"],
    discoveryFilters: ["all", "academics"],
    advisor: "Academic Team Coach",
    meetingSchedule: "Fridays · 3:15 PM · Library",
  },
  "national-honor-society": {
    icon: "📖",
    tagline: "Scholarship • Service • Character",
    pitch: "Leadership, scholarship, and service at the highest level.",
    skills: ["Scholarship", "Service leadership", "Character"],
    xpOpportunities: ["Honor society milestones"],
    interestTags: ["academics", "leadership", "service"],
    discoveryFilters: ["all", "academics", "leadership"],
    invitationRequired: true,
    advisor: "NHS Faculty Advisor",
    meetingSchedule: "By invitation · Monthly",
  },
  "prayer-club": {
    icon: "🙏",
    tagline: "Faith • Fellowship • Prayer",
    pitch: "Faith, fellowship, and prayer with campus ministry.",
    skills: ["Faith formation", "Community", "Reflection"],
    xpOpportunities: ["Campus ministry XP"],
    interestTags: ["faith", "prayer", "ministry"],
    discoveryFilters: ["all", "faith"],
    advisor: "Campus Ministry",
    meetingSchedule: "Wednesdays · 7:30 AM · Chapel",
  },
  "pro-life-alliance-of-youth": {
    icon: "✝️",
    tagline: "Faith • Advocacy • Service",
    pitch: "Faith-centered advocacy and service for life.",
    skills: ["Advocacy", "Service", "Leadership"],
    xpOpportunities: ["Service hours"],
    interestTags: ["faith", "service"],
    discoveryFilters: ["all", "faith", "service"],
    advisor: "Campus Ministry",
    meetingSchedule: "Bi-weekly · Chapel conference room",
  },
  sadd: {
    icon: "❤️",
    tagline: "Wellness • Choices • Support",
    pitch: "Students Against Destructive Decisions — healthy choices matter.",
    skills: ["Peer support", "Awareness", "Leadership"],
    xpOpportunities: ["Wellness challenges"],
    interestTags: ["wellness", "service", "leadership"],
    discoveryFilters: ["all", "service"],
    advisor: "Guidance Office",
    meetingSchedule: "Monthly · Guidance suite",
  },
  "pep-club": {
    icon: "📣",
    tagline: "Spirit • Energy • School pride",
    pitch: "Support Madonna athletics and school spirit.",
    skills: ["School spirit", "Event support", "Teamwork"],
    xpOpportunities: ["Game day XP", "Spirit points"],
    interestTags: ["spirit", "athletics", "leadership"],
    discoveryFilters: ["all", "leadership", "service"],
    advisor: "Athletics Department",
    meetingSchedule: "Fridays before home games",
  },
  broadcasting: {
    icon: "🎥",
    tagline: "Live production • Media • Storytelling",
    pitch:
      "Madonna’s student broadcast team — morning announcements, games, and campus media.",
    skills: ["Camera", "Audio", "Live production", "Editing"],
    xpOpportunities: ["Broadcast XP", "Production credits"],
    interestTags: ["broadcasting", "media", "photography", "technology"],
    discoveryFilters: ["all", "technology", "arts"],
    advisor: "Broadcasting Advisor",
    meetingSchedule: "Daily · Broadcasting",
    careerConnections: ["Broadcasting", "Journalism", "Film"],
    relatedSlugs: ["it-club"],
    projects: [
      {
        name: "Blue Don Live",
        description: "Livestream games and school events for the whole campus.",
      },
      {
        name: "Morning announcements",
        description: "Produce daily campus news and video packages.",
      },
    ],
    currentProject: "Live game broadcasts and daily morning announcements.",
    leadership: [
      { role: "Broadcast Director", name: "Student Lead" },
      { role: "Producer", name: "Student Officer" },
    ],
  },
  "cricut-club": {
    icon: "✂️",
    tagline: "Design • Cut • Create",
    pitch: "Maker projects with Cricut — vinyl, HTV, and campus creatives.",
    skills: ["Cricut Design Space", "Vinyl & HTV", "Weeding", "Heat press"],
    xpOpportunities: ["Production runs", "Fundraiser merch", "Campus signage"],
    interestTags: ["art", "makers", "design", "cricut", "crafts"],
    discoveryFilters: ["all", "arts"],
    advisor: "Cricut & Makers Academy",
    meetingSchedule: "Tuesdays · 3:15 PM · Maker Lab",
    careerConnections: ["Graphic production", "Small business", "Product design"],
    relatedSlugs: ["art-club", "it-club"],
    projects: [
      {
        name: "Spirit wear",
        description: "Design and press Madonna shirts and event merch.",
      },
      {
        name: "Campus signage",
        description: "Vinyl signage for clubs, games, and fundraisers.",
      },
    ],
    currentProject: "Senior shirts production and club fundraiser merch.",
    certifications: ["Maker Foundation", "Cricut Production Specialist"],
    labs: [
      { label: "Cricut Maker Studio", href: "/labs" },
      { label: "Design Space Simulator", href: "/simulators" },
    ],
    leadership: [
      { role: "President", name: "Student Lead" },
      { role: "Production Lead", name: "Student Officer" },
    ],
  },
};

export function getOrganizationProfile(
  slug: string,
  fallback?: { name: string; description: string; category?: string },
): OrganizationProfile {
  const custom = ORGANIZATION_PROFILES[slug];

  if (custom) {
    return custom;
  }

  const categoryIcon: Record<string, string> = {
    technology: "💻",
    "fine-arts": "🎨",
    academic: "🧪",
    "service-leadership": "🌎",
    faith: "✝️",
    wellness: "❤️",
    "athletics-fall": "🏈",
    "athletics-winter": "🏀",
    "athletics-spring": "⚾",
  };

  return {
    icon: categoryIcon[fallback?.category ?? ""] ?? "🏫",
    tagline: "Madonna student organization",
    pitch: fallback?.description ?? "Discover your place in the Madonna community.",
    ...DEFAULT_PROFILE,
    discoveryFilters: ["all"],
  };
}

export function matchesDiscoveryFilter(
  profile: OrganizationProfile,
  filter: DiscoveryFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  return profile.discoveryFilters.includes(filter);
}
