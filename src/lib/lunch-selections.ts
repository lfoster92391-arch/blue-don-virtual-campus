/**
 * Turns a lunch board into "here is what you chose" — the read-back a family
 * needs after tapping through two weeks of buttons.
 *
 * The board itself is a grid of choices; this is the same data grouped per
 * student and narrowed to the days someone actually decided, plus the days
 * still waiting on an answer.
 */

import { LUNCH_CHOICE_META, lunchOrderKey, type LunchChoice } from "@/config/lunch";
import type { LunchBoard } from "@/services/lunch-service";

export type LunchSelectionRow = {
  dateKey: string;
  shortLabel: string;
  isToday: boolean;
  isOpen: boolean;
  choice: LunchChoice | null;
  choiceLabel: string | null;
  /** The posted entree or vegetarian dish behind the choice, when there is one. */
  menuLine: string | null;
  orderedByName: string | null;
  orderedBySelf: boolean;
  updatedAt: string | null;
};

export type LunchSelectionGroup = {
  dinerId: string;
  dinerName: string;
  kind: "self" | "student";
  relationship: string | null;
  rows: LunchSelectionRow[];
  /** Days with a saved choice. */
  chosenCount: number;
  /** Open days still without one. Past days are not counted — too late anyway. */
  missingCount: number;
  totalDays: number;
  /** Short labels of the open days still missing a choice, for the nudge line. */
  missingLabels: string[];
};

export type LunchSelectionSummary = {
  groups: LunchSelectionGroup[];
  chosenCount: number;
  missingCount: number;
  /** Most recent save across every student, for the "last saved" line. */
  lastSavedAt: string | null;
};

function menuLineFor(
  menu: LunchBoard["days"][number]["menu"],
  choice: LunchChoice,
): string | null {
  if (!menu) {
    return null;
  }
  if (choice === "HOT") {
    return menu.entree;
  }
  if (choice === "VEGETARIAN") {
    return menu.vegetarian;
  }
  return null;
}

export function buildLunchSelectionSummary(
  board: LunchBoard,
): LunchSelectionSummary {
  let chosenCount = 0;
  let missingCount = 0;
  let lastSavedAt: string | null = null;

  const groups = board.diners.map((diner) => {
    const rows: LunchSelectionRow[] = board.days.map((day) => {
      const order = board.orders[lunchOrderKey(diner.id, day.dateKey)] ?? null;
      const choice = order?.choice ?? null;

      return {
        dateKey: day.dateKey,
        shortLabel: day.shortLabel,
        isToday: day.isToday,
        isOpen: day.isOpen,
        choice,
        choiceLabel: choice ? LUNCH_CHOICE_META[choice].label : null,
        menuLine: choice ? menuLineFor(day.menu, choice) : null,
        orderedByName: order?.orderedByName ?? null,
        orderedBySelf: order?.orderedBySelf ?? false,
        updatedAt: order?.updatedAt ?? null,
      };
    });

    const chosen = rows.filter((row) => row.choice !== null);
    const missing = rows.filter((row) => row.choice === null && row.isOpen);

    chosenCount += chosen.length;
    missingCount += missing.length;

    for (const row of chosen) {
      if (row.updatedAt && (!lastSavedAt || row.updatedAt > lastSavedAt)) {
        lastSavedAt = row.updatedAt;
      }
    }

    return {
      dinerId: diner.id,
      dinerName: diner.kind === "self" ? "Your lunch" : diner.displayName,
      kind: diner.kind,
      relationship: diner.relationship,
      rows,
      chosenCount: chosen.length,
      missingCount: missing.length,
      totalDays: rows.length,
      missingLabels: missing.map((row) => row.shortLabel),
    };
  });

  return { groups, chosenCount, missingCount, lastSavedAt };
}

/** e.g. "Saved 2:14 PM today" — reassurance, not an audit trail. */
export function formatLastSaved(iso: string | null): string | null {
  if (!iso) {
    return null;
  }

  const saved = new Date(iso);
  if (Number.isNaN(saved.getTime())) {
    return null;
  }

  return saved.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
