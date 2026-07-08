import { isDatabaseConfigured } from "@/config/env";
import type { LabDifficulty, LabSessionStatus, LabStatus } from "@/generated/prisma/client";
import {
  CAMPUS_WIDE_GROUP,
  groupByAcademy,
  type AcademyGrouped,
} from "@/lib/academy/group-by-academy";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

const academySelect = {
  id: true,
  name: true,
  icon: true,
  color: true,
  sortOrder: true,
} as const;

export type LabListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: LabDifficulty;
  status: LabStatus;
  academyId: string | null;
  academyName: string | null;
  academyIcon: string | null;
  academyColor: string | null;
  academySortOrder: number;
  sessionCount: number;
};

export type LabDetail = LabListItem & {
  equipment: string | null;
  safetyNotes: string | null;
  launchUrl: string | null;
  userSessions: {
    id: string;
    status: LabSessionStatus;
    startedAt: Date | null;
    completedAt: Date | null;
  }[];
};

export async function listActiveLabs(): Promise<LabListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const labs = await withDatabase((prisma) =>
    prisma.lab.findMany({
      where: { status: "ACTIVE", archiveFlag: false },
      include: {
        academy: { select: academySelect },
        _count: { select: { sessions: true } },
      },
      orderBy: { title: "asc" },
    }),
  );

  return labs ? await enrichLabsWithDerivedAcademy(labs) : [];
}

export async function listActiveLabsGroupedByAcademy(): Promise<AcademyGrouped<LabListItem>[]> {
  const labs = await listActiveLabs();
  return groupByAcademy(labs);
}

export async function listAllLabs(): Promise<LabListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const labs = await withDatabase((prisma) =>
    prisma.lab.findMany({
      include: {
        academy: { select: academySelect },
        _count: { select: { sessions: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  );

  return labs ? await enrichLabsWithDerivedAcademy(labs) : [];
}

export async function getLabBySlug(
  slug: string,
  userId?: string,
  includeDraft = false,
): Promise<LabDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const lab = await withDatabase((prisma) =>
    prisma.lab.findFirst({
      where: {
        slug,
        status: includeDraft ? undefined : "ACTIVE",
        archiveFlag: false,
      },
      include: {
        academy: { select: academySelect },
        _count: { select: { sessions: true } },
        sessions: userId
          ? {
              where: { userId },
              orderBy: { createdAt: "desc" },
              take: 5,
              select: {
                id: true,
                status: true,
                startedAt: true,
                completedAt: true,
              },
            }
          : false,
      },
    }),
  );

  if (!lab) {
    return null;
  }

  const [enriched] = await enrichLabsWithDerivedAcademy([lab]);

  return {
    ...enriched,
    equipment: lab.equipment,
    safetyNotes: lab.safetyNotes,
    launchUrl: lab.launchUrl,
    userSessions: Array.isArray(lab.sessions) ? lab.sessions : [],
  };
}

type LabWithAcademy = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  difficulty: LabDifficulty;
  status: LabStatus;
  academyId: string | null;
  academy: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    sortOrder: number;
  } | null;
  _count: { sessions: number };
};

function mapLabListItem(lab: LabWithAcademy, derivedAcademy?: LabWithAcademy["academy"]): LabListItem {
  const academy = lab.academy ?? derivedAcademy ?? null;

  return {
    id: lab.id,
    slug: lab.slug,
    title: lab.title,
    description: lab.description,
    difficulty: lab.difficulty,
    status: lab.status,
    academyId: academy?.id ?? null,
    academyName: academy?.name ?? null,
    academyIcon: academy?.icon ?? null,
    academyColor: academy?.color ?? null,
    academySortOrder: academy?.sortOrder ?? CAMPUS_WIDE_GROUP.academySortOrder,
    sessionCount: lab._count.sessions,
  };
}

async function enrichLabsWithDerivedAcademy(labs: LabWithAcademy[]): Promise<LabListItem[]> {
  const missingIds = labs.filter((lab) => !lab.academyId).map((lab) => lab.id);
  const derivedByLabId = new Map<string, NonNullable<LabWithAcademy["academy"]>>();

  if (missingIds.length > 0 && isDatabaseConfigured() && isPrismaReady()) {
    const links = await withDatabase((prisma) =>
      prisma.moduleLabLink.findMany({
        where: { labId: { in: missingIds } },
        include: {
          module: {
            include: {
              academy: { select: academySelect },
            },
          },
        },
        orderBy: { sortOrder: "asc" },
      }),
    );

    for (const link of links ?? []) {
      if (!derivedByLabId.has(link.labId)) {
        derivedByLabId.set(link.labId, link.module.academy);
      }
    }
  }

  return labs.map((lab) => mapLabListItem(lab, derivedByLabId.get(lab.id)));
}

export async function createLab(input: {
  slug: string;
  title: string;
  description?: string;
  academyId?: string;
  difficulty?: LabDifficulty;
  equipment?: string;
  safetyNotes?: string;
  launchUrl?: string;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const lab = await withDatabase((prisma) =>
    prisma.lab.create({
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        academyId: input.academyId,
        difficulty: input.difficulty ?? "INTRODUCTORY",
        equipment: input.equipment,
        safetyNotes: input.safetyNotes,
        launchUrl: input.launchUrl,
        status: "DRAFT",
      },
      select: { id: true },
    }),
  );

  return lab?.id ?? null;
}

export async function updateLabStatus(id: string, status: LabStatus): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.lab.update({
      where: { id },
      data: { status, archiveFlag: status === "ARCHIVED" },
    }),
  );

  return result !== null;
}

export async function startLabSession(labId: string, userId: string): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const session = await withDatabase((prisma) =>
    prisma.labSession.create({
      data: {
        labId,
        userId,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
      select: { id: true },
    }),
  );

  return session?.id ?? null;
}

export async function completeLabSession(
  sessionId: string,
  userId: string,
  reflection?: string,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.labSession.updateMany({
      where: { id: sessionId, userId },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        reflection,
      },
    }),
  );

  return (result?.count ?? 0) > 0;
}
