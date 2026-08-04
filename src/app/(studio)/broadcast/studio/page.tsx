import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StudioControlBar } from "@/components/studio/studio-control-bar";
import { StudioHeader } from "@/components/studio/studio-header";
import {
  AudioPanel,
  GraphicsPanel,
  ProgramPanel,
  RunOfShowPanel,
  ScenesPanel,
  ScoreboardPanel,
  SourcesPanel,
  SponsorsPanel,
  SystemHealthPanel,
} from "@/components/studio/studio-panels";
import { getBlueDonLiveRtmpPublicConfig } from "@/config/broadcast-media";
import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import { ROLE_LABELS } from "@/config/roles";
import { requireCampusAccess } from "@/lib/auth/session";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import {
  canManageCampusMedia,
  getActiveLiveStream,
} from "@/services/media-service";

export const metadata: Metadata = {
  title: "Broadcast Control Studio",
};

export default async function BroadcastStudioPage() {
  const user = await requireCampusAccess();

  if (!(await canManageCampusMedia(user.id, user.role))) {
    redirect("/organizations/broadcasting?tab=media");
  }

  const [activeLive, schedule] = await Promise.all([
    getActiveLiveStream(),
    getBroadcastSchedule(),
  ]);
  const rtmp = getBlueDonLiveRtmpPublicConfig();

  const onAirSince =
    activeLive?.publishedAt?.toISOString() ??
    activeLive?.createdAt.toISOString() ??
    null;

  return (
    <>
      <StudioHeader
        operatorName={user.displayName || user.email}
        operatorRole={ROLE_LABELS[user.role] ?? user.role}
        onAirSince={activeLive ? onAirSince : null}
        nextAirLabel={formatNextAir(schedule.nextAirAt)}
        programTitle={activeLive?.title ?? null}
      />

      <main className="min-h-0 flex-1 overflow-auto p-2 lg:overflow-hidden">
        <div className="grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-[13rem_minmax(0,1fr)_19rem]">
          <div className="flex min-h-0 flex-col gap-2">
            <ScenesPanel />
            <SystemHealthPanel streamKeyHint={rtmp.streamKeyHint} />
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <ProgramPanel
              programTitle={activeLive?.title ?? null}
              embedUrl={activeLive?.embedUrl ?? null}
              live={Boolean(activeLive)}
            />
            <div className="grid min-h-0 gap-2 sm:grid-cols-2">
              <SourcesPanel />
              <AudioPanel />
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2">
            <ScoreboardPanel />
            <GraphicsPanel />
            <SponsorsPanel />
            <RunOfShowPanel />
          </div>
        </div>
      </main>

      <StudioControlBar
        activeLiveId={activeLive?.id ?? null}
        programTitle={activeLive?.title ?? null}
      />
    </>
  );
}

function formatNextAir(nextAirAt: Date | null): string | null {
  if (!nextAirAt) {
    return null;
  }

  return nextAirAt.toLocaleString("en-US", {
    timeZone: CAMPUS_WEATHER_LOCATION.timezone,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
