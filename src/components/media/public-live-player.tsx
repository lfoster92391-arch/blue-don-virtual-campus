"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { PHONE_LIVE_POLL_MS } from "@/config/phone-live";
import { isHostedPlayerUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type { PublicLiveWatchPayload } from "@/services/phone-live-service";

type PublicLivePlayerProps = {
  initial?: PublicLiveWatchPayload;
  /** When provided, skip polling and just render this snapshot (SSR watch page). */
  live?: NonNullable<PublicLiveWatchPayload["live"]> | null;
  className?: string;
};

async function fetchLivePayload(): Promise<PublicLiveWatchPayload> {
  const response = await fetch("/api/watch/live", { cache: "no-store" });
  if (!response.ok) {
    return { live: null };
  }
  return (await response.json()) as PublicLiveWatchPayload;
}

/**
 * Audience player for the public watch page and campus LIVE cards.
 * Phone segments play as sequential files (works on iPhone Safari). YouTube /
 * Vimeo embeds play in an iframe. Studio-only lives (OBS, no public URL) stay honest.
 */
export function PublicLivePlayer({
  initial,
  live: liveProp,
  className,
}: PublicLivePlayerProps) {
  const [payload, setPayload] = useState<PublicLiveWatchPayload>(
    initial ?? { live: liveProp ?? null },
  );
  const live = liveProp !== undefined ? liveProp : payload.live;

  useEffect(() => {
    if (liveProp !== undefined) {
      return;
    }

    let cancelled = false;
    const tick = async () => {
      const next = await fetchLivePayload();
      if (!cancelled) {
        setPayload(next);
      }
    };

    void tick();
    const id = window.setInterval(() => void tick(), PHONE_LIVE_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [liveProp]);

  if (!live) {
    return null;
  }

  if (live.source === "phone") {
    return (
      <PhoneSegmentPlayer
        key={live.id}
        segments={live.segments}
        title={live.title}
        className={className}
      />
    );
  }

  if (live.source === "embed" && isHostedPlayerUrl(live.embedUrl)) {
    return (
      <div
        className={`aspect-video overflow-hidden bg-black ${className ?? ""}`}
      >
        <iframe
          title={`${live.title} — live`}
          src={toMediaEmbedUrl(live.embedUrl!)}
          className="size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <p className="border-t border-white/10 px-5 py-4 text-sm text-white/70">
      Broadcasting is on air. A public player appears here once the
      crew goes live from a phone or adds a YouTube / Vimeo watch link.
    </p>
  );
}

function PhoneSegmentPlayer({
  segments,
  title,
  className,
}: {
  segments: { index: number; url: string }[];
  title: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const queueRef = useRef<string[]>([]);
  const seenRef = useRef(new Set<string>());
  const startedRef = useRef(false);
  const [needsTap, setNeedsTap] = useState(true);
  const [waiting, setWaiting] = useState(segments.length === 0);

  const playNext = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    const next = queueRef.current.shift();
    if (!next) {
      setWaiting(true);
      return;
    }
    setWaiting(false);
    video.src = next;
    const play = video.play();
    if (play) {
      void play.catch(() => setNeedsTap(true));
    }
  }, []);

  useEffect(() => {
    const urls = segments.map((segment) => segment.url);
    const fresh = urls.filter((url) => !seenRef.current.has(url));
    if (fresh.length === 0) {
      return;
    }

    fresh.forEach((url) => seenRef.current.add(url));

    if (!startedRef.current) {
      const liveEdge = fresh.slice(-2);
      queueRef.current.push(...liveEdge);
      startedRef.current = true;
      playNext();
      return;
    }

    queueRef.current.push(...fresh);
    const video = videoRef.current;
    if (video && (video.paused || video.ended) && !needsTap) {
      playNext();
    }
  }, [segments, playNext, needsTap]);

  return (
    <div className={`relative aspect-video overflow-hidden bg-black ${className ?? ""}`}>
      <video
        ref={videoRef}
        className="size-full object-contain"
        playsInline
        autoPlay
        muted={needsTap}
        controls
        onEnded={playNext}
        onPlay={() => setNeedsTap(false)}
        aria-label={`${title} — live from phone`}
      />
      {waiting ? (
        <p className="pointer-events-none absolute inset-x-0 bottom-10 text-center text-sm text-white/80">
          Waiting for the next clip from the phone…
        </p>
      ) : null}
      {needsTap && segments.length > 0 ? (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/40 text-base font-semibold text-white"
          onClick={() => {
            const video = videoRef.current;
            if (!video) {
              return;
            }
            video.muted = false;
            void video.play().then(() => setNeedsTap(false)).catch(() => undefined);
          }}
        >
          Tap to play LIVE
        </button>
      ) : null}
    </div>
  );
}
