"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { upsertGraduateLegacy } from "@/services/graduate-legacy-service";

export type GraduateLegacyActionState = {
  error?: string;
  success?: string;
  slug?: string;
};

const schema = z.object({
  classYear: z.coerce.number().int().min(2020).max(2035),
  college: z.string().optional(),
  organizations: z.string().optional(),
  achievements: z.string().optional(),
  projects: z.string().optional(),
  favoriteMemory: z.string().optional(),
  advice: z.string().optional(),
  legacyMessage: z.string().optional(),
  alumniOptIn: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

function revalidateLegacyPaths(slug?: string) {
  revalidatePath("/my-legacy");
  revalidatePath("/career-portfolio");
  revalidatePath("/pathways");
  if (slug) {
    revalidatePath(`/legacy/${slug}`);
  }
}

export async function saveGraduateLegacyAction(
  _prev: GraduateLegacyActionState,
  formData: FormData,
): Promise<GraduateLegacyActionState> {
  const user = await requireCompleteProfile();

  const parsed = schema.safeParse({
    classYear: formData.get("classYear"),
    college: formData.get("college") || "",
    organizations: formData.get("organizations") || "",
    achievements: formData.get("achievements") || "",
    projects: formData.get("projects") || "",
    favoriteMemory: formData.get("favoriteMemory") || "",
    advice: formData.get("advice") || "",
    legacyMessage: formData.get("legacyMessage") || "",
    alumniOptIn: formData.get("alumniOptIn") === "on",
    isPublic: formData.get("isPublic") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid legacy data." };
  }

  const displayName =
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    "Blue Don Graduate";

  const legacy = await upsertGraduateLegacy(user.id, displayName, {
    classYear: parsed.data.classYear,
    college: parsed.data.college ?? "",
    organizations: parsed.data.organizations ?? "",
    achievements: parsed.data.achievements ?? "",
    projects: parsed.data.projects ?? "",
    favoriteMemory: parsed.data.favoriteMemory ?? "",
    advice: parsed.data.advice ?? "",
    legacyMessage: parsed.data.legacyMessage ?? "",
    alumniOptIn: parsed.data.alumniOptIn ?? false,
    isPublic: parsed.data.isPublic ?? false,
  });

  if (!legacy) {
    return { error: "Unable to save legacy page." };
  }

  revalidateLegacyPaths(legacy.slug);
  return {
    success: parsed.data.isPublic
      ? "Your legacy page is published."
      : "Legacy page saved as draft.",
    slug: legacy.slug,
  };
}
