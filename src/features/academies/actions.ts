"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageAcademy, canJoinAcademy } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  requestAcademyMembership,
  updateMembershipStatus,
} from "@/services/academy-service";

export type AcademyActionState = {
  error?: string;
  success?: string;
};

function revalidateAcademyPaths(slug?: string) {
  revalidatePath("/academies");
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/academies/${slug}`);
  }
}

export async function joinAcademyAction(
  academyId: string,
  slug: string,
): Promise<AcademyActionState> {
  const user = await requireCompleteProfile();

  if (!canJoinAcademy(user.role)) {
    return { error: "Your role cannot join academies." };
  }

  const membership = await requestAcademyMembership(user.id, academyId);

  if (!membership) {
    return { error: "Unable to submit academy request. Check database configuration." };
  }

  revalidateAcademyPaths(slug);

  if (membership.status === "ACTIVE") {
    return { success: "You are already a member of this academy." };
  }

  if (membership.status === "PENDING") {
    return { success: "Academy join request submitted for advisor approval." };
  }

  return { success: "Academy membership updated." };
}

export async function reviewMembershipAction(
  membershipId: string,
  approve: boolean,
): Promise<AcademyActionState> {
  const user = await requireCompleteProfile();

  if (!canManageAcademy(user.role)) {
    return { error: "You do not have permission to review memberships." };
  }

  const success = await updateMembershipStatus(
    membershipId,
    approve ? "ACTIVE" : "REJECTED",
  );

  if (!success) {
    return { error: "Unable to update membership." };
  }

  revalidateAcademyPaths();
  return { success: approve ? "Membership approved." : "Membership rejected." };
}
