/**
 * W20 · Club Worlds — Club workspace configuration.
 *
 * Every club "feels like its own app": a personality (theme accent), a set of
 * feature sections with seed data, and a signature interactive tool. This
 * config maps an organization slug to its {@link ClubType} and drives the
 * `?tab=workspace` experience on `/organizations/[slug]`.
 *
 * CLASS orgs get grade-specific workspaces; TEAM orgs get sport workspaces.
 * Everything here is config + seed (no backend required for the MVP).
 */

import type {
  ClassGrade,
  ClubType,
  SportType,
} from "@/config/club-milestones";

/** A single feature "card" inside a club workspace. */
export type WorkspaceFeature = {
  id: string;
  title: string;
  description: string;
  icon: string;
  /** Seed list rendered as bullet chips inside the feature card. */
  items?: string[];
  /** Clickable links rendered instead of plain items when set. */
  itemLinks?: { label: string; href: string }[];
  /** Primary destination for the feature card CTA. */
  href?: string;
  badge?: string;
};

/** Interactive signature widget kinds implemented in club-workspace/. */
export type SignatureKind =
  | "impact-counter"
  | "needs-map"
  | "service-passport"
  | "community-stories"
  | "proposal-flow"
  | "poll"
  | "character-builder"
  | "gallery-walkthrough"
  | "chess-puzzle"
  | "experiment-vault"
  | "spirit-meter"
  | "prayer-requests"
  | "decision-simulator"
  | "mentor-center"
  | "innovation-lab"
  | "generic";

export type SignatureTool = {
  kind: SignatureKind;
  title: string;
  description: string;
  icon: string;
};

/** Subtle per-club color personality applied as CSS variables on the page. */
export type ClubTheme = {
  /** Primary accent (buttons, bars, highlights). */
  accent: string;
  /** Soft tint used for backgrounds. */
  soft: string;
  label: string;
};

export type ClubWorkspace = {
  clubType: ClubType;
  theme: ClubTheme;
  /** Short "what this workspace is" line shown atop the workspace tab. */
  intro: string;
  features: WorkspaceFeature[];
  signature: SignatureTool;
};

export const CLUB_THEMES: Record<ClubType, ClubTheme> = {
  interact: { accent: "#E4572E", soft: "#E4572E14", label: "Service Orange" },
  "student-council": { accent: "#2F6DF6", soft: "#2F6DF614", label: "Council Blue" },
  drama: { accent: "#8E44AD", soft: "#8E44AD14", label: "Stage Violet" },
  art: { accent: "#EC4899", soft: "#EC489914", label: "Studio Pink" },
  chess: { accent: "#334155", soft: "#33415514", label: "Checkmate Slate" },
  science: { accent: "#0EA5A5", soft: "#0EA5A514", label: "Lab Teal" },
  pep: { accent: "#F59E0B", soft: "#F59E0B14", label: "Spirit Gold" },
  prayer: { accent: "#6D5BD0", soft: "#6D5BD014", label: "Chapel Indigo" },
  sadd: { accent: "#059669", soft: "#05966914", label: "Wellness Green" },
  nhs: { accent: "#0A2342", soft: "#0A234214", label: "Honor Navy" },
  it: { accent: "#2F80ED", soft: "#2F80ED14", label: "Blue Don Blue" },
  broadcasting: { accent: "#E11D48", soft: "#E11D4814", label: "Broadcast Rose" },
  cricut: { accent: "#DB2777", soft: "#DB277714", label: "Maker Pink" },
  generic: { accent: "#2F80ED", soft: "#2F80ED14", label: "Campus Blue" },
};

/** Maps organization slug → club archetype. */
export const CLUB_TYPE_BY_SLUG: Record<string, ClubType> = {
  "interact-club-high-school": "interact",
  "interact-club-junior-high": "interact",
  "student-council-high-school": "student-council",
  "student-council-junior-high": "student-council",
  "drama-club": "drama",
  "art-club": "art",
  "chess-club": "chess",
  "science-club": "science",
  "pep-club": "pep",
  "prayer-club": "prayer",
  sadd: "sadd",
  "national-honor-society": "nhs",
  "it-club": "it",
  broadcasting: "broadcasting",
  "cricut-club": "cricut",
};

const WORKSPACES: Record<ClubType, Omit<ClubWorkspace, "clubType" | "theme">> = {
  interact: {
    intro: "Your community impact command center — service projects, hours, and partners.",
    features: [
      {
        id: "int-dashboard",
        title: "Impact Dashboard",
        description: "Live snapshot of hours, projects, and people served.",
        icon: "📊",
        items: ["1,240 service hours YTD", "18 active projects", "9 community partners"],
      },
      {
        id: "int-projects",
        title: "Service Projects",
        description: "Current and upcoming volunteer projects.",
        icon: "🤝",
        items: ["Riverbank cleanup", "Senior center visits", "Backpack build day", "Habitat framing"],
      },
      {
        id: "int-ops",
        title: "Volunteer Ops",
        description: "Sign up for shifts and track your hours.",
        icon: "🗓️",
        items: ["Weekend food bank", "Tutoring at St. Mary's", "Park restoration"],
      },
      {
        id: "int-partners",
        title: "Community Partners",
        description: "Organizations we serve alongside.",
        icon: "🏘️",
        items: ["Rotary Club", "Local food bank", "Humane society", "Parish outreach"],
      },
      {
        id: "int-drives",
        title: "Donation Drives",
        description: "Active drives and collection goals.",
        icon: "📦",
        items: ["Winter coat drive — 62% to goal", "Canned food — 340 items", "School supplies — planning"],
      },
    ],
    signature: {
      kind: "impact-counter",
      title: "Community Impact Counter",
      description: "Watch the collective impact of Interact add up in real time.",
      icon: "💥",
    },
  },
  "student-council": {
    intro: "Run the school: events, budgets, polls, and the proposal pipeline.",
    features: [
      {
        id: "sc-events",
        title: "Event Board",
        description: "Everything Council is planning right now.",
        icon: "📋",
        items: ["Fall pep rally", "Winter formal", "Blood drive", "Teacher appreciation week"],
      },
      {
        id: "sc-spirit",
        title: "Spirit Week & Homecoming",
        description: "Theme days, floats, and homecoming plans.",
        icon: "🎉",
        items: ["Pajama day", "Decades day", "Class color wars", "Homecoming court"],
      },
      {
        id: "sc-budget",
        title: "Budget Tracker",
        description: "Where the student activity fund goes.",
        icon: "💰",
        items: ["$12,400 total budget", "$4,180 spent", "Dance: $3,000 allocated", "Charity: $1,500"],
      },
      {
        id: "sc-minutes",
        title: "Meeting Minutes",
        description: "Notes and action items from every meeting.",
        icon: "📝",
        items: ["Sept 8 — budget approved", "Sept 22 — homecoming theme", "Oct 6 — proposal review"],
      },
      {
        id: "sc-elections",
        title: "Elections",
        description: "Officer races and voting windows.",
        icon: "🗳️",
        items: ["President", "VP", "Secretary", "Treasurer", "Class reps"],
      },
    ],
    signature: {
      kind: "proposal-flow",
      title: "Student Proposals",
      description: "Submit → vote → admin approve → public progress. Democracy in action.",
      icon: "📜",
    },
  },
  drama: {
    intro: "Backstage HQ — cast lists, rehearsals, scripts, and stagecraft.",
    features: [
      {
        id: "dr-cast",
        title: "Cast List",
        description: "Who's playing who this season.",
        icon: "🎭",
        items: ["Lead — TBD auditions", "Ensemble (12)", "Understudies (4)"],
      },
      {
        id: "dr-rehearsal",
        title: "Rehearsal Calendar",
        description: "Blocking, run-throughs, and tech week.",
        icon: "📅",
        items: ["Mon/Wed table read", "Fri blocking", "Tech week Nov 4–8", "Dress rehearsal Nov 9"],
      },
      {
        id: "dr-scripts",
        title: "Script Library",
        description: "Scenes and sides for the current production.",
        icon: "📚",
        items: ["Act I sides", "Act II sides", "Full libretto", "Director's notes"],
      },
      {
        id: "dr-inventory",
        title: "Costume & Prop Inventory",
        description: "Track wardrobe and props (seed list).",
        icon: "🎽",
        items: ["Period costumes (24)", "Hand props (40)", "Set dressing", "Makeup kits"],
      },
      {
        id: "dr-crew",
        title: "Stage Crew",
        description: "Lights, sound, and set construction teams.",
        icon: "🔧",
        items: ["Lighting board op", "Sound design", "Set build", "Stage management"],
      },
    ],
    signature: {
      kind: "character-builder",
      title: "Character Builder",
      description: "Develop a character's backstory, objectives, and arc before auditions.",
      icon: "🎬",
    },
  },
  art: {
    intro: "Your studio and gallery — create, challenge, exhibit, and compete.",
    features: [
      {
        id: "art-gallery",
        title: "Club Gallery",
        description: "Member works on display.",
        icon: "🖼️",
        items: ["Charcoal portraits", "Acrylic landscapes", "Digital illustration", "Ceramics"],
      },
      {
        id: "art-theme",
        title: "Monthly Theme",
        description: "This month's creative prompt.",
        icon: "🎯",
        badge: "October",
        items: ["Theme: \"Light & Shadow\"", "Any medium", "Due Oct 28"],
      },
      {
        id: "art-challenges",
        title: "Challenges",
        description: "Skill-building creative challenges.",
        icon: "⚡",
        items: ["30-day sketch", "Color study", "One-line drawing", "Self portrait"],
      },
      {
        id: "art-supplies",
        title: "Supply Inventory",
        description: "Studio supplies on hand (seed list).",
        icon: "🎨",
        items: ["Acrylic sets (10)", "Canvas panels (30)", "Clay (40 lb)", "Digital tablets (6)"],
      },
      {
        id: "art-competitions",
        title: "Competitions",
        description: "External shows and contests.",
        icon: "🏅",
        items: ["Regional youth art show", "Scholastic Art Awards", "Diocese art contest"],
      },
    ],
    signature: {
      kind: "gallery-walkthrough",
      title: "Virtual Gallery Walkthrough",
      description: "Stroll a curated virtual exhibition of member masterpieces.",
      icon: "🏛️",
    },
  },
  chess: {
    intro: "The board room — rankings, brackets, puzzles, and openings.",
    features: [
      {
        id: "ch-rankings",
        title: "Club Rankings",
        description: "Current club ladder standings.",
        icon: "📈",
        items: ["1. A. Reyes (1640)", "2. J. Kim (1580)", "3. M. Osei (1520)", "4. L. Novak (1495)"],
      },
      {
        id: "ch-brackets",
        title: "Tournament Brackets",
        description: "Active and upcoming brackets.",
        icon: "🏆",
        items: ["Fall Open — round 2", "Blitz night — weekly", "Winter Classic — Dec"],
      },
      {
        id: "ch-openings",
        title: "Opening Library",
        description: "Study core openings with the club.",
        icon: "📖",
        items: ["Italian Game", "Sicilian Defense", "Queen's Gambit", "Ruy López"],
      },
      {
        id: "ch-history",
        title: "Match History",
        description: "Recent results across the club.",
        icon: "🕰️",
        items: ["Reyes 1–0 Kim", "Osei ½–½ Novak", "Kim 1–0 Patel"],
      },
      {
        id: "ch-leaderboard",
        title: "Leaderboard",
        description: "Most wins this season.",
        icon: "🥇",
        items: ["Reyes — 22 wins", "Kim — 19 wins", "Osei — 15 wins"],
      },
    ],
    signature: {
      kind: "chess-puzzle",
      title: "AI Chess Coach · Puzzle of the Day",
      description: "Solve a daily tactic and reveal the coach's line.",
      icon: "🧩",
    },
  },
  science: {
    intro: "The lab bench — notebooks, experiments, competitions, and research.",
    features: [
      {
        id: "sci-notebook",
        title: "Lab Notebook",
        description: "Log hypotheses, methods, and results.",
        icon: "📓",
        items: ["Entry: pH & plant growth", "Entry: crystal formation", "Entry: circuit basics"],
      },
      {
        id: "sci-library",
        title: "Experiment Library",
        description: "Ready-to-run experiments by topic.",
        icon: "🧪",
        items: ["Elephant toothpaste", "Density tower", "Electrolysis", "Chromatography"],
      },
      {
        id: "sci-competitions",
        title: "Competitions",
        description: "Science fair and olympiad tracks.",
        icon: "🏆",
        items: ["Regional science fair", "Science Olympiad", "Envirothon"],
      },
      {
        id: "sci-trips",
        title: "Field Trips",
        description: "Upcoming excursions.",
        icon: "🚌",
        items: ["Planetarium", "University lab tour", "Nature preserve"],
      },
      {
        id: "sci-news",
        title: "Science News",
        description: "What's happening in STEM this week.",
        icon: "📰",
        items: ["New exoplanet found", "CRISPR breakthrough", "Fusion milestone"],
      },
    ],
    signature: {
      kind: "experiment-vault",
      title: "Experiment Vault",
      description: "Unlock step-by-step experiments with safety notes and materials.",
      icon: "🔐",
    },
  },
  pep: {
    intro: "Bring the noise — game calendar, themes, chants, and spirit.",
    features: [
      {
        id: "pep-games",
        title: "Game Calendar",
        description: "Every home game and student section plan.",
        icon: "🗓️",
        items: ["Fri — Football vs. Central", "Tue — Volleyball playoffs", "Sat — Basketball opener"],
      },
      {
        id: "pep-themes",
        title: "Theme Nights",
        description: "Student section dress themes.",
        icon: "🎨",
        items: ["Blackout", "USA night", "Neon", "Blue & gold"],
      },
      {
        id: "pep-spiritweek",
        title: "Spirit Week",
        description: "Class competitions and dress-up days.",
        icon: "🎉",
        items: ["Twin day", "Jersey day", "Class colors", "Pep rally"],
      },
      {
        id: "pep-chants",
        title: "Chants & Cheers",
        description: "Learn the student section playbook.",
        icon: "🔊",
        items: ["\"We are the Dons\"", "Defense clap", "Roll call", "Victory chant"],
      },
      {
        id: "pep-attendance",
        title: "Attendance",
        description: "Track student section turnout.",
        icon: "📊",
        items: ["Avg. 210 students / game", "Best: 340 (rivalry)", "Streak: 6 games"],
      },
    ],
    signature: {
      kind: "spirit-meter",
      title: "Spirit Meter",
      description: "Crank up the crowd energy and watch the meter climb.",
      icon: "🔥",
    },
  },
  prayer: {
    intro: "A quiet corner of campus — prayer wall, intentions, and reflection.",
    features: [
      {
        id: "pr-intentions",
        title: "Daily Intentions",
        description: "Today's shared prayer intentions.",
        icon: "🕯️",
        items: ["For those who are sick", "For our seniors", "For peace", "For the parish"],
      },
      {
        id: "pr-rosary",
        title: "Rosary Schedule",
        description: "When the club prays together.",
        icon: "📿",
        items: ["Wed 7:30 AM — Chapel", "First Fridays", "Marian feast days"],
      },
      {
        id: "pr-journal",
        title: "Reflection Journal",
        description: "Private space for reflection prompts.",
        icon: "📖",
        items: ["Gratitude prompt", "Scripture of the week", "Examen"],
      },
      {
        id: "pr-saints",
        title: "Saint Study",
        description: "Learn from the lives of the saints.",
        icon: "😇",
        items: ["St. Thérèse", "St. Maximilian Kolbe", "St. Teresa of Ávila"],
      },
      {
        id: "pr-bible",
        title: "Bible Reading Plan",
        description: "Follow a shared reading plan.",
        icon: "✝️",
        items: ["Gospel of John (21 days)", "Psalms of praise", "Acts of the Apostles"],
      },
    ],
    signature: {
      kind: "prayer-requests",
      title: "Prayer Wall",
      description: "Post a moderated prayer request and light a candle for others.",
      icon: "🙏",
    },
  },
  sadd: {
    intro: "Make the smart call — campaigns, speakers, wellness, and resources.",
    features: [
      {
        id: "sadd-campaigns",
        title: "Awareness Campaigns",
        description: "Active campaigns this semester.",
        icon: "📢",
        items: ["Safe driving week", "Vaping awareness", "Mental health month", "Prom promise"],
      },
      {
        id: "sadd-speakers",
        title: "Guest Speakers",
        description: "Upcoming assemblies and talks.",
        icon: "🎤",
        items: ["Survivor story assembly", "Local officer Q&A", "Counselor panel"],
      },
      {
        id: "sadd-wellness",
        title: "Wellness",
        description: "Habits and challenges for a healthy year.",
        icon: "💪",
        items: ["Sleep challenge", "Screen-time reset", "Mindfulness Mondays"],
      },
      {
        id: "sadd-resources",
        title: "Resources",
        description: "Where to get help, fast.",
        icon: "🆘",
        items: ["Crisis text line", "School counselors", "Trusted adults list"],
      },
    ],
    signature: {
      kind: "decision-simulator",
      title: "Decision Simulator",
      description: "Walk through real scenarios and see how choices play out.",
      icon: "🧭",
    },
  },
  nhs: {
    intro: "Scholarship, service, leadership, character — tracked in one place.",
    features: [
      {
        id: "nhs-tracking",
        title: "Service & Leadership Tracking",
        description: "Log hours toward chapter requirements.",
        icon: "📊",
        items: ["Service: 14/20 hrs", "Leadership: 2 roles", "Tutoring: 8 hrs"],
      },
      {
        id: "nhs-tutoring",
        title: "Tutoring Schedule",
        description: "Sign up to tutor underclassmen.",
        icon: "🧑‍🏫",
        items: ["Mon — Algebra", "Tue — Chemistry", "Thu — Writing lab"],
      },
      {
        id: "nhs-applications",
        title: "Applications",
        description: "Induction and renewal applications.",
        icon: "📝",
        items: ["New member application", "Officer application", "Renewal form"],
      },
      {
        id: "nhs-requirements",
        title: "Requirements",
        description: "What it takes to stay in good standing.",
        icon: "✅",
        items: ["3.5 GPA", "20 service hrs/yr", "2 leadership roles", "Character review"],
      },
      {
        id: "nhs-scholarships",
        title: "Scholarships",
        description: "NHS scholarship opportunities.",
        icon: "🎓",
        items: ["NHS national scholarship", "Local chapter award", "Merit stipend"],
      },
    ],
    signature: {
      kind: "mentor-center",
      title: "Mentor Center",
      description: "Match with a mentor or mentee and track your sessions.",
      icon: "🌟",
    },
  },
  it: {
    intro: "The tech nerve center — repair, broadcast, design, and innovation.",
    features: [
      {
        id: "it-repair",
        title: "Repair Center",
        description: "Submit IT requests via the help desk email — include device details and steps tried.",
        icon: "🔧",
        href: "/service-desk#it-help-desk",
        items: ["Email help desk with issue details", "Chromebook screen swaps", "Battery replacements", "Imaging station"],
      },
      {
        id: "it-broadcast",
        title: "Broadcasting",
        description: "Morning announcements and live game production.",
        icon: "🎥",
        href: "/media",
        items: ["Daily announcements", "Friday game livestream", "Coverage booking"],
      },
      {
        id: "it-design",
        title: "Digital Design",
        description: "Graphics, signage, and the school's digital presence.",
        icon: "🎨",
        items: ["Event posters", "Digital signage", "Social graphics", "Yearbook spreads"],
      },
      {
        id: "it-innovation",
        title: "Innovation",
        description: "Prototype projects and competition entries.",
        icon: "💡",
        items: ["Campus app ideas", "3D-printed parts", "Automation scripts"],
      },
      {
        id: "it-labs",
        title: "Labs & Simulators",
        description: "Hands-on learning tracks and interactive simulations.",
        icon: "🧪",
        href: "/labs",
        itemLinks: [
          { label: "Browse all labs", href: "/labs" },
          { label: "Browse all simulators", href: "/simulators" },
          { label: "Networking Fundamentals", href: "/labs" },
          { label: "Cybersecurity Basics", href: "/labs" },
          { label: "Help Desk Simulator", href: "/simulators" },
        ],
      },
      {
        id: "it-finances",
        title: "Club Finances",
        description:
          "Ledger, fundraisers, and balances for IT Club — the campus money desk.",
        icon: "💵",
        href: "/organizations/it-club?tab=finances",
        items: [
          "Ledger deposits & expenses",
          "Fundraiser tracking",
          "CSV export for advisors",
        ],
      },
      {
        id: "it-certs",
        title: "Certifications",
        description: "Industry certification pathways.",
        icon: "📜",
        items: ["CompTIA ITF+", "CompTIA A+", "Google IT Support"],
      },
    ],
    signature: {
      kind: "innovation-lab",
      title: "Innovation Lab",
      description: "Pitch a build, track prototypes, and ship campus tech.",
      icon: "🚀",
    },
  },
  broadcasting: {
    intro: "Broadcast command center — record, go live, upload packages, and crew game day.",
    features: [
      {
        id: "bc-live",
        title: "Go Live",
        description: "Start a Blue Don Live stream from this phone or laptop.",
        icon: "📡",
        href: "/broadcast/phone",
        items: ["Record a clip", "Morning announcements", "Game day"],
      },
      {
        id: "bc-library",
        title: "Media Library",
        description: "Published broadcasts and club uploads.",
        icon: "🎬",
        href: "/organizations/broadcasting?tab=media",
        items: ["School feed", "Club gallery", "Archives"],
      },
      {
        id: "bc-finance",
        title: "Club Finances",
        description: "Track broadcast gear funds and fundraisers.",
        icon: "💰",
        href: "/organizations/broadcasting?tab=finances",
        items: ["Ledger", "Fundraisers", "CSV export"],
      },
      {
        id: "bc-calendar",
        title: "Production Calendar",
        description: "Shoot days, livestreams, and crew calls.",
        icon: "🗓️",
        href: "/calendar?club=broadcasting",
        items: ["Studio bookings", "Game schedule", "Edit deadlines"],
      },
    ],
    signature: {
      kind: "generic",
      title: "Live Desk",
      description: "Jump to the Media Hub when it is time to go on air.",
      icon: "🔴",
    },
  },
  cricut: {
    intro: "Maker lab HQ — design, cut, press, and fundraise with Cricut.",
    features: [
      {
        id: "cr-projects",
        title: "Easy Cheap Creations",
        description: "Dollar-store project ideas with supplies, steps, and pricing.",
        icon: "🛒",
        href: "/cricut/projects",
        items: ["What you need", "Step-by-step", "Cost + sell price"],
      },
      {
        id: "cr-studio",
        title: "Maker Studio",
        description: "Cricut Maker workflow and Design Space practice.",
        icon: "✂️",
        href: "/labs",
        items: ["Blade lab", "Vinyl & HTV", "Heat press"],
      },
      {
        id: "cr-sim",
        title: "Design Space",
        description: "Practice canvas setup and cut prep.",
        icon: "🖥️",
        href: "/simulators",
        items: ["Design Space simulator", "Material settings"],
      },
      {
        id: "cr-finance",
        title: "Club Finances",
        description: "Track supplies, deposits, and merch fundraisers.",
        icon: "💰",
        href: "/organizations/cricut-club?tab=finances",
        items: ["Ledger", "Fundraisers", "CSV export"],
      },
      {
        id: "cr-calendar",
        title: "Production Calendar",
        description: "Club meetings and production deadlines.",
        icon: "🗓️",
        href: "/calendar?club=cricut-club",
        items: ["Weekly meeting", "Senior shirts", "Spirit wear"],
      },
    ],
    signature: {
      kind: "generic",
      title: "Production Queue",
      description: "Track maker orders and fundraiser merch runs.",
      icon: "📦",
    },
  },
  generic: {
    intro: "Your club workspace — tools and resources for members.",
    features: [
      {
        id: "gen-hub",
        title: "Club Hub",
        description: "Everything happening in the club.",
        icon: "🏠",
        items: ["Upcoming meetings", "Active projects", "Member spotlights"],
      },
      {
        id: "gen-events",
        title: "Events",
        description: "Meetings and activities on the calendar.",
        icon: "🗓️",
        items: ["Weekly meeting", "Kickoff social", "Service day"],
      },
      {
        id: "gen-resources",
        title: "Resources",
        description: "Guides and links for members.",
        icon: "📚",
        items: ["Member handbook", "Officer roles", "Getting started"],
      },
    ],
    signature: {
      kind: "generic",
      title: "Club Toolkit",
      description: "Handy tools and links tailored to this club.",
      icon: "🧰",
    },
  },
};

export function getClubType(slug: string): ClubType {
  return CLUB_TYPE_BY_SLUG[slug] ?? "generic";
}

export function getClubTheme(clubType: ClubType): ClubTheme {
  return CLUB_THEMES[clubType] ?? CLUB_THEMES.generic;
}

/** Full workspace (features + signature + theme) for an organization slug. */
export function getClubWorkspace(slug: string): ClubWorkspace {
  const clubType = getClubType(slug);
  const base = WORKSPACES[clubType] ?? WORKSPACES.generic;
  return {
    clubType,
    theme: getClubTheme(clubType),
    ...base,
  };
}

/** True when this slug has a bespoke (non-generic) club workspace. */
export function hasClubWorkspace(slug: string): boolean {
  return slug in CLUB_TYPE_BY_SLUG;
}

// ---------------------------------------------------------------------------
// CLASS workspaces (by grade)
// ---------------------------------------------------------------------------

export type ClassWorkspace = {
  grade: ClassGrade;
  headline: string;
  accent: string;
  soft: string;
  /** Optional class countdown / hero stat. */
  hero?: { label: string; value: string };
  features: WorkspaceFeature[];
};

/** Maps a graduating-class slug to its grade for the current school year. */
export const CLASS_GRADE_BY_SLUG: Record<string, ClassGrade> = {
  "class-of-2027": "senior",
  "class-of-2028": "junior",
  "class-of-2029": "sophomore",
  "class-of-2030": "freshman",
  "class-of-2031": "junior-high",
  "class-of-2032": "junior-high",
};

export const CLASS_WORKSPACES: Record<ClassGrade, Omit<ClassWorkspace, "grade">> = {
  senior: {
    headline: "Senior year HQ — make every last moment count.",
    accent: "#C9A227",
    soft: "#C9A22714",
    hero: { label: "Countdown to graduation", value: "212 days" },
    features: [
      { id: "sr-countdown", title: "Graduation Countdown", description: "Days until you walk the stage.", icon: "⏳", items: ["212 days to graduation", "Senior breakfast — May 12", "Last day — May 30"] },
      { id: "sr-scholarships", title: "Scholarships", description: "Track deadlines and awards.", icon: "🎓", items: ["FAFSA — Oct 1", "Local scholarship packet", "Merit awards tracker"] },
      { id: "sr-prom", title: "Prom", description: "Everything prom.", icon: "🎊", items: ["Venue: Grand Hall", "Tickets on sale April", "Court nominations"] },
      { id: "sr-trip", title: "Senior Trip", description: "Class trip planning.", icon: "✈️", items: ["Destination poll", "Payment plan", "Permission forms"] },
      { id: "sr-collegewall", title: "College Wall", description: "Where the class is headed.", icon: "🏫", items: ["Commitments board", "Acceptance shout-outs", "Decision day — May 1"] },
      { id: "sr-capgown", title: "Cap & Gown", description: "Order and pickup info.", icon: "🎓", items: ["Order deadline", "Measurements", "Pickup week"] },
      { id: "sr-memories", title: "Senior Memories", description: "Yearbook, wills, and photos.", icon: "📸", items: ["Baby photo submissions", "Senior wills", "Superlatives voting"] },
    ],
  },
  junior: {
    headline: "Junior year — the pivot to your future starts now.",
    accent: "#2F80ED",
    soft: "#2F80ED14",
    hero: { label: "Next milestone", value: "Spring SAT" },
    features: [
      { id: "jr-testing", title: "SAT / ACT Prep", description: "Test dates and prep resources.", icon: "📝", items: ["March SAT", "April ACT", "Free Khan prep", "Practice test Saturdays"] },
      { id: "jr-visits", title: "College Visits", description: "Plan campus tours.", icon: "🚌", items: ["Fall visit list", "Virtual tour links", "College fair — Nov"] },
      { id: "jr-ring", title: "Class Ring", description: "Order your class ring.", icon: "💍", items: ["Ring ceremony", "Design options", "Order deadline"] },
      { id: "jr-career", title: "Career Planning", description: "Explore paths and internships.", icon: "🧭", items: ["Interest inventory", "Job shadow day", "Resume workshop"] },
    ],
  },
  sophomore: {
    headline: "Sophomore year — explore, choose, and grow.",
    accent: "#0EA5A5",
    soft: "#0EA5A514",
    features: [
      { id: "so-career", title: "Career Exploration", description: "Discover fields that fit you.", icon: "🔍", items: ["Career quiz", "Industry spotlights", "Guest pros"] },
      { id: "so-academy", title: "Academy Selection", description: "Choose your academy pathway.", icon: "🏛️", items: ["Academy fair", "Pathway comparison", "Advisor meeting"] },
      { id: "so-volunteer", title: "Volunteer Growth", description: "Build your service record.", icon: "🤝", items: ["Service hour goal: 20", "Club service days", "Summer opportunities"] },
    ],
  },
  freshman: {
    headline: "Freshman year — find your place at Madonna.",
    accent: "#8E44AD",
    soft: "#8E44AD14",
    features: [
      { id: "fr-findplace", title: "Find Your Place", description: "Match with clubs and academies.", icon: "🧭", items: ["Take the interest quiz", "Recommended clubs", "Meet-a-club week"] },
      { id: "fr-clubs", title: "Club Discovery", description: "Browse every club and team.", icon: "🎯", items: ["Club fair — Sept", "Try-it meetings", "Sign-up sheets"] },
      { id: "fr-tour", title: "Campus Tour", description: "Learn your way around.", icon: "🗺️", items: ["Building map", "Where to find help", "Campus calendar"] },
      { id: "fr-mentors", title: "Mentors", description: "Connect with an upperclassman.", icon: "🌟", items: ["Big/little program", "Study buddies", "Advisory group"] },
    ],
  },
  "junior-high": {
    headline: "Junior high — explore, discover, and get ready.",
    accent: "#F59E0B",
    soft: "#F59E0B14",
    features: [
      { id: "jh-challenges", title: "Explorer Challenges", description: "Fun challenges to try new things.", icon: "🏅", items: ["Read 5 books", "Join a club", "Try a sport", "Lead a project"] },
      { id: "jh-scavenger", title: "Campus Scavenger Hunt", description: "Get to know the school.", icon: "🔎", items: ["Find the chapel", "Meet the librarian", "Locate the labs"] },
      { id: "jh-study", title: "Study Skills", description: "Build strong habits early.", icon: "📚", items: ["Planner setup", "Note-taking basics", "Test prep tips"] },
      { id: "jh-transition", title: "Transition to High School", description: "Get ready for what's next.", icon: "🚀", items: ["What changes in 9th grade", "Meet HS teachers", "Academy preview"] },
    ],
  },
};

export function getClassGrade(slug: string): ClassGrade | null {
  return CLASS_GRADE_BY_SLUG[slug] ?? null;
}

export function getClassWorkspace(slug: string): ClassWorkspace | null {
  const grade = getClassGrade(slug);
  if (!grade) {
    return null;
  }
  return { grade, ...CLASS_WORKSPACES[grade] };
}

// ---------------------------------------------------------------------------
// ATHLETICS workspaces (by sport)
// ---------------------------------------------------------------------------

export type SportWorkspace = {
  sport: SportType;
  accent: string;
  soft: string;
  intro: string;
  features: WorkspaceFeature[];
};

/** Maps a team slug to its sport archetype. */
export const SPORT_TYPE_BY_SLUG: Record<string, SportType> = {
  football: "football",
  "boys-basketball": "basketball",
  "girls-basketball": "basketball",
  "cross-country": "cross-country",
  golf: "golf",
};

const SPORT_ACCENT = "#0A2342";
const SPORT_SOFT = "#0A234214";

export const SPORT_WORKSPACES: Record<SportType, Omit<SportWorkspace, "sport">> = {
  football: {
    accent: SPORT_ACCENT,
    soft: SPORT_SOFT,
    intro: "Friday night lights — playbook, film, stats, and roster.",
    features: [
      { id: "fb-playbook", title: "Playbook", description: "Offensive and defensive schemes.", icon: "📘", items: ["Base offense", "Red zone package", "Blitz packages", "Special teams"] },
      { id: "fb-film", title: "Film Room", description: "Breakdown and opponent scouting.", icon: "🎞️", items: ["Last game film", "Opponent tendencies", "Position cut-ups"] },
      { id: "fb-stats", title: "Team Stats", description: "Season stat leaders.", icon: "📊", items: ["Passing: 1,840 yds", "Rushing: 1,220 yds", "Record: 6–2"] },
      { id: "fb-roster", title: "Roster", description: "Depth chart and numbers.", icon: "🧑‍🤝‍🧑", items: ["Varsity (44)", "Captains (4)", "Depth chart"] },
      { id: "fb-practice", title: "Practice Schedule", description: "Weekly practice plan.", icon: "🗓️", items: ["Mon lift", "Tue–Thu practice", "Fri walkthrough", "Game day"] },
    ],
  },
  basketball: {
    accent: SPORT_ACCENT,
    soft: SPORT_SOFT,
    intro: "On the hardwood — shooting, stats, and scouting.",
    features: [
      { id: "bb-shooting", title: "Shooting Tracker", description: "Log makes and percentages.", icon: "🎯", items: ["FG%: 46%", "3PT%: 34%", "FT%: 71%", "Weekly shot goals"] },
      { id: "bb-stats", title: "Team Stats", description: "Box scores and leaders.", icon: "📊", items: ["PPG: 62", "Rebounds: 34", "Record: 9–3"] },
      { id: "bb-roster", title: "Roster", description: "Lineup and rotations.", icon: "🧑‍🤝‍🧑", items: ["Starting 5", "Bench rotation", "Captains"] },
      { id: "bb-practice", title: "Practice Schedule", description: "Practice and film times.", icon: "🗓️", items: ["Daily 3:30 PM", "Film Monday", "Shootaround game days"] },
    ],
  },
  "cross-country": {
    accent: SPORT_ACCENT,
    soft: SPORT_SOFT,
    intro: "Chase the PR — times, routes, and training.",
    features: [
      { id: "xc-prs", title: "Personal Records", description: "Track PRs across distances.", icon: "⏱️", items: ["5K PR board", "Season bests", "PR alerts"] },
      { id: "xc-routes", title: "Route Maps", description: "Training and race courses.", icon: "🗺️", items: ["Home course map", "Long run loop", "Tempo route"] },
      { id: "xc-training", title: "Training Log", description: "Weekly mileage and workouts.", icon: "📈", items: ["Weekly mileage", "Interval days", "Recovery runs"] },
      { id: "xc-meets", title: "Meet Schedule", description: "Upcoming meets and invitationals.", icon: "🗓️", items: ["League invite", "Sectionals", "State qualifier"] },
    ],
  },
  golf: {
    accent: SPORT_ACCENT,
    soft: SPORT_SOFT,
    intro: "Fairways and greens — scores, stats, and tee times.",
    features: [
      { id: "gf-scores", title: "Score Tracker", description: "Log rounds and handicaps.", icon: "⛳", items: ["Season scoring avg", "Best round: 38", "Handicap index"] },
      { id: "gf-stats", title: "Stats", description: "Fairways, greens, and putts.", icon: "📊", items: ["Fairways hit %", "GIR %", "Putts per round"] },
      { id: "gf-schedule", title: "Match Schedule", description: "Tee times and courses.", icon: "🗓️", items: ["League matches", "Home course", "Conference tourney"] },
      { id: "gf-roster", title: "Roster", description: "Team lineup.", icon: "🧑‍🤝‍🧑", items: ["Varsity 6", "JV", "Match lineup"] },
    ],
  },
  generic: {
    accent: SPORT_ACCENT,
    soft: SPORT_SOFT,
    intro: "Team HQ — roster, schedule, stats, and practice.",
    features: [
      { id: "sp-roster", title: "Roster", description: "Team members and captains.", icon: "🧑‍🤝‍🧑", items: ["Varsity roster", "Captains", "Coaching staff"] },
      { id: "sp-schedule", title: "Schedule", description: "Games and matches.", icon: "🗓️", items: ["Season schedule", "Home games", "Playoffs"] },
      { id: "sp-stats", title: "Team Stats", description: "Season performance.", icon: "📊", items: ["Record", "Stat leaders", "Standings"] },
      { id: "sp-practice", title: "Practice", description: "Practice plan and times.", icon: "🏋️", items: ["Weekly practice", "Conditioning", "Film"] },
    ],
  },
};

export function getSportType(slug: string): SportType {
  return SPORT_TYPE_BY_SLUG[slug] ?? "generic";
}

export function getSportWorkspace(slug: string): SportWorkspace {
  const sport = getSportType(slug);
  const base = SPORT_WORKSPACES[sport] ?? SPORT_WORKSPACES.generic;
  return { sport, ...base };
}
