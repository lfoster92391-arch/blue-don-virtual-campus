"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageTickets } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  addTicketComment,
  createTicket,
  updateTicketStatus,
} from "@/services/ticket-service";
import type { TicketCategory, TicketStatus } from "@/generated/prisma/client";

export type TicketActionState = {
  error?: string;
  success?: string;
  ticketId?: string;
};

const createSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required"),
  description: z.string().trim().min(10, "Please describe your issue"),
  category: z.string().min(1),
  priority: z.string().optional(),
});

function revalidateTicketPaths(ticketId?: string) {
  revalidatePath("/service-desk");
  revalidatePath("/dashboard");
  if (ticketId) {
    revalidatePath(`/service-desk/${ticketId}`);
  }
}

export async function createTicketAction(
  _prev: TicketActionState,
  formData: FormData,
): Promise<TicketActionState> {
  const user = await requireCompleteProfile();

  const parsed = createSchema.safeParse({
    subject: formData.get("subject"),
    description: formData.get("description"),
    category: formData.get("category"),
    priority: formData.get("priority") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid ticket data." };
  }

  const ticketId = await createTicket({
    userId: user.id,
    subject: parsed.data.subject,
    description: parsed.data.description,
    category: parsed.data.category as TicketCategory,
  });

  if (!ticketId) {
    return { error: "Unable to create ticket." };
  }

  revalidateTicketPaths(ticketId);
  return { success: "Support ticket submitted.", ticketId };
}

export async function addTicketCommentAction(
  ticketId: string,
  body: string,
): Promise<TicketActionState> {
  const user = await requireCompleteProfile();

  if (!body.trim()) {
    return { error: "Comment cannot be empty." };
  }

  const success = await addTicketComment({
    ticketId,
    userId: user.id,
    body: body.trim(),
  });

  if (!success) {
    return { error: "Unable to add comment." };
  }

  revalidateTicketPaths(ticketId);
  return { success: "Comment added." };
}

export async function updateTicketStatusAction(
  ticketId: string,
  status: TicketStatus,
): Promise<TicketActionState> {
  const user = await requireCompleteProfile();

  if (!canManageTickets(user.role)) {
    return { error: "You do not have permission to update tickets." };
  }

  const success = await updateTicketStatus(ticketId, status);

  if (!success) {
    return { error: "Unable to update ticket status." };
  }

  revalidateTicketPaths(ticketId);
  return { success: "Ticket status updated." };
}
