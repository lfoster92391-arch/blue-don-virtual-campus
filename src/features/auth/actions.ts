"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { canAccessAdmin, CAMPUS_ROLES, normalizeRole } from "@/config/roles";
import { isSupabaseConfigured } from "@/config/env";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  assignUserRole,
  completeOnboarding,
  ensureUserProfile,
  getUserProfile,
} from "@/services/user-service";

const onboardingSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  relationshipNote: z.string().trim().optional(),
});

const roleAssignmentSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(CAMPUS_ROLES as [typeof CAMPUS_ROLES[number], ...typeof CAMPUS_ROLES[number][]]),
});

export type AuthActionState = {
  error?: string;
  success?: string;
};

export async function completeOnboardingAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = onboardingSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    relationshipNote: formData.get("relationshipNote") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form data" };
  }

  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured. Add credentials to .env first." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { error: "Unable to connect to Supabase." };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to continue." };
  }

  const existingProfile = await getUserProfile(user.id);
  const role = existingProfile?.role ?? normalizeRole(user.user_metadata?.role as string | undefined) ?? "student";

  if (role === "parent" && !parsed.data.relationshipNote?.trim()) {
    return {
      error:
        "Please describe your relationship to the school (for example: parent of Jane Smith, Class of 2028).",
    };
  }

  let profile;
  try {
    profile = await completeOnboarding({
      userId: user.id,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      relationshipNote: parsed.data.relationshipNote,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save profile.",
    };
  }

  await supabase.auth.updateUser({
    data: {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      display_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      onboarded: true,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("bd_onboarded", "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  if (!profile) {
    return { success: "Profile saved." };
  }

  if (profile.role === "parent" && profile.status === "pending") {
    redirect("/pending-approval");
  }

  redirect("/home");
}

export async function assignRoleAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const currentUser = await requireUser();

  if (!canAccessAdmin(currentUser.role)) {
    return { error: "You do not have permission to assign roles." };
  }

  const parsed = roleAssignmentSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Invalid role assignment request." };
  }

  const updated = await assignUserRole(parsed.data.userId, parsed.data.role);

  if (!updated) {
    return { error: "Unable to assign role. Check database configuration." };
  }

  return { success: `Role updated to ${updated.role}.` };
}

export async function syncAuthProfileAction(role?: string | null) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  return ensureUserProfile({
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name as string | undefined,
    profileImage: user.user_metadata?.avatar_url as string | undefined,
    role: normalizeRole(role ?? (user.user_metadata?.role as string | undefined)),
    relationshipNote:
      (user.user_metadata?.relationship_note as string | undefined) ?? null,
  });
}
