"use client";

import { useActionState, useState, useTransition } from "react";
import { Circle, Radio, Square } from "lucide-react";

import {
  endLiveBroadcastAction,
  startLiveBroadcastAction,
  type MediaActionState,
} from "@/features/media/actions";
import { cn } from "@/lib/utils";

const initialState: MediaActionState = {};

type StudioControlBarProps = {
  activeLiveId: string | null;
  programTitle: string | null;
};

/**
 * Broadcast transport. GO LIVE / END BROADCAST run through the existing campus
 * live-stream actions; START RECORD is staged for the OBS bridge.
 */
export function StudioControlBar({
  activeLiveId,
  programTitle,
}: StudioControlBarProps) {
  const [startState, startAction, starting] = useActionState(
    startLiveBroadcastAction,
    initialState,
  );
  const [endState, setEndState] = useState<MediaActionState>({});
  const [ending, startEnd] = useTransition();
  const live = Boolean(activeLiveId);
  const message = endState.error ?? endState.success ?? startState.error;

  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#081426] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {live ? (
          <p className="min-w-0 flex-1 truncate text-xs text-slate-300">
            <span className="font-mono text-[0.65rem] tracking-[0.18em] text-slate-500 uppercase">
              On air ·{" "}
            </span>
            {programTitle ?? "Untitled broadcast"}
          </p>
        ) : (
          <form
            action={startAction}
            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
          >
            <input
              name="title"
              required
              maxLength={120}
              placeholder="Program title"
              aria-label="Program title"
              className="h-8 min-w-0 flex-1 rounded-sm border border-white/15 bg-white/5 px-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-[#2F80ED] focus:outline-none"
            />
            <input
              name="embedUrl"
              type="url"
              placeholder="Viewer embed URL (optional)"
              aria-label="Viewer embed URL"
              className="h-8 min-w-0 flex-1 rounded-sm border border-white/15 bg-white/5 px-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-[#2F80ED] focus:outline-none"
            />
            <TransportButton
              type="submit"
              tone="go"
              disabled={starting}
              icon={<Radio className="size-4" aria-hidden="true" />}
              label={starting ? "Going live…" : "Go live"}
            />
          </form>
        )}

        <TransportButton
          type="button"
          tone="record"
          disabled
          title="Recording control arrives with the OBS bridge."
          icon={<Circle className="size-4" aria-hidden="true" />}
          label="Start record"
        />

        <TransportButton
          type="button"
          tone="end"
          disabled={!live || ending}
          icon={<Square className="size-4" aria-hidden="true" />}
          label={ending ? "Ending…" : "End broadcast"}
          onClick={() => {
            if (!activeLiveId) {
              return;
            }
            startEnd(async () => {
              setEndState(await endLiveBroadcastAction(activeLiveId));
            });
          }}
        />
      </div>

      {message ? (
        <p
          className={cn(
            "mt-2 text-[0.7rem]",
            endState.success ? "text-emerald-400" : "text-red-400",
          )}
          role="status"
        >
          {message}
        </p>
      ) : (
        <p className="mt-2 text-[0.65rem] text-slate-600">
          Go live and end broadcast drive the campus stream record. OBS keeps
          pushing video until you end the broadcast here.
        </p>
      )}
    </footer>
  );
}

function TransportButton({
  tone,
  label,
  icon,
  ...props
}: {
  tone: "go" | "record" | "end";
  label: string;
  icon: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones: Record<string, string> = {
    go: "border-[#2E8B57]/60 bg-[#2E8B57]/20 text-[#7FE0A8] hover:bg-[#2E8B57]/30",
    record:
      "border-[#C9A227]/50 bg-[#C9A227]/10 text-[#E0B93B] hover:bg-[#C9A227]/20",
    end: "border-[#E11D48]/60 bg-[#E11D48]/20 text-[#FF8098] hover:bg-[#E11D48]/30",
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-sm border px-3.5 font-mono text-[0.7rem] font-semibold tracking-[0.14em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
      )}
    >
      {icon}
      {label}
    </button>
  );
}
