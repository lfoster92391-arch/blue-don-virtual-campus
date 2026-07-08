import { isDatabaseConfigured } from "@/config/env";
import type {
  AcademyLevelTier,
  CareerPathway,
  LearningStepType,
  ProgressStatus,
} from "@/generated/prisma/client";
import { ACADEMY_LEVEL_TIERS } from "@/lib/academy-engine/constants";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type PathwayDashboard = {
  pathway: CareerPathway;
  academies: {
    id: string;
    slug: string;
    name: string;
    icon: string | null;
    color: string | null;
    description: string | null;
  }[];
  recommendedLabs: { id: string; slug: string; title: string; academyName: string | null }[];
  recommendedCerts: { id: string; slug: string; title: string; academyName: string }[];
  recommendedMissions: { id: string; slug: string; title: string; academySlug: string }[];
};

export type AcademyEngineDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  pathways: CareerPathway[];
  levels: {
    id: string;
    tier: AcademyLevelTier;
    title: string;
    description: string | null;
    sortOrder: number;
  }[];
  modules: ModuleSummary[];
  videos: { id: string; title: string; description: string | null; url: string | null }[];
  missions: MissionSummary[];
  certifications: CertificationSummary[];
  leaderboard: LeaderboardRow[];
  labs: { id: string; slug: string; title: string; difficulty: string }[];
  simulators: { id: string; slug: string; title: string }[];
  studentProgress: {
    currentLevel: AcademyLevelTier;
    progressPct: number;
    moduleProgress: { moduleId: string; status: ProgressStatus; progressPct: number }[];
    earnedCertIds: string[];
  } | null;
  memberCount: number;
  eventCount: number;
  openAssignments: number;
  membership: { id: string; status: string; joinedAt: Date | null } | null;
  recentEvents: { id: string; title: string; startDate: Date; status: string }[];
};

export type ModuleSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  levelTier: AcademyLevelTier | null;
  status: string;
  lessonCount: number;
  progress: { status: ProgressStatus; progressPct: number } | null;
};

export type MissionSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  levelTier: AcademyLevelTier | null;
  status: string;
  objectives: string[];
};

export type CertificationSummary = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  levelTier: AcademyLevelTier | null;
  status: string;
  earned: boolean;
};

export type LeaderboardRow = {
  userId: string;
  displayName: string | null;
  points: number;
  rank: number | null;
};

export type ModuleDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  academySlug: string;
  academyName: string;
  levelTier: AcademyLevelTier | null;
  lessons: { id: string; title: string; content: string | null; stepType: LearningStepType; sortOrder: number }[];
  videos: { id: string; title: string; url: string | null; durationMin: number | null }[];
  assessments: { id: string; title: string; type: string; passingScore: number }[];
  labLinks: { stepType: LearningStepType; lab: { id: string; slug: string; title: string } }[];
  simulatorLinks: { stepType: LearningStepType; simulator: { id: string; slug: string; title: string } }[];
  progress: { status: ProgressStatus; progressPct: number; currentStep: LearningStepType | null } | null;
};

export type MissionDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  academySlug: string;
  academyName: string;
  levelTier: AcademyLevelTier | null;
  objectives: string[];
  lab: { id: string; slug: string; title: string } | null;
};

export type StudentProgressProfile = {
  overallProgressPct: number;
  academyProgress: {
    academyId: string;
    academyName: string;
    academySlug: string;
    icon: string | null;
    color: string | null;
    progressPct: number;
    currentLevel: AcademyLevelTier;
  }[];
  certificationCount: number;
  volunteerHours: number;
  modulesCompleted: number;
  modulesTotal: number;
};

export async function listPathwayDashboards(
  userId: string,
): Promise<PathwayDashboard[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const data = await withDatabase(async (prisma) => {
    const mappings = await prisma.academyPathwayMapping.findMany({
      include: {
        academy: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
            color: true,
            description: true,
          },
        },
      },
      orderBy: { academy: { sortOrder: "asc" } },
    });

    const labs = await prisma.lab.findMany({
      where: { status: "ACTIVE", archiveFlag: false },
      take: 20,
      include: { academy: { select: { name: true } } },
      orderBy: { title: "asc" },
    });

    const certs = await prisma.certification.findMany({
      where: { status: "ACTIVE" },
      take: 20,
      include: { academy: { select: { name: true } } },
      orderBy: { sortOrder: "asc" },
    });

    const missions = await prisma.mission.findMany({
      where: { status: "ACTIVE" },
      take: 20,
      include: { academy: { select: { slug: true } } },
      orderBy: { sortOrder: "asc" },
    });

    return { mappings, labs, certs, missions };
  });

  if (!data) return [];

  const pathwaySet = new Set(data.mappings.map((m) => m.pathway));
  const pathways = Array.from(pathwaySet) as CareerPathway[];

  return pathways.map((pathway) => ({
    pathway,
    academies: data.mappings
      .filter((m) => m.pathway === pathway)
      .map((m) => m.academy),
    recommendedLabs: data.labs.slice(0, 3).map((lab) => ({
      id: lab.id,
      slug: lab.slug,
      title: lab.title,
      academyName: lab.academy?.name ?? null,
    })),
    recommendedCerts: data.certs.slice(0, 3).map((cert) => ({
      id: cert.id,
      slug: cert.slug,
      title: cert.title,
      academyName: cert.academy.name,
    })),
    recommendedMissions: data.missions.slice(0, 3).map((mission) => ({
      id: mission.id,
      slug: mission.slug,
      title: mission.title,
      academySlug: mission.academy.slug,
    })),
  }));
}

export async function getAcademyEngineDetail(
  slug: string,
  userId: string,
): Promise<AcademyEngineDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const academy = await withDatabase((prisma) =>
    prisma.academy.findUnique({
      where: { slug },
      include: {
        pathwayMappings: true,
        levels: { orderBy: { sortOrder: "asc" } },
        modules: {
          where: { status: { not: "ARCHIVED" } },
          orderBy: { sortOrder: "asc" },
          include: {
            level: { select: { tier: true } },
            _count: { select: { lessons: true } },
            progress: { where: { userId } },
          },
        },
        videos: { orderBy: { sortOrder: "asc" }, take: 10 },
        missions: {
          where: { status: { not: "ARCHIVED" } },
          orderBy: { sortOrder: "asc" },
        },
        certifications: {
          where: { status: { not: "ARCHIVED" } },
          orderBy: { sortOrder: "asc" },
        },
        labs: {
          where: { status: "ACTIVE", archiveFlag: false },
          orderBy: { title: "asc" },
        },
        simulators: {
          where: { status: "ACTIVE", archiveFlag: false },
          orderBy: { sortOrder: "asc" },
        },
        leaderboardEntries: {
          where: { period: "all-time" },
          orderBy: { points: "desc" },
          take: 10,
          include: { user: { select: { displayName: true } } },
        },
        memberships: { where: { userId } },
        studentProgress: { where: { userId } },
        _count: {
          select: {
            memberships: { where: { status: "ACTIVE" } },
            events: { where: { archiveFlag: false } },
            assignments: { where: { status: { not: "COMPLETED" } } },
          },
        },
        events: {
          where: { archiveFlag: false },
          orderBy: { startDate: "asc" },
          take: 5,
          select: { id: true, title: true, startDate: true, status: true },
        },
      },
    }),
  );

  if (!academy) return null;

  const earnedCerts = await withDatabase((prisma) =>
    prisma.studentCertification.findMany({
      where: {
        userId,
        certification: { academyId: academy.id },
      },
      select: { certificationId: true },
    }),
  );

  const earnedCertIds = new Set((earnedCerts ?? []).map((c) => c.certificationId));
  const studentProgress = academy.studentProgress[0] ?? null;
  const moduleProgressMap = new Map(
    academy.modules.flatMap((m) =>
      m.progress.map((p) => [m.id, { status: p.status, progressPct: p.progressPct }]),
    ),
  );

  return {
    id: academy.id,
    slug: academy.slug,
    name: academy.name,
    description: academy.description,
    color: academy.color,
    icon: academy.icon,
    pathways: academy.pathwayMappings.map((p) => p.pathway),
    levels: academy.levels,
    modules: academy.modules.map((m) => ({
      id: m.id,
      slug: m.slug,
      title: m.title,
      description: m.description,
      levelTier: m.level?.tier ?? null,
      status: m.status,
      lessonCount: m._count.lessons,
      progress: moduleProgressMap.get(m.id) ?? null,
    })),
    videos: academy.videos,
    missions: academy.missions,
    certifications: academy.certifications.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      levelTier: c.levelTier,
      status: c.status,
      earned: earnedCertIds.has(c.id),
    })),
    leaderboard: academy.leaderboardEntries.map((e) => ({
      userId: e.userId,
      displayName: e.user.displayName,
      points: e.points,
      rank: e.rank,
    })),
    labs: academy.labs.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      difficulty: l.difficulty,
    })),
    simulators: academy.simulators.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
    })),
    studentProgress: studentProgress
      ? {
          currentLevel: studentProgress.currentLevel,
          progressPct: studentProgress.progressPct,
          moduleProgress: academy.modules.flatMap((m) =>
            m.progress.map((p) => ({
              moduleId: m.id,
              status: p.status,
              progressPct: p.progressPct,
            })),
          ),
          earnedCertIds: Array.from(earnedCertIds),
        }
      : null,
    memberCount: academy._count.memberships,
    eventCount: academy._count.events,
    openAssignments: academy._count.assignments,
    membership: academy.memberships[0]
      ? {
          id: academy.memberships[0].id,
          status: academy.memberships[0].status,
          joinedAt: academy.memberships[0].joinedAt,
        }
      : null,
    recentEvents: academy.events,
  };
}

export async function getModuleDetail(
  academySlug: string,
  moduleId: string,
  userId: string,
): Promise<ModuleDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const module = await withDatabase((prisma) =>
    prisma.learningModule.findFirst({
      where: {
        id: moduleId,
        academy: { slug: academySlug },
        status: { not: "ARCHIVED" },
      },
      include: {
        academy: { select: { slug: true, name: true } },
        level: { select: { tier: true } },
        lessons: { orderBy: { sortOrder: "asc" } },
        videos: { orderBy: { sortOrder: "asc" } },
        assessments: { orderBy: { sortOrder: "asc" } },
        labLinks: {
          orderBy: { sortOrder: "asc" },
          include: { lab: { select: { id: true, slug: true, title: true } } },
        },
        simulatorLinks: {
          orderBy: { sortOrder: "asc" },
          include: { simulator: { select: { id: true, slug: true, title: true } } },
        },
        progress: { where: { userId } },
      },
    }),
  );

  if (!module) return null;

  return {
    id: module.id,
    slug: module.slug,
    title: module.title,
    description: module.description,
    academySlug: module.academy.slug,
    academyName: module.academy.name,
    levelTier: module.level?.tier ?? null,
    lessons: module.lessons,
    videos: module.videos,
    assessments: module.assessments,
    labLinks: module.labLinks.map((l) => ({
      stepType: l.stepType,
      lab: l.lab,
    })),
    simulatorLinks: module.simulatorLinks.map((s) => ({
      stepType: s.stepType,
      simulator: s.simulator,
    })),
    progress: module.progress[0]
      ? {
          status: module.progress[0].status,
          progressPct: module.progress[0].progressPct,
          currentStep: module.progress[0].currentStep,
        }
      : null,
  };
}

export async function getMissionDetail(
  academySlug: string,
  missionId: string,
): Promise<MissionDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const mission = await withDatabase((prisma) =>
    prisma.mission.findFirst({
      where: {
        id: missionId,
        academy: { slug: academySlug },
        status: { not: "ARCHIVED" },
      },
      include: {
        academy: { select: { slug: true, name: true } },
        lab: { select: { id: true, slug: true, title: true } },
      },
    }),
  );

  if (!mission) return null;

  return {
    id: mission.id,
    slug: mission.slug,
    title: mission.title,
    description: mission.description,
    academySlug: mission.academy.slug,
    academyName: mission.academy.name,
    levelTier: mission.levelTier,
    objectives: mission.objectives,
    lab: mission.lab,
  };
}

export async function getStudentProgressProfile(
  userId: string,
): Promise<StudentProgressProfile> {
  const empty: StudentProgressProfile = {
    overallProgressPct: 0,
    academyProgress: [],
    certificationCount: 0,
    volunteerHours: 0,
    modulesCompleted: 0,
    modulesTotal: 0,
  };

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return empty;
  }

  const data = await withDatabase(async (prisma) => {
    const [academyProgress, certCount, moduleStats, volunteerHours, modulesTotal] =
      await Promise.all([
        prisma.studentAcademyProgress.findMany({
          where: { userId },
          include: {
            academy: {
              select: { id: true, name: true, slug: true, icon: true, color: true },
            },
          },
          orderBy: { progressPct: "desc" },
        }),
        prisma.studentCertification.count({ where: { userId } }),
        prisma.studentModuleProgress.groupBy({
          by: ["status"],
          where: { userId },
          _count: true,
        }),
        prisma.eventParticipant.aggregate({
          where: { userId, role: "VOLUNTEER" },
          _sum: { hours: true },
        }),
        prisma.learningModule.count({ where: { status: "PUBLISHED" } }),
      ]);

    const completed =
      moduleStats.find((s) => s.status === "COMPLETED")?._count ?? 0;

    return { academyProgress, certCount, completed, modulesTotal, volunteerHours };
  });

  if (!data) return empty;

  const overall =
    data.academyProgress.length > 0
      ? data.academyProgress.reduce((sum, p) => sum + p.progressPct, 0) /
        data.academyProgress.length
      : 0;

  return {
    overallProgressPct: Math.round(overall),
    academyProgress: data.academyProgress.map((p) => ({
      academyId: p.academy.id,
      academyName: p.academy.name,
      academySlug: p.academy.slug,
      icon: p.academy.icon,
      color: p.academy.color,
      progressPct: p.progressPct,
      currentLevel: p.currentLevel,
    })),
    certificationCount: data.certCount,
    volunteerHours: data.volunteerHours._sum.hours ?? 0,
    modulesCompleted: data.completed,
    modulesTotal: data.modulesTotal,
  };
}

export async function listAllModulesForAdmin() {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.learningModule.findMany({
      include: {
        academy: { select: { name: true, slug: true } },
        level: { select: { tier: true } },
        _count: { select: { lessons: true } },
      },
      orderBy: [{ academy: { name: "asc" } }, { sortOrder: "asc" }],
    }),
  );

  return rows ?? [];
}

export async function listAllCertificationsForAdmin() {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.certification.findMany({
      include: { academy: { select: { name: true, slug: true } } },
      orderBy: [{ academy: { name: "asc" } }, { sortOrder: "asc" }],
    }),
  );

  return rows ?? [];
}

export function getNextLevelTier(current: AcademyLevelTier): AcademyLevelTier | null {
  const idx = ACADEMY_LEVEL_TIERS.indexOf(current);
  if (idx < 0 || idx >= ACADEMY_LEVEL_TIERS.length - 1) return null;
  return ACADEMY_LEVEL_TIERS[idx + 1];
}
