import {
  CAREER_PORTFOLIO_SECTIONS,
  SEED_INTERNSHIPS,
  SEED_REFERENCE_LETTERS,
  SEED_RESUME_SUMMARY,
  SEED_TRANSCRIPT_PLACEHOLDER,
  buildCareerPortfolioShareUrl,
  slugifyPortfolioName,
  type CareerPortfolioSectionId,
} from "@/config/career-portfolio";
import { JOURNEY_MILESTONES } from "@/config/journey-engine";
import { isDatabaseConfigured } from "@/config/env";
import { siteConfig } from "@/config/site";
import { PORTFOLIO_TYPE_LABELS } from "@/lib/mvp/constants";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { getStudentProgressProfile } from "@/services/academy-engine-service";
import { listPortfolioItems } from "@/services/portfolio-service";
import { getStudentContext } from "@/services/student-context-service";

export type CareerPortfolioItem = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  dateLabel?: string;
  href?: string;
  badge?: string;
};

export type CareerPortfolioSection = {
  id: CareerPortfolioSectionId;
  title: string;
  description: string;
  source: "live" | "seed" | "placeholder";
  items: CareerPortfolioItem[];
  emptyMessage?: string;
};

export type CareerPortfolioSettings = {
  slug: string;
  isPublic: boolean;
  shareUrl: string;
};

export type CareerPortfolioProfile = {
  displayName: string;
  profileImage: string | null;
  classLabel: string;
  academyLabel: string | null;
};

export type CareerPortfolioData = {
  profile: CareerPortfolioProfile;
  settings: CareerPortfolioSettings;
  sections: CareerPortfolioSection[];
  completionPercent: number;
};

const LEADERSHIP_ROLES = new Set([
  "PRESIDENT",
  "VICE_PRESIDENT",
  "SECRETARY",
  "LEAD",
  "OFFICER",
  "MODERATOR",
]);

function sectionMeta(id: CareerPortfolioSectionId) {
  const meta = CAREER_PORTFOLIO_SECTIONS.find((s) => s.id === id);
  if (!meta) {
    throw new Error(`Unknown career portfolio section: ${id}`);
  }
  return meta;
}

function computeCompletion(sections: CareerPortfolioSection[]): number {
  const populated = sections.filter((s) => s.items.length > 0).length;
  return Math.round((populated / sections.length) * 100);
}

async function resolveUserBasics(userId: string) {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  return withDatabase((prisma) =>
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        portfolioSlug: true,
        portfolioPublic: true,
      },
    }),
  );
}

export async function ensureCareerPortfolioSlug(userId: string): Promise<string> {
  const user = await resolveUserBasics(userId);

  if (!user) {
    return `student-${userId.slice(0, 8)}`;
  }

  if (user.portfolioSlug) {
    return user.portfolioSlug;
  }

  const baseName =
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    "blue-don-graduate";

  let candidate = slugifyPortfolioName(baseName) || "graduate";
  let suffix = 0;

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return candidate;
  }

  while (true) {
    const slug = suffix === 0 ? candidate : `${candidate}-${suffix}`;
    const existing = await withDatabase((prisma) =>
      prisma.user.findFirst({
        where: { portfolioSlug: slug, NOT: { id: userId } },
        select: { id: true },
      }),
    );

    if (!existing) {
      await withDatabase((prisma) =>
        prisma.user.update({
          where: { id: userId },
          data: { portfolioSlug: slug },
        }),
      );
      return slug;
    }

    suffix += 1;
  }
}

export async function getCareerPortfolioSettings(
  userId: string,
): Promise<CareerPortfolioSettings> {
  const slug = await ensureCareerPortfolioSlug(userId);
  const user = await resolveUserBasics(userId);

  return {
    slug,
    isPublic: user?.portfolioPublic ?? false,
    shareUrl: buildCareerPortfolioShareUrl(slug, siteConfig.url),
  };
}

export async function updateCareerPortfolioPublic(
  userId: string,
  isPublic: boolean,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  await ensureCareerPortfolioSlug(userId);

  const result = await withDatabase((prisma) =>
    prisma.user.updateMany({
      where: { id: userId },
      data: { portfolioPublic: isPublic },
    }),
  );

  return (result?.count ?? 0) > 0;
}

async function buildResumeSection(): Promise<CareerPortfolioSection> {
  const meta = sectionMeta("resume");

  return {
    ...meta,
    items: [
      {
        id: "resume-summary",
        title: SEED_RESUME_SUMMARY.headline,
        description: SEED_RESUME_SUMMARY.summary,
        subtitle: SEED_RESUME_SUMMARY.education,
        badge: SEED_RESUME_SUMMARY.skills.slice(0, 4).join(" · "),
      },
    ],
    emptyMessage: "Add your resume in Professional Skills.",
  };
}

async function buildPortfolioSection(
  userId: string,
  includeDrafts: boolean,
): Promise<CareerPortfolioSection> {
  const meta = sectionMeta("portfolio");
  const items = await listPortfolioItems(userId);
  const visible = includeDrafts
    ? items
    : items.filter((item) => item.status === "PUBLISHED");

  return {
    ...meta,
    items: visible.map((item) => ({
      id: item.id,
      title: item.title,
      subtitle: PORTFOLIO_TYPE_LABELS[item.type],
      description: item.description ?? undefined,
      dateLabel: item.createdAt.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      href: `/portfolio/${item.id}`,
      badge: item.status.toLowerCase(),
    })),
    emptyMessage: "Publish portfolio items to showcase your work.",
  };
}

function buildReferenceLettersSection(): CareerPortfolioSection {
  const meta = sectionMeta("reference-letters");

  return {
    ...meta,
    items: SEED_REFERENCE_LETTERS.map((letter) => ({
      id: letter.id,
      title: letter.author,
      subtitle: letter.role,
      description: letter.excerpt,
      dateLabel: letter.dateLabel,
    })),
  };
}

async function buildCertificationsSection(userId: string): Promise<CareerPortfolioSection> {
  const meta = sectionMeta("certifications");
  const items: CareerPortfolioItem[] = [];

  if (isDatabaseConfigured() && isPrismaReady()) {
    const earned = await withDatabase((prisma) =>
      prisma.studentCertification.findMany({
        where: { userId },
        include: {
          certification: {
            select: { id: true, title: true, slug: true, description: true },
          },
        },
        orderBy: { earnedAt: "desc" },
      }),
    );

    for (const row of earned ?? []) {
      items.push({
        id: row.id,
        title: row.certification.title,
        description: row.certification.description ?? undefined,
        dateLabel: row.earnedAt.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        badge: "Academy",
      });
    }
  }

  const portfolioCerts = (await listPortfolioItems(userId)).filter(
    (item) => item.type === "CERTIFICATION" && item.status === "PUBLISHED",
  );

  for (const item of portfolioCerts) {
    items.push({
      id: `portfolio-${item.id}`,
      title: item.title,
      description: item.description ?? undefined,
      subtitle: item.academyName ?? undefined,
      badge: "Portfolio",
    });
  }

  return {
    ...meta,
    items,
    emptyMessage: "Earn academy certifications to populate this section.",
  };
}

async function buildProjectsSection(userId: string): Promise<CareerPortfolioSection> {
  const meta = sectionMeta("projects");
  const portfolioProjects = (await listPortfolioItems(userId)).filter(
    (item) => item.type === "PROJECT" && item.status === "PUBLISHED",
  );

  const items: CareerPortfolioItem[] = portfolioProjects.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description ?? undefined,
    subtitle: item.academyName ?? undefined,
    href: `/portfolio/${item.id}`,
  }));

  const journeyProjects = JOURNEY_MILESTONES.filter(
    (ms) => ms.type === "academy" || ms.type === "achievement",
  );

  if (items.length === 0) {
    for (const ms of journeyProjects.slice(0, 2)) {
      items.push({
        id: ms.id,
        title: ms.title,
        description: ms.description,
        dateLabel: ms.dateLabel,
        badge: "Journey",
      });
    }
  }

  return {
    ...meta,
    items,
    emptyMessage: "Add lab and capstone projects to your portfolio.",
  };
}

function buildInternshipsSection(): CareerPortfolioSection {
  const meta = sectionMeta("internships");

  return {
    ...meta,
    items: SEED_INTERNSHIPS.map((internship) => ({
      id: internship.id,
      title: internship.organization,
      subtitle: internship.role,
      description: internship.description,
      dateLabel: internship.period,
    })),
  };
}

async function buildVolunteerSection(userId: string): Promise<CareerPortfolioSection> {
  const meta = sectionMeta("volunteer");
  const items: CareerPortfolioItem[] = [];
  const progress = await getStudentProgressProfile(userId);

  if (progress.volunteerHours > 0) {
    items.push({
      id: "volunteer-total",
      title: `${progress.volunteerHours} verified service hours`,
      subtitle: "Service Center",
      description: "Hours logged through campus events and volunteer placements.",
      badge: "Live",
    });
  }

  const serviceItems = (await listPortfolioItems(userId)).filter(
    (item) => item.type === "SERVICE" && item.status === "PUBLISHED",
  );

  for (const item of serviceItems) {
    items.push({
      id: item.id,
      title: item.title,
      description: item.description ?? undefined,
      subtitle: item.points > 0 ? `${item.points} pts` : undefined,
    });
  }

  const serviceMilestones = JOURNEY_MILESTONES.filter((ms) => ms.type === "service");
  if (items.length === 0) {
    for (const ms of serviceMilestones) {
      items.push({
        id: ms.id,
        title: ms.title,
        description: ms.description,
        dateLabel: ms.dateLabel,
        badge: "Journey",
      });
    }
  }

  return {
    ...meta,
    items,
    emptyMessage: "Log service hours through the Service Center.",
  };
}

async function buildLeadershipSection(userId: string): Promise<CareerPortfolioSection> {
  const meta = sectionMeta("leadership");
  const items: CareerPortfolioItem[] = [];
  const context = await getStudentContext(userId);

  for (const club of context.clubs) {
    if (LEADERSHIP_ROLES.has(club.role.toUpperCase())) {
      items.push({
        id: `club-${club.id}`,
        title: club.name,
        subtitle: club.role,
        href: club.href,
        badge: "Club",
      });
    }
  }

  const leadershipItems = (await listPortfolioItems(userId)).filter(
    (item) => item.type === "LEADERSHIP" && item.status === "PUBLISHED",
  );

  for (const item of leadershipItems) {
    items.push({
      id: item.id,
      title: item.title,
      description: item.description ?? undefined,
    });
  }

  const journeyLeadership = JOURNEY_MILESTONES.filter((ms) => ms.type === "leadership");
  if (items.length === 0) {
    for (const ms of journeyLeadership) {
      items.push({
        id: ms.id,
        title: ms.title,
        description: ms.description,
        dateLabel: ms.dateLabel,
        badge: "Journey",
      });
    }
  }

  return {
    ...meta,
    items,
    emptyMessage: "Take on leadership roles in clubs and organizations.",
  };
}

function buildTranscriptSection(): CareerPortfolioSection {
  const meta = sectionMeta("transcript");
  const transcript = SEED_TRANSCRIPT_PLACEHOLDER;

  return {
    ...meta,
    items: [
      {
        id: "transcript-summary",
        title: `GPA ${transcript.gpa} · ${transcript.creditsEarned} credits`,
        subtitle: transcript.classRank,
        description: transcript.syncLabel,
        badge: transcript.syncStatus,
      },
      ...transcript.courses.map((course) => ({
        id: `course-${course.name}`,
        title: course.name,
        subtitle: `Grade ${course.grade}`,
        badge: `${course.credits} cr`,
      })),
    ],
  };
}

export async function buildCareerPortfolio(
  userId: string,
  options?: { includeDrafts?: boolean },
): Promise<CareerPortfolioData> {
  const includeDrafts = options?.includeDrafts ?? false;
  const [settings, user, progress] = await Promise.all([
    getCareerPortfolioSettings(userId),
    resolveUserBasics(userId),
    getStudentProgressProfile(userId),
  ]);

  const displayName =
    user?.displayName?.trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    "Blue Don Graduate";

  const academyLabel =
    progress.academyProgress[0]?.academyName ?? null;

  const sections = await Promise.all([
    buildResumeSection(),
    buildPortfolioSection(userId, includeDrafts),
    Promise.resolve(buildReferenceLettersSection()),
    buildCertificationsSection(userId),
    buildProjectsSection(userId),
    Promise.resolve(buildInternshipsSection()),
    buildVolunteerSection(userId),
    buildLeadershipSection(userId),
    Promise.resolve(buildTranscriptSection()),
  ]);

  return {
    profile: {
      displayName,
      profileImage: user?.profileImage ?? null,
      classLabel: "Class of 2026",
      academyLabel,
    },
    settings,
    sections,
    completionPercent: computeCompletion(sections),
  };
}

export async function getPublicCareerPortfolio(
  slug: string,
): Promise<CareerPortfolioData | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.findFirst({
      where: { portfolioSlug: slug, portfolioPublic: true },
      select: { id: true },
    }),
  );

  if (!user) {
    return null;
  }

  return buildCareerPortfolio(user.id, { includeDrafts: false });
}

export async function getCareerPortfolioBySlug(
  slug: string,
  viewerUserId?: string,
): Promise<CareerPortfolioData | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const user = await withDatabase((prisma) =>
    prisma.user.findFirst({
      where: { portfolioSlug: slug },
      select: { id: true, portfolioPublic: true },
    }),
  );

  if (!user) {
    return null;
  }

  const isOwner = viewerUserId === user.id;
  if (!user.portfolioPublic && !isOwner) {
    return null;
  }

  return buildCareerPortfolio(user.id, { includeDrafts: isOwner });
}
