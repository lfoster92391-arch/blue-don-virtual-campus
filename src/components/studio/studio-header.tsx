"use client";

import Link from "next/link";
import { LogOut, Radio } from "lucide-react";

import { OnAirLamp } from "@/components/studio/studio-frame";
import {
  formatCampusTime,
  formatClock,
  formatCountdown,
  formatElapsed,
  formatSinceLabel,
  useSecondTick,
} from "@/components/studio/studio-time";
import { STUDIO_PHASE } from "@/config/broadcast-studio";
import type {
  StudioAirState,
  StudioEventContext,
  StudioNextAirState,
} from "@/services/broadcast-studio-service";
import { cn } from "@/lib/utils";

type StudioHeaderProps = {
  operatorName: string;
  operatorRole: string;
  airState: StudioAirState;
  programTitle: string | null;
  onAirSince: string | null;
  nextAir: StudioNextAirState;
  event: StudioEventContext;
  /** ISO time of the last successful console read. */
  syncedAt: string | null;
  syncError: string | null;
};

export function StudioHeader({
  operatorName,
  operatorRole,
  airState,
  programTitle,
  onAirSince,
  nextAir,
  event,
  syncedAt,
  syncError,
}: StudioHeaderProps) {
  const tick = useSecondTick();
  const clock = tick ? formatClock(tick) : null;
  const elapsed = formatElapsed(tick, onAirSince);
  const countdown = formatCountdown(tick, nextAir.at);
  const nextAirClock = formatCampusTime(nextAir.at);

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

      <OnAirLamp state={airState} />

      <dl className="flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[0.7rem] text-slate-400">
        <Readout label="Program" value={programTitle ?? "—"} wide />
        <Readout
          label="Elapsed"
          value={airState === "LIVE" ? elapsed : "00:00:00"}
        />
        <Readout label="Clock" value={clock ?? "--:--:--"} />
        <Readout
          label="Next air"
          value={
            countdown && nextAirClock
              ? `${countdown} · ${nextAirClock}`
              : "Unscheduled"
          }
          wide
        />
        <Readout label="Event" value={event.label ?? "None set"} wide />
      </dl>

      <div className="ml-auto flex items-center gap-3">
        <SyncLamp tick={tick} syncedAt={syncedAt} syncError={syncError} />
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

/** Shows whether the console is still reading the campus database. */
function SyncLamp({
  tick,
  syncedAt,
  syncError,
}: {
  tick: number | null;
  syncedAt: string | null;
  syncError: string | null;
}) {
  const since = formatSinceLabel(tick, syncedAt);

  return (
    <span
      className="hidden items-center gap-1.5 font-mono text-[0.6rem] tracking-wider text-slate-500 uppercase md:inline-flex"
      title={syncError ?? "Console data read from the campus database"}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          syncError ? "bg-[#E0B93B]" : "bg-[#2E8B57]",
        )}
        aria-hidden="true"
      />
      {syncError ? "Sync stalled" : `Synced ${since ?? "—"}`}
    </span>
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
        className={cn(
          "truncate text-slate-200",
          wide ? "max-w-[16ch]" : "tabular-nums",
        )}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
