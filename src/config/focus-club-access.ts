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

/** Focus-club officer titles — same four roles across IT, Broadcasting, and Cricut. */
export const FOCUS_CLUB_ROLE_LABELS: Record<
  FocusClubSlug,
  Record<OrgMembershipRole, string>
> = {
  "it-club": {
    president: "President",
    vice_president: "Vice President",
    secretary: "Secretary",
    member: "Member",
  },
  broadcasting: {
    president: "President",
    vice_president: "Vice President",
    secretary: "Secretary",
    member: "Member",
  },
  "cricut-club": {
    president: "President",
    vice_president: "Vice President",
    secretary: "Secretary",
    member: "Member",
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

  // /media is the campus-wide watch surface — not membership-gated.
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
