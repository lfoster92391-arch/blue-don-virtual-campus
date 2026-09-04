import type { Metadata } from "next";

import { WatchLiveLanding } from "@/components/media/watch-live-landing";
import { PUBLIC_WATCH_PATH } from "@/config/phone-live";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import { getPublicLiveWatchPayload } from "@/services/phone-live-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Watch Madonna Home Games LIVE",
  description:
    "Watch Madonna High School home games live — student broadcast team, no commentary, no login required.",
  alternates: { canonical: PUBLIC_WATCH_PATH },
};

export default async function PublicWatchPage() {
  const [payload, schedule] = await Promise.all([
    getPublicLiveWatchPayload(),
    getBroadcastSchedule().catch(() => null),
  ]);

  return (
    <WatchLiveLanding
      initial={payload}
      nextAirAt={schedule?.nextAirAt?.toISOString() ?? null}
      nextTitle={schedule?.title ?? null}
    />
  );
}
