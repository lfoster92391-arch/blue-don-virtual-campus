"use server";

import { revalidatePath } from "next/cache";

import { canApprovePartners } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  approveCommunityPartner,
  rejectCommunityPartner,
} from "@/services/partner-service";

function revalidateCommunityPartnerPaths() {
  revalidatePath("/partners");
  revalidatePath("/community-partners");
  revalidatePath("/admin/partners");
  revalidatePath("/admin");
  revalidatePath("/pathways");
}

export async function approveCommunityPartnerAction(partnerId: string): Promise<void> {
  const user = await requireCompleteProfile();

  if (!canApprovePartners(user.role)) {
    throw new Error("You do not have permission to approve partners.");
  }

  await approveCommunityPartner(partnerId);
  revalidateCommunityPartnerPaths();
}

export async function rejectCommunityPartnerAction(partnerId: string): Promise<void> {
  const user = await requireCompleteProfile();

  if (!canApprovePartners(user.role)) {
    throw new Error("You do not have permission to reject partners.");
  }

  await rejectCommunityPartner(partnerId);
  revalidateCommunityPartnerPaths();
}
