"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  canApproveForms,
  canManageForms,
  canSubmitForms,
} from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  approveSubmission,
  archiveForm,
  createForm,
  submitForm,
  updateFormStatus,
} from "@/services/form-service";
import type { ApprovalType, FormStatus, FormType } from "@/generated/prisma/client";

export type FormActionState = {
  error?: string;
  success?: string;
};

const createFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  type: z.string().min(1, "Form type is required"),
  description: z.string().trim().optional(),
  content: z.string().trim().optional(),
  approvalRequired: z.coerce.boolean().optional(),
  approvalType: z.string().optional(),
});

const submitFormSchema = z.object({
  formId: z.string().min(1),
  signatureName: z.string().trim().min(2, "Typed name is required"),
  agreeToTerms: z.literal("on", {
    error: "You must agree to sign this form",
  }),
});

function revalidateFormPaths(formId?: string) {
  revalidatePath("/forms");
  revalidatePath("/parent");
  revalidatePath("/admin");
  revalidatePath("/admin/forms");
  revalidatePath("/admin/approvals");
  revalidatePath("/admin/compliance");
  if (formId) {
    revalidatePath(`/forms/${formId}`);
    revalidatePath(`/admin/forms/${formId}`);
  }
}

export async function createFormAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireCompleteProfile();

  if (!canManageForms(user.role)) {
    return { error: "You do not have permission to create forms." };
  }

  const parsed = createFormSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
    content: formData.get("content") || undefined,
    approvalRequired: formData.get("approvalRequired") === "on",
    approvalType: formData.get("approvalType") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data." };
  }

  const form = await createForm({
    title: parsed.data.title,
    type: parsed.data.type as FormType,
    description: parsed.data.description,
    content: parsed.data.content,
    approvalRequired: parsed.data.approvalRequired,
    approvalType: parsed.data.approvalType as ApprovalType | undefined,
  });

  if (!form) {
    return { error: "Unable to create form. Check database configuration." };
  }

  revalidateFormPaths(form.id);
  return { success: "Form created as draft." };
}

export async function updateFormStatusAction(
  formId: string,
  status: FormStatus,
): Promise<FormActionState> {
  const user = await requireCompleteProfile();

  if (!canManageForms(user.role)) {
    return { error: "You do not have permission to update forms." };
  }

  const updated = await updateFormStatus(formId, status);

  if (!updated) {
    return { error: "Unable to update form status." };
  }

  revalidateFormPaths(formId);
  return { success: `Form moved to ${status.toLowerCase().replace("_", " ")}.` };
}

export async function archiveFormAction(formId: string): Promise<FormActionState> {
  const user = await requireCompleteProfile();

  if (!canManageForms(user.role)) {
    return { error: "You do not have permission to archive forms." };
  }

  const archived = await archiveForm(formId);

  if (!archived) {
    return { error: "Unable to archive form." };
  }

  revalidateFormPaths(formId);
  return { success: "Form archived. No records were deleted." };
}

export async function submitFormAction(
  _prevState: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  const user = await requireCompleteProfile();

  if (!canSubmitForms(user.role)) {
    return { error: "You do not have permission to submit forms." };
  }

  const parsed = submitFormSchema.safeParse({
    formId: formData.get("formId"),
    signatureName: formData.get("signatureName"),
    agreeToTerms: formData.get("agreeToTerms"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }

  const submission = await submitForm({
    formId: parsed.data.formId,
    userId: user.id,
    signatureName: parsed.data.signatureName,
  });

  if (!submission) {
    return { error: "Unable to submit form. It may not be published." };
  }

  revalidateFormPaths(parsed.data.formId);
  return {
    success: submission.approved
      ? "Form signed and recorded."
      : "Form signed. Awaiting advisor approval.",
  };
}

export async function approveSubmissionAction(
  submissionId: string,
  approved: boolean,
): Promise<FormActionState> {
  const user = await requireCompleteProfile();

  if (!canApproveForms(user.role)) {
    return { error: "You do not have permission to approve submissions." };
  }

  const result = await approveSubmission(submissionId, user.id, approved);

  if (!result) {
    return { error: "Unable to process approval." };
  }

  revalidateFormPaths(result.formId);
  return {
    success: approved ? "Submission approved." : "Submission rejected.",
  };
}
