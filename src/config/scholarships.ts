/**
 * Scholarship Center — catalog and eligibility metadata (config-driven MVP).
 */

export type ScholarshipCategory =
  | "academic"
  | "athletic"
  | "service"
  | "faith"
  | "stem"
  | "arts"
  | "local";

export type ScholarshipRequirements = {
  gradeMin?: number;
  gradeMax?: number;
  gpaMin?: number;
  classOf?: string[];
  clubs?: string[];
  serviceHoursMin?: number;
  athletics?: boolean;
  faith?: boolean;
  stem?: boolean;
  essayRequired?: boolean;
  leadership?: boolean;
};

export type Scholarship = {
  id: string;
  title: string;
  description: string;
  amount: number;
  amountLabel: string;
  deadline: string;
  category: ScholarshipCategory;
  provider: string;
  requirements: ScholarshipRequirements;
  externalUrl: string;
};

export const SCHOLARSHIP_CATEGORY_LABELS: Record<ScholarshipCategory, string> = {
  academic: "Academic",
  athletic: "Athletic",
  service: "Service",
  faith: "Faith",
  stem: "STEM",
  arts: "Arts",
  local: "Local / WV",
};

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: "madonna-academic-excellence",
    title: "Madonna Academic Excellence Award",
    description:
      "Recognizes top-performing Madonna High School students with strong academic records and campus involvement.",
    amount: 250000,
    amountLabel: "$2,500",
    deadline: "2026-04-15",
    category: "academic",
    provider: "Madonna High School",
    requirements: { gradeMin: 11, gpaMin: 3.5, essayRequired: true },
    externalUrl: "https://www.madonnahs.org/scholarships/academic-excellence",
  },
  {
    id: "wv-hope-scholarship",
    title: "West Virginia HOPE Scholarship",
    description:
      "State-funded award for West Virginia residents pursuing post-secondary education with a solid GPA.",
    amount: 480000,
    amountLabel: "Up to $4,800/yr",
    deadline: "2026-03-01",
    category: "local",
    provider: "West Virginia Higher Education Policy Commission",
    requirements: { gradeMin: 12, gpaMin: 3.0, essayRequired: false },
    externalUrl: "https://www.wvhepc.edu/hope-scholarship",
  },
  {
    id: "wv-promise-scholarship",
    title: "West Virginia PROMISE Scholarship",
    description:
      "Merit-based state scholarship for WV students with exceptional academic achievement.",
    amount: 500000,
    amountLabel: "Up to $5,000/yr",
    deadline: "2026-03-15",
    category: "local",
    provider: "West Virginia Higher Education Policy Commission",
    requirements: { gradeMin: 12, gpaMin: 3.5, essayRequired: true },
    externalUrl: "https://www.wvhepc.edu/promise-scholarship",
  },
  {
    id: "stem-innovators-award",
    title: "STEM Innovators Award",
    description:
      "Supports students active in Madonna STEM academies and technology clubs pursuing engineering or computer science.",
    amount: 150000,
    amountLabel: "$1,500",
    deadline: "2026-05-01",
    category: "stem",
    provider: "Regional Tech Council",
    requirements: {
      gradeMin: 10,
      stem: true,
      clubs: ["it-club", "science-club", "geek-club"],
      essayRequired: true,
    },
    externalUrl: "https://www.regionaltechcouncil.org/stem-innovators",
  },
  {
    id: "it-club-cybersecurity",
    title: "IT Club Cybersecurity Scholarship",
    description:
      "Awarded to IT Club members demonstrating interest in cybersecurity and digital safety.",
    amount: 100000,
    amountLabel: "$1,000",
    deadline: "2026-04-30",
    category: "stem",
    provider: "Madonna IT Club & Asset Pilot EDU",
    requirements: { gradeMin: 9, clubs: ["it-club"], stem: true, essayRequired: true },
    externalUrl: "https://www.madonnahs.org/scholarships/it-cybersecurity",
  },
  {
    id: "national-merit-commended",
    title: "National Merit Commended Scholar",
    description:
      "National recognition and scholarship opportunities for students with outstanding PSAT performance.",
    amount: 250000,
    amountLabel: "$2,500+",
    deadline: "2026-02-01",
    category: "academic",
    provider: "National Merit Scholarship Corporation",
    requirements: { gradeMin: 11, gpaMin: 3.8, essayRequired: true },
    externalUrl: "https://www.nationalmerit.org",
  },
  {
    id: "diocesan-faith-service",
    title: "Diocesan Faith & Service Scholarship",
    description:
      "For students active in campus ministry and community service through faith-based organizations.",
    amount: 120000,
    amountLabel: "$1,200",
    deadline: "2026-04-01",
    category: "faith",
    provider: "Diocese of Wheeling-Charleston",
    requirements: {
      gradeMin: 10,
      faith: true,
      serviceHoursMin: 20,
      clubs: ["campus-ministry", "prayer-club", "interact-club-high-school", "interact-club-junior-high"],
      essayRequired: true,
    },
    externalUrl: "https://www.dwc.org/scholarships/faith-service",
  },
  {
    id: "interact-leadership-grant",
    title: "Interact Club Leadership Grant",
    description:
      "Rotary-sponsored award for Interact members with demonstrated service leadership.",
    amount: 80000,
    amountLabel: "$800",
    deadline: "2026-03-20",
    category: "service",
    provider: "Rotary Club of Wheeling",
    requirements: {
      gradeMin: 9,
      clubs: ["interact-club-high-school", "interact-club-junior-high"],
      serviceHoursMin: 15,
      leadership: true,
      essayRequired: true,
    },
    externalUrl: "https://www.rotary.org/interact-scholarships",
  },
  {
    id: "madonna-blue-don-athlete",
    title: "Madonna Blue Don Scholar-Athlete",
    description:
      "Honors student-athletes who balance competitive athletics with academic commitment.",
    amount: 200000,
    amountLabel: "$2,000",
    deadline: "2026-05-15",
    category: "athletic",
    provider: "Madonna Athletics Boosters",
    requirements: { gradeMin: 10, athletics: true, gpaMin: 2.5, essayRequired: true },
    externalUrl: "https://www.madonnahs.org/athletics/scholar-athlete",
  },
  {
    id: "wv-girls-stem",
    title: "WV Girls in STEM Scholarship",
    description:
      "Encourages young women pursuing science, technology, engineering, and mathematics pathways.",
    amount: 150000,
    amountLabel: "$1,500",
    deadline: "2026-04-10",
    category: "stem",
    provider: "West Virginia STEM Council",
    requirements: { gradeMin: 10, stem: true, gpaMin: 3.0, essayRequired: true },
    externalUrl: "https://www.wvstemcouncil.org/girls-in-stem",
  },
  {
    id: "rotary-youth-leadership",
    title: "Rotary Youth Leadership Award",
    description:
      "For student council officers and emerging campus leaders with a record of service.",
    amount: 100000,
    amountLabel: "$1,000",
    deadline: "2026-03-25",
    category: "service",
    provider: "Rotary International",
    requirements: {
      gradeMin: 10,
      leadership: true,
      clubs: ["student-council-high-school", "student-council-junior-high"],
      essayRequired: true,
    },
    externalUrl: "https://www.rotary.org/youth-leadership",
  },
  {
    id: "pro-life-advocacy",
    title: "Pro-Life Advocacy Scholarship",
    description:
      "Supports students engaged in pro-life education and service through campus ministry programs.",
    amount: 75000,
    amountLabel: "$750",
    deadline: "2026-04-20",
    category: "faith",
    provider: "Pro-Life Alliance of Youth",
    requirements: {
      gradeMin: 9,
      faith: true,
      clubs: ["pro-life-alliance-of-youth", "campus-ministry"],
      essayRequired: true,
    },
    externalUrl: "https://www.madonnahs.org/scholarships/pro-life",
  },
  {
    id: "drama-arts-excellence",
    title: "Drama & Arts Excellence Award",
    description:
      "Celebrates creative achievement in theater, visual arts, and performing arts at Madonna.",
    amount: 100000,
    amountLabel: "$1,000",
    deadline: "2026-04-05",
    category: "arts",
    provider: "Madonna Fine Arts Department",
    requirements: {
      gradeMin: 9,
      clubs: ["drama-club", "art-club"],
      essayRequired: false,
    },
    externalUrl: "https://www.madonnahs.org/arts/scholarships",
  },
  {
    id: "nhs-merit-scholarship",
    title: "National Honor Society Merit Scholarship",
    description:
      "Chapter award for NHS members exemplifying scholarship, service, leadership, and character.",
    amount: 150000,
    amountLabel: "$1,500",
    deadline: "2026-03-10",
    category: "academic",
    provider: "Madonna NHS Chapter",
    requirements: {
      gradeMin: 11,
      gpaMin: 3.5,
      clubs: ["national-honor-society"],
      essayRequired: true,
    },
    externalUrl: "https://www.nhs.us/scholarships",
  },
  {
    id: "cross-country-perseverance",
    title: "Cross Country Perseverance Award",
    description:
      "Recognizes distance runners who demonstrate dedication on and off the course.",
    amount: 50000,
    amountLabel: "$500",
    deadline: "2026-05-01",
    category: "athletic",
    provider: "Madonna Cross Country Boosters",
    requirements: {
      gradeMin: 9,
      athletics: true,
      clubs: ["cross-country"],
      gpaMin: 2.0,
    },
    externalUrl: "https://www.madonnahs.org/athletics/cross-country-scholarship",
  },
  {
    id: "prayer-ministry-fund",
    title: "Prayer & Ministry Fund",
    description:
      "Small grant for students active in prayer club and campus ministry spiritual formation.",
    amount: 50000,
    amountLabel: "$500",
    deadline: "2026-04-15",
    category: "faith",
    provider: "Madonna Campus Ministry",
    requirements: {
      gradeMin: 9,
      faith: true,
      clubs: ["prayer-club", "campus-ministry"],
    },
    externalUrl: "https://www.madonnahs.org/campus-ministry/scholarships",
  },
  {
    id: "community-service-champion",
    title: "Community Service Champion",
    description:
      "Major local award for students with exceptional verified volunteer hours and community impact.",
    amount: 300000,
    amountLabel: "$3,000",
    deadline: "2026-05-30",
    category: "service",
    provider: "Ohio Valley Community Foundation",
    requirements: { gradeMin: 11, serviceHoursMin: 50, essayRequired: true },
    externalUrl: "https://www.ovcf.org/service-champion",
  },
  {
    id: "class-of-2028-legacy",
    title: "Class of 2028 Legacy Scholarship",
    description:
      "Class-specific award for rising seniors in the Class of 2028 with campus involvement.",
    amount: 100000,
    amountLabel: "$1,000",
    deadline: "2026-06-01",
    category: "local",
    provider: "Madonna Class of 2028",
    requirements: { gradeMin: 11, classOf: ["2028"], essayRequired: true },
    externalUrl: "https://www.madonnahs.org/class-of-2028/scholarship",
  },
  {
    id: "golf-scholar-athlete",
    title: "Golf Scholar-Athlete Award",
    description:
      "Supports Madonna golfers pursuing collegiate athletics and academic excellence.",
    amount: 75000,
    amountLabel: "$750",
    deadline: "2026-05-10",
    category: "athletic",
    provider: "Madonna Golf Boosters",
    requirements: {
      gradeMin: 10,
      athletics: true,
      clubs: ["golf"],
      gpaMin: 2.5,
    },
    externalUrl: "https://www.madonnahs.org/athletics/golf-scholarship",
  },
  {
    id: "geek-club-innovation",
    title: "Geek Club Innovation Grant",
    description:
      "Funds creative technology projects and maker initiatives led by Geek Club members.",
    amount: 80000,
    amountLabel: "$800",
    deadline: "2026-04-25",
    category: "stem",
    provider: "Madonna Geek Club",
    requirements: { gradeMin: 9, clubs: ["geek-club"], stem: true, essayRequired: false },
    externalUrl: "https://www.madonnahs.org/clubs/geek-club/scholarship",
  },
];

export function getScholarshipById(id: string): Scholarship | undefined {
  return SCHOLARSHIPS.find((s) => s.id === id);
}

export function isScholarshipDeadlinePassed(deadline: string, now = new Date()): boolean {
  const end = new Date(`${deadline}T23:59:59`);
  return now > end;
}
