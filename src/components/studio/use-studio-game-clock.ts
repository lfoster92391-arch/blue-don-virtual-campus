"use client";

import { useSyncExternalStore } from "react";

import { useSecondTick } from "@/components/studio/studio-time";
import {
  STUDIO_CLOCK_PRESET_SECONDS,
  STUDIO_PERIOD_LABELS,
} from "@/config/broadcast-studio";

/**
 * Session-local game clock and period for the console.
 *
 * Nothing in the campus schema stores a game clock, and adding columns for a
 * number only the operator in Studio B looks at would put invented state on the
 * shared `SportsGame` row. So the clock lives in this browser session: it
 * survives a refresh through `sessionStorage`, and it is gone when the console
 * tab closes. Score and status — the values the campus sees — are the only
 * things the console writes.
 */

type ClockState = {
  periodLabel: string;
  presetSeconds: number;
  /** Seconds left as of the last stop or set. */
  baseSeconds: number;
  /** Epoch ms the clock was started, or null while it is stopped. */
  startedAt: number | null;
};

export type StudioGameClock = {
  periodLabel: string;
  remainingSeconds: number;
  running: boolean;
  presetSeconds: number;
  setPeriodLabel: (label: string) => void;
  setPreset: (seconds: number) => void;
  toggle: () => void;
  reset: () => void;
};

const STORAGE_PREFIX = "studio-game-clock:";

function freshState(): ClockState {
  return {
    periodLabel: STUDIO_PERIOD_LABELS[0],
    presetSeconds: STUDIO_CLOCK_PRESET_SECONDS[0],
    baseSeconds: STUDIO_CLOCK_PRESET_SECONDS[0],
    startedAt: null,
  };
}

/** Stable object for server render and hydration — the clock is client-only. */
const SERVER_STATE: ClockState = freshState();

// One store per console tab, keyed by game, so switching games in the picker
// keeps each game's clock and the panel never reads storage during render.
const cache = new Map<string, ClockState>();
const listeners = new Set<() => void>();

function storageKey(gameId: string | null): string {
  return `${STORAGE_PREFIX}${gameId ?? "unassigned"}`;
}

function readStored(key: string): ClockState | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ClockState>;
    if (
      typeof parsed.periodLabel !== "string" ||
      typeof parsed.presetSeconds !== "number" ||
      typeof parsed.baseSeconds !== "number"
    ) {
      return null;
    }

    return {
      periodLabel: parsed.periodLabel,
      presetSeconds: parsed.presetSeconds,
      baseSeconds: parsed.baseSeconds,
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
    };
  } catch {
    return null;
  }
}

function readState(key: string): ClockState {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const loaded = readStored(key) ?? freshState();
  cache.set(key, loaded);
  return loaded;
}

function writeState(key: string, next: ClockState) {
  cache.set(key, next);
  try {
    window.sessionStorage.setItem(key, JSON.stringify(next));
  } catch {
    // A console with storage blocked still runs; the clock just resets on
    // refresh.
  }
  for (const notify of listeners) {
    notify();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function remainingFrom(state: ClockState, now: number | null): number {
  if (state.startedAt === null || now === null) {
    return Math.max(0, Math.round(state.baseSeconds));
  }
  const elapsed = Math.floor((now - state.startedAt) / 1000);
  return Math.max(0, Math.round(state.baseSeconds) - elapsed);
}

export function useStudioGameClock(gameId: string | null): StudioGameClock {
  const key = storageKey(gameId);
  const state = useSyncExternalStore(
    subscribe,
    () => readState(key),
    () => SERVER_STATE,
  );
  const tick = useSecondTick();
  const remainingSeconds = remainingFrom(state, tick);

  return {
    periodLabel: state.periodLabel,
    remainingSeconds,
    running: state.startedAt !== null && remainingSeconds > 0,
    presetSeconds: state.presetSeconds,
    setPeriodLabel: (label) => writeState(key, { ...state, periodLabel: label }),
    setPreset: (seconds) =>
      writeState(key, {
        ...state,
        presetSeconds: seconds,
        baseSeconds: seconds,
        startedAt: null,
      }),
    toggle: () =>
      writeState(
        key,
        state.startedAt === null
          ? { ...state, baseSeconds: remainingSeconds, startedAt: Date.now() }
          : { ...state, baseSeconds: remainingSeconds, startedAt: null },
      ),
    reset: () =>
      writeState(key, {
        ...state,
        baseSeconds: state.presetSeconds,
        startedAt: null,
      }),
  };
}

export function formatGameClock(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}
