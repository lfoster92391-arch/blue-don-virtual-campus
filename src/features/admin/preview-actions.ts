"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { FOCUS_CLUB_SLUGS, FOCUS_CLUBS } from "@/config/focused-clubs";
import { firstFocusClubHref } from "@/config/focus-club-access";
import { canManageUsers } from "@/config/roles";
import { homePathForViewAs, parseViewAsPersona } from "@/config/view-as";
import {
  PREVIEW_AS_COOKIE,
  PREVIEW_CLUB_COOKIE,
  PREVIEW_PARENT_COOKIE,
  PREVIEW_ROLE_COOKIE,
} from "@/lib/auth/preview";
import {
  previewCookieDeleteOptions,
  previewCookieOptions,
} from "@/lib/auth/preview-cookies";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listActiveFocusClubSlugsForUser } from "@/services/org-membership-service";
import { getUserById } from "@/services/user-service";

const startStudentSchema = z.object({
  userId: z.string().uuid("Invalid user."),
});

const startClubSchema = z.object({
  clubSlug: z.enum(FOCUS_CLUB_SLUGS),
});

export async function startStudentPreviewAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireCompleteProfile();
  if (!canManageUsers(admin.role)) {
    redirect("/admin");
  }

  const parsed = startStudentSchema.safeParse({
    userId: formData.get("userId"),
  });
  if (!parsed.success) {
    redirect("/admin/students?preview=invalid");
  }

  const target = await getUserById(parsed.data.userId);
  if (!target || target.status === "inactive") {
    redirect("/admin/students?preview=inactive");
  }

  const jar = await cookies();
  jar.set(PREVIEW_AS_COOKIE, target.id, previewCookieOptions());
  jar.delete(previewCookieDeleteOptions(PREVIEW_CLUB_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_PARENT_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_ROLE_COOKIE));

  const slugs = await listActiveFocusClubSlugsForUser(target.id);
  redirect(firstFocusClubHref(slugs) ?? "/home");
}

/**
 * Preview the parent experience without a linked student. The portal and lunch
 * board render against a synthetic child and refuse every write, so an admin can
 * check what families see without creating orders or dietary forms.
 */
export async function startParentPreviewAction(): Promise<void> {
  const admin = await requireCompleteProfile();
  if (!canManageUsers(admin.role)) {
    redirect("/admin");
  }

  const jar = await cookies();
  jar.set(PREVIEW_PARENT_COOKIE, "1", previewCookieOptions());
  jar.set(PREVIEW_ROLE_COOKIE, "parent", previewCookieOptions());
  jar.delete(previewCookieDeleteOptions(PREVIEW_AS_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_CLUB_COOKIE));
  redirect("/parent");
}

/**
 * Preview a persona home. Cookie only — does not change the admin's real role
 * or grant coach/faculty/admin tools from the login chooser.
 */
export async function startViewAsAction(formData: FormData): Promise<void> {
  const admin = await requireCompleteProfile();
  if (!canManageUsers(admin.role)) {
    redirect("/admin");
  }

  const persona = parseViewAsPersona(String(formData.get("persona") ?? ""));
  if (!persona || persona === "admin") {
    await exitPreviewAction();
    return;
  }

  const jar = await cookies();
  jar.delete(previewCookieDeleteOptions(PREVIEW_AS_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_CLUB_COOKIE));

  if (persona === "parent") {
    jar.set(PREVIEW_PARENT_COOKIE, "1", previewCookieOptions());
    jar.set(PREVIEW_ROLE_COOKIE, persona, previewCookieOptions());
    redirect("/parent");
  }

  jar.set(PREVIEW_ROLE_COOKIE, persona, previewCookieOptions());
  jar.delete(previewCookieDeleteOptions(PREVIEW_PARENT_COOKIE));
  redirect(homePathForViewAs(persona));
}

export async function startClubPreviewAction(
  formData: FormData,
): Promise<void> {
  const admin = await requireCompleteProfile();
  if (!canManageUsers(admin.role)) {
    redirect("/admin");
  }

  const parsed = startClubSchema.safeParse({
    clubSlug: formData.get("clubSlug"),
  });
  if (!parsed.success) {
    redirect("/admin/students?preview=invalid");
  }

  const club = FOCUS_CLUBS.find((c) => c.slug === parsed.data.clubSlug);
  if (!club) {
    redirect("/admin/students?preview=invalid");
  }

  const jar = await cookies();
  jar.set(PREVIEW_CLUB_COOKIE, club.slug, previewCookieOptions());
  jar.delete(previewCookieDeleteOptions(PREVIEW_AS_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_PARENT_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_ROLE_COOKIE));
  redirect(club.href);
}

export async function exitPreviewAction(): Promise<void> {
  const admin = await requireCompleteProfile();
  if (!canManageUsers(admin.role)) {
    redirect("/home");
  }

  const jar = await cookies();
  jar.delete(previewCookieDeleteOptions(PREVIEW_AS_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_CLUB_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_PARENT_COOKIE));
  jar.delete(previewCookieDeleteOptions(PREVIEW_ROLE_COOKIE));
  redirect("/admin/students");
}
