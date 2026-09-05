"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  parseCricutPrintFontKey,
  parseCricutSportSlug,
  sanitizeCricutPrintName,
} from "@/config/cricut-customization";
import {
  CRICUT_CLUB_SLUG,
  CRICUT_CUSTOM_DESIGN_STORAGE_PREFIX,
  CRICUT_ORDER_UPDATE_STATUSES,
  CRICUT_PRICE_MAX_CENTS,
} from "@/config/cricut-shop";
import type { CricutDesignStatus, CricutShopOrderStatus } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  reviewCricutDesign,
  submitCricutDesign,
  uploadCricutDesignImage,
} from "@/services/cricut-design-service";
import {
  assignCricutOrder,
  canCreateCricutListing,
  canManageCricutShop,
  createCricutShopItem,
  getCricutOrganization,
  getCricutShopItem,
  isCricutShopStorageConfigured,
  placeCricutShopOrder,
  setCricutItemAvailableToSell,
  setCricutItemCustomizable,
  updateCricutAmazonWishlistUrl,
  updateCricutOrderStatus,
  updateCricutShopItemImage,
  uploadCricutShopImage,
} from "@/services/cricut-shop-service";
import type { CricutFulfillmentMethod } from "@/generated/prisma/client";

export type CricutShopActionState = {
  error?: string;
  success?: string;
  itemId?: string;
  orderId?: string;
  designId?: string;
  imageUrl?: string;
  storagePath?: string;
};

function revalidateCricut() {
  revalidatePath("/cricut");
  revalidatePath("/cricut/shop");
  revalidatePath("/cricut/cart");
  revalidatePath("/cricut/checkout");
  revalidatePath("/cricut/orders");
  revalidatePath("/cricut/designs");
  revalidatePath("/home");
  revalidatePath(`/organizations/${CRICUT_CLUB_SLUG}`);
}

export async function createCricutListingAction(
  _prev: CricutShopActionState,
  formData: FormData,
): Promise<CricutShopActionState> {
  try {
    const user = await requireCompleteProfile();
    const org = await getCricutOrganization();
    if (!org) {
      return { error: "Cricut Club is not seeded yet. Run db:seed." };
    }

    const allowed = await canCreateCricutListing(user.id, user.role, org.id);
    if (!allowed) {
      return {
        error: "Join Cricut Club to list products in the shop catalog.",
      };
    }

    const title = String(formData.get("title") ?? "").trim();
    const description =
      String(formData.get("description") ?? "").trim() || undefined;
    const price = Number(formData.get("price"));
    const availableToSell = formData.get("availableToSell") !== "off";
    const customizable = formData.get("customizable") !== "off";

    if (title.length < 2) {
      return { error: "Title is required." };
    }
    if (Number.isNaN(price) || price < 0) {
      return { error: "Enter a valid price." };
    }

    const priceCents = Math.round(price * 100);
    if (priceCents > CRICUT_PRICE_MAX_CENTS) {
      return { error: "Price exceeds the $5,000 listing ceiling." };
    }

    let imageUrl: string | undefined;
    let storagePath: string | undefined;
    const file = formData.get("photo");
    if (file instanceof File && file.size > 0) {
      if (!isCricutShopStorageConfigured()) {
        return {
          error:
            "Photo storage isn’t configured. Ask an admin to set the campus media bucket, or list without a photo.",
        };
      }
      const uploaded = await uploadCricutShopImage(file, user.id);
      imageUrl = uploaded.publicUrl;
      storagePath = uploaded.storagePath;
    }

    const itemId = await createCricutShopItem({
      sellerId: user.id,
      organizationId: org.id,
      title,
      description,
      priceCents,
      imageUrl,
      storagePath,
      availableToSell,
      customizable,
    });

    if (!itemId) {
      return { error: "Unable to save the listing." };
    }

    revalidateCricut();
    return {
      success: availableToSell
        ? "Item is live and available to sell."
        : "Item added to the catalog (showcase only).",
      itemId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create listing.",
    };
  }
}

export async function toggleCricutItemSellableAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const org = await getCricutOrganization();
  if (!org) return;
  if (!(await canManageCricutShop(user.id, user.role, org.id))) return;

  const itemId = String(formData.get("itemId") ?? "");
  const availableToSell = formData.get("availableToSell") === "true";
  if (!itemId) return;

  await setCricutItemAvailableToSell({ itemId, availableToSell });
  revalidateCricut();
  revalidatePath(`/cricut/shop/${itemId}`);
}

export async function toggleCricutItemCustomizableAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const org = await getCricutOrganization();
  if (!org) return;
  if (!(await canManageCricutShop(user.id, user.role, org.id))) return;

  const itemId = String(formData.get("itemId") ?? "");
  const customizable = formData.get("customizable") === "true";
  if (!itemId) return;

  await setCricutItemCustomizable({ itemId, customizable });
  revalidateCricut();
  revalidatePath(`/cricut/shop/${itemId}`);
}

export async function uploadCricutCustomDesignAction(
  _prev: CricutShopActionState,
  formData: FormData,
): Promise<CricutShopActionState> {
  try {
    const user = await requireCompleteProfile();
    const file = formData.get("photo");
    if (!(file instanceof File) || file.size <= 0) {
      return { error: "Choose a design image to upload." };
    }
    if (!isCricutShopStorageConfigured()) {
      return {
        error:
          "Photo storage isn’t configured. Ask an admin to set the campus media bucket.",
      };
    }

    const uploaded = await uploadCricutShopImage(
      file,
      user.id,
      CRICUT_CUSTOM_DESIGN_STORAGE_PREFIX,
    );
    return {
      success: "Custom design uploaded.",
      imageUrl: uploaded.publicUrl,
      storagePath: uploaded.storagePath,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to upload the design.",
    };
  }
}

export async function updateCricutListingPhotoAction(
  _prev: CricutShopActionState,
  formData: FormData,
): Promise<CricutShopActionState> {
  try {
    const user = await requireCompleteProfile();
    const org = await getCricutOrganization();
    if (!org) {
      return { error: "Cricut Club is not seeded yet. Run db:seed." };
    }

    const allowed = await canCreateCricutListing(user.id, user.role, org.id);
    if (!allowed) {
      return {
        error: "Join Cricut Club to add product photos to the shop catalog.",
      };
    }

    const itemId = String(formData.get("itemId") ?? "").trim();
    if (!itemId) {
      return { error: "Missing product." };
    }

    const item = await getCricutShopItem(itemId);
    if (!item || item.isSample) {
      return { error: "That product is not in the live catalog yet." };
    }

    const file = formData.get("photo");
    if (!(file instanceof File) || file.size <= 0) {
      return { error: "Choose a product photo to upload." };
    }
    if (!isCricutShopStorageConfigured()) {
      return {
        error:
          "Photo storage isn’t configured. Ask an admin to set the campus media bucket.",
      };
    }

    const uploaded = await uploadCricutShopImage(file, user.id);
    const saved = await updateCricutShopItemImage({
      itemId,
      imageUrl: uploaded.publicUrl,
      storagePath: uploaded.storagePath,
    });
    if (!saved) {
      return { error: "Unable to save the product photo." };
    }

    revalidateCricut();
    revalidatePath(`/cricut/shop/${itemId}`);
    return { success: "Product photo saved.", itemId };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to upload the photo.",
    };
  }
}

const checkoutSchema = z.object({
  fulfillment: z.enum(["PICKUP", "SHIP"]),
  cartJson: z.string().min(2),
  contactName: z.string().trim().min(1).max(120),
  contactEmail: z.string().trim().email().max(160).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(40).optional(),
  customizationNotes: z.string().trim().max(800).optional(),
  shipName: z.string().trim().max(120).optional(),
  shipLine1: z.string().trim().max(160).optional(),
  shipLine2: z.string().trim().max(160).optional(),
  shipCity: z.string().trim().max(80).optional(),
  shipState: z.string().trim().max(2).optional(),
  shipPostal: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(400).optional(),
});

export async function placeCricutOrderAction(
  _prev: CricutShopActionState,
  formData: FormData,
): Promise<CricutShopActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = checkoutSchema.safeParse({
      fulfillment: formData.get("fulfillment"),
      cartJson: formData.get("cartJson"),
      contactName: formData.get("contactName") || "",
      contactEmail: formData.get("contactEmail") || "",
      contactPhone: formData.get("contactPhone") || undefined,
      customizationNotes: formData.get("customizationNotes") || undefined,
      shipName: formData.get("shipName") || undefined,
      shipLine1: formData.get("shipLine1") || undefined,
      shipLine2: formData.get("shipLine2") || undefined,
      shipCity: formData.get("shipCity") || undefined,
      shipState: formData.get("shipState") || undefined,
      shipPostal: formData.get("shipPostal") || undefined,
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check order form fields." };
    }

    let lines: {
      itemId: string;
      quantity: number;
      sportSlug?: string | null;
      printName?: string | null;
      fontKey?: string | null;
      designImageUrl?: string | null;
      designStoragePath?: string | null;
    }[];
    try {
      const raw = JSON.parse(parsed.data.cartJson) as unknown;
      if (!Array.isArray(raw)) {
        return { error: "Invalid cart." };
      }
      lines = raw
        .map((row) => {
          const r = row as Record<string, unknown>;
          return {
            itemId: String(r.itemId ?? ""),
            quantity: Number(r.quantity ?? 1),
            sportSlug: parseCricutSportSlug(String(r.sportSlug ?? "")),
            printName: sanitizeCricutPrintName(String(r.printName ?? "")),
            fontKey: parseCricutPrintFontKey(String(r.fontKey ?? "")),
            designImageUrl: String(r.designImageUrl ?? "").trim() || null,
            designStoragePath: String(r.designStoragePath ?? "").trim() || null,
          };
        })
        .filter((l) => l.itemId && l.quantity > 0);
    } catch {
      return { error: "Invalid cart payload." };
    }

    const result = await placeCricutShopOrder({
      buyerId: user.id,
      fulfillment: parsed.data.fulfillment as CricutFulfillmentMethod,
      lines,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail || undefined,
      contactPhone: parsed.data.contactPhone,
      customizationNotes: parsed.data.customizationNotes,
      shipName: parsed.data.shipName,
      shipLine1: parsed.data.shipLine1,
      shipLine2: parsed.data.shipLine2,
      shipCity: parsed.data.shipCity,
      shipState: parsed.data.shipState,
      shipPostal: parsed.data.shipPostal,
      notes: parsed.data.notes,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateCricut();
    revalidatePath(`/cricut/orders/${result.orderId}`);
    return {
      success:
        parsed.data.fulfillment === "PICKUP"
          ? "Order sent — track progress on your order page."
          : "Order sent — shipping from Weirton, WV when ready.",
      orderId: result.orderId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to place order.",
    };
  }
}

export async function updateCricutOrderStatusAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const orderId = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "") as CricutShopOrderStatus;
  if (
    !orderId ||
    !(CRICUT_ORDER_UPDATE_STATUSES as readonly string[]).includes(status)
  ) {
    return;
  }

  await updateCricutOrderStatus({
    orderId,
    status,
    actorId: user.id,
    role: user.role,
  });
  revalidateCricut();
  revalidatePath(`/cricut/orders/${orderId}`);
}

export async function assignCricutOrderAction(formData: FormData): Promise<void> {
  const user = await requireCompleteProfile();
  const orderId = String(formData.get("orderId") ?? "");
  const assigneeId = String(formData.get("assigneeId") ?? "").trim() || null;
  if (!orderId) return;

  await assignCricutOrder({
    orderId,
    assigneeId,
    actorId: user.id,
    role: user.role,
  });
  revalidateCricut();
  revalidatePath(`/cricut/orders/${orderId}`);
}

export async function submitCricutDesignAction(
  _prev: CricutShopActionState,
  formData: FormData,
): Promise<CricutShopActionState> {
  try {
    const user = await requireCompleteProfile();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (title.length < 2) {
      return { error: "Give your idea a title." };
    }
    if (description.length < 4) {
      return { error: "Describe what you want made." };
    }

    let imageUrl: string | undefined;
    let storagePath: string | undefined;
    const file = formData.get("photo");
    if (file instanceof File && file.size > 0) {
      if (!isCricutShopStorageConfigured()) {
        return {
          error:
            "Photo storage isn’t configured — submit without a reference image, or ask an admin.",
        };
      }
      const uploaded = await uploadCricutDesignImage(file, user.id);
      imageUrl = uploaded.publicUrl;
      storagePath = uploaded.storagePath;
    }

    const designId = await submitCricutDesign({
      submitterId: user.id,
      title,
      description,
      imageUrl,
      storagePath,
    });

    if (!designId) {
      return { error: "Unable to submit your design idea." };
    }

    revalidateCricut();
    return { success: "Design submitted — Cricut Club will review it.", designId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to submit design.",
    };
  }
}

export async function reviewCricutDesignAction(
  formData: FormData,
): Promise<void> {
  const user = await requireCompleteProfile();
  const designId = String(formData.get("designId") ?? "");
  const status = String(formData.get("status") ?? "") as CricutDesignStatus;
  const reviewNote = String(formData.get("reviewNote") ?? "") || undefined;
  if (!designId || !status) return;

  await reviewCricutDesign({
    designId,
    reviewerId: user.id,
    role: user.role,
    status,
    reviewNote,
  });
  revalidateCricut();
}

export async function updateCricutWishlistUrlAction(
  _prev: CricutShopActionState,
  formData: FormData,
): Promise<CricutShopActionState> {
  try {
    const user = await requireCompleteProfile();
    const org = await getCricutOrganization();
    if (!org) {
      return { error: "Cricut Club not found." };
    }
    if (!(await canManageCricutShop(user.id, user.role, org.id))) {
      return { error: "Only President / VP can set the Amazon wishlist URL." };
    }

    const url = String(formData.get("amazonWishlistUrl") ?? "").trim();
    if (url && !/^https?:\/\//i.test(url)) {
      return { error: "Enter a full https:// Amazon wishlist URL." };
    }

    const ok = await updateCricutAmazonWishlistUrl(url || null);
    if (!ok) {
      return { error: "Unable to save wishlist URL." };
    }

    revalidateCricut();
    return {
      success: url
        ? "Amazon wishlist URL saved."
        : "Amazon wishlist URL cleared (env fallback may still apply).",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save wishlist.",
    };
  }
}
