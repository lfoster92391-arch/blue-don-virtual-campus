import { Radio, Video } from "lucide-react";

import { isDirectVideoUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView } from "@/services/media-service";

type MediaFeedProps = {
  items: CampusMediaItemView[];
  emptyLabel?: string;
};

export function MediaFeed({ items, emptyLabel }: MediaFeedProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {emptyLabel ?? "No campus media yet."}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-border px-3 py-3">
          <MediaFeedItem item={item} />
        </li>
      ))}
    </ul>
  );
}

function MediaFeedItem({ item }: { item: CampusMediaItemView }) {
  const isLive = item.status === "LIVE";
  const mediaUrl = item.embedUrl ?? item.publicUrl;

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
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
            {item.publishedAt
              ? ` · ${item.publishedAt.toLocaleDateString(undefined, {
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
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            isLive
              ? "bg-red-500/10 text-red-600"
              : item.status === "ENDED"
                ? "bg-muted text-muted-foreground"
                : "bg-[#2F80ED]/10 text-[#2F80ED]"
          }`}
        >
          {item.status.toLowerCase()}
        </span>
      </div>

      {mediaUrl && item.type === "VIDEO_UPLOAD" ? (
        mediaUrl.includes("youtube.com") ||
        mediaUrl.includes("youtu.be") ||
        mediaUrl.includes("vimeo.com") ? (
          <div className="aspect-video overflow-hidden rounded-lg border border-border">
            <iframe
              title={item.title}
              src={toMediaEmbedUrl(mediaUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            src={mediaUrl}
            controls
            preload="metadata"
            className="aspect-video w-full rounded-lg bg-black/5"
          />
        )
      ) : null}

      {mediaUrl && item.type === "LIVE_STREAM" ? (
        isDirectVideoUrl(mediaUrl) ? (
          <video
            src={mediaUrl}
            controls
            preload="metadata"
            className="aspect-video w-full rounded-lg bg-black/5"
          />
        ) : (
          <div className="aspect-video overflow-hidden rounded-lg border border-border">
            <iframe
              title={item.title}
              src={toMediaEmbedUrl(mediaUrl)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      ) : null}
    </div>
  );
}
