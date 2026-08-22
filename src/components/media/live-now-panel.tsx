import Link from "next/link";
import { ArrowRight, Radio } from "lucide-react";

import { toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView } from "@/services/media-service";

type LiveNowPanelProps = {
  activeLive: CampusMediaItemView | null;
  /** Shown in the offline state so people know when to come back. */
  nextAirAt?: Date | null;
  /** Where to send viewers when this surface is not the one playing the stream. */
  watchHref?: string;
  /** Copy shown when nothing is on air. Keep it honest — never fake LIVE. */
  offlineLabel?: string;
};

function formatAirTime(date: Date): string {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * The unmistakable "LIVE now" entry. Renders the current broadcast inline when
 * one is on air and an honest offline card otherwise. Uses the same embed
 * helper as the video grid rather than a second player stack.
 */
export function LiveNowPanel({
  activeLive,
  nextAirAt = null,
  watchHref,
  offlineLabel,
}: LiveNowPanelProps) {
  if (!activeLive) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden="true" />
            Offline
          </span>
          <p className="text-sm font-medium text-foreground">
            {offlineLabel ?? "Nothing is live right now."}
          </p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {nextAirAt
            ? `Next scheduled broadcast: ${formatAirTime(nextAirAt)}. The player appears here automatically when Broadcasting goes on air.`
            : "When Broadcasting goes on air, the stream appears here automatically. Until then, browse the recent and archive tabs below."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-br from-[#2A0A12] to-[#0A2342] text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]">
            <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
            Live now
          </span>
          <p className="mt-2 truncate text-lg font-semibold tracking-tight">
            {activeLive.title}
          </p>
          <p className="text-sm text-white/70">
            On air · started by {activeLive.uploaderName}
          </p>
        </div>
        {watchHref ? (
          <Link
            href={watchHref}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0A2342] transition-transform hover:translate-x-0.5"
          >
            <Radio className="size-4" aria-hidden="true" />
            Watch live
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>

      {!watchHref ? (
        activeLive.embedUrl ? (
          <div className="aspect-video w-full border-t border-white/10">
            <iframe
              title={`${activeLive.title} — live`}
              src={toMediaEmbedUrl(activeLive.embedUrl)}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="border-t border-white/10 px-5 py-4 text-sm text-white/70">
            The stream is on air, but the crew has not posted a public player URL
            yet. Add a YouTube Live or Vimeo embed URL in the control room and it
            will play right here.
          </p>
        )
      ) : null}
    </div>
  );
}
