import { isDatabaseConfigured } from "@/config/env";
import type { SimulatorCategory, SimulatorStatus } from "@/generated/prisma/client";
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

export type SimulatorListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: SimulatorCategory;
  status: SimulatorStatus;
  launchUrl: string;
  academyId: string | null;
  academyName: string | null;
  academyIcon: string | null;
  academyColor: string | null;
  academySortOrder: number;
  runCount: number;
};

export type SimulatorDetail = SimulatorListItem & {
  userRuns: {
    id: string;
    score: number | null;
    durationMin: number | null;
    completedAt: Date;
  }[];
};

export async function listActiveSimulators(): Promise<SimulatorListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const simulators = await withDatabase((prisma) =>
    prisma.simulator.findMany({
      where: { status: "ACTIVE", archiveFlag: false },
      include: {
        academy: { select: academySelect },
        _count: { select: { runs: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
  );

  return simulators ? await enrichSimulatorsWithDerivedAcademy(simulators) : [];
}

export async function listActiveSimulatorsGroupedByAcademy(): Promise<
  AcademyGrouped<SimulatorListItem>[]
> {
  const simulators = await listActiveSimulators();
  return groupByAcademy(simulators);
}

export async function listAllSimulators(): Promise<SimulatorListItem[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const simulators = await withDatabase((prisma) =>
    prisma.simulator.findMany({
      include: {
        academy: { select: academySelect },
        _count: { select: { runs: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    }),
  );

  return simulators ? await enrichSimulatorsWithDerivedAcademy(simulators) : [];
}

export async function getSimulatorBySlug(
  slug: string,
  userId?: string,
  includeDraft = false,
): Promise<SimulatorDetail | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const simulator = await withDatabase((prisma) =>
    prisma.simulator.findFirst({
      where: {
        slug,
        status: includeDraft ? undefined : "ACTIVE",
        archiveFlag: false,
      },
      include: {
        academy: { select: academySelect },
        _count: { select: { runs: true } },
        runs: userId
          ? {
              where: { userId },
              orderBy: { completedAt: "desc" },
              take: 5,
              select: {
                id: true,
                score: true,
                durationMin: true,
                completedAt: true,
              },
            }
          : false,
      },
    }),
  );

  if (!simulator) {
    return null;
  }

  const [enriched] = await enrichSimulatorsWithDerivedAcademy([simulator]);

  return {
    ...enriched,
    userRuns: Array.isArray(simulator.runs) ? simulator.runs : [],
  };
}

export async function createSimulator(input: {
  slug: string;
  title: string;
  description?: string;
  category?: SimulatorCategory;
  academyId?: string;
  launchUrl: string;
  sortOrder?: number;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const simulator = await withDatabase((prisma) =>
    prisma.simulator.create({
      data: {
        slug: input.slug,
        title: input.title,
        description: input.description,
        category: input.category ?? "GENERAL",
        academyId: input.academyId,
        launchUrl: input.launchUrl,
        sortOrder: input.sortOrder ?? 0,
        status: "DRAFT",
      },
      select: { id: true },
    }),
  );

  return simulator?.id ?? null;
}

export async function updateSimulatorStatus(
  id: string,
  status: SimulatorStatus,
): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.simulator.update({
      where: { id },
      data: { status, archiveFlag: status === "ARCHIVED" },
    }),
  );

  return result !== null;
}

export async function logSimulatorRun(input: {
  simulatorId: string;
  userId: string;
  score?: number;
  durationMin?: number;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const run = await withDatabase((prisma) =>
    prisma.simulatorRun.create({
      data: {
        simulatorId: input.simulatorId,
        userId: input.userId,
        score: input.score,
        durationMin: input.durationMin,
      },
      select: { id: true },
    }),
  );

  return run?.id ?? null;
}

type SimulatorWithAcademy = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: SimulatorCategory;
  status: SimulatorStatus;
  launchUrl: string;
  academyId: string | null;
  academy: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    sortOrder: number;
  } | null;
  _count: { runs: number };
};

function mapSimulatorListItem(
  simulator: SimulatorWithAcademy,
  derivedAcademy?: SimulatorWithAcademy["academy"],
): SimulatorListItem {
  const academy = simulator.academy ?? derivedAcademy ?? null;

  return {
    id: simulator.id,
    slug: simulator.slug,
    title: simulator.title,
    description: simulator.description,
    category: simulator.category,
    status: simulator.status,
    launchUrl: simulator.launchUrl,
    academyId: academy?.id ?? null,
    academyName: academy?.name ?? null,
    academyIcon: academy?.icon ?? null,
    academyColor: academy?.color ?? null,
    academySortOrder: academy?.sortOrder ?? CAMPUS_WIDE_GROUP.academySortOrder,
    runCount: simulator._count.runs,
  };
}

async function enrichSimulatorsWithDerivedAcademy(
  simulators: SimulatorWithAcademy[],
): Promise<SimulatorListItem[]> {
  const missingIds = simulators.filter((simulator) => !simulator.academyId).map((simulator) => simulator.id);
  const derivedBySimulatorId = new Map<string, NonNullable<SimulatorWithAcademy["academy"]>>();

  if (missingIds.length > 0 && isDatabaseConfigured() && isPrismaReady()) {
    const links = await withDatabase((prisma) =>
      prisma.moduleSimulatorLink.findMany({
        where: { simulatorId: { in: missingIds } },
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
      if (!derivedBySimulatorId.has(link.simulatorId)) {
        derivedBySimulatorId.set(link.simulatorId, link.module.academy);
      }
    }
  }

  return simulators.map((simulator) =>
    mapSimulatorListItem(simulator, derivedBySimulatorId.get(simulator.id)),
  );
}
