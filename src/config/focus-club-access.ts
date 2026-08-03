import {
  FOCUS_CLUBS,
  FOCUS_CLUB_SLUGS,
  isFocusClubSlug,
  type FocusClubSlug,
} from "@/config/focused-clubs";
import {
  isFacultyClubLookupRole,
  type CampusRole,
  type OrgMembershipRole,
} from "@/config/roles";

/**
 * Campus roles that may browse every focus club in nav and bypass soft-blocks.
 * Students and parents are membership-scoped; parents inherit linked-student clubs via layout context.
 */
export function canBrowseAllFocusClubs(role: CampusRole): boolean {
  return isFacultyClubLookupRole(role);
}

/** Club-specific display labels for org roles (maps onto LEAD/OFFICER/MODERATOR/MEMBER). */
export const FOCUS_CLUB_ROLE_LABELS: Record<
  FocusClubSlug,
  Record<OrgMembershipRole, string>
> = {
  "it-club": {
    lead: "IT Lead",
    officer: "IT Officer",
    moderator: "IT Moderator",
    member: "IT Member",
  },
  broadcasting: {
    lead: "Producer",
    officer: "Host",
    moderator: "Camera / Editor",
    member: "Crew",
  },
  "cricut-club": {
    lead: "Cricut Lead",
    officer: "Seller / Officer",
    moderator: "Shop Moderator",
    member: "Cricut Member",
  },
};

export function focusClubRoleLabel(
  slug: FocusClubSlug,
  orgRole: OrgMembershipRole,
): string {
  return FOCUS_CLUB_ROLE_LABELS[slug][orgRole];
}

export function focusClubName(slug: FocusClubSlug): string {
  return FOCUS_CLUBS.find((club) => club.slug === slug)?.name ?? slug;
}

/** Map a pathname to a focus club when the URL belongs to that club's surface. */
export function focusClubSlugFromPathname(pathname: string): FocusClubSlug | null {
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  for (const club of FOCUS_CLUBS) {
    if (path === club.href || path.startsWith(`${club.href}/`)) {
      return club.slug;
    }
  }

  if (path === "/cricut" || path.startsWith("/cricut/")) {
    return "cricut-club";
  }

  if (path === "/service-desk" || path.startsWith("/service-desk/")) {
    return "it-club";
  }

  if (path === "/media" || path.startsWith("/media/")) {
    return "broadcasting";
  }

  return null;
}

export function isActiveFocusClubMembership(
  membershipSlugs: readonly string[],
  slug: FocusClubSlug,
): boolean {
  return membershipSlugs.includes(slug);
}

export function firstFocusClubHref(
  membershipSlugs: readonly string[],
): string | null {
  for (const slug of FOCUS_CLUB_SLUGS) {
    if (membershipSlugs.includes(slug)) {
      return FOCUS_CLUBS.find((club) => club.slug === slug)?.href ?? null;
    }
  }
  return null;
}

export { isFocusClubSlug, FOCUS_CLUB_SLUGS };
