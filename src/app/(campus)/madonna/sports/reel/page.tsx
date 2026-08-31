import Link from "next/link";
import { ArrowLeft, ArrowRight, Info, Sparkles, Upload } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { HighlightReelPlayer } from "@/components/media/highlight-reel-player";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { VideoGrid } from "@/components/media/video-grid";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  isCampusMediaStorageConfigured,
  isSportsTaggedMedia,
  listSportsRecapVideos,
} from "@/services/media-service";

export const metadata = {
  title: "Sports Highlight Reel",
  description:
    "Crew-curated reel of Madonna sports highlights, played back to back.",
};

/** Soft-fail wrapper — an empty reel beats a 500 on a student-facing page. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-sports-reel] data failed:", error);
    return fallback;
  }
}

export default async function MadonnaSportsReelPage() {
  const user = await requireCompleteProfile();

  const [videos, canManageMedia, activeLive, schedule] = await Promise.all([
    safe(listSportsRecapVideos({ take: 200 }), []),
    safe(canManageCampusMedia(user.id, user.role), false),
    safe(getActiveLiveStream(), null),
    safe(getBroadcastSchedule(), null),
  ]);

  // The reel is exactly what crew flagged — no automatic clip detection.
  const reel = videos.filter((item) => item.isHighlightReel);
  const candidates = videos.filter((item) => !item.isHighlightReel);
  const sportsLive = isSportsTaggedMedia(activeLive) ? activeLive : null;

  return (
    <ShellPage
      title="Sports Highlight Reel"
      description="Crew-picked highlights from Madonna sports uploads, played back to back. Newest clip first."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A227]/15 px-3 py-1 text-xs font-medium text-[#8A6D14] dark:text-[#C9A227]">
            <Sparkles className="size-3.5" aria-hidden="true" />
            {reel.length} {reel.length === 1 ? "clip" : "clips"}
          </span>
          <Link
            href="/madonna/sports"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Sports
          </Link>
        </div>
      }
    >
      {sportsLive ? (
        <LiveNowPanel
          activeLive={sportsLive}
          nextAirAt={schedule?.nextAirAt ?? null}
        />
      ) : null}

      <DashboardCard
        title="The reel"
        description="Plays in order — uploaded files roll into the next clip automatically."
        icon={<Sparkles className="size-5" />}
      >
        <HighlightReelPlayer
          items={reel}
          canManage={canManageMedia}
          emptyLabel="No clips in the reel yet. Crew: tick “Feature in Highlight Reel” when uploading, or use “Add to reel” on any sports video below."
        />
        {canManageMedia && reel.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Crew: <strong className="text-foreground">Remove from reel</strong>{" "}
            takes a clip out of the running order but keeps it in the video
            library. <strong className="text-foreground">Delete upload</strong>{" "}
            removes it from campus entirely.
          </p>
        ) : null}
      </DashboardCard>

      {canManageMedia ? (
        <>
          <DashboardCard
            title="Upload a highlight"
            description="Publishes straight into the Sports library and, when ticked, this reel."
            icon={<Upload className="size-5" />}
            status={{ label: "Crew only", variant: "info" }}
          >
            <VideoUploadForm
              storageConfigured={isCampusMediaStorageConfigured()}
              defaultCategory="SPORTS_HIGHLIGHTS"
              defaultHighlightReel
              titlePlaceholder="Dons vs. Toronto — 4th quarter run"
              submitLabel="Publish to reel"
            />
          </DashboardCard>

          <DashboardCard
            title="Build the reel"
            description="Every sports video not yet in the reel — tap “Add to reel” to include it."
            icon={<Info className="size-5" />}
            status={{ label: "Crew only", variant: "info" }}
          >
            <VideoGrid
              items={candidates}
              searchable
              canCurate
              defaultView="all"
              emptyLabel="Every sports video is already in the reel."
            />
          </DashboardCard>
        </>
      ) : null}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/madonna/sports"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Full sports library
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
        <Link
          href="/madonna"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Madonna Hub
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </ShellPage>
  );
}
