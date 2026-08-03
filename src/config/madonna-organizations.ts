import type { OrganizationType } from "@/generated/prisma/client";

export type OrganizationCategory =
  | "technology"
  | "fine-arts"
  | "academic"
  | "service-leadership"
  | "faith"
  | "wellness"
  | "athletics-fall"
  | "athletics-winter"
  | "athletics-spring"
  | "graduating-class"
  | "school-headquarters";

export type MadonnaOrganizationSeed = {
  id: string;
  slug: string;
  name: string;
  type: OrganizationType;
  category: OrganizationCategory;
  description: string;
  sortOrder: number;
  /** Primary app route when this org maps to an academy or module */
  href?: string;
};

export const ORGANIZATION_CATEGORY_META: Record<
  OrganizationCategory,
  { label: string; emoji: string; description: string }
> = {
  technology: {
    label: "Technology",
    emoji: "💻",
    description: "IT, makers, and digital innovation clubs.",
  },
  "fine-arts": {
    label: "Fine Arts",
    emoji: "🎨",
    description: "Visual arts, drama, and creative performance.",
  },
  academic: {
    label: "Academic",
    emoji: "🧪",
    description: "Scholarship, competition, and honor societies.",
  },
  "service-leadership": {
    label: "Service & Leadership",
    emoji: "🌎",
    description: "Student government, service, and school spirit.",
  },
  faith: {
    label: "Faith",
    emoji: "✝️",
    description: "Campus ministry and faith-centered student groups.",
  },
  wellness: {
    label: "Wellness",
    emoji: "❤️",
    description: "Healthy choices and student support.",
  },
  "athletics-fall": {
    label: "Fall Athletics",
    emoji: "🏈",
    description: "Fall sports teams and cheer.",
  },
  "athletics-winter": {
    label: "Winter Athletics",
    emoji: "🏀",
    description: "Winter sports teams and cheer.",
  },
  "athletics-spring": {
    label: "Spring Athletics",
    emoji: "⚾",
    description: "Spring sports teams.",
  },
  "graduating-class": {
    label: "Graduating Classes",
    emoji: "🎓",
    description: "Class-of pages for every Madonna cohort.",
  },
  "school-headquarters": {
    label: "School Organizations",
    emoji: "🏫",
    description: "Departments and destinations students use every week.",
  },
};

export const MADONNA_ORGANIZATIONS: MadonnaOrganizationSeed[] = [
  // Technology
  {
    id: "org-it-club",
    slug: "it-club",
    name: "IT Club",
    type: "CLUB",
    category: "technology",
    description: "Information Technology Club — devices, help desk skills, and campus tech projects.",
    sortOrder: 1,
    href: "/academies/it",
  },
  {
    id: "org-cricut-club",
    slug: "cricut-club",
    name: "Cricut Club",
    type: "CLUB",
    category: "fine-arts",
    description:
      "Design, cut, and produce maker projects — vinyl, HTV, and campus creatives with Cricut.",
    sortOrder: 2,
    href: "/academies/cricut-makers",
  },
  {
    id: "org-geek-club",
    slug: "geek-club",
    name: "Geek Club",
    type: "CLUB",
    category: "technology",
    description: "Games, coding culture, and technology enthusiasm at Madonna.",
    sortOrder: 3,
  },
  // Fine Arts
  {
    id: "org-art-club",
    slug: "art-club",
    name: "Art Club",
    type: "CLUB",
    category: "fine-arts",
    description: "Studio art, exhibits, and creative projects.",
    sortOrder: 1,
    href: "/academies/graphic-design",
  },
  {
    id: "org-drama-club",
    slug: "drama-club",
    name: "Drama Club",
    type: "CLUB",
    category: "fine-arts",
    description: "Theater, performance, and stage production.",
    sortOrder: 2,
    href: "/academies/theater-production",
  },
  // Academic
  {
    id: "org-science-club",
    slug: "science-club",
    name: "Science Club",
    type: "CLUB",
    category: "academic",
    description: "Experiments, competitions, and STEM exploration.",
    sortOrder: 1,
  },
  {
    id: "org-chess-club",
    slug: "chess-club",
    name: "Chess Club",
    type: "CLUB",
    category: "academic",
    description: "Strategy, tournaments, and scholastic chess.",
    sortOrder: 2,
  },
  {
    id: "org-nhs",
    slug: "national-honor-society",
    name: "National Honor Society (NHS)",
    type: "CLUB",
    category: "academic",
    description: "Scholarship, service, leadership, and character.",
    sortOrder: 3,
  },
  // Service & Leadership
  {
    id: "org-student-council-jh",
    slug: "student-council-junior-high",
    name: "Student Council (Junior High)",
    type: "CLUB",
    category: "service-leadership",
    description: "Junior high student government and campus voice.",
    sortOrder: 1,
  },
  {
    id: "org-student-council-hs",
    slug: "student-council-high-school",
    name: "Student Council (High School)",
    type: "CLUB",
    category: "service-leadership",
    description: "High school student government and campus leadership.",
    sortOrder: 2,
    href: "/academies/student-leadership",
  },
  {
    id: "org-interact-jh",
    slug: "interact-club-junior-high",
    name: "Interact Club (Junior High)",
    type: "CLUB",
    category: "service-leadership",
    description: "Junior high Rotary Interact service and leadership.",
    sortOrder: 3,
  },
  {
    id: "org-interact-hs",
    slug: "interact-club-high-school",
    name: "Interact Club (High School)",
    type: "CLUB",
    category: "service-leadership",
    description: "High school Rotary Interact service and leadership.",
    sortOrder: 4,
  },
  {
    id: "org-pep-club",
    slug: "pep-club",
    name: "Pep Club",
    type: "CLUB",
    category: "service-leadership",
    description: "School spirit, pep rallies, and game-day energy.",
    sortOrder: 5,
  },
  // Faith
  {
    id: "org-play",
    slug: "pro-life-alliance-of-youth",
    name: "Pro-Life Alliance of Youth (PLAY)",
    type: "CLUB",
    category: "faith",
    description: "Faith-centered advocacy and service for life.",
    sortOrder: 1,
  },
  {
    id: "org-prayer-club",
    slug: "prayer-club",
    name: "Prayer Club",
    type: "CLUB",
    category: "faith",
    description: "Prayer, fellowship, and campus ministry connection.",
    sortOrder: 2,
  },
  // Wellness
  {
    id: "org-sadd",
    slug: "sadd",
    name: "Students Against Destructive Decisions (SADD)",
    type: "CLUB",
    category: "wellness",
    description: "Healthy choices, peer support, and positive decision-making.",
    sortOrder: 1,
  },
  // Fall athletics
  {
    id: "org-football",
    slug: "football",
    name: "Football",
    type: "TEAM",
    category: "athletics-fall",
    description: "Madonna Blue Dons football.",
    sortOrder: 1,
  },
  {
    id: "org-girls-volleyball",
    slug: "girls-volleyball",
    name: "Girls Volleyball",
    type: "TEAM",
    category: "athletics-fall",
    description: "Varsity and JV volleyball.",
    sortOrder: 2,
  },
  {
    id: "org-girls-soccer",
    slug: "girls-soccer",
    name: "Girls Soccer",
    type: "TEAM",
    category: "athletics-fall",
    description: "Girls soccer program.",
    sortOrder: 3,
  },
  {
    id: "org-golf",
    slug: "golf",
    name: "Golf (Co-ed)",
    type: "TEAM",
    category: "athletics-fall",
    description: "Co-ed golf team.",
    sortOrder: 4,
  },
  {
    id: "org-cheer-fall",
    slug: "cheer-fall",
    name: "Cheer (Fall)",
    type: "TEAM",
    category: "athletics-fall",
    description: "Fall cheerleading.",
    sortOrder: 5,
  },
  {
    id: "org-cross-country",
    slug: "cross-country",
    name: "Cross Country",
    type: "TEAM",
    category: "athletics-fall",
    description: "Cross country running.",
    sortOrder: 6,
  },
  // Winter athletics
  {
    id: "org-boys-basketball",
    slug: "boys-basketball",
    name: "Boys Basketball",
    type: "TEAM",
    category: "athletics-winter",
    description: "Boys basketball program.",
    sortOrder: 1,
  },
  {
    id: "org-girls-basketball",
    slug: "girls-basketball",
    name: "Girls Basketball",
    type: "TEAM",
    category: "athletics-winter",
    description: "Girls basketball program.",
    sortOrder: 2,
  },
  {
    id: "org-wrestling",
    slug: "wrestling",
    name: "Wrestling",
    type: "TEAM",
    category: "athletics-winter",
    description: "Madonna wrestling.",
    sortOrder: 3,
  },
  {
    id: "org-cheer-winter",
    slug: "cheer-winter",
    name: "Cheer (Winter)",
    type: "TEAM",
    category: "athletics-winter",
    description: "Winter cheerleading.",
    sortOrder: 4,
  },
  // Spring athletics
  {
    id: "org-baseball",
    slug: "baseball",
    name: "Baseball",
    type: "TEAM",
    category: "athletics-spring",
    description: "Madonna baseball.",
    sortOrder: 1,
  },
  {
    id: "org-softball",
    slug: "softball",
    name: "Softball",
    type: "TEAM",
    category: "athletics-spring",
    description: "Madonna softball.",
    sortOrder: 2,
  },
  {
    id: "org-track-field",
    slug: "track-and-field",
    name: "Track & Field",
    type: "TEAM",
    category: "athletics-spring",
    description: "Track and field program.",
    sortOrder: 3,
  },
  {
    id: "org-tennis",
    slug: "tennis",
    name: "Tennis",
    type: "TEAM",
    category: "athletics-spring",
    description: "Madonna tennis.",
    sortOrder: 4,
  },
  // Graduating classes
  {
    id: "org-class-2032",
    slug: "class-of-2032",
    name: "Class of 2032 (7th Grade)",
    type: "CLASS",
    category: "graduating-class",
    description: "Digital headquarters for the Class of 2032.",
    sortOrder: 1,
  },
  {
    id: "org-class-2031",
    slug: "class-of-2031",
    name: "Class of 2031 (8th Grade)",
    type: "CLASS",
    category: "graduating-class",
    description: "Digital headquarters for the Class of 2031.",
    sortOrder: 2,
  },
  {
    id: "org-class-2030",
    slug: "class-of-2030",
    name: "Class of 2030 (Freshmen)",
    type: "CLASS",
    category: "graduating-class",
    description: "Digital headquarters for the Class of 2030.",
    sortOrder: 3,
  },
  {
    id: "org-class-2029",
    slug: "class-of-2029",
    name: "Class of 2029 (Sophomores)",
    type: "CLASS",
    category: "graduating-class",
    description: "Digital headquarters for the Class of 2029.",
    sortOrder: 4,
  },
  {
    id: "org-class-2028",
    slug: "class-of-2028",
    name: "Class of 2028 (Juniors)",
    type: "CLASS",
    category: "graduating-class",
    description: "Digital headquarters for the Class of 2028.",
    sortOrder: 5,
  },
  {
    id: "org-class-2027",
    slug: "class-of-2027",
    name: "Class of 2027 (Seniors)",
    type: "CLASS",
    category: "graduating-class",
    description: "Digital headquarters for the Class of 2027.",
    sortOrder: 6,
  },
  // School headquarters
  {
    id: "org-guidance",
    slug: "guidance-office",
    name: "Guidance Office",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Counseling, scheduling, and student support.",
    sortOrder: 1,
    href: "/hub",
  },
  {
    id: "org-campus-ministry",
    slug: "campus-ministry",
    name: "Campus Ministry",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Faith formation, retreats, and service.",
    sortOrder: 2,
  },
  {
    id: "org-library",
    slug: "library",
    name: "Library",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Research, reading, and learning resources.",
    sortOrder: 3,
    href: "/knowledge",
  },
  {
    id: "org-technology-dept",
    slug: "technology-department",
    name: "Technology Department",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Campus technology, devices, and IT operations.",
    sortOrder: 4,
    href: "/academies/it",
  },
  {
    id: "org-broadcasting-hq",
    slug: "broadcasting",
    name: "Broadcasting",
    type: "CLUB",
    category: "technology",
    description: "Live production, media, and school broadcasts — go live from the campus Media Hub.",
    sortOrder: 0,
    href: "/media",
  },
  {
    id: "org-beautification",
    slug: "beautification-club",
    name: "Beautification Club",
    type: "CLUB",
    category: "school-headquarters",
    description: "Campus gardens, murals, and outdoor improvements.",
    sortOrder: 6,
  },
  {
    id: "org-blue-don-corner-hq",
    slug: "blue-don-corner-hq",
    name: "Blue Don Corner",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Spirit wear, marketplace, and campus store.",
    sortOrder: 7,
    href: "/corner",
  },
  {
    id: "org-service-center-hq",
    slug: "service-center-hq",
    name: "Service Center",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Volunteer hours, service opportunities, and community impact.",
    sortOrder: 8,
    href: "/service",
  },
  {
    id: "org-future-center-hq",
    slug: "future-center-hq",
    name: "Future Center",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Careers, colleges, pathways, and planning.",
    sortOrder: 9,
    href: "/pathways",
  },
  {
    id: "org-admissions",
    slug: "admissions",
    name: "Admissions",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Enrollment, visits, and joining the Madonna family.",
    sortOrder: 10,
  },
  {
    id: "org-alumni",
    slug: "alumni-association",
    name: "Alumni Association",
    type: "DEPARTMENT",
    category: "school-headquarters",
    description: "Graduates, mentorship, and Madonna legacy.",
    sortOrder: 11,
  },
];

export const ATHLETICS_CATEGORIES: OrganizationCategory[] = [
  "athletics-fall",
  "athletics-winter",
  "athletics-spring",
];

export const STUDENT_LIFE_CATEGORY_ORDER: OrganizationCategory[] = [
  "technology",
  "fine-arts",
  "academic",
  "service-leadership",
  "faith",
  "wellness",
  "athletics-fall",
  "athletics-winter",
  "athletics-spring",
  "graduating-class",
  "school-headquarters",
];

export function getOrganizationHref(org: {
  slug: string;
  academy?: { slug: string } | null;
}): string {
  const config = MADONNA_ORGANIZATIONS.find((entry) => entry.slug === org.slug);

  if (config?.href) {
    return config.href;
  }

  if (org.academy) {
    return `/academies/${org.academy.slug}`;
  }

  return `/organizations/${org.slug}`;
}
