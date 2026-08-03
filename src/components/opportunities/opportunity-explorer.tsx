"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { OpportunityCardView } from "@/components/opportunities/opportunity-card";
import {
  OPPORTUNITY_TYPE_LABELS,
  OPPORTUNITY_TYPE_ORDER,
  type Opportunity,
  type OpportunityType,
} from "@/config/opportunities";
import { cn } from "@/lib/utils";

const FILTER_ORDER: (OpportunityType | "all")[] = ["all", ...OPPORTUNITY_TYPE_ORDER];

type OpportunityExplorerProps = {
  opportunities: Opportunity[];
  initialType?: string;
  initialSearch?: string;
};

export function OpportunityExplorer({
  opportunities,
  initialType,
  initialSearch = "",
}: OpportunityExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [type, setType] = useState<OpportunityType | "all">(
    (initialType as OpportunityType | undefined) ?? "all",
  );

  const filtered = useMemo(() => {
    let result = [...opportunities];

    if (type !== "all") {
      result = result.filter((opportunity) => opportunity.type === type);
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter(
        (opportunity) =>
          opportunity.title.toLowerCase().includes(query) ||
          opportunity.organization.toLowerCase().includes(query) ||
          opportunity.location.toLowerCase().includes(query) ||
          opportunity.description.toLowerCase().includes(query) ||
          opportunity.tags.some((tag) => tag.includes(query)),
      );
    }

    return result;
  }, [opportunities, type, search]);

  function updateUrl(nextType: OpportunityType | "all", nextSearch: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextType === "all") {
      params.delete("type");
    } else {
      params.set("type", nextType);
    }
    if (nextSearch.trim()) {
      params.set("search", nextSearch.trim());
    } else {
      params.delete("search");
    }
    const query = params.toString();
    router.replace(query ? `/opportunities?${query}` : "/opportunities", { scroll: false });
  }

  function handleTypeChange(value: OpportunityType | "all") {
    setType(value);
    updateUrl(value, search);
  }

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();
    updateUrl(type, search);
  }

  return (
    <div className="space-y-6">
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
            placeholder="Search by role, employer, or town..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none ring-[#2F80ED] focus:ring-2"
            aria-label="Search opportunities"
          />
        </form>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by type">
          {FILTER_ORDER.map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={type === value}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                type === value
                  ? "bg-[#0A2342] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}
              onClick={() => handleTypeChange(value)}
            >
              {value === "all" ? "All" : OPPORTUNITY_TYPE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
            opportunit{filtered.length === 1 ? "y" : "ies"}
            {type === "all" ? "" : ` · ${OPPORTUNITY_TYPE_LABELS[type]}`}
          </p>
          <ul className="grid gap-4 lg:grid-cols-2">
            {filtered.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityCardView opportunity={opportunity} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No opportunities match your search. Try a different type or keyword.
        </p>
      )}
    </div>
  );
}
