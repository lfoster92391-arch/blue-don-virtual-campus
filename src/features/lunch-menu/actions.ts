"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { canManageLunch } from "@/config/roles";
import { requireCampusAccess } from "@/lib/auth/session";
import {
  publishLunchMenuDays,
  saveLunchMenuDay,
  unpublishLunchMenuDays,
} from "@/services/lunch-menu-service";

export type LunchMenuActionState = {
  error?: string;
  success?: string;
};

function revalidateLunchPaths() {
  revalidatePath("/lunch");
  revalidatePath("/lunch/selections");
  revalidatePath("/lunch/kitchen");
  revalidatePath("/admin/lunch-menu");
  revalidatePath("/parent");
}

const dateKeySchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "That is not a valid date.");

const saveSchema = z.object({
  dateKey: dateKeySchema,
  entree: z.string().trim().min(1, "Every day needs an entree.").max(160),
  vegetarian: z
    .string()
    .trim()
    .min(1, "Every day needs a vegetarian option.")
    .max(160),
  sides: z.string().trim().max(400).optional(),
  dessert: z.string().trim().max(160).optional(),
  note: z.string().trim().max(280).optional(),
});

/** Save one day of the menu calendar. Saving never publishes. */
export async function saveLunchMenuDayAction(
  _prevState: LunchMenuActionState,
  formData: FormData,
): Promise<LunchMenuActionState> {
  const user = await requireCampusAccess();

  if (!canManageLunch(user.role)) {
    return { error: "Your account cannot edit the lunch menu." };
  }

  const parsed = saveSchema.safeParse({
    dateKey: formData.get("dateKey"),
    entree: formData.get("entree"),
    vegetarian: formData.get("vegetarian"),
    sides: formData.get("sides") ?? undefined,
    dessert: formData.get("dessert") ?? undefined,
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const { dateKey, entree, vegetarian, sides, dessert, note } = parsed.data;

  const result = await saveLunchMenuDay({
    draft: {
      dateKey,
      entree,
      vegetarian,
      sides: (sides ?? "")
        .split(",")
        .map((side) => side.trim())
        .filter(Boolean),
      dessert: dessert || null,
      note: note || null,
    },
    userId: user.id,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateLunchPaths();

  return {
    success: result.published
      ? "Saved. This day is published, so families see the change now."
      : "Saved as a draft. Publish the week when you are ready.",
  };
}

const publishSchema = z.object({
  dateKeys: z.array(dateKeySchema).min(1, "Pick at least one day to publish."),
  rangeLabel: z.string().trim().min(1).max(120),
  notifyFamilies: z.boolean(),
});

/** Release a week (or any set of days) to families. */
export async function publishLunchMenuAction(
  _prevState: LunchMenuActionState,
  formData: FormData,
): Promise<LunchMenuActionState> {
  const user = await requireCampusAccess();

  if (!canManageLunch(user.role)) {
    return { error: "Your account cannot publish the lunch menu." };
  }

  const parsed = publishSchema.safeParse({
    dateKeys: formData.getAll("dateKeys").map(String),
    rangeLabel: formData.get("rangeLabel"),
    notifyFamilies: formData.get("notifyFamilies") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const result = await publishLunchMenuDays({
    dateKeys: parsed.data.dateKeys,
    user: { id: user.id, displayName: user.displayName },
    notifyFamilies: parsed.data.notifyFamilies,
    rangeLabel: parsed.data.rangeLabel,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  revalidateLunchPaths();

  const told =
    result.notifiedCount > 0
      ? ` Told ${result.notifiedCount} parent account${result.notifiedCount === 1 ? "" : "s"}.`
      : "";

  return {
    success: `Published ${result.publishedCount} day${result.publishedCount === 1 ? "" : "s"}. Families can order from it now.${told}`,
  };
}

const unpublishSchema = z.object({
  dateKeys: z.array(dateKeySchema).min(1, "Pick at least one day."),
});

/** Pull a menu back. Those days fall back to the rotating weekday menu. */
export async function unpublishLunchMenuAction(
  _prevState: LunchMenuActionState,
  formData: FormData,
): Promise<LunchMenuActionState> {
  const user = await requireCampusAccess();

  if (!canManageLunch(user.role)) {
    return { error: "Your account cannot publish the lunch menu." };
  }

  const parsed = unpublishSchema.safeParse({
    dateKeys: formData.getAll("dateKeys").map(String),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const count = await unpublishLunchMenuDays(parsed.data.dateKeys);
  revalidateLunchPaths();

  if (count === 0) {
    return { error: "Nothing was published for those days." };
  }

  return {
    success: `Pulled back ${count} day${count === 1 ? "" : "s"}. They show the standard rotating menu again.`,
  };
}
