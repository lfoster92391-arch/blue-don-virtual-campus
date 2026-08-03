"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  canApproveMentorProfiles,
  canRequestMentorConnection,
  canReviewMentorConnections,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  requestMentorConnection,
  reviewMentorConnection,
  submitMentorApplication,
  updateMentorProfileStatus,
} from "@/services/mentor-network-service";

export type MentorActionState = {
  error?: string;
  success?: string;
};

const mentorCategorySchema = z.enum([
  "TEACHER",
  "ALUMNI",
  "BUSINESS",
  "COLLEGE_STUDENT",
  "INDUSTRY",
]);

const applySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  category: mentorCategorySchema,
  title: z.string().trim().min(2, "Title or role is required"),
  organization: z.string().trim().min(2, "Organization is required"),
  bio: z.string().trim().min(40, "Please share a brief bio (at least 40 characters)"),
  expertiseTags: z.string().trim().min(2, "List at least one area of expertise"),
});

const connectionSchema = z.object({
  mentorProfileId: z.string().min(1),
  message: z
    .string()
    .trim()
    .min(20, "Please explain why you would like to connect (at least 20 characters)"),
});

function revalidateMentorPaths(mentorId?: string) {
  revalidatePath("/mentors");
  revalidatePath("/mentors/apply");
  revalidatePath("/admin");
  revalidatePath("/admin/mentors");
  if (mentorId) {
    revalidatePath(`/mentors/${mentorId}`);
  }
}

export async function applyMentorAction(
  input: z.infer<typeof applySchema>,
): Promise<MentorActionState> {
  const user = await requireCompleteProfile();

  const parsed = applySchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid application." };
  }

  const expertiseTags = parsed.data.expertiseTags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const result = await submitMentorApplication({
    name: parsed.data.name,
    email: parsed.data.email,
    category: parsed.data.category,
    title: parsed.data.title,
    organization: parsed.data.organization,
    bio: parsed.data.bio,
    expertiseTags,
    userId: user.id,
  });

  if (!result) {
    return {
      error:
        "Unable to submit your application right now. Check database configuration or try again later.",
    };
  }

  revalidateMentorPaths();
  return {
    success:
      "Application received! An administrator will review your mentor profile before it appears to students.",
  };
}

export async function requestMentorConnectionAction(
  input: z.infer<typeof connectionSchema>,
): Promise<MentorActionState> {
  const user = await requireCompleteProfile();

  if (!canRequestMentorConnection(user.role)) {
    return { error: "Only students can request mentorship connections." };
  }

  const parsed = connectionSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const result = await requestMentorConnection({
    studentId: user.id,
    mentorProfileId: parsed.data.mentorProfileId,
    message: parsed.data.message,
  });

  if (!result) {
    return { error: "Unable to submit your request. This mentor may not be available." };
  }

  if (result.status === "APPROVED") {
    return { success: "You are already connected with this mentor." };
  }

  if (result.status === "PENDING") {
    revalidateMentorPaths(parsed.data.mentorProfileId);
    return {
      success:
        "Mentorship request submitted. Campus staff will review and connect you when approved.",
    };
  }

  revalidateMentorPaths(parsed.data.mentorProfileId);
  return { success: "Request updated." };
}

export async function reviewMentorProfileAction(
  profileId: string,
  approve: boolean,
): Promise<MentorActionState> {
  const user = await requireCompleteProfile();

  if (!canApproveMentorProfiles(user.role)) {
    return { error: "You do not have permission to review mentor profiles." };
  }

  const updated = await updateMentorProfileStatus(
    profileId,
    approve ? "APPROVED" : "INACTIVE",
    approve ? user.id : undefined,
  );

  if (!updated) {
    return { error: "Unable to update mentor profile." };
  }

  revalidateMentorPaths();
  return { success: approve ? "Mentor profile approved." : "Mentor profile declined." };
}

export async function reviewMentorConnectionAction(
  requestId: string,
  approve: boolean,
): Promise<MentorActionState> {
  const user = await requireCompleteProfile();

  if (!canReviewMentorConnections(user.role)) {
    return { error: "You do not have permission to review mentorship requests." };
  }

  const updated = await reviewMentorConnection(
    requestId,
    approve ? "APPROVED" : "DECLINED",
    user.id,
  );

  if (!updated) {
    return { error: "Unable to update mentorship request." };
  }

  revalidateMentorPaths();
  return { success: approve ? "Connection approved." : "Connection declined." };
}
