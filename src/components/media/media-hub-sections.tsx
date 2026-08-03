import Link from "next/link";
import { ArrowRight, Camera, Megaphone, Radio, Upload, Video } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DailyAnnouncement } from "@/components/media/daily-announcement";
import { LiveBroadcastPanel } from "@/components/media/live-broadcast-panel";
import { VideoLibrary } from "@/components/media/video-library";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { Button } from "@/components/ui/button";
import {
  LIVESTREAM_EVENTS,
  MEDIA_ALBUMS,
  PHOTO_OF_THE_DAY,
} from "@/config/media-engine";
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
            description="Publish student-produced video to the school library."
            icon={<Upload className="size-5" />}
            status={{ label: "Producers", variant: "info" }}
          >
            <VideoUploadForm storageConfigured={storageConfigured} />
          </DashboardCard>

          <DashboardCard
            title="Go Live"
            description="OBS-style control room for Blue Don Live."
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
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard
            title="Broadcasting access"
            description="Student producers upload and go live from the Media Hub."
            icon={<Video className="size-5" />}
          >
            <p className="text-sm text-muted-foreground">
              Join the{" "}
              <Link
                href={`/organizations/${BROADCAST_ORG_SLUG}`}
                className="text-[#2F80ED] underline"
              >
                Broadcasting
              </Link>{" "}
              club or{" "}
              <Link href="/academies/broadcast" className="text-[#2F80ED] underline">
                Broadcast Academy
              </Link>{" "}
              to upload videos and run live streams. Everyone on campus can watch school
              broadcasts below.
            </p>
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link href={`/organizations/${BROADCAST_ORG_SLUG}?tab=media`}>
                  Open Broadcasting club
                  <ArrowRight className="size-3.5" />
                </Link>
              }
            />
          </DashboardCard>

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
            {!canManageMedia ? (
              <ul className="mt-4 space-y-2 border-t border-border pt-4">
                {LIVESTREAM_EVENTS.map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{event.title}</span>
                    <span className="text-xs text-muted-foreground">{event.timeLabel}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </DashboardCard>
        </div>
      )}

      <DashboardCard
        title="Past Broadcasts / Video Library"
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

      <DashboardCard
        title="Photo of the Day"
        description={PHOTO_OF_THE_DAY.dateLabel}
        icon={<Camera className="size-5" />}
        status={{ label: "W12", variant: "info" }}
      >
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342] to-[#2F80ED]/40">
          <div className="text-center text-white">
            <Camera className="mx-auto size-12 opacity-60" />
            <p className="mt-2 text-lg font-semibold">{PHOTO_OF_THE_DAY.caption}</p>
            <p className="text-sm text-white/70">
              {PHOTO_OF_THE_DAY.photographer} · {PHOTO_OF_THE_DAY.category}
            </p>
          </div>
        </div>
      </DashboardCard>

      <DashboardCard title="Albums" description="Campus photo collections and yearbook archives.">
        <div className="grid gap-3 sm:grid-cols-2">
          {MEDIA_ALBUMS.map((album) => (
            <div key={album.id} className="rounded-lg border border-border px-3 py-3">
              <p className="font-medium text-foreground">{album.title}</p>
              <p className="text-sm text-muted-foreground">
                {album.photoCount} photos · {album.dateLabel}
              </p>
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/athletics">
              Athletics media
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </DashboardCard>
    </>
  );
}
