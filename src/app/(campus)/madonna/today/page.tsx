import Link from "next/link";
import { CalendarDays, Cloud, Landmark, Megaphone } from "lucide-react";

import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import {
  MadonnaHubHeader,
  MadonnaSectionNav,
  WhatsHappening,
} from "@/components/madonna/madonna-hub-panels";
import { Button } from "@/components/ui/button";
import { PageDropdown } from "@/components/ui/page-dropdown";
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
    "Campus weather and the announcement from Broadcasting.",
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
    <section className="flex flex-1 flex-col gap-4">
      <MadonnaHubHeader
        firstName={firstName}
        dateLabel={hub.dateLabel}
        weather={hub.weather}
        isLive={Boolean(activeLive)}
        subtitle={
          isParent
            ? "What your student's day looks like at Madonna today."
            : "Your day at Madonna — weather, lunch, and what the campus is saying."
        }
      />

      <MadonnaSectionNav active="today" />

      <PageDropdown
        id="announcement"
        title="Today's announcement"
        description="The daily message from Broadcasting."
        eyebrow="Broadcasting"
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
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
              <Megaphone className="size-3.5" aria-hidden="true" />
              Posted
            </p>
            <p className="mt-2 font-semibold text-[#0A2342] dark:text-white">
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
      </PageDropdown>

      <PageDropdown
        id="happening"
        title="What's happening"
        description="The next game and the next broadcast."
      >
        <WhatsHappening
          nextGame={nextGame}
          activeLiveTitle={activeLive?.title ?? null}
          nextAirAt={schedule?.nextAirAt ?? null}
        />
      </PageDropdown>

      <PageDropdown
        id="lunch"
        title="Lunch"
        description="Menus and ordering on FuelTheDons."
      >
        <FuelTheDonsRow />
      </PageDropdown>

      <PageDropdown
        id="weather"
        title="Campus weather"
        description={`Live conditions for ${CAMPUS_WEATHER_LOCATION.city}, ${CAMPUS_WEATHER_LOCATION.state}.`}
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
            <p className="flex items-center gap-2 text-2xl font-semibold tabular-nums text-[#0A2342] dark:text-white">
              <Cloud className="size-5 text-[#2F80ED]" aria-hidden="true" />
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
      </PageDropdown>

      <PageDropdown
        id="madonna-history"
        title="Today in Madonna history"
        description="Moments from the Blue Don story that share today's date."
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
                  <p className="flex items-center gap-2 font-semibold text-[#0A2342] dark:text-white">
                    <Landmark className="size-4 shrink-0 text-[#C9A227]" aria-hidden="true" />
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
      </PageDropdown>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="action"
          nativeButton={false}
          render={
            <Link href="/calendar">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              Campus calendar
            </Link>
          }
        />
        <Button
          variant="action"
          nativeButton={false}
          render={<Link href="/home">Your Command Center</Link>}
        />
      </div>
    </section>
  );
}
