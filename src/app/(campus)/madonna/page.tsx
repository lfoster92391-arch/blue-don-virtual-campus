import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import {
  MadonnaHubHeader,
  MadonnaSectionNav,
  MadonnaSectionTiles,
  TodaySnapshot,
  WhatsHappening,
} from "@/components/madonna/madonna-hub-panels";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import type { MadonnaSectionKey } from "@/config/madonna-hub";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import {
  getActiveLiveStream,
  listSportsRecapVideos,
} from "@/services/media-service";
import {
  buildEmptyHubDigest,
  getTodayHubDigest,
} from "@/services/school-hub-service";
import { getCurrentOrNextGame } from "@/services/sports-highlights-service";

export const metadata = {
  title: "Madonna Hub",
  description:
    "The Madonna student front door — today's schedule and announcement, Blue Don sports, the campus broadcast, school info, and ways to get involved.",
};

/** Soft-fail wrapper — no single tile should take the front door down. */
async function safe<T>(work: Promise<T>, fallback: T): Promise<T> {
  try {
    return await work;
  } catch (error) {
    console.error("[madonna-hub] data failed:", error);
    return fallback;
  }
}

export default async function MadonnaHubPage() {
  const user = await requireCompleteProfile();
  const firstName = user.firstName ?? user.displayName.split(" ")[0] ?? "Don";
  const isParent = user.role === "parent";

  const [hub, announcement, activeLive, schedule, nextGame, sportsVideos] =
    await Promise.all([
      safe(
        getTodayHubDigest({ id: user.id, role: user.role }),
        buildEmptyHubDigest(),
      ),
      safe(getTodaysBroadcastAnnouncement(), null),
      safe(getActiveLiveStream(), null),
      safe(getBroadcastSchedule(), null),
      safe(getCurrentOrNextGame({ withinHours: 24 * 14 }), null),
      safe(listSportsRecapVideos({ take: 200 }), []),
    ]);

  // Tile meta is live or absent — never a placeholder count.
  const meta: Partial<Record<MadonnaSectionKey, string>> = {};
  if (announcement) {
    meta.today = "Announcement posted";
  }
  if (sportsVideos.length > 0) {
    meta.sports = `${sportsVideos.length} ${sportsVideos.length === 1 ? "video" : "videos"} on file`;
  }
  if (activeLive) {
    meta.broadcast = "Live right now";
  } else if (schedule?.nextAirAt) {
    meta.broadcast = "Next air time set";
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <MadonnaHubHeader
        firstName={firstName}
        dateLabel={hub.dateLabel}
        weather={hub.weather}
        isLive={Boolean(activeLive)}
        subtitle={
          isParent
            ? "Your window into Madonna — the day's schedule, your student's teams, the campus broadcast, and school info."
            : "Everything Madonna, in five places. Start with today."
        }
      />

      <MadonnaSectionNav />

      {activeLive ? (
        <LiveNowPanel
          activeLive={activeLive}
          nextAirAt={schedule?.nextAirAt ?? null}
          watchHref="/madonna/broadcast"
        />
      ) : null}

      <TodaySnapshot
        bell={hub.bell}
        isSchoolDay={hub.isSchoolDay}
        announcement={announcement}
      />

      <WhatsHappening
        nextGame={nextGame}
        activeLiveTitle={activeLive?.title ?? null}
        nextAirAt={schedule?.nextAirAt ?? null}
      />

      <MadonnaSectionTiles role={user.role} meta={meta} />

      <FuelTheDonsRow />

      {isParent ? (
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/parent"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            Parent Portal
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/parent/guide"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-medium text-[#0A2342] transition-colors hover:bg-muted dark:text-white"
          >
            Parent Guide
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}
