"use client";

import Link from "next/link";
import { MonitorPlay } from "lucide-react";

import { StreamTargetReveal } from "@/components/media/stream-target-reveal";
import {
  PhaseBadge,
  StudioEmptyNote,
  StudioPanel,
  StudioTile,
} from "@/components/studio/studio-frame";
import {
  formatSinceLabel,
  useSecondTick,
} from "@/components/studio/studio-time";
import { useStudioCommand } from "@/components/studio/use-studio-command";
import {
  STUDIO_AUDIO_CHANNELS,
  STUDIO_HEALTH_CHECKS,
  STUDIO_SCENES,
  STUDIO_SOURCES,
} from "@/config/broadcast-studio";
import { isHostedPlayerUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import { cn } from "@/lib/utils";
import type {
  StudioCrewMember,
  StudioProgramState,
} from "@/services/broadcast-studio-service";
import type { StudioBridgeSnapshot } from "@/services/studio-bridge-service";

/**
 * Scene control over the Studio Bridge.
 *
 * Preview and Take Live are separate buttons on every row, and the transition
 * is its own key, so nobody puts a scene to air while reaching for preview.
 * With the bridge down the panel falls back to the configured Studio B names,
 * greyed out and disabled — it will not pretend it can switch anything.
 */
export function ScenesPanel({
  bridge,
  onCommandSettled,
}: {
  bridge: StudioBridgeSnapshot;
  onCommandSettled: () => void;
}) {
  const tick = useSecondTick();
  const { send, pendingKind, error } = useStudioCommand(onCommandSettled);

  const device = bridge.device;
  const live = Boolean(device?.online && device.obsConnected);
  const scenes = device?.scenes ?? [];
  const studioMode = Boolean(device?.studioModeEnabled);
  const failure = error ?? lastCommandFailure(device);

  // Only fall back to the configured names when OBS has never told us its own.
  const rows: { name: string; detail: string | null }[] = scenes.length
    ? scenes.map((name) => ({ name, detail: null }))
    : STUDIO_SCENES.map((scene) => ({ name: scene.label, detail: scene.shot }));

  return (
    <StudioPanel
      title="Scenes"
      meta={`${rows.length}`}
      badge={live ? undefined : <PhaseBadge />}
    >
      <BridgeStatusLine bridge={bridge} tick={tick} />

      <div className="mt-2 flex items-center justify-between gap-2 px-0.5 font-mono text-[0.55rem] tracking-[0.15em] text-slate-600 uppercase">
        <span>Scene</span>
        <span className="flex gap-1">
          <span className="w-11 text-center">Preview</span>
          <span className="w-11 text-center">Take</span>
        </span>
      </div>

      <div className="mt-1 space-y-1">
        {rows.map((row) => {
          const onProgram = live && device?.programScene === row.name;
          const onPreview = live && device?.previewScene === row.name;

          return (
            <div
              key={row.name}
              className={cn(
                "flex items-center gap-1.5 rounded-sm border px-2 py-1.5",
                onProgram
                  ? "border-[#E11D48]/50 bg-[#E11D48]/15"
                  : onPreview
                    ? "border-[#2F80ED]/50 bg-[#2F80ED]/15"
                    : "border-white/10 bg-white/[0.03]",
              )}
            >
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-xs font-semibold tracking-wide",
                    onProgram
                      ? "text-[#FF8098]"
                      : onPreview
                        ? "text-[#8FBEFF]"
                        : live
                          ? "text-slate-300"
                          : "text-slate-500",
                  )}
                >
                  {row.name}
                </span>
                {row.detail ? (
                  <span className="block truncate text-[0.6rem] text-slate-600">
                    {row.detail}
                  </span>
                ) : null}
              </span>

              <SceneKey
                label="PVW"
                tone="preview"
                active={onPreview}
                disabled={!live || !studioMode || pendingKind !== null}
                title={
                  studioMode
                    ? `Preview ${row.name}`
                    : "Turn on Studio Mode in OBS to preview a scene."
                }
                onClick={() =>
                  send({ kind: "SET_PREVIEW_SCENE", sceneName: row.name })
                }
              />
              <SceneKey
                label="LIVE"
                tone="program"
                active={onProgram}
                disabled={!live || pendingKind !== null}
                title={`Take ${row.name} to air`}
                onClick={() =>
                  send({ kind: "SET_PROGRAM_SCENE", sceneName: row.name })
                }
              />
            </div>
          );
        })}
      </div>

      {live && studioMode ? (
        <button
          type="button"
          disabled={!device?.previewScene || pendingKind !== null}
          onClick={() => send({ kind: "TRIGGER_TRANSITION" })}
          className="mt-2 w-full rounded-sm border border-[#C9A227]/60 bg-[#C9A227]/15 px-2 py-2 font-mono text-[0.65rem] font-semibold tracking-[0.18em] text-[#E0B93B] uppercase transition-colors hover:bg-[#C9A227]/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pendingKind === "TRIGGER_TRANSITION"
            ? "Taking…"
            : `Take ${device?.previewScene ?? "preview"} to air`}
        </button>
      ) : null}

      {failure ? (
        <p
          className="mt-2 rounded-sm border border-[#E11D48]/40 bg-[#E11D48]/10 px-2 py-1.5 text-[0.65rem] leading-snug text-[#FF8098]"
          role="status"
        >
          {failure}
        </p>
      ) : null}

      {live ? null : (
        <StudioEmptyNote>
          {bridge.configured
            ? "Scene switching needs the studio bridge running on the Studio B PC. Switch scenes in OBS directly until it reconnects."
            : "The studio bridge is not set up on this server yet — these are the configured Studio B scene names. See docs/STUDIO_BRIDGE_SETUP.md."}
        </StudioEmptyNote>
      )}
    </StudioPanel>
  );
}

/** The newest failed command, so a rejected take is visible without a log. */
function lastCommandFailure(
  device: StudioBridgeSnapshot["device"],
): string | null {
  const failed = device?.recentCommands.find(
    (command) => command.status === "FAILED" || command.status === "EXPIRED",
  );

  if (!failed) {
    return null;
  }

  const target = failed.sceneName ? ` (${failed.sceneName})` : "";
  return failed.status === "EXPIRED"
    ? `${failed.label}${target} expired before the bridge picked it up.`
    : `${failed.label}${target} failed: ${failed.error ?? "OBS rejected it."}`;
}

function SceneKey({
  label,
  tone,
  active,
  ...props
}: {
  label: string;
  tone: "preview" | "program";
  active: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    preview: active
      ? "border-[#2F80ED] bg-[#2F80ED]/30 text-[#BFD9FF]"
      : "border-[#2F80ED]/30 bg-[#2F80ED]/10 text-[#8FBEFF] hover:bg-[#2F80ED]/20",
    program: active
      ? "border-[#E11D48] bg-[#E11D48]/30 text-[#FFB3C2]"
      : "border-[#E11D48]/30 bg-[#E11D48]/10 text-[#FF8098] hover:bg-[#E11D48]/20",
  };

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "w-11 shrink-0 rounded-sm border py-1 font-mono text-[0.55rem] font-semibold tracking-wider uppercase transition-colors disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.02] disabled:text-slate-600",
        tones[tone],
      )}
    >
      {label}
    </button>
  );
}

/** One honest line about the control path: is the agent talking, and is OBS up. */
function BridgeStatusLine({
  bridge,
  tick,
}: {
  bridge: StudioBridgeSnapshot;
  tick: number | null;
}) {
  const device = bridge.device;
  const seen = formatSinceLabel(tick, device?.lastSeenAt ?? null);

  const chrome = !bridge.configured
    ? { tone: "text-slate-500", dot: "bg-slate-600", text: "Bridge not set up" }
    : !device
      ? {
          tone: "text-slate-500",
          dot: "bg-slate-600",
          text: "No bridge has paired yet",
        }
      : !device.online
        ? {
            tone: "text-[#FF8098]",
            dot: "bg-[#E11D48]",
            text: `Bridge disconnected${seen ? ` · last seen ${seen}` : ""}`,
          }
        : !device.obsConnected
          ? {
              tone: "text-[#E0B93B]",
              dot: "bg-[#C9A227]",
              text: "Bridge online · OBS not connected",
            }
          : {
              tone: "text-[#7FE0A8]",
              dot: "bg-[#2E8B57]",
              text: `Bridge online · OBS${device.studioModeEnabled ? " · studio mode" : ""}`,
            };

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wider uppercase",
        chrome.tone,
      )}
    >
      <span className={cn("size-1.5 rounded-full", chrome.dot)} aria-hidden="true" />
      <span className="truncate">{chrome.text}</span>
    </p>
  );
}

export function ProgramPanel({ program }: { program: StudioProgramState }) {
  const live = program.state === "LIVE";
  const meta =
    program.state === "LIVE"
      ? "LIVE"
      : program.state === "PREVIEW"
        ? "PREVIEW"
        : "STANDBY";

  return (
    <StudioPanel title="Program" meta={meta} bodyClassName="p-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-white/10 bg-black">
        {isHostedPlayerUrl(program.embedUrl) ? (
          <iframe
            title={program.title ?? "Program feed"}
            src={toMediaEmbedUrl(program.embedUrl!)}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-600">
            <MonitorPlay className="size-8" aria-hidden="true" />
            <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase">
              {live ? "On air · no viewer feed" : "No program feed"}
            </p>
          </div>
        )}
        <span className="absolute top-2 left-2 rounded-sm bg-black/70 px-1.5 py-0.5 font-mono text-[0.6rem] tracking-[0.2em] text-slate-300 uppercase">
          PGM
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="truncate text-xs text-slate-300">
          {program.title ?? "Nothing on air"}
        </p>
        <p className="font-mono text-[0.65rem] text-slate-500">
          {program.operatorName
            ? `Started by ${program.operatorName}`
            : "1920 × 1080 · 30p"}
        </p>
      </div>
    </StudioPanel>
  );
}

export function SourcesPanel() {
  return (
    <StudioPanel title="Sources" badge={<PhaseBadge />}>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {STUDIO_SOURCES.map((source) => (
          <StudioTile
            key={source.id}
            label={source.label}
            detail={source.detail}
          />
        ))}
      </div>
      <StudioEmptyNote>
        Tile labels only. The bridge reports scenes, not per-source tally or
        visibility, so nothing here is measured yet.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

export function AudioPanel() {
  return (
    <StudioPanel title="Audio" badge={<PhaseBadge />}>
      <ul className="space-y-2">
        {STUDIO_AUDIO_CHANNELS.map((channel) => (
          <li key={channel.id} className="space-y-1">
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={`text-[0.7rem] font-semibold tracking-wide ${
                  channel.muted ? "text-slate-500" : "text-slate-200"
                }`}
              >
                {channel.label}
              </span>
              <span className="font-mono text-[0.6rem] text-slate-500">
                {channel.muted ? "MUTE" : `${channel.level}`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className={`h-full rounded-full ${
                  channel.muted
                    ? "bg-slate-700"
                    : channel.level > 85
                      ? "bg-[#E11D48]"
                      : "bg-[#2E8B57]"
                }`}
                style={{ width: `${channel.muted ? 0 : channel.level}%` }}
              />
            </div>
            <p className="text-[0.6rem] text-slate-600">{channel.detail}</p>
          </li>
        ))}
      </ul>
      <StudioEmptyNote>
        Nominal fader positions from config — not audio the bridge measured.
        Real meters and mutes are not wired.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

/** Production roles from BroadcastCrewCredit (the club's credit roll). */
export function CrewPanel({ crew }: { crew: StudioCrewMember[] }) {
  return (
    <StudioPanel title="Crew" meta={crew.length ? `${crew.length}` : undefined}>
      {crew.length > 0 ? (
        <ul className="space-y-1">
          {crew.map((member) => (
            <li
              key={member.id}
              className="rounded-sm border border-white/5 bg-white/[0.02] px-2 py-1.5"
            >
              <p className="truncate text-[0.7rem] font-medium text-slate-200">
                {member.displayName}
              </p>
              <p className="truncate font-mono text-[0.6rem] tracking-wider text-slate-500 uppercase">
                {member.roleLabel}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <StudioEmptyNote>
          No visible crew credits yet. Add them in{" "}
          <Link
            href="/organizations/broadcasting?tab=credits"
            className="text-slate-300 underline"
          >
            Production credit roll
          </Link>
          .
        </StudioEmptyNote>
      )}
    </StudioPanel>
  );
}

type HealthStatus = {
  label: string;
  live: boolean;
  /** Replaces the static row description when telemetry says something better. */
  detail?: string;
};

/**
 * Resolves one health row from measurable state only.
 *
 * The bridge rows read from `StudioBridge` telemetry, and `online` is derived
 * from how recently the agent reported — never a stored flag. A bridge that
 * dies mid-show therefore drops to DISCONNECTED and drags OBS and the encoder
 * down with it, instead of freezing on the last good reading. Rows with no data
 * source at all still say "Not linked".
 */
function resolveHealthStatus(
  binding: (typeof STUDIO_HEALTH_CHECKS)[number]["binding"],
  input: {
    onAir: boolean;
    hasSharedStreamKey: boolean;
    bridge: StudioBridgeSnapshot;
  },
): HealthStatus {
  const device = input.bridge.device;
  const online = Boolean(device?.online);

  switch (binding) {
    case "CAMPUS_RECORD":
      return { label: input.onAir ? "On air" : "Idle", live: input.onAir };

    case "STREAM_TARGET":
      return {
        label: input.hasSharedStreamKey ? "Key set" : "No key",
        live: input.hasSharedStreamKey,
      };

    case "BRIDGE_LINK":
      if (!input.bridge.configured) {
        return { label: "Not set up", live: false };
      }
      if (!device) {
        return { label: "Never paired", live: false };
      }
      return online
        ? {
            label: "Connected",
            live: true,
            detail: device.agentVersion
              ? `${device.label} · agent ${device.agentVersion}`
              : device.label,
          }
        : { label: "Disconnected", live: false };

    case "OBS_LINK":
      if (!online) {
        return { label: "Not linked", live: false };
      }
      return device?.obsConnected
        ? {
            label: "Connected",
            live: true,
            detail: device.obsVersion
              ? `OBS ${device.obsVersion}`
              : "Agent's link into OBS",
          }
        : { label: "No OBS", live: false };

    case "OBS_ENCODER": {
      if (!online || !device?.obsConnected) {
        return { label: "Not linked", live: false };
      }
      if (!device.streaming) {
        return { label: "Idle", live: false };
      }

      const stats = device.stats;
      const kbps = stats?.kbps != null ? `${Math.round(stats.kbps)} kbps` : null;
      const dropped =
        stats?.droppedFrames != null ? `${stats.droppedFrames} dropped` : null;

      return {
        label: kbps ?? "Streaming",
        live: true,
        detail:
          [device.streamTimecode, dropped].filter(Boolean).join(" · ") ||
          undefined,
      };
    }

    default:
      return { label: "Not linked", live: false };
  }
}

export function SystemHealthPanel({
  streamKeyHint,
  hasSharedStreamKey,
  onAir,
  bridge,
}: {
  streamKeyHint: string;
  hasSharedStreamKey: boolean;
  onAir: boolean;
  bridge: StudioBridgeSnapshot;
}) {
  const tick = useSecondTick();
  const device = bridge.device;
  const lastSeen = formatSinceLabel(tick, device?.lastSeenAt ?? null);

  return (
    <StudioPanel title="System health">
      <ul className="space-y-1.5">
        {STUDIO_HEALTH_CHECKS.map((check) => {
          const status = resolveHealthStatus(check.binding, {
            onAir,
            hasSharedStreamKey,
            bridge,
          });

          return (
            <li
              key={check.id}
              className="flex items-center justify-between gap-2 rounded-sm border border-white/5 bg-white/[0.02] px-2 py-1.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-[0.7rem] text-slate-300">
                  {check.label}
                </span>
                <span className="block truncate text-[0.6rem] text-slate-600">
                  {status.detail ?? check.detail}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[0.55rem] tracking-wider uppercase",
                  status.live
                    ? "border-[#2E8B57]/40 bg-[#2E8B57]/10 text-[#7FE0A8]"
                    : "border-white/10 bg-white/5 text-slate-500",
                )}
              >
                {status.label}
              </span>
            </li>
          );
        })}
      </ul>

      {device?.lastError && !device.online ? (
        <p className="mt-2 rounded-sm border border-[#C9A227]/40 bg-[#C9A227]/10 px-2 py-1.5 text-[0.6rem] leading-snug text-[#E0B93B]">
          Last bridge error: {device.lastError}
        </p>
      ) : null}

      <StudioEmptyNote>
        {device
          ? `Bridge, OBS, and encoder rows are the agent's own telemetry${lastSeen ? `, last heard ${lastSeen}` : ""}. `
          : "Bridge, OBS, and encoder rows go green only when the agent on the Studio B PC reports in. "}
        Scoreboard and disk stay &quot;not linked&quot; — the console will not
        claim a status it cannot measure.
      </StudioEmptyNote>

      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          OBS stream target
        </p>
        <StreamTargetReveal hint={streamKeyHint} tone="studio" />
      </div>
    </StudioPanel>
  );
}
