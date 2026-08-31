import Link from "next/link";
import { CalendarDays, Clock, Cloud, Landmark, Megaphone } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import {
  MadonnaHubHeader,
  MadonnaSectionNav,
  WhatsHappening,
} from "@/components/madonna/madonna-hub-panels";
import { BellScheduleWidget } from "@/components/school-hub/bell-schedule-widget";
import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import { getTodayInMadonnaHistory } from "@/services/madonna-culture-service";
import { getActiveLiveStream } from "@/services/media-service";
import {
  buildEmptyHubDigest,
  getTodayHubDigest,
} from "@/services/school-hub-service";
import { getCurrentOrNextGame } from "@/services/sports-highlights-service";

export const metadata = {
  title: "Today at Madonna",
  description:
    "Today's bell schedule, campus weather, and the announcement from Broadcasting.",
};

/** Soft-fail wrapper — a missing panel beats a 500 on a daily-use page. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-today] data failed:", error);
    return fallback;
  }
}

export default async function MadonnaTodayPage() {
  const user = await requireCompleteProfile();
  const firstName = user.firstName ?? user.displayName.split(" ")[0] ?? "Don";
  const isParent = user.role === "parent";

  const [hub, announcement, activeLive, schedule, nextGame] = await Promise.all([
    safe(
      getTodayHubDigest({ id: user.id, role: user.role }),
      buildEmptyHubDigest(),
    ),
    safe(getTodaysBroadcastAnnouncement(), null),
    safe(getActiveLiveStream(), null),
    safe(getBroadcastSchedule(), null),
    safe(getCurrentOrNextGame({ withinHours: 24 * 14 }), null),
  ]);

  const snapshot = hub.weather.available ? hub.weather : hub.weather.lastKnown;
  const history = getTodayInMadonnaHistory(hub.today);

  return (
    <section className="flex flex-1 flex-col gap-6">
      <MadonnaHubHeader
        firstName={firstName}
        dateLabel={hub.dateLabel}
        weather={hub.weather}
        isLive={Boolean(activeLive)}
        subtitle={
          isParent
            ? "What your student's day looks like at Madonna today."
            : "Your day at Madonna — where you are in the schedule, and what the campus is saying."
        }
      />

      <MadonnaSectionNav active="today" />

      <DashboardCard
        title="Today's announcement"
        description="The daily message from Broadcasting Studio B."
        icon={<Megaphone className="size-5" />}
        status={
          announcement
            ? { label: "Posted", variant: "success" }
            : { label: "Not posted yet", variant: "info" }
        }
        actions={
          <Link
            href="/madonna/broadcast"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Archive
          </Link>
        }
      >
        {announcement ? (
          <div>
            <p className="font-semibold text-[#0A2342] dark:text-white">
              {announcement.title}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {announcement.body}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              {announcement.authorName}
              {" · "}
              {announcement.announcementDate.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Broadcasting has not published today&apos;s announcement yet. It
            appears here the moment they do — nothing is filled in for them.
          </p>
        )}
      </DashboardCard>

      <DashboardCard
        title="Bell schedule"
        description={
          hub.isSchoolDay
            ? `${hub.schoolYear} · Regular bell schedule`
            : "Weekend — no regular class periods"
        }
        icon={<Clock className="size-5" />}
      >
        <BellScheduleWidget schedule={hub.bell} isSchoolDay={hub.isSchoolDay} />
      </DashboardCard>

      <WhatsHappening
        nextGame={nextGame}
        activeLiveTitle={activeLive?.title ?? null}
        nextAirAt={schedule?.nextAirAt ?? null}
      />

      <FuelTheDonsRow />

      <DashboardCard
        title="Campus weather"
        description={`Live conditions for ${CAMPUS_WEATHER_LOCATION.city}, ${CAMPUS_WEATHER_LOCATION.state}.`}
        icon={<Cloud className="size-5" />}
        actions={
          <Link
            href="/weather"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Weather station
          </Link>
        }
      >
        {snapshot ? (
          <div>
            <p className="text-2xl font-semibold tabular-nums text-[#0A2342] dark:text-white">
              {snapshot.temperatureF}°F
              <span className="ml-2 text-base font-medium text-muted-foreground">
                {snapshot.conditionLabel}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              UV {snapshot.uvIndex} ({snapshot.uvLabel}) · Wind{" "}
              {snapshot.windSpeedMph} mph · {snapshot.precipitationPercent}%
              precip
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Athletics: {snapshot.athleticLabel} · {snapshot.recessLabel}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {hub.weather.available
              ? "Loading conditions…"
              : hub.weather.message}
          </p>
        )}
      </DashboardCard>

      <DashboardCard
        title="Today in Madonna history"
        description="Moments from the Blue Don story that share today's date."
        icon={<Landmark className="size-5" />}
        actions={
          <Link
            href="/history"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Full timeline
          </Link>
        }
      >
        {history.length > 0 ? (
          <ul className="space-y-3">
            {history.map((entry) => (
              <li
                key={`${entry.month}-${entry.day}-${entry.title}`}
                className="rounded-xl border border-border bg-card px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-[#0A2342] dark:text-white">
                    {entry.title}
                  </p>
                  {entry.year ? (
                    <span className="shrink-0 text-xs font-semibold text-[#C9A227]">
                      {entry.year}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {entry.description}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing recorded for today&apos;s date yet.
          </p>
        )}
      </DashboardCard>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/calendar"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          <CalendarDays className="size-3.5" aria-hidden="true" />
          Campus calendar
        </Link>
        <Link
          href="/home"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Your Command Center
        </Link>
      </div>
    </section>
  );
}
