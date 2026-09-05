"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type {
  StudentMessageAction,
  StudentMessageKind,
} from "@/lib/command-center";
import { requireCompleteProfile } from "@/lib/auth/session";
import { redirectToClubTab, rethrowIfRedirect } from "@/lib/club-tab-path";
import { parseCampusFormDateTime } from "@/lib/datetime/campus-local";
import { sendClubAudienceMessage } from "@/services/club-audience-message-service";
import {
  buildCalendarActions,
  buildDefaultAdvisorActions,
  buildInvoiceReceiptActions,
  sendMessageToWholeClub,
  sendStudentMessages,
  updateStudentMessageStatus,
} from "@/services/student-message-service";

export type StudentMessageActionState = {
  error?: string;
  success?: string;
};

function revalidateMessagePaths(slug?: string | null) {
  revalidatePath("/home");
  revalidatePath("/admin/students");
  if (slug) {
    revalidatePath(`/organizations/${slug}`);
  }
}

function parseActionPreset(
  preset: string,
  href: string,
  organizationSlug: string,
): StudentMessageAction[] {
  if (preset === "invoice_receipt") {
    return buildInvoiceReceiptActions(organizationSlug || "it-club");
  }
  if (preset === "calendar") {
    return buildCalendarActions();
  }
  if (preset === "link") {
    return buildDefaultAdvisorActions(href || undefined);
  }
  // custom checkboxes from form
  return buildDefaultAdvisorActions(href || undefined);
}

export async function sendStudentMessageAction(
  _prev: StudentMessageActionState,
  formData: FormData,
): Promise<StudentMessageActionState> {
  try {
    const user = await requireCompleteProfile();
    const organizationId = String(formData.get("organizationId") ?? "").trim();
    const organizationSlug = String(
      formData.get("organizationSlug") ?? "",
    ).trim();
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const kindRaw = String(formData.get("kind") ?? "ADVISOR_REQUEST");
    const preset = String(formData.get("actionPreset") ?? "link");
    const href = String(formData.get("href") ?? "").trim();
    const wholeClub = formData.get("wholeClub") === "on";
    const recipientIds = formData
      .getAll("recipientIds")
      .map((v) => String(v).trim())
      .filter(Boolean);

    const calendarTitle = String(formData.get("calendarTitle") ?? "").trim();
    const calendarStartRaw = String(formData.get("calendarStart") ?? "").trim();
    const calendarEndRaw = String(formData.get("calendarEnd") ?? "").trim();
    const calendarLocation = String(
      formData.get("calendarLocation") ?? "",
    ).trim();

    if (!title) {
      return { error: "Message title is required." };
    }
    if (!organizationId) {
      return { error: "Select a club." };
    }

    const kind: StudentMessageKind =
      kindRaw === "INVOICE_RECEIPT_REQUEST"
        ? "INVOICE_RECEIPT_REQUEST"
        : kindRaw === "GENERAL"
          ? "GENERAL"
          : "ADVISOR_REQUEST";

    const actions =
      kind === "INVOICE_RECEIPT_REQUEST"
        ? buildInvoiceReceiptActions(organizationSlug)
        : parseActionPreset(preset, href, organizationSlug);

    // Allow custom extra action types from checkboxes
    if (formData.get("includeViewLater") === "on") {
      if (!actions.some((a) => a.actionType === "view_later")) {
        actions.push({ label: "View Later", actionType: "view_later" });
      }
    }
    if (formData.get("includeAddToCalendar") === "on") {
      if (!actions.some((a) => a.actionType === "add_to_calendar")) {
        actions.push({
          label: "Add to calendar",
          actionType: "add_to_calendar",
        });
      }
    }

    const calendarStart = calendarStartRaw
      ? parseCampusFormDateTime(calendarStartRaw)
      : null;
    const calendarEnd = calendarEndRaw
      ? parseCampusFormDateTime(calendarEndRaw)
      : null;

    const payload = {
      fromUserId: user.id,
      role: user.role,
      organizationId,
      title,
      body: body || null,
      kind,
      actions,
      calendarTitle: calendarTitle || null,
      calendarStart: calendarStart,
      calendarEnd: calendarEnd,
      calendarLocation: calendarLocation || null,
    };

    const result = wholeClub
      ? await sendMessageToWholeClub(payload)
      : await sendStudentMessages({ ...payload, toUserIds: recipientIds });

    if (result.error) {
      return { error: result.error };
    }
    if (result.count === 0) {
      return { error: "No messages sent." };
    }

    revalidateMessagePaths(organizationSlug);
    const returnTab = String(formData.get("returnTab") ?? "").trim();
    if (returnTab && organizationSlug) {
      redirectToClubTab(organizationSlug, returnTab);
    }
    return {
      success: `Sent to ${result.count} student${result.count === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error:
        error instanceof Error ? error.message : "Unable to send message.",
    };
  }
}

/**
 * "Message clubs" compose page — one club audience, or everyone in all three.
 * Recipients read it in the same Command Center panel on /home.
 */
export async function sendClubAudienceMessageAction(
  _prev: StudentMessageActionState,
  formData: FormData,
): Promise<StudentMessageActionState> {
  try {
    const user = await requireCompleteProfile();
    const audienceId = String(formData.get("audienceId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const href = String(formData.get("href") ?? "").trim();

    if (!audienceId) {
      return { error: "Pick who this goes to." };
    }
    if (!title) {
      return { error: "Message title is required." };
    }

    const result = await sendClubAudienceMessage({
      fromUserId: user.id,
      role: user.role,
      audienceId,
      title,
      body: body || null,
      href: href || null,
    });

    if (result.error) {
      return { error: result.error };
    }

    revalidateMessagePaths();
    revalidatePath("/messages/clubs");

    const breakdown = result.delivered
      .map((entry) => `${entry.club} (${entry.count})`)
      .join(", ");

    return {
      success: `Sent to ${result.count} ${
        result.count === 1 ? "person" : "people"
      }${breakdown ? ` — ${breakdown}.` : "."}`,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to send message.",
    };
  }
}

export async function studentMessageStatusAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const messageId = String(formData.get("messageId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  const parsed = z
    .enum(["UNREAD", "VIEW_LATER", "DONE", "DISMISSED"])
    .safeParse(statusRaw);
  if (!messageId || !parsed.success) {
    return;
  }
  await updateStudentMessageStatus({
    messageId,
    userId: user.id,
    status: parsed.data,
  });
  revalidatePath("/home");
}

export async function studentMessageViewLaterAction(
  formData: FormData,
): Promise<void> {
  formData.set("status", "VIEW_LATER");
  await studentMessageStatusAction(formData);
}

export async function studentMessageDoneAction(
  formData: FormData,
): Promise<void> {
  formData.set("status", "DONE");
  await studentMessageStatusAction(formData);
}

export async function studentMessageDismissAction(
  formData: FormData,
): Promise<void> {
  formData.set("status", "DISMISSED");
  await studentMessageStatusAction(formData);
}

