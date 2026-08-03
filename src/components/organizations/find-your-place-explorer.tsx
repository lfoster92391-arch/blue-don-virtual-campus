"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { OrganizationDiscoveryCardView } from "@/components/organizations/organization-discovery-card";
import { Input } from "@/components/ui/input";
import {
  DISCOVERY_FILTER_LABELS,
  type DiscoveryFilter,
} from "@/config/organization-profiles";
import {
  filterDiscoveryCards,
  searchDiscoveryCards,
  type OrganizationDiscoveryCard,
  type OrganizationMatch,
} from "@/lib/organization-discovery";
import { cn } from "@/lib/utils";

const FILTER_ORDER: DiscoveryFilter[] = [
  "all",
  "technology",
  "leadership",
  "service",
  "faith",
  "arts",
  "academics",
  "athletics",
];

type FindYourPlaceExplorerProps = {
  organizations: OrganizationDiscoveryCard[];
  recommended: OrganizationMatch[];
  facultyLookup?: boolean;
};

export function FindYourPlaceExplorer({
  organizations,
  recommended,
  facultyLookup = false,
}: FindYourPlaceExplorerProps) {
  const [filter, setFilter] = useState<DiscoveryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const byCategory = filterDiscoveryCards(organizations, filter);
    return searchDiscoveryCards(byCategory, searchQuery);
  }, [organizations, filter, searchQuery]);

  return (
    <div className="space-y-10">
      {!facultyLookup && recommended.length > 0 ? (
        <section aria-labelledby="recommended-heading">
          <div className="mb-4 space-y-1">
            <h2
              id="recommended-heading"
              className="text-lg font-semibold text-[#0A2342] dark:text-white"
            >
              ⭐ Recommended for you
            </h2>
            <p className="text-sm text-muted-foreground">
              Based on your academies, interests, and campus activity.
            </p>
          </div>
          <ul className="grid gap-4 lg:grid-cols-2">
            {recommended.map((org) => (
              <li key={org.id}>
                <OrganizationDiscoveryCardView organization={org} showMatch />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="browse-heading">
        <div className="mb-4 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-1">
              <h2
                id="browse-heading"
                className="text-lg font-semibold text-[#0A2342] dark:text-white"
              >
                {facultyLookup ? "All campus clubs" : "Discover organizations"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {filtered.length} organization{filtered.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by club name…"
                aria-label="Search clubs by name"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter organizations">
            {FILTER_ORDER.map((value) => (
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
                {DISCOVERY_FILTER_LABELS[value]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <ul className="grid gap-4 lg:grid-cols-2">
            {filtered.map((org) => (
              <li key={org.id}>
                <OrganizationDiscoveryCardView
                  organization={org}
                  hideJoinAction={facultyLookup}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            {searchQuery.trim()
              ? "No clubs match your search. Try a different name or clear the search."
              : "No organizations match this filter yet."}
          </p>
        )}
      </section>
    </div>
  );
}
