/**
 * Career Portfolio — "Everything. One Link." graduate showcase.
 */

export type CareerPortfolioSectionId =
  | "resume"
  | "portfolio"
  | "reference-letters"
  | "certifications"
  | "projects"
  | "internships"
  | "volunteer"
  | "leadership"
  | "transcript";

export type CareerPortfolioSectionSource = "live" | "seed" | "placeholder";

export type CareerPortfolioSectionMeta = {
  id: CareerPortfolioSectionId;
  title: string;
  description: string;
  source: CareerPortfolioSectionSource;
};

export const CAREER_PORTFOLIO_TAGLINE = "Everything. One Link.";

export const CAREER_PORTFOLIO_PUBLIC_PATH = "/p";

export const CAREER_PORTFOLIO_SECTIONS: CareerPortfolioSectionMeta[] = [
  {
    id: "resume",
    title: "Resume",
    description: "Professional summary and skills snapshot.",
    source: "placeholder",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    description: "Published projects, achievements, and evidence.",
    source: "live",
  },
  {
    id: "reference-letters",
    title: "Reference Letters",
    description: "Recommendations from teachers, mentors, and supervisors.",
    source: "seed",
  },
  {
    id: "certifications",
    title: "Certifications",
    description: "Academy credentials and industry certifications.",
    source: "live",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Academy labs, capstones, and independent work.",
    source: "live",
  },
  {
    id: "internships",
    title: "Internships",
    description: "Work-based learning and industry placements.",
    source: "seed",
  },
  {
    id: "volunteer",
    title: "Volunteer Work",
    description: "Service hours and community impact.",
    source: "live",
  },
  {
    id: "leadership",
    title: "Leadership",
    description: "Club roles, student council, and campus leadership.",
    source: "live",
  },
  {
    id: "transcript",
    title: "Digital Transcript",
    description: "Official academic record via FACTS sync.",
    source: "placeholder",
  },
];

export type SeedReferenceLetter = {
  id: string;
  author: string;
  role: string;
  excerpt: string;
  dateLabel: string;
};

export type SeedInternship = {
  id: string;
  organization: string;
  role: string;
  period: string;
  description: string;
};

export type SeedResumeSummary = {
  headline: string;
  summary: string;
  skills: string[];
  education: string;
};

export const SEED_REFERENCE_LETTERS: SeedReferenceLetter[] = [
  {
    id: "ref-1",
    author: "Dr. Sarah Chen",
    role: "STEM Academy Director",
    excerpt:
      "Demonstrated exceptional problem-solving and collaboration during the robotics capstone. Ready for collegiate engineering programs.",
    dateLabel: "Apr 2026",
  },
  {
    id: "ref-2",
    author: "Mr. James Rivera",
    role: "Counselor, Madonna High School",
    excerpt:
      "A consistent leader among peers with strong character, academic integrity, and dedication to service.",
    dateLabel: "May 2026",
  },
];

export const SEED_INTERNSHIPS: SeedInternship[] = [
  {
    id: "int-1",
    organization: "Regional Medical Center",
    role: "Health Sciences Shadow",
    period: "Summer 2025",
    description:
      "Observed clinical workflows and completed a patient-care ethics reflection project.",
  },
  {
    id: "int-2",
    organization: "Local Tech Council",
    role: "Junior Developer Intern",
    period: "Jan–Mar 2026",
    description:
      "Built a campus event dashboard prototype using React and mentored under a senior engineer.",
  },
];

export const SEED_RESUME_SUMMARY: SeedResumeSummary = {
  headline: "STEM & Service-Focused Graduate",
  summary:
    "Madonna High School senior with academy certifications, verified service hours, and hands-on project experience across technology and community engagement.",
  skills: [
    "Python",
    "Web Development",
    "Cybersecurity Foundations",
    "Public Speaking",
    "Team Leadership",
    "Service Learning",
  ],
  education: "Madonna High School · Class of 2026 · STEM Academy",
};

export const SEED_TRANSCRIPT_PLACEHOLDER = {
  gpa: "3.85",
  creditsEarned: 24,
  classRank: "Top 15%",
  syncStatus: "pending" as const,
  syncLabel: "FACTS sync — transcript preview available at graduation",
  courses: [
    { name: "AP Computer Science A", grade: "A", credits: 1 },
    { name: "Honors Physics", grade: "A-", credits: 1 },
    { name: "English IV", grade: "A", credits: 1 },
    { name: "Calculus AB", grade: "B+", credits: 1 },
  ],
};

export function buildCareerPortfolioShareUrl(slug: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}${CAREER_PORTFOLIO_PUBLIC_PATH}/${slug}`;
}

export function slugifyPortfolioName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}
