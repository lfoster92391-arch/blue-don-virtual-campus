"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LogOut, Radio } from "lucide-react";

import { OnAirLamp } from "@/components/studio/studio-frame";
import { STUDIO_PHASE } from "@/config/broadcast-studio";

type StudioHeaderProps = {
  operatorName: string;
  operatorRole: string;
  onAirSince: string | null;
  nextAirLabel: string | null;
  programTitle: string | null;
};

export function StudioHeader({
  operatorName,
  operatorRole,
  onAirSince,
  nextAirLabel,
  programTitle,
}: StudioHeaderProps) {
  const live = Boolean(onAirSince);
  const tick = useSecondTick();
  const clock = tick ? formatClock(tick) : null;
  const elapsed = formatElapsed(tick, onAirSince);

  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 bg-[#081426] px-4 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-sm bg-[#0A2342] text-[#C6CCD6] ring-1 ring-white/15">
          <Radio className="size-4" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-wide text-white">
            Broadcast Control Studio
          </p>
          <p className="text-[0.65rem] tracking-[0.18em] text-slate-500 uppercase">
            MHS Broadcasting · Studio B
          </p>
        </div>
      </div>

      <OnAirLamp live={live} />

      <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.7rem] text-slate-400">
        <Readout label="Program" value={programTitle ?? "—"} wide />
        <Readout label="Elapsed" value={live ? elapsed : "00:00:00"} />
        <Readout label="Clock" value={clock ?? "--:--:--"} />
        <Readout label="Next air" value={nextAirLabel ?? "Unscheduled"} wide />
      </dl>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-sm border border-white/10 bg-white/5 px-2 py-1 text-[0.65rem] tracking-wider text-slate-400 uppercase sm:inline">
          {STUDIO_PHASE.label}
        </span>
        <div className="text-right leading-tight">
          <p className="text-xs font-medium text-slate-200">{operatorName}</p>
          <p className="text-[0.65rem] tracking-wider text-slate-500 uppercase">
            {operatorRole}
          </p>
        </div>
        <Link
          href="/organizations/broadcasting?tab=media"
          className="inline-flex items-center gap-1.5 rounded-sm border border-white/15 px-2.5 py-1.5 text-[0.7rem] font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-3.5" aria-hidden="true" />
          Exit studio
        </Link>
      </div>
    </header>
  );
}

function Readout({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="text-[0.6rem] tracking-[0.18em] text-slate-600 uppercase">
        {label}
      </dt>
      <dd
        className={`truncate text-slate-200 ${wide ? "max-w-[16ch]" : "tabular-nums"}`}
      >
        {value}
      </dd>
    </div>
  );
}

let tickValue = 0;
const tickListeners = new Set<() => void>();
let tickTimer: number | null = null;

function subscribeSecondTick(listener: () => void): () => void {
  tickListeners.add(listener);

  if (tickTimer === null) {
    tickValue = Date.now();
    tickTimer = window.setInterval(() => {
      tickValue = Date.now();
      for (const notify of tickListeners) {
        notify();
      }
    }, 1000);
  }

  return () => {
    tickListeners.delete(listener);
    if (tickListeners.size === 0 && tickTimer !== null) {
      window.clearInterval(tickTimer);
      tickTimer = null;
    }
  };
}

/**
 * One shared second ticker. Returns null on the server so the console never
 * ships a baked-in wall clock into the HTML.
 */
function useSecondTick(): number | null {
  const tick = useSyncExternalStore(
    subscribeSecondTick,
    () => tickValue,
    () => 0,
  );

  return tick || null;
}

function formatClock(now: number): string {
  return new Date(now).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function formatElapsed(now: number | null, since: string | null): string {
  const startedAt = since ? new Date(since).getTime() : null;
  const seconds =
    now && startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;

  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
