"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ImpactProjectStatus } from "@/config/impact-before-diploma";
import { canManageImpactFund } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  createImpactProject,
  getStudentImpactProject,
  updateImpactProjectStatus,
} from "@/services/impact-project-service";

export type ImpactProjectActionState = {
  error?: string;
  success?: string;
  projectId?: string;
};

const proposalSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(30, "Please describe your project in more detail"),
});

function revalidateImpactProjectPaths() {
  revalidatePath("/impact-project");
  revalidatePath("/admin/impact-projects");
  revalidatePath("/pathways");
}

export async function submitImpactProjectAction(
  _prev: ImpactProjectActionState,
  formData: FormData,
): Promise<ImpactProjectActionState> {
  const user = await requireCompleteProfile();

  const existing = await getStudentImpactProject(user.id);
  if (existing && existing.status !== "REJECTED") {
    return { error: "You already have an active impact project." };
  }

  const parsed = proposalSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid proposal." };
  }

  const displayName =
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    "Student";

  const projectId = await createImpactProject({
    studentId: user.id,
    studentName: displayName,
    title: parsed.data.title,
    description: parsed.data.description,
  });

  if (!projectId) {
    return { error: "Unable to submit proposal." };
  }

  revalidateImpactProjectPaths();
  return { success: "Proposal submitted for advisor review.", projectId };
}

export async function updateImpactProjectStatusAction(
  projectId: string,
  status: ImpactProjectStatus,
): Promise<ImpactProjectActionState> {
  const user = await requireCompleteProfile();

  if (!canManageImpactFund(user.role)) {
    return { error: "You do not have permission to review projects." };
  }

  const success = await updateImpactProjectStatus(projectId, status, user.id);

  if (!success) {
    return { error: "Unable to update project status." };
  }

  revalidateImpactProjectPaths();
  return { success: `Project marked as ${status.toLowerCase().replace("_", " ")}.` };
}
