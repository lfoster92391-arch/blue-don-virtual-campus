"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { MentorCard } from "@/components/mentors/mentor-card";
import {
  MENTOR_CATEGORY_LABELS,
  MENTOR_CATEGORY_ORDER,
  type MentorCategoryFilter,
} from "@/config/mentor-network";
import type { MentorSummary } from "@/services/mentor-network-service";
import { cn } from "@/lib/utils";

type MentorExplorerProps = {
  mentors: MentorSummary[];
};

function matchesSearch(mentor: MentorSummary, query: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [
    mentor.name,
    mentor.title,
    mentor.organization,
    mentor.bio,
    ...mentor.expertiseTags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

export function MentorExplorer({ mentors }: MentorExplorerProps) {
  const [filter, setFilter] = useState<MentorCategoryFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mentors.filter((mentor) => {
      const categoryMatch = filter === "all" || mentor.category === filter;
      const searchMatch = matchesSearch(mentor, search.trim());
      return categoryMatch && searchMatch;
    });
  }, [mentors, filter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Browse mentors
          </h2>
          <p className="text-sm text-muted-foreground">
            {filtered.length} school-approved mentor{filtered.length === 1 ? "" : "s"}
          </p>
        </div>

        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search mentors…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm"
            aria-label="Search mentors"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter mentors by category">
        {MENTOR_CATEGORY_ORDER.map((value) => (
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
            {MENTOR_CATEGORY_LABELS[value]}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No mentors match your search. Try a different category or keyword.
        </p>
      )}
    </div>
  );
}
