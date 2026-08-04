import Link from "next/link";
import { Film } from "lucide-react";

import {
  HIGHLIGHT_KIND_LABELS,
  HIGHLIGHT_STATUS_LABELS,
} from "@/config/sports-highlights";
import type { SportsHighlightView } from "@/services/sports-highlights-service";

export function HighlightGrid({
  highlights,
  emptyLabel = "No highlights posted yet.",
  showStatus = false,
}: {
  highlights: SportsHighlightView[];
  emptyLabel?: string;
  showStatus?: boolean;
}) {
  if (highlights.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {highlights.map((highlight) => (
        <li
          key={highlight.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
        >
          <div className="relative aspect-video bg-muted">
            {highlight.imageUrl ? (
              // Remote thumbnails come from Supabase storage or pasted URLs.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={highlight.imageUrl}
                alt={highlight.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Film className="size-8" aria-hidden="true" />
              </div>
            )}
            {highlight.isFeatured ? (
              <span className="absolute left-2 top-2 rounded-full bg-[#C9A227] px-2 py-0.5 text-xs font-semibold text-[#0A2342]">
                Featured
              </span>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                {HIGHLIGHT_KIND_LABELS[highlight.kind]}
              </span>
              <span>{highlight.sportName}</span>
              {showStatus ? (
                <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                  {HIGHLIGHT_STATUS_LABELS[highlight.status]}
                </span>
              ) : null}
            </div>

            <h3 className="font-semibold text-[#0A2342] dark:text-white">
              {highlight.title}
            </h3>

            {highlight.description ? (
              <p className="text-sm text-muted-foreground">
                {highlight.description}
              </p>
            ) : null}

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground">
              {highlight.gameId && highlight.gameLabel ? (
                <Link
                  href={`/sports/games/${highlight.gameId}`}
                  className="font-medium text-[#2F80ED] hover:underline"
                >
                  {highlight.gameLabel}
                </Link>
              ) : null}
              {highlight.videoUrl ? (
                <a
                  href={highlight.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-[#2F80ED] hover:underline"
                >
                  Watch
                </a>
              ) : null}
              {highlight.credit ? <span>📷 {highlight.credit}</span> : null}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
