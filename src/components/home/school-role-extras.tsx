import Link from "next/link";
import { ClipboardList, KeyRound, ShoppingBag, Users } from "lucide-react";

import {
  canAccessAdmin,
  canAccessCoachWorkspace,
  isFacultyClubLookupRole,
} from "@/config/roles";
import type { CampusRole } from "@/config/roles";
import type { StudentContext } from "@/services/student-context-service";
import type { CampusUser } from "@/types/auth";

export function SchoolRoleExtras({
  user,
  context,
  viewRole,
}: {
  user: CampusUser;
  context: StudentContext;
  /** Home density while an admin is viewing as another persona. */
  viewRole?: CampusRole;
}) {
  const role = viewRole ?? user.role;
  const extras: { href: string; label: string; blurb: string; icon: typeof Users }[] =
    [];

  if (role === "student" || role === "parent") {
    extras.push({
      href: "/shop",
      label: "Shop",
      blurb: "Cricut Club · Coming soon",
      icon: ShoppingBag,
    });
  }

  if (role === "student" && context.clubs.length > 0) {
    for (const club of context.clubs.slice(0, 3)) {
      extras.push({
        href: club.href,
        label: club.name,
        blurb: "Your club",
        icon: Users,
      });
    }
  }

  if (canAccessCoachWorkspace(role)) {
    extras.push({
      href: "/coach",
      label: "Coach desk",
      blurb: "Film, roster, and scores",
      icon: ClipboardList,
    });
  }

  if (canAccessAdmin(role)) {
    extras.push({
      href: "/admin/students",
      label: "Students",
      blurb: "Student accounts",
      icon: Users,
    });
    extras.push({
      href: "/admin/passwords",
      label: "Reset passwords",
      blurb: "Office password help",
      icon: KeyRound,
    });
  }

  if (isFacultyClubLookupRole(role) && role !== "student") {
    extras.push({
      href: "/clubs",
      label: "Browse clubs",
      blurb: "Every campus club",
      icon: Users,
    });
  }

  if (extras.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Your tools" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {extras.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#0A2342] dark:text-white">
                {item.label}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {item.blurb}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
