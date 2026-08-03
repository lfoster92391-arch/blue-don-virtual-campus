"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  CRICUT_CLUB_SLUG,
  CRICUT_PRICE_MAX_CENTS,
} from "@/config/cricut-shop";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageCricutShop,
  createCricutShopItem,
  getCricutOrganization,
  isCricutShopStorageConfigured,
  placeCricutShopOrder,
  uploadCricutShopImage,
} from "@/services/cricut-shop-service";
import type { CricutFulfillmentMethod } from "@/generated/prisma/client";

export type CricutShopActionState = {
  error?: string;
  success?: string;
  itemId?: string;
  orderId?: string;
};

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

    const allowed = await canManageCricutShop(user.id, user.role, org.id);
    if (!allowed) {
      return {
        error: "Only Cricut leads, officers, advisors, and admins can list items.",
      };
    }

    const title = String(formData.get("title") ?? "").trim();
    const description =
      String(formData.get("description") ?? "").trim() || undefined;
    const price = Number(formData.get("price"));

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
      if (!uploaded) {
        return { error: "Unable to upload the photo." };
      }
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
    });

    if (!itemId) {
      return { error: "Unable to save the listing." };
    }

    revalidatePath("/cricut/shop");
    revalidatePath(`/organizations/${CRICUT_CLUB_SLUG}`);
    return { success: "Item is live in the Cricut Shop.", itemId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create listing.",
    };
  }
}

const checkoutSchema = z.object({
  fulfillment: z.enum(["PICKUP", "SHIP"]),
  cartJson: z.string().min(2),
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
      shipName: formData.get("shipName") || undefined,
      shipLine1: formData.get("shipLine1") || undefined,
      shipLine2: formData.get("shipLine2") || undefined,
      shipCity: formData.get("shipCity") || undefined,
      shipState: formData.get("shipState") || undefined,
      shipPostal: formData.get("shipPostal") || undefined,
      notes: formData.get("notes") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Check checkout fields." };
    }

    let lines: { itemId: string; quantity: number }[];
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

    revalidatePath("/cricut/shop");
    revalidatePath("/cricut/cart");
    revalidatePath("/cricut/checkout");
    return {
      success:
        parsed.data.fulfillment === "PICKUP"
          ? "Order placed — pick up at Madonna High School in Weirton."
          : "Order placed — shipping from Weirton, WV.",
      orderId: result.orderId,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to place order.",
    };
  }
}
