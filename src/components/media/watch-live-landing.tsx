"use client";

import { MessageCircle, Play, Smartphone, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { PublicLivePlayer } from "@/components/media/public-live-player";
import { PHONE_LIVE_POLL_MS } from "@/config/phone-live";
import { brandAssets, siteConfig } from "@/config/site";
import type { PublicLiveWatchPayload } from "@/services/phone-live-service";

type WatchLiveLandingProps = {
  initial: PublicLiveWatchPayload;
  nextAirAt?: string | null;
  nextTitle?: string | null;
};

async function fetchLivePayload(): Promise<PublicLiveWatchPayload> {
  const response = await fetch("/api/watch/live", { cache: "no-store" });
  if (!response.ok) {
    return { live: null };
  }
  return (await response.json()) as PublicLiveWatchPayload;
}

function formatAirTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Public Watch LIVE landing — poster energy, one big button, honest offline.
 * Phone chunk playback stays in PublicLivePlayer.
 */
export function WatchLiveLanding({
  initial,
  nextAirAt,
  nextTitle,
}: WatchLiveLandingProps) {
  const [payload, setPayload] = useState(initial);
  const [watching, setWatching] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);
  const live = payload.live;

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!live) {
      setWatching(false);
    }
  }, [live]);

  const startWatching = useCallback(() => {
    if (!live) {
      return;
    }
    setWatching(true);
    window.requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [live]);

  const nextAirLabel =
    nextAirAt && new Date(nextAirAt).getTime() > Date.now()
      ? formatAirTime(nextAirAt)
      : "";

  return (
    <div className="relative min-h-screen overflow-x-hidden text-white">
      <StadiumAtmosphere />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-8 pt-5 sm:px-6 sm:pt-7">
        <header className="flex items-start justify-between gap-3">
          <Image
            src={brandAssets.logo}
            alt="MHS Broadcasting"
            width={148}
            height={148}
            priority
            className="size-20 shrink-0 object-contain drop-shadow-lg sm:size-32"
          />
          <p className="max-w-[11rem] shrink-0 pt-0.5 text-right text-[0.62rem] font-semibold uppercase leading-[1.35] tracking-[0.12em] text-white sm:max-w-none sm:pt-2 sm:text-sm sm:tracking-[0.18em]">
            Student led
            <br />
            Real opportunities
            <br />
            Blue Don Pride
            <span
              aria-hidden
              className="mt-2 ml-auto block h-1.5 w-14 rounded-full bg-[#1E5BB8] sm:w-24"
            />
          </p>
        </header>

        <main className="flex flex-1 flex-col">
          <section className="mt-6 text-center sm:mt-8">
            <h1 className="text-balance">
              <span className="block text-lg font-extrabold uppercase tracking-[0.06em] text-white sm:text-2xl">
                Want to watch the
              </span>
              <span className="mt-1 block font-black uppercase leading-[0.92] tracking-tight text-[#C6CCD6] [text-shadow:0_1px_0_#F4F6F8,0_2px_0_#9AA3B0,0_4px_0_#0A2342,0_8px_18px_rgba(0,0,0,0.45)] text-[clamp(1.85rem,9vw,3.75rem)]">
                Madonna Home Games
              </span>
              <span
                className="mt-2 inline-block -rotate-6 text-[#1E64D8] [text-shadow:2px_2px_0_#fff,-2px_-2px_0_#fff,2px_-2px_0_#fff,-2px_2px_0_#fff,0_6px_0_#061428] text-[clamp(3.4rem,18vw,6.25rem)] leading-none"
                style={{ fontFamily: "var(--font-watch-script), cursive" }}
              >
                LIVE?
              </span>
            </h1>

            <div className="relative mx-auto mt-3 inline-flex max-w-full items-center justify-center px-7 py-2 sm:mt-4 sm:px-10">
              <span
                aria-hidden
                className="absolute inset-0 -rotate-2 bg-white"
                style={{
                  borderRadius: "48% 52% 50% 50% / 60% 55% 45% 40%",
                }}
              />
              <p className="relative text-base font-black uppercase tracking-[0.12em] text-[#0A2342] sm:text-xl">
                No commentary.
              </p>
            </div>

            <p className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 text-sm text-white/90 sm:text-base">
              <Video className="size-5 shrink-0 text-white" aria-hidden="true" />
              <span>
                Our Student Broadcast Team will be there recording the game.
              </span>
            </p>
          </section>

          <section className="mt-7 sm:mt-9">
            {watching && live ? (
              <div
                ref={playerRef}
                id="player"
                className="overflow-hidden rounded-2xl border border-[#1E5BB8]/50 bg-black/70 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em]">
                      <span
                        className="size-1.5 animate-pulse rounded-full bg-white"
                        aria-hidden="true"
                      />
                      Live now
                    </span>
                    <p className="mt-1 truncate text-base font-semibold">
                      {live.title}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWatching(false)}
                    className="text-xs font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
                  >
                    Back to poster
                  </button>
                </div>
                <PublicLivePlayer initial={payload} />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={startWatching}
                  disabled={!live}
                  aria-disabled={!live}
                  className="inline-flex min-h-16 w-full max-w-md items-center justify-center gap-3 rounded-2xl border-2 border-white/25 bg-[#0A2342] px-6 text-xl font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_0_#040910,0_16px_32px_rgba(0,0,0,0.4)] transition-[transform,box-shadow,opacity] enabled:hover:-translate-y-0.5 enabled:active:translate-y-1 enabled:active:shadow-[0_3px_0_#040910] disabled:cursor-not-allowed disabled:opacity-55 sm:min-h-20 sm:text-2xl"
                >
                  <Play
                    className="size-7 fill-white sm:size-8"
                    aria-hidden="true"
                  />
                  Watch LIVE
                </button>
                <p
                  className={`mt-3 text-center text-sm ${live ? "font-semibold text-[#7EB6FF]" : "text-white/70"}`}
                  aria-live="polite"
                >
                  {live
                    ? `On air now — tap to watch${live.source === "phone" ? " · from a phone" : ""}`
                    : `Nothing is live right now.${
                        nextAirLabel
                          ? ` Next scheduled broadcast: ${nextAirLabel}${nextTitle ? ` · ${nextTitle}` : ""}.`
                          : ""
                      }`}
                </p>
              </div>
            )}
          </section>

          <aside className="mt-8 rounded-xl border border-white/25 bg-[#0A2342]/85 px-4 py-3 sm:mt-10">
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-[#061428]">
                <Smartphone className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide">
                  Add to your home screen{" "}
                  <span className="font-semibold normal-case tracking-normal">
                    for quicker viewing!
                  </span>
                </p>
                <p className="mt-0.5 text-xs text-white/70">
                  A few taps and the live stream is always ready.
                </p>
              </div>
            </div>
          </aside>

          <p className="mt-6 flex items-start gap-2.5 text-sm italic text-white/80">
            <MessageCircle
              className="mt-0.5 size-5 shrink-0 text-white"
              aria-hidden="true"
            />
            <span>
              We ask that you are patient with our students who are new to
              broadcasting, as we go throughout the season, our team will
              improve.
            </span>
          </p>
        </main>

        <footer className="relative mt-10 pb-4 pt-8 sm:pb-8">
          <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.14em] text-white/80 sm:text-xs sm:tracking-[0.16em]">
            Faith <span className="text-white/40">|</span> Education{" "}
            <span className="text-white/40">|</span> Athletics{" "}
            <span className="text-white/40">|</span> It&apos;s a great day to be
            a Don!
          </p>
          <p className="mt-3 text-center text-[0.7rem] text-white/40">
            Crew sign in to go live.{" "}
            <Link href="/login" className="text-white/55 underline">
              Campus login
            </Link>
          </p>
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 right-0 hidden select-none font-black leading-none text-[#0A2342] [text-shadow:2px_2px_0_#fff,-1px_-1px_0_#C6CCD6] text-[5.5rem] sm:block"
          >
            M
          </span>
          <p className="sr-only">{siteConfig.institution}</p>
        </footer>
      </div>
    </div>
  );
}

function StadiumAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050B16]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 46% at 50% -8%, rgba(30, 91, 184, 0.42), transparent 58%),
            radial-gradient(circle at 12% 10%, rgba(255,255,255,0.55) 0 2px, rgba(255,220,160,0.14) 10px, transparent 44px),
            radial-gradient(circle at 28% 6%, rgba(255,255,255,0.42) 0 2px, transparent 34px),
            radial-gradient(circle at 50% 4%, rgba(255,255,255,0.6) 0 3px, rgba(180,210,255,0.16) 14px, transparent 58px),
            radial-gradient(circle at 70% 8%, rgba(255,255,255,0.4) 0 2px, transparent 38px),
            radial-gradient(circle at 86% 13%, rgba(255,255,255,0.5) 0 2px, rgba(255,220,160,0.12) 12px, transparent 50px),
            radial-gradient(circle at 18% 24%, rgba(255,255,255,0.16) 0 1px, transparent 16px),
            radial-gradient(circle at 62% 20%, rgba(255,255,255,0.14) 0 1px, transparent 14px),
            radial-gradient(circle at 78% 30%, rgba(255,255,255,0.12) 0 1px, transparent 18px),
            linear-gradient(180deg, #0A2342 0%, #071628 48%, #040910 100%)
          `,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#02060d] via-[#0A2342]/50 to-transparent" />
      <svg
        viewBox="0 0 220 280"
        className="absolute right-[-6%] bottom-[16%] h-[38%] w-auto text-black/75 opacity-50 sm:right-[1%] sm:opacity-70"
      >
        <g fill="currentColor">
          <rect x="96" y="168" width="16" height="92" rx="3" />
          <path d="M40 260h128l-18 16H58z" />
          <rect x="48" y="72" width="118" height="78" rx="10" />
          <circle cx="92" cy="112" r="28" className="fill-[#0A2342]" />
          <circle cx="92" cy="112" r="16" className="fill-[#1E5BB8]/80" />
          <rect x="150" y="92" width="36" height="28" rx="6" />
          <rect x="78" y="52" width="44" height="28" rx="6" />
        </g>
      </svg>
    </div>
  );
}
