import {
  BookOpen,
  BarChart3,
  Briefcase,
  Calculator,
  Calendar,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  CloudSun,
  Compass,
  Cpu,
  GraduationCap,
  Handshake,
  Headphones,
  Flame,
  Gamepad2,
  Heart,
  Home,
  KeyRound,
  Landmark,
  LayoutGrid,
  Mail,
  Map,
  Megaphone,
  Package,
  Radio,
  Scissors,
  ScrollText,
  Sparkles,
  Sun,
  Trophy,
  UserCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import { canBrowseAllFocusClubs } from "@/config/focus-club-access";
import { FOCUS_CLUBS, type FocusClubSlug } from "@/config/focused-clubs";
import { MADONNA_HUB_SECTIONS } from "@/config/madonna-hub";
import type { CampusRole } from "@/config/roles";
import {
  canAccessAdmin,
  canAccessCoachWorkspace,
  isFacultyClubLookupRole,
} from "@/config/roles";

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  enabled: boolean;
  mobile?: boolean;
  roles?: CampusRole[] | "all";
  /** Stronger visual weight — used for the three focus clubs. */
  primary?: boolean;
  /** When set, focused-mode nav hides this item unless the user belongs to the club. */
  clubSlug?: FocusClubSlug;
  /** When true, hide unless the user can view that club’s finances (or browses all clubs). */
  requiresFinanceAccess?: boolean;
  /** When true, hide unless the user may address a whole club audience. */
  requiresClubMessaging?: boolean;
};


/** A collapsible parent category that nests {@link NavItem} children. */
export type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: NavItem[];
  roles?: CampusRole[] | "all";
  /** When true the group starts expanded in the sidebar. */
  defaultOpen?: boolean;
  /** Stronger visual weight — used for focus-club parents (e.g. IT Club). */
  primary?: boolean;
  /** When set, focused-mode nav hides this group unless the user belongs to the club. */
  clubSlug?: FocusClubSlug;
};

export type ResolveNavigationOptions = {
  /** Active organization membership slugs (e.g. it-club, broadcasting). */
  membershipSlugs?: readonly string[];
  /** Focus-club slugs where the user may view finances (President / VP / Secretary). */
  financeClubSlugs?: readonly string[];
  /** Whether this user may send to a whole club audience — see `canReachClubMessaging`. */
  canMessageClubs?: boolean;
};

/** A top-level sidebar entry is either a direct link or a collapsible group. */
export type NavEntry = NavItem | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

/** Phase 17 enterprise primary navigation — see docs/BLUE_DON_DIGITAL_CAMPUS.md */
export const primaryNavigation: NavItem[] = [
  { label: "Home", href: "/home", icon: Home, enabled: true, mobile: true },
  {
    label: "My Journey",
    href: "/my-journey",
    icon: Map,
    enabled: true,
    mobile: true,
  },
  { label: "School Hub", href: "/hub", icon: Landmark, enabled: true },
  {
    label: "Find Your Place",
    href: "/find-your-place",
    icon: Users,
    enabled: true,
  },
  {
    label: "Academies",
    href: "/academies",
    icon: GraduationCap,
    enabled: true,
    mobile: true,
  },
  { label: "Athletics", href: "/athletics", icon: Trophy, enabled: true },
  {
    label: "Coach",
    href: "/coach",
    icon: ClipboardList,
    enabled: true,
    roles: ["coach", "admin", "advisor"],
  },
  { label: "Service Center", href: "/service", icon: Heart, enabled: true },
  {
    label: "Future Center",
    href: "/pathways",
    icon: Compass,
    enabled: true,
  },
  {
    label: "Blue Don Corner",
    href: "/corner",
    icon: CircleDollarSign,
    enabled: true,
  },
  { label: "Traditions", href: "/traditions", icon: Flame, enabled: true },
  { label: "Community", href: "/community", icon: Megaphone, enabled: true },
  { label: "Media", href: "/media", icon: Headphones, enabled: true },
  { label: "Rewards", href: "/rewards", icon: Sparkles, enabled: true },
  { label: "Blue Don AI", href: "/ai", icon: BookOpen, enabled: true },
  {
    label: "Administration",
    href: "/admin",
    icon: LayoutGrid,
    enabled: true,
    roles: ["admin", "advisor", "staff"],
  },
  {
    label: "Success Analytics",
    href: "/counselor/analytics",
    icon: BarChart3,
    enabled: true,
    roles: ["counselor", "advisor", "admin"],
  },
];

/** Pre-migration campus tools — still available during Phase 17 */
export const legacyNavigation: NavItem[] = [
  { label: "Calendar", href: "/calendar", icon: Calendar, enabled: true },
  { label: "Forms Center", href: "/forms-center", icon: ClipboardCheck, enabled: true },
  { label: "Forms", href: "/forms", icon: ClipboardList, enabled: true },
  { label: "Events", href: "/events", icon: Landmark, enabled: true },
  { label: "Portfolio", href: "/portfolio", icon: Trophy, enabled: true },
  {
    label: "Career Portfolio",
    href: "/career-portfolio",
    icon: GraduationCap,
    enabled: true,
  },
  { label: "Service Desk", href: "/service-desk", icon: Headphones, enabled: true },
  { label: "Equipment", href: "/equipment", icon: Package, enabled: true },
  { label: "Impact Fund", href: "/impact-fund", icon: CircleDollarSign, enabled: true },
  { label: "Knowledge Vault", href: "/knowledge", icon: BookOpen, enabled: true },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: Sparkles,
    enabled: true,
  },
  {
    label: "Business Partners",
    href: "/business-partners",
    icon: Handshake,
    enabled: true,
  },
  {
    label: "Professional Skills",
    href: "/professional-skills",
    icon: Briefcase,
    enabled: true,
  },
  { label: "Daily Discovery", href: "/discover", icon: Sun, enabled: true },
  {
    label: "Campus Life",
    href: "/campus-life",
    icon: Megaphone,
    enabled: true,
  },
  {
    label: "Weather Station",
    href: "/weather",
    icon: CloudSun,
    enabled: true,
  },
  { label: "Arcade", href: "/arcade", icon: Gamepad2, enabled: true },
  { label: "Faculty", href: "/faculty", icon: GraduationCap, enabled: true },
  { label: "Why Madonna?", href: "/why-madonna", icon: Heart, enabled: true },
  { label: "Madonna Archive", href: "/archive", icon: BookOpen, enabled: true },
];

/**
 * The Madonna Hub as one sidebar group: the front door plus its five sections.
 * Children are derived from {@link MADONNA_HUB_SECTIONS} so the sidebar cannot
 * drift from the pages.
 */
const madonnaHubGroup: NavGroup = {
  label: "Madonna Hub",
  icon: Landmark,
  defaultOpen: true,
  primary: true,
  children: [
    {
      label: "Hub",
      href: "/madonna",
      icon: Landmark,
      enabled: true,
      mobile: true,
      primary: true,
    },
    ...MADONNA_HUB_SECTIONS.map((section) => ({
      label: section.label,
      href: section.href,
      icon: section.icon,
      enabled: true,
      primary: true,
    })),
  ],
};

/**
 * Club-focus pivot navigation — Home + three clubs (+ Staff for admin roles).
 * Club finances and IT Help live under IT Club only.
 * Used when {@link FOCUSED_CLUBS_MODE} is on. Soft-wiped routes redirect via middleware.
 */
export const focusedClubsNavigation: NavEntry[] = [
  {
    label: "Home",
    href: "/home",
    icon: Home,
    enabled: true,
    mobile: true,
    primary: true,
  },
  madonnaHubGroup,
  {
    label: "Message clubs",
    href: "/messages/clubs",
    icon: Mail,
    enabled: true,
    primary: true,
    requiresClubMessaging: true,
  },
  {
    label: "Watch Broadcasting LIVE",
    href: "/watch",
    icon: Headphones,
    enabled: true,
    mobile: true,
    primary: true,
  },
  {
    label: "Blue Don Sports",
    href: "/sports",
    icon: Trophy,
    enabled: true,
    mobile: true,
    primary: true,
  },
  {
    label: "Coach",
    href: "/coach",
    icon: ClipboardList,
    enabled: true,
    primary: true,
    roles: ["coach", "admin", "advisor"],
  },
  {
    label: "Parent Portal",
    href: "/parent",
    icon: UserCheck,
    enabled: true,
    primary: true,
    roles: ["parent"],
  },
  {
    label: "Parent Guide",
    href: "/parent/guide",
    icon: BookOpen,
    enabled: true,
    roles: ["parent"],
  },
  {
    label: FOCUS_CLUBS[0].name,
    icon: Cpu,
    defaultOpen: true,
    primary: true,
    clubSlug: FOCUS_CLUBS[0].slug,
    children: [
      {
        label: "Overview",
        href: FOCUS_CLUBS[0].href,
        icon: Cpu,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[0].slug,
      },
      {
        label: "Finances",
        href: `${FOCUS_CLUBS[0].href}?tab=finances`,
        icon: CircleDollarSign,
        enabled: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[0].slug,
        requiresFinanceAccess: true,
      },
      {
        label: "IT Help Desk",
        href: "/service-desk",
        icon: Headphones,
        enabled: true,
        clubSlug: FOCUS_CLUBS[0].slug,
      },
    ],
  },
  {
    label: FOCUS_CLUBS[1].name,
    icon: Radio,
    defaultOpen: true,
    primary: true,
    clubSlug: FOCUS_CLUBS[1].slug,
    children: [
      {
        label: "Overview",
        href: FOCUS_CLUBS[1].href,
        icon: Radio,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[1].slug,
      },
      {
        label: "Daily Rundown",
        href: `${FOCUS_CLUBS[1].href}?tab=script`,
        icon: ScrollText,
        enabled: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[1].slug,
      },
      {
        label: "Go Live",
        href: "/broadcast/phone",
        icon: Video,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[1].slug,
      },
      {
        label: "Control Room",
        href: `${FOCUS_CLUBS[1].href}?tab=media`,
        icon: Megaphone,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[1].slug,
      },
    ],
  },
  {
    label: FOCUS_CLUBS[2].name,
    icon: Scissors,
    defaultOpen: true,
    primary: true,
    clubSlug: FOCUS_CLUBS[2].slug,
    children: [
      {
        label: "Overview",
        href: FOCUS_CLUBS[2].href,
        icon: Scissors,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[2].slug,
      },
      {
        label: "Production hub",
        href: "/cricut",
        icon: Scissors,
        enabled: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[2].slug,
      },
      {
        label: "Shop",
        href: "/cricut/shop",
        icon: CircleDollarSign,
        enabled: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[2].slug,
      },
      {
        label: "Cashier",
        href: "/cricut/pos",
        icon: Calculator,
        enabled: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[2].slug,
        requiresFinanceAccess: true,
      },
    ],
  },
  {
    label: "Staff & Admin",
    icon: LayoutGrid,
    roles: ["admin", "advisor", "staff", "counselor"],
    children: [
      {
        label: "Principal Dashboard",
        href: "/admin/leadership",
        icon: BarChart3,
        enabled: true,
        roles: ["admin", "advisor", "staff", "counselor"],
      },
      {
        label: "Students",
        href: "/admin/students",
        icon: Users,
        enabled: true,
        roles: ["admin"],
      },
      {
        label: "Reset passwords",
        href: "/admin/passwords",
        icon: KeyRound,
        enabled: true,
        roles: ["admin"],
      },
      {
        label: "Parent Guide",
        href: "/parent/guide",
        icon: BookOpen,
        enabled: true,
        roles: ["admin", "advisor", "staff", "counselor"],
      },
    ],
  },
];

function entryAllowedForMemberships(
  clubSlug: FocusClubSlug | undefined,
  role: CampusRole,
  membershipSlugs: readonly string[] | undefined,
): boolean {
  if (!clubSlug) {
    return true;
  }

  if (canBrowseAllFocusClubs(role)) {
    return true;
  }

  return (membershipSlugs ?? []).includes(clubSlug);
}

function entryAllowedForFinances(
  item: NavItem,
  role: CampusRole,
  financeClubSlugs: readonly string[] | undefined,
): boolean {
  if (!item.requiresFinanceAccess) {
    return true;
  }
  if (canBrowseAllFocusClubs(role)) {
    return true;
  }
  if (!item.clubSlug) {
    return true;
  }
  return (financeClubSlugs ?? []).includes(item.clubSlug);
}

function entryAllowedForClubMessaging(
  item: NavItem,
  canMessageClubs: boolean | undefined,
): boolean {
  return !item.requiresClubMessaging || canMessageClubs === true;
}

/**
 * Phase 18 · Condensed grouped navigation.
 *
 * The sidebar renders this tree: a short set of top-level entries where most
 * destinations are nested under collapsible parent categories. Every route from
 * {@link primaryNavigation} and {@link legacyNavigation} remains reachable here.
 * IT-specific tooling (Labs, Simulators, Repair Center) intentionally lives
 * under the IT Club org experience, not in this global tree.
 *
 * When {@link FOCUSED_CLUBS_MODE} is on, {@link focusedClubsNavigation} is used instead.
 */
export const groupedNavigation: NavEntry[] = [
  { label: "Home", href: "/home", icon: Home, enabled: true, mobile: true },
  {
    label: "Discover",
    icon: Compass,
    defaultOpen: true,
    children: [
      { label: "Find Your Place", href: "/find-your-place", icon: Users, enabled: true },
      { label: "Academies", href: "/academies", icon: GraduationCap, enabled: true },
      { label: "Athletics", href: "/athletics", icon: Trophy, enabled: true },
      {
        label: "Coach",
        href: "/coach",
        icon: ClipboardList,
        enabled: true,
        roles: ["coach", "admin", "advisor"],
      },
      { label: "Community", href: "/community", icon: Megaphone, enabled: true },
      { label: "Daily Discovery", href: "/discover", icon: Sun, enabled: true },
    ],
  },
  {
    label: "My Campus",
    icon: Landmark,
    children: [
      { label: "My Journey", href: "/my-journey", icon: Map, enabled: true },
      { label: "School Hub", href: "/hub", icon: Landmark, enabled: true },
      {
        label: "Parent Portal",
        href: "/parent",
        icon: UserCheck,
        enabled: true,
        roles: ["parent"],
      },
      {
        label: "Parent Guide",
        href: "/parent/guide",
        icon: BookOpen,
        enabled: true,
        roles: ["parent"],
      },
      {
        label: "Message clubs",
        href: "/messages/clubs",
        icon: Mail,
        enabled: true,
        requiresClubMessaging: true,
      },
      { label: "Calendar", href: "/calendar", icon: Calendar, enabled: true },
      { label: "Events", href: "/events", icon: Landmark, enabled: true },
      { label: "Campus Life", href: "/campus-life", icon: Megaphone, enabled: true },
      { label: "Media", href: "/media", icon: Headphones, enabled: true },
    ],
  },
  madonnaHubGroup,
  {
    label: "Tools & Resources",
    icon: Briefcase,
    children: [
      { label: "Forms Center", href: "/forms-center", icon: ClipboardCheck, enabled: true },
      { label: "Forms", href: "/forms", icon: ClipboardList, enabled: true },
      { label: "Equipment", href: "/equipment", icon: Package, enabled: true },
      { label: "Service Desk", href: "/service-desk", icon: Headphones, enabled: true },
      { label: "Knowledge Vault", href: "/knowledge", icon: BookOpen, enabled: true },
      { label: "Portfolio", href: "/portfolio", icon: Trophy, enabled: true },
      { label: "Career Portfolio", href: "/career-portfolio", icon: GraduationCap, enabled: true },
      { label: "Business Partners", href: "/business-partners", icon: Handshake, enabled: true },
      { label: "Professional Skills", href: "/professional-skills", icon: Briefcase, enabled: true },
      { label: "Blue Don AI", href: "/ai", icon: BookOpen, enabled: true },
    ],
  },
  {
    label: "Future Center",
    icon: Compass,
    children: [
      { label: "Career Pathways", href: "/pathways", icon: Compass, enabled: true },
      { label: "College Passport", href: "/college-passport", icon: GraduationCap, enabled: true },
      { label: "Opportunities", href: "/opportunities", icon: Sparkles, enabled: true },
      { label: "Impact Fund", href: "/impact-fund", icon: CircleDollarSign, enabled: true },
      { label: "Blue Don Corner", href: "/corner", icon: CircleDollarSign, enabled: true },
    ],
  },
  {
    label: "Spirit & Traditions",
    icon: Flame,
    children: [
      { label: "Traditions", href: "/traditions", icon: Flame, enabled: true },
      { label: "Service Center", href: "/service", icon: Heart, enabled: true },
      { label: "Rewards", href: "/rewards", icon: Sparkles, enabled: true },
      { label: "Arcade", href: "/arcade", icon: Gamepad2, enabled: true },
      { label: "Why Madonna?", href: "/why-madonna", icon: Heart, enabled: true },
      { label: "Madonna Archive", href: "/archive", icon: BookOpen, enabled: true },
    ],
  },
  {
    label: "Staff & Admin",
    icon: LayoutGrid,
    roles: ["admin", "advisor", "staff", "counselor"],
    children: [
      {
        label: "Principal Dashboard",
        href: "/admin/leadership",
        icon: BarChart3,
        enabled: true,
        roles: ["admin", "advisor", "staff", "counselor"],
      },
      {
        label: "Reset passwords",
        href: "/admin/passwords",
        icon: KeyRound,
        enabled: true,
        roles: ["admin"],
      },
      {
        label: "Administration",
        href: "/admin",
        icon: LayoutGrid,
        enabled: true,
        roles: ["admin", "advisor", "staff"],
      },
      {
        label: "Success Analytics",
        href: "/counselor/analytics",
        icon: BarChart3,
        enabled: true,
        roles: ["counselor", "advisor", "admin"],
      },
    ],
  },
];

/** W13 · Future Center sub-navigation */
export const futureCenterNavigation: NavItem[] = [
  { label: "Career Pathways", href: "/pathways", icon: Compass, enabled: true },
  { label: "College Passport", href: "/college-passport", icon: GraduationCap, enabled: true },
  { label: "Professional Skills", href: "/professional-skills", icon: Briefcase, enabled: true },
  { label: "Career Portfolio", href: "/career-portfolio", icon: GraduationCap, enabled: true },
  { label: "Opportunities", href: "/opportunities", icon: Sparkles, enabled: true },
];

/** W18 · School Culture & Traditions sub-navigation */
export const traditionsNavigation: NavItem[] = [
  { label: "Traditions Hub", href: "/traditions", icon: Flame, enabled: true },
  { label: "Madonna History", href: "/history", icon: Landmark, enabled: true },
  { label: "Hall of Champions", href: "/hall-of-champions", icon: Trophy, enabled: true },
  { label: "Meet the Faculty", href: "/faculty", icon: GraduationCap, enabled: true },
  { label: "Student Spotlight", href: "/spotlight", icon: Sparkles, enabled: true },
  { label: "Staff Appreciation", href: "/staff-appreciation", icon: Heart, enabled: true },
  { label: "Thank You Wall", href: "/thank-you", icon: Heart, enabled: true },
  { label: "Madonna Memories", href: "/memories", icon: Headphones, enabled: true },
  { label: "Campus Voice", href: "/campus-voice", icon: Megaphone, enabled: true },
  { label: "Madonna World", href: "/madonna-world", icon: Compass, enabled: true },
  { label: "Legacy Projects", href: "/legacy", icon: Trophy, enabled: true },
  { label: "Time Capsule", href: "/time-capsule", icon: Map, enabled: true },
];

export const profileNavigation = [
  { label: "Profile", href: "/profile" },
  { label: "Blue Don Pass", href: "/pass" },
  { label: "Settings", href: "/settings" },
] as const;

export function filterNavigationByRole(
  items: NavItem[],
  role: CampusRole,
): NavItem[] {
  return items.filter((item) => {
    if (!item.roles) {
      return true;
    }

    if (item.href === "/admin") {
      return canAccessAdmin(role);
    }

    return item.roles.includes(role);
  });
}

/** Role-aware labels and mobile prominence (e.g. faculty club directory). */
export function resolveNavigationForRole(
  items: NavItem[],
  role: CampusRole,
): NavItem[] {
  return filterNavigationByRole(items, role).map((item) => {
    if (item.href === "/find-your-place" && isFacultyClubLookupRole(role)) {
      return {
        ...item,
        label: "Clubs & Organizations",
        mobile: true,
      };
    }

    return item;
  });
}

/**
 * Role-aware view of {@link groupedNavigation} (or {@link focusedClubsNavigation}
 * when focused clubs mode is on): filters top-level entries and group children
 * by role, drops empty groups, and applies the faculty club lookup relabel.
 * In focused mode, club groups are also filtered by active memberships
 * (admins/advisors/staff still see all three clubs). "Message clubs" is gated
 * on {@link ResolveNavigationOptions.canMessageClubs} rather than role alone,
 * so club officers see it too.
 */
export function resolveGroupedNavigation(
  role: CampusRole,
  options?: ResolveNavigationOptions,
): NavEntry[] {
  const membershipSlugs = options?.membershipSlugs;
  const financeClubSlugs = options?.financeClubSlugs;
  const canMessageClubs = options?.canMessageClubs;
  const source = FOCUSED_CLUBS_MODE ? focusedClubsNavigation : groupedNavigation;
  const entries: NavEntry[] = [];

  for (const entry of source) {
    if (!isNavGroup(entry)) {
      if (
        FOCUSED_CLUBS_MODE &&
        !entryAllowedForMemberships(entry.clubSlug, role, membershipSlugs)
      ) {
        continue;
      }
      if (!entryAllowedForFinances(entry, role, financeClubSlugs)) {
        continue;
      }
      if (!entryAllowedForClubMessaging(entry, canMessageClubs)) {
        continue;
      }
      const [item] = resolveNavigationForRole([entry], role);
      if (item) {
        entries.push(item);
      }
      continue;
    }

    if (entry.roles && entry.roles !== "all" && !entry.roles.includes(role)) {
      continue;
    }

    if (
      FOCUSED_CLUBS_MODE &&
      !entryAllowedForMemberships(entry.clubSlug, role, membershipSlugs)
    ) {
      continue;
    }

    const children = resolveNavigationForRole(
      entry.children.filter(
        (child) =>
          (!FOCUSED_CLUBS_MODE ||
            entryAllowedForMemberships(child.clubSlug, role, membershipSlugs)) &&
          entryAllowedForFinances(child, role, financeClubSlugs) &&
          entryAllowedForClubMessaging(child, canMessageClubs),
      ),
      role,
    );
    if (children.length > 0) {
      entries.push({ ...entry, children });
    }
  }

  return entries;
}

export function getMobileNavigation(
  role: CampusRole,
  options?: ResolveNavigationOptions,
): NavItem[] {
  if (FOCUSED_CLUBS_MODE) {
    const membershipSlugs = options?.membershipSlugs;
    const focusedMobile: NavItem[] = [
      {
        label: "Home",
        href: "/home",
        icon: Home,
        enabled: true,
        mobile: true,
        primary: true,
      },
      ...(canAccessCoachWorkspace(role)
        ? [
            {
              label: "Coach",
              href: "/coach",
              icon: ClipboardList,
              enabled: true,
              mobile: true,
              primary: true,
              roles: ["coach", "admin", "advisor"] as CampusRole[],
            },
          ]
        : []),
      {
        label: FOCUS_CLUBS[0].shortLabel,
        href: FOCUS_CLUBS[0].href,
        icon: Cpu,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[0].slug,
      },
      {
        label: FOCUS_CLUBS[1].shortLabel,
        href: `${FOCUS_CLUBS[1].href}?tab=media`,
        icon: Radio,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[1].slug,
      },
      {
        label: FOCUS_CLUBS[2].shortLabel,
        href: FOCUS_CLUBS[2].href,
        icon: Scissors,
        enabled: true,
        mobile: true,
        primary: true,
        clubSlug: FOCUS_CLUBS[2].slug,
      },
    ].filter((item) =>
      entryAllowedForMemberships(item.clubSlug, role, membershipSlugs),
    );
    return resolveNavigationForRole(focusedMobile, role);
  }

  const items = resolveNavigationForRole(primaryNavigation, role).filter(
    (item) => item.mobile && item.enabled && item.href,
  );

  if (items.length >= 3) {
    return items.slice(0, 3);
  }

  return [
    { label: "Home", href: "/home", icon: Home, enabled: true, mobile: true },
    {
      label: "My Journey",
      href: "/my-journey",
      icon: Map,
      enabled: true,
      mobile: true,
    },
    {
      label: "Academies",
      href: "/academies",
      icon: GraduationCap,
      enabled: true,
      mobile: true,
    },
  ];
}

export function isNavItemActive(
  pathname: string,
  href: string,
  search = "",
): boolean {
  if (href === "/home") {
    return pathname === "/home" || pathname === "/dashboard";
  }

  const qIndex = href.indexOf("?");
  const pathOnly = qIndex >= 0 ? href.slice(0, qIndex) : href;
  const hrefQuery = qIndex >= 0 ? href.slice(qIndex + 1) : "";

  const pathMatches =
    pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  if (!pathMatches) {
    return false;
  }

  if (hrefQuery) {
    const want = new URLSearchParams(hrefQuery);
    const have = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search,
    );
    for (const [key, value] of want) {
      if (have.get(key) !== value) {
        return false;
      }
    }
    return true;
  }

  // Plain org overview links should not stay active on ?tab=…
  if (pathOnly.startsWith("/organizations/")) {
    const tab = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search,
    ).get("tab");
    if (tab && tab !== "overview") {
      return false;
    }
  }

  return true;
}
