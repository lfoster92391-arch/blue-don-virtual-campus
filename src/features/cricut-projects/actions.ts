"use server";

import { revalidatePath } from "next/cache";

import { CRICUT_CLUB_SLUG } from "@/config/cricut-shop";
import type {
  CricutProjectMaterial,
  CricutProjectStep,
  CricutProjectDifficultyKey,
} from "@/config/cricut-projects";
import type {
  CricutProjectBuildIntent,
  CricutProjectBuildStatus,
} from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageCricutProjects,
  listCricutProjectInShop,
  saveCricutProjectIdea,
  setCricutProjectIdeaActive,
  startCricutProjectBuild,
  toggleCricutBuildProgress,
  updateCricutBuildStatus,
} from "@/services/cricut-project-service";

export type CricutProjectActionState = {
  error?: string;
  success?: string;
  ideaId?: string;
  buildId?: string;
  itemId?: string;
};

const DIFFICULTIES: CricutProjectDifficultyKey[] = ["EASY", "MEDIUM", "ADVANCED"];

function revalidateProjects(ideaId?: string) {
  revalidatePath("/cricut");
  revalidatePath("/cricut/projects");
  if (ideaId) {
    revalidatePath(`/cricut/projects/${ideaId}`);
  }
  revalidatePath(`/organizations/${CRICUT_CLUB_SLUG}`);
}

/** [ Make this ] / [ Sell this ] — opens the maker's personal checklist. */
export async function startCricutProjectAction(
  _prev: CricutProjectActionState,
  formData: FormData,
): Promise<CricutProjectActionState> {
  try {
    const user = await requireCompleteProfile();
    const ideaId = String(formData.get("ideaId") ?? "").trim();
    const intent = (String(formData.get("intent") ?? "MAKE") === "SELL"
      ? "SELL"
      : "MAKE") as CricutProjectBuildIntent;

    if (!ideaId) {
      return { error: "Pick a project first." };
    }

    const result = await startCricutProjectBuild({
      userId: user.id,
      ideaId,
      intent,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateProjects(ideaId);
    return {
      success:
        intent === "SELL"
          ? "Added to your list to make and sell."
          : "Added to your make list — check off supplies as you gather them.",
      buildId: result.buildId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to start this project.",
    };
  }
}

export async function toggleCricutBuildProgressAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const buildId = String(formData.get("buildId") ?? "").trim();
  const kind = String(formData.get("kind") ?? "") === "material" ? "material" : "step";
  const index = Number(formData.get("index"));
  const ideaId = String(formData.get("ideaId") ?? "").trim() || undefined;

  if (!buildId || !Number.isInteger(index) || index < 0) {
    return;
  }

  await toggleCricutBuildProgress({ userId: user.id, buildId, kind, index });
  revalidateProjects(ideaId);
}

export async function updateCricutBuildStatusAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const buildId = String(formData.get("buildId") ?? "").trim();
  const status = String(formData.get("status") ?? "") as CricutProjectBuildStatus;
  const ideaId = String(formData.get("ideaId") ?? "").trim() || undefined;

  const allowed: CricutProjectBuildStatus[] = [
    "PLANNED",
    "IN_PROGRESS",
    "COMPLETED",
    "ABANDONED",
  ];
  if (!buildId || !allowed.includes(status)) {
    return;
  }

  await updateCricutBuildStatus({ userId: user.id, buildId, status });
  revalidateProjects(ideaId);
}

/** Sell this → publish the creation into the Cricut shop catalog. */
export async function listCricutProjectInShopAction(
  _prev: CricutProjectActionState,
  formData: FormData,
): Promise<CricutProjectActionState> {
  try {
    const user = await requireCompleteProfile();
    const ideaId = String(formData.get("ideaId") ?? "").trim();
    const price = Number(formData.get("price"));
    const availableToSell = formData.get("availableToSell") !== "off";

    if (!ideaId) {
      return { error: "Pick a project first." };
    }
    if (!Number.isFinite(price) || price <= 0) {
      return { error: "Enter a valid sell price." };
    }

    const result = await listCricutProjectInShop({
      userId: user.id,
      role: user.role,
      ideaId,
      priceCents: Math.round(price * 100),
      availableToSell,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateProjects(ideaId);
    revalidatePath("/cricut/shop");
    revalidatePath(`/cricut/shop/${result.itemId}`);

    return {
      success: availableToSell
        ? "Listed in the Cricut shop and ready to sell."
        : "Added to the shop catalog as showcase only.",
      itemId: result.itemId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to list this project.",
    };
  }
}

function parseMaterialsInput(raw: string): CricutProjectMaterial[] {
  // One material per line: "Name | qty | source | 1.25"
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, qty, source, cost] = line.split("|").map((part) => part.trim());
      const dollars = Number(cost);
      return {
        name: (name ?? "").slice(0, 120),
        qty: qty || undefined,
        source: source || undefined,
        costCents: Number.isFinite(dollars) ? Math.max(0, Math.round(dollars * 100)) : 0,
      } satisfies CricutProjectMaterial;
    })
    .filter((material) => material.name.length > 0);
}

function parseStepsInput(raw: string): CricutProjectStep[] {
  // One step per line: "Do the thing | extra detail"
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, detail] = line.split("|").map((part) => part.trim());
      return {
        title: (title ?? "").slice(0, 160),
        detail: detail ? detail.slice(0, 600) : undefined,
      } satisfies CricutProjectStep;
    })
    .filter((step) => step.title.length > 0);
}

/** Officer-only lightweight catalog editor. */
export async function saveCricutProjectIdeaAction(
  _prev: CricutProjectActionState,
  formData: FormData,
): Promise<CricutProjectActionState> {
  try {
    const user = await requireCompleteProfile();
    if (!(await canManageCricutProjects(user.id, user.role))) {
      return { error: "Only Cricut President / VP can edit the project catalog." };
    }

    const difficultyRaw = String(formData.get("difficulty") ?? "EASY");
    const difficulty = (DIFFICULTIES as string[]).includes(difficultyRaw)
      ? (difficultyRaw as CricutProjectDifficultyKey)
      : "EASY";
    const cost = Number(formData.get("estimatedCost"));
    const sellPrice = Number(formData.get("suggestedSellPrice"));
    const timeMinutes = Number(formData.get("timeMinutes"));

    if (!Number.isFinite(cost) || cost < 0) {
      return { error: "Enter what the supplies cost." };
    }
    if (!Number.isFinite(sellPrice) || sellPrice < 0) {
      return { error: "Enter a suggested sell price." };
    }

    const result = await saveCricutProjectIdea({
      id: String(formData.get("ideaId") ?? "").trim() || undefined,
      title: String(formData.get("title") ?? ""),
      summary: String(formData.get("summary") ?? ""),
      materials: parseMaterialsInput(String(formData.get("materials") ?? "")),
      steps: parseStepsInput(String(formData.get("steps") ?? "")),
      estimatedCostCents: Math.round(cost * 100),
      suggestedSellPriceCents: Math.round(sellPrice * 100),
      dollarStoreTag: String(formData.get("dollarStoreTag") ?? "") || undefined,
      difficulty,
      timeMinutes: Number.isFinite(timeMinutes) ? Math.round(timeMinutes) : undefined,
      sellNotes: String(formData.get("sellNotes") ?? "") || undefined,
      createdById: user.id,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateProjects(result.id);
    return { success: "Project saved to the catalog.", ideaId: result.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save the project.",
    };
  }
}

export async function setCricutProjectActiveAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  if (!(await canManageCricutProjects(user.id, user.role))) {
    return;
  }

  const ideaId = String(formData.get("ideaId") ?? "").trim();
  const active = formData.get("active") === "true";
  if (!ideaId) {
    return;
  }

  await setCricutProjectIdeaActive({ ideaId, active });
  revalidateProjects(ideaId);
}
