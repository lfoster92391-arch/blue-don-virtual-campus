"use client";

import { useMemo, useState, useTransition } from "react";
import { Radio, Sparkles, Video } from "lucide-react";

import {
  CAMPUS_MEDIA_CATEGORY_LABELS,
  type CampusMediaCategoryKey,
} from "@/config/broadcast-production";
import { updateMediaCategoryAction } from "@/features/broadcast-production/actions";
import { isDirectVideoUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type {
  CampusMediaItemView,
  VideoArchiveFilter,
} from "@/services/media-service";

const TYPE_FILTERS: { id: VideoArchiveFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "videos", label: "Videos" },
  { id: "past_lives", label: "Past lives" },
];

const CATEGORY_FILTERS: { id: VideoArchiveFilter; label: string }[] = [
  {
    id: "MORNING_ANNOUNCEMENTS",
    label: CAMPUS_MEDIA_CATEGORY_LABELS.MORNING_ANNOUNCEMENTS,
  },
  {
    id: "SPORTS_HIGHLIGHTS",
    label: CAMPUS_MEDIA_CATEGORY_LABELS.SPORTS_HIGHLIGHTS,
  },
  {
    id: "STUDENT_SPOTLIGHT",
    label: CAMPUS_MEDIA_CATEGORY_LABELS.STUDENT_SPOTLIGHT,
  },
  {
    id: "SPECIAL_EVENTS",
    label: CAMPUS_MEDIA_CATEGORY_LABELS.SPECIAL_EVENTS,
  },
  { id: "HIGHLIGHT_REEL", label: "Highlight Reel" },
];

type VideoLibraryProps = {
  items: CampusMediaItemView[];
  emptyLabel?: string;
  title?: string;
  canCategorize?: boolean;
  highlightOnly?: boolean;
};

export function VideoLibrary({
  items,
  emptyLabel = "No past broadcasts yet.",
  title = "Past Broadcasts / Video Library",
  canCategorize = false,
  highlightOnly = false,
}: VideoLibraryProps) {
  const [filter, setFilter] = useState<VideoArchiveFilter>(
    highlightOnly ? "HIGHLIGHT_REEL" : "all",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const archive = items
      .filter((item) => {
        if (item.status === "LIVE") return false;
        if (item.type === "VIDEO_UPLOAD") return item.status === "PUBLISHED";
        if (item.type === "LIVE_STREAM") return item.status === "ENDED";
        return false;
      })
      .sort((a, b) => {
        const aTime = (a.publishedAt ?? a.endedAt ?? a.createdAt).getTime();
        const bTime = (b.publishedAt ?? b.endedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      });

    if (highlightOnly || filter === "HIGHLIGHT_REEL") {
      return archive.filter(
        (item) => item.isHighlightReel || item.category === "HIGHLIGHT_REEL",
      );
    }
    if (filter === "videos") {
      return archive.filter((item) => item.type === "VIDEO_UPLOAD");
    }
    if (filter === "past_lives") {
      return archive.filter((item) => item.type === "LIVE_STREAM");
    }
    if (
      filter === "MORNING_ANNOUNCEMENTS" ||
      filter === "SPORTS_HIGHLIGHTS" ||
      filter === "STUDENT_SPOTLIGHT" ||
      filter === "SPECIAL_EVENTS"
    ) {
      return archive.filter((item) => item.category === filter);
    }
    return archive;
  }, [items, filter, highlightOnly]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {!highlightOnly ? (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Archive filters">
            {[...TYPE_FILTERS, ...CATEGORY_FILTERS].map((option) => (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === option.id
                    ? "bg-[#0A2342] text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const open = expandedId === item.id;
            return (
              <li key={item.id} className="rounded-lg border border-border px-3 py-3">
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setExpandedId(open ? null : item.id)}
                  aria-expanded={open}
                >
                  <div>
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      {item.isHighlightReel || item.category === "HIGHLIGHT_REEL" ? (
                        <Sparkles className="size-4 text-[#C9A227]" aria-hidden="true" />
                      ) : item.type === "LIVE_STREAM" ? (
                        <Radio className="size-4 text-red-500" aria-hidden="true" />
                      ) : (
                        <Video className="size-4 text-[#2F80ED]" aria-hidden="true" />
                      )}
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.uploaderName}
                      {item.category
                        ? ` · ${CAMPUS_MEDIA_CATEGORY_LABELS[item.category as CampusMediaCategoryKey] ?? item.category}`
                        : ""}
                      {item.publishedAt || item.endedAt
                        ? ` · ${(item.publishedAt ?? item.endedAt)!.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}`
                        : ""}
                    </p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    ) : null}
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {item.isHighlightReel || item.category === "HIGHLIGHT_REEL"
                      ? "highlight"
                      : item.type === "LIVE_STREAM"
                        ? "past live"
                        : "video"}
                  </span>
                </button>

                {open ? <ArchivePlayback item={item} /> : null}

                {canCategorize ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <label className="text-xs text-muted-foreground" htmlFor={`cat-${item.id}`}>
                      Category
                    </label>
                    <select
                      id={`cat-${item.id}`}
                      className="rounded-md border border-input bg-background px-2 py-1 text-xs"
                      defaultValue={item.category ?? ""}
                      disabled={pending}
                      onChange={(e) => {
                        const value = e.target.value as CampusMediaCategoryKey | "";
                        startTransition(() => {
                          void updateMediaCategoryAction(
                            item.id,
                            value,
                            value === "HIGHLIGHT_REEL",
                          );
                        });
                      }}
                    >
                      <option value="">Uncategorized</option>
                      {(Object.keys(CAMPUS_MEDIA_CATEGORY_LABELS) as CampusMediaCategoryKey[]).map(
                        (key) => (
                          <option key={key} value={key}>
                            {CAMPUS_MEDIA_CATEGORY_LABELS[key]}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ArchivePlayback({ item }: { item: CampusMediaItemView }) {
  const mediaUrl = item.publicUrl ?? item.embedUrl;
  if (!mediaUrl) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        No playback URL on file for this broadcast.
      </p>
    );
  }

  if (isDirectVideoUrl(mediaUrl) || item.type === "VIDEO_UPLOAD") {
    if (
      mediaUrl.includes("youtube.com") ||
      mediaUrl.includes("youtu.be") ||
      mediaUrl.includes("vimeo.com")
    ) {
      return (
        <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border">
          <iframe
            title={item.title}
            src={toMediaEmbedUrl(mediaUrl)}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        src={mediaUrl}
        controls
        preload="metadata"
        className="mt-3 aspect-video w-full rounded-lg bg-black/5"
      />
    );
  }

  return (
    <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border">
      <iframe
        title={item.title}
        src={toMediaEmbedUrl(mediaUrl)}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
