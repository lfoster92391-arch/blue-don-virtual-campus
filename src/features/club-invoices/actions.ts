"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { IMAGE_UPLOAD_MAX_LABEL } from "@/config/uploads";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  approveClubInvoice,
  canReviewClubInvoice,
  canSubmitClubInvoice,
  createClubInvoice,
  rejectClubInvoice,
  uploadInvoiceReceipt,
  type ClubInvoiceLineInput,
} from "@/services/club-invoice-service";

export type ClubInvoiceActionState = {
  error?: string;
  success?: string;
  invoiceId?: string;
};

function revalidateInvoicePaths(slug: string) {
  revalidatePath(`/organizations/${slug}`);
  revalidatePath("/organizations/it-club");
  revalidatePath("/finances");
}

export async function submitClubInvoiceAction(
  _prev: ClubInvoiceActionState,
  formData: FormData,
): Promise<ClubInvoiceActionState> {
  try {
    const user = await requireCompleteProfile();

    const organizationId = String(formData.get("organizationId") ?? "");
    const organizationSlug = String(formData.get("organizationSlug") ?? "");
    const vendor = String(formData.get("vendor") ?? "").trim();
    const invoiceDateRaw = String(formData.get("invoiceDate") ?? "");
    const memo = String(formData.get("memo") ?? "").trim() || undefined;

    if (!organizationId || !organizationSlug) {
      return { error: "Missing club context." };
    }

    const allowed = await canSubmitClubInvoice(
      user.id,
      user.role,
      organizationId,
    );
    if (!allowed) {
      return { error: "You need to be a club member to submit expenses." };
    }

    if (vendor.length < 2) {
      return { error: "Vendor / payee is required." };
    }

    const invoiceDate = new Date(invoiceDateRaw);
    if (Number.isNaN(invoiceDate.getTime())) {
      return { error: "Enter a valid invoice date." };
    }

    const descriptions = formData.getAll("lineDescription");
    const quantities = formData.getAll("lineQuantity");
    const unitCosts = formData.getAll("lineUnitCost");

    const lines: ClubInvoiceLineInput[] = [];
    for (let i = 0; i < descriptions.length; i += 1) {
      const description = String(descriptions[i] ?? "").trim();
      const quantity = Number(quantities[i] ?? 0);
      const unitDollars = Number(unitCosts[i] ?? 0);
      if (!description || !(quantity > 0) || !(unitDollars >= 0)) {
        continue;
      }
      lines.push({
        description,
        quantity,
        unitCostCents: Math.round(unitDollars * 100),
      });
    }

    if (lines.length === 0) {
      return { error: "Add at least one materials line item." };
    }

    let receiptUrl: string | undefined;
    let receiptStoragePath: string | undefined;
    const file = formData.get("receipt");
    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadInvoiceReceipt(file, user.id);
      if (!uploaded) {
        return {
          error: `Could not upload the receipt. Use a photo or PDF under ${IMAGE_UPLOAD_MAX_LABEL}, or ask an admin to configure storage.`,
        };
      }
      receiptUrl = uploaded.publicUrl;
      receiptStoragePath = uploaded.storagePath;
    }

    const invoiceId = await createClubInvoice({
      organizationId,
      vendor,
      invoiceDate,
      memo,
      receiptUrl,
      receiptStoragePath,
      lines,
      submittedById: user.id,
    });

    if (!invoiceId) {
      return { error: "Unable to save the invoice." };
    }

    revalidateInvoicePaths(organizationSlug);
    return {
      success: "Expense submitted for advisor review.",
      invoiceId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to submit invoice.",
    };
  }
}

const reviewSchema = z.object({
  invoiceId: z.string().min(1),
  organizationId: z.string().min(1),
  organizationSlug: z.string().min(1),
  reviewNote: z.string().trim().max(300).optional(),
});

export async function approveClubInvoiceAction(
  formData: FormData,
): Promise<void> {
  try {
    const user = await requireCompleteProfile();
    const parsed = reviewSchema.safeParse({
      invoiceId: formData.get("invoiceId"),
      organizationId: formData.get("organizationId"),
      organizationSlug: formData.get("organizationSlug"),
      reviewNote: formData.get("reviewNote") || undefined,
    });

    if (!parsed.success) {
      return;
    }

    const allowed = await canReviewClubInvoice(
      user.id,
      user.role,
      parsed.data.organizationId,
    );
    if (!allowed) {
      return;
    }

    const result = await approveClubInvoice({
      invoiceId: parsed.data.invoiceId,
      reviewerId: user.id,
      reviewNote: parsed.data.reviewNote,
    });

    if (!result.ok) {
      return;
    }

    revalidateInvoicePaths(parsed.data.organizationSlug);
  } catch {
    // Form action — errors surface on next render via list refresh.
  }
}

export async function rejectClubInvoiceAction(
  formData: FormData,
): Promise<void> {
  try {
    const user = await requireCompleteProfile();
    const parsed = reviewSchema.safeParse({
      invoiceId: formData.get("invoiceId"),
      organizationId: formData.get("organizationId"),
      organizationSlug: formData.get("organizationSlug"),
      reviewNote: formData.get("reviewNote") || undefined,
    });

    if (!parsed.success) {
      return;
    }

    const allowed = await canReviewClubInvoice(
      user.id,
      user.role,
      parsed.data.organizationId,
    );
    if (!allowed) {
      return;
    }

    await rejectClubInvoice({
      invoiceId: parsed.data.invoiceId,
      reviewerId: user.id,
      reviewNote: parsed.data.reviewNote,
    });

    revalidateInvoicePaths(parsed.data.organizationSlug);
  } catch {
    // Form action — errors surface on next render via list refresh.
  }
}
