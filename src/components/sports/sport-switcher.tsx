import Link from "next/link";

import { cn } from "@/lib/utils";
import { SPORT_SEASON_LABELS } from "@/config/sports-highlights";
import type { SportView } from "@/services/sports-highlights-service";

/**
 * Sport tabs. Uses plain links so the whole page (banner, highlights,
 * schedule, stats) re-renders on the server for the chosen sport.
 */
export function SportSwitcher({
  sports,
  activeSlug,
  basePath,
  extraParams,
}: {
  sports: SportView[];
  activeSlug: string | null;
  basePath: string;
  /** Preserved alongside `sport` (e.g. `{ tab: "sports" }` on club pages). */
  extraParams?: Record<string, string>;
}) {
  if (sports.length === 0) {
    return null;
  }

  const buildHref = (slug?: string) => {
    const params = new URLSearchParams(extraParams);
    if (slug) {
      params.set("sport", slug);
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-4"
      aria-label="Choose a sport"
    >
      <Link
        href={buildHref()}
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          activeSlug === null
            ? "bg-[#0A2342] text-white dark:bg-[#2F80ED]"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        All sports
      </Link>
      {sports.map((sport) => (
        <Link
          key={sport.id}
          href={buildHref(sport.slug)}
          title={`${sport.name} · ${SPORT_SEASON_LABELS[sport.season]}`}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            activeSlug === sport.slug
              ? "bg-[#0A2342] text-white dark:bg-[#2F80ED]"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {sport.emoji ? <span aria-hidden="true">{sport.emoji} </span> : null}
          {sport.name}
        </Link>
      ))}
    </nav>
  );
}
