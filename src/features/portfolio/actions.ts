"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import {
  createPortfolioItem,
  publishPortfolioItem,
} from "@/services/portfolio-service";
import type { PortfolioItemType } from "@/generated/prisma/client";

export type PortfolioActionState = {
  error?: string;
  success?: string;
  itemId?: string;
};

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  type: z.string().min(1),
  evidenceUrl: z.string().trim().optional(),
  points: z.coerce.number().min(0).optional(),
  academyId: z.string().optional(),
});

function revalidatePortfolioPaths(itemId?: string) {
  revalidatePath("/portfolio");
  revalidatePath("/dashboard");
  if (itemId) {
    revalidatePath(`/portfolio/${itemId}`);
  }
}

export async function createPortfolioItemAction(
  _prev: PortfolioActionState,
  formData: FormData,
): Promise<PortfolioActionState> {
  const user = await requireCompleteProfile();

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    type: formData.get("type"),
    evidenceUrl: formData.get("evidenceUrl") || undefined,
    points: formData.get("points") || 0,
    academyId: formData.get("academyId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid portfolio data." };
  }

  const itemId = await createPortfolioItem({
    userId: user.id,
    title: parsed.data.title,
    description: parsed.data.description,
    type: parsed.data.type as PortfolioItemType,
    evidenceUrl: parsed.data.evidenceUrl,
    points: parsed.data.points,
    academyId: parsed.data.academyId,
  });

  if (!itemId) {
    return { error: "Unable to create portfolio item." };
  }

  revalidatePortfolioPaths(itemId);
  return { success: "Portfolio item created.", itemId };
}

export async function publishPortfolioItemAction(
  itemId: string,
): Promise<PortfolioActionState> {
  const user = await requireCompleteProfile();
  const success = await publishPortfolioItem(itemId, user.id);

  if (!success) {
    return { error: "Unable to publish portfolio item." };
  }

  revalidatePortfolioPaths(itemId);
  return { success: "Portfolio item published." };
}
