import Link from "next/link";
import { CalendarDays, Radio, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import {
  CampusMark,
  MatchupMarks,
} from "@/components/sports/matchup-marks";
import {
  CAMPUS_TEAM_NAME,
  formatGameDateTime,
  GAME_RESULT_LABELS,
  GAME_SITE_LABELS,
  GAME_STATUS_LABELS,
} from "@/config/sports-highlights";
import { CampusHeroWeather } from "@/components/weather/campus-hero-weather";
import type { SportsGameView } from "@/services/sports-highlights-service";
import type { CampusWeather } from "@/services/weather-service";

function GameSurface({
  href,
  className,
  children,
}: {
  href: string | null;
  className?: string;
  children: ReactNode;
}) {
  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
}

function ResultPill({ game }: { game: SportsGameView }) {
  if (game.status === "LIVE") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A227] px-3 py-1 text-xs font-semibold text-[#0A2342]">
        <Radio className="size-3.5" aria-hidden="true" />
        Live now
      </span>
    );
  }

  if (!game.result) {
    return (
      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
        {GAME_STATUS_LABELS[game.status]}
      </span>
    );
  }

  const tone =
    game.result === "WIN"
      ? "bg-[#2E8B57] text-white"
      : game.result === "LOSS"
        ? "bg-white/20 text-white"
        : "bg-white/15 text-white";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
      {GAME_RESULT_LABELS[game.result]}
    </span>
  );
}

/**
 * Top-of-page scoreboard: last night's result plus what's coming up.
 * Renders an invitation to add games when the schedule is still empty.
 */
export function SportsBanner({
  lastGame,
  upcoming,
  sportLabel,
  canManage = false,
  linkGames = true,
  weather,
}: {
  lastGame: SportsGameView | null;
  upcoming: SportsGameView[];
  sportLabel: string;
  canManage?: boolean;
  /** Guest home shows scores without sending people into school-only game pages. */
  linkGames?: boolean;
  weather?: CampusWeather | null;
}) {
  if (!lastGame && upcoming.length === 0) {
    return (
      <section className="rounded-xl border border-[#0A2342]/15 bg-gradient-to-br from-[#0A2342] to-[#123a63] p-6 text-white">
        <div className="flex items-center gap-3">
          <CampusMark />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
              Madonna {CAMPUS_TEAM_NAME} · {sportLabel}
            </p>
            <h2 className="mt-1 text-2xl font-semibold">
              No games on the board yet
            </h2>
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          {canManage
            ? "Add opponent schools to the directory, then post a game so the scoreboard and student write-up forms light up."
            : "Broadcasting posts scores and upcoming games here as soon as the schedule is set."}
        </p>
        {weather ? <CampusHeroWeather weather={weather} /> : null}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#0A2342]/15 bg-gradient-to-br from-[#0A2342] to-[#123a63] text-white">
      <div className="grid gap-px bg-white/10 lg:grid-cols-[1.4fr_1fr]">
        <div className="bg-[#0A2342] p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            <Trophy className="size-3.5" aria-hidden="true" />
            {lastGame?.status === "LIVE" ? "On the field now" : "Latest result"} ·{" "}
            {sportLabel}
          </p>

          {lastGame ? (
            <GameSurface
              href={linkGames ? `/sports/games/${lastGame.id}` : null}
              className="mt-4 block rounded-lg transition-colors hover:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-4">
                <MatchupMarks game={lastGame} tone="dark" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">
                    {CAMPUS_TEAM_NAME} {lastGame.site === "HOME" ? "vs" : "at"}{" "}
                    {lastGame.opponentName}
                  </p>
                  <p className="text-sm text-white/70">
                    {formatGameDateTime(lastGame.kickoffAt)}
                    {lastGame.venue ? ` · ${lastGame.venue}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  {lastGame.teamScore !== null &&
                  lastGame.opponentScore !== null ? (
                    <p className="text-3xl font-bold tabular-nums">
                      {lastGame.teamScore}–{lastGame.opponentScore}
                    </p>
                  ) : null}
                  <div className="mt-1">
                    <ResultPill game={lastGame} />
                  </div>
                </div>
              </div>
              {lastGame.headline ? (
                <p className="mt-3 text-sm text-white/85">{lastGame.headline}</p>
              ) : null}
            </GameSurface>
          ) : (
            <p className="mt-4 text-sm text-white/75">
              No finished games yet this season.
            </p>
          )}
        </div>

        <div className="bg-[#0A2342] p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            Coming up
          </p>
          {upcoming.length === 0 ? (
            <p className="mt-4 text-sm text-white/75">
              Nothing on the schedule right now.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((game) => (
                <li key={game.id}>
                  <GameSurface
                    href={linkGames ? `/sports/games/${game.id}` : null}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
                  >
                    <MatchupMarks game={game} size="sm" tone="dark" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {game.site === "HOME" ? "vs" : "at"} {game.opponentName}
                      </span>
                      <span className="block text-xs text-white/70">
                        {formatGameDateTime(game.kickoffAt)} ·{" "}
                        {GAME_SITE_LABELS[game.site]}
                      </span>
                    </span>
                  </GameSurface>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {weather ? (
        <div className="bg-[#0A2342] px-6 pb-6">
          <CampusHeroWeather weather={weather} />
        </div>
      ) : null}
    </section>
  );
}
