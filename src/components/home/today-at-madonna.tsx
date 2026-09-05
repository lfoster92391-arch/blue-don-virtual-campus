import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cross,
  Lightbulb,
  Megaphone,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";

import { BriefingSection } from "@/components/home/briefing-section";
import { CampusHeroWeather } from "@/components/weather/campus-hero-weather";
import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { AdvisorMessagesPanel } from "@/components/home/advisor-messages-panel";
import { ClubOpsPulsePanel } from "@/components/home/club-ops-pulse";
import { CommandCenterMeetings } from "@/components/home/command-center-meetings";
import { CommandCenterTasks } from "@/components/home/command-center-tasks";
import { PageDropdown } from "@/components/ui/page-dropdown";
import { CAMPUS_FEED } from "@/config/campus-feed";
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
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type { ClubOpsPulse } from "@/services/club-ops-pulse-service";
import { getTodayInMadonnaHistory } from "@/services/madonna-culture-service";
import type { HubDigest } from "@/services/school-hub-service";
import type { CampusRole } from "@/config/roles";
import { homeEyebrowForView, type ViewAsPersona } from "@/config/view-as";
import type { CampusUser } from "@/types/auth";

type TodayAtMadonnaProps = {
  user: CampusUser;
  hub: HubDigest;
  announcement: BroadcastAnnouncementView | null;
  messages?: StudentMessageView[];
  meetings?: CommandCenterMeetingView[];
  tasks?: ClubStudentTaskView[];
  opsPulse?: ClubOpsPulse | null;
  children?: ReactNode;
  afterHero?: ReactNode;
  viewRole?: CampusRole;
  previewPersona?: ViewAsPersona | null;
  previewName?: string | null;
  /** Focus-club member / officer home widgets — not for regular students. */
  showClubSections?: boolean;
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
            href="/watch"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Watch Broadcasting LIVE
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
function homeBlurb(role: CampusRole, showClubSections: boolean): string {
  switch (role) {
    case "student":
      return showClubSections
        ? "Advisor messages, club meetings, tasks, and the daily campus briefing."
        : "Blue Don news, highlights, and the daily campus briefing.";
    case "coach":
      return "Teams, film, and the daily campus briefing — open Coach from Your tools.";
    case "teacher":
      return "Classes, club browse, and the daily campus briefing.";
    case "parent":
      return "Family tools and the daily campus briefing.";
    case "admin":
      return "Office tools, student accounts, and the daily campus briefing.";
    default:
      return showClubSections
        ? "Your hub for advisor messages, club meetings, tasks, and the daily campus briefing."
        : "Blue Don news, highlights, and the daily campus briefing.";
  }
}

export function TodayAtMadonna({
  user,
  hub,
  announcement,
  messages = [],
  meetings = [],
  tasks = [],
  opsPulse = null,
  children,
  afterHero,
  viewRole,
  previewPersona,
  previewName,
  showClubSections = false,
}: TodayAtMadonnaProps) {
  const role = viewRole ?? user.role;
  const preferredName = previewName
    ? previewName.split(" ")[0]
    : previewPersona
      ? null
      : (user.firstName ?? user.displayName.split(" ")[0] ?? user.displayName);
  const hour = new Date().getHours();
  const discovery = getDailyDiscovery(hub.today);
  const byKey = Object.fromEntries(discovery.map((item) => [item.key, item]));
  const brain = byKey.brain;
  const fact = byKey.fact;
  const word = byKey.word;
  const saint = byKey.saint;
  const greeting = preferredName
    ? `${getGreeting(hour)}, ${preferredName}.`
    : `${getGreeting(hour)}.`;

  return (
    <div className="flex flex-1 flex-col gap-0">
      <header className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] via-[#0A2342] to-[#14365f] px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
            Madonna High School · {homeEyebrowForView(role, previewPersona)}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Today at Madonna
          </h1>
          <p className="text-sm text-[#C6CCD6] sm:text-base">
            {greeting} {homeBlurb(role, showClubSections)}
          </p>
          <p className="text-sm text-[#C6CCD6]/80">{hub.dateLabel}</p>
          <CampusHeroWeather weather={hub.weather} />
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

      {afterHero ? <div className="mt-6">{afterHero}</div> : null}

      {showClubSections || opsPulse ? (
        <div className="mt-6 space-y-3">
          {opsPulse ? (
            <PageDropdown
              id="club-ops"
              title="Club operations"
              description="What each club is doing right now."
            >
              <ClubOpsPulsePanel pulse={opsPulse} />
            </PageDropdown>
          ) : null}
          {showClubSections ? (
            <>
              <PageDropdown
                id="messages"
                title="Messages & advisor requests"
                description="Requests from your advisor and club officers."
              >
                <AdvisorMessagesPanel messages={messages} />
              </PageDropdown>
              <PageDropdown
                id="meetings"
                title="Club meetings"
                description="What's on your club calendar."
              >
                <CommandCenterMeetings meetings={meetings} />
              </PageDropdown>
              <PageDropdown
                id="tasks"
                title="Club tasks"
                description="Work assigned to you."
              >
                <CommandCenterTasks tasks={tasks} />
              </PageDropdown>
            </>
          ) : null}
        </div>
      ) : null}

      {children ? <div className="mt-8">{children}</div> : null}

      <div className="mt-8 space-y-3">
        <BriefingSection
          id="lunch"
          eyebrow="02"
          title="Lunch"
          description="Menus and ordering on FuelTheDons."
        >
          <FuelTheDonsRow />
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
