"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { redirectToClubTab, rethrowIfRedirect } from "@/lib/club-tab-path";
import { parseCampusFormDateTime } from "@/lib/datetime/campus-local";
import {
  assignClubTasks,
  deleteClubTask,
  updateClubTaskStatus,
} from "@/services/club-student-task-service";

export type ClubTaskActionState = {
  error?: string;
  success?: string;
};

const statusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
]);

function revalidateTaskPaths(slug: string) {
  revalidatePath("/home");
  revalidatePath(`/organizations/${slug}`);
}

export async function assignClubTaskAction(
  _prev: ClubTaskActionState,
  formData: FormData,
): Promise<ClubTaskActionState> {
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  try {
    const user = await requireCompleteProfile();
    const organizationId = String(formData.get("organizationId") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const dueAtRaw = String(formData.get("dueAt") ?? "").trim();
    const assigneeIds = formData
      .getAll("assigneeIds")
      .map((v) => String(v).trim())
      .filter(Boolean);
    const wholeClub = formData.get("wholeClub") === "on";

    if (!organizationId || !title) {
      return { error: "Task title is required." };
    }

    let recipients = assigneeIds;
    if (wholeClub) {
      const { listActiveClubMemberIds } = await import(
        "@/lib/command-center-permissions"
      );
      recipients = (await listActiveClubMemberIds(organizationId)).filter(
        (id) => id !== user.id,
      );
    }

    const dueAt = dueAtRaw ? parseCampusFormDateTime(dueAtRaw) : null;
    if (dueAtRaw && !dueAt) {
      return { error: "Enter a valid due date." };
    }

    const result = await assignClubTasks({
      organizationId,
      title,
      description: description || null,
      dueAt,
      assigneeIds: recipients,
      createdById: user.id,
      role: user.role,
    });

    if (result.error) {
      return { error: result.error };
    }

    revalidateTaskPaths(organizationSlug);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to assign task.",
    };
  }

  redirectToClubTab(organizationSlug, "tasks");
}

export async function updateClubTaskStatusAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const taskId = String(formData.get("taskId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const parsed = statusSchema.safeParse(statusRaw);
  if (!taskId || !parsed.success) {
    return;
  }

  await updateClubTaskStatus({
    taskId,
    userId: user.id,
    role: user.role,
    status: parsed.data,
  });
  const slug = organizationSlug || "it-club";
  revalidateTaskPaths(slug);
  redirectToClubTab(slug, "tasks");
}

export async function deleteClubTaskAction(formData: FormData): Promise<void> {
  const user = await requireCompleteProfile();
  const taskId = String(formData.get("taskId") ?? "");
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  if (!taskId) {
    return;
  }
  await deleteClubTask({
    taskId,
    userId: user.id,
    role: user.role,
  });
  const slug = organizationSlug || "it-club";
  revalidateTaskPaths(slug);
  redirectToClubTab(slug, "tasks");
}
