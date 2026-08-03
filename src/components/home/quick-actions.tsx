import Link from "next/link";
import {
  CircleDollarSign,
  GraduationCap,
  Heart,
  LayoutGrid,
  Stamp,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  COLLEGE_READINESS_GRADE_MAX,
  COLLEGE_READINESS_GRADE_MIN,
} from "@/config/college-readiness-passport";
import { BLUE_DON_PASS } from "@/config/identity-engine";
import type { CampusRole } from "@/config/roles";
import { isFacultyClubLookupRole } from "@/config/roles";
import type { StudentContext } from "@/services/student-context-service";

type QuickAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  emoji: string;
};

export function QuickActions({
  context,
  role,
}: {
  context: StudentContext;
  role: CampusRole;
}) {
  const facultyLookup = isFacultyClubLookupRole(role);
  const primaryClub = context.clubs[0];
  const primaryClass = context.classes[0];
  const gradeLevel = Number.parseInt(BLUE_DON_PASS.grade, 10);
  const showCollegePassport =
    !Number.isFinite(gradeLevel) ||
    (gradeLevel >= COLLEGE_READINESS_GRADE_MIN &&
      gradeLevel <= COLLEGE_READINESS_GRADE_MAX);

  const actions: QuickAction[] = facultyLookup
    ? [
        {
          label: "All Clubs",
          href: "/find-your-place",
          icon: Users,
          emoji: "🏫",
        },
        {
          label: primaryClub?.name ?? "My advised club",
          href: primaryClub?.href ?? "/find-your-place",
          icon: Users,
          emoji: primaryClub?.icon ?? "👥",
        },
        { label: "Events", href: "/events", icon: Trophy, emoji: "📅" },
        { label: "Calendar", href: "/calendar", icon: LayoutGrid, emoji: "🗓" },
        { label: "Forms", href: "/forms", icon: GraduationCap, emoji: "📋" },
        { label: "Knowledge Vault", href: "/knowledge", icon: Target, emoji: "📚" },
        ...(role === "teacher"
          ? [
              {
                label: "Class wishlists",
                href: "/teacher/wishlists",
                icon: CircleDollarSign,
                emoji: "📝",
              } satisfies QuickAction,
            ]
          : []),
      ]
    : [
    { label: "Service Hours", href: "/service", icon: Heart, emoji: "❤️" },
    {
      label: primaryClub?.name ?? "My Clubs",
      href: primaryClub?.href ?? "/find-your-place",
      icon: Users,
      emoji: primaryClub?.icon ?? "👥",
    },
    {
      label: primaryClass?.name ?? "My Class",
      href: primaryClass?.href ?? "/find-your-place",
      icon: GraduationCap,
      emoji: primaryClass?.icon ?? "🎓",
    },
    { label: "Athletics", href: "/athletics", icon: Trophy, emoji: "🏈" },
    { label: "Blue Don Corner", href: "/corner", icon: CircleDollarSign, emoji: "🛍" },
    ...(showCollegePassport
      ? [
          {
            label: "College Passport",
            href: "/college-passport",
            icon: Stamp,
            emoji: "🎓",
          } satisfies QuickAction,
        ]
      : []),
    { label: "Daily Challenge", href: "#campus-challenge", icon: Target, emoji: "🎯" },
    { label: "View All", href: "/find-your-place", icon: LayoutGrid, emoji: "➕" },
  ];

  return (
    <section aria-label="Quick actions">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <li key={action.label} className="min-w-0">
              <Link
                href={action.href}
                className="flex h-full w-full min-w-0 flex-col items-start gap-2 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-lg">
                  <span aria-hidden="true">{action.emoji}</span>
                </span>
                <span className="flex w-full min-w-0 items-center gap-1.5 text-sm font-medium text-[#0A2342] dark:text-white">
                  <Icon className="size-3.5 shrink-0 text-[#2F80ED]" aria-hidden="true" />
                  <span className="truncate">{action.label}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
