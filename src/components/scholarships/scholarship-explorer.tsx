"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { ScholarshipCardView } from "@/components/scholarships/scholarship-card";
import {
  SCHOLARSHIP_CATEGORY_LABELS,
  type ScholarshipCategory,
} from "@/config/scholarships";
import type { ScholarshipMatch } from "@/lib/scholarship";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: (ScholarshipCategory | "all")[] = [
  "all",
  "academic",
  "athletic",
  "service",
  "faith",
  "stem",
  "arts",
  "local",
];

type ScholarshipExplorerProps = {
  matches: ScholarshipMatch[];
  qualifiedCount: number;
  initialCategory?: string;
  initialSearch?: string;
};

export function ScholarshipExplorer({
  matches,
  qualifiedCount,
  initialCategory,
  initialSearch = "",
}: ScholarshipExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState<ScholarshipCategory | "all">(
    (initialCategory as ScholarshipCategory | undefined) ?? "all",
  );

  const filtered = useMemo(() => {
    let result = [...matches];

    if (category !== "all") {
      result = result.filter((match) => match.category === category);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (match) =>
          match.title.toLowerCase().includes(query) ||
          match.description.toLowerCase().includes(query) ||
          match.provider.toLowerCase().includes(query),
      );
    }

    return result;
  }, [matches, category, search]);

  const qualified = filtered.filter((match) => match.qualifies);
  const browse = filtered.filter((match) => !match.qualifies);

  function updateUrl(nextCategory: ScholarshipCategory | "all", nextSearch: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }
    const query = params.toString();
    router.replace(query ? `/scholarships?${query}` : "/scholarships", { scroll: false });
  }

  function handleCategoryChange(value: ScholarshipCategory | "all") {
    setCategory(value);
    updateUrl(value, search);
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateUrl(category, search);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search scholarships..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none ring-[#2F80ED] focus:ring-2"
            aria-label="Search scholarships"
          />
        </form>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
          {CATEGORY_ORDER.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={category === value}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                category === value
                  ? "bg-[#0A2342] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
              onClick={() => handleCategoryChange(value)}
            >
              {value === "all" ? "All" : SCHOLARSHIP_CATEGORY_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {qualified.length > 0 ? (
        <section id="matched-scholarships" aria-labelledby="qualified-heading">
          <div className="mb-4 space-y-1">
            <h2
              id="qualified-heading"
              className="text-lg font-semibold text-[#0A2342] dark:text-white"
            >
              ✨ You qualify ({qualified.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              {qualifiedCount} total match{qualifiedCount === 1 ? "" : "es"} based on your Madonna
              profile.
            </p>
          </div>
          <ul className="grid gap-4 lg:grid-cols-2">
            {qualified.map((scholarship) => (
              <li key={scholarship.id}>
                <ScholarshipCardView scholarship={scholarship} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {browse.length > 0 ? (
        <section aria-labelledby="browse-heading">
          <div className="mb-4 space-y-1">
            <h2
              id="browse-heading"
              className="text-lg font-semibold text-[#0A2342] dark:text-white"
            >
              {qualified.length > 0 ? "Explore more opportunities" : "All scholarships"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {browse.length} scholarship{browse.length === 1 ? "" : "s"} — review requirements to
              see if you can qualify.
            </p>
          </div>
          <ul className="grid gap-4 lg:grid-cols-2">
            {browse.map((scholarship) => (
              <li key={scholarship.id}>
                <ScholarshipCardView scholarship={scholarship} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No scholarships match your search. Try a different category or keyword.
        </p>
      ) : null}
    </div>
  );
}
