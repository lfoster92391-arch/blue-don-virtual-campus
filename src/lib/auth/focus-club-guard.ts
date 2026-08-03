import { redirect } from "next/navigation";

import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import {
  canBrowseAllFocusClubs,
  firstFocusClubHref,
  focusClubSlugFromPathname,
} from "@/config/focus-club-access";
import { isFocusClubSlug, type FocusClubSlug } from "@/config/focused-clubs";
import type { CampusRole } from "@/config/roles";
import {
  listActiveFocusClubSlugsForUser,
  userHasActiveFocusClubMembership,
} from "@/services/org-membership-service";

export type FocusClubAccessOptions = {
  /**
   * When true (admin preview), ignore faculty bypass and apply membership
   * scoping as a student would see it.
   */
  forceScoped?: boolean;
  /** Override membership lookup user (preview target). */
  membershipUserId?: string;
  /** When previewing a club role with no student, allow only this slug. */
  forcedMembershipSlugs?: readonly FocusClubSlug[] | null;
};

/**
 * Soft-block students (and other non-faculty) from focus-club surfaces they
 * are not members of. Redirects to their first club or `/home` — never a 404.
 * Admins / advisors / staff / teachers / coaches / counselors are exempt
 * unless `forceScoped` is set (preview mode).
 */
export async function enforceFocusClubAccess(input: {
  userId: string;
  role: CampusRole;
  clubSlug: FocusClubSlug;
  options?: FocusClubAccessOptions;
}): Promise<void> {
  if (!FOCUSED_CLUBS_MODE) {
    return;
  }

  const forceScoped = Boolean(input.options?.forceScoped);
  if (!forceScoped && canBrowseAllFocusClubs(input.role)) {
    return;
  }

  const forced = input.options?.forcedMembershipSlugs;
  if (forced) {
    if (forced.includes(input.clubSlug)) {
      return;
    }
    const fallback = firstFocusClubHref(forced) ?? "/home";
    redirect(fallback);
  }

  const membershipUserId = input.options?.membershipUserId ?? input.userId;
  const allowed = await userHasActiveFocusClubMembership(
    membershipUserId,
    input.clubSlug,
  );
  if (allowed) {
    return;
  }

  const slugs = await listActiveFocusClubSlugsForUser(membershipUserId);
  const fallback = firstFocusClubHref(slugs) ?? "/home";
  redirect(fallback);
}

export async function enforceFocusClubAccessForPath(input: {
  userId: string;
  role: CampusRole;
  pathname: string;
  options?: FocusClubAccessOptions;
}): Promise<void> {
  const slug = focusClubSlugFromPathname(input.pathname);
  if (!slug) {
    return;
  }
  await enforceFocusClubAccess({
    userId: input.userId,
    role: input.role,
    clubSlug: slug,
    options: input.options,
  });
}

export async function enforceFocusClubAccessBySlug(input: {
  userId: string;
  role: CampusRole;
  slug: string;
  options?: FocusClubAccessOptions;
}): Promise<void> {
  if (!isFocusClubSlug(input.slug)) {
    return;
  }
  await enforceFocusClubAccess({
    userId: input.userId,
    role: input.role,
    clubSlug: input.slug,
    options: input.options,
  });
}
