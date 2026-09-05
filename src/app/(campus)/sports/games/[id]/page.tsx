import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ClipboardList, Film, ListChecks } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { GameScorePad } from "@/components/sports/game-score-pad";
import { HighlightGrid } from "@/components/sports/highlight-grid";
import { OpponentMark } from "@/components/sports/matchup-marks";
import {
  PlayerStatEditor,
  PlayerStatTable,
} from "@/components/sports/sports-desk-panels";
import {
  GameReportForm,
  HighlightSubmitForm,
} from "@/components/sports/sports-student-forms";
import { Button } from "@/components/ui/button";
import {
  CAMPUS_TEAM_LOGO_URL,
  CAMPUS_TEAM_NAME,
  GAME_RESULT_LABELS,
  GAME_SITE_LABELS,
  GAME_STATUS_LABELS,
  REPORT_KIND_LABELS,
  formatGameDateTime,
} from "@/config/sports-highlights";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canManageTeamRoster,
  getGame,
  isSportsImageStorageConfigured,
  listGameReports,
  listHighlights,
  listPlayers,
  listPlayerStats,
  listSports,
} from "@/services/sports-highlights-service";

type GamePageProps = {
  params: Promise<{ id: string }>;
};

export default async function GameDetailPage({ params }: GamePageProps) {
  const user = await requireCompleteProfile();
  const { id } = await params;

  const game = await getGame(id);
  if (!game) {
    notFound();
  }

  const [canManage, highlights, reports, players, stats, sports] =
    await Promise.all([
      canManageTeamRoster(user.id, user.role),
      listHighlights({ gameId: game.id, publishedOnly: true }),
      listGameReports({ gameId: game.id, publishedOnly: true }),
      listPlayers({ sportId: game.sportId }),
      listPlayerStats({ gameId: game.id }),
      listSports(),
    ]);

  // Status, not the clock — a postponed game still wants a preview form.
  const isUpcoming = game.status === "SCHEDULED" || game.status === "POSTPONED";
  const scoreLine =
    game.teamScore !== null && game.opponentScore !== null
      ? `${game.teamScore}–${game.opponentScore}`
      : null;

  return (
    <ShellPage
      title={`${CAMPUS_TEAM_NAME} ${game.site === "HOME" ? "vs" : "at"} ${game.opponentName}`}
      description={`${game.sportName} · ${formatGameDateTime(game.kickoffAt)}${
        game.venue ? ` · ${game.venue}` : ""
      }`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={
              <Link href={`/sports?sport=${game.sportSlug}`}>
                All {game.sportName}
              </Link>
            }
          />
          {game.streamUrl ? (
            <Button
              size="sm"
              nativeButton={false}
              render={
                <a href={game.streamUrl} target="_blank" rel="noreferrer">
                  Watch
                </a>
              }
            />
          ) : null}
        </div>
      }
    >
      <section className="rounded-xl border border-[#0A2342]/15 bg-gradient-to-br from-[#0A2342] to-[#123a63] p-6 text-white">
        <div className="flex flex-wrap items-center gap-4">
          {/* Our mark is a static public asset; the opponent's is an upload. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CAMPUS_TEAM_LOGO_URL}
            alt={`Madonna ${CAMPUS_TEAM_NAME} logo`}
            className="size-14 rounded-lg bg-white object-contain p-1"
          />
          <OpponentMark
            name={game.opponentName}
            logoUrl={game.opponentLogoUrl}
            size="md"
            tone="dark"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              {game.sportName} · {GAME_SITE_LABELS[game.site]}
              {game.level ? ` · ${game.level}` : ""}
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {CAMPUS_TEAM_NAME} {game.site === "HOME" ? "vs" : "at"}{" "}
              {game.opponentName}
            </p>
            <p className="text-sm text-white/75">
              {formatGameDateTime(game.kickoffAt)}
              {game.venue ? ` · ${game.venue}` : ""}
            </p>
          </div>
          <div className="text-right">
            {scoreLine ? (
              <p className="text-4xl font-bold tabular-nums">{scoreLine}</p>
            ) : null}
            <span className="mt-1 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              {game.result
                ? GAME_RESULT_LABELS[game.result]
                : GAME_STATUS_LABELS[game.status]}
            </span>
          </div>
        </div>
        {game.headline ? (
          <p className="mt-4 text-base font-medium">{game.headline}</p>
        ) : null}
        {game.summary ? (
          <p className="mt-2 max-w-3xl text-sm text-white/85">{game.summary}</p>
        ) : null}
        {canManage && game.broadcastNote ? (
          <p className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-sm">
            Crew note: {game.broadcastNote}
          </p>
        ) : null}
      </section>

      {canManage ? (
        <DashboardCard
          title="Post the score"
          description="Coaches and the sports desk — Blue Dons score first."
          icon={<ClipboardList className="size-5" />}
        >
          <GameScorePad games={[game]} defaultGameId={game.id} />
        </DashboardCard>
      ) : null}

      <DashboardCard
        title="Highlights"
        description="Clips and photos from this game."
        icon={<Film className="size-5" />}
      >
        <HighlightGrid
          highlights={highlights}
          emptyLabel="No highlights published for this game yet."
        />
      </DashboardCard>

      <DashboardCard
        title="Player stats"
        description={`${game.sportName} stat lines for this game.`}
        icon={<ListChecks className="size-5" />}
      >
        <div className="space-y-5">
          <PlayerStatTable stats={stats} sportSlug={game.sportSlug} />
          {canManage ? (
            <div className="border-t border-border pt-4">
              <PlayerStatEditor
                players={players}
                games={[game]}
                sportSlug={game.sportSlug}
                defaultGameId={game.id}
              />
            </div>
          ) : null}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Student coverage"
        description="Published recaps and previews for this game."
        icon={<CalendarDays className="size-5" />}
      >
        {reports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No published write-ups for this game yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id} className="rounded-lg border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
                  {REPORT_KIND_LABELS[report.kind]}
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
                  {report.keyMoment ? ` · Key moment: ${report.keyMoment}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title={isUpcoming ? "Preview this game" : "Recap this game"}
          description="Students — tell campus what happened or what to watch for."
          icon={<ClipboardList className="size-5" />}
        >
          <GameReportForm
            pastGames={isUpcoming ? [] : [game]}
            upcomingGames={isUpcoming ? [game] : []}
            defaultGameId={game.id}
            defaultKind={isUpcoming ? "PREVIEW" : "RECAP"}
          />
        </DashboardCard>

        <DashboardCard
          title="Send in a highlight"
          description="Attach a clip or photo to this game."
          icon={<Film className="size-5" />}
        >
          <HighlightSubmitForm
            sports={sports}
            games={[game]}
            storageConfigured={isSportsImageStorageConfigured()}
            canManage={canManage}
            defaultSportId={game.sportId}
            defaultGameId={game.id}
          />
        </DashboardCard>
      </div>
    </ShellPage>
  );
}
