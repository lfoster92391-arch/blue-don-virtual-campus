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
    profile = await ensureUserProfile({
      id: authUser.id,
      email: authUser.email,
      displayName: authUser.user_metadata?.display_name as string | undefined,
      profileImage: authUser.user_metadata?.avatar_url as string | undefined,
      role: normalizeRole(authUser.user_metadata?.role as string | undefined),
    });
  }

  return buildCampusUserFromAuth(authUser, profile);
}

export async function requireUser(): Promise<CampusUser> {
  if (!isSupabaseConfigured()) {
    redirect("/login?setup=required");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
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

export async function requireRole(permission: string): Promise<CampusUser> {
  const user = await requireCompleteProfile();
  const { hasPermission } = await import("@/config/roles");

  if (!hasPermission(user.role, permission)) {
    redirect("/home");
  }

  return user;
}
