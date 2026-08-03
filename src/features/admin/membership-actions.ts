"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { FOCUS_CLUB_SLUGS } from "@/config/focused-clubs";
import {
  focusClubName,
  focusClubRoleLabel,
} from "@/config/focus-club-access";
import {
  hasPermission,
  ORG_MEMBERSHIP_ROLES,
  type OrgMembershipRole,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  assignFocusClubMembership,
  removeFocusClubMembership,
} from "@/services/org-membership-service";
import { getUserById } from "@/services/user-service";

export type MembershipActionState = {
  error?: string;
  success?: string;
};

function revalidateMembershipPaths(clubSlug: string) {
  revalidatePath("/service-desk/users");
  revalidatePath("/admin/users");
  revalidatePath(`/organizations/${clubSlug}`);
  revalidatePath("/home");
}

const assignSchema = z.object({
  userId: z.string().uuid("Invalid user."),
  clubSlug: z.enum(FOCUS_CLUB_SLUGS),
  orgRole: z.enum(ORG_MEMBERSHIP_ROLES as [OrgMembershipRole, ...OrgMembershipRole[]]),
});

const removeSchema = z.object({
  userId: z.string().uuid("Invalid user."),
  clubSlug: z.enum(FOCUS_CLUB_SLUGS),
});

export async function assignClubMembershipAction(
  _prevState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to assign club memberships." };
  }

  const parsed = assignSchema.safeParse({
    userId: formData.get("userId"),
    clubSlug: formData.get("clubSlug"),
    orgRole: formData.get("orgRole"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid club assignment." };
  }

  const target = await getUserById(parsed.data.userId);
  if (!target) {
    return { error: "User not found." };
  }

  const membership = await assignFocusClubMembership({
    userId: parsed.data.userId,
    clubSlug: parsed.data.clubSlug,
    orgRole: parsed.data.orgRole,
  });

  if (!membership) {
    return {
      error:
        "Unable to assign club membership. Check that the database is configured and focus clubs exist.",
    };
  }

  revalidateMembershipPaths(parsed.data.clubSlug);
  const roleLabel = focusClubRoleLabel(parsed.data.clubSlug, parsed.data.orgRole);
  return {
    success: `Assigned ${target.displayName} to ${focusClubName(parsed.data.clubSlug)} as ${roleLabel}.`,
  };
}

export async function removeClubMembershipAction(
  _prevState: MembershipActionState,
  formData: FormData,
): Promise<MembershipActionState> {
  const admin = await requireCompleteProfile();

  if (!hasPermission(admin.role, "users:manage")) {
    return { error: "You do not have permission to remove club memberships." };
  }

  const parsed = removeSchema.safeParse({
    userId: formData.get("userId"),
    clubSlug: formData.get("clubSlug"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid removal request." };
  }

  const target = await getUserById(parsed.data.userId);
  if (!target) {
    return { error: "User not found." };
  }

  const removed = await removeFocusClubMembership({
    userId: parsed.data.userId,
    clubSlug: parsed.data.clubSlug,
  });

  if (!removed) {
    return { error: "No active membership found to remove." };
  }

  revalidateMembershipPaths(parsed.data.clubSlug);
  return {
    success: `Removed ${target.displayName} from ${focusClubName(parsed.data.clubSlug)}.`,
  };
}
