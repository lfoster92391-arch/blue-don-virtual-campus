"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageWishlist,
  createWishlistItem,
  deleteWishlistItem,
  getWishlistItemScope,
  setWishlistItemFulfilled,
} from "@/services/wishlist-service";

export type WishlistActionState = {
  error?: string;
  success?: string;
};

const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  url: z.string().trim().url("Enter a valid URL (Amazon or any link)"),
  organizationId: z.string().optional(),
  academyId: z.string().optional(),
});

function revalidateWishlistPaths(input: {
  academySlug?: string;
  organizationSlug?: string;
}) {
  revalidatePath("/teacher/wishlists");
  if (input.academySlug) {
    revalidatePath(`/academies/${input.academySlug}`);
  }
  if (input.organizationSlug) {
    revalidatePath(`/organizations/${input.organizationSlug}`);
  }
}

export async function createWishlistItemAction(
  _prevState: WishlistActionState,
  formData: FormData,
): Promise<WishlistActionState> {
  const user = await requireCompleteProfile();

  const parsed = createItemSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    url: formData.get("url"),
    organizationId: formData.get("organizationId") || undefined,
    academyId: formData.get("academyId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid wishlist item." };
  }

  const context = {
    organizationId: parsed.data.organizationId,
    academyId: parsed.data.academyId,
  };

  if (!context.organizationId && !context.academyId) {
    return { error: "Wishlist must belong to a club, class, or academy." };
  }

  const allowed = await canManageWishlist(user.id, user.role, context);

  if (!allowed) {
    return { error: "You do not have permission to edit this wishlist." };
  }

  const item = await createWishlistItem({
    ...parsed.data,
    createdById: user.id,
  });

  if (!item) {
    return { error: "Unable to add wishlist item." };
  }

  revalidateWishlistPaths({
    academySlug: formData.get("academySlug")?.toString(),
    organizationSlug: formData.get("organizationSlug")?.toString(),
  });

  return { success: "Wishlist item added." };
}

export async function toggleWishlistItemAction(
  itemId: string,
  fulfilled: boolean,
): Promise<WishlistActionState> {
  const user = await requireCompleteProfile();
  const scope = await getWishlistItemScope(itemId);

  if (!scope) {
    return { error: "Wishlist item not found." };
  }

  const allowed = await canManageWishlist(user.id, user.role, scope);

  if (!allowed) {
    return { error: "You do not have permission to update this wishlist." };
  }

  const updated = await setWishlistItemFulfilled(itemId, fulfilled);

  if (!updated) {
    return { error: "Unable to update wishlist item." };
  }

  revalidatePath("/teacher/wishlists");
  revalidatePath("/academies", "layout");

  return { success: fulfilled ? "Marked as fulfilled." : "Marked as needed." };
}

export async function deleteWishlistItemAction(itemId: string): Promise<WishlistActionState> {
  const user = await requireCompleteProfile();
  const scope = await getWishlistItemScope(itemId);

  if (!scope) {
    return { error: "Wishlist item not found." };
  }

  const allowed = await canManageWishlist(user.id, user.role, scope);

  if (!allowed) {
    return { error: "You do not have permission to delete this wishlist item." };
  }

  const deleted = await deleteWishlistItem(itemId);

  if (!deleted) {
    return { error: "Unable to delete wishlist item." };
  }

  revalidatePath("/teacher/wishlists");
  revalidatePath("/academies", "layout");

  return { success: "Wishlist item removed." };
}
