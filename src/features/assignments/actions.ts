"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import {
  claimAssignment,
  updateAssignmentStatus,
} from "@/services/assignment-service";
import type { AssignmentStatus } from "@/generated/prisma/client";

export type AssignmentActionState = {
  error?: string;
  success?: string;
};

const statusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "OVERDUE",
]);

function revalidateAssignmentPaths() {
  revalidatePath("/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

export async function updateAssignmentStatusAction(
  assignmentId: string,
  status: AssignmentStatus,
): Promise<AssignmentActionState> {
  const user = await requireCompleteProfile();
  const parsed = statusSchema.safeParse(status);

  if (!parsed.success) {
    return { error: "Invalid assignment status." };
  }

  const success = await updateAssignmentStatus(
    assignmentId,
    user.id,
    parsed.data,
  );

  if (!success) {
    return { error: "Unable to update assignment." };
  }

  revalidateAssignmentPaths();
  return { success: "Assignment status updated." };
}

export async function claimAssignmentAction(
  assignmentId: string,
): Promise<AssignmentActionState> {
  const user = await requireCompleteProfile();
  const success = await claimAssignment(assignmentId, user.id);

  if (!success) {
    return { error: "Unable to claim this assignment." };
  }

  revalidateAssignmentPaths();
  return { success: "Assignment claimed." };
}
