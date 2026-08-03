"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canJoinAcademy } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getRequestAuditMeta } from "@/lib/forms/audit";
import {
  canReviewAcademyMembership,
  requestAcademyMembership,
  updateMembershipStatus,
} from "@/services/academy-service";
import { submitClubMembershipCommitment } from "@/services/form-service";
import { studentHasLinkedParent } from "@/services/parent-student-service";

const joinWithCommitmentSchema = z.object({
  academyId: z.string().min(1),
  slug: z.string().min(1),
  academyName: z.string().trim().min(1),
  signatureName: z.string().trim().min(2, "Typed signature is required"),
});

export type AcademyActionState = {
  error?: string;
  success?: string;
};

function revalidateAcademyPaths(slug?: string) {
  revalidatePath("/academies");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath("/admin");
  revalidatePath("/find-your-place");
  if (slug) {
    revalidatePath(`/academies/${slug}`);
  }
}

export async function joinAcademyWithCommitmentAction(input: {
  academyId: string;
  slug: string;
  academyName: string;
  signatureName: string;
}): Promise<AcademyActionState> {
  const user = await requireCompleteProfile();

  if (!canJoinAcademy(user.role)) {
    return { error: "Your role cannot join clubs or academies." };
  }

  const parsed = joinWithCommitmentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }

  const requiresParentApproval = await studentHasLinkedParent(user.id);
  const auditMeta = await getRequestAuditMeta(user.role);

  const commitment = await submitClubMembershipCommitment({
    userId: user.id,
    academyId: parsed.data.academyId,
    academyName: parsed.data.academyName,
    academySlug: parsed.data.slug,
    signatureName: parsed.data.signatureName,
    requiresParentApproval,
    auditMeta,
  });

  if (!commitment) {
    return {
      error:
        "Unable to record your club commitment. Ask an administrator to publish the Club Membership Commitment form.",
    };
  }

  const membership = await requestAcademyMembership(user.id, parsed.data.academyId);

  if (!membership) {
    return { error: "Unable to submit join request. Check database configuration." };
  }

  revalidateAcademyPaths(parsed.data.slug);
  revalidatePath("/forms");
  revalidatePath("/forms-center");
  revalidatePath("/parent");
  revalidatePath("/admin/compliance");
  revalidatePath("/admin/forms-center");

  if (membership.status === "ACTIVE") {
    return { success: "You are already a member of this club." };
  }

  if (membership.status === "PENDING") {
    return {
      success: requiresParentApproval
        ? "Commitment signed. Your request now needs a parent's approval before advisor review."
        : "Commitment signed. Your join request was submitted for advisor approval.",
    };
  }

  return { success: "Club membership updated." };
}

export async function reviewMembershipAction(
  membershipId: string,
  approve: boolean,
): Promise<AcademyActionState> {
  const user = await requireCompleteProfile();
  const { isPrismaReady, withDatabase } = await import("@/lib/prisma");

  if (!isPrismaReady()) {
    return { error: "Unable to update membership." };
  }

  const record = await withDatabase((prisma) =>
    prisma.academyMembership.findUnique({
      where: { id: membershipId },
      select: { academyId: true, academy: { select: { slug: true } } },
    }),
  );

  if (!record) {
    return { error: "Membership request not found." };
  }

  const canReview = await canReviewAcademyMembership(
    user.id,
    user.role,
    record.academyId,
  );

  if (!canReview) {
    return { error: "You do not have permission to review memberships." };
  }

  if (approve) {
    const { getMembershipCommitmentApproval } = await import(
      "@/services/academy-service"
    );
    const parentApproval = await getMembershipCommitmentApproval(membershipId);
    if (parentApproval === "pending") {
      return {
        error:
          "This request is still waiting on parent approval. Activate it after the parent approves.",
      };
    }
    if (parentApproval === "declined") {
      return { error: "A parent declined this club request. It cannot be activated." };
    }
  }

  const success = await updateMembershipStatus(
    membershipId,
    approve ? "ACTIVE" : "REJECTED",
  );

  if (!success) {
    return { error: "Unable to update membership." };
  }

  revalidateAcademyPaths(record.academy.slug);
  const org = await withDatabase((prisma) =>
    prisma.organization.findFirst({
      where: { academyId: record.academyId },
      select: { slug: true },
    }),
  );
  if (org?.slug) {
    revalidatePath(`/organizations/${org.slug}`);
  }

  return { success: approve ? "Membership approved." : "Membership rejected." };
}
