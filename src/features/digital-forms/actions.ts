"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canSubmitForms } from "@/config/roles";
import {
  MEDIA_RELEASE_CATEGORIES,
  STUDENT_PROFILE_PERMISSIONS,
  getDigitalAgreement,
} from "@/config/digital-agreements";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getRequestAuditMeta } from "@/lib/forms/audit";
import { submitForm } from "@/services/form-service";
import {
  PARENT_AGREEMENT_FORM_ID,
  STUDENT_AGREEMENT_FORM_ID,
  getAgreementSubmission,
  getStudentContextKey,
} from "@/services/digital-forms-service";
import { setMembershipStatusByUserAcademy } from "@/services/academy-service";
import { isParentLinkedToStudent, userCanAccessParentPortal } from "@/services/parent-student-service";

export type DigitalFormActionState = {
  error?: string;
  success?: string;
};

function revalidateDigitalFormPaths() {
  revalidatePath("/forms-center");
  revalidatePath("/parent");
  revalidatePath("/home");
  revalidatePath("/admin/forms-center");
  revalidatePath("/admin/compliance");
}

const signatureSchema = z.object({
  signatureName: z.string().trim().min(2, "Typed name is required"),
  agreeToTerms: z.literal("on", { error: "You must agree to sign this form." }),
});

/** Parent Media Release (#3) — granular per-child, per-channel opt-in. */
export async function submitMediaReleaseAction(
  _prevState: DigitalFormActionState,
  formData: FormData,
): Promise<DigitalFormActionState> {
  const user = await requireCompleteProfile();

  if (!(await userCanAccessParentPortal(user.id, user.role)) || !canSubmitForms(user.role)) {
    return { error: "Only parents may submit the Media Release." };
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  if (!studentId) {
    return { error: "Select which student this release applies to." };
  }

  if (!(await isParentLinkedToStudent(user.id, studentId))) {
    return { error: "You are not linked to that student." };
  }

  const parsed = signatureSchema.safeParse({
    signatureName: formData.get("signatureName"),
    agreeToTerms: formData.get("agreeToTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const agreement = getDigitalAgreement("parent-media-release");
  if (!agreement?.formId) {
    return { error: "Media Release form is not available." };
  }

  const mediaRelease = Object.fromEntries(
    MEDIA_RELEASE_CATEGORIES.map((category) => [
      category.id,
      formData.get(`media_${category.id}`) === "on",
    ]),
  );

  const submission = await submitForm({
    formId: agreement.formId,
    userId: user.id,
    signatureName: parsed.data.signatureName,
    contextKey: getStudentContextKey(studentId),
    subjectUserId: studentId,
    responseData: { mediaRelease, studentId },
    auditMeta: await getRequestAuditMeta(user.role),
  });

  if (!submission) {
    return { error: "Unable to record the Media Release." };
  }

  revalidateDigitalFormPaths();
  return { success: "Media Release recorded. You can update selections anytime." };
}

/** Student Profile Permission (#4) — granular per-child field visibility. */
export async function submitProfilePermissionAction(
  _prevState: DigitalFormActionState,
  formData: FormData,
): Promise<DigitalFormActionState> {
  const user = await requireCompleteProfile();

  if (!(await userCanAccessParentPortal(user.id, user.role)) || !canSubmitForms(user.role)) {
    return { error: "Only parents may submit Profile Permissions." };
  }

  const studentId = String(formData.get("studentId") ?? "").trim();
  if (!studentId) {
    return { error: "Select which student this permission applies to." };
  }

  if (!(await isParentLinkedToStudent(user.id, studentId))) {
    return { error: "You are not linked to that student." };
  }

  const parsed = signatureSchema.safeParse({
    signatureName: formData.get("signatureName"),
    agreeToTerms: formData.get("agreeToTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const agreement = getDigitalAgreement("student-profile-permission");
  if (!agreement?.formId) {
    return { error: "Profile Permission form is not available." };
  }

  const profilePermissions = Object.fromEntries(
    STUDENT_PROFILE_PERMISSIONS.map((field) => [
      field.id,
      formData.get(`profile_${field.id}`) === "on",
    ]),
  );

  const submission = await submitForm({
    formId: agreement.formId,
    userId: user.id,
    signatureName: parsed.data.signatureName,
    contextKey: getStudentContextKey(studentId),
    subjectUserId: studentId,
    responseData: { profilePermissions, studentId },
    auditMeta: await getRequestAuditMeta(user.role),
  });

  if (!submission) {
    return { error: "Unable to record Profile Permissions." };
  }

  revalidateDigitalFormPaths();
  return { success: "Profile Permissions saved. Fields are private until enabled." };
}

/** AI Assistant Disclosure (#10) — self-signed acknowledgment. */
export async function submitAiDisclosureAction(
  _prevState: DigitalFormActionState,
  formData: FormData,
): Promise<DigitalFormActionState> {
  const user = await requireCompleteProfile();

  if (!canSubmitForms(user.role)) {
    return { error: "You do not have permission to sign this disclosure." };
  }

  const parsed = signatureSchema.safeParse({
    signatureName: formData.get("signatureName"),
    agreeToTerms: formData.get("agreeToTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const agreement = getDigitalAgreement("ai-assistant-disclosure");
  if (!agreement?.formId) {
    return { error: "AI Assistant Disclosure form is not available." };
  }

  const submission = await submitForm({
    formId: agreement.formId,
    userId: user.id,
    signatureName: parsed.data.signatureName,
    subjectUserId: user.role === "student" ? user.id : undefined,
    responseData: { acknowledgedRole: user.role },
    auditMeta: await getRequestAuditMeta(user.role),
  });

  if (!submission) {
    return { error: "Unable to record the disclosure." };
  }

  revalidateDigitalFormPaths();
  revalidatePath("/ai");
  return { success: "AI Assistant Disclosure acknowledged." };
}

/** Parent & Student Portal Agreement (#1) — role-appropriate annual signature. */
export async function submitPortalAgreementAction(
  _prevState: DigitalFormActionState,
  formData: FormData,
): Promise<DigitalFormActionState> {
  const user = await requireCompleteProfile();

  if (!canSubmitForms(user.role)) {
    return { error: "You do not have permission to sign this agreement." };
  }

  const parsed = signatureSchema.safeParse({
    signatureName: formData.get("signatureName"),
    agreeToTerms: formData.get("agreeToTerms"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const actsAsParent = await userCanAccessParentPortal(user.id, user.role);
  const formId = actsAsParent ? PARENT_AGREEMENT_FORM_ID : STUDENT_AGREEMENT_FORM_ID;

  const submission = await submitForm({
    formId,
    userId: user.id,
    signatureName: parsed.data.signatureName,
    subjectUserId: user.role === "student" ? user.id : undefined,
    responseData: { agreement: "parent-student-portal" },
    auditMeta: await getRequestAuditMeta(user.role),
  });

  if (!submission) {
    return { error: "Unable to record the Portal Agreement." };
  }

  revalidateDigitalFormPaths();
  return { success: "Portal Agreement signed for the school year." };
}

/** Parent approves or declines a linked student's club join request (#5). */
export async function reviewChildClubRequestAction(
  submissionId: string,
  approved: boolean,
): Promise<DigitalFormActionState> {
  const user = await requireCompleteProfile();

  if (!(await userCanAccessParentPortal(user.id, user.role))) {
    return { error: "Only linked parents may approve club requests." };
  }

  const { withDatabase } = await import("@/lib/prisma");

  const submission = await withDatabase((prisma) =>
    prisma.formSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, userId: true, responseData: true },
    }),
  );

  if (!submission) {
    return { error: "Club request not found." };
  }

  if (!(await isParentLinkedToStudent(user.id, submission.userId))) {
    return { error: "You are not linked to this student." };
  }

  const data = (submission.responseData ?? {}) as { academyId?: string };

  const updated = await withDatabase((prisma) =>
    prisma.formSubmission.update({
      where: { id: submissionId },
      data: {
        parentApproved: approved,
        parentApprovedById: user.id,
        parentApprovedAt: new Date(),
      },
    }),
  );

  if (!updated) {
    return { error: "Unable to record your decision." };
  }

  // Declining cancels the pending membership request.
  if (!approved && data.academyId) {
    await setMembershipStatusByUserAcademy(
      submission.userId,
      data.academyId,
      "REJECTED",
    );
  }

  revalidateDigitalFormPaths();
  revalidatePath("/admin/academies");
  revalidatePath("/academies");

  return {
    success: approved
      ? "Club request approved. It now moves to advisor review."
      : "Club request declined. The request has been cancelled.",
  };
}

/** Whether a signer already has a submission for a self-signed agreement. */
export async function hasSignedAgreementForm(
  formId: string,
  userId: string,
): Promise<boolean> {
  const submission = await getAgreementSubmission({ formId, userId });
  return Boolean(submission?.signed && submission.approved !== false);
}
