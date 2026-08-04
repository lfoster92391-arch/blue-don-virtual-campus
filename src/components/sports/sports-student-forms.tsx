"use client";

import { useActionState, useMemo, useState } from "react";

import {
  Field,
  FormFeedback,
  ImageField,
  Select,
  TextArea,
  initialSportsState,
} from "@/components/sports/form-primitives";
import { cn } from "@/lib/utils";
import {
  formatGameDateTime,
  GAME_RESULT_LABELS,
  HIGHLIGHT_KIND_LABELS,
  REPORT_KIND_LABELS,
  STUDENT_REPORT_INSTRUCTIONS,
  type HighlightKindKey,
} from "@/config/sports-highlights";
import {
  saveHighlightAction,
  submitGameReportAction,
} from "@/features/sports-highlights/actions";
import type {
  SportView,
  SportsGameView,
} from "@/services/sports-highlights-service";

function GameLogo({ game }: { game: SportsGameView }) {
  if (game.opponentLogoUrl) {
    return (
      // School logos come from Supabase storage or a pasted URL — plain img
      // avoids allowlisting every opponent's host in next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={game.opponentLogoUrl}
        alt=""
        className="size-10 shrink-0 rounded-md bg-white object-contain p-0.5 ring-1 ring-border"
      />
    );
  }
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold uppercase text-muted-foreground"
      aria-hidden="true"
    >
      {game.opponentName.slice(0, 2)}
    </span>
  );
}

/**
 * Clickable game chooser — students tap the school they played instead of
 * typing a name, so every write-up links to the right opponent record.
 */
export function GamePicker({
  games,
  value,
  onChange,
  emptyLabel = "No games posted yet. Broadcasting adds them from the Sports desk.",
}: {
  games: SportsGameView[];
  value: string;
  onChange: (gameId: string) => void;
  emptyLabel?: string;
}) {
  if (games.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {games.map((game) => {
        const selected = value === game.id;
        return (
          <li key={game.id}>
            <button
              type="button"
              onClick={() => onChange(game.id)}
              aria-pressed={selected}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                selected
                  ? "border-[#0A2342] bg-[#0A2342]/5 dark:border-[#2F80ED] dark:bg-[#2F80ED]/10"
                  : "border-border hover:bg-muted",
              )}
            >
              <GameLogo game={game} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {game.site === "HOME" ? "vs" : "at"} {game.opponentName}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {game.sportName} · {formatGameDateTime(game.kickoffAt)}
                  {game.result ? ` · ${GAME_RESULT_LABELS[game.result]}` : ""}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Student recap / preview form. Past and upcoming games arrive pre-split from
 * the server so the form never reads the clock while rendering.
 */
export function GameReportForm({
  pastGames,
  upcomingGames,
  defaultGameId,
  defaultKind = "RECAP",
}: {
  pastGames: SportsGameView[];
  upcomingGames: SportsGameView[];
  defaultGameId?: string;
  defaultKind?: "RECAP" | "PREVIEW";
}) {
  const [state, formAction, pending] = useActionState(
    submitGameReportAction,
    initialSportsState,
  );
  const [gameId, setGameId] = useState(defaultGameId ?? "");
  const [kind, setKind] = useState<"RECAP" | "PREVIEW">(defaultKind);

  const relevantGames = kind === "RECAP" ? pastGames : upcomingGames;

  return (
    <form action={formAction} className="space-y-4">
      <ul className="space-y-1 text-sm text-muted-foreground">
        {STUDENT_REPORT_INSTRUCTIONS.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-2">
        {(["RECAP", "PREVIEW"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setKind(option);
              setGameId("");
            }}
            aria-pressed={kind === option}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              kind === option
                ? "bg-[#0A2342] text-white dark:bg-[#2F80ED]"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {REPORT_KIND_LABELS[option]}
          </button>
        ))}
      </div>
      <input type="hidden" name="kind" value={kind} />

      <div className="space-y-2">
        <p className="text-sm font-medium">
          {kind === "RECAP" ? "Which game are you recapping?" : "Which game are you previewing?"}
        </p>
        <GamePicker
          games={relevantGames}
          value={gameId}
          onChange={setGameId}
          emptyLabel={
            kind === "RECAP"
              ? "No completed games yet."
              : "No upcoming games on the schedule yet."
          }
        />
      </div>
      <input type="hidden" name="gameId" value={gameId} />

      <Field
        label="Headline"
        name="headline"
        required
        placeholder={
          kind === "RECAP"
            ? "Blue Dons rally in the fourth"
            : "Blue Dons host the league leaders Friday"
        }
      />

      <TextArea
        label={kind === "RECAP" ? "What happened?" : "What should fans know?"}
        name="body"
        rows={5}
        required
        placeholder={
          kind === "RECAP"
            ? "How the game went, who stepped up, final momentum swing…"
            : "Storylines, records, players to watch, why this one matters…"
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Player of the game"
          name="playerOfGame"
          placeholder="Name + why"
        />
        {kind === "RECAP" ? (
          <Field label="Key moment" name="keyMoment" placeholder="Go-ahead score with 1:12 left" />
        ) : (
          <Field label="What to watch" name="whatToWatch" placeholder="Senior night · rivalry rematch" />
        )}
      </div>

      <FormFeedback
        state={state}
        pending={pending}
        submitLabel={kind === "RECAP" ? "Submit recap" : "Submit preview"}
      />
    </form>
  );
}

/** Highlight submission — crew posts publish instantly, students go to review. */
export function HighlightSubmitForm({
  sports,
  games,
  storageConfigured,
  canManage = false,
  defaultSportId,
  defaultGameId,
}: {
  sports: SportView[];
  games: SportsGameView[];
  storageConfigured: boolean;
  canManage?: boolean;
  defaultSportId?: string;
  defaultGameId?: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveHighlightAction,
    initialSportsState,
  );
  const [sportId, setSportId] = useState(defaultSportId ?? sports[0]?.id ?? "");
  const [gameId, setGameId] = useState(defaultGameId ?? "");

  const sportGames = useMemo(
    () => games.filter((game) => !sportId || game.sportId === sportId),
    [games, sportId],
  );

  return (
    <form action={formAction} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {canManage
          ? "Posted highlights publish to the Sports page right away."
          : "Send in a clip, photo, or story. Broadcasting crew reviews it before it publishes."}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Sport"
          name="sportId"
          required
          value={sportId}
          onChange={(next) => {
            setSportId(next);
            setGameId("");
          }}
          placeholder="Pick a sport"
          options={sports.map((sport) => ({
            value: sport.id,
            label: sport.name,
          }))}
        />
        <Select
          label="Highlight type"
          name="kind"
          defaultValue="CLIP"
          options={(
            Object.keys(HIGHLIGHT_KIND_LABELS) as HighlightKindKey[]
          ).map((key) => ({ value: key, label: HIGHLIGHT_KIND_LABELS[key] }))}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Attach to a game (optional)</p>
        <GamePicker
          games={sportGames.slice(0, 8)}
          value={gameId}
          onChange={(next) => setGameId(next === gameId ? "" : next)}
          emptyLabel="No games for this sport yet — you can still post a highlight."
        />
      </div>
      <input type="hidden" name="gameId" value={gameId} />

      <Field label="Title" name="title" required placeholder="Fourth-quarter goal-line stand" />
      <TextArea
        label="Description"
        name="description"
        placeholder="What happens in the clip, who's featured…"
      />

      <ImageField
        label="Thumbnail or photo"
        storageConfigured={storageConfigured}
        hint="Used as the card image in the highlights grid."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Video link"
          name="videoUrl"
          type="url"
          placeholder="https://… (YouTube, Drive, campus media)"
        />
        <Field label="Credit" name="credit" placeholder="Shot by …" />
      </div>

      {canManage ? (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" className="size-4" />
          Feature this highlight at the top of the grid
        </label>
      ) : null}

      <FormFeedback
        state={state}
        pending={pending}
        submitLabel={canManage ? "Publish highlight" : "Submit highlight"}
      />
    </form>
  );
}
