"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { parseCampusFormDateTime } from "@/lib/datetime/campus-local";
import {
  canManageClubCalendar,
  createClubCalendarEvent,
  deleteClubCalendarEvent,
} from "@/services/club-calendar-service";
import { canCreateMandatoryAllMeeting } from "@/lib/command-center-permissions";

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
  mandatoryAllClubs: z.boolean().optional(),
});

function revalidateCalendarPaths(slug: string) {
  revalidatePath(`/organizations/${slug}`);
  revalidatePath("/calendar");
  revalidatePath("/home");
}

export async function createClubCalendarEventAction(
  _prev: ClubCalendarActionState,
  formData: FormData,
): Promise<ClubCalendarActionState> {
  try {
    const user = await requireCompleteProfile();
    const mandatoryAllClubs = formData.get("mandatoryAllClubs") === "on";
    const parsed = eventSchema.safeParse({
      organizationId: formData.get("organizationId"),
      organizationSlug: formData.get("organizationSlug"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      location: formData.get("location") || undefined,
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      mandatoryAllClubs,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid event." };
    }

    if (mandatoryAllClubs) {
      const allowed = await canCreateMandatoryAllMeeting(
        user.id,
        user.role,
        parsed.data.organizationId,
      );
      if (!allowed) {
        return {
          error:
            "Only IT Club President/VP or admin can create mandatory all-hands meetings.",
        };
      }
    }

    const startDate = parseCampusFormDateTime(parsed.data.startDate);
    const endDate = parseCampusFormDateTime(parsed.data.endDate);
    if (!startDate || !endDate) {
      return { error: "Enter valid start and end dates." };
    }
    if (endDate < startDate) {
      return { error: "End must be after start." };
    }

    const result = await createClubCalendarEvent({
      organizationId: parsed.data.organizationId,
      title: parsed.data.title,
      description: parsed.data.description,
      location: parsed.data.location,
      startDate,
      endDate,
      createdById: user.id,
      role: user.role,
      mandatoryAllClubs,
    });

    if (!result.id) {
      return { error: result.error ?? "Unable to create event." };
    }

    revalidateCalendarPaths(parsed.data.organizationSlug);
    return {
      success: mandatoryAllClubs
        ? "Mandatory all-hands meeting scheduled for every club."
        : "Club meeting added.",
    };
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
    const allowed = await canManageClubCalendar(
      user.id,
      user.role,
      organizationId,
    );
    if (!allowed) {
      return { error: "You do not have permission to delete club events." };
    }

    const ok = await deleteClubCalendarEvent({
      eventId,
      organizationId,
      userId: user.id,
      role: user.role,
    });
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
