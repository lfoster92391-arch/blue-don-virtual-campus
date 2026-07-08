"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageLabs, canUseLabs } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import type { LabDifficulty, LabStatus } from "@/generated/prisma/client";
import {
  completeLabSession,
  createLab,
  startLabSession,
  updateLabStatus,
} from "@/services/lab-service";

export type LabActionState = {
  error?: string;
  success?: string;
  sessionId?: string;
};

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().trim().optional(),
  academyId: z.string().optional(),
  difficulty: z.string().optional(),
  equipment: z.string().trim().optional(),
  safetyNotes: z.string().trim().optional(),
  launchUrl: z.string().trim().optional(),
});

function revalidateLabPaths(slug?: string) {
  revalidatePath("/labs");
  revalidatePath("/admin/labs");
  if (slug) {
    revalidatePath(`/labs/${slug}`);
  }
}

export async function createLabAction(
  _prev: LabActionState,
  formData: FormData,
): Promise<LabActionState> {
  const user = await requireCompleteProfile();

  if (!canManageLabs(user.role)) {
    return { error: "You do not have permission to create labs." };
  }

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    academyId: formData.get("academyId") || undefined,
    difficulty: formData.get("difficulty") || undefined,
    equipment: formData.get("equipment") || undefined,
    safetyNotes: formData.get("safetyNotes") || undefined,
    launchUrl: formData.get("launchUrl") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid lab data." };
  }

  const labId = await createLab({
    title: parsed.data.title,
    slug: parsed.data.slug,
    description: parsed.data.description,
    academyId: parsed.data.academyId,
    difficulty: parsed.data.difficulty as LabDifficulty | undefined,
    equipment: parsed.data.equipment,
    safetyNotes: parsed.data.safetyNotes,
    launchUrl: parsed.data.launchUrl,
  });

  if (!labId) {
    return { error: "Unable to create lab." };
  }

  revalidateLabPaths(parsed.data.slug);
  return { success: "Lab created as draft." };
}

export async function updateLabStatusAction(
  labId: string,
  slug: string,
  status: LabStatus,
): Promise<LabActionState> {
  const user = await requireCompleteProfile();

  if (!canManageLabs(user.role)) {
    return { error: "You do not have permission to update labs." };
  }

  const success = await updateLabStatus(labId, status);

  if (!success) {
    return { error: "Unable to update lab status." };
  }

  revalidateLabPaths(slug);
  return { success: `Lab marked ${status.toLowerCase()}.` };
}

export async function startLabSessionAction(labId: string, slug: string): Promise<LabActionState> {
  const user = await requireCompleteProfile();

  if (!canUseLabs(user.role)) {
    return { error: "You do not have permission to start lab sessions." };
  }

  const sessionId = await startLabSession(labId, user.id);

  if (!sessionId) {
    return { error: "Unable to start lab session." };
  }

  revalidateLabPaths(slug);
  return { success: "Lab session started.", sessionId };
}

export async function completeLabSessionAction(
  sessionId: string,
  slug: string,
  reflection?: string,
): Promise<LabActionState> {
  const user = await requireCompleteProfile();

  if (!canUseLabs(user.role)) {
    return { error: "You do not have permission to complete lab sessions." };
  }

  const success = await completeLabSession(sessionId, user.id, reflection);

  if (!success) {
    return { error: "Unable to complete lab session." };
  }

  revalidateLabPaths(slug);
  return { success: "Lab session completed." };
}
