import { cookies } from "next/headers";

import { isFocusClubSlug, type FocusClubSlug } from "@/config/focused-clubs";
import { canManageUsers } from "@/config/roles";
import type { CampusRole } from "@/config/roles";
import {
  navRoleForViewAs,
  parseViewAsPersona,
  type ViewAsPersona,
} from "@/config/view-as";
import { previewCookieDeleteOptions } from "@/lib/auth/preview-cookies";
import type { CampusUser } from "@/types/auth";
import { getUserById } from "@/services/user-service";

/** HttpOnly cookie — preview as a specific campus user. */
export const PREVIEW_AS_COOKIE = "bd_preview_as";
/** HttpOnly cookie — preview nav scoped to one focus club (no student account). */
export const PREVIEW_CLUB_COOKIE = "bd_preview_club";
/** HttpOnly cookie — preview the parent experience (no linked student needed). */
export const PREVIEW_PARENT_COOKIE = "bd_preview_parent";
/** HttpOnly cookie — preview a persona home (student / guest / coach / faculty). */
export const PREVIEW_ROLE_COOKIE = "bd_preview_role";

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
  /**
   * Previewing the parent experience against a synthetic child rather than a
   * real account. Surfaces the parent portal and the family lunch board to an
   * admin who has no `ParentStudentLink`, and forces every write off.
   */
  isParentPreview: boolean;
  previewLabel: string | null;
  previewPersona: ViewAsPersona | null;
};

/**
 * Whether this admin is previewing the parent experience. Cheaper than
 * `resolveAccessIdentity` for pages that only need the parent branch, and it
 * mirrors the same precedence: previewing a real student wins.
 */
export async function isParentPreviewActive(
  actor: CampusUser,
): Promise<boolean> {
  if (!canManageUsers(actor.role)) {
    return false;
  }

  const jar = await cookies();
  if (jar.get(PREVIEW_AS_COOKIE)?.value?.trim()) {
    return false;
  }
  return jar.get(PREVIEW_PARENT_COOKIE)?.value === "1";
}

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
    isParentPreview: false,
    previewLabel: null,
    previewPersona: null,
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
        isParentPreview: false,
        previewLabel: target.displayName,
        previewPersona: "student",
      };
    }
    // Stale / inactive preview cookie — clear so UI does not look "broken".
    jar.delete(previewCookieDeleteOptions(PREVIEW_AS_COOKIE));
  }

  if (jar.get(PREVIEW_PARENT_COOKIE)?.value === "1") {
    return {
      actor,
      membershipUserId: actor.id,
      navRole: "parent",
      forcedMembershipSlugs: null,
      isPreviewing: true,
      previewTarget: null,
      previewClubSlug: null,
      isParentPreview: true,
      previewLabel: null,
      previewPersona: "parent",
    };
  }

  const persona = parseViewAsPersona(jar.get(PREVIEW_ROLE_COOKIE)?.value);
  if (persona && persona !== "admin") {
    const navRole = navRoleForViewAs(persona);
    return {
      actor,
      membershipUserId: actor.id,
      navRole: navRole ?? actor.role,
      // Generic View as Student is chrome-only — no simulated club roster.
      // Empty array (not null) so layout does not fall back to Lisa's seats.
      forcedMembershipSlugs: persona === "student" ? [] : null,
      isPreviewing: true,
      previewTarget: null,
      previewClubSlug: null,
      isParentPreview: persona === "parent",
      previewLabel: null,
      previewPersona: persona,
    };
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
      isParentPreview: false,
      previewLabel: null,
      previewPersona: "student",
    };
  }

  if (clubSlug) {
    jar.delete(previewCookieDeleteOptions(PREVIEW_CLUB_COOKIE));
  }

  return base;
}
