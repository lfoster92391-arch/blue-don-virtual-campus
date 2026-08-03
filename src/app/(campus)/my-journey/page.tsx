import Link from "next/link";
import { CheckCircle2, Circle, Map } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  GRADUATION_CHECKLIST,
  JOURNEY_MILESTONES,
  MILESTONE_TYPE_LABELS,
  TIME_CAPSULE_ENTRIES,
  YEAR_IN_REVIEW_STATS,
} from "@/config/journey-engine";
import { getModuleShell } from "@/config/module-shells";
import { getClassTimeCapsules } from "@/services/madonna-culture-service";

export default function MyJourneyPage() {
  const config = getModuleShell("my-journey")!;
  const classCapsules = getClassTimeCapsules();

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/career-portfolio">
                Career Portfolio
                <Map className="size-3.5" />
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/portfolio">
                Portfolio
                <Map className="size-3.5" />
              </Link>
            }
          />
        </div>
      }
    >
      <DashboardCard
        title="Journey Timeline"
        description="Milestones computed from events, academies, service, and achievements."
        status={{ label: "Journey v1", variant: "info" }}
      >
        <ol className="relative space-y-0 border-l-2 border-[#2F80ED]/30 pl-6">
          {JOURNEY_MILESTONES.map((ms, i) => (
            <li key={ms.id} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[1.65rem] top-1 flex size-5 items-center justify-center rounded-full bg-[#2F80ED] text-[10px] font-bold text-white">
                {i + 1}
              </span>
              <div className="rounded-lg border border-border px-3 py-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{ms.title}</p>
                    <p className="text-sm text-muted-foreground">{ms.description}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{ms.dateLabel}</p>
                    {ms.xpEarned ? (
                      <p className="font-medium text-[#2F80ED]">+{ms.xpEarned} XP</p>
                    ) : null}
                  </div>
                </div>
                <span className="mt-2 inline-block rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {MILESTONE_TYPE_LABELS[ms.type]}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </DashboardCard>

      <DashboardCard
        title="Year in Review"
        description="Your highlights from this school year."
        status={{ label: "Journey v2", variant: "success" }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {YEAR_IN_REVIEW_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border px-3 py-3 text-center"
            >
              <span className="text-2xl">{stat.icon}</span>
              <p className="mt-1 text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Time Capsule"
          description="Reflections sealed each year — opened at graduation."
          status={{ label: "Journey v3", variant: "warning" }}
          actions={
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/time-capsule">Class capsules</Link>} />
          }
        >
          <ul className="space-y-3">
            {TIME_CAPSULE_ENTRIES.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border px-3 py-2.5">
                <p className="text-xs font-medium text-[#2F80ED]">{entry.gradeLabel}</p>
                <p className="mt-1 text-sm font-medium text-foreground">{entry.prompt}</p>
                <p className="mt-1 text-sm italic text-muted-foreground">
                  &ldquo;{entry.response}&rdquo;
                </p>
              </li>
            ))}
          </ul>
          {classCapsules.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Class contributions</p>
              <ul className="mt-2 space-y-2">
                {classCapsules.map((capsule) => (
                  <li key={capsule.classYear} className="text-sm text-foreground">
                    Class of {capsule.classYear}: {capsule.entries.length} sealed entries
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </DashboardCard>

        <DashboardCard
          title="Graduation Progress"
          description="Track cap & gown, essays, video, and time capsule."
          actions={
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/college-passport">College Readiness Passport</Link>}
            />
          }
        >
          <ul className="space-y-2">
            {GRADUATION_CHECKLIST.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm">
                  {item.completed ? (
                    <CheckCircle2 className="size-4 text-[#2E8B57]" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground" />
                  )}
                  <span className={item.completed ? "text-foreground" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </span>
                {item.dueLabel ? (
                  <span className="text-xs text-[#D4A017]">{item.dueLabel}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>
    </ShellPage>
  );
}
