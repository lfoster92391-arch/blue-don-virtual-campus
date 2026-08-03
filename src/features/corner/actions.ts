"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  CORNER_CATEGORIES,
  CORNER_PAYMENT_METHODS,
  CORNER_PRICE_MAX_CENTS,
  getPaymentMethodMeta,
  type CornerPaymentConfig,
  type CornerPaymentMethodId,
} from "@/config/corner-store";
import { requireCompleteProfile } from "@/lib/auth/session";
import { hasOrgPermission } from "@/lib/auth/permissions";
import {
  canListInCornerStore,
  createCornerItem,
  updateCornerItemStatus,
  uploadCornerImage,
} from "@/services/corner-store-service";

export type CornerActionState = {
  error?: string;
  success?: string;
  itemId?: string;
};

const CATEGORY_IDS = CORNER_CATEGORIES.map((c) => c.id) as [string, ...string[]];
const PAYMENT_IDS = CORNER_PAYMENT_METHODS.map((m) => m.id) as [
  CornerPaymentMethodId,
  ...CornerPaymentMethodId[],
];

const listingSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(120),
  description: z.string().trim().max(1200).optional(),
  category: z.enum(CATEGORY_IDS).optional(),
  price: z
    .string()
    .trim()
    .min(1, "Price is required")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Enter a valid price.",
    }),
  paymentNote: z.string().trim().max(300).optional(),
  organizationId: z.string().trim().optional(),
});

function parsePriceToCents(value: string): number {
  const dollars = Number(value);
  return Math.round(dollars * 100);
}

export async function createCornerListingAction(
  _prev: CornerActionState,
  formData: FormData,
): Promise<CornerActionState> {
  try {
    const user = await requireCompleteProfile();

    if (!canListInCornerStore(user.role)) {
      return {
        error: "Your account type can browse and buy, but cannot post listings.",
      };
    }

    const parsed = listingSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      category: formData.get("category") || undefined,
      price: formData.get("price"),
      paymentNote: formData.get("paymentNote") || undefined,
      organizationId: formData.get("organizationId") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check the listing details." };
    }

    const priceCents = parsePriceToCents(parsed.data.price);
    if (priceCents < 0 || priceCents > CORNER_PRICE_MAX_CENTS) {
      return { error: "Enter a price between $0 and $5,000." };
    }

    // Payment methods (checkboxes) + optional handles per method.
    const selectedMethods = formData
      .getAll("paymentMethods")
      .filter((value): value is string => typeof value === "string")
      .filter((value): value is CornerPaymentMethodId =>
        PAYMENT_IDS.includes(value as CornerPaymentMethodId),
      );

    if (selectedMethods.length === 0) {
      return { error: "Choose at least one way for buyers to pay." };
    }

    const handles: NonNullable<CornerPaymentConfig["handles"]> = {};
    for (const method of selectedMethods) {
      const meta = getPaymentMethodMeta(method);
      if (!meta?.needsHandle) {
        continue;
      }
      const handle = formData.get(`handle_${method}`);
      if (typeof handle === "string" && handle.trim()) {
        handles[method] = handle.trim().slice(0, 120);
      } else {
        return { error: `Add your ${meta.label} username so buyers can pay you.` };
      }
    }

    const payment: CornerPaymentConfig = {
      methods: selectedMethods,
      handles: Object.keys(handles).length > 0 ? handles : undefined,
      note: parsed.data.paymentNote,
    };

    // Optional: list on behalf of a club the user leads.
    let organizationId: string | undefined;
    if (parsed.data.organizationId) {
      const allowed = await hasOrgPermission(
        user.id,
        parsed.data.organizationId,
        "org:store:manage",
      );
      if (!allowed) {
        return { error: "You can't post on behalf of that organization." };
      }
      organizationId = parsed.data.organizationId;
    }

    // Photo upload (optional but strongly encouraged).
    const file = formData.get("photo");
    let imageUrl: string | undefined;
    let storagePath: string | undefined;

    if (file instanceof File && file.size > 0) {
      const uploaded = await uploadCornerImage(file, user.id);
      if (uploaded) {
        imageUrl = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      } else {
        return {
          error:
            "Photo storage isn't configured yet. Ask an admin to set up the corner-store bucket, or post without a photo.",
        };
      }
    }

    const itemId = await createCornerItem({
      sellerId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priceCents,
      imageUrl,
      storagePath,
      payment,
      organizationId,
    });

    if (!itemId) {
      return { error: "Unable to save your listing. Check database connectivity." };
    }

    revalidatePath("/corner");
    return { success: "Your item is live in Blue Don Corner.", itemId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create the listing.",
    };
  }
}

export async function markCornerItemSoldAction(
  itemId: string,
): Promise<CornerActionState> {
  try {
    const user = await requireCompleteProfile();
    const updated = await updateCornerItemStatus(itemId, user.id, "SOLD");

    if (!updated) {
      return { error: "Unable to update this listing." };
    }

    revalidatePath("/corner");
    revalidatePath(`/corner/${itemId}`);
    return { success: "Marked as sold." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update the listing.",
    };
  }
}

export async function removeCornerItemAction(
  itemId: string,
): Promise<CornerActionState> {
  try {
    const user = await requireCompleteProfile();
    const updated = await updateCornerItemStatus(itemId, user.id, "REMOVED");

    if (!updated) {
      return { error: "Unable to remove this listing." };
    }

    revalidatePath("/corner");
    return { success: "Listing removed." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to remove the listing.",
    };
  }
}
