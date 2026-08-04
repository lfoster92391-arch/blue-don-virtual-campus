import { cookies } from "next/headers";

import {
  isFocusClubSlug,
  type FocusClubSlug,
} from "@/config/focused-clubs";
import { canManageUsers } from "@/config/roles";
import type { CampusRole } from "@/config/roles";
import { previewCookieDeleteOptions } from "@/lib/auth/preview-cookies";
import type { CampusUser } from "@/types/auth";
import { getUserById } from "@/services/user-service";

/** HttpOnly cookie — preview as a specific campus user. */
export const PREVIEW_AS_COOKIE = "bd_preview_as";
/** HttpOnly cookie — preview nav scoped to one focus club (no student account). */
export const PREVIEW_CLUB_COOKIE = "bd_preview_club";

export type AccessIdentity = {
  actor: CampusUser;
  /** Whose memberships drive soft-blocks when previewing a student. */
  membershipUserId: string;
  /** Role used for nav filtering (student while previewing). */
  navRole: CampusRole;
  /** Explicit membership slug filter; when set, overrides loaded clubs for nav. */
  forcedMembershipSlugs: FocusClubSlug[] | null;
  isPreviewing: boolean;
  previewTarget: CampusUser | null;
  previewClubSlug: FocusClubSlug | null;
  previewLabel: string | null;
};

/**
 * Resolve nav/soft-block identity for the signed-in user, including optional
 * admin preview of a student or a single club surface.
 */
export async function resolveAccessIdentity(
  actor: CampusUser,
): Promise<AccessIdentity> {
  const base: AccessIdentity = {
    actor,
    membershipUserId: actor.id,
    navRole: actor.role,
    forcedMembershipSlugs: null,
    isPreviewing: false,
    previewTarget: null,
    previewClubSlug: null,
    previewLabel: null,
  };

  if (!canManageUsers(actor.role)) {
    return base;
  }

  const jar = await cookies();
  const targetId = jar.get(PREVIEW_AS_COOKIE)?.value?.trim();
  if (targetId && targetId !== actor.id) {
    const target = await getUserById(targetId);
    if (target && target.status !== "inactive") {
      return {
        actor,
        membershipUserId: target.id,
        navRole: "student",
        forcedMembershipSlugs: null,
        isPreviewing: true,
        previewTarget: target,
        previewClubSlug: null,
        previewLabel: target.displayName,
      };
    }
    // Stale / inactive preview cookie — clear so UI does not look "broken".
    jar.delete(previewCookieDeleteOptions(PREVIEW_AS_COOKIE));
  }

  const clubSlug = jar.get(PREVIEW_CLUB_COOKIE)?.value?.trim();
  if (clubSlug && isFocusClubSlug(clubSlug)) {
    return {
      actor,
      membershipUserId: actor.id,
      navRole: "student",
      forcedMembershipSlugs: [clubSlug],
      isPreviewing: true,
      previewTarget: null,
      previewClubSlug: clubSlug,
      previewLabel: null,
    };
  }

  if (clubSlug) {
    jar.delete(previewCookieDeleteOptions(PREVIEW_CLUB_COOKIE));
  }

  return base;
}
