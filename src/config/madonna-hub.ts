import {
  CalendarDays,
  HandHeart,
  Landmark,
  Radio,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import type { CampusRole } from "@/config/roles";

/**
 * The five sections of the Madonna Hub — the student digital front door.
 *
 * One source of truth for the hub tiles, the sidebar group, and the section
 * headers, so the sidebar cannot drift from the pages. See docs/MADONNA_HUB.md.
 */
export type MadonnaSectionKey =
  | "today"
  | "sports"
  | "broadcast"
  | "campus"
  | "participate";

export type MadonnaHubSection = {
  key: MadonnaSectionKey;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Small line above the title on a tile. */
  eyebrow: string;
  /** Student framing. */
  description: string;
  /** Parent framing — same page, different reason to open it. */
  parentDescription: string;
};

export const MADONNA_HUB_SECTIONS: readonly MadonnaHubSection[] = [
  {
    key: "today",
    label: "Today",
    href: "/madonna/today",
    icon: CalendarDays,
    eyebrow: "Right now",
    description:
      "Your day in one page — the bell schedule, campus weather, and today's announcement from Broadcasting.",
    parentDescription:
      "What your student's day looks like — bell schedule, campus weather, and today's announcement.",
  },
  {
    key: "sports",
    label: "Sports",
    href: "/madonna/sports",
    icon: Trophy,
    eyebrow: "Blue Don athletics",
    description:
      "Scores, schedules, and every game video the Broadcasting crew publishes.",
    parentDescription:
      "Game schedules and results, plus recap video from student coverage.",
  },
  {
    key: "broadcast",
    label: "Broadcast",
    href: "/madonna/broadcast",
    icon: Radio,
    eyebrow: "Blue Don Live",
    description:
      "The live stream when Studio B is on air, today's announcement, and the full announcement archive.",
    parentDescription:
      "Watch the student broadcast live or catch up on any past announcement show.",
  },
  {
    key: "campus",
    label: "Campus",
    href: "/madonna/campus",
    icon: Landmark,
    eyebrow: "School info",
    description:
      "Bell schedule, calendar, weather station, lunch, and the Madonna archive.",
    parentDescription:
      "Bell schedule, calendar, lunch on FuelTheDons, agreements, and the parent guide.",
  },
  {
    key: "participate",
    label: "Participate",
    href: "/madonna/participate",
    icon: HandHeart,
    eyebrow: "Get involved",
    description:
      "Submit an announcement, cover a game, join a club, or ask the help desk for something.",
    parentDescription:
      "How your student gets on air, on the field, or into a club — and where to ask for help.",
  },
] as const;

export function getMadonnaSection(key: MadonnaSectionKey): MadonnaHubSection {
  const section = MADONNA_HUB_SECTIONS.find((entry) => entry.key === key);
  if (!section) {
    throw new Error(`Unknown Madonna Hub section: ${key}`);
  }
  return section;
}

/** Parents get parent-oriented copy on the same five sections. */
export function describeMadonnaSection(
  section: MadonnaHubSection,
  role: CampusRole,
): string {
  return role === "parent" ? section.parentDescription : section.description;
}
