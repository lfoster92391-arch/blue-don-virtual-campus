import type {
  AcademyLevelTier,
  AssessmentType,
  LabDifficulty,
  PrismaClient,
  SimulatorCategory,
} from "../src/generated/prisma/client";

export const LEARNING_FLOW = [
  "LEARN",
  "WATCH",
  "GUIDED_LAB",
  "PRACTICE_LAB",
  "CHALLENGE_LAB",
  "TROUBLESHOOTING_LAB",
  "PRACTICAL_EXAM",
  "CERTIFICATION",
  "PORTFOLIO_PROJECT",
  "CAPSTONE_MISSION",
] as const;

export type ModuleDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  levelTier: AcademyLevelTier;
  sortOrder: number;
  lessonContent?: Partial<Record<(typeof LEARNING_FLOW)[number], string>>;
  video?: { id: string; title: string; description?: string };
  assessment?: { id: string; title: string; type: AssessmentType };
  labLinks?: { labSlug: string; stepType: (typeof LEARNING_FLOW)[number] }[];
  simLinks?: { simSlug: string; stepType: (typeof LEARNING_FLOW)[number] }[];
};

export type LabDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: LabDifficulty;
  equipment?: string;
  safetyNotes?: string;
};

export type SimDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: SimulatorCategory;
  sortOrder?: number;
};

export type MissionDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  levelTier: AcademyLevelTier;
  objectives: string[];
  labSlug?: string;
  sortOrder: number;
};

export type CertDef = {
  id: string;
  slug: string;
  title: string;
  description: string;
  levelTier: AcademyLevelTier;
  requirements?: string;
  sortOrder: number;
};

function labUrl(slug: string) {
  return `/labs/${slug}`;
}

function simUrl(slug: string) {
  return `/simulators/${slug}`;
}

async function getLevelId(prisma: PrismaClient, academyId: string, tier: AcademyLevelTier) {
  const level = await prisma.academyLevel.findUnique({
    where: { academyId_tier: { academyId, tier } },
  });
  return level?.id;
}

async function upsertLab(prisma: PrismaClient, academyId: string, lab: LabDef) {
  return prisma.lab.upsert({
    where: { slug: lab.slug },
    update: {
      title: lab.title,
      description: lab.description,
      academyId,
      status: "ACTIVE",
      difficulty: lab.difficulty,
      equipment: lab.equipment,
      safetyNotes: lab.safetyNotes,
      launchUrl: labUrl(lab.slug),
    },
    create: {
      id: lab.id,
      slug: lab.slug,
      title: lab.title,
      description: lab.description,
      academyId,
      status: "ACTIVE",
      difficulty: lab.difficulty,
      equipment: lab.equipment,
      safetyNotes: lab.safetyNotes,
      launchUrl: labUrl(lab.slug),
    },
  });
}

async function upsertSim(prisma: PrismaClient, academyId: string, sim: SimDef) {
  return prisma.simulator.upsert({
    where: { slug: sim.slug },
    update: {
      title: sim.title,
      description: sim.description,
      academyId,
      status: "ACTIVE",
      category: sim.category,
      launchUrl: simUrl(sim.slug),
      sortOrder: sim.sortOrder ?? 0,
    },
    create: {
      id: sim.id,
      slug: sim.slug,
      title: sim.title,
      description: sim.description,
      academyId,
      status: "ACTIVE",
      category: sim.category,
      launchUrl: simUrl(sim.slug),
      sortOrder: sim.sortOrder ?? 0,
    },
  });
}

async function seedModule(
  prisma: PrismaClient,
  academyId: string,
  mod: ModuleDef,
  labSlugToId: Map<string, string>,
  simSlugToId: Map<string, string>,
) {
  const levelId = await getLevelId(prisma, academyId, mod.levelTier);

  const module = await prisma.learningModule.upsert({
    where: { academyId_slug: { academyId, slug: mod.slug } },
    update: {
      title: mod.title,
      description: mod.description,
      status: "PUBLISHED",
      levelId,
      sortOrder: mod.sortOrder,
    },
    create: {
      id: mod.id,
      academyId,
      levelId,
      slug: mod.slug,
      title: mod.title,
      description: mod.description,
      status: "PUBLISHED",
      sortOrder: mod.sortOrder,
    },
  });

  for (let i = 0; i < LEARNING_FLOW.length; i++) {
    const step = LEARNING_FLOW[i];
    const lessonId = `lesson-${mod.id}-${step.toLowerCase()}`;
    await prisma.lesson.upsert({
      where: { id: lessonId },
      update: {
        sortOrder: i,
        content: mod.lessonContent?.[step] ?? `${mod.title} — ${step.replace(/_/g, " ")}.`,
      },
      create: {
        id: lessonId,
        moduleId: module.id,
        title: step.replace(/_/g, " "),
        content: mod.lessonContent?.[step] ?? `${mod.title} — ${step.replace(/_/g, " ")}.`,
        stepType: step,
        sortOrder: i,
      },
    });
  }

  if (mod.video) {
    await prisma.video.upsert({
      where: { id: mod.video.id },
      update: { moduleId: module.id, academyId },
      create: {
        id: mod.video.id,
        academyId,
        moduleId: module.id,
        title: mod.video.title,
        description: mod.video.description,
        sortOrder: 0,
      },
    });
  }

  if (mod.assessment) {
    await prisma.assessment.upsert({
      where: { id: mod.assessment.id },
      update: { moduleId: module.id },
      create: {
        id: mod.assessment.id,
        moduleId: module.id,
        title: mod.assessment.title,
        type: mod.assessment.type,
        passingScore: 70,
        questions: { items: 10, placeholder: true },
        sortOrder: 0,
      },
    });
  }

  for (const link of mod.labLinks ?? []) {
    const labId = labSlugToId.get(link.labSlug);
    if (!labId) continue;
    await prisma.moduleLabLink.upsert({
      where: {
        moduleId_labId_stepType: { moduleId: module.id, labId, stepType: link.stepType },
      },
      update: {},
      create: { moduleId: module.id, labId, stepType: link.stepType, sortOrder: 0 },
    });
  }

  for (const link of mod.simLinks ?? []) {
    const simulatorId = simSlugToId.get(link.simSlug);
    if (!simulatorId) continue;
    await prisma.moduleSimulatorLink.upsert({
      where: {
        moduleId_simulatorId_stepType: { moduleId: module.id, simulatorId, stepType: link.stepType },
      },
      update: {},
      create: { moduleId: module.id, simulatorId, stepType: link.stepType, sortOrder: 0 },
    });
  }

  return module;
}

async function seedMissions(
  prisma: PrismaClient,
  academyId: string,
  missions: MissionDef[],
  labSlugToId: Map<string, string>,
) {
  for (const mission of missions) {
    const labId = mission.labSlug ? labSlugToId.get(mission.labSlug) : undefined;
    await prisma.mission.upsert({
      where: { academyId_slug: { academyId, slug: mission.slug } },
      update: {
        title: mission.title,
        description: mission.description,
        status: "ACTIVE",
        objectives: mission.objectives,
        levelTier: mission.levelTier,
        labId,
        sortOrder: mission.sortOrder,
      },
      create: {
        id: mission.id,
        academyId,
        slug: mission.slug,
        title: mission.title,
        description: mission.description,
        levelTier: mission.levelTier,
        status: "ACTIVE",
        objectives: mission.objectives,
        labId,
        sortOrder: mission.sortOrder,
      },
    });
  }
}

async function seedCerts(prisma: PrismaClient, academyId: string, certs: CertDef[]) {
  for (const cert of certs) {
    await prisma.certification.upsert({
      where: { academyId_slug: { academyId, slug: cert.slug } },
      update: {
        title: cert.title,
        description: cert.description,
        status: "ACTIVE",
        levelTier: cert.levelTier,
        requirements: cert.requirements,
        sortOrder: cert.sortOrder,
      },
      create: {
        id: cert.id,
        academyId,
        slug: cert.slug,
        title: cert.title,
        description: cert.description,
        levelTier: cert.levelTier,
        status: "ACTIVE",
        requirements: cert.requirements,
        sortOrder: cert.sortOrder,
      },
    });
  }
}

export async function seedAcademyBundle(
  prisma: PrismaClient,
  academyId: string,
  labs: LabDef[],
  sims: SimDef[],
  modules: ModuleDef[],
  missions: MissionDef[],
  certs: CertDef[],
) {
  const labSlugToId = new Map<string, string>();
  for (const lab of labs) {
    const row = await upsertLab(prisma, academyId, lab);
    labSlugToId.set(lab.slug, row.id);
  }

  const simSlugToId = new Map<string, string>();
  for (const sim of sims) {
    const row = await upsertSim(prisma, academyId, sim);
    simSlugToId.set(sim.slug, row.id);
  }

  for (const mod of modules) {
    await seedModule(prisma, academyId, mod, labSlugToId, simSlugToId);
  }

  await seedMissions(prisma, academyId, missions, labSlugToId);
  await seedCerts(prisma, academyId, certs);
}
