"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  createEvent,
  createEventAssignment,
  joinEvent,
  leaveEvent,
} from "@/services/event-service";

const createEventSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    academyId: z.string().min(1, "Academy is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    location: z.string().trim().optional(),
    description: z.string().trim().optional(),
    impactPoints: z.coerce.number().int().min(0).optional(),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { message: "End date must be after start date", path: ["endDate"] },
  );

const createAssignmentSchema = z.object({
  eventId: z.string().min(1),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  points: z.coerce.number().int().min(0).optional(),
  userId: z.string().uuid().optional(),
});

export type EventActionState = {
  error?: string;
  success?: string;
};

function revalidateEventPaths(eventId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/events");
  if (eventId) {
    revalidatePath(`/events/${eventId}`);
  }
}

export async function createEventAction(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const user = await requireCompleteProfile();

  if (!canManageEvents(user.role)) {
    return { error: "You do not have permission to create events." };
  }

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    academyId: formData.get("academyId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
    impactPoints: formData.get("impactPoints") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid event data." };
  }

  const event = await createEvent({
    title: parsed.data.title,
    academyId: parsed.data.academyId,
    startDate: new Date(parsed.data.startDate),
    endDate: new Date(parsed.data.endDate),
    location: parsed.data.location,
    description: parsed.data.description,
    impactPoints: parsed.data.impactPoints,
    createdById: user.id,
  });

  if (!event) {
    return {
      error: "Unable to create event. Check database configuration.",
    };
  }

  revalidateEventPaths(event.id);
  redirect(`/events/${event.id}`);
}

export async function joinEventAction(eventId: string): Promise<EventActionState> {
  const user = await requireCompleteProfile();
  const participant = await joinEvent(eventId, user.id);

  if (!participant) {
    return { error: "Unable to join this event." };
  }

  revalidateEventPaths(eventId);
  return { success: "You are registered for this event." };
}

export async function leaveEventAction(eventId: string): Promise<EventActionState> {
  const user = await requireCompleteProfile();
  const success = await leaveEvent(eventId, user.id);

  if (!success) {
    return { error: "Unable to leave this event." };
  }

  revalidateEventPaths(eventId);
  return { success: "You have left this event." };
}

export async function createAssignmentAction(
  _prevState: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const user = await requireCompleteProfile();

  if (!canManageEvents(user.role)) {
    return { error: "You do not have permission to create assignments." };
  }

  const parsed = createAssignmentSchema.safeParse({
    eventId: formData.get("eventId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate"),
    points: formData.get("points") || 0,
    userId: formData.get("userId") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid assignment data.",
    };
  }

  const { getEventById } = await import("@/services/event-service");
  const event = await getEventById(parsed.data.eventId);

  if (!event) {
    return { error: "Event not found." };
  }

  const assignment = await createEventAssignment({
    title: parsed.data.title,
    description: parsed.data.description,
    dueDate: new Date(parsed.data.dueDate),
    eventId: parsed.data.eventId,
    academyId: event.academy.id,
    userId: parsed.data.userId,
    points: parsed.data.points,
  });

  if (!assignment) {
    return {
      error: "Unable to create assignment. Check database configuration.",
    };
  }

  revalidateEventPaths(parsed.data.eventId);
  return { success: "Assignment added to event." };
}
