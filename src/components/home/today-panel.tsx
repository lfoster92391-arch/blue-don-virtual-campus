import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CLEAN_SLATE, FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import { CURRENT_CAMPUS_CHALLENGE } from "@/config/campus-challenge";
import type { BlueDonOSViewModel, TodayDigestItem } from "@/services/campus-os-service";
import type { StudentContext } from "@/services/student-context-service";

function ItemIcon({ type }: { type: TodayDigestItem["type"] }) {
  if (type === "event") {
    return <CalendarDays className="size-4 text-[#2F80ED]" aria-hidden="true" />;
  }

  if (type === "assignment") {
    return <ClipboardList className="size-4 text-[#C9A227]" aria-hidden="true" />;
  }

  return <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />;
}

export function TodayPanel({
  digest,
  context,
}: {
  digest: BlueDonOSViewModel;
  context: StudentContext;
}) {
  const items = digest.items.filter((item) => item.type !== "campus").slice(0, 6);
  const challenge = CURRENT_CAMPUS_CHALLENGE;
  const hasCommunities =
    context.clubs.length + context.teams.length + context.classes.length > 0;
  // Clean slate: no seeded XP, fundraiser progress, birthdays, or featured
  // challenge — these fill in once real activity and data exist.
  const hasClubs = context.clubs.length > 0 && !CLEAN_SLATE;
  const weeklyXpLabel = hasCommunities && !CLEAN_SLATE ? "+120 XP" : "+0 XP";

  return (
    <div className="space-y-6">
      <DashboardCard
        title="📅 Today"
        description={`${digest.eventCount} event${digest.eventCount === 1 ? "" : "s"} · ${digest.assignmentCount} due`}
      >
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing scheduled today. Enjoy a lighter day, or explore what&apos;s next.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <ItemIcon type={item.type} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium break-words text-[#0A2342] dark:text-white">
                    {item.title}
                  </p>
                  {item.subtitle ? (
                    <p className="text-xs break-words text-muted-foreground">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
                {item.timeLabel ? (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.timeLabel}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {!FOCUSED_CLUBS_MODE ? (
      <DashboardCard title="⭐ XP & Rewards">
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">This week</span>
            <span className="font-semibold text-[#0A2342] dark:text-white">
              {weeklyXpLabel}
            </span>
          </div>
          {!hasCommunities ? (
            <p className="text-xs text-muted-foreground">
              Join a club or team to start earning XP and badges.
            </p>
          ) : null}
          <Link
            href="/rewards"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
          >
            View rewards
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </DashboardCard>
      ) : null}
      {hasClubs ? (
        <DashboardCard title="📈 Club Fundraiser">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">
                Interact spring drive
              </span>
              <span className="shrink-0 font-semibold text-[#0A2342] dark:text-white">
                72%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-[#2E8B57]" style={{ width: "72%" }} />
            </div>
          </div>
        </DashboardCard>
      ) : null}

      <DashboardCard title="🎂 Birthdays">
        <p className="text-sm text-muted-foreground">
          {CLEAN_SLATE
            ? "No birthdays to celebrate yet."
            : "Celebrate 2 classmates today — send a note in Messages."}
        </p>
      </DashboardCard>

      {!CLEAN_SLATE ? (
      <div id="campus-challenge">
        <DashboardCard
          title="🏆 Current Challenge"
          status={{ label: challenge.endsLabel, variant: "warning" }}
        >
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-[#0A2342] dark:text-white">
                {challenge.title}
              </p>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-[#0A2342] dark:text-white">
                  {challenge.progress}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#C9A227]"
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {challenge.rewards.map((reward) => (
                <span
                  key={reward}
                  className="rounded-full bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-medium text-[#0A2342] dark:text-white"
                >
                  {reward}
                </span>
              ))}
            </div>
          </div>
        </DashboardCard>
      </div>
      ) : null}
    </div>
  );
}
