"use client";

import { useCallback, useMemo, useState } from "react";
import { Dices, Search, Sparkles } from "lucide-react";

import { HiddenCareerCard } from "@/components/pathways/hidden-career-card";
import {
  HIDDEN_CAREER_CATEGORY_LABELS,
  HIDDEN_CAREER_CATEGORY_ORDER,
  HIDDEN_CAREERS,
  HIDDEN_CAREERS_SECTION,
  type HiddenCareerCategoryFilter,
} from "@/config/hidden-careers";
import { cn } from "@/lib/utils";

function matchesSearch(career: (typeof HIDDEN_CAREERS)[number], query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [
    career.title,
    career.hook,
    career.whatTheyDo,
    career.localDemand,
    career.educationRequired,
    ...career.localPrograms.flatMap((program) => [program.school, program.program]),
    ...career.internshipPath,
    career.salaryNote ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function HiddenCareersExplorer() {
  const [filter, setFilter] = useState<HiddenCareerCategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return HIDDEN_CAREERS.filter((career) => {
      const categoryMatch = filter === "all" || career.category === filter;
      const gemMatch = !hiddenGemsOnly || career.isHiddenGem;
      const searchMatch = matchesSearch(career, search.trim());
      return categoryMatch && gemMatch && searchMatch;
    });
  }, [filter, hiddenGemsOnly, search]);

  const surpriseMe = useCallback(() => {
    const pool = filtered.length > 0 ? filtered : HIDDEN_CAREERS;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setHighlightedId(pick.id);
    requestAnimationFrame(() => {
      document.getElementById(`career-${pick.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
    window.setTimeout(() => setHighlightedId(null), 4000);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#D4A017]/30 bg-gradient-to-br from-[#D4A017]/10 via-transparent to-[#2F80ED]/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#D4A017]">
              {HIDDEN_CAREERS_SECTION.subtitle}
            </p>
            <h2 className="text-xl font-semibold text-[#0A2342] dark:text-white">
              {HIDDEN_CAREERS_SECTION.title}
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {HIDDEN_CAREERS_SECTION.description}
            </p>
            <p className="text-xs text-muted-foreground">
              Serving zip codes: {HIDDEN_CAREERS_SECTION.zipCodes.join(" · ")}
            </p>
          </div>
          <button
            type="button"
            onClick={surpriseMe}
            className="inline-flex items-center gap-2 rounded-full border border-[#D4A017]/40 bg-[#D4A017]/10 px-4 py-2 text-sm font-medium text-[#9A7B0A] transition-colors hover:bg-[#D4A017]/20 dark:text-[#D4A017]"
          >
            <Dices className="size-4" />
            Surprise me
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {filtered.length} career{filtered.length === 1 ? "" : "s"} found
            {hiddenGemsOnly ? " (hidden gems only)" : ""}
          </p>
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search careers, schools…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
            aria-label="Search hidden careers"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter careers by category">
          {HIDDEN_CAREER_CATEGORY_ORDER.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                filter === value
                  ? "bg-[#0A2342] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
              onClick={() => setFilter(value)}
            >
              {HIDDEN_CAREER_CATEGORY_LABELS[value]}
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-pressed={hiddenGemsOnly}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
            hiddenGemsOnly
              ? "bg-[#D4A017] text-white"
              : "border border-[#D4A017]/40 text-[#9A7B0A] hover:bg-[#D4A017]/10 dark:text-[#D4A017]",
          )}
          onClick={() => setHiddenGemsOnly((value) => !value)}
        >
          <Sparkles className="size-3.5" />
          Hidden gems
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((career) => (
            <HiddenCareerCard
              key={career.id}
              career={career}
              highlighted={highlightedId === career.id}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No careers match your filters. Try a different category, turn off hidden gems, or clear
          your search.
        </p>
      )}
    </div>
  );
}
