import Link from "next/link";
import {
  CalendarDays,
  ClipboardList,
  Film,
  ListChecks,
  Newspaper,
  School,
  Trophy,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { HighlightGrid } from "@/components/sports/highlight-grid";
import { SportSwitcher } from "@/components/sports/sport-switcher";
import { SportsBanner } from "@/components/sports/sports-banner";
import {
  GameEditorPanel,
  HighlightReviewList,
  OpponentDirectoryPanel,
  PlayerStatEditor,
  PlayerStatTable,
  ReportReviewList,
  RosterPanel,
  SportManagerPanel,
} from "@/components/sports/sports-desk-panels";
import {
  GameReportForm,
  HighlightSubmitForm,
} from "@/components/sports/sports-student-forms";
import { Button } from "@/components/ui/button";
import {
  GAME_RESULT_LABELS,
  GAME_STATUS_LABELS,
  REPORT_KIND_LABELS,
  formatGameDateTime,
} from "@/config/sports-highlights";
import type {
  SportsDeskData,
  SportsHubData,
  SportsPlayerStatView,
} from "@/services/sports-highlights-service";

function ScheduleList({
  games,
  emptyLabel,
}: {
  games: SportsHubData["recentGames"];
  emptyLabel: string;
}) {
  if (games.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="space-y-2">
      {games.map((game) => (
        <li key={game.id}>
          <Link
            href={`/sports/games/${game.id}`}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted"
          >
            {game.opponentLogoUrl ? (
              // Opponent logos are uploaded by crew or pasted from school sites.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={game.opponentLogoUrl}
                alt=""
                className="size-8 shrink-0 rounded-md bg-white object-contain p-0.5 ring-1 ring-border"
              />
            ) : (
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase text-muted-foreground"
                aria-hidden="true"
              >
                {game.opponentName.slice(0, 2)}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {game.sportName} {game.site === "HOME" ? "vs" : "at"}{" "}
                {game.opponentName}
              </span>
              <span className="block text-xs text-muted-foreground">
                {formatGameDateTime(game.kickoffAt)}
                {game.venue ? ` · ${game.venue}` : ""}
              </span>
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {game.teamScore !== null && game.opponentScore !== null
                ? `${game.teamScore}–${game.opponentScore}`
                : GAME_STATUS_LABELS[game.status]}
              {game.result ? (
                <span className="ml-2 text-xs font-medium text-muted-foreground">
                  {GAME_RESULT_LABELS[game.result]}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Audience view: banner, sport switcher, highlights, schedule, student
 * write-ups, and the fill-out forms.
 */
export function SportsAudienceSections({
  data,
  basePath,
  extraParams,
  storageConfigured,
  canManage = false,
  showFormsSection = true,
}: {
  data: SportsHubData;
  basePath: string;
  extraParams?: Record<string, string>;
  storageConfigured: boolean;
  canManage?: boolean;
  showFormsSection?: boolean;
}) {
  const sportLabel = data.activeSport?.name ?? "All sports";

  return (
    <div className="space-y-6">
      <SportsBanner
        lastGame={data.lastGame}
        upcoming={data.upcoming}
        sportLabel={sportLabel}
        canManage={canManage}
      />

      <SportSwitcher
        sports={data.sports}
        activeSlug={data.activeSport?.slug ?? null}
        basePath={basePath}
        extraParams={extraParams}
      />

      <DashboardCard
        title="Top highlights"
        description="Game clips, photos, and stories from the Broadcasting sports desk."
        icon={<Film className="size-5" />}
        status={{ label: sportLabel, variant: "info" }}
      >
        <HighlightGrid
          highlights={data.highlights}
          emptyLabel="No highlights published for this sport yet."
        />
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Recent games"
          description="Scores and results."
          icon={<Trophy className="size-5" />}
        >
          <ScheduleList
            games={data.recentGames}
            emptyLabel="No completed games yet."
          />
        </DashboardCard>

        <DashboardCard
          title="Upcoming schedule"
          description="Who's next on the board."
          icon={<CalendarDays className="size-5" />}
        >
          <ScheduleList
            games={data.upcoming}
            emptyLabel="Nothing scheduled right now."
          />
        </DashboardCard>
      </div>

      <DashboardCard
        title="Student write-ups"
        description="Recaps and previews written by students, approved by crew."
        icon={<Newspaper className="size-5" />}
      >
        {data.publishedReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published write-ups yet — submit one below.
          </p>
        ) : (
          <ul className="space-y-4">
            {data.publishedReports.map((report) => (
              <li key={report.id} className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
                  {REPORT_KIND_LABELS[report.kind]}
                  {report.gameLabel ? ` · ${report.gameLabel}` : ""}
                </p>
                <h3 className="mt-1 font-semibold text-[#0A2342] dark:text-white">
                  {report.headline}
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                  {report.body}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  By {report.authorName}
                  {report.playerOfGame
                    ? ` · Player of the game: ${report.playerOfGame}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      {data.activeSport && data.players.length > 0 ? (
        <DashboardCard
          title={`${data.activeSport.name} roster`}
          description="Player pages for stats and player-of-the-game callouts."
          icon={<Users className="size-5" />}
        >
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.players.map((player) => (
              <li
                key={player.id}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
              >
                {player.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={player.photoUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {player.jerseyNumber ?? player.firstName.slice(0, 1)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
                    {player.fullName}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[player.position, player.gradeYear]
                      .filter(Boolean)
                      .join(" · ") || "Roster"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      {showFormsSection ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardCard
            title="Write about a game"
            description="Recap what happened or preview what's next."
            icon={<ClipboardList className="size-5" />}
          >
            <GameReportForm
              pastGames={data.recentGames}
              upcomingGames={data.upcoming}
            />
          </DashboardCard>

          <DashboardCard
            title="Send in a highlight"
            description="Clips, photos, and stories for the highlights grid."
            icon={<Film className="size-5" />}
          >
            <HighlightSubmitForm
              sports={data.sports}
              games={data.reportableGames}
              storageConfigured={storageConfigured}
              canManage={canManage}
              defaultSportId={data.activeSport?.id}
            />
          </DashboardCard>
        </div>
      ) : null}
    </div>
  );
}

/** Crew production view: school import, schedule, review queues, stats. */
export function SportsDeskSections({
  data,
  basePath,
  extraParams,
  activeSportSlug,
  storageConfigured,
  stats,
}: {
  data: SportsDeskData;
  basePath: string;
  extraParams?: Record<string, string>;
  activeSportSlug: string | null;
  storageConfigured: boolean;
  stats: SportsPlayerStatView[];
}) {
  const activeSport =
    data.sports.find((sport) => sport.slug === activeSportSlug) ?? null;

  return (
    <div className="space-y-6">
      <SportSwitcher
        sports={data.sports}
        activeSlug={activeSport?.slug ?? null}
        basePath={basePath}
        extraParams={extraParams}
      />

      <DashboardCard
        title="Opponent directory"
        description="Import the schools we play — upload their logo, name their team per sport. Students pick from this list."
        icon={<School className="size-5" />}
        status={{
          label: `${data.schools.length} school${data.schools.length === 1 ? "" : "s"}`,
          variant: "info",
        }}
      >
        <OpponentDirectoryPanel
          schools={data.schools}
          sports={data.sports}
          storageConfigured={storageConfigured}
        />
      </DashboardCard>

      <DashboardCard
        title="Schedule & scores"
        description="Post games, set scores, and feature the ones worth leading with."
        icon={<CalendarDays className="size-5" />}
      >
        <GameEditorPanel
          sports={data.sports}
          teams={data.teams}
          games={data.games}
          defaultSportId={activeSport?.id}
        />
      </DashboardCard>

      <DashboardCard
        title="Highlight queue"
        description="Publish, feature, or archive submitted clips and photos."
        icon={<Film className="size-5" />}
      >
        <HighlightReviewList highlights={data.highlights} />
      </DashboardCard>

      <DashboardCard
        title="Student write-ups"
        description="Approve recaps and previews before they publish."
        icon={<Newspaper className="size-5" />}
      >
        <ReportReviewList reports={data.reports} />
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Roster"
          description="Players available for stat lines and player-of-the-game."
          icon={<Users className="size-5" />}
        >
          <RosterPanel
            sports={data.sports}
            players={data.players}
            storageConfigured={storageConfigured}
            defaultSportId={activeSport?.id}
          />
        </DashboardCard>

        <DashboardCard
          title="Player stats"
          description={
            activeSport
              ? `Record a ${activeSport.name} stat line for one game.`
              : "Pick a sport above to record stats with the right stat sheet."
          }
          icon={<ListChecks className="size-5" />}
        >
          {activeSport ? (
            <div className="space-y-5">
              <PlayerStatEditor
                players={data.players}
                games={data.games}
                sportSlug={activeSport.slug}
              />
              <PlayerStatTable stats={stats} sportSlug={activeSport.slug} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Choose a sport to load its stat sheet.
            </p>
          )}
        </DashboardCard>
      </div>

      <DashboardCard
        title="Sport list"
        description="Turn sports on or off in the switcher, or add a new one."
        icon={<Trophy className="size-5" />}
      >
        <SportManagerPanel sports={data.sports} />
      </DashboardCard>

      <div>
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/sports">Open the public Sports page</Link>}
        />
      </div>
    </div>
  );
}
