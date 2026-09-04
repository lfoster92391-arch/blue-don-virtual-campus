"use client";

import { useSyncExternalStore } from "react";

import { CAMPUS_TIME_ZONE } from "@/lib/datetime/campus-local";

let tickValue = 0;
const tickListeners = new Set<() => void>();
let tickTimer: number | null = null;

function subscribeSecondTick(listener: () => void): () => void {
  tickListeners.add(listener);

  if (tickTimer === null) {
    tickValue = Date.now();
    tickTimer = window.setInterval(() => {
      tickValue = Date.now();
      for (const notify of tickListeners) {
        notify();
      }
    }, 1000);
  }

  return () => {
    tickListeners.delete(listener);
    if (tickListeners.size === 0 && tickTimer !== null) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }
  };
}

/**
 * One shared second ticker for the console. Returns null on the server so the
 * console never ships a baked-in wall clock into the HTML.
 */
export function useSecondTick(): number | null {
  const tick = useSyncExternalStore(
    subscribeSecondTick,
    () => tickValue,
    () => 0,
  );

  return tick || null;
}

export function formatClock(now: number): string {
  return new Date(now).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function hms(totalSeconds: number): string {
  const seconds = Math.max(0, totalSeconds);
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function formatElapsed(now: number | null, since: string | null): string {
  const startedAt = since ? new Date(since).getTime() : null;
  if (!now || !startedAt) {
    return "00:00:00";
  }
  return hms(Math.floor((now - startedAt) / 1000));
}

/**
 * Segment timer for the run of show — `m:ss`, counting up from when the item
 * was taken. Minutes rather than hours, because a rundown item that has been
 * up for an hour is a forgotten advance, not a long segment.
 */
export function formatSegmentTimer(
  now: number | null,
  since: string | null,
): string | null {
  if (!since) {
    return null;
  }
  if (!now) {
    return "0:00";
  }

  const seconds = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/** Countdown to the next air time. Past times read as an open air window. */
export function formatCountdown(
  now: number | null,
  target: string | null,
): string | null {
  if (!target) {
    return null;
  }
  if (!now) {
    return "--:--:--";
  }

  const remainingMs = new Date(target).getTime() - now;
  if (remainingMs <= 0) {
    return "Air window open";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  if (totalSeconds >= 86_400) {
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3600);
    return `${days}d ${hours}h`;
  }

  return hms(totalSeconds);
}

/** Campus-local wall time, so operators read the same clock as the school. */
export function formatCampusTime(
  iso: string | null,
  options?: Intl.DateTimeFormatOptions,
): string | null {
  if (!iso) {
    return null;
  }

  return new Date(iso).toLocaleString("en-US", {
    timeZone: CAMPUS_TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...options,
  });
}

export function formatSinceLabel(
  now: number | null,
  iso: string | null,
): string | null {
  if (!iso) {
    return null;
  }
  if (!now) {
    return "just now";
  }

  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (seconds < 10) {
    return "just now";
  }
  if (seconds < 60) {
    return `${seconds}s ago`;
  }
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }
  if (seconds < 86_400) {
    return `${Math.floor(seconds / 3600)}h ago`;
  }
  return `${Math.floor(seconds / 86_400)}d ago`;
}
