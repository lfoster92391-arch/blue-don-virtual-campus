"use client";

import { useActionState } from "react";

import { Field, FormFeedback, Select, initialSportsState } from "@/components/sports/form-primitives";
import { MatchupMarks } from "@/components/sports/matchup-marks";
import {
  CAMPUS_TEAM_NAME,
  GAME_STATUS_LABELS,
  formatGameDateTime,
  type GameStatusKey,
} from "@/config/sports-highlights";
import { saveGameScoreAction } from "@/features/sports-highlights/actions";
import type { SportsGameView } from "@/services/sports-highlights-service";

export function GameScorePad({
  games,
  defaultGameId,
}: {
  games: SportsGameView[];
  defaultGameId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveGameScoreAction,
    initialSportsState,
  );

  if (games.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Post a game on the schedule first, then come back to enter the score.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <Select
        label="Game"
        name="gameId"
        required
        defaultValue={defaultGameId}
        placeholder="Pick a game"
        options={games.map((game) => ({
          value: game.id,
          label: `${game.sportName} ${game.site === "HOME" ? "vs" : "at"} ${game.opponentName} · ${formatGameDateTime(game.kickoffAt)}`,
        }))}
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Field
          label={`${CAMPUS_TEAM_NAME} score`}
          name="teamScore"
          type="number"
          placeholder="0"
        />
        <Field label="Opponent score" name="opponentScore" type="number" placeholder="0" />
        <Select
          label="Status"
          name="status"
          defaultValue="FINAL"
          options={(Object.keys(GAME_STATUS_LABELS) as GameStatusKey[]).map(
            (key) => ({ value: key, label: GAME_STATUS_LABELS[key] }),
          )}
        />
      </div>

      <ul className="space-y-2">
        {games.slice(0, 6).map((game) => (
          <li
            key={game.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2"
          >
            <MatchupMarks game={game} size="sm" />
            <span className="min-w-0 flex-1 text-sm">
              {game.sportName} {game.site === "HOME" ? "vs" : "at"}{" "}
              {game.opponentName}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {game.teamScore !== null && game.opponentScore !== null
                ? `${game.teamScore}–${game.opponentScore}`
                : GAME_STATUS_LABELS[game.status]}
            </span>
          </li>
        ))}
      </ul>

      <FormFeedback state={state} pending={pending} submitLabel="Post score" />
    </form>
  );
}
