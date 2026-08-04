import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  Clock,
  Megaphone,
  Radio,
  Sparkles,
  Upload,
  Users,
  Video,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { BroadcastCountdown } from "@/components/media/broadcast-countdown";
import {
  AnnouncementSubmitForm,
  BookingRequestForm,
  CrewCreditRoll,
  JoinClubPortal,
} from "@/components/media/broadcast-suite-panels";
import { DailyAnnouncement } from "@/components/media/daily-announcement";
import { LiveBroadcastPanel } from "@/components/media/live-broadcast-panel";
import { VideoLibrary } from "@/components/media/video-library";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { Button } from "@/components/ui/button";
import {
  BROADCAST_ORG_SLUG,
  type BlueDonLiveRtmpConfig,
} from "@/config/broadcast-media";
import type { BroadcastAnnouncementView } from "@/services/broadcast-announcement-service";
import type {
  BroadcastCrewCreditView,
  BroadcastScheduleView,
} from "@/services/broadcast-production-service";
import type { CampusMediaItemView } from "@/services/media-service";

type MediaHubSectionsProps = {
  schoolBroadcasts: CampusMediaItemView[];
  myUploads: CampusMediaItemView[];
  activeLive: CampusMediaItemView | null;
  canManageMedia: boolean;
  storageConfigured: boolean;
  currentUserId: string;
  rtmp: BlueDonLiveRtmpConfig;
  dailyAnnouncement: BroadcastAnnouncementView | null;
  schedule: BroadcastScheduleView;
  crewCredits: BroadcastCrewCreditView[];
};

export function MediaHubSections({
  schoolBroadcasts,
  myUploads,
  activeLive,
  canManageMedia,
  storageConfigured,
  currentUserId,
  rtmp,
  dailyAnnouncement,
  schedule,
  crewCredits,
}: MediaHubSectionsProps) {
  return (
    <>
      <DashboardCard
        title="For everyone on campus"
        description="Watch live streams and past broadcasts — no club membership required."
        icon={<Video className="size-5" />}
        status={
          activeLive
            ? { label: "On air now", variant: "warning" }
            : { label: "Audience", variant: "info" }
        }
      >
        <p className="text-sm text-muted-foreground">
          Signed-in Madonna students and staff can watch Blue Don Live here and
          browse the video library below. Production tools (upload, go live,
          Daily Rundown) are for Broadcasting club members.
        </p>
        {!canManageMedia ? (
          <Button
            className="mt-4"
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/organizations/${BROADCAST_ORG_SLUG}`}>
                About the Broadcasting club
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />
        ) : null}
      </DashboardCard>

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
        title="Daily Announcement"
        description="Today’s message from Broadcasting Studio B."
        icon={<Megaphone className="size-5" />}
        status={{ label: "Broadcasting", variant: "info" }}
      >
        <DailyAnnouncement
          announcement={dailyAnnouncement}
          canManage={canManageMedia}
        />
      </DashboardCard>

      {canManageMedia ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard
            title="Upload Video"
            description="Publish a finished video to the school library (stored on campus)."
            icon={<Upload className="size-5" />}
            status={{ label: "Crew only", variant: "info" }}
          >
            <VideoUploadForm storageConfigured={storageConfigured} />
          </DashboardCard>

          <DashboardCard
            title="Go Live"
            description="OBS control room — stream stays on campus; optional YouTube embed."
            icon={<Radio className="size-5" />}
            status={
              activeLive
                ? { label: "On air", variant: "warning" }
                : { label: "Studio", variant: "info" }
            }
          >
            <div id="live">
              <LiveBroadcastPanel
                activeLive={activeLive}
                isProducer={canManageMedia}
                currentUserId={currentUserId}
                rtmp={rtmp}
              />
            </div>
          </DashboardCard>
        </div>
      ) : (
        <DashboardCard
          title="Blue Don Live"
          description="Watch the current campus stream when Broadcasting is on air."
          icon={<Radio className="size-5" />}
          status={
            activeLive
              ? { label: "On air", variant: "warning" }
              : { label: "Offline", variant: "info" }
          }
        >
          <div id="live">
            <LiveBroadcastPanel
              activeLive={activeLive}
              isProducer={false}
              currentUserId={currentUserId}
              rtmp={rtmp}
            />
          </div>
        </DashboardCard>
      )}

      <DashboardCard
        title="Highlight Reel"
        description="Montage clips showcasing recent campus moments."
        icon={<Sparkles className="size-5" />}
      >
        <VideoLibrary
          items={schoolBroadcasts}
          highlightOnly
          title="Featured montages"
          emptyLabel="No highlight reels yet — check back after the next edit session."
          canCategorize={canManageMedia}
        />
      </DashboardCard>

      <DashboardCard
        title="On-demand library"
        description="Morning announcements, sports, spotlights, and special events."
        icon={<Clapperboard className="size-5" />}
      >
        <VideoLibrary
          items={schoolBroadcasts}
          emptyLabel="No school broadcasts yet — check back after the next studio session."
          canCategorize={canManageMedia}
        />
      </DashboardCard>

      <DashboardCard
        title="Production credit roll"
        description="Hosts, camera, editors, producers, and more."
        icon={<Users className="size-5" />}
      >
        <CrewCreditRoll credits={crewCredits} />
        <Button
          className="mt-4"
          size="sm"
          variant="outline"
          nativeButton={false}
          render={
            <Link href={`/organizations/${BROADCAST_ORG_SLUG}?tab=credits`}>
              Full credit roll
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Request coverage"
          description="Film, photography, or live streaming for your club or team."
          icon={<Video className="size-5" />}
        >
          <BookingRequestForm />
        </DashboardCard>
        <DashboardCard
          title="Submit a morning announcement"
          description="Faculty and students — request an item for the daily show."
          icon={<Megaphone className="size-5" />}
        >
          <AnnouncementSubmitForm />
        </DashboardCard>
      </div>

      <DashboardCard
        title="Join Broadcasting"
        description="Apply for Host, Camera, Editor, Graphics, and more."
        icon={<Users className="size-5" />}
      >
        <JoinClubPortal />
      </DashboardCard>

      {canManageMedia ? (
        <DashboardCard
          title="My Uploads"
          description="Videos and live sessions you have published."
          icon={<Upload className="size-5" />}
        >
          <VideoLibrary
            items={myUploads}
            emptyLabel="You have not published any videos yet."
            canCategorize
          />
        </DashboardCard>
      ) : null}
    </>
  );
}
