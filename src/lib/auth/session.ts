import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/server";
import {
  buildCampusUserFromAuth,
  ensureUserProfile,
  getUserProfile,
} from "@/services/user-service";
import type { CampusUser } from "@/types/auth";
import { normalizeRole } from "@/config/roles";
import { validateEmailForRole } from "@/lib/auth/email-domain";
import {
  parentHasLinkedStudents,
  parentNeedsStudentLink,
} from "@/services/parent-student-service";

export async function getAuthUser() {
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

  return user;
}

export async function getCurrentUser(): Promise<CampusUser | null> {
  const authUser = await getAuthUser();

  if (!authUser?.email) {
    return null;
  }

  let profile = await getUserProfile(authUser.id);

  if (!profile) {
    try {
      profile = await ensureUserProfile({
        id: authUser.id,
        email: authUser.email,
        displayName: authUser.user_metadata?.display_name as string | undefined,
        profileImage: authUser.user_metadata?.avatar_url as string | undefined,
        role: normalizeRole(authUser.user_metadata?.role as string | undefined),
      });
    } catch {
      return null;
    }
  }

  const user = buildCampusUserFromAuth(authUser, profile);

  // A provisioned profile row is the authorization: an administrator created it,
  // or it passed the registration gate. Re-running the school-email rule here
  // would sign out students the office deliberately onboarded with an outside
  // address. Identities with no profile row (no database, or metadata-only) are
  // still held to the rule.
  if (!profile) {
    const emailCheck = validateEmailForRole(user.email, user.role);
    if (!emailCheck.valid) {
      return null;
    }
  }

  return user;
}

export async function requireUser(): Promise<CampusUser> {
  if (!isSupabaseConfigured()) {
    redirect("/login?setup=required");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?error=email_not_allowed");
  }

  return user;
}

export async function requireCompleteProfile(): Promise<CampusUser> {
  const user = await requireUser();

  if (!user.profileComplete) {
    redirect("/onboarding");
  }

  return user;
}

export async function requireCampusAccess(): Promise<CampusUser> {
  const user = await requireCompleteProfile();

  if (user.status === "pending") {
    redirect("/pending-approval");
  }

  if (user.status !== "active") {
    redirect("/login");
  }

  if (parentNeedsStudentLink(user.role)) {
    const hasLinks = await parentHasLinkedStudents(user.id);
    if (!hasLinks) {
      redirect("/pending-approval?reason=awaiting_student_link");
    }
  }

  return user;
}

export async function requireRole(permission: string): Promise<CampusUser> {
  const user = await requireCampusAccess();
  const { hasPermission } = await import("@/config/roles");

  if (!hasPermission(user.role, permission)) {
    redirect("/home");
  }

  return user;
}
