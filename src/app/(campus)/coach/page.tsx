import { Camera, Clapperboard, ClipboardList, Trophy, Upload, Users } from "lucide-react";

import {
  CoachSectionNav,
  isCoachTab,
  type CoachTabId,
} from "@/components/coach/coach-section-nav";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { VideoGrid } from "@/components/media/video-grid";
import { VideoUploadForm } from "@/components/media/video-upload-form";
import { GameScorePad } from "@/components/sports/game-score-pad";
import {
  GameEditorPanel,
  OpponentDirectoryPanel,
  PlayerStatEditor,
  PlayerStatTable,
  RosterPanel,
} from "@/components/sports/sports-desk-panels";
import { SportsBanner } from "@/components/sports/sports-banner";
import { SportsGuide } from "@/components/sports/sports-guide";
import { SportSwitcher } from "@/components/sports/sport-switcher";
import { CAMPUS_MEDIA_MAX_LABEL } from "@/config/campus-video";
import { requireCoachWorkspace } from "@/lib/auth/session";
import { isCampusMediaStorageConfigured, listCoachFilmVideos } from "@/services/media-service";
import {
  getSportsHubData,
  isSportsImageStorageConfigured,
  listGames,
  listOpponentSchools,
  listPlayers,
  listPlayerStats,
} from "@/services/sports-highlights-service";

export const metadata = {
  title: "Coach",
  description:
    "Film room, scores, roster, stats, and player photos for Blue Don coaches.",
};

type CoachPageProps = {
  searchParams: Promise<{ tab?: string; sport?: string }>;
};

export default async function CoachPage({ searchParams }: CoachPageProps) {
  const user = await requireCoachWorkspace();
  const { tab: rawTab, sport } = await searchParams;
  const tab: CoachTabId = isCoachTab(rawTab) ? rawTab : "film";

  const [hub, film, storageConfigured, imageStorage] = await Promise.all([
    getSportsHubData(sport ?? null),
    listCoachFilmVideos({ take: 80 }),
    Promise.resolve(isCampusMediaStorageConfigured()),
    Promise.resolve(isSportsImageStorageConfigured()),
  ]);

  const sportId = hub.activeSport?.id;
  const [games, stats, allPlayers, schools] = await Promise.all([
    listGames({ sportId, take: 40 }),
    listPlayerStats({}),
    hub.activeSport ? Promise.resolve(hub.players) : listPlayers(),
    listOpponentSchools(),
  ]);
  const players = hub.activeSport ? hub.players : allPlayers;
  const teams = schools.flatMap((school) => school.teams);

  const playerIds = new Set(players.map((player) => player.id));
  const sportStats = sportId
    ? stats.filter((row) => playerIds.has(row.playerId))
    : stats;

  return (
    <ShellPage
      title="Coach"
      description="Film room, scores, roster, stat sheet, and player photos — coaches and athletics staff only."
    >
      <div className="space-y-6">
        <SportsGuide placeholder="Find a game, player, or last score…" />
        <CoachSectionNav active={tab} sportSlug={sport} />
        <SportSwitcher
          sports={hub.sports}
          activeSlug={hub.activeSport?.slug ?? null}
          basePath="/coach"
          extraParams={{ tab }}
        />

        {tab === "film" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <DashboardCard
              title="Film room"
              description="Game and practice film for the coaching staff. This library does not appear on the student sports pages."
              icon={<Clapperboard className="size-5" />}
            >
              <VideoGrid
                items={film}
                searchable
                watchLaterUserId={user.id}
                emptyLabel="No film yet. Upload a clip or paste an unlisted YouTube link."
              />
            </DashboardCard>
            <DashboardCard
              title="Add film"
              description={`MP4, WebM, or MOV up to ${CAMPUS_MEDIA_MAX_LABEL}. Longer games work best as an unlisted YouTube link.`}
              icon={<Upload className="size-5" />}
            >
              <VideoUploadForm
                storageConfigured={storageConfigured}
                variant="coach-film"
                titlePlaceholder="Dons vs. Oak Glen — game film"
                submitLabel="Add to film room"
              />
            </DashboardCard>
          </div>
        ) : null}

        {tab === "scores" ? (
          <div className="space-y-6">
            <SportsBanner
              lastGame={hub.lastGame}
              upcoming={hub.upcoming}
              sportLabel={hub.activeSport?.name ?? "All sports"}
              canManage
            />
            <div className="grid gap-6 xl:grid-cols-2">
              <DashboardCard
                title="Post a score"
                description="Blue Dons score first, opponent second. Mark Final so the result shows on Sports."
                icon={<Trophy className="size-5" />}
              >
                <GameScorePad games={games} />
              </DashboardCard>
              <DashboardCard
                title="Opponent logos"
                description="Add a school, upload their mark, then link it to a sport so matchup cards show both logos."
                icon={<Users className="size-5" />}
              >
                <OpponentDirectoryPanel
                  schools={schools}
                  sports={hub.sports}
                  storageConfigured={imageStorage}
                />
              </DashboardCard>
            </div>
            <DashboardCard
              title="Schedule a game"
              description="Home vs opponent, kickoff, and optional score. Viewers see this on Blue Don Sports."
              icon={<Trophy className="size-5" />}
            >
              <GameEditorPanel
                sports={hub.sports}
                teams={teams}
                games={games}
                defaultSportId={hub.activeSport?.id}
              />
            </DashboardCard>
          </div>
        ) : null}

        {tab === "roster" ? (
          <DashboardCard
            title={
              hub.activeSport
                ? `${hub.activeSport.name} roster`
                : "Team roster"
            }
            description="Add players, jersey numbers, and positions. Same roster the sports desk and studio graphics read."
            icon={<Users className="size-5" />}
          >
            {hub.sports.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No sports are set up yet. Ask Broadcasting or an admin to add
                a sport, then come back to build the roster.
              </p>
            ) : (
              <RosterPanel
                sports={hub.sports}
                players={players}
                storageConfigured={imageStorage}
                defaultSportId={hub.activeSport?.id}
              />
            )}
          </DashboardCard>
        ) : null}

        {tab === "stats" ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <DashboardCard
              title="Enter stats"
              description={
                hub.activeSport
                  ? `Stat lines for ${hub.activeSport.name}. Pick a player and a game.`
                  : "Choose a sport above to match the right stat fields."
              }
              icon={<ClipboardList className="size-5" />}
            >
              {hub.activeSport ? (
                <PlayerStatEditor
                  players={players}
                  games={games}
                  sportSlug={hub.activeSport.slug}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a sport to open the stat sheet.
                </p>
              )}
            </DashboardCard>
            <DashboardCard
              title="Stat board"
              description="Saved lines for this sport."
              icon={<ClipboardList className="size-5" />}
            >
              {hub.activeSport ? (
                <PlayerStatTable
                  stats={sportStats}
                  sportSlug={hub.activeSport.slug}
                  emptyLabel="No stats recorded for this sport yet."
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a sport to see the board.
                </p>
              )}
            </DashboardCard>
          </div>
        ) : null}

        {tab === "photos" ? (
          <DashboardCard
            title="Player photos"
            description="Upload a headshot when you add or update a player. Photos show on the roster and in the studio graphics panel."
            icon={<Camera className="size-5" />}
          >
            {players.length > 0 ? (
              <ul className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {players.map((player) => (
                  <li
                    key={player.id}
                    className="overflow-hidden rounded-xl border border-border bg-background/60"
                  >
                    <div className="aspect-[4/5] bg-muted">
                      {player.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={player.photoUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                          {player.jerseyNumber ?? player.firstName.slice(0, 1)}
                        </div>
                      )}
                    </div>
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium">
                        {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
                        {player.fullName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[player.position, player.gradeYear]
                          .filter(Boolean)
                          .join(" · ") || "No photo yet"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mb-4 text-sm text-muted-foreground">
                {hub.activeSport
                  ? "No players on this roster yet. Add one with a photo below."
                  : "Choose a sport to see player photos, or add a player below."}
              </p>
            )}
            {hub.sports.length > 0 ? (
              <RosterPanel
                sports={hub.sports}
                players={[]}
                storageConfigured={imageStorage}
                defaultSportId={hub.activeSport?.id}
              />
            ) : null}
          </DashboardCard>
        ) : null}
      </div>
    </ShellPage>
  );
}
