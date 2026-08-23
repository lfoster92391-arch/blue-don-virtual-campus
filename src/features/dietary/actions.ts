"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageDietary, canSubmitDietaryForm } from "@/config/roles";
import { DIETARY_NOTES_MAX_LENGTH } from "@/config/dietary";
import { requireCampusAccess } from "@/lib/auth/session";
import { isParentLinkedToStudent } from "@/services/parent-student-service";
import {
  acceptAllPendingDietaryRequests,
  acceptDietaryRequest,
  declineDietaryRequest,
  submitDietaryRequest,
} from "@/services/dietary-service";

export type DietaryActionState = {
  error?: string;
  success?: string;
};

function revalidateDietaryPaths() {
  revalidatePath("/lunch");
  revalidatePath("/parent");
  revalidatePath("/admin/dietary");
  revalidatePath("/profile");
}

const submitSchema = z.object({
  studentId: z.string().trim().min(1, "Choose which student this is for."),
  allergens: z.array(z.string().trim()).max(40),
  restrictions: z.array(z.string().trim()).max(40),
  notes: z
    .string()
    .trim()
    .max(
      DIETARY_NOTES_MAX_LENGTH,
      `Keep notes under ${DIETARY_NOTES_MAX_LENGTH} characters.`,
    )
    .optional(),
});

/**
 * Submit a dietary / allergy form for a student. Parents may submit for their
 * linked students; office roles may submit for any student they administer.
 */
export async function submitDietaryRequestAction(input: {
  studentId: string;
  allergens: string[];
  restrictions: string[];
  notes?: string;
}): Promise<DietaryActionState> {
  const user = await requireCampusAccess();

  if (!canSubmitDietaryForm(user.role)) {
    return { error: "Your account cannot submit dietary forms." };
  }

  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid dietary form." };
  }

  const { studentId, allergens, restrictions, notes } = parsed.data;

  // Office roles cover any student; everyone else must be linked to them.
  if (
    !canManageDietary(user.role) &&
    !(await isParentLinkedToStudent(user.id, studentId))
  ) {
    return { error: "You are not linked to that student." };
  }

  const result = await submitDietaryRequest({
    studentId,
    submittedById: user.id,
    allergens,
    restrictions,
    notes: notes ?? null,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateDietaryPaths();
  return { success: result.message };
}

/** Accept one dietary form and apply it to the student account. */
export async function acceptDietaryRequestAction(
  requestId: string,
  reviewNote?: string,
): Promise<DietaryActionState> {
  const user = await requireCampusAccess();

  if (!canManageDietary(user.role)) {
    return { error: "Only office staff may accept dietary forms." };
  }

  const result = await acceptDietaryRequest({
    requestId,
    reviewerId: user.id,
    reviewNote: reviewNote ?? null,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateDietaryPaths();
  return { success: result.message };
}

export async function declineDietaryRequestAction(
  requestId: string,
  reviewNote?: string,
): Promise<DietaryActionState> {
  const user = await requireCampusAccess();

  if (!canManageDietary(user.role)) {
    return { error: "Only office staff may review dietary forms." };
  }

  const result = await declineDietaryRequest({
    requestId,
    reviewerId: user.id,
    reviewNote: reviewNote ?? null,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateDietaryPaths();
  return { success: result.message };
}

/** Clear the pending queue — accept every outstanding form at once. */
export async function acceptAllDietaryRequestsAction(): Promise<DietaryActionState> {
  const user = await requireCampusAccess();

  if (!canManageDietary(user.role)) {
    return { error: "Only office staff may accept dietary forms." };
  }

  const { accepted, failed } = await acceptAllPendingDietaryRequests(user.id);

  revalidateDietaryPaths();

  if (accepted === 0 && failed === 0) {
    return { success: "No dietary forms were waiting for review." };
  }

  if (failed > 0) {
    return {
      success: `Accepted and applied ${accepted} dietary form${accepted === 1 ? "" : "s"}. ${failed} could not be applied — review them individually.`,
    };
  }

  return {
    success: `Accepted and applied ${accepted} dietary form${accepted === 1 ? "" : "s"} to student accounts.`,
  };
}
