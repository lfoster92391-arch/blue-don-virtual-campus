import type { Metadata } from "next";
import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { PublicLivePlayer } from "@/components/media/public-live-player";
import { PUBLIC_WATCH_PATH } from "@/config/phone-live";
import { siteConfig } from "@/config/site";
import { getBroadcastSchedule } from "@/services/broadcast-production-service";
import { getPublicLiveWatchPayload } from "@/services/phone-live-service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Watch Broadcasting LIVE",
  description: `Watch Madonna High School Broadcasting live from Studio B or a phone — no login required.`,
  alternates: { canonical: PUBLIC_WATCH_PATH },
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

export default async function PublicWatchPage() {
  const [payload, schedule] = await Promise.all([
    getPublicLiveWatchPayload(),
    getBroadcastSchedule().catch(() => null),
  ]);

  const live = payload.live;

  return (
    <div className="min-h-screen bg-[#050B14] text-white">
      <header className="border-b border-white/10 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <BrandLogo variant="full" size="sm" href={PUBLIC_WATCH_PATH} />
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/50">
            {siteConfig.institution}
          </p>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
        {live ? (
          <section className="overflow-hidden rounded-2xl border border-red-500/40 bg-[#0A1220]">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" />
                  Live now
                </span>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  {live.title}
                </h1>
                <p className="text-sm text-white/60">
                  Blue Don Live
                  {live.source === "phone" ? " · from a phone" : ""}
                </p>
              </div>
            </div>
            <PublicLivePlayer initial={payload} />
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-[#0A1220] px-5 py-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white/70">
              <span className="size-1.5 rounded-full bg-white/40" />
              Offline
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              Watch Broadcasting LIVE
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/65">
              Nothing is on air right now. When Madonna Broadcasting goes live
              from a phone or Studio B, the stream plays here — no campus login.
            </p>
            {schedule?.nextAirAt ? (
              <p className="mt-3 text-sm text-white/50">
                Next scheduled broadcast: {formatAirTime(schedule.nextAirAt)}
                {schedule.title ? ` · ${schedule.title}` : ""}.
              </p>
            ) : null}
          </section>
        )}

        <p className="text-sm text-white/45">
          Crew sign in to go live. Everyone else can stay on this page.
          {" "}
          <Link href="/login" className="text-[#7EB6FF] underline">
            Campus login
          </Link>
        </p>
      </main>
    </div>
  );
}
