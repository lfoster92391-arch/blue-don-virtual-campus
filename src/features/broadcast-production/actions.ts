"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type {
  BroadcastBookingServiceKey,
  BroadcastJoinTrackKey,
  BroadcastProductionRoleKey,
  CampusMediaCategoryKey,
} from "@/config/broadcast-production";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  addBroadcastEquipmentItem,
  createAnnouncementSubmission,
  createBroadcastBooking,
  createJoinApplication,
  removeCrewCredit,
  setBroadcastSchedule,
  toggleBroadcastEquipment,
  updateAnnouncementSubmissionStatus,
  updateBroadcastBookingStatus,
  updateJoinApplicationStatus,
  updateMediaCategory,
  upsertCrewCredit,
} from "@/services/broadcast-production-service";

export type BroadcastActionState = {
  error?: string;
  success?: string;
};

function revalidateBroadcastPaths() {
  revalidatePath("/media");
  revalidatePath("/organizations/broadcasting");
  revalidatePath("/home");
  revalidatePath("/madonna");
  revalidatePath("/madonna/announcements");
  revalidatePath("/madonna/sports-recap");
  revalidatePath("/madonna/highlight-reel");
}

const bookingServices = z.enum([
  "FILM_COVERAGE",
  "PHOTOGRAPHY",
  "LIVE_STREAMING",
]);

const joinTracks = z.enum([
  "HOST",
  "CAMERA",
  "EDITOR",
  "GRAPHICS",
  "AUDIO",
  "PRODUCER",
  "WRITER",
  "FLEXIBLE",
]);

const productionRoles = z.enum([
  "HOST",
  "CAMERA",
  "EDITOR",
  "PRODUCER",
  "GRAPHICS",
  "AUDIO",
  "FLOOR_DIRECTOR",
  "WRITER",
  "OTHER",
]);

const categories = z.enum([
  "MORNING_ANNOUNCEMENTS",
  "SPORTS_HIGHLIGHTS",
  "STUDENT_SPOTLIGHT",
  "SPECIAL_EVENTS",
  "HIGHLIGHT_REEL",
  "OTHER",
]);

function personName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Campus user"
  );
}

export async function setNextAirTimeAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const clear = formData.get("clear") === "1";
    const nextAirRaw = String(formData.get("nextAirAt") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim() || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;

    let nextAirAt: Date | null = null;
    if (!clear) {
      if (!nextAirRaw) {
        return { error: "Pick a date and time for the next live." };
      }
      nextAirAt = new Date(nextAirRaw);
      if (Number.isNaN(nextAirAt.getTime())) {
        return { error: "Invalid air date/time." };
      }
    }

    const result = await setBroadcastSchedule({
      actorId: user.id,
      role: user.role,
      nextAirAt,
      title,
      notes,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateBroadcastPaths();
    return {
      success: clear
        ? "Countdown cleared."
        : "Next live air time saved — countdown is live for campus.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save air time.",
    };
  }
}

export async function submitBookingRequestAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const services = formData
      .getAll("services")
      .map(String) as BroadcastBookingServiceKey[];

    const parsed = z
      .object({
        clubOrTeam: z.string().trim().min(1).max(120),
        eventName: z.string().trim().min(1).max(160),
        eventAt: z.string().trim().min(1),
        location: z.string().trim().max(160).optional(),
        details: z.string().trim().max(2000).optional(),
        requesterEmail: z.string().trim().email().optional().or(z.literal("")),
        services: z.array(bookingServices).min(1),
      })
      .safeParse({
        clubOrTeam: formData.get("clubOrTeam"),
        eventName: formData.get("eventName"),
        eventAt: formData.get("eventAt"),
        location: formData.get("location") || undefined,
        details: formData.get("details") || undefined,
        requesterEmail: formData.get("requesterEmail") || "",
        services,
      });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid booking." };
    }

    const eventAt = new Date(parsed.data.eventAt);
    if (Number.isNaN(eventAt.getTime())) {
      return { error: "Invalid event date/time." };
    }

    const result = await createBroadcastBooking({
      requesterId: user.id,
      requesterName: personName(user),
      requesterEmail: parsed.data.requesterEmail || user.email,
      clubOrTeam: parsed.data.clubOrTeam,
      eventName: parsed.data.eventName,
      eventAt,
      location: parsed.data.location,
      services: parsed.data.services,
      details: parsed.data.details,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateBroadcastPaths();
    return {
      success:
        "Request submitted. Broadcasting crew will review it and message you on Command Center.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to submit booking.",
    };
  }
}

export async function updateBookingStatusAction(
  bookingId: string,
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED",
  reviewNote?: string,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await updateBroadcastBookingStatus({
      bookingId,
      actorId: user.id,
      role: user.role,
      status,
      reviewNote,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return { success: `Booking marked ${status.toLowerCase()}.` };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update booking.",
    };
  }
}

export async function submitAnnouncementRequestAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = z
      .object({
        title: z.string().trim().min(1).max(160),
        body: z.string().trim().min(1).max(2000),
        preferredAirDate: z.string().trim().optional().or(z.literal("")),
        submitterRole: z.string().trim().max(80).optional(),
      })
      .safeParse({
        title: formData.get("title"),
        body: formData.get("body"),
        preferredAirDate: formData.get("preferredAirDate") || "",
        submitterRole: formData.get("submitterRole") || undefined,
      });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid announcement.",
      };
    }

    let preferredAirDate: Date | null = null;
    if (parsed.data.preferredAirDate) {
      preferredAirDate = new Date(parsed.data.preferredAirDate);
      if (Number.isNaN(preferredAirDate.getTime())) {
        return { error: "Invalid preferred air date." };
      }
    }

    const result = await createAnnouncementSubmission({
      submitterId: user.id,
      submitterName: personName(user),
      submitterRole: parsed.data.submitterRole,
      title: parsed.data.title,
      body: parsed.data.body,
      preferredAirDate,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateBroadcastPaths();
    return {
      success:
        "Announcement submitted for morning show review. Crew will message you on Command Center.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit announcement.",
    };
  }
}

export async function updateSubmissionStatusAction(
  submissionId: string,
  status: "PENDING" | "APPROVED" | "DECLINED" | "AIRED",
  reviewNote?: string,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await updateAnnouncementSubmissionStatus({
      submissionId,
      actorId: user.id,
      role: user.role,
      status,
      reviewNote,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return { success: `Submission marked ${status.toLowerCase()}.` };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update submission.",
    };
  }
}

export async function upsertCrewCreditAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = z
      .object({
        userId: z.string().uuid(),
        displayName: z.string().trim().min(1).max(120),
        productionRole: productionRoles,
        sortOrder: z.coerce.number().int().min(0).max(999).optional(),
      })
      .safeParse({
        userId: formData.get("userId"),
        displayName: formData.get("displayName"),
        productionRole: formData.get("productionRole"),
        sortOrder: formData.get("sortOrder") || 0,
      });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid credit." };
    }

    const result = await upsertCrewCredit({
      actorId: user.id,
      role: user.role,
      userId: parsed.data.userId,
      displayName: parsed.data.displayName,
      productionRole: parsed.data.productionRole as BroadcastProductionRoleKey,
      sortOrder: parsed.data.sortOrder,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateBroadcastPaths();
    return { success: "Credit roll updated." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save credit.",
    };
  }
}

export async function removeCrewCreditAction(
  creditId: string,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await removeCrewCredit({
      creditId,
      actorId: user.id,
      role: user.role,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return { success: "Credit removed." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to remove credit.",
    };
  }
}

export async function toggleEquipmentAction(
  itemId: string,
  isChecked: boolean,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await toggleBroadcastEquipment({
      itemId,
      actorId: user.id,
      role: user.role,
      isChecked,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return { success: isChecked ? "Checked in." : "Unchecked." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update checklist.",
    };
  }
}

export async function addEquipmentItemAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() || null;
    if (!name) {
      return { error: "Equipment name is required." };
    }
    const result = await addBroadcastEquipmentItem({
      actorId: user.id,
      role: user.role,
      name,
      category,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return { success: "Equipment added." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to add equipment.",
    };
  }
}

export async function submitJoinApplicationAction(
  _prev: BroadcastActionState,
  formData: FormData,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const desiredTracks = formData
      .getAll("desiredTracks")
      .map(String) as BroadcastJoinTrackKey[];

    const parsed = z
      .object({
        gradeOrYear: z.string().trim().max(40).optional(),
        experience: z.string().trim().max(2000).optional(),
        availability: z.string().trim().max(500).optional(),
        whyJoin: z.string().trim().min(1).max(2000),
        applicantEmail: z.string().trim().email().optional().or(z.literal("")),
        desiredTracks: z.array(joinTracks).min(1),
      })
      .safeParse({
        gradeOrYear: formData.get("gradeOrYear") || undefined,
        experience: formData.get("experience") || undefined,
        availability: formData.get("availability") || undefined,
        whyJoin: formData.get("whyJoin"),
        applicantEmail: formData.get("applicantEmail") || "",
        desiredTracks,
      });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Invalid application.",
      };
    }

    const result = await createJoinApplication({
      applicantId: user.id,
      applicantName: personName(user),
      applicantEmail: parsed.data.applicantEmail || user.email,
      gradeOrYear: parsed.data.gradeOrYear,
      desiredTracks: parsed.data.desiredTracks,
      experience: parsed.data.experience,
      availability: parsed.data.availability,
      whyJoin: parsed.data.whyJoin,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateBroadcastPaths();
    return {
      success:
        "Application submitted. Officers will review and message you on Command Center.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit application.",
    };
  }
}

export async function updateJoinApplicationAction(
  applicationId: string,
  status: "ACCEPTED" | "DECLINED",
  reviewNote?: string,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await updateJoinApplicationStatus({
      applicationId,
      actorId: user.id,
      role: user.role,
      status,
      reviewNote,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return {
      success:
        status === "ACCEPTED"
          ? "Applicant accepted and added to the roster."
          : "Application declined.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update application.",
    };
  }
}

export async function updateMediaCategoryAction(
  mediaId: string,
  category: CampusMediaCategoryKey | "",
  isHighlightReel?: boolean,
): Promise<BroadcastActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsedCategory =
      category === ""
        ? null
        : (categories.parse(category) as CampusMediaCategoryKey);

    const result = await updateMediaCategory({
      mediaId,
      actorId: user.id,
      role: user.role,
      category: parsedCategory,
      isHighlightReel,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateBroadcastPaths();
    return { success: "Media category updated." };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update category.",
    };
  }
}
