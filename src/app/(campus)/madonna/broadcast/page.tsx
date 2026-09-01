import Link from "next/link";
import { Clapperboard, Clock, Megaphone, Radio } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MadonnaSectionNav } from "@/components/madonna/madonna-hub-panels";
import { ShellPage } from "@/components/layout/shell-page";
import { BroadcastCountdown } from "@/components/media/broadcast-countdown";
import { AnnouncementSubmitForm } from "@/components/media/broadcast-suite-panels";
import { DailyAnnouncement } from "@/components/media/daily-announcement";
import { LiveBroadcastPanel } from "@/components/media/live-broadcast-panel";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { VideoGrid } from "@/components/media/video-grid";
import {
  getBlueDonLiveRtmpPublicConfig,
  isWithinAirPreviewWindow,
} from "@/config/broadcast-media";
import { requireCompleteProfile } from "@/lib/auth/session";
import { recentWindowStart } from "@/lib/media-recency";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import {
  getBroadcastSchedule,
  type BroadcastScheduleView,
} from "@/services/broadcast-production-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  listAnnouncementVideos,
} from "@/services/media-service";

export const metadata = {
  title: "Madonna Broadcast",
  description:
    "Blue Don Live, today's announcement, and every past announcement broadcast.",
};

const EMPTY_SCHEDULE: BroadcastScheduleView = {
  id: null,
  organizationId: null,
  nextAirAt: null,
  title: null,
  notes: null,
  updatedByName: null,
};

/** Soft-fail wrapper — one bad panel should not blank the page. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-broadcast] panel data failed:", error);
    return fallback;
  }
}

export default async function MadonnaBroadcastPage() {
  const user = await requireCompleteProfile();

  const [canManageMedia, activeLive, dailyAnnouncement, schedule, videos] =
    await Promise.all([
      safe(canManageCampusMedia(user.id, user.role), false),
      safe(getActiveLiveStream(), null),
      safe(getTodaysBroadcastAnnouncement(), null),
      safe(getBroadcastSchedule(), EMPTY_SCHEDULE),
      safe(listAnnouncementVideos({ take: 60 }), []),
    ]);

  const rtmp = getBlueDonLiveRtmpPublicConfig();

  return (
    <ShellPage
      title="Broadcast"
      description="Blue Don Live when Studio B is on air, today's message from Broadcasting, and every past announcement broadcast."
      actions={
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            activeLive
              ? "bg-red-500/10 text-red-600 dark:text-red-400"
              : "bg-[#0A2342]/10 text-[#0A2342] dark:bg-[#C9A227]/15 dark:text-[#C9A227]"
          }`}
        >
          <Radio className="size-3.5" aria-hidden="true" />
          {activeLive ? "On air now" : "Offline"}
        </span>
      }
    >
      <MadonnaSectionNav active="broadcast" />

      <LiveNowPanel
        activeLive={activeLive}
        nextAirAt={schedule.nextAirAt}
        offlineLabel="Broadcasting is not on air right now."
      />

      <DashboardCard
        title="Today's announcement"
        description="The daily message from Broadcasting Studio B."
        icon={<Megaphone className="size-5" />}
        status={{ label: "Daily", variant: "info" }}
      >
        <DailyAnnouncement
          announcement={dailyAnnouncement}
          canManage={canManageMedia}
        />
      </DashboardCard>

      {canManageMedia ? (
        <DashboardCard
          title="Go live"
          description="Five steps from an empty studio to on air. Nothing here needs a stream key."
          icon={<Radio className="size-5" />}
          status={
            activeLive
              ? { label: "On air", variant: "warning" }
              : { label: "Crew only", variant: "info" }
          }
        >
          <LiveBroadcastPanel
            activeLive={activeLive}
            isProducer
            currentUserId={user.id}
            rtmp={rtmp}
            previewWindow={isWithinAirPreviewWindow(schedule.nextAirAt)}
            scheduledTitle={schedule.title}
          />
        </DashboardCard>
      ) : null}

      <DashboardCard
        title="Next live"
        description="Countdown to the next Blue Don Live air time."
        icon={<Clock className="size-5" />}
        status={
          schedule.nextAirAt
            ? { label: "Scheduled", variant: "info" }
            : { label: "TBD", variant: "info" }
        }
      >
        <BroadcastCountdown schedule={schedule} canSet={canManageMedia} />
      </DashboardCard>

      <DashboardCard
        title="Announcement archive"
        description="Recent broadcasts, the full archive, and anything you saved to watch later."
        icon={<Clapperboard className="size-5" />}
      >
        <VideoGrid
          items={videos}
          searchable
          recentSince={recentWindowStart()}
          watchLaterUserId={user.id}
          emptyLabel="No announcement videos yet — they appear here once Broadcasting publishes an upload tagged Morning Announcements."
        />
      </DashboardCard>

      <DashboardCard
        title="Submit an announcement"
        description="Students and staff — request an item for the daily show."
        icon={<Megaphone className="size-5" />}
      >
        <AnnouncementSubmitForm />
      </DashboardCard>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          href="/media"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Full Broadcasting hub
        </Link>
        <Link
          href="/madonna/participate"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
        >
          Join the crew
        </Link>
      </div>
    </ShellPage>
  );
}
