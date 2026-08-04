import {
  CRICUT_PROJECT_COST_MAX_CENTS,
  CRICUT_STARTER_PROJECT_IDEAS,
  type CricutProjectDifficultyKey,
  type CricutProjectIdeaSeed,
  type CricutProjectMaterial,
  type CricutProjectStep,
} from "@/config/cricut-projects";
import { CRICUT_PRICE_MAX_CENTS } from "@/config/cricut-shop";
import { isDatabaseConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import type {
  CricutProjectBuildIntent,
  CricutProjectBuildStatus,
} from "@/generated/prisma/client";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import {
  canCreateCricutListing,
  canManageCricutShop,
  createCricutShopItem,
  getCricutOrganization,
} from "@/services/cricut-shop-service";

export type CricutProjectIdeaView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  materials: CricutProjectMaterial[];
  steps: CricutProjectStep[];
  estimatedCostCents: number;
  suggestedSellPriceCents: number;
  imageUrl: string | null;
  dollarStoreTag: string | null;
  difficulty: CricutProjectDifficultyKey;
  timeMinutes: number | null;
  sellNotes: string | null;
  active: boolean;
  /** True for starter-catalog entries that are not stored in the database. */
  isStarter: boolean;
};

export type CricutProjectBuildView = {
  id: string;
  ideaId: string;
  ideaTitle: string;
  ideaSlug: string;
  intent: CricutProjectBuildIntent;
  status: CricutProjectBuildStatus;
  completedSteps: number[];
  gatheredMaterials: number[];
  notes: string | null;
  listedItemId: string | null;
  stepCount: number;
  materialCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export const CRICUT_BUILD_STATUS_LABELS: Record<CricutProjectBuildStatus, string> = {
  PLANNED: "On my list",
  IN_PROGRESS: "Making it",
  COMPLETED: "Made it",
  ABANDONED: "Set aside",
};

const STARTER_ID_PREFIX = "starter-";

function starterId(slug: string): string {
  return `${STARTER_ID_PREFIX}${slug}`;
}

export function isStarterProjectId(id: string): boolean {
  return id.startsWith(STARTER_ID_PREFIX);
}

function seedToView(seed: CricutProjectIdeaSeed): CricutProjectIdeaView {
  return {
    id: starterId(seed.slug),
    slug: seed.slug,
    title: seed.title,
    summary: seed.summary,
    materials: seed.materials,
    steps: seed.steps,
    estimatedCostCents: seed.estimatedCostCents,
    suggestedSellPriceCents: seed.suggestedSellPriceCents,
    imageUrl: null,
    dollarStoreTag: seed.dollarStoreTag,
    difficulty: seed.difficulty,
    timeMinutes: seed.timeMinutes,
    sellNotes: seed.sellNotes ?? null,
    active: true,
    isStarter: true,
  };
}

/**
 * Curated catalog Cricut Club always has on hand. Unlike sample shop items,
 * these are real club content (the menu makers pick from), so they stay
 * visible when the database is empty or unreachable.
 */
export function getStarterProjectIdeas(): CricutProjectIdeaView[] {
  return CRICUT_STARTER_PROJECT_IDEAS.map(seedToView);
}

function parseMaterials(value: unknown): CricutProjectMaterial[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((raw): CricutProjectMaterial | null => {
      const row = (raw ?? {}) as Record<string, unknown>;
      const name = String(row.name ?? "").trim();
      if (!name) {
        return null;
      }
      const costCents = Number(row.costCents ?? 0);
      return {
        name,
        qty: row.qty ? String(row.qty) : undefined,
        source: row.source ? String(row.source) : undefined,
        costCents: Number.isFinite(costCents) ? Math.max(0, Math.round(costCents)) : 0,
        clubSupply: row.clubSupply === true,
      };
    })
    .filter((row): row is CricutProjectMaterial => row !== null);
}

function parseSteps(value: unknown): CricutProjectStep[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((raw): CricutProjectStep | null => {
      const row = (raw ?? {}) as Record<string, unknown>;
      const title = String(row.title ?? "").trim();
      if (!title) {
        return null;
      }
      return {
        title,
        detail: row.detail ? String(row.detail) : undefined,
      };
    })
    .filter((row): row is CricutProjectStep => row !== null);
}

function parseIndexList(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [
    ...new Set(
      value
        .map((entry) => Number(entry))
        .filter((entry) => Number.isInteger(entry) && entry >= 0),
    ),
  ].sort((a, b) => a - b);
}

type IdeaRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  materials: unknown;
  steps: unknown;
  estimatedCostCents: number;
  suggestedSellPriceCents: number;
  imageUrl: string | null;
  dollarStoreTag: string | null;
  difficulty: CricutProjectDifficultyKey;
  timeMinutes: number | null;
  sellNotes: string | null;
  active: boolean;
};

function mapIdea(row: IdeaRow): CricutProjectIdeaView {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    materials: parseMaterials(row.materials),
    steps: parseSteps(row.steps),
    estimatedCostCents: row.estimatedCostCents,
    suggestedSellPriceCents: row.suggestedSellPriceCents,
    imageUrl: row.imageUrl,
    dollarStoreTag: row.dollarStoreTag,
    difficulty: row.difficulty,
    timeMinutes: row.timeMinutes,
    sellNotes: row.sellNotes,
    active: row.active,
    isStarter: false,
  };
}

export function slugifyProjectTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || `project-${Date.now()}`;
}

export async function listCricutProjectIdeas(options?: {
  includeInactive?: boolean;
}): Promise<CricutProjectIdeaView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return getStarterProjectIdeas();
  }

  const org = await getCricutOrganization();
  if (!org) {
    return getStarterProjectIdeas();
  }

  const rows = await withDatabase((prisma) =>
    prisma.cricutProjectIdea.findMany({
      where: {
        organizationId: org.id,
        ...(options?.includeInactive ? {} : { active: true }),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 100,
    }),
  );

  if (!rows?.length) {
    return getStarterProjectIdeas();
  }

  return rows.map(mapIdea);
}

export async function getCricutProjectIdea(
  idOrSlug: string,
): Promise<CricutProjectIdeaView | null> {
  if (isStarterProjectId(idOrSlug)) {
    const slug = idOrSlug.slice(STARTER_ID_PREFIX.length);
    const seed = CRICUT_STARTER_PROJECT_IDEAS.find((idea) => idea.slug === slug);
    return seed ? seedToView(seed) : null;
  }

  if (isDatabaseConfigured() && isPrismaReady()) {
    const row = await withDatabase((prisma) =>
      prisma.cricutProjectIdea.findFirst({
        where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      }),
    );
    if (row) {
      return mapIdea(row);
    }
  }

  const seed = CRICUT_STARTER_PROJECT_IDEAS.find((idea) => idea.slug === idOrSlug);
  return seed ? seedToView(seed) : null;
}

export async function canManageCricutProjects(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  const org = await getCricutOrganization();
  if (!org) {
    return false;
  }
  return canManageCricutShop(userId, role, org.id);
}

export async function canListCricutProjectForSale(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  const org = await getCricutOrganization();
  if (!org) {
    return false;
  }
  return canCreateCricutListing(userId, role, org.id);
}

export async function saveCricutProjectIdea(input: {
  id?: string;
  title: string;
  summary: string;
  materials: CricutProjectMaterial[];
  steps: CricutProjectStep[];
  estimatedCostCents: number;
  suggestedSellPriceCents: number;
  dollarStoreTag?: string;
  difficulty: CricutProjectDifficultyKey;
  timeMinutes?: number;
  sellNotes?: string;
  imageUrl?: string;
  storagePath?: string;
  createdById: string;
}): Promise<{ id: string } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Project ideas need the database. Try again after setup." };
  }

  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club is not seeded yet. Run db:seed:focus-clubs." };
  }

  const title = input.title.trim().slice(0, 120);
  const summary = input.summary.trim().slice(0, 1200);
  if (title.length < 2) {
    return { error: "Give the project a title." };
  }
  if (summary.length < 4) {
    return { error: "Add a short description of the project." };
  }
  if (input.materials.length === 0) {
    return { error: "List at least one material." };
  }
  if (input.steps.length === 0) {
    return { error: "Add at least one step." };
  }
  if (
    input.estimatedCostCents < 0 ||
    input.estimatedCostCents > CRICUT_PROJECT_COST_MAX_CENTS
  ) {
    return { error: "Estimated cost looks off — keep it under $500." };
  }
  if (
    input.suggestedSellPriceCents < 0 ||
    input.suggestedSellPriceCents > CRICUT_PRICE_MAX_CENTS
  ) {
    return { error: "Suggested sell price exceeds the $5,000 ceiling." };
  }

  const data = {
    title,
    summary,
    materials: input.materials,
    steps: input.steps,
    estimatedCostCents: input.estimatedCostCents,
    suggestedSellPriceCents: input.suggestedSellPriceCents,
    dollarStoreTag: input.dollarStoreTag?.trim().slice(0, 80) || null,
    difficulty: input.difficulty,
    timeMinutes: input.timeMinutes && input.timeMinutes > 0 ? input.timeMinutes : null,
    sellNotes: input.sellNotes?.trim().slice(0, 600) || null,
    ...(input.imageUrl ? { imageUrl: input.imageUrl } : {}),
    ...(input.storagePath ? { storagePath: input.storagePath } : {}),
  };

  if (input.id && !isStarterProjectId(input.id)) {
    const updated = await withDatabase((prisma) =>
      prisma.cricutProjectIdea.update({
        where: { id: input.id },
        data,
        select: { id: true },
      }),
    );
    return updated ? { id: updated.id } : { error: "Unable to save the project." };
  }

  const slug = await uniqueProjectSlug(slugifyProjectTitle(title));
  const created = await withDatabase((prisma) =>
    prisma.cricutProjectIdea.create({
      data: {
        ...data,
        slug,
        organizationId: org.id,
        createdById: input.createdById,
        active: true,
      },
      select: { id: true },
    }),
  );

  return created ? { id: created.id } : { error: "Unable to save the project." };
}

async function uniqueProjectSlug(base: string): Promise<string> {
  const existing = await withDatabase((prisma) =>
    prisma.cricutProjectIdea.findUnique({
      where: { slug: base },
      select: { id: true },
    }),
  );
  return existing ? `${base}-${Date.now().toString(36).slice(-4)}` : base;
}

export async function setCricutProjectIdeaActive(input: {
  ideaId: string;
  active: boolean;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady() || isStarterProjectId(input.ideaId)) {
    return false;
  }
  const updated = await withDatabase((prisma) =>
    prisma.cricutProjectIdea.updateMany({
      where: { id: input.ideaId },
      data: { active: input.active },
    }),
  );
  return (updated?.count ?? 0) > 0;
}

function mapBuild(row: {
  id: string;
  ideaId: string;
  intent: CricutProjectBuildIntent;
  status: CricutProjectBuildStatus;
  completedSteps: unknown;
  gatheredMaterials: unknown;
  notes: string | null;
  listedItemId: string | null;
  createdAt: Date;
  updatedAt: Date;
  idea: { title: string; slug: string; steps: unknown; materials: unknown };
}): CricutProjectBuildView {
  return {
    id: row.id,
    ideaId: row.ideaId,
    ideaTitle: row.idea.title,
    ideaSlug: row.idea.slug,
    intent: row.intent,
    status: row.status,
    completedSteps: parseIndexList(row.completedSteps),
    gatheredMaterials: parseIndexList(row.gatheredMaterials),
    notes: row.notes,
    listedItemId: row.listedItemId,
    stepCount: parseSteps(row.idea.steps).length,
    materialCount: parseMaterials(row.idea.materials).length,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const BUILD_INCLUDE = {
  idea: { select: { title: true, slug: true, steps: true, materials: true } },
} as const;

export async function getCricutProjectBuild(
  userId: string,
  ideaId: string,
): Promise<CricutProjectBuildView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady() || isStarterProjectId(ideaId)) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.cricutProjectBuild.findUnique({
      where: { ideaId_userId: { ideaId, userId } },
      include: BUILD_INCLUDE,
    }),
  );

  return row ? mapBuild(row) : null;
}

export async function listCricutProjectBuildsForUser(
  userId: string,
): Promise<CricutProjectBuildView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.cricutProjectBuild.findMany({
      where: { userId },
      include: BUILD_INCLUDE,
      orderBy: { updatedAt: "desc" },
      take: 50,
    }),
  );

  return (rows ?? []).map(mapBuild);
}

/** "Make this" / "Sell this" — opens (or re-opens) a personal checklist. */
export async function startCricutProjectBuild(input: {
  userId: string;
  ideaId: string;
  intent: CricutProjectBuildIntent;
}): Promise<{ buildId: string } | { error: string }> {
  if (isStarterProjectId(input.ideaId)) {
    return {
      error:
        "This is a starter idea — a Cricut officer can publish it to the catalog so progress saves.",
    };
  }
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "Project checklists need the database. Try again after setup." };
  }

  const build = await withDatabase((prisma) =>
    prisma.cricutProjectBuild.upsert({
      where: { ideaId_userId: { ideaId: input.ideaId, userId: input.userId } },
      create: {
        ideaId: input.ideaId,
        userId: input.userId,
        intent: input.intent,
        status: "PLANNED",
      },
      update: { intent: input.intent },
      select: { id: true },
    }),
  );

  return build ? { buildId: build.id } : { error: "Unable to start this project." };
}

function toggleIndex(list: number[], index: number): number[] {
  return list.includes(index)
    ? list.filter((entry) => entry !== index)
    : [...list, index].sort((a, b) => a - b);
}

export async function toggleCricutBuildProgress(input: {
  userId: string;
  buildId: string;
  kind: "step" | "material";
  index: number;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const build = await withDatabase((prisma) =>
    prisma.cricutProjectBuild.findFirst({
      where: { id: input.buildId, userId: input.userId },
      include: BUILD_INCLUDE,
    }),
  );

  if (!build) {
    return false;
  }

  const current = mapBuild(build);
  const nextSteps =
    input.kind === "step"
      ? toggleIndex(current.completedSteps, input.index)
      : current.completedSteps;
  const nextMaterials =
    input.kind === "material"
      ? toggleIndex(current.gatheredMaterials, input.index)
      : current.gatheredMaterials;

  const allStepsDone =
    current.stepCount > 0 && nextSteps.length >= current.stepCount;
  const anyProgress = nextSteps.length > 0 || nextMaterials.length > 0;
  const status: CricutProjectBuildStatus = allStepsDone
    ? "COMPLETED"
    : anyProgress
      ? "IN_PROGRESS"
      : "PLANNED";

  const updated = await withDatabase((prisma) =>
    prisma.cricutProjectBuild.update({
      where: { id: input.buildId },
      data: {
        completedSteps: nextSteps,
        gatheredMaterials: nextMaterials,
        status,
      },
      select: { id: true },
    }),
  );

  return Boolean(updated);
}

export async function updateCricutBuildStatus(input: {
  userId: string;
  buildId: string;
  status: CricutProjectBuildStatus;
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }
  const updated = await withDatabase((prisma) =>
    prisma.cricutProjectBuild.updateMany({
      where: { id: input.buildId, userId: input.userId },
      data: { status: input.status },
    }),
  );
  return (updated?.count ?? 0) > 0;
}

/** "Sell this" hand-off — publishes the finished creation into the shop catalog. */
export async function listCricutProjectInShop(input: {
  userId: string;
  role: CampusRole;
  ideaId: string;
  priceCents: number;
  availableToSell: boolean;
}): Promise<{ itemId: string } | { error: string }> {
  const org = await getCricutOrganization();
  if (!org) {
    return { error: "Cricut Club is not seeded yet." };
  }
  if (!(await canCreateCricutListing(input.userId, input.role, org.id))) {
    return { error: "Join Cricut Club to list creations in the shop." };
  }

  const idea = await getCricutProjectIdea(input.ideaId);
  if (!idea) {
    return { error: "Project not found." };
  }
  if (input.priceCents <= 0 || input.priceCents > CRICUT_PRICE_MAX_CENTS) {
    return { error: "Enter a valid sell price." };
  }

  const itemId = await createCricutShopItem({
    sellerId: input.userId,
    organizationId: org.id,
    title: idea.title,
    description: idea.summary,
    priceCents: input.priceCents,
    availableToSell: input.availableToSell,
    imageUrl: idea.imageUrl ?? undefined,
  });

  if (!itemId) {
    return { error: "Unable to create the shop listing." };
  }

  if (!idea.isStarter) {
    await withDatabase((prisma) =>
      prisma.cricutProjectBuild.upsert({
        where: { ideaId_userId: { ideaId: idea.id, userId: input.userId } },
        create: {
          ideaId: idea.id,
          userId: input.userId,
          intent: "SELL",
          status: "IN_PROGRESS",
          listedItemId: itemId,
        },
        update: { intent: "SELL", listedItemId: itemId },
        select: { id: true },
      }),
    );
  }

  return { itemId };
}

/** Counts for the projects hub header — soft-fails to catalog size. */
export async function getCricutProjectStats(userId: string): Promise<{
  ideaCount: number;
  myBuildCount: number;
  myCompletedCount: number;
}> {
  const [ideas, builds] = await Promise.all([
    listCricutProjectIdeas(),
    listCricutProjectBuildsForUser(userId),
  ]);

  return {
    ideaCount: ideas.length,
    myBuildCount: builds.filter((build) => build.status !== "ABANDONED").length,
    myCompletedCount: builds.filter((build) => build.status === "COMPLETED").length,
  };
}
