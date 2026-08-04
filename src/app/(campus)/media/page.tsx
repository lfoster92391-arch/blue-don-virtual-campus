import Link from "next/link";
import { ArrowRight, Video } from "lucide-react";

import { MediaHubSections } from "@/components/media/media-hub-sections";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getBlueDonLiveRtmpConfig } from "@/config/broadcast-media";
import { getModuleShell } from "@/config/module-shells";
import { enforceFocusClubAccess } from "@/lib/auth/focus-club-guard";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import { getMemoryHighlights } from "@/services/madonna-culture-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  isCampusMediaStorageConfigured,
  listSchoolBroadcasts,
  listUserMediaUploads,
} from "@/services/media-service";

export default async function MediaPage() {
  const config = getModuleShell("media")!;
  const user = await requireCompleteProfile();
  const identity = await resolveAccessIdentity(user);
  await enforceFocusClubAccess({
    userId: user.id,
    role: identity.navRole,
    clubSlug: "broadcasting",
    options: {
      forceScoped: identity.isPreviewing,
      membershipUserId: identity.membershipUserId,
      forcedMembershipSlugs: identity.forcedMembershipSlugs,
    },
  });
  const [canManageMedia, schoolBroadcasts, myUploads, activeLive, dailyAnnouncement] =
    await Promise.all([
      canManageCampusMedia(user.id, user.role),
      listSchoolBroadcasts(),
      listUserMediaUploads(user.id),
      getActiveLiveStream(),
      getTodaysBroadcastAnnouncement(),
    ]);
  const memories = getMemoryHighlights();
  const rtmp = getBlueDonLiveRtmpConfig();

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Video className="size-3.5" aria-hidden="true" />
          Media + Live
        </span>
      }
    >
      <MediaHubSections
        schoolBroadcasts={schoolBroadcasts}
        myUploads={myUploads}
        activeLive={activeLive}
        canManageMedia={canManageMedia}
        storageConfigured={isCampusMediaStorageConfigured()}
        currentUserId={user.id}
        rtmp={rtmp}
        dailyAnnouncement={dailyAnnouncement}
      />

      <DashboardCard
        title="Madonna Memories"
        description="Photo of the Week, Throwback Thursday, and event highlights."
        status={{ label: "W18", variant: "info" }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {memories.map((item) => (
            <div key={item.id} className="rounded-lg border border-border px-3 py-3">
              <p className="flex items-center gap-2 font-medium text-foreground">
                <span>{item.emoji}</span>
                {item.title}
              </p>
              <p className="text-xs text-muted-foreground">{item.dateLabel}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/memories">
              All memories
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </DashboardCard>
    </ShellPage>
  );
}
