import Link from "next/link";
import { ArrowRight, Sparkles, Trophy, Upload } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MadonnaSectionNav } from "@/components/madonna/madonna-hub-panels";
import { ShellPage } from "@/components/layout/shell-page";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { VideoGrid } from "@/components/media/video-grid";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { SportsAudienceSections } from "@/components/sports/sports-sections";
import { Button } from "@/components/ui/button";
import { CAMPUS_MEDIA_MAX_LABEL } from "@/config/campus-video";
import { CAMPUS_TEAM_NAME } from "@/config/sports-highlights";
import { requireCompleteProfile } from "@/lib/auth/session";
import { recentWindowStart } from "@/lib/media-recency";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  isCampusMediaStorageConfigured,
  isSportsTaggedMedia,
  listSportsRecapVideos,
} from "@/services/media-service";
import {
  canManageSportsDesk,
  getSportsHubData,
  isSportsImageStorageConfigured,
  type SportsHubData,
} from "@/services/sports-highlights-service";
import { getCampusWeather } from "@/services/weather-service";

export const metadata = {
  title: "Madonna Sports",
  description:
    "Blue Don scores, schedules, and every game video the Broadcasting crew publishes.",
};

const EMPTY_SPORTS_DATA: SportsHubData = {
  sports: [],
  activeSport: null,
  lastGame: null,
  upcoming: [],
  highlights: [],
  myHighlights: [],
  recentGames: [],
  publishedReports: [],
  players: [],
  reportableGames: [],
};

/** Soft-fail wrapper — an empty section beats a 500 on a student-facing page. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-sports] data failed:", error);
    return fallback;
  }
}

export default async function MadonnaSportsPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const user = await requireCompleteProfile();
  const { sport } = await searchParams;

  const [sportsData, videos, canManageMedia, canManageDesk, activeLive, schedule, weather] =
    await Promise.all([
      safe(getSportsHubData(sport ?? null, { viewerId: user.id }), EMPTY_SPORTS_DATA),
      safe(listSportsRecapVideos({ take: 200 }), []),
      safe(canManageCampusMedia(user.id, user.role), false),
      safe(canManageSportsDesk(user.id, user.role), false),
      safe(getActiveLiveStream(), null),
      safe(getBroadcastSchedule(), null),
      safe(getCampusWeather(), null),
    ]);

  // Play the stream here only when it is tagged as sports coverage; otherwise
  // point at Broadcast rather than implying the game is on air.
  const sportsLive = isSportsTaggedMedia(activeLive) ? activeLive : null;
  const reelCount = videos.filter((item) => item.isHighlightReel).length;

  return (
    <ShellPage
      title="Sports"
      description={`Scores, schedules, and coverage for every ${CAMPUS_TEAM_NAME} team — plus every recap video the Broadcasting crew publishes.`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2342]/10 px-3 py-1 text-xs font-medium text-[#0A2342] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
            <Trophy className="size-3.5" aria-hidden="true" />
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </span>
          {reelCount > 0 ? (
            <Link
              href="/madonna/sports/reel"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2342] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#123A5C]"
            >
              <Sparkles className="size-3.5" aria-hidden="true" />
              Highlight Reel
            </Link>
          ) : null}
        </div>
      }
    >
      <MadonnaSectionNav active="sports" />

      <LiveNowPanel
        activeLive={sportsLive ?? activeLive}
        nextAirAt={schedule?.nextAirAt ?? null}
        watchHref={!sportsLive && activeLive ? "/madonna/broadcast" : undefined}
        offlineLabel="No game or sports stream on air right now."
      />

      <SportsAudienceSections
        data={sportsData}
        basePath="/madonna/sports"
        storageConfigured={isSportsImageStorageConfigured()}
        canManage={canManageDesk}
        viewerId={user.id}
        weather={weather}
      />

      {canManageMedia ? (
        <DashboardCard
          title="Upload sports highlight"
          description="Tonight's game video — publishes straight into the recap library."
          icon={<Upload className="size-5" />}
          status={{ label: "Crew only", variant: "info" }}
        >
          <VideoUploadForm
            storageConfigured={isCampusMediaStorageConfigured()}
            defaultCategory="SPORTS_HIGHLIGHTS"
            titlePlaceholder="Dons vs. Toronto — full game"
            submitLabel="Publish to Sports"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Tick{" "}
            <strong className="text-foreground">Feature in Highlight Reel</strong>{" "}
            to also drop it into the reel. Files up to {CAMPUS_MEDIA_MAX_LABEL}{" "}
            upload directly; longer game film is easier as an unlisted YouTube
            link pasted into the URL field.
          </p>
        </DashboardCard>
      ) : null}

      <DashboardCard
        title="Recap library"
        description="Recent recaps, the full archive, and anything you saved to watch later."
        icon={<Trophy className="size-5" />}
        actions={
          reelCount > 0 ? (
            <Link
              href="/madonna/sports/reel"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
            >
              Highlight reel
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null
        }
      >
        <VideoGrid
          items={videos}
          searchable
          recentSince={recentWindowStart()}
          watchLaterUserId={user.id}
          canCurate={canManageMedia}
          emptyLabel="No sports videos published yet — uploads tagged Sports Highlights or Highlight Reel land here automatically."
        />
      </DashboardCard>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="action"
          nativeButton={false}
          render={
            <Link href="/sports">
              Full Blue Don Sports hub
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />
        <Button
          variant="action"
          nativeButton={false}
          render={
            <Link href="/madonna/participate">
              Cover a game
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />
      </div>
    </ShellPage>
  );
}
