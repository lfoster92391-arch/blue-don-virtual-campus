"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageClubCalendar,
  createClubCalendarEvent,
  deleteClubCalendarEvent,
} from "@/services/club-calendar-service";

export type ClubCalendarActionState = {
  error?: string;
  success?: string;
};

const eventSchema = z.object({
  organizationId: z.string().min(1),
  organizationSlug: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  location: z.string().trim().max(120).optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

function revalidateCalendarPaths(slug: string) {
  revalidatePath(`/organizations/${slug}`);
  revalidatePath("/calendar");
}

export async function createClubCalendarEventAction(
  _prev: ClubCalendarActionState,
  formData: FormData,
): Promise<ClubCalendarActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = eventSchema.safeParse({
      organizationId: formData.get("organizationId"),
      organizationSlug: formData.get("organizationSlug"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      location: formData.get("location") || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid event." };
    }

    const allowed = await canManageClubCalendar(
      user.id,
      user.role,
      parsed.data.organizationId,
    );
    if (!allowed) {
      return { error: "You do not have permission to manage club calendar events." };
    }

    const startDate = new Date(parsed.data.startDate);
    const endDate = new Date(parsed.data.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { error: "Enter valid start and end dates." };
    }
    if (endDate < startDate) {
      return { error: "End must be after start." };
    }

    const id = await createClubCalendarEvent({
      organizationId: parsed.data.organizationId,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      startDate,
      endDate,
      createdById: user.id,
    });

    if (!id) {
      return { error: "Unable to create event." };
    }

    revalidateCalendarPaths(parsed.data.organizationSlug);
    return { success: "Club event added to the shared calendar." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create event.",
    };
  }
}

export async function deleteClubCalendarEventAction(
  organizationId: string,
  organizationSlug: string,
  eventId: string,
): Promise<ClubCalendarActionState> {
  try {
    const user = await requireCompleteProfile();
    const allowed = await canManageClubCalendar(user.id, user.role, organizationId);
    if (!allowed) {
      return { error: "You do not have permission to delete club events." };
    }

    const ok = await deleteClubCalendarEvent({ eventId, organizationId });
    if (!ok) {
      return { error: "Unable to delete event." };
    }

    revalidateCalendarPaths(organizationSlug);
    return { success: "Event removed." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to delete event.",
    };
  }
}
