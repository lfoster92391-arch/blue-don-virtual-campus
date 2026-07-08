import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Map,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { Button } from "@/components/ui/button";
import type { BlueDonOSViewModel, TodayDigestItem } from "@/services/campus-os-service";
import type { CampusUser } from "@/types/auth";

type BlueDonOSProps = {
  user: CampusUser;
  digest: BlueDonOSViewModel;
};

const quickDestinations = [
  { label: "My Journey", href: "/my-journey", icon: Map },
  { label: "Academies", href: "/academies", icon: GraduationCap },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Forms", href: "/forms", icon: ClipboardList },
] as const;

function DigestItemIcon({ type }: { type: TodayDigestItem["type"] }) {
  if (type === "event") {
    return <CalendarDays className="size-4 text-[#2F80ED]" aria-hidden="true" />;
  }

  if (type === "assignment") {
    return <ClipboardList className="size-4 text-[#C9A227]" aria-hidden="true" />;
  }

  return <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />;
}

export function BlueDonOS({ user, digest }: BlueDonOSProps) {
  const headlineItems = digest.items.filter((item) => item.type !== "campus");

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DashboardHero user={user} />

      <section aria-labelledby="today-heading" className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCard
            title="Today at Madonna"
            description={`${digest.eventCount} event${digest.eventCount === 1 ? "" : "s"} · ${digest.assignmentCount} due today`}
          >
            {headlineItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events or deadlines on your schedule today. Check the calendar or
                explore academies for what&apos;s next.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {headlineItems.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 py-3 transition-colors hover:text-[#0A2342] dark:hover:text-white"
                      >
                        <DigestItemIcon type={item.type} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{item.title}</p>
                          {item.subtitle ? (
                            <p className="text-sm text-muted-foreground">
                              {item.subtitle}
                            </p>
                          ) : null}
                        </div>
                        {item.timeLabel ? (
                          <span className="shrink-0 text-sm text-muted-foreground">
                            {item.timeLabel}
                          </span>
                        ) : null}
                      </Link>
                    ) : (
                      <div className="flex items-start gap-3 py-3">
                        <DigestItemIcon type={item.type} />
                        <div>
                          <p className="font-medium">{item.title}</p>
                          {item.subtitle ? (
                            <p className="text-sm text-muted-foreground">
                              {item.subtitle}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="mt-4" nativeButton={false} render={
              <Link href="/calendar">
                Open calendar
                <ArrowRight className="size-4" />
              </Link>
            } />
          </DashboardCard>
        </div>

        <DashboardCard title="Quick destinations" description="Jump into your campus">
          <div className="grid gap-2">
            {quickDestinations.map((destination) => {
              const Icon = destination.icon;

              return (
                <Button
                  key={destination.href}
                  variant="secondary"
                  className="justify-start gap-2"
                  nativeButton={false}
                  render={
                    <Link href={destination.href}>
                      <Icon className="size-4" aria-hidden="true" />
                      {destination.label}
                    </Link>
                  }
                />
              );
            })}
          </div>
        </DashboardCard>
      </section>
    </div>
  );
}
