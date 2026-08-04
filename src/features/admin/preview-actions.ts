"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { FOCUS_CLUB_SLUGS, FOCUS_CLUBS } from "@/config/focused-clubs";
import { firstFocusClubHref } from "@/config/focus-club-access";
import { canManageUsers } from "@/config/roles";
import {
  PREVIEW_AS_COOKIE,
  PREVIEW_CLUB_COOKIE,
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

  const slugs = await listActiveFocusClubSlugsForUser(target.id);
  redirect(firstFocusClubHref(slugs) ?? "/home");
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
  redirect("/admin/students");
}
