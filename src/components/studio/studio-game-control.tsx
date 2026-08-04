"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Minus, Pause, Play, RotateCcw } from "lucide-react";

import { StudioEmptyNote, StudioPanel } from "@/components/studio/studio-frame";
import { formatCampusTime } from "@/components/studio/studio-time";
import {
  formatGameClock,
  useStudioGameClock,
} from "@/components/studio/use-studio-game-clock";
import {
  STUDIO_CLOCK_PRESET_SECONDS,
  STUDIO_GAME_STATUSES,
  STUDIO_PERIOD_LABELS,
  studioScoreKeys,
} from "@/config/broadcast-studio";
import { GAME_STATUS_LABELS } from "@/config/sports-highlights";
import {
  saveStudioScoreAction,
  type StudioScoreActionState,
} from "@/features/broadcast-studio/actions";
import { cn } from "@/lib/utils";
import type {
  StudioGameOption,
  StudioScoreboardState,
} from "@/services/broadcast-studio-service";

type GameControlPanelProps = {
  scoreboard: StudioScoreboardState | null;
  gameOptions: StudioGameOption[];
  selectedGameId: string | null;
  onSelectGame: (gameId: string | null) => void;
  onSaved: (result: StudioScoreActionState) => void;
};

type Side = "HOME" | "AWAY";

/**
 * Game control: the score and status an operator drives during a broadcast.
 *
 * Writes land on the same `SportsGame` row the Sports Desk and `/sports` read,
 * so there is one score on campus. There is no scoreboard hardware link — the
 * panel says MANUAL MODE because a person is typing the score, and the clock and
 * period are console-only (see `useStudioGameClock`).
 */
export function GameControlPanel({
  scoreboard,
  gameOptions,
  selectedGameId,
  onSelectGame,
  onSaved,
}: GameControlPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const clock = useStudioGameClock(scoreboard?.gameId ?? null);

  function save(input: {
    teamScore?: number | null;
    opponentScore?: number | null;
    status?: (typeof STUDIO_GAME_STATUSES)[number];
  }) {
    if (!scoreboard) {
      return;
    }

    startSave(async () => {
      const result = await saveStudioScoreAction({
        gameId: scoreboard.gameId,
        ...input,
      });
      setError(result.error ?? null);
      if (!result.error) {
        onSaved(result);
      }
    });
  }

  /**
   * The row stores campus-relative scores, so a home or away edit has to be
   * mapped onto `teamScore` (Blue Dons) or `opponentScore` before saving.
   */
  function saveSideScore(side: Side, next: number) {
    if (!scoreboard) {
      return;
    }
    const campusSide: Side = scoreboard.campusIsHome ? "HOME" : "AWAY";
    save(side === campusSide ? { teamScore: next } : { opponentScore: next });
  }

  const kickoff = formatCampusTime(scoreboard?.kickoffAt ?? null, {
    weekday: "short",
  });

  return (
    <StudioPanel
      title="Game control"
      meta={scoreboard ? "MANUAL MODE" : "NO GAME"}
    >
      {gameOptions.length > 0 ? (
        <label className="mb-2 block">
          <span className="sr-only">Game on the console</span>
          <select
            value={selectedGameId ?? scoreboard?.gameId ?? ""}
            onChange={(event) => onSelectGame(event.target.value || null)}
            className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.7rem] text-slate-200 focus:border-[#2F80ED] focus:outline-none"
          >
            {gameOptions.map((option) => (
              <option
                key={option.gameId}
                value={option.gameId}
                className="bg-[#0C1A2E]"
              >
                {option.isLive ? "● " : ""}
                {option.label} ·{" "}
                {formatCampusTime(option.kickoffAt, { weekday: "short" }) ??
                  option.statusLabel}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {scoreboard ? (
        <>
          <div className="space-y-2 rounded-sm border border-white/10 bg-black/40 p-2.5">
            <ScoreRow
              label={scoreboard.awayLabel}
              logoUrl={scoreboard.awayLogoUrl}
              score={scoreboard.awayScore}
              sportSlug={scoreboard.sportSlug}
              disabled={saving}
              onScore={(next) => saveSideScore("AWAY", next)}
            />
            <div className="border-t border-white/5" />
            <ScoreRow
              label={scoreboard.homeLabel}
              logoUrl={scoreboard.homeLogoUrl}
              score={scoreboard.homeScore}
              sportSlug={scoreboard.sportSlug}
              disabled={saving}
              onScore={(next) => saveSideScore("HOME", next)}
            />
          </div>

          <div className="mt-2 flex gap-1">
            {STUDIO_GAME_STATUSES.map((status) => (
              <ConsoleButton
                key={status}
                active={scoreboard.status === status}
                disabled={saving}
                tone={status === "LIVE" ? "live" : "neutral"}
                className="flex-1"
                onClick={() => save({ status })}
              >
                {GAME_STATUS_LABELS[status]}
              </ConsoleButton>
            ))}
          </div>

          <div className="mt-2 rounded-sm border border-white/10 bg-white/[0.02] p-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[0.6rem] tracking-[0.18em] text-slate-500 uppercase">
                Clock · console only
              </span>
              <span className="font-mono text-lg text-slate-200 tabular-nums">
                {formatGameClock(clock.remainingSeconds)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-1">
              <ConsoleButton
                active={clock.running}
                tone={clock.running ? "live" : "neutral"}
                onClick={clock.toggle}
                aria-label={clock.running ? "Stop clock" : "Start clock"}
              >
                {clock.running ? (
                  <Pause className="size-3" aria-hidden="true" />
                ) : (
                  <Play className="size-3" aria-hidden="true" />
                )}
                {clock.running ? "Stop" : "Start"}
              </ConsoleButton>
              <ConsoleButton onClick={clock.reset} aria-label="Reset clock">
                <RotateCcw className="size-3" aria-hidden="true" />
                Reset
              </ConsoleButton>
              {STUDIO_CLOCK_PRESET_SECONDS.map((seconds) => (
                <ConsoleButton
                  key={seconds}
                  active={clock.presetSeconds === seconds}
                  onClick={() => clock.setPreset(seconds)}
                >
                  {Math.round(seconds / 60)}m
                </ConsoleButton>
              ))}
            </div>

            <div className="mt-1.5 flex items-center gap-1">
              <span className="font-mono text-[0.6rem] tracking-[0.18em] text-slate-500 uppercase">
                Period
              </span>
              {STUDIO_PERIOD_LABELS.map((label) => (
                <ConsoleButton
                  key={label}
                  active={clock.periodLabel === label}
                  onClick={() => clock.setPeriodLabel(label)}
                >
                  {label}
                </ConsoleButton>
              ))}
            </div>
          </div>

          {error ? (
            <p className="mt-2 text-[0.7rem] text-red-400" role="status">
              {error}
            </p>
          ) : (
            <StudioEmptyNote>
              {[
                scoreboard.sportName,
                scoreboard.level,
                scoreboard.siteLabel,
                scoreboard.venue,
                kickoff,
              ]
                .filter(Boolean)
                .join(" · ")}
              . Score and status write to the{" "}
              <Link href="/sports" className="text-slate-300 underline">
                game record
              </Link>{" "}
              the campus sees. Clock and period stay on this console — no
              scoreboard hardware is connected, so a person is the source.
            </StudioEmptyNote>
          )}
        </>
      ) : (
        <StudioEmptyNote>
          No game is in progress or scheduled in the next 36 hours. Add one on
          the{" "}
          <Link
            href="/organizations/broadcasting?tab=sports-desk"
            className="text-slate-300 underline"
          >
            Sports Desk
          </Link>{" "}
          and it appears here.
        </StudioEmptyNote>
      )}
    </StudioPanel>
  );
}

function ScoreRow({
  label,
  logoUrl,
  score,
  sportSlug,
  disabled,
  onScore,
}: {
  label: string;
  logoUrl: string | null;
  score: number | null;
  sportSlug: string;
  disabled: boolean;
  onScore: (next: number) => void;
}) {
  const current = score ?? 0;

  return (
    <div>
      <div className="flex items-center gap-2">
        <TeamMark label={label} logoUrl={logoUrl} />
        <span className="min-w-0 flex-1 truncate font-mono text-[0.7rem] tracking-[0.12em] text-slate-300 uppercase">
          {label}
        </span>
        <span className="font-mono text-2xl font-semibold text-slate-100 tabular-nums">
          {score ?? "--"}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        {studioScoreKeys(sportSlug).map((points) => (
          <ConsoleButton
            key={points}
            disabled={disabled}
            onClick={() => onScore(current + points)}
            aria-label={`Add ${points} to ${label}`}
          >
            +{points}
          </ConsoleButton>
        ))}
        <ConsoleButton
          disabled={disabled || current <= 0}
          onClick={() => onScore(current - 1)}
          aria-label={`Subtract 1 from ${label}`}
        >
          <Minus className="size-3" aria-hidden="true" />
        </ConsoleButton>
        <ConsoleButton
          disabled={disabled || current === 0}
          onClick={() => onScore(0)}
          aria-label={`Clear ${label} score`}
        >
          0
        </ConsoleButton>
      </div>
    </div>
  );
}

/** Opponent school logo when the Sports Desk has one; monogram otherwise. */
function TeamMark({
  label,
  logoUrl,
}: {
  label: string;
  logoUrl: string | null;
}) {
  if (logoUrl) {
    return (
      // Opponent logos are arbitrary remote URLs; next/image would need every
      // school host allowlisted in next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt=""
        className="size-6 shrink-0 rounded-sm bg-white object-contain p-0.5"
      />
    );
  }

  return (
    <span
      className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-white/5 font-mono text-[0.55rem] text-slate-400 uppercase"
      aria-hidden="true"
    >
      {label.slice(0, 2)}
    </span>
  );
}

function ConsoleButton({
  active,
  tone = "neutral",
  className,
  children,
  ...props
}: {
  active?: boolean;
  tone?: "neutral" | "live";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const activeTone =
    tone === "live"
      ? "border-[#E11D48]/60 bg-[#E11D48]/20 text-[#FF8098]"
      : "border-[#2F80ED]/60 bg-[#2F80ED]/20 text-[#8FBEFF]";

  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex h-6 min-w-6 items-center justify-center gap-1 rounded-sm border px-1.5 font-mono text-[0.6rem] font-semibold tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        active
          ? activeTone
          : "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10",
        className,
      )}
    >
      {children}
    </button>
  );
}
