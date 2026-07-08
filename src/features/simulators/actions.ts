"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageSimulators, canUseSimulators } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import type { SimulatorCategory, SimulatorStatus } from "@/generated/prisma/client";
import {
  createSimulator,
  logSimulatorRun,
  updateSimulatorStatus,
} from "@/services/simulator-service";

export type SimulatorActionState = {
  error?: string;
  success?: string;
};

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().trim().optional(),
  category: z.string().optional(),
  academyId: z.string().optional(),
  launchUrl: z.string().trim().url("Launch URL must be valid"),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

function revalidateSimulatorPaths(slug?: string) {
  revalidatePath("/simulators");
  revalidatePath("/admin/simulators");
  if (slug) {
    revalidatePath(`/simulators/${slug}`);
  }
}

export async function createSimulatorAction(
  _prev: SimulatorActionState,
  formData: FormData,
): Promise<SimulatorActionState> {
  const user = await requireCompleteProfile();

  if (!canManageSimulators(user.role)) {
    return { error: "You do not have permission to create simulators." };
  }

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    category: formData.get("category") || undefined,
    academyId: formData.get("academyId") || undefined,
    launchUrl: formData.get("launchUrl"),
    sortOrder: formData.get("sortOrder") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid simulator data." };
  }

  const simulatorId = await createSimulator({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    category: parsed.data.category as SimulatorCategory | undefined,
    academyId: parsed.data.academyId,
    launchUrl: parsed.data.launchUrl,
    sortOrder: parsed.data.sortOrder,
  });

  if (!simulatorId) {
    return { error: "Unable to create simulator." };
  }

  revalidateSimulatorPaths(parsed.data.slug);
  return { success: "Simulator created as draft." };
}

export async function updateSimulatorStatusAction(
  simulatorId: string,
  slug: string,
  status: SimulatorStatus,
): Promise<SimulatorActionState> {
  const user = await requireCompleteProfile();

  if (!canManageSimulators(user.role)) {
    return { error: "You do not have permission to update simulators." };
  }

  const success = await updateSimulatorStatus(simulatorId, status);

  if (!success) {
    return { error: "Unable to update simulator status." };
  }

  revalidateSimulatorPaths(slug);
  return { success: `Simulator marked ${status.toLowerCase()}.` };
}

export async function logSimulatorRunAction(
  simulatorId: string,
  slug: string,
  score?: number,
  durationMin?: number,
): Promise<SimulatorActionState> {
  const user = await requireCompleteProfile();

  if (!canUseSimulators(user.role)) {
    return { error: "You do not have permission to log simulator runs." };
  }

  const runId = await logSimulatorRun({
    simulatorId,
    userId: user.id,
    score,
    durationMin,
  });

  if (!runId) {
    return { error: "Unable to log simulator run." };
  }

  revalidateSimulatorPaths(slug);
  return { success: "Simulator run logged." };
}
