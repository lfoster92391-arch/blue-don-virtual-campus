"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Per-user "watch later" list for the Madonna hub video grids.
 *
 * Stored in localStorage rather than Postgres on purpose: it needs no
 * migration, keeps working when the database is unreachable, and the list is a
 * convenience marker rather than school data. The trade-off is that the list is
 * per browser — moving it server-side later only means swapping this hook for
 * server actions; the grid API stays the same.
 */

const STORAGE_PREFIX = "blue-don:watch-later:";
const MAX_ENTRIES = 500;

/** In-tab subscribers, so several grids on one page stay in sync. */
const listeners = new Set<() => void>();

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

/**
 * Raw stored string. Returned as-is so `useSyncExternalStore` gets a snapshot
 * that compares by value — parsing here would allocate a new array every read
 * and loop forever.
 */
function readRaw(userId: string): string {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    return window.localStorage.getItem(storageKey(userId)) ?? "";
  } catch {
    return "";
  }
}

function parseIds(raw: string): string[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function readIds(userId: string): string[] {
  return parseIds(readRaw(userId));
}

function writeIds(userId: string, ids: string[]): void {
  try {
    window.localStorage.setItem(
      storageKey(userId),
      JSON.stringify(ids.slice(0, MAX_ENTRIES)),
    );
  } catch {
    // Private mode / quota — the in-memory list still updates for this render.
  }
  for (const listener of listeners) {
    listener();
  }
}

export type WatchLaterStore = {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  clear: () => void;
};

export function useWatchLater(userId: string): WatchLaterStore {
  const subscribe = useCallback((onStoreChange: () => void) => {
    listeners.add(onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      listeners.delete(onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => readRaw(userId), [userId]);
  const getServerSnapshot = useCallback(() => "", []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ids = useMemo(() => parseIds(raw), [raw]);

  const toggle = useCallback(
    (id: string) => {
      const current = readIds(userId);
      writeIds(
        userId,
        current.includes(id) ? current.filter((value) => value !== id) : [id, ...current],
      );
    },
    [userId],
  );

  const clear = useCallback(() => {
    writeIds(userId, []);
  }, [userId]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, count: ids.length, has, toggle, clear };
}
