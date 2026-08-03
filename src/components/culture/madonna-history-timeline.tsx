"use client";

import { useRef, useState } from "react";
import { ChevronDown, Flag, Newspaper } from "lucide-react";

import {
  MADONNA_TIMELINE_CATEGORY_LABELS,
  type MadonnaTimelineCategory,
  type MadonnaTimelineEntry,
} from "@/config/madonna-timeline";
import { cn } from "@/lib/utils";

const CATEGORY_STYLES: Record<MadonnaTimelineCategory, string> = {
  founding: "bg-[#D4A017]/10 text-[#B8860B]",
  faith: "bg-purple-500/10 text-purple-600",
  academics: "bg-[#2F80ED]/10 text-[#2F80ED]",
  athletics: "bg-[#0A2342]/10 text-[#0A2342] dark:bg-white/10 dark:text-white",
  campus: "bg-[#2E8B57]/10 text-[#2E8B57]",
  arts: "bg-pink-500/10 text-pink-600",
};

type MadonnaHistoryTimelineProps = {
  entries: MadonnaTimelineEntry[];
};

export function MadonnaHistoryTimeline({ entries }: MadonnaHistoryTimelineProps) {
  const startYear = entries.find((entry) => entry.isStart)?.year ?? entries[0]?.year ?? null;
  const [openYear, setOpenYear] = useState<number | null>(startYear);
  const itemRefs = useRef<Record<number, HTMLLIElement | null>>({});

  function focusYear(year: number) {
    setOpenYear(year);
    const node = itemRefs.current[year];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function toggleYear(year: number) {
    setOpenYear((current) => (current === year ? null : year));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <label
          htmlFor="timeline-jump"
          className="text-sm font-medium text-[#0A2342] dark:text-white"
        >
          Jump to a moment
        </label>
        <select
          id="timeline-jump"
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground shadow-sm outline-none focus:border-[#2F80ED] focus:ring-2 focus:ring-[#2F80ED]/30 sm:w-auto sm:min-w-72"
          value={openYear ?? ""}
          onChange={(event) => {
            const year = Number(event.target.value);
            if (!Number.isNaN(year)) {
              focusYear(year);
            }
          }}
        >
          <option value="" disabled>
            Select a date…
          </option>
          {entries.map((entry) => (
            <option key={entry.year} value={entry.year}>
              {entry.dateLabel} — {entry.title}
            </option>
          ))}
        </select>
      </div>

      <ol className="relative ml-3 space-y-4 border-l-2 border-[#2F80ED]/25 pl-6 sm:ml-4 sm:pl-8">
        {entries.map((entry) => {
          const isOpen = openYear === entry.year;
          const panelId = `timeline-panel-${entry.year}`;
          const buttonId = `timeline-button-${entry.year}`;

          return (
            <li
              key={entry.year}
              ref={(node) => {
                itemRefs.current[entry.year] = node;
              }}
              className="relative scroll-mt-24"
            >
              <button
                type="button"
                aria-label={`Show ${entry.title}`}
                onClick={() => focusYear(entry.year)}
                className={cn(
                  "absolute -left-[3.05rem] top-0 flex size-11 items-center justify-center overflow-hidden rounded-full border-2 bg-card shadow-sm transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F80ED]/50 sm:-left-[3.55rem] sm:size-12",
                  entry.isStart ? "border-[#D4A017]" : "border-[#2F80ED]/60",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.imageSrc}
                  alt={entry.imageAlt}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </button>

              {entry.isStart ? (
                <span className="absolute -left-[3.75rem] -top-3 inline-flex items-center gap-1 rounded-full bg-[#D4A017] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow sm:-left-[4.25rem]">
                  <Flag className="size-2.5" aria-hidden="true" />
                  Start
                </span>
              ) : null}

              <div
                className={cn(
                  "rounded-xl border bg-card shadow-sm transition-colors",
                  isOpen ? "border-[#2F80ED]/50" : "border-border",
                )}
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleYear(entry.year)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#2F80ED]">
                      {entry.dateLabel}
                    </span>
                    <span className="mt-0.5 block font-semibold text-foreground">
                      {entry.title}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block",
                        CATEGORY_STYLES[entry.category],
                      )}
                    >
                      {MADONNA_TIMELINE_CATEGORY_LABELS[entry.category]}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isOpen && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </span>
                </button>

                {isOpen ? (
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="border-t border-border px-4 py-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="shrink-0 overflow-hidden rounded-lg border border-border sm:w-40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={entry.imageSrc}
                          alt={entry.imageAlt}
                          className="aspect-square w-full object-cover sm:aspect-auto sm:h-40"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 space-y-2">
                        <span
                          className={cn(
                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium sm:hidden",
                            CATEGORY_STYLES[entry.category],
                          )}
                        >
                          {MADONNA_TIMELINE_CATEGORY_LABELS[entry.category]}
                        </span>
                        {entry.headline ? (
                          <p className="text-base font-semibold leading-snug text-[#0A2342] dark:text-white">
                            {entry.headline}
                          </p>
                        ) : null}
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {entry.description}
                        </p>
                        {entry.source ? (
                          <p className="flex items-center gap-1.5 pt-1 text-xs italic text-muted-foreground">
                            <Newspaper className="size-3.5 shrink-0" aria-hidden="true" />
                            {entry.source}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
