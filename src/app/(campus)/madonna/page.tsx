import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { HighlightGrid } from "@/components/sports/highlight-grid";
import {
  MadonnaHubHeader,
  MadonnaSectionNav,
  MadonnaSectionTiles,
  TodaySnapshot,
  WhatsHappening,
} from "@/components/madonna/madonna-hub-panels";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { Button } from "@/components/ui/button";
import { PageDropdown } from "@/components/ui/page-dropdown";
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
import { getCurrentOrNextGame, listHighlights } from "@/services/sports-highlights-service";

export const metadata = {
  title: "Madonna Hub",
  description:
    "The Madonna student front door — today's announcement, Blue Don sports, the campus broadcast, school info, and ways to get involved.",
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

  const [hub, announcement, activeLive, schedule, nextGame, sportsVideos, highlights] =
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
      safe(listHighlights({ publishedOnly: true, take: 8 }), []),
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
            ? "Your window into Madonna — the day's announcement, your student's teams, the campus broadcast, and school info."
            : "Everything Madonna, in five places. Start with today."
        }
      />

      <section aria-labelledby="madonna-highlights">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2
            id="madonna-highlights"
            className="text-lg font-semibold text-[#0A2342] dark:text-white"
          >
            Highlights
          </h2>
          <Link
            href="/madonna/sports"
            className="text-sm font-medium text-[#2F80ED] hover:underline"
          >
            All sports
          </Link>
        </div>
        <HighlightGrid
          highlights={highlights}
          emptyLabel="No highlights posted yet."
        />
      </section>

      <MadonnaSectionNav />

      {activeLive ? (
        <LiveNowPanel
          activeLive={activeLive}
          nextAirAt={schedule?.nextAirAt ?? null}
          watchHref="/watch"
        />
      ) : null}

      <PageDropdown
        id="today"
        title="Today"
        description="The announcement Broadcasting posted this morning."
      >
        <TodaySnapshot announcement={announcement} />
      </PageDropdown>

      <PageDropdown
        id="happening"
        title="What's happening"
        description="The next game and the next broadcast."
      >
        <WhatsHappening
          nextGame={nextGame}
          activeLiveTitle={activeLive?.title ?? null}
          nextAirAt={schedule?.nextAirAt ?? null}
        />
      </PageDropdown>

      <PageDropdown
        id="explore"
        title="Explore Madonna"
        description="Today, sports, broadcast, campus, and ways to get involved."
      >
        <MadonnaSectionTiles role={user.role} meta={meta} />
      </PageDropdown>

      <PageDropdown id="lunch" title="Lunch" description="Menus and ordering on FuelTheDons.">
        <FuelTheDonsRow />
      </PageDropdown>

      {isParent ? (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="action"
            nativeButton={false}
            render={
              <Link href="/parent">
                Parent Portal
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <Button
            variant="action"
            nativeButton={false}
            render={
              <Link href="/parent/guide">
                Parent Guide
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
        </div>
      ) : null}
    </section>
  );
}
