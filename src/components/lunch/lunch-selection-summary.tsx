import Link from "next/link";
import { Check, CircleDashed, Lock } from "lucide-react";

import { LUNCH_CHOICE_META, type LunchChoice } from "@/config/lunch";
import {
  formatLastSaved,
  type LunchSelectionGroup,
  type LunchSelectionSummary,
} from "@/lib/lunch-selections";

const CHOICE_TONE: Record<LunchChoice, string> = {
  HOT: "bg-[#2F80ED]/10 text-[#2F80ED]",
  VEGETARIAN: "bg-[#2E8B57]/10 text-[#2E8B57]",
  PACKED: "bg-muted text-muted-foreground",
  NONE: "bg-muted text-muted-foreground",
};

function ChoiceBadge({ choice }: { choice: LunchChoice }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${CHOICE_TONE[choice]}`}
    >
      {LUNCH_CHOICE_META[choice].label}
    </span>
  );
}

function Group({
  group,
  showAllDays,
}: {
  group: LunchSelectionGroup;
  showAllDays: boolean;
}) {
  const rows = showAllDays
    ? group.rows
    : group.rows.filter((row) => row.choice !== null);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="font-semibold text-[#0A2342] dark:text-white">
            {group.dinerName}
          </p>
          {group.kind === "student" ? (
            <p className="text-xs text-muted-foreground">
              Your student
              {group.relationship ? ` · ${group.relationship}` : ""}
            </p>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground">
          {group.chosenCount} of {group.totalDays} days chosen
        </p>
      </header>

      {rows.length > 0 ? (
        <ul className="divide-y divide-border">
          {rows.map((row) => (
            <li
              key={row.dateKey}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {row.shortLabel}
                </span>
                {row.isToday ? (
                  <span className="rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-xs font-medium text-[#2F80ED]">
                    Today
                  </span>
                ) : null}
                {!row.isOpen ? (
                  <Lock
                    className="size-3 text-muted-foreground"
                    aria-label="Ordering closed"
                  />
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {row.choice ? (
                  <>
                    <ChoiceBadge choice={row.choice} />
                    {row.menuLine ? (
                      <span className="text-xs text-muted-foreground">
                        {row.menuLine}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-[#2E8B57]">
                      <Check className="size-3" aria-hidden="true" />
                      Saved
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <CircleDashed className="size-3" aria-hidden="true" />
                    Not chosen yet
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-4 text-sm text-muted-foreground">
          Nothing chosen for {group.dinerName} yet.
        </p>
      )}

      {!showAllDays && group.missingCount > 0 ? (
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          Still open with no choice: {group.missingLabels.join(", ")}
        </p>
      ) : null}
    </section>
  );
}

/**
 * The read-back a family gets after ordering: which student, which day, which
 * meal, and that it is saved. The board itself only flashes "Saved" on the
 * button just tapped, which disappears on the next page load — this is the
 * surface that still says so tomorrow.
 */
export function LunchSelectionSummary({
  summary,
  previewOnly = false,
  showAllDays = false,
  showFullLink = true,
}: {
  summary: LunchSelectionSummary;
  previewOnly?: boolean;
  /** Include days with no choice yet. The full page does; the card does not. */
  showAllDays?: boolean;
  showFullLink?: boolean;
}) {
  if (previewOnly) {
    return (
      <p className="text-sm text-muted-foreground">
        Preview only — choices made while previewing are never saved, so nothing
        shows up here.
      </p>
    );
  }

  const lastSaved = formatLastSaved(summary.lastSavedAt);

  if (summary.chosenCount === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center">
        <p className="text-sm font-medium text-foreground">
          No lunches chosen yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a choice for each day on the board above. Every tap saves on its
          own, and what you picked will be listed right here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-[#2E8B57]/40 bg-[#2E8B57]/10 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Check className="size-4 text-[#2E8B57]" aria-hidden="true" />
          {summary.chosenCount} lunch{summary.chosenCount === 1 ? "" : "es"}{" "}
          saved
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {lastSaved ? `Last change ${lastSaved}. ` : ""}
          {summary.missingCount > 0
            ? `${summary.missingCount} open day${summary.missingCount === 1 ? "" : "s"} still ${summary.missingCount === 1 ? "has" : "have"} no choice.`
            : "Every open day has a choice."}
        </p>
      </div>

      {summary.groups.map((group) => (
        <Group key={group.dinerId} group={group} showAllDays={showAllDays} />
      ))}

      {showFullLink ? (
        <p className="text-sm text-muted-foreground">
          <Link
            href="/lunch/selections"
            className="font-medium text-[#2F80ED] underline underline-offset-4"
          >
            See every day, including the ones still open
          </Link>
          .
        </p>
      ) : null}
    </div>
  );
}
