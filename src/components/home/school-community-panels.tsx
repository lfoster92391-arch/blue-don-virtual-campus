import Link from "next/link";
import { Megaphone, Radio, Users } from "lucide-react";

import { BriefingSection } from "@/components/home/briefing-section";
import { LiveNowPanel } from "@/components/media/live-now-panel";
import { HighlightGrid } from "@/components/sports/highlight-grid";
import { SportsBanner } from "@/components/sports/sports-banner";
import { CAMPUS_TEAM_NAME } from "@/config/sports-highlights";
import type { CampusMediaItemView } from "@/services/media-service";
import type {
  SportsGameView,
  SportsHighlightView,
  SportsPlayerView,
} from "@/services/sports-highlights-service";

export type SchoolCommunityData = {
  lastGame: SportsGameView | null;
  upcoming: SportsGameView[];
  highlights: SportsHighlightView[];
  players: SportsPlayerView[];
  activeLive: CampusMediaItemView | null;
  nextAirAt: Date | null;
};

function PlayerSnapshot({ players }: { players: SportsPlayerView[] }) {
  if (players.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        The roster appears here when coaches publish players.
      </p>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {players.slice(0, 8).map((player) => (
        <li
          key={player.id}
          className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {player.jerseyNumber ?? player.firstName.slice(0, 1)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[#0A2342] dark:text-white">
              {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
              {player.fullName}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {[player.position, player.gradeYear].filter(Boolean).join(" · ") ||
                "Player"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Shared athletics + request blocks for the signed-in school home. */
export function SchoolCommunityPanels({
  data,
  showRequests = true,
  showPlayers = true,
  showHighlights = true,
  linkGames = true,
  collapsible = true,
}: {
  data: SchoolCommunityData;
  showRequests?: boolean;
  showPlayers?: boolean;
  showHighlights?: boolean;
  linkGames?: boolean;
  /** Open sports news on student home; keep dropdowns on denser admin pages. */
  collapsible?: boolean;
}) {
  return (
    <div className="space-y-3">
      {showHighlights ? (
        <BriefingSection
          id="highlights"
          eyebrow="Highlights"
          title="Highlights"
          description="Clips and photos the sports desk has published."
          collapsible={collapsible}
          actions={
            linkGames ? (
              <Link
                href="/madonna/sports"
                className="text-sm font-medium text-[#2F80ED] hover:underline"
              >
                All sports
              </Link>
            ) : (
              <Link
                href="/watch"
                className="text-sm font-medium text-[#2F80ED] hover:underline"
              >
                Watch live
              </Link>
            )
          }
        >
          <HighlightGrid
            highlights={data.highlights}
            emptyLabel="No highlights posted yet."
            linkGames={linkGames}
          />
        </BriefingSection>
      ) : null}

      {showPlayers ? (
        <BriefingSection
          id="players"
          eyebrow="Players"
          title="Players"
          description={`A snapshot of ${CAMPUS_TEAM_NAME} athletes.`}
          collapsible={collapsible}
        >
          <PlayerSnapshot players={data.players} />
        </BriefingSection>
      ) : null}

      <BriefingSection
        id="games"
        eyebrow="Games"
        title="Games"
        description="Latest result and what is coming up."
        collapsible={collapsible}
      >
        <SportsBanner
          lastGame={data.lastGame}
          upcoming={data.upcoming}
          sportLabel="Blue Don athletics"
          linkGames={linkGames}
        />
      </BriefingSection>

      <BriefingSection
        id="live"
        eyebrow="Live"
        title="LIVE broadcast / game"
        description="The stream when Broadcasting is on air."
        collapsible={collapsible}
      >
        <LiveNowPanel
          activeLive={data.activeLive}
          nextAirAt={data.nextAirAt}
          watchHref="/watch"
          offlineLabel="Nothing is on air right now."
        />
        <Link
          href="/watch"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#2F80ED] hover:underline"
        >
          <Radio className="size-3.5" aria-hidden="true" />
          Open the public watch page
        </Link>
      </BriefingSection>

      {showRequests ? (
        <BriefingSection
          id="requests"
          eyebrow="Requests"
          title="Send or submit requests"
          description="Ask Broadcasting for an announcement, cover a game, or reach the help desk."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/madonna/participate"
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40"
            >
              <Megaphone className="mt-0.5 size-4 text-[#2F80ED]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-[#0A2342] dark:text-white">
                  Participate
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Announcements, game coverage, and club asks.
                </span>
              </span>
            </Link>
            <Link
              href="/service-desk"
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40"
            >
              <Users className="mt-0.5 size-4 text-[#2F80ED]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-[#0A2342] dark:text-white">
                  Help desk
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  Facilities and IT requests for school accounts.
                </span>
              </span>
            </Link>
          </div>
        </BriefingSection>
      ) : null}
    </div>
  );
}
