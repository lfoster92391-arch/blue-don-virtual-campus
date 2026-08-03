"use server";

import { revalidatePath } from "next/cache";

import type { CollegeReadinessItemId } from "@/config/college-readiness-passport";
import { BLUE_DON_PASS } from "@/config/identity-engine";
import type { CollegeReadinessStatus } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import { updateItemStatus } from "@/services/college-readiness-service";

export type CollegeReadinessActionState = {
  error?: string;
};

function resolveGradeLevel(): number | null {
  const grade = Number.parseInt(BLUE_DON_PASS.grade, 10);
  return Number.isFinite(grade) ? grade : null;
}

function revalidateCollegePassportPaths() {
  revalidatePath("/college-passport");
  revalidatePath("/pathways");
  revalidatePath("/my-journey");
  revalidatePath("/home");
}

export async function updateCollegeReadinessStatusAction(
  itemId: CollegeReadinessItemId,
  status: CollegeReadinessStatus,
): Promise<CollegeReadinessActionState> {
  const user = await requireCompleteProfile();
  const gradeLevel = resolveGradeLevel();

  const success = await updateItemStatus(user.id, itemId, status, gradeLevel);

  if (!success) {
    return { error: "Unable to update passport item." };
  }

  revalidateCollegePassportPaths();
  return {};
}

export async function cycleCollegeReadinessStatusAction(
  itemId: CollegeReadinessItemId,
  currentStatus: CollegeReadinessStatus,
): Promise<CollegeReadinessActionState> {
  const nextStatus: CollegeReadinessStatus =
    currentStatus === "NOT_STARTED"
      ? "IN_PROGRESS"
      : currentStatus === "IN_PROGRESS"
        ? "COMPLETE"
        : "NOT_STARTED";

  return updateCollegeReadinessStatusAction(itemId, nextStatus);
}
