import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  CloudSun,
  IdCard,
  Landmark,
  UserCheck,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { MadonnaSectionNav } from "@/components/madonna/madonna-hub-panels";
import { ShellPage } from "@/components/layout/shell-page";
import { BellScheduleWidget } from "@/components/school-hub/bell-schedule-widget";
import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  buildEmptyHubDigest,
  getTodayHubDigest,
} from "@/services/school-hub-service";

export const metadata = {
  title: "Madonna Campus",
  description:
    "Bell schedule, calendar, weather station, lunch on FuelTheDons, and the Madonna archive.",
};

type CampusLink = {
  href: string;
  label: string;
  body: string;
  icon: typeof Calendar;
};

const SHARED_LINKS: CampusLink[] = [
  {
    href: "/calendar",
    label: "Campus calendar",
    body: "Everything on the school calendar — games, meetings, and school events.",
    icon: Calendar,
  },
  {
    href: "/weather",
    label: "Weather station",
    body: `Live conditions for ${CAMPUS_WEATHER_LOCATION.city}, plus the athletics and outdoor read.`,
    icon: CloudSun,
  },
  {
    href: "/archive",
    label: "Madonna archive",
    body: "Yearbooks, collections, and the pieces of campus history we have on file.",
    icon: BookOpen,
  },
  {
    href: "/history",
    label: "Madonna history",
    body: "The Blue Don timeline, from the founding forward.",
    icon: Landmark,
  },
];

const PARENT_LINKS: CampusLink[] = [
  {
    href: "/parent",
    label: "Parent Portal",
    body: "Your linked students, agreements waiting for a signature, and club permission requests.",
    icon: UserCheck,
  },
  {
    href: "/parent/guide",
    label: "Parent Guide",
    body: "Setting up your account, what a parent account can do, and who to call about what.",
    icon: BookOpen,
  },
];

const STUDENT_LINKS: CampusLink[] = [
  {
    href: "/pass",
    label: "Blue Don Pass",
    body: "Your campus pass and QR code.",
    icon: IdCard,
  },
];

/** Soft-fail wrapper — the schedule card should not take the page down. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-campus] data failed:", error);
    return fallback;
  }
}

export default async function MadonnaCampusPage() {
  const user = await requireCompleteProfile();
  const isParent = user.role === "parent";

  const hub = await safe(
    getTodayHubDigest({ id: user.id, role: user.role }),
    buildEmptyHubDigest(),
  );

  const links = [
    ...SHARED_LINKS,
    ...(isParent ? PARENT_LINKS : STUDENT_LINKS),
  ];

  return (
    <ShellPage
      title="Campus"
      description={
        isParent
          ? "School information in one place — the bell schedule, the calendar, lunch, and the parent guide."
          : "School information in one place — the bell schedule, the calendar, the weather station, lunch, and the Madonna archive."
      }
    >
      <MadonnaSectionNav active="campus" />

      <DashboardCard
        title="Bell schedule"
        description={
          hub.isSchoolDay
            ? `${hub.schoolYear} · Regular bell schedule · ${hub.dateLabel}`
            : `Weekend — no regular class periods · ${hub.dateLabel}`
        }
        icon={<Clock className="size-5" />}
      >
        <BellScheduleWidget schedule={hub.bell} isSchoolDay={hub.isSchoolDay} />
      </DashboardCard>

      <FuelTheDonsRow />

      <div className="grid gap-4 sm:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#2F80ED]/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 font-semibold text-[#0A2342] dark:text-white">
                  {link.label}
                  <ArrowRight
                    className="size-3.5 text-[#2F80ED] transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {link.body}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </ShellPage>
  );
}
