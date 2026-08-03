"use client";

import { useMemo, useState } from "react";
import { Radio, Video } from "lucide-react";

import { isDirectVideoUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView, VideoArchiveFilter } from "@/services/media-service";

const FILTERS: { id: VideoArchiveFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "videos", label: "Videos" },
  { id: "past_lives", label: "Past lives" },
];

type VideoLibraryProps = {
  items: CampusMediaItemView[];
  emptyLabel?: string;
  title?: string;
};

export function VideoLibrary({
  items,
  emptyLabel = "No past broadcasts yet.",
  title = "Past Broadcasts / Video Library",
}: VideoLibraryProps) {
  const [filter, setFilter] = useState<VideoArchiveFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

    if (filter === "videos") {
      return archive.filter((item) => item.type === "VIDEO_UPLOAD");
    }
    if (filter === "past_lives") {
      return archive.filter((item) => item.type === "LIVE_STREAM");
    }
    return archive;
  }, [items, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Archive filters">
          {FILTERS.map((option) => (
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
                      {item.type === "LIVE_STREAM" ? (
                        <Radio className="size-4 text-red-500" aria-hidden="true" />
                      ) : (
                        <Video className="size-4 text-[#2F80ED]" aria-hidden="true" />
                      )}
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.uploaderName}
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
                    {item.type === "LIVE_STREAM" ? "past live" : "video"}
                  </span>
                </button>

                {open ? <ArchivePlayback item={item} /> : null}
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
    if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be") || mediaUrl.includes("vimeo.com")) {
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
