/**
 * School Hub (Module 4, `/hub`) — the daily operations center for Madonna High
 * School. Seed/config data for the bell schedule, rotating lunch menus, staff
 * directory, and school resources. Live data (weather, events, forms) is joined
 * in `src/services/school-hub-service.ts`.
 *
 * IMPORTANT: This is seed/config content. Replace with an admin-managed source
 * (cafeteria menu feed, SIS bell schedule, directory service) when available.
 */

import {
  BookOpen,
  Briefcase,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Compass,
  Flame,
  Gamepad2,
  GraduationCap,
  Heart,
  Map,
  Megaphone,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { CampusRole } from "@/config/roles";
import { IT_HELP_DESK_EMAIL, IT_HELP_DESK_NAME } from "@/config/it-help-desk";

/** Day of week index (0 = Sunday … 6 = Saturday), matching `Date.getDay()`. */
export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ---------------------------------------------------------------------------
// Bell schedule
// ---------------------------------------------------------------------------

export type BellPeriodKind = "class" | "lunch" | "break" | "activity" | "arrival" | "dismissal";

export type BellPeriod = {
  id: string;
  label: string;
  /** Minutes since midnight (campus timezone), e.g. 8 * 60 + 5 = 485. */
  startMinutes: number;
  endMinutes: number;
  kind: BellPeriodKind;
  room?: string;
};

/** Human clock label for minutes-since-midnight, e.g. 485 → "8:05 AM". */
export function formatMinutes(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(normalized / 60);
  const minute = normalized % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}

function m(hour: number, minute: number): number {
  return hour * 60 + minute;
}

/** Regular weekday bell schedule. Kept intentionally simple for the MVP. */
export const REGULAR_BELL_SCHEDULE: BellPeriod[] = [
  { id: "arrival", label: "Arrival & Homeroom", startMinutes: m(7, 45), endMinutes: m(8, 5), kind: "arrival" },
  { id: "p1", label: "Period 1", startMinutes: m(8, 5), endMinutes: m(8, 52), kind: "class" },
  { id: "p2", label: "Period 2", startMinutes: m(8, 56), endMinutes: m(9, 43), kind: "class" },
  { id: "p3", label: "Period 3", startMinutes: m(9, 47), endMinutes: m(10, 34), kind: "class" },
  { id: "p4", label: "Period 4", startMinutes: m(10, 38), endMinutes: m(11, 25), kind: "class" },
  { id: "lunch", label: "Lunch", startMinutes: m(11, 25), endMinutes: m(12, 0), kind: "lunch" },
  { id: "p5", label: "Period 5", startMinutes: m(12, 4), endMinutes: m(12, 51), kind: "class" },
  { id: "p6", label: "Period 6", startMinutes: m(12, 55), endMinutes: m(13, 42), kind: "class" },
  { id: "p7", label: "Period 7", startMinutes: m(13, 46), endMinutes: m(14, 33), kind: "class" },
  { id: "activity", label: "Activity / Extra Help", startMinutes: m(14, 37), endMinutes: m(15, 15), kind: "activity" },
  { id: "dismissal", label: "Dismissal", startMinutes: m(15, 15), endMinutes: m(15, 20), kind: "dismissal" },
];

export type ScheduleNote = {
  id: string;
  label: string;
  detail: string;
  tone: "info" | "warning";
};

/**
 * Seasonal / upcoming schedule notes (early dismissal, Mass days, etc.).
 * Rendered as an at-a-glance strip on the bell schedule widget.
 */
export const SCHEDULE_NOTES: ScheduleNote[] = [
  {
    id: "mass-first-friday",
    label: "First Friday Mass",
    detail: "All-school Mass replaces Period 1 on the first Friday of each month.",
    tone: "info",
  },
  {
    id: "early-dismissal",
    label: "Early dismissal reminder",
    detail: "Faculty in-service on the last Wednesday of the month — 12:30 PM dismissal.",
    tone: "warning",
  },
];

// ---------------------------------------------------------------------------
// Lunch menu (rotating by weekday)
// ---------------------------------------------------------------------------

export type LunchMenu = {
  weekday: WeekdayIndex;
  dayName: string;
  entree: string;
  sides: string[];
  vegetarian: string;
  dessert: string;
};

/** Rotating weekday lunch menu (Mon–Fri). Cafeteria is closed on weekends. */
export const LUNCH_MENUS: Record<number, LunchMenu> = {
  1: {
    weekday: 1,
    dayName: "Monday",
    entree: "Chicken parmesan over penne",
    sides: ["Garlic breadstick", "Caesar salad", "Fresh fruit cup"],
    vegetarian: "Eggplant parmesan",
    dessert: "Chocolate chip cookie",
  },
  2: {
    weekday: 2,
    dayName: "Tuesday",
    entree: "Beef & cheese nachos",
    sides: ["Spanish rice", "Black beans", "Salsa & guacamole"],
    vegetarian: "Bean & cheese nachos",
    dessert: "Cinnamon churro",
  },
  3: {
    weekday: 3,
    dayName: "Wednesday",
    entree: "Crispy chicken sandwich",
    sides: ["Seasoned fries", "Coleslaw", "Apple slices"],
    vegetarian: "Grilled cheese & tomato soup",
    dessert: "Fruit sorbet",
  },
  4: {
    weekday: 4,
    dayName: "Thursday",
    entree: "Baked ziti with meat sauce",
    sides: ["Garden salad", "Italian bread", "Mixed berries"],
    vegetarian: "Baked ziti (marinara)",
    dessert: "Brownie",
  },
  5: {
    weekday: 5,
    dayName: "Friday",
    entree: "Cheese & pepperoni pizza",
    sides: ["Side salad", "Baby carrots", "Fresh fruit"],
    vegetarian: "Cheese pizza",
    dessert: "Soft pretzel",
  },
};

export function getLunchForWeekday(weekday: number): LunchMenu | null {
  return LUNCH_MENUS[weekday] ?? null;
}

// ---------------------------------------------------------------------------
// School directory
// ---------------------------------------------------------------------------

export type DirectoryEntry = {
  id: string;
  name: string;
  role: string;
  department: string;
  phone?: string;
  email?: string;
  location?: string;
  /** When set, the entry surfaces admin/staff-only detail. */
  staffOnly?: boolean;
};

export const SCHOOL_DIRECTORY: DirectoryEntry[] = [
  {
    id: "main-office",
    name: "Main Office",
    role: "Reception & attendance",
    department: "Administration",
    phone: "(304) 723-5321",
    email: "office@madonnahs.org",
    location: "Front entrance, Room 100",
  },
  {
    id: "principal",
    name: "Principal's Office",
    role: "School leadership",
    department: "Administration",
    email: "principal@madonnahs.org",
    location: "Room 102",
  },
  {
    id: "guidance",
    name: "Guidance & Counseling",
    role: "Academic & college counseling",
    department: "Student Services",
    phone: "(304) 723-5324",
    email: "guidance@madonnahs.org",
    location: "Room 118",
  },
  {
    id: "nurse",
    name: "School Nurse",
    role: "Health office",
    department: "Student Services",
    phone: "(304) 723-5327",
    email: "nurse@madonnahs.org",
    location: "Room 110",
  },
  {
    id: "campus-ministry",
    name: "Campus Ministry",
    role: "Faith life & service",
    department: "Ministry",
    email: "ministry@madonnahs.org",
    location: "Chapel wing",
  },
  {
    id: "athletics",
    name: "Athletic Department",
    role: "Teams, eligibility & schedules",
    department: "Athletics",
    email: "athletics@madonnahs.org",
    location: "Gymnasium office",
  },
  {
    id: "it-help",
    name: IT_HELP_DESK_NAME,
    role: "Devices, accounts & Wi-Fi",
    department: "Operations",
    email: IT_HELP_DESK_EMAIL,
    location: "Room 214",
    staffOnly: false,
  },
  {
    id: "advancement",
    name: "Advancement Office",
    role: "Enrollment, tuition & giving",
    department: "Administration",
    email: "advancement@madonnahs.org",
    location: "Room 104",
    staffOnly: true,
  },
];

// ---------------------------------------------------------------------------
// Resources & quick links
// ---------------------------------------------------------------------------

export type HubResourceLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  /** External links open in a new tab. */
  external?: boolean;
  /** When true, only staff roles see this resource. */
  staffOnly?: boolean;
};

export const HUB_RESOURCES: HubResourceLink[] = [
  {
    id: "calendar",
    label: "School Calendar",
    description: "Events, deadlines, and no-school days.",
    href: "/calendar",
  },
  {
    id: "forms",
    label: "Forms",
    description: "Published permission slips and school forms.",
    href: "/forms",
  },
  {
    id: "forms-center",
    label: "Digital Forms Center",
    description: "Sign and track your required agreements.",
    href: "/forms-center",
  },
  {
    id: "knowledge",
    label: "Knowledge Vault",
    description: "Handbook, policies, and how-to guides.",
    href: "/knowledge",
  },
  {
    id: "service-desk",
    label: "Service Desk",
    description: "IT requests via help desk email; facilities and academic in-app tickets.",
    href: "/service-desk",
  },
  {
    id: "community",
    label: "Community",
    description: "Broadcasts, campus feed, and celebrations.",
    href: "/community",
  },
  {
    id: "compliance",
    label: "Compliance Dashboard",
    description: "Track outstanding forms across the school.",
    href: "/admin/compliance",
    staffOnly: true,
  },
];

/** Compact quick links surfaced in the mobile-friendly action row. */
export const HUB_QUICK_LINKS: HubResourceLink[] = [
  { id: "ql-calendar", label: "Calendar", description: "", href: "/calendar" },
  { id: "ql-forms", label: "Forms", description: "", href: "/forms" },
  { id: "ql-knowledge", label: "Handbook", description: "", href: "/knowledge" },
  { id: "ql-service", label: "Service Desk", description: "", href: "/service-desk" },
  { id: "ql-community", label: "Announcements", description: "", href: "/community" },
];

// ---------------------------------------------------------------------------
// Explore Campus — launchpad to the major campus areas
// ---------------------------------------------------------------------------

export type HubExploreLink = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** When true, only staff roles see this destination. */
  staffOnly?: boolean;
};

export type HubExploreGroup = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  links: HubExploreLink[];
};

/**
 * Grouped destinations that turn the School Hub into a central launchpad for
 * every major area of campus. Routes mirror the global grouped navigation in
 * `src/config/navigation.ts`; keep the two in sync when routes move.
 */
export const HUB_EXPLORE_GROUPS: HubExploreGroup[] = [
  {
    id: "academics-athletics",
    label: "Academics & Athletics",
    description: "Academies, teams, and finding where you belong.",
    icon: GraduationCap,
    links: [
      {
        id: "academies",
        label: "Academies",
        description: "Courses, academic programs, and pathways of study.",
        href: "/academies",
        icon: GraduationCap,
      },
      {
        id: "athletics",
        label: "Athletics",
        description: "Teams, schedules, scores, and eligibility.",
        href: "/athletics",
        icon: Trophy,
      },
      {
        id: "find-your-place",
        label: "Find Your Place",
        description: "Clubs, organizations, and activities to join.",
        href: "/find-your-place",
        icon: Users,
      },
      {
        id: "my-journey",
        label: "My Journey",
        description: "Your personalized roadmap through Madonna.",
        href: "/my-journey",
        icon: Map,
      },
    ],
  },
  {
    id: "future-center",
    label: "Future Center",
    description: "College, careers, and life after Madonna.",
    icon: Compass,
    links: [
      {
        id: "pathways",
        label: "Career Pathways",
        description: "Explore careers and plan your next steps.",
        href: "/pathways",
        icon: Compass,
      },
      {
        id: "college-passport",
        label: "College Passport",
        description: "Track applications, visits, and deadlines.",
        href: "/college-passport",
        icon: GraduationCap,
      },
      {
        id: "opportunities",
        label: "Opportunities",
        description: "Internships, jobs, and real-world experiences.",
        href: "/opportunities",
        icon: Sparkles,
      },
      {
        id: "impact-fund",
        label: "Impact Fund",
        description: "Fund and launch student-led projects.",
        href: "/impact-fund",
        icon: CircleDollarSign,
      },
      {
        id: "corner",
        label: "Blue Don Corner",
        description: "The student store and campus marketplace.",
        href: "/corner",
        icon: CircleDollarSign,
      },
    ],
  },
  {
    id: "tools-resources",
    label: "Tools & Portfolios",
    description: "Everything you need to get things done.",
    icon: Briefcase,
    links: [
      {
        id: "ai",
        label: "Blue Don AI",
        description: "Your AI study buddy and campus assistant.",
        href: "/ai",
        icon: BookOpen,
      },
      {
        id: "knowledge",
        label: "Knowledge Vault",
        description: "Handbook, policies, and how-to guides.",
        href: "/knowledge",
        icon: BookOpen,
      },
      {
        id: "portfolio",
        label: "Portfolio",
        description: "Showcase your work and achievements.",
        href: "/portfolio",
        icon: Trophy,
      },
      {
        id: "career-portfolio",
        label: "Career Portfolio",
        description: "Build a resume and professional profile.",
        href: "/career-portfolio",
        icon: GraduationCap,
      },
      {
        id: "forms",
        label: "Forms",
        description: "Published permission slips and school forms.",
        href: "/forms",
        icon: ClipboardList,
      },
      {
        id: "forms-center",
        label: "Forms Center",
        description: "Sign and track your required agreements.",
        href: "/forms-center",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    id: "spirit-rewards",
    label: "Spirit & Rewards",
    description: "Service, school spirit, and a little fun.",
    icon: Sparkles,
    links: [
      {
        id: "service",
        label: "Service Center",
        description: "Log service hours and find opportunities.",
        href: "/service",
        icon: Heart,
      },
      {
        id: "rewards",
        label: "Rewards",
        description: "Earn and redeem Blue Don points.",
        href: "/rewards",
        icon: Sparkles,
      },
      {
        id: "arcade",
        label: "Arcade",
        description: "Games and challenges to unwind.",
        href: "/arcade",
        icon: Gamepad2,
      },
      {
        id: "traditions",
        label: "Traditions",
        description: "Celebrate Madonna's spirit and history.",
        href: "/traditions",
        icon: Flame,
      },
      {
        id: "community",
        label: "Community",
        description: "Broadcasts, campus feed, and celebrations.",
        href: "/community",
        icon: Megaphone,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Role helpers
// ---------------------------------------------------------------------------

const STAFF_ROLES: CampusRole[] = [
  "admin",
  "advisor",
  "teacher",
  "staff",
  "counselor",
  "coach",
];

/** Staff/faculty see extra administrative resources and directory detail. */
export function isStaffRole(role: CampusRole | null | undefined): boolean {
  return role != null && STAFF_ROLES.includes(role);
}
