"use server";

import { revalidatePath } from "next/cache";

import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { toggleChecklistItem } from "@/services/checklist-service";

export type ChecklistActionState = {
  error?: string;
  success?: string;
};

function revalidateChecklistPaths(checklistId: string, eventId?: string) {
  revalidatePath("/checklists");
  revalidatePath(`/checklists/${checklistId}`);
  revalidatePath("/dashboard");
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
  }
}

export async function toggleChecklistItemAction(
  itemId: string,
  checklistId: string,
  complete: boolean,
  eventId?: string,
): Promise<ChecklistActionState> {
  const user = await requireCompleteProfile();
  const success = await toggleChecklistItem(itemId, user.id, complete);

  if (!success) {
    return { error: "Unable to update checklist item." };
  }

  revalidateChecklistPaths(checklistId, eventId);
  return { success: complete ? "Item marked complete." : "Item marked incomplete." };
}

export async function createEventChecklistAction(
  eventId: string,
  academyId: string,
): Promise<ChecklistActionState> {
  const user = await requireCompleteProfile();

  if (!canManageEvents(user.role)) {
    return { error: "You do not have permission to create checklists." };
  }

  const { createEventChecklist } = await import("@/services/checklist-service");
  const checklistId = await createEventChecklist({
    eventId,
    academyId,
    title: "Event Operations Checklist",
    items: [
      "Confirm venue and equipment",
      "Brief participants on safety",
      "Assign volunteer roles",
      "Capture attendance",
      "Complete post-event reflection",
    ],
  });

  if (!checklistId) {
    return { error: "Unable to create checklist." };
  }

  revalidateChecklistPaths(checklistId, eventId);
  return { success: "Event checklist created." };
}
