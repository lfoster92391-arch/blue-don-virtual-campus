"use client";

import { useMemo, useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Play,
  Radio,
  Search,
  Sparkles,
  Video,
} from "lucide-react";

import { MediaCrewControls } from "@/components/media/media-crew-controls";
import { useWatchLater } from "@/components/media/use-watch-later";
import type { CampusMediaCategoryKey } from "@/config/broadcast-production";
import { isDirectVideoUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import { RECENT_WINDOW_DAYS } from "@/lib/media-recency";
import type { CampusVideoCard } from "@/services/media-service";

type GridView = "recent" | "all" | "saved";

type VideoGridProps = {
  items: CampusVideoCard[];
  emptyLabel: string;
  /** Start of the "recent" window. Omit to hide the Recent tab. */
  recentSince?: Date;
  /** Enables the watch-later toggle and the Saved tab for this user. */
  watchLaterUserId?: string;
  /** Adds a client-side title/kicker filter above the grid. */
  searchable?: boolean;
  /** Which tab opens first. Defaults to Recent when there is enough history. */
  defaultView?: GridView;
  /**
   * Broadcasting crew only — shows the reel toggle and the delete control so a
   * producer can curate and prune the library from the grid itself.
   */
  canCurate?: boolean;
  /** Category a clip falls back to when it leaves the reel. */
  curateCategory?: CampusMediaCategoryKey;
};

function formatDate(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function VideoGrid({
  items,
  emptyLabel,
  recentSince,
  watchLaterUserId,
  searchable = false,
  defaultView,
  canCurate = false,
  curateCategory = "SPORTS_HIGHLIGHTS",
}: VideoGridProps) {
  const recentCutoff = recentSince?.getTime() ?? null;
  const recentCount = useMemo(
    () =>
      recentCutoff === null
        ? 0
        : items.filter((item) => item.sortAt.getTime() >= recentCutoff).length,
    [items, recentCutoff],
  );

  // Only lead with Recent when the archive is big enough for the split to help.
  const initialView: GridView =
    defaultView ?? (recentCount > 0 && items.length > recentCount ? "recent" : "all");

  const [view, setView] = useState<GridView>(initialView);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const watchLater = useWatchLater(watchLaterUserId ?? "anonymous");
  const savingEnabled = Boolean(watchLaterUserId);

  const scoped = useMemo(() => {
    if (view === "saved") {
      return items.filter((item) => watchLater.ids.includes(item.id));
    }
    if (view === "recent" && recentCutoff !== null) {
      return items.filter((item) => item.sortAt.getTime() >= recentCutoff);
    }
    return items;
  }, [items, view, watchLater.ids, recentCutoff]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return scoped;
    }
    return scoped.filter((item) =>
      [item.title, item.kicker, item.credit, item.description ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [scoped, query]);

  const tabs: { id: GridView; label: string; count: number }[] = [
    ...(recentCutoff !== null
      ? [
          {
            id: "recent" as const,
            label: `Recent (${RECENT_WINDOW_DAYS}d)`,
            count: recentCount,
          },
        ]
      : []),
    { id: "all", label: "Full archive", count: items.length },
    ...(savingEnabled
      ? [{ id: "saved" as const, label: "Watch later", count: watchLater.count }]
      : []),
  ];

  return (
    <div className="space-y-4">
      {items.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Video views">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={view === tab.id}
                onClick={() => setView(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  view === tab.id
                    ? "bg-[#0A2342] text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                <span className="ml-1 opacity-70">{tab.count}</span>
              </button>
            ))}
          </div>

          {searchable ? (
            <div className="relative w-full max-w-xs">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, sport, or crew"
                aria-label="Search videos"
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm"
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? emptyLabel
            : view === "saved"
              ? "Nothing saved yet — tap the bookmark on any video to watch it later."
              : query.trim()
                ? "No videos match that search."
                : `Nothing published in the last ${RECENT_WINDOW_DAYS} days — open the full archive.`}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <VideoCard
              key={item.id}
              item={item}
              playing={playingId === item.id}
              onPlay={() => setPlayingId(item.id)}
              saved={savingEnabled && watchLater.has(item.id)}
              onToggleSave={savingEnabled ? () => watchLater.toggle(item.id) : undefined}
              canManage={canCurate && item.source === "media"}
              curateCategory={curateCategory}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function VideoCard({
  item,
  playing,
  onPlay,
  saved,
  onToggleSave,
  canManage,
  curateCategory,
}: {
  item: CampusVideoCard;
  playing: boolean;
  onPlay: () => void;
  saved: boolean;
  onToggleSave?: () => void;
  canManage: boolean;
  curateCategory: CampusMediaCategoryKey;
}) {
  const published = formatDate(item.publishedAt ?? item.sortAt);

  return (
    <li className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="relative aspect-video bg-[#0A2342]">
        {playing && item.url ? (
          <VideoPlayback item={item} />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            disabled={!item.url}
            className="group relative size-full disabled:cursor-not-allowed"
            aria-label={item.url ? `Play ${item.title}` : `${item.title} — no video on file`}
          >
            {item.thumbnailUrl ? (
              // Thumbnails are crew uploads or pasted URLs, not build-time assets.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.thumbnailUrl}
                alt=""
                className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : (
              <span
                className="absolute inset-0 bg-gradient-to-br from-[#0A2342] via-[#123A5C] to-[#2F80ED]/50"
                aria-hidden="true"
              />
            )}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur-sm transition-transform group-enabled:group-hover:scale-105">
                <Play className="size-6 translate-x-0.5 fill-white text-white" aria-hidden="true" />
              </span>
            </span>
            {!item.url ? (
              <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                No playback URL yet
              </span>
            ) : null}
          </button>
        )}

        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
          {item.isHighlightReel ? (
            <Sparkles className="size-3 text-[#C9A227]" aria-hidden="true" />
          ) : item.isReplay ? (
            <Radio className="size-3 text-red-400" aria-hidden="true" />
          ) : (
            <Video className="size-3 text-[#7FB3FF]" aria-hidden="true" />
          )}
          {item.kicker}
        </span>

        {onToggleSave ? (
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${item.title} from watch later` : `Save ${item.title} for later`}
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
          >
            {saved ? (
              <BookmarkCheck className="size-4 text-[#C9A227]" aria-hidden="true" />
            ) : (
              <Bookmark className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 py-3">
        <p className="font-semibold leading-snug text-[#0A2342] dark:text-white">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {item.credit}
          {published ? ` · ${published}` : ""}
          {item.isReplay ? " · past live" : ""}
        </p>
        {item.description ? (
          <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}

        {canManage ? (
          <MediaCrewControls
            mediaId={item.id}
            title={item.title}
            isHighlightReel={item.isHighlightReel}
            fallbackCategory={curateCategory}
            className="mt-3"
          />
        ) : null}
      </div>
    </li>
  );
}

function VideoPlayback({ item }: { item: CampusVideoCard }) {
  const url = item.url!;

  if (isDirectVideoUrl(url)) {
    return (
      <video
        src={url}
        controls
        autoPlay
        preload="metadata"
        className="size-full bg-black"
      />
    );
  }

  return (
    <iframe
      title={item.title}
      src={toMediaEmbedUrl(url)}
      className="size-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}
