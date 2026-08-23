"use client";

import { useOptimistic, useState, useTransition } from "react";
import { AlertTriangle, Check, Lock, UtensilsCrossed } from "lucide-react";

import { DietarySummary } from "@/components/dietary/dietary-summary";
import {
  LUNCH_CHOICES,
  LUNCH_CHOICE_META,
  lunchOrderKey,
  type LunchChoice,
} from "@/config/lunch";
import { avoidsHotEntree } from "@/config/dietary";
import { placeLunchOrderAction } from "@/features/lunch/actions";
import type { LunchBoard, LunchDiner, LunchDay } from "@/services/lunch-service";
import { cn } from "@/lib/utils";

type LunchOrderBoardProps = {
  board: LunchBoard;
};

type OptimisticEntry = {
  key: string;
  choice: LunchChoice;
};

function menuLineFor(day: LunchDay, choice: LunchChoice): string | null {
  if (!day.menu) {
    return null;
  }
  if (choice === "HOT") {
    return day.menu.entree;
  }
  if (choice === "VEGETARIAN") {
    return day.menu.vegetarian;
  }
  return null;
}

function DinerHeading({ diner }: { diner: LunchDiner }) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-[#0A2342] dark:text-white">
          {diner.kind === "self" ? "Your lunch" : diner.displayName}
          {diner.isPreview ? (
            <span className="rounded-full bg-[#D4A017]/20 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#8a6a0a]">
              Preview
            </span>
          ) : null}
        </p>
        <p className="text-xs text-muted-foreground">
          {diner.kind === "self"
            ? diner.displayName
            : `Your student${diner.relationship ? ` · ${diner.relationship}` : ""}`}
        </p>
      </div>
      {diner.dietary ? (
        <DietarySummary
          allergens={diner.dietary.allergens}
          restrictions={diner.dietary.restrictions}
          notes={diner.dietary.notes}
          compact
        />
      ) : null}
    </div>
  );
}

export function LunchOrderBoard({ board }: LunchOrderBoardProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  /**
   * Preview choices live only in this component. `useOptimistic` rolls back once
   * its transition settles, and in preview there is no action to settle against.
   */
  const [previewChoices, setPreviewChoices] = useState<
    Record<string, LunchChoice>
  >({});

  const [optimistic, applyOptimistic] = useOptimistic(
    board.orders,
    (state, entry: OptimisticEntry) => ({
      ...state,
      [entry.key]: {
        ...(state[entry.key] ?? {
          dinerId: "",
          dateKey: "",
          note: null,
          orderedByName: null,
          orderedBySelf: false,
          updatedAt: new Date().toISOString(),
        }),
        choice: entry.choice,
      },
    }),
  );

  function handleChoose(diner: LunchDiner, day: LunchDay, choice: LunchChoice) {
    const key = lunchOrderKey(diner.id, day.dateKey);
    setError(null);
    setSavedKey(null);

    if (board.previewOnly) {
      setPreviewChoices((current) => ({ ...current, [key]: choice }));
      return;
    }

    startTransition(async () => {
      applyOptimistic({ key, choice });

      const result = await placeLunchOrderAction({
        dinerId: diner.id,
        dateKey: day.dateKey,
        choice,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
      setSavedKey(key);
    });
  }

  if (board.diners.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
        <UtensilsCrossed
          className="mx-auto mb-2 size-5 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-foreground">
          No one to order for yet.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          If you are a parent, contact the main office so your account can be
          linked to your student.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {board.previewOnly ? (
        <p className="rounded-lg border border-[#D4A017]/40 bg-[#D4A017]/10 px-3 py-2 text-sm text-foreground">
          <span className="font-semibold">Preview only.</span> Tap around to see
          how families order. Nothing is saved, and the kitchen counts do not
          change.
        </p>
      ) : null}

      {board.diners.map((diner) => {
        const avoidsEntree = avoidsHotEntree(diner.dietary?.restrictions ?? []);

        return (
        <section
          key={diner.id}
          className="overflow-hidden rounded-xl border border-border bg-card"
        >
          <header className="border-b border-border px-4 py-3">
            <DinerHeading diner={diner} />
          </header>

          <ul className="divide-y divide-border">
            {board.days.map((day) => {
              const key = lunchOrderKey(diner.id, day.dateKey);
              const order = optimistic[key];
              const existing = board.orders[key];
              const chosen = board.previewOnly
                ? (previewChoices[key] ?? null)
                : (order?.choice ?? null);

              return (
                <li key={day.dateKey} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {day.shortLabel}
                      {day.isToday ? (
                        <span className="ml-2 rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-xs font-medium text-[#2F80ED]">
                          Today
                        </span>
                      ) : null}
                    </p>
                    {!day.isOpen ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="size-3" aria-hidden="true" />
                        Ordering closed
                      </span>
                    ) : board.previewOnly ? (
                      chosen ? (
                        <span className="text-xs font-medium text-[#8a6a0a]">
                          Not saved — preview
                        </span>
                      ) : null
                    ) : savedKey === key ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E8B57]">
                        <Check className="size-3" aria-hidden="true" />
                        Saved
                      </span>
                    ) : null}
                  </div>

                  {day.menu ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {day.menu.entree} · {day.menu.sides.join(", ")}
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Menu to be announced.
                    </p>
                  )}

                  {day.menuNote ? (
                    <p className="mt-1 text-xs font-medium text-[#D4A017]">
                      {day.menuNote}
                    </p>
                  ) : null}

                  <div
                    role="radiogroup"
                    aria-label={`Lunch choice for ${diner.displayName} on ${day.shortLabel}`}
                    className="mt-2 flex flex-wrap gap-2"
                  >
                    {LUNCH_CHOICES.map((choice) => {
                      const meta = LUNCH_CHOICE_META[choice];
                      const selected = chosen === choice;
                      const detail = menuLineFor(day, choice);
                      const conflicts = choice === "HOT" && avoidsEntree;

                      return (
                        <button
                          key={choice}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          disabled={!day.isOpen || pending}
                          onClick={() => handleChoose(diner, day, choice)}
                          title={
                            conflicts
                              ? "The posted entree may not fit this student's dietary restrictions."
                              : (detail ?? meta.hint)
                          }
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-left text-xs font-medium transition-colors",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            selected
                              ? "border-[#2F80ED] bg-[#2F80ED]/10 text-[#2F80ED]"
                              : conflicts
                                ? "border-dashed border-[#C0392B]/50 bg-background text-[#C0392B]/80 hover:border-[#C0392B]"
                                : "border-border bg-background text-muted-foreground hover:border-[#2F80ED]/40 hover:text-foreground",
                          )}
                        >
                          {meta.label}
                          {detail ? (
                            <span className="block font-normal opacity-80">
                              {detail}
                            </span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {avoidsEntree && chosen === "HOT" ? (
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#C0392B]">
                      <AlertTriangle className="size-3" aria-hidden="true" />
                      Heads up — this student&apos;s dietary record suggests the
                      vegetarian option instead.
                    </p>
                  ) : null}

                  {existing && !existing.orderedBySelf && existing.orderedByName ? (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Ordered by {existing.orderedByName}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
        );
      })}
    </div>
  );
}
