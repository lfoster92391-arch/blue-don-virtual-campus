"use client";

import { useActionState, useState, useTransition } from "react";
import { Circle, Radio, Square } from "lucide-react";

import { useStudioCommand } from "@/components/studio/use-studio-command";
import {
  endStudioBroadcastAction,
  startStudioBroadcastAction,
  type StudioTransportState,
} from "@/features/broadcast-studio/actions";
import { cn } from "@/lib/utils";
import type { StudioBridgeSnapshot } from "@/services/studio-bridge-service";

const initialState: StudioTransportState = {};

type StudioControlBarProps = {
  activeLiveId: string | null;
  programTitle: string | null;
  bridge: StudioBridgeSnapshot;
  onCommandSettled: () => void;
};

/**
 * Broadcast transport.
 *
 * GO LIVE and END BROADCAST always write the campus `CampusMediaItem` record —
 * that is what the rest of the campus reads for "are we on air" — and
 * additionally queue OBS start / stop when the bridge is up. The two results are
 * reported separately, so an operator is never told OBS was touched when it was
 * not. Recording runs entirely through the bridge and is disabled without it.
 */
export function StudioControlBar({
  activeLiveId,
  programTitle,
  bridge,
  onCommandSettled,
}: StudioControlBarProps) {
  const [startState, startAction, starting] = useActionState(
    startStudioBroadcastAction,
    initialState,
  );
  const [endState, setEndState] = useState<StudioTransportState>({});
  const [ending, startEnd] = useTransition();
  const { send, pendingKind, error: commandError } =
    useStudioCommand(onCommandSettled);

  const live = Boolean(activeLiveId);
  const device = bridge.device;
  const obsReady = Boolean(device?.online && device.obsConnected);
  const recording = Boolean(device?.recording);
  const recordPending =
    pendingKind === "OBS_START_RECORD" || pendingKind === "OBS_STOP_RECORD";

  const transport = endState.success || endState.error ? endState : startState;
  const message = transport.error ?? transport.success ?? null;

  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#081426] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {live ? (
          <p className="min-w-0 flex-1 truncate text-xs text-slate-300">
            <span className="font-mono text-[0.65rem] tracking-[0.18em] text-slate-500 uppercase">
              On air ·{" "}
            </span>
            {programTitle ?? "Untitled broadcast"}
            {device?.streaming ? (
              <span className="ml-2 font-mono text-[0.65rem] text-[#7FE0A8]">
                OBS streaming {device.streamTimecode ?? ""}
              </span>
            ) : null}
          </p>
        ) : (
          <form
            action={startAction}
            // Drop the previous END BROADCAST result, or a second show would
            // open under the message from ending the first one.
            onSubmit={() => setEndState({})}
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
          disabled={!obsReady || recordPending}
          title={
            obsReady
              ? recording
                ? "Stop the OBS recording"
                : "Start recording in OBS"
              : "Recording needs the studio bridge and OBS connected."
          }
          icon={
            <Circle
              className={cn("size-4", recording && "fill-current")}
              aria-hidden="true"
            />
          }
          label={
            recordPending
              ? "Sending…"
              : recording
                ? `Stop record${device?.recordTimecode ? ` ${device.recordTimecode}` : ""}`
                : "Start record"
          }
          onClick={() =>
            send({
              kind: recording ? "OBS_STOP_RECORD" : "OBS_START_RECORD",
            })
          }
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
              setEndState(await endStudioBroadcastAction(activeLiveId));
              onCommandSettled();
            });
          }}
        />
      </div>

      <div className="mt-2 space-y-1">
        {message ? (
          <p
            className={cn(
              "text-[0.7rem]",
              transport.error ? "text-red-400" : "text-emerald-400",
            )}
            role="status"
          >
            {message}
          </p>
        ) : null}

        {transport.obs ? (
          <p
            className={cn(
              "text-[0.7rem]",
              transport.obs.queued ? "text-emerald-400" : "text-[#E0B93B]",
            )}
            role="status"
          >
            {transport.obs.queued
              ? transport.obs.note
              : `OBS was not touched — ${transport.obs.note}`}
          </p>
        ) : null}

        {commandError ? (
          <p className="text-[0.7rem] text-red-400" role="status">
            {commandError}
          </p>
        ) : null}

        {message || transport.obs || commandError ? null : (
          <p className="text-[0.65rem] text-slate-600">
            {obsReady
              ? "Go live writes the campus stream record and asks OBS to start streaming through the bridge."
              : "Go live writes the campus stream record. The bridge is down, so start and stop streaming in OBS yourself."}
          </p>
        )}
      </div>
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
