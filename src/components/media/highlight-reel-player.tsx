"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ListVideo, Play, Sparkles } from "lucide-react";

import { isDirectVideoUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusVideoCard } from "@/services/media-service";

type HighlightReelPlayerProps = {
  items: CampusVideoCard[];
  emptyLabel: string;
};

/**
 * Playlist-style reel: one big player plus an up-next queue. Clips are the ones
 * the crew flagged for the reel — nothing is auto-detected from game film, so
 * the running order is exactly what a producer curated.
 *
 * Uploaded files auto-advance on `ended`; embedded players (YouTube/Vimeo)
 * cannot report completion from an iframe, so those advance on Next.
 */
export function HighlightReelPlayer({ items, emptyLabel }: HighlightReelPlayerProps) {
  const [index, setIndex] = useState(0);

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );
  }

  const safeIndex = Math.min(index, items.length - 1);
  const current = items[safeIndex];
  const playable = items.filter((item) => item.url).length;

  const goTo = (next: number) => {
    setIndex(((next % items.length) + items.length) % items.length);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="aspect-video overflow-hidden rounded-xl border border-border bg-black">
          {current.url ? (
            isDirectVideoUrl(current.url) ? (
              <video
                key={current.id}
                src={current.url}
                controls
                autoPlay
                preload="metadata"
                className="size-full"
                onEnded={() => goTo(safeIndex + 1)}
              />
            ) : (
              <iframe
                key={current.id}
                title={current.title}
                src={toMediaEmbedUrl(current.url)}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <div className="flex size-full items-center justify-center px-6 text-center text-sm text-white/70">
              This clip has no playback URL yet.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#0A2342] dark:text-white">
              {current.title}
            </p>
            <p className="text-xs text-muted-foreground">
              Clip {safeIndex + 1} of {items.length} · {current.kicker} · {current.credit}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goTo(safeIndex - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goTo(safeIndex + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0A2342] px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#123A5C]"
            >
              Next
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {current.description ? (
          <p className="text-sm text-muted-foreground">{current.description}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <ListVideo className="size-4" aria-hidden="true" />
          Up next
          <span className="ml-auto text-xs font-normal text-muted-foreground">
            {playable} playable
          </span>
        </p>
        <ol className="max-h-[28rem] space-y-1.5 overflow-y-auto pr-1">
          {items.map((item, itemIndex) => {
            const active = itemIndex === safeIndex;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  aria-current={active}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    active
                      ? "border-[#0A2342] bg-[#0A2342]/5 dark:border-[#C9A227] dark:bg-[#C9A227]/10"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-[#0A2342] text-[10px] font-bold text-white">
                    {active ? (
                      <Play className="size-3 fill-white" aria-hidden="true" />
                    ) : (
                      itemIndex + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {item.isHighlightReel ? (
                        <Sparkles className="size-3 text-[#C9A227]" aria-hidden="true" />
                      ) : null}
                      {item.kicker}
                      {item.url ? "" : " · no video URL"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
