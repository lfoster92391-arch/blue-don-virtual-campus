import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Cloud,
  Megaphone,
  Radio,
  Trophy,
} from "lucide-react";

import {
  MADONNA_HUB_SECTIONS,
  describeMadonnaSection,
  type MadonnaSectionKey,
} from "@/config/madonna-hub";
import type { CampusRole } from "@/config/roles";
import {
  CAMPUS_TEAM_LOGO_URL,
  CAMPUS_TEAM_NAME,
  GAME_SITE_LABELS,
} from "@/config/sports-highlights";
import { formatCampusDateTime } from "@/lib/datetime/campus-local";
import { cn } from "@/lib/utils";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type { HubBellSchedule } from "@/services/school-hub-service";
import type { SportsGameView } from "@/services/sports-highlights-service";
import type { CampusWeather } from "@/services/weather-service";

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * The hub masthead: who you are, what day it is, and whether the campus is on
 * air. Weather is included only when the station actually has a reading.
 */
export function MadonnaHubHeader({
  firstName,
  dateLabel,
  weather,
  isLive,
  subtitle,
}: {
  firstName: string;
  dateLabel: string;
  weather?: CampusWeather | null;
  isLive?: boolean;
  subtitle: string;
}) {
  const snapshot = weather
    ? (weather.available ? weather : weather.lastKnown)
    : null;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] via-[#0A2342] to-[#14365f] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0 max-w-2xl space-y-2">
          <div className="flex items-center gap-3">
            {/* Static public asset — same treatment as the sports banner. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={CAMPUS_TEAM_LOGO_URL}
              alt={`Madonna ${CAMPUS_TEAM_NAME} logo`}
              className="size-10 shrink-0 rounded-lg bg-white object-contain p-1"
            />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
              Madonna High School
            </p>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {greetingFor(new Date())}, {firstName}
          </h1>
          <p className="text-sm text-[#C6CCD6] sm:text-base">{subtitle}</p>
          <p className="text-sm text-[#C6CCD6]/80">{dateLabel}</p>
        </div>

        <div className="flex flex-col items-start gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]">
              <span
                className="size-1.5 animate-pulse rounded-full bg-white"
                aria-hidden="true"
              />
              On air now
            </span>
          ) : null}
          {snapshot ? (
            <Link
              href="/weather"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
            >
              <Cloud className="size-4 text-[#9FB3CE]" aria-hidden="true" />
              <span className="font-semibold tabular-nums">
                {snapshot.temperatureF}°F
              </span>
              <span className="text-[#C6CCD6]">{snapshot.conditionLabel}</span>
            </Link>
          ) : null}
        </div>
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
  );
}

/** Pills across the five sections, so any page can move to any other. */
export function MadonnaSectionNav({ active }: { active?: MadonnaSectionKey }) {
  return (
    <nav
      aria-label="Madonna Hub sections"
      className="flex flex-wrap items-center gap-2"
    >
      <Link
        href="/madonna"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
          !active && "border-transparent bg-[#0A2342] text-white hover:bg-[#123A5C]",
        )}
      >
        Hub
      </Link>
      {MADONNA_HUB_SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = section.key === active;
        return (
          <Link
            key={section.key}
            href={section.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
              isActive &&
                "border-transparent bg-[#0A2342] text-white hover:bg-[#123A5C]",
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Section entry tiles. Today leads at full width; the other four sit in a grid
 * underneath, so the hub reads as a front door instead of a wall of equal cards.
 */
export function MadonnaSectionTiles({
  role,
  meta = {},
}: {
  role: CampusRole;
  /** Optional live counts / status per section. Omit rather than invent one. */
  meta?: Partial<Record<MadonnaSectionKey, string>>;
}) {
  const [lead, ...rest] = MADONNA_HUB_SECTIONS;

  return (
    <div className="space-y-4">
      <SectionTile
        section={lead}
        description={describeMadonnaSection(lead, role)}
        meta={meta[lead.key]}
        feature
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {rest.map((section) => (
          <SectionTile
            key={section.key}
            section={section}
            description={describeMadonnaSection(section, role)}
            meta={meta[section.key]}
          />
        ))}
      </div>
    </div>
  );
}

function SectionTile({
  section,
  description,
  meta,
  feature = false,
}: {
  section: (typeof MADONNA_HUB_SECTIONS)[number];
  description: string;
  meta?: string;
  feature?: boolean;
}) {
  const Icon = section.icon;

  return (
    <Link
      href={section.href}
      className={cn(
        "group flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-[#2F80ED]/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]",
        feature &&
          "border-transparent bg-gradient-to-br from-[#0A2342] to-[#123A5C] text-white hover:border-transparent",
      )}
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white",
            feature && "bg-white/10 text-white ring-1 ring-white/25",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 space-y-1">
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[0.14em] text-[#C9A227]",
              feature && "text-[#9FB3CE]",
            )}
          >
            {section.eyebrow}
          </p>
          <p
            className={cn(
              "text-lg font-semibold text-[#0A2342] dark:text-white",
              feature && "text-2xl text-white",
            )}
          >
            {section.label}
          </p>
          <p
            className={cn(
              "text-sm text-muted-foreground",
              feature && "text-white/80",
            )}
          >
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-xs font-medium text-muted-foreground",
            feature && "text-[#C6CCD6]",
          )}
        >
          {meta ?? ""}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold text-[#2F80ED] transition-transform group-hover:translate-x-0.5",
            feature && "text-white",
          )}
        >
          Open
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

/**
 * TODAY snapshot — where you are in the day plus a preview of the announcement,
 * with the full page one tap away. Renders an honest empty state.
 */
export function TodaySnapshot({
  bell,
  isSchoolDay,
  announcement,
}: {
  bell: HubBellSchedule;
  isSchoolDay: boolean;
  announcement: BroadcastAnnouncementView | null;
}) {
  const period = bell.currentPeriod ?? bell.nextPeriod;
  let periodLine: string;
  if (!isSchoolDay) {
    periodLine = "No classes today.";
  } else if (bell.currentPeriod) {
    periodLine = `Now: ${bell.currentPeriod.label} · ends ${bell.currentPeriod.endLabel}`;
  } else if (period) {
    periodLine = `Next: ${period.label} at ${period.startLabel}`;
  } else {
    periodLine = "School day complete.";
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#0A2342] dark:text-white">
          Today
        </h2>
        <Link
          href="/madonna/today"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
        >
          Full day
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
        <Clock className="size-4 shrink-0 text-[#2F80ED]" aria-hidden="true" />
        {periodLine}
      </p>

      <div className="mt-4 border-t border-border pt-4">
        {announcement ? (
          <>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#C9A227]">
              <Megaphone className="size-3.5" aria-hidden="true" />
              Today&apos;s announcement
            </p>
            <p className="mt-1.5 font-semibold text-[#0A2342] dark:text-white">
              {announcement.title}
            </p>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {announcement.body}
            </p>
            <Link
              href="/madonna/broadcast"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
            >
              Read it all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No announcement posted yet today. Broadcasting publishes it from
            the Control Room — it shows up here as soon as they do.
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * What's Happening — the next game and the next broadcast, side by side.
 * Each half says plainly when there is nothing scheduled.
 */
export function WhatsHappening({
  nextGame,
  activeLiveTitle,
  nextAirAt,
}: {
  nextGame: SportsGameView | null;
  activeLiveTitle: string | null;
  nextAirAt: Date | null;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Trophy className="size-4 text-[#C9A227]" aria-hidden="true" />
            Next game
          </h2>
          <Link
            href="/madonna/sports"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Sports
          </Link>
        </div>
        {nextGame ? (
          <>
            <p className="mt-3 text-lg font-semibold text-[#0A2342] dark:text-white">
              {CAMPUS_TEAM_NAME} vs. {nextGame.opponentName}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {nextGame.sportName} · {GAME_SITE_LABELS[nextGame.site]}
              {nextGame.venue ? ` · ${nextGame.venue}` : ""}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {nextGame.status === "LIVE"
                ? "In progress right now"
                : formatCampusDateTime(nextGame.kickoffAt)}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing on the schedule in the next day. Full schedules live in the
            Sports section.
          </p>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Radio className="size-4 text-[#2F80ED]" aria-hidden="true" />
            Next broadcast
          </h2>
          <Link
            href="/madonna/broadcast"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Broadcast
          </Link>
        </div>
        {activeLiveTitle ? (
          <>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-white">
              <span
                className="size-1.5 animate-pulse rounded-full bg-white"
                aria-hidden="true"
              />
              Live now
            </p>
            <p className="mt-2 text-lg font-semibold text-[#0A2342] dark:text-white">
              {activeLiveTitle}
            </p>
          </>
        ) : nextAirAt ? (
          <>
            <p className="mt-3 text-lg font-semibold text-[#0A2342] dark:text-white">
              {formatCampusDateTime(nextAirAt)}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Blue Don Live. The player appears on the Broadcast page when the
              crew goes on air.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">
            No air time scheduled yet. Broadcasting sets it from the control
            room.
          </p>
        )}
      </div>
    </section>
  );
}
