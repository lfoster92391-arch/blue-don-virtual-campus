"use server";

import { revalidatePath } from "next/cache";

import { requireCompleteProfile } from "@/lib/auth/session";
import { updateCareerPortfolioPublic } from "@/services/career-portfolio-service";

export type CareerPortfolioActionState = {
  error?: string;
  success?: string;
};

function revalidateCareerPortfolioPaths(slug?: string) {
  revalidatePath("/career-portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/my-journey");
  revalidatePath("/pathways");
  if (slug) {
    revalidatePath(`/p/${slug}`);
  }
}

export async function toggleCareerPortfolioPublicAction(
  isPublic: boolean,
): Promise<CareerPortfolioActionState> {
  const user = await requireCompleteProfile();
  const success = await updateCareerPortfolioPublic(user.id, isPublic);

  if (!success) {
    return { error: "Unable to update portfolio visibility." };
  }

  revalidateCareerPortfolioPaths();
  return {
    success: isPublic
      ? "Your career portfolio is now public."
      : "Your career portfolio is now private.",
  };
}
