import { Video } from "lucide-react";

import { MediaHubSections } from "@/components/media/media-hub-sections";
import { ShellPage } from "@/components/layout/shell-page";
import { getBlueDonLiveRtmpConfig } from "@/config/broadcast-media";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
  isCampusMediaStorageConfigured,
  listSchoolBroadcasts,
  listUserMediaUploads,
} from "@/services/media-service";

export default async function MediaPage() {
  // Audience surface: any signed-in campus user may watch. Production tools
  // remain gated by canManageCampusMedia inside MediaHubSections.
  const user = await requireCompleteProfile();
  const [canManageMedia, schoolBroadcasts, myUploads, activeLive, dailyAnnouncement] =
    await Promise.all([
      canManageCampusMedia(user.id, user.role),
      listSchoolBroadcasts(),
      listUserMediaUploads(user.id),
      getActiveLiveStream(),
      getTodaysBroadcastAnnouncement(),
    ]);
  const rtmp = getBlueDonLiveRtmpConfig();

  return (
    <ShellPage
      title="Watch Broadcasting"
      description="Live streams and past broadcasts from Studio B — open to everyone on campus."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2342]/10 px-3 py-1 text-xs font-medium text-[#0A2342] dark:bg-[#C9A227]/15 dark:text-[#C9A227]">
          <Video className="size-3.5" aria-hidden="true" />
          Campus audience
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
    </ShellPage>
  );
}
