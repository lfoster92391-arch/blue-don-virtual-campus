import {
  BookOpen,
  Calendar,
  CircleDollarSign,
  ClipboardList,
  Compass,
  FlaskConical,
  Gamepad2,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Landmark,
  LayoutGrid,
  Map,
  Megaphone,
  Sparkles,
  Sun,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { CampusRole } from "@/config/roles";
import { canAccessAdmin } from "@/config/roles";

export type NavItem = {
  label: string;
  href?: string;
  icon: LucideIcon;
  enabled: boolean;
  mobile?: boolean;
  roles?: CampusRole[] | "all";
};

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
    label: "Student Life",
    href: "/student-life",
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
];

/** Pre-migration campus tools — still available during Phase 17 */
export const legacyNavigation: NavItem[] = [
  { label: "Calendar", href: "/calendar", icon: Calendar, enabled: true },
  { label: "Forms", href: "/forms", icon: ClipboardList, enabled: true },
  { label: "Events", href: "/events", icon: Landmark, enabled: true },
  { label: "Labs", href: "/labs", icon: FlaskConical, enabled: true },
  { label: "Simulators", href: "/simulators", icon: Gamepad2, enabled: true },
  { label: "Portfolio", href: "/portfolio", icon: Trophy, enabled: true },
  { label: "Service Desk", href: "/service-desk", icon: Headphones, enabled: true },
  { label: "Impact Fund", href: "/impact-fund", icon: CircleDollarSign, enabled: true },
  { label: "Knowledge Vault", href: "/knowledge", icon: BookOpen, enabled: true },
  {
    label: "Opportunities",
    href: "/opportunities",
    icon: Sparkles,
    enabled: true,
  },
  { label: "Discover", href: "/discover", icon: Sun, enabled: true },
  {
    label: "Campus Life",
    href: "/campus-life",
    icon: Megaphone,
    enabled: true,
  },
  { label: "Arcade", href: "/arcade", icon: Gamepad2, enabled: true },
];

export const profileNavigation = [
  { label: "Profile", href: "/profile" },
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

export function getMobileNavigation(role: CampusRole): NavItem[] {
  const items = filterNavigationByRole(primaryNavigation, role).filter(
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

export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/home") {
    return pathname === "/home" || pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
