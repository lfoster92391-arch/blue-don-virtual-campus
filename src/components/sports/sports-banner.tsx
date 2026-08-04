import Link from "next/link";
import { CalendarDays, Radio, Trophy } from "lucide-react";

import {
  formatGameDateTime,
  GAME_RESULT_LABELS,
  GAME_SITE_LABELS,
  GAME_STATUS_LABELS,
} from "@/config/sports-highlights";
import type { SportsGameView } from "@/services/sports-highlights-service";

function OpponentMark({
  game,
  size = "md",
}: {
  game: SportsGameView;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "size-8" : "size-12";

  if (game.opponentLogoUrl) {
    return (
      // Opponent logos are arbitrary remote URLs; next/image would need every
      // school host allowlisted in next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={game.opponentLogoUrl}
        alt={`${game.opponentName} logo`}
        className={`${dimension} shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-white/30`}
      />
    );
  }

  return (
    <span
      className={`${dimension} flex shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-semibold uppercase`}
      aria-hidden="true"
    >
      {game.opponentName.slice(0, 2)}
    </span>
  );
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
}: {
  lastGame: SportsGameView | null;
  upcoming: SportsGameView[];
  sportLabel: string;
  canManage?: boolean;
}) {
  if (!lastGame && upcoming.length === 0) {
    return (
      <section className="rounded-xl border border-[#0A2342]/15 bg-gradient-to-br from-[#0A2342] to-[#123a63] p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">
          Madonna Blue Dons · {sportLabel}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">No games on the board yet</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/80">
          {canManage
            ? "Add opponent schools to the directory, then post a game so the scoreboard and student write-up forms light up."
            : "Broadcasting posts scores and upcoming games here as soon as the schedule is set."}
        </p>
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
            <Link
              href={`/sports/games/${lastGame.id}`}
              className="mt-4 block rounded-lg transition-colors hover:bg-white/5"
            >
              <div className="flex flex-wrap items-center gap-4">
                <OpponentMark game={lastGame} />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold">
                    Blue Dons {lastGame.site === "HOME" ? "vs" : "at"}{" "}
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
            </Link>
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
                  <Link
                    href={`/sports/games/${game.id}`}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5"
                  >
                    <OpponentMark game={game} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {game.site === "HOME" ? "vs" : "at"} {game.opponentName}
                      </span>
                      <span className="block text-xs text-white/70">
                        {formatGameDateTime(game.kickoffAt)} ·{" "}
                        {GAME_SITE_LABELS[game.site]}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
