import Link from "next/link";
import { ArrowLeft, ArrowRight, Info, Sparkles, Trophy, Upload } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { HighlightReelPlayer } from "@/components/media/highlight-reel-player";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { VideoGrid } from "@/components/media/video-grid";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { BROADCAST_ORG_SLUG } from "@/config/broadcast-media";
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

export const metadata = {
  title: "Madonna Sports Recap",
  description: "Every sports and recap video uploaded by the Broadcasting crew.",
};

/** Soft-fail wrapper — an empty grid beats a 500 on a student-facing page. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-sports-recap] data failed:", error);
    return fallback;
  }
}

export default async function MadonnaSportsRecapPage() {
  const user = await requireCompleteProfile();

  const [videos, canManageMedia, activeLive, schedule] = await Promise.all([
    safe(listSportsRecapVideos({ take: 200 }), []),
    safe(canManageCampusMedia(user.id, user.role), false),
    safe(getActiveLiveStream(), null),
    safe(getBroadcastSchedule(), null),
  ]);

  // Play the stream here only when it is tagged as sports coverage; otherwise
  // point at Announcements rather than implying the game is on air.
  const sportsLive = isSportsTaggedMedia(activeLive) ? activeLive : null;
  const reel = videos.filter((item) => item.isHighlightReel);

  return (
    <ShellPage
      title="Madonna Sports Recap"
      description={`Every sports and recap video the ${CAMPUS_TEAM_NAME} crew uploads — game highlights, reels, and sports-desk clips, newest first.`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2342]/10 px-3 py-1 text-xs font-medium text-[#0A2342] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
            <Trophy className="size-3.5" aria-hidden="true" />
            {videos.length} {videos.length === 1 ? "video" : "videos"}
          </span>
          <Link
            href="/madonna/highlight-reel"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2342] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#123A5C]"
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Highlight Reel
          </Link>
          <Link
            href="/madonna"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Madonna Hub
          </Link>
        </div>
      }
    >
      <LiveNowPanel
        activeLive={sportsLive ?? activeLive}
        nextAirAt={schedule?.nextAirAt ?? null}
        watchHref={!sportsLive && activeLive ? "/madonna/announcements" : undefined}
        offlineLabel="No game or sports stream on air right now."
      />

      {reel.length > 0 ? (
        <DashboardCard
          title="Sports Highlight Reel"
          description="Crew-picked clips, played back to back."
          icon={<Sparkles className="size-5" />}
          actions={
            <Link
              href="/madonna/highlight-reel"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
            >
              Open reel
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        >
          <HighlightReelPlayer
            items={reel.slice(0, 12)}
            canManage={canManageMedia}
            emptyLabel="No clips flagged for the reel yet."
          />
        </DashboardCard>
      ) : null}

      {canManageMedia ? (
        <DashboardCard
          title="Upload sports highlight"
          description="Tonight's game video — publishes straight into this library."
          icon={<Upload className="size-5" />}
          status={{ label: "Crew only", variant: "info" }}
        >
          <VideoUploadForm
            storageConfigured={isCampusMediaStorageConfigured()}
            defaultCategory="SPORTS_HIGHLIGHTS"
            titlePlaceholder="Dons vs. Toronto — full game"
            submitLabel="Publish to Sports Recap"
          />
          <p className="mt-3 text-xs text-muted-foreground">
            Tick <strong className="text-foreground">Feature in Highlight Reel</strong>{" "}
            to also drop it into the reel. Files up to 50 MB upload directly;
            longer game film is easier as an unlisted YouTube link pasted into
            the URL field.
          </p>
        </DashboardCard>
      ) : null}

      <DashboardCard
        title="Recap library"
        description="Recent recaps, the full archive, and anything you saved to watch later."
        icon={<Trophy className="size-5" />}
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

      {canManageMedia ? (
        <DashboardCard
          title="Crew — how to get a video on this page"
          description="Tagging rules for uploads and sports-desk posts."
          icon={<Info className="size-5" />}
          status={{ label: "Crew only", variant: "info" }}
        >
          <ol className="ml-4 list-decimal space-y-2 text-sm text-muted-foreground">
            <li>
              Use <strong className="text-foreground">Upload sports highlight</strong>{" "}
              above. Category is already set to{" "}
              <strong className="text-foreground">Sports Highlights</strong>, and
              uploads publish immediately — there is no draft step.
            </li>
            <li>
              Tick <strong className="text-foreground">Feature in Highlight Reel</strong>{" "}
              during upload, or press{" "}
              <strong className="text-foreground">Add to reel</strong> on any card
              below, to put a clip in the{" "}
              <Link
                href="/madonna/highlight-reel"
                className="font-medium text-[#2F80ED] hover:underline"
              >
                Sports Highlight Reel
              </Link>
              . The reel is exactly what you pick — nothing is auto-detected from
              game film.
            </li>
            <li>
              Already uploaded somewhere else? Retag it with the{" "}
              <strong className="text-foreground">Category</strong> dropdown on{" "}
              <Link href="/media" className="font-medium text-[#2F80ED] hover:underline">
                Watch Broadcasting
              </Link>{" "}
              or the Control Room and it appears here.
            </li>
            <li>
              Posting from the{" "}
              <Link
                href={`/organizations/${BROADCAST_ORG_SLUG}?tab=sports-desk`}
                className="font-medium text-[#2F80ED] hover:underline"
              >
                sports desk
              </Link>{" "}
              works too — a published highlight with a video URL shows up here,
              labelled with its sport.
            </li>
            <li>
              Ended live streams appear as replays when they carry a sports
              category or are linked to a highlight.
            </li>
            <li>
              Posted the wrong clip?{" "}
              <strong className="text-foreground">Remove from reel</strong> pulls
              it out of the running order but leaves it in this library;{" "}
              <strong className="text-foreground">Delete upload</strong> removes
              it from campus for good.
            </li>
          </ol>

          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Link
              href="/media"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
            >
              Upload a video
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            <Link
              href={`/organizations/${BROADCAST_ORG_SLUG}?tab=sports-desk`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
            >
              Sports desk
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </DashboardCard>
      ) : null}
    </ShellPage>
  );
}
