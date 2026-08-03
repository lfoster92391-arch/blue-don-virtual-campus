import {
  GRADUATE_LEGACY_TAGLINE,
  SEED_GRADUATE_LEGACY,
  slugifyLegacyName,
  type GraduateLegacyData,
} from "@/config/graduate-legacy";
import { CLEAN_SLATE } from "@/config/app-mode";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

type LegacyJsonList = string[] | { title: string; description: string }[];

function parseStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function parseProjectList(
  value: unknown,
): { title: string; description: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is { title: string; description: string } =>
        typeof item === "object" &&
        item !== null &&
        "title" in item &&
        "description" in item &&
        typeof (item as { title: unknown }).title === "string" &&
        typeof (item as { description: unknown }).description === "string",
    )
    .map((item) => ({ title: item.title, description: item.description }));
}

function rowToLegacy(
  row: {
    slug: string;
    classYear: number;
    organizations: unknown;
    achievements: unknown;
    projects: unknown;
    college: string | null;
    favoriteMemory: string | null;
    advice: string | null;
    legacyMessage: string | null;
    alumniOptIn: boolean;
    isPublic: boolean;
    user: {
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      portfolioSlug: string | null;
    };
  },
): GraduateLegacyData {
  const displayName =
    row.user.displayName?.trim() ||
    [row.user.firstName, row.user.lastName].filter(Boolean).join(" ").trim() ||
    "Blue Don Graduate";

  return {
    slug: row.slug,
    displayName,
    classYear: row.classYear,
    organizations: parseStringList(row.organizations),
    achievements: parseStringList(row.achievements),
    projects: parseProjectList(row.projects),
    college: row.college,
    favoriteMemory: row.favoriteMemory,
    advice: row.advice,
    legacyMessage: row.legacyMessage,
    alumniOptIn: row.alumniOptIn,
    isPublic: row.isPublic,
    careerPortfolioSlug: row.user.portfolioSlug ?? undefined,
  };
}

export async function getPublicGraduateLegacy(
  slug: string,
): Promise<GraduateLegacyData | null> {
  // Clean slate: no demo graduate legacy page (Alex Martinez) — real students
  // publish their own legacy over time.
  if (!CLEAN_SLATE && slug === SEED_GRADUATE_LEGACY.slug) {
    return SEED_GRADUATE_LEGACY;
  }

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.graduateLegacy.findFirst({
      where: { slug, isPublic: true },
      include: {
        user: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            portfolioSlug: true,
          },
        },
      },
    }),
  );

  if (!row) return null;
  return rowToLegacy(row);
}

export async function getGraduateLegacyForUser(
  userId: string,
): Promise<GraduateLegacyData | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.graduateLegacy.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            portfolioSlug: true,
          },
        },
      },
    }),
  );

  if (!row) return null;
  return rowToLegacy(row);
}

export type GraduateLegacyDraft = {
  classYear: number;
  organizations: string;
  achievements: string;
  projects: string;
  college: string;
  favoriteMemory: string;
  advice: string;
  legacyMessage: string;
  alumniOptIn: boolean;
  isPublic: boolean;
};

export async function upsertGraduateLegacy(
  userId: string,
  displayName: string,
  draft: GraduateLegacyDraft,
): Promise<GraduateLegacyData | null> {
  const slug = slugifyLegacyName(displayName, draft.classYear);
  const organizations = draft.organizations
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const achievements = draft.achievements
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const projects = draft.projects
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, ...rest] = line.split(" — ");
      return { title: title.trim(), description: rest.join(" — ").trim() || title.trim() };
    });

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return {
      slug,
      displayName,
      classYear: draft.classYear,
      organizations,
      achievements,
      projects,
      college: draft.college || null,
      favoriteMemory: draft.favoriteMemory || null,
      advice: draft.advice || null,
      legacyMessage: draft.legacyMessage || null,
      alumniOptIn: draft.alumniOptIn,
      isPublic: draft.isPublic,
    };
  }

  const row = await withDatabase((prisma) =>
    prisma.graduateLegacy.upsert({
      where: { userId },
      create: {
        userId,
        slug,
        classYear: draft.classYear,
        organizations,
        achievements,
        projects,
        college: draft.college || null,
        favoriteMemory: draft.favoriteMemory || null,
        advice: draft.advice || null,
        legacyMessage: draft.legacyMessage || null,
        alumniOptIn: draft.alumniOptIn,
        isPublic: draft.isPublic,
      },
      update: {
        slug,
        classYear: draft.classYear,
        organizations,
        achievements,
        projects,
        college: draft.college || null,
        favoriteMemory: draft.favoriteMemory || null,
        advice: draft.advice || null,
        legacyMessage: draft.legacyMessage || null,
        alumniOptIn: draft.alumniOptIn,
        isPublic: draft.isPublic,
      },
      include: {
        user: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
            portfolioSlug: true,
          },
        },
      },
    }),
  );

  if (!row) return null;
  return rowToLegacy(row);
}

export { GRADUATE_LEGACY_TAGLINE, SEED_GRADUATE_LEGACY };
