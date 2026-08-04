import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Cloud,
  Cross,
  Lightbulb,
  Megaphone,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import { BriefingSection } from "@/components/home/briefing-section";
import { AdvisorMessagesPanel } from "@/components/home/advisor-messages-panel";
import { ClubOpsPulsePanel } from "@/components/home/club-ops-pulse";
import { CommandCenterMeetings } from "@/components/home/command-center-meetings";
import { CommandCenterTasks } from "@/components/home/command-center-tasks";
import { BellScheduleWidget } from "@/components/school-hub/bell-schedule-widget";
import { CAMPUS_FEED } from "@/config/campus-feed";
import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import {
  getDailyDiscovery,
  splitBrainGame,
  type DiscoveryItem,
} from "@/config/daily-discovery";
import type {
  ClubStudentTaskView,
  CommandCenterMeetingView,
  StudentMessageView,
} from "@/lib/command-center";
import { cn } from "@/lib/utils";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type { ClubOpsPulse } from "@/services/club-ops-pulse-service";
import { getTodayInMadonnaHistory } from "@/services/madonna-culture-service";
import type { HubDigest } from "@/services/school-hub-service";
import {
  getCampusWeatherAlerts,
  type CampusWeather,
} from "@/services/weather-service";
import type { CampusUser } from "@/types/auth";

type TodayAtMadonnaProps = {
  user: CampusUser;
  hub: HubDigest;
  announcement: BroadcastAnnouncementView | null;
  messages?: StudentMessageView[];
  meetings?: CommandCenterMeetingView[];
  tasks?: ClubStudentTaskView[];
  opsPulse?: ClubOpsPulse | null;
};

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function DiscoveryBriefCard({
  item,
  icon,
  hideBrainAnswer = false,
}: {
  item: DiscoveryItem;
  icon: ReactNode;
  hideBrainAnswer?: boolean;
}) {
  const body =
    hideBrainAnswer && item.key === "brain"
      ? splitBrainGame(item.body).prompt
      : item.body;

  return (
    <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
            {item.label}
          </p>
          <h3 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            {item.title}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
          {hideBrainAnswer && item.key === "brain" ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Think it through — the answer is in today&apos;s briefing archive
              tomorrow.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function WeatherBriefing({ weather }: { weather: CampusWeather }) {
  const snapshot = weather.available ? weather : weather.lastKnown;
  const alerts = getCampusWeatherAlerts(weather);

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div
          key={alert.title}
          className={cn(
            "flex gap-3 rounded-xl border px-4 py-3",
            alert.severity === "warning" &&
              "border-[#C0392B]/30 bg-[#C0392B]/8 text-[#C0392B]",
            alert.severity === "watch" &&
              "border-[#D4A017]/35 bg-[#D4A017]/10 text-[#8A6A00]",
            alert.severity === "info" &&
              "border-border bg-muted/40 text-muted-foreground",
          )}
          role="status"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{alert.title}</p>
            <p className="mt-0.5 text-sm opacity-90">{alert.message}</p>
          </div>
        </div>
      ))}

      <Link
        href="/weather"
        className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#2F80ED]/40 sm:flex-row sm:items-center"
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#2F80ED]/10">
          <Cloud className="size-6 text-[#2F80ED]" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          {snapshot ? (
            <>
              <p className="text-2xl font-semibold tabular-nums text-[#0A2342] dark:text-white">
                {snapshot.temperatureF}°F
                <span className="ml-2 text-base font-medium text-muted-foreground">
                  {snapshot.conditionLabel}
                </span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {CAMPUS_WEATHER_LOCATION.city}, {CAMPUS_WEATHER_LOCATION.state} · UV{" "}
                {snapshot.uvIndex} ({snapshot.uvLabel}) · Wind{" "}
                {snapshot.windSpeedMph} mph · {snapshot.precipitationPercent}% precip
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Athletics: {snapshot.athleticLabel} · {snapshot.recessLabel}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {weather.available ? "Loading…" : weather.message}
            </p>
          )}
        </div>
        <span className="text-sm font-medium text-[#2F80ED] group-hover:underline">
          Full station →
        </span>
      </Link>
    </div>
  );
}

function AnnouncementsBriefing({
  announcement,
}: {
  announcement: BroadcastAnnouncementView | null;
}) {
  const feedPosts = CAMPUS_FEED.slice(0, 4);
  const hasContent = Boolean(announcement) || feedPosts.length > 0;

  if (!hasContent) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-8 text-center">
        <Megaphone
          className="mx-auto size-6 text-muted-foreground/60"
          aria-hidden="true"
        />
        <p className="mt-3 text-sm font-medium text-[#0A2342] dark:text-white">
          No announcements yet today
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Morning announcements from Broadcasting and campus posts will appear
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {announcement ? (
        <article className="rounded-xl border border-[#C9A227]/35 bg-gradient-to-br from-[#C9A227]/10 to-transparent p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
            <Megaphone className="size-3.5" aria-hidden="true" />
            Broadcasting · Daily announcement
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[#0A2342] dark:text-white">
            {announcement.title}
          </h3>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
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
          <Link
            href="/media"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Watch Broadcasting
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </article>
      ) : null}

      {feedPosts.map((post) => {
        const inner = (
          <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span aria-hidden="true">{post.emoji}</span>
              <span className="font-medium text-[#0A2342] dark:text-white">
                {post.source}
              </span>
              <span aria-hidden="true">·</span>
              <span>{post.timeLabel}</span>
            </div>
            <h3 className="mt-2 font-semibold text-[#0A2342] dark:text-white">
              {post.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>
          </article>
        );

        return (
          <div key={post.id}>
            {post.href ? <Link href={post.href}>{inner}</Link> : inner}
          </div>
        );
      })}
    </div>
  );
}

function MadonnaHistoryBriefing({ date }: { date: Date }) {
  const entries = getTodayInMadonnaHistory(date);

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 px-5 py-6 text-sm text-muted-foreground">
        No historical entries for today yet — check back as we grow the archive.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li
          key={`${entry.month}-${entry.day}-${entry.title}`}
          className="rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
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
          <p className="mt-1 text-sm text-muted-foreground">{entry.description}</p>
        </li>
      ))}
    </ul>
  );
}

/** Focused-mode home — Command Center + “Today at Madonna” campus briefing. */
export function TodayAtMadonna({
  user,
  hub,
  announcement,
  messages = [],
  meetings = [],
  tasks = [],
  opsPulse = null,
}: TodayAtMadonnaProps) {
  const preferredName =
    user.firstName ?? user.displayName.split(" ")[0] ?? user.displayName;
  const hour = new Date().getHours();
  const discovery = getDailyDiscovery(hub.today);
  const byKey = Object.fromEntries(discovery.map((item) => [item.key, item]));
  const brain = byKey.brain;
  const fact = byKey.fact;
  const word = byKey.word;
  const saint = byKey.saint;

  return (
    <div className="flex flex-1 flex-col gap-0">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] via-[#0A2342] to-[#14365f] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
            Madonna High School · Command Center
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Today at Madonna
          </h1>
          <p className="text-sm text-[#C6CCD6] sm:text-base">
            {getGreeting(hour)}, {preferredName}. Your hub for advisor messages,
            club meetings, tasks, and the daily campus briefing.
          </p>
          <p className="text-sm text-[#C6CCD6]/80">{hub.dateLabel}</p>
        </div>
        <div
          className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-[#C9A227]/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-12 left-1/4 size-40 rounded-full bg-[#2F80ED]/20 blur-3xl"
          aria-hidden="true"
        />
      </header>

      <div className="mt-6 space-y-4">
        {opsPulse ? <ClubOpsPulsePanel pulse={opsPulse} /> : null}
        <AdvisorMessagesPanel messages={messages} />
        <div className="grid gap-4 lg:grid-cols-2">
          <CommandCenterMeetings meetings={meetings} />
          <CommandCenterTasks tasks={tasks} />
        </div>
      </div>

      <div className="mt-8 space-y-0 rounded-2xl border border-border bg-card/40 px-4 py-6 sm:px-6 sm:py-8">
        <BriefingSection
          id="weather"
          eyebrow="01"
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
          <WeatherBriefing weather={hub.weather} />
        </BriefingSection>

        <BriefingSection
          id="schedule"
          eyebrow="02"
          title="Today's schedule"
          description={
            hub.isSchoolDay
              ? `${hub.schoolYear} · Regular bell schedule`
              : "Weekend — no regular class periods"
          }
        >
          <BellScheduleWidget
            schedule={hub.bell}
            isSchoolDay={hub.isSchoolDay}
          />
          {hub.lunch.today ? (
            <p className="mt-4 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Lunch today:</span>{" "}
              {hub.lunch.today.entree}
              {hub.lunch.today.sides.length
                ? ` with ${hub.lunch.today.sides.join(", ")}`
                : ""}
            </p>
          ) : null}
        </BriefingSection>

        <BriefingSection
          id="announcements"
          eyebrow="03"
          title="Announcements"
          description="Morning message and campus posts."
        >
          <AnnouncementsBriefing announcement={announcement} />
        </BriefingSection>

        <BriefingSection
          id="madonna-history"
          eyebrow="04"
          title="Today in Madonna History"
          description="Moments from our Blue Don story."
          actions={
            <Link
              href="/history"
              className="text-sm font-medium text-[#2F80ED] hover:underline"
            >
              Full timeline
            </Link>
          }
        >
          <MadonnaHistoryBriefing date={hub.today} />
        </BriefingSection>

        {brain ? (
          <BriefingSection
            id="daily-discovery"
            eyebrow="05"
            title="Daily Discovery"
            description="A quick puzzle to wake up the mind."
          actions={
            <Link
              href="/home#daily-discovery"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
            >
              On this page
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
          >
            <DiscoveryBriefCard
              item={brain}
              icon={<Sparkles className="size-5" aria-hidden="true" />}
              hideBrainAnswer
            />
          </BriefingSection>
        ) : null}

        {fact ? (
          <BriefingSection
            id="fun-fact"
            eyebrow="06"
            title="Fun Fact"
            description="Something surprising to share at lunch."
          >
            <DiscoveryBriefCard
              item={fact}
              icon={<Lightbulb className="size-5" aria-hidden="true" />}
            />
          </BriefingSection>
        ) : null}

        {word ? (
          <BriefingSection
            id="word-of-the-day"
            eyebrow="07"
            title="Word of the Day"
            description="Build your vocabulary one word at a time."
          >
            <DiscoveryBriefCard
              item={word}
              icon={<BookOpen className="size-5" aria-hidden="true" />}
            />
          </BriefingSection>
        ) : null}

        {saint ? (
          <BriefingSection
            id="saint-of-the-day"
            eyebrow="08"
            title="Faith — Saint of the Day"
            description="A patron connected to Madonna's mission."
          >
            <DiscoveryBriefCard
              item={saint}
              icon={<Cross className="size-5" aria-hidden="true" />}
            />
          </BriefingSection>
        ) : null}
      </div>
    </div>
  );
}
