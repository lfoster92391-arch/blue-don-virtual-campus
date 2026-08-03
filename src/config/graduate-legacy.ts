/**
 * Graduate Legacy — per-student legacy pages extending the career portfolio story.
 */

export type GraduateLegacyData = {
  slug: string;
  displayName: string;
  classYear: number;
  organizations: string[];
  achievements: string[];
  projects: { title: string; description: string }[];
  college: string | null;
  favoriteMemory: string | null;
  advice: string | null;
  legacyMessage: string | null;
  alumniOptIn: boolean;
  isPublic: boolean;
  careerPortfolioSlug?: string;
};

export const GRADUATE_LEGACY_TAGLINE = "Leave a legacy. Stay connected.";

export const SEED_GRADUATE_LEGACY: GraduateLegacyData = {
  slug: "alex-martinez-2026",
  displayName: "Alex Martinez",
  classYear: 2026,
  organizations: [
    "National Honor Society",
    "Robotics Club — Team Captain",
    "Campus Ministry Leadership",
    "STEM Academy",
  ],
  achievements: [
    "Valedictorian candidate",
    "State Science Fair — 2nd Place",
    "120+ verified service hours",
    "AP Scholar with Distinction",
  ],
  projects: [
    {
      title: "Community Weather Station",
      description:
        "Built and deployed a campus weather station used by athletics and the science department.",
    },
    {
      title: "Nonprofit Website — Hope House",
      description:
        "Designed and launched a responsive website for a local family shelter as Impact Before Diploma capstone.",
    },
  ],
  college: "Louisiana State University — Computer Science",
  favoriteMemory:
    "Winning the regional robotics competition with my team after months of late nights in the lab — we proved that Madonna students compete at the highest level.",
  advice:
    "Say yes to hard things. The projects that scare you are the ones that prepare you for everything after graduation.",
  legacyMessage:
    "To every Blue Don who comes after me: this campus gave me a family. Pay it forward — mentor someone, serve your community, and never forget where you started.",
  alumniOptIn: true,
  isPublic: true,
  careerPortfolioSlug: "alex-martinez",
};

export function buildGraduateLegacyShareUrl(slug: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  return `${base}/legacy/${slug}`;
}

export function slugifyLegacyName(name: string, classYear: number): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base}-${classYear}`;
}
