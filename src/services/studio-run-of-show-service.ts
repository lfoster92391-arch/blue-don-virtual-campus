/**
 * Broadcast Control Studio — the operable run of show (Phase 7).
 *
 * The rundown an operator drives is the same `BroadcastDailyScript` the crew
 * fills in on the Daily Rundown page. This service stores **progress only**:
 * which slot key is on the air, and which of the others are ready, done, or
 * skipped. The spoken lines are never copied here, so there is nothing that can
 * drift out of sync with the script the anchors are reading, and a slot removed
 * from the template simply stops being referenced.
 *
 * See docs/BROADCAST_STUDIO.md.
 */

import {
  STUDIO_RUN_OF_SHOW_DEFAULT_KEY,
  STUDIO_RUN_STORED_STATES,
  type StudioRunStoredState,
} from "@/config/broadcast-studio";
import type { CampusRole } from "@/config/roles";
import { withDatabase } from "@/lib/prisma";
import {
  getTodaysBroadcastScript,
  resolveBroadcastOrgId,
} from "@/services/broadcast-script-service";
import { canManageCampusMedia } from "@/services/media-service";

/* --------------------------------------------------------------- shapes */

export type StudioRunProgress = {
  /** UTC day this progress belongs to, matching the script's own date. */
  showDate: string | null;
  /** The slot key on the air, or null before anyone starts the show. */
  currentKey: string | null;
  /** Slot key → stored state. Anything absent is pending. */
  states: Record<string, StudioRunStoredState>;
  startedAt: string | null;
  /** When the current item was taken — what the segment timer counts from. */
  itemStartedAt: string | null;
  endedAt: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
};

/** What an operator can press. Every one of them is reversible. */
export type StudioRunCommand =
  | { action: "START" }
  | { action: "ADVANCE" }
  | { action: "BACK" }
  | { action: "SELECT"; itemKey: string }
  | { action: "TOGGLE_READY"; itemKey: string }
  | { action: "SKIP"; itemKey: string }
  | { action: "RESET" };

export type StudioRunResult =
  | { progress: StudioRunProgress }
  | { error: string };

export const EMPTY_RUN_PROGRESS: StudioRunProgress = {
  showDate: null,
  currentKey: null,
  states: {},
  startedAt: null,
  itemStartedAt: null,
  endedAt: null,
  updatedAt: null,
  updatedByName: null,
};

/* --------------------------------------------------------------- shared */

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function isStoredState(value: unknown): value is StudioRunStoredState {
  return STUDIO_RUN_STORED_STATES.includes(value as StudioRunStoredState);
}

/**
 * Narrows the stored map to slot keys that still exist in today's rundown.
 * Editing the template mid-season should drop stale progress, not resurrect an
 * item nobody can see.
 */
function parseStates(
  raw: unknown,
  itemKeys: string[] | null,
): Record<string, StudioRunStoredState> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const known = itemKeys ? new Set(itemKeys) : null;
  const states: Record<string, StudioRunStoredState> = {};

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (isStoredState(value) && (!known || known.has(key))) {
      states[key] = value;
    }
  }

  return states;
}

type RunRow = {
  showDate: Date;
  currentKey: string | null;
  itemStates: unknown;
  startedAt: Date | null;
  itemStartedAt: Date | null;
  endedAt: Date | null;
  updatedAt: Date;
  updatedByName: string | null;
};

const RUN_SELECT = {
  showDate: true,
  currentKey: true,
  itemStates: true,
  startedAt: true,
  itemStartedAt: true,
  endedAt: true,
  updatedAt: true,
  updatedByName: true,
} as const;

function toProgress(
  row: RunRow,
  itemKeys: string[] | null,
): StudioRunProgress {
  const states = parseStates(row.itemStates, itemKeys);
  const currentKey =
    row.currentKey && (!itemKeys || itemKeys.includes(row.currentKey))
      ? row.currentKey
      : null;

  return {
    showDate: row.showDate.toISOString(),
    currentKey,
    states,
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    itemStartedAt:
      currentKey && row.itemStartedAt ? row.itemStartedAt.toISOString() : null,
    endedAt: row.endedAt ? row.endedAt.toISOString() : null,
    updatedAt: row.updatedAt.toISOString(),
    updatedByName: row.updatedByName,
  };
}

/* ------------------------------------------------------------ read side */

/**
 * Today's progress, or the empty state when nobody has driven the rundown yet.
 * `itemKeys` is the ordered slot list from today's script; passing it drops
 * progress for slots the template no longer has.
 */
export async function getStudioRunProgress(options?: {
  studioKey?: string;
  itemKeys?: string[];
}): Promise<StudioRunProgress> {
  const key = options?.studioKey?.trim() || STUDIO_RUN_OF_SHOW_DEFAULT_KEY;

  const row = await withDatabase((prisma) =>
    prisma.studioRunOfShow.findUnique({
      where: { key_showDate: { key, showDate: startOfUtcDay() } },
      select: RUN_SELECT,
    }),
  );

  return row ? toProgress(row, options?.itemKeys ?? null) : EMPTY_RUN_PROGRESS;
}

/* ----------------------------------------------------------- write side */

/** The ordered slot keys of today's rundown — the spine every move walks. */
async function todaysItemKeys(): Promise<string[]> {
  const orgId = await resolveBroadcastOrgId().catch(() => null);
  if (!orgId) {
    return [];
  }

  const script = await getTodaysBroadcastScript(orgId).catch(() => null);
  return script ? script.slots.map((slot) => slot.key) : [];
}

type RunState = {
  currentKey: string | null;
  states: Record<string, StudioRunStoredState>;
  startedAt: Date | null;
  itemStartedAt: Date | null;
  endedAt: Date | null;
};

/** The next item that has not been skipped, so Advance walks past dead slots. */
function nextPlayable(
  itemKeys: string[],
  fromIndex: number,
  states: Record<string, StudioRunStoredState>,
): string | null {
  for (let index = fromIndex; index < itemKeys.length; index += 1) {
    const key = itemKeys[index];
    if (states[key] !== "SKIPPED") {
      return key;
    }
  }
  return null;
}

function previousPlayable(
  itemKeys: string[],
  fromIndex: number,
  states: Record<string, StudioRunStoredState>,
): string | null {
  for (let index = fromIndex; index >= 0; index -= 1) {
    const key = itemKeys[index];
    if (states[key] !== "SKIPPED") {
      return key;
    }
  }
  return null;
}

/**
 * Applies one press to the current progress.
 *
 * Every move is reversible and none of them is destructive to the script:
 * Advance completes the item that was up and moves on, Back un-completes the
 * previous item and returns to it, and selecting an item jumps straight there
 * without disturbing anything else — an operator who has to cover a late guest
 * out of order should not have to fight the rundown to do it.
 */
function reduce(
  command: StudioRunCommand,
  current: RunState,
  itemKeys: string[],
  now: Date,
): RunState {
  const states = { ...current.states };
  const currentIndex = current.currentKey
    ? itemKeys.indexOf(current.currentKey)
    : -1;

  switch (command.action) {
    case "START": {
      const first = nextPlayable(itemKeys, 0, states);
      return {
        currentKey: first,
        states,
        startedAt: current.startedAt ?? now,
        itemStartedAt: first ? now : null,
        endedAt: null,
      };
    }

    case "ADVANCE": {
      if (currentIndex < 0) {
        return reduce({ action: "START" }, current, itemKeys, now);
      }

      states[itemKeys[currentIndex]] = "COMPLETED";
      const next = nextPlayable(itemKeys, currentIndex + 1, states);

      return {
        currentKey: next,
        states,
        startedAt: current.startedAt ?? now,
        itemStartedAt: next ? now : null,
        // Advancing off the last item is the end of the show, and pressing
        // Back re-opens it.
        endedAt: next ? null : now,
      };
    }

    case "BACK": {
      const from = currentIndex < 0 ? itemKeys.length : currentIndex;
      const previous = previousPlayable(itemKeys, from - 1, states);

      if (!previous) {
        return current;
      }

      // The item we are leaving goes back to pending: we are re-doing the one
      // before it, so nothing after that point has happened yet.
      if (currentIndex >= 0) {
        delete states[itemKeys[currentIndex]];
      }
      delete states[previous];

      return {
        currentKey: previous,
        states,
        startedAt: current.startedAt ?? now,
        itemStartedAt: now,
        endedAt: null,
      };
    }

    case "SELECT": {
      if (!itemKeys.includes(command.itemKey)) {
        return current;
      }

      // A jump says "read this next", so a skipped item picked on purpose is
      // back in the show.
      if (states[command.itemKey] === "SKIPPED") {
        delete states[command.itemKey];
      }

      return {
        currentKey: command.itemKey,
        states,
        startedAt: current.startedAt ?? now,
        itemStartedAt: now,
        endedAt: null,
      };
    }

    case "TOGGLE_READY": {
      if (!itemKeys.includes(command.itemKey)) {
        return current;
      }

      if (states[command.itemKey] === "READY") {
        delete states[command.itemKey];
      } else {
        states[command.itemKey] = "READY";
      }

      return { ...current, states };
    }

    case "SKIP": {
      if (!itemKeys.includes(command.itemKey)) {
        return current;
      }

      if (states[command.itemKey] === "SKIPPED") {
        delete states[command.itemKey];
        return { ...current, states };
      }

      states[command.itemKey] = "SKIPPED";

      // Skipping what is on the air has to move somewhere, or the console
      // would sit on an item the show has already passed.
      if (command.itemKey === current.currentKey) {
        const next = nextPlayable(itemKeys, currentIndex + 1, states);
        return {
          currentKey: next,
          states,
          startedAt: current.startedAt ?? now,
          itemStartedAt: next ? now : null,
          endedAt: next ? null : now,
        };
      }

      return { ...current, states };
    }

    case "RESET":
      return {
        currentKey: null,
        states: {},
        startedAt: null,
        itemStartedAt: null,
        endedAt: null,
      };
  }
}

/**
 * Runs one operator press against today's rundown.
 *
 * Crew permission is checked here rather than only in the action, and the
 * ordering comes from today's script on the server — the console never sends
 * the item list, so a stale console cannot advance into a slot that no longer
 * exists.
 */
export async function applyStudioRunCommand(input: {
  actorId: string;
  actorName: string;
  role: CampusRole;
  command: StudioRunCommand;
  studioKey?: string;
}): Promise<StudioRunResult> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can drive the run of show." };
  }

  const itemKeys = await todaysItemKeys();
  if (itemKeys.length === 0) {
    return {
      error: "Today's rundown could not be read, so there is nothing to drive.",
    };
  }

  const key = input.studioKey?.trim() || STUDIO_RUN_OF_SHOW_DEFAULT_KEY;
  const showDate = startOfUtcDay();
  const now = new Date();

  const saved = await withDatabase(async (prisma) => {
    const existing = await prisma.studioRunOfShow.findUnique({
      where: { key_showDate: { key, showDate } },
      select: RUN_SELECT,
    });

    const before: RunState = {
      currentKey: existing?.currentKey ?? null,
      states: parseStates(existing?.itemStates, itemKeys),
      startedAt: existing?.startedAt ?? null,
      itemStartedAt: existing?.itemStartedAt ?? null,
      endedAt: existing?.endedAt ?? null,
    };

    const after = reduce(input.command, before, itemKeys, now);

    const data = {
      currentKey: after.currentKey,
      itemStates: after.states as unknown as object,
      startedAt: after.startedAt,
      itemStartedAt: after.itemStartedAt,
      endedAt: after.endedAt,
      updatedById: input.actorId,
      updatedByName: input.actorName,
    };

    return prisma.studioRunOfShow.upsert({
      where: { key_showDate: { key, showDate } },
      create: { key, showDate, ...data },
      update: data,
      select: RUN_SELECT,
    });
  });

  return saved
    ? { progress: toProgress(saved, itemKeys) }
    : {
        error:
          "Unable to save the run of show. Check database connectivity — the script itself is unaffected.",
      };
}
