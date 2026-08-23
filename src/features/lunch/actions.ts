"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canOrderLunch, ordersLunchForSelf } from "@/config/roles";
import {
  LUNCH_CHOICES,
  fromLunchDateKey,
  isLunchDateOpen,
  isLunchServiceDay,
} from "@/config/lunch";
import { isParentPreviewStudentId } from "@/config/parent-preview";
import { requireCampusAccess } from "@/lib/auth/session";
import { isParentLinkedToStudent } from "@/services/parent-student-service";
import { placeLunchOrder } from "@/services/lunch-service";

export type LunchActionState = {
  error?: string;
  success?: string;
};

const orderSchema = z.object({
  dinerId: z.string().trim().min(1, "Choose who this lunch is for."),
  dateKey: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid service date."),
  choice: z.enum(LUNCH_CHOICES),
  note: z.string().trim().max(200, "Keep notes under 200 characters.").optional(),
});

/**
 * Place or change one lunch order. A user may order for themselves (when their
 * role eats on campus) or for a student they are linked to — nobody else.
 */
export async function placeLunchOrderAction(input: {
  dinerId: string;
  dateKey: string;
  choice: string;
  note?: string;
}): Promise<LunchActionState> {
  const user = await requireCampusAccess();

  if (!canOrderLunch(user.role)) {
    return { error: "Your account cannot order cafeteria lunch." };
  }

  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid lunch order." };
  }

  const { dinerId, dateKey, choice, note } = parsed.data;

  // The preview board never calls this, but an admin previewing the parent view
  // must not be able to write against the synthetic child by any other route.
  if (isParentPreviewStudentId(dinerId)) {
    return {
      error: "Preview only — lunch orders for the sample student are not saved.",
    };
  }

  const isSelf = dinerId === user.id;
  if (isSelf) {
    if (!ordersLunchForSelf(user.role)) {
      return { error: "Parents order for their linked students, not for themselves." };
    }
  } else if (!(await isParentLinkedToStudent(user.id, dinerId))) {
    return { error: "You are not linked to that student." };
  }

  const serviceDate = fromLunchDateKey(dateKey);
  if (!serviceDate) {
    return { error: "Invalid service date." };
  }

  if (!isLunchServiceDay(serviceDate)) {
    return { error: "The cafeteria is closed that day." };
  }

  if (!isLunchDateOpen(serviceDate)) {
    return { error: "Ordering for that day has closed. Call the main office." };
  }

  const result = await placeLunchOrder({
    user: { id: user.id, displayName: user.displayName, role: user.role },
    dinerId,
    dateKey,
    choice,
    note: note ?? null,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidatePath("/lunch");
  revalidatePath("/parent");
  revalidatePath("/home");

  return { success: "Lunch order saved." };
}
