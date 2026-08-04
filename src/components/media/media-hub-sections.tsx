import Link from "next/link";
import { ArrowRight, Megaphone, Radio, Upload, Video } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
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
        title="Past Broadcasts"
        description="Published videos and ended live streams — newest first."
        icon={<Radio className="size-5" />}
      >
        <VideoLibrary
          items={schoolBroadcasts}
          emptyLabel="No school broadcasts yet — check back after the next studio session."
        />
      </DashboardCard>

      {canManageMedia ? (
        <DashboardCard
          title="My Uploads"
          description="Videos and live sessions you have published."
          icon={<Upload className="size-5" />}
        >
          <VideoLibrary
            items={myUploads}
            title="Your published media"
            emptyLabel="You have not published any media yet."
          />
        </DashboardCard>
      ) : null}
    </>
  );
}
