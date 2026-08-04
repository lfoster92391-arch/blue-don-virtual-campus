import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudioConsole } from "@/components/studio/studio-console";
import { getBlueDonLiveRtmpPublicConfig } from "@/config/broadcast-media";
import { ROLE_LABELS } from "@/config/roles";
import { requireCampusAccess } from "@/lib/auth/session";
import { getStudioConsoleSnapshot } from "@/services/broadcast-studio-service";
import { canManageCampusMedia } from "@/services/media-service";
import { ensureStudioOverlay } from "@/services/studio-graphics-service";

export const metadata: Metadata = {
  title: "Broadcast Control Studio",
};

export default async function BroadcastStudioPage() {
  const user = await requireCampusAccess();

  if (!(await canManageCampusMedia(user.id, user.role))) {
    redirect("/organizations/broadcasting?tab=media");
  }

  // The overlay's session key is handed over here, once, with the crew-gated
  // render — it is deliberately absent from the snapshot the console re-polls.
  const [snapshot, overlay] = await Promise.all([
    getStudioConsoleSnapshot(),
    ensureStudioOverlay(),
  ]);
  const rtmp = getBlueDonLiveRtmpPublicConfig();

  return (
    <StudioConsole
      initialSnapshot={snapshot}
      operatorName={user.displayName || user.email}
      operatorRole={ROLE_LABELS[user.role] ?? user.role}
      streamKeyHint={rtmp.streamKeyHint}
      hasSharedStreamKey={rtmp.hasSharedStreamKey}
      overlayPath={overlay?.path ?? null}
    />
  );
}
