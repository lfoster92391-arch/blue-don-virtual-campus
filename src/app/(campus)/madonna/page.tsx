import Link from "next/link";
import { ArrowRight, Megaphone, Radio, Sparkles, Trophy } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { CAMPUS_TEAM_LOGO_URL, CAMPUS_TEAM_NAME } from "@/config/sports-highlights";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import {
  getActiveLiveStream,
  isSportsTaggedMedia,
  listAnnouncementVideos,
  listSportsRecapVideos,
} from "@/services/media-service";

export const metadata = {
  title: "Madonna Hub",
  description: "Announcements and sports recaps for Madonna students and staff.",
};

/** Soft-fail wrapper — a hub tile should never take the whole page down. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-hub] tile data failed:", error);
    return fallback;
  }
}

export default async function MadonnaHubPage() {
  const user = await requireCompleteProfile();
  const firstName = user.firstName ?? user.displayName.split(" ")[0] ?? "Don";

  const [announcementVideos, sportsVideos, activeLive, schedule] = await Promise.all([
    safe(listAnnouncementVideos({ take: 12 }), []),
    safe(listSportsRecapVideos({ take: 60 }), []),
    safe(getActiveLiveStream(), null),
    safe(getBroadcastSchedule(), null),
  ]);

  // A sports-tagged stream plays on Sports Recap; everything else on Announcements.
  const liveHref = isSportsTaggedMedia(activeLive)
    ? "/madonna/sports-recap"
    : "/madonna/announcements";

  return (
    <ShellPage
      title="Madonna Hub"
      description={`Welcome back, ${firstName}. Pick where you want to go — announcements or sports.`}
      actions={
        activeLive ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400">
            <Radio className="size-3.5" aria-hidden="true" />
            On air now
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2342]/10 px-3 py-1 text-xs font-medium text-[#0A2342] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
            Students &amp; staff
          </span>
        )
      }
    >
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-gradient-to-br from-[#0A2342] to-[#0A2342]/85 px-5 py-5 text-white">
        {/* Static public asset — matches the sports banner treatment. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={CAMPUS_TEAM_LOGO_URL}
          alt={`Madonna ${CAMPUS_TEAM_NAME} logo`}
          className="size-14 shrink-0 rounded-lg bg-white object-contain p-1"
        />
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.18em] text-[#9FB3CE]">
            Madonna High School
          </p>
          <p className="text-lg font-semibold tracking-tight sm:text-xl">
            Go {CAMPUS_TEAM_NAME}
          </p>
          <p className="mt-0.5 text-sm text-[#C6CCD6]">
            Everything Broadcasting puts on air, in two places.
          </p>
        </div>
      </div>

      <LiveNowPanel
        activeLive={activeLive}
        nextAirAt={schedule?.nextAirAt ?? null}
        watchHref={activeLive ? liveHref : undefined}
        offlineLabel="No campus stream on air right now."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <HubTile
          href="/madonna/announcements"
          icon={<Megaphone className="size-7" aria-hidden="true" />}
          title="Madonna Announcements"
          subtitle="Broadcasting · daily show"
          description="Today's announcement, the live stream when Studio B is on air, and every past announcement broadcast to review later."
          meta={
            liveHref === "/madonna/announcements" && activeLive
              ? "Live right now"
              : announcementVideos.length > 0
                ? `${announcementVideos.length} announcement ${announcementVideos.length === 1 ? "video" : "videos"}`
                : "Daily rundown + submissions"
          }
          accent="from-[#0A2342] to-[#123A5C]"
          live={liveHref === "/madonna/announcements" && Boolean(activeLive)}
        />

        <HubTile
          href="/madonna/sports-recap"
          icon={<Trophy className="size-7" aria-hidden="true" />}
          title="Madonna Sports Recap"
          subtitle="Blue Don Sports · video library"
          description="Every sports and recap video the crew uploads — game highlights, reels, and sports-desk clips, newest first."
          meta={
            liveHref === "/madonna/sports-recap" && activeLive
              ? "Live right now"
              : sportsVideos.length > 0
                ? `${sportsVideos.length} ${sportsVideos.length === 1 ? "video" : "videos"} on file`
                : "Recaps land here as crew uploads them"
          }
          accent="from-[#123A5C] to-[#2F80ED]"
          live={liveHref === "/madonna/sports-recap" && Boolean(activeLive)}
        />
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/madonna/highlight-reel"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          <Sparkles className="size-3.5 text-[#C9A227]" aria-hidden="true" />
          Sports Highlight Reel
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <Link
          href="/media"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Full Broadcasting hub
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <Link
          href="/sports"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Scores &amp; schedules
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </ShellPage>
  );
}

function HubTile({
  href,
  icon,
  title,
  subtitle,
  description,
  meta,
  accent,
  live = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  meta: string;
  accent: string;
  live?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex min-h-[15rem] flex-col justify-between rounded-2xl bg-gradient-to-br ${accent} p-6 text-white shadow-sm ring-1 ring-white/10 transition-all hover:shadow-lg hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]`}
    >
      <div className="space-y-3">
        <span className="flex size-14 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/25">
          {icon}
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#9FB3CE]">
            {subtitle}
          </p>
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</p>
        </div>
        <p className="max-w-md text-sm text-white/80">{description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C6CCD6]">
          {live ? (
            <span className="size-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
          ) : null}
          {meta}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0A2342] transition-transform group-hover:translate-x-0.5">
          Open
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
