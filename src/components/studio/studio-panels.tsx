import { MonitorPlay } from "lucide-react";

import { StreamTargetReveal } from "@/components/media/stream-target-reveal";
import {
  PhaseBadge,
  StudioEmptyNote,
  StudioPanel,
  StudioTile,
} from "@/components/studio/studio-frame";
import { DEFAULT_BROADCAST_SCRIPT_SLOTS } from "@/config/broadcast-script";
import {
  STUDIO_AUDIO_CHANNELS,
  STUDIO_GRAPHICS,
  STUDIO_HEALTH_CHECKS,
  STUDIO_SCENES,
  STUDIO_SOURCES,
  STUDIO_SPONSORS,
} from "@/config/broadcast-studio";
import { toMediaEmbedUrl } from "@/lib/media-embed";

export function ScenesPanel() {
  return (
    <StudioPanel
      title="Scenes"
      meta={`${STUDIO_SCENES.length}`}
      badge={<PhaseBadge />}
      className="lg:flex-1"
    >
      <div className="space-y-1.5">
        {STUDIO_SCENES.map((scene) => (
          <StudioTile
            key={scene.id}
            label={scene.label}
            detail={scene.shot}
            state={scene.program ? "program" : "idle"}
          />
        ))}
      </div>
      <StudioEmptyNote>
        Scene switching is read-only until the OBS bridge lands. These are the
        Studio B scene names the console will bind to.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

export function ProgramPanel({
  programTitle,
  embedUrl,
  live,
}: {
  programTitle: string | null;
  embedUrl: string | null;
  live: boolean;
}) {
  return (
    <StudioPanel
      title="Program"
      meta={live ? "LIVE" : "STANDBY"}
      bodyClassName="p-3"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-white/10 bg-black">
        {embedUrl ? (
          <iframe
            title={programTitle ?? "Program feed"}
            src={toMediaEmbedUrl(embedUrl)}
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
          {programTitle ?? "Nothing on air"}
        </p>
        <p className="font-mono text-[0.65rem] text-slate-500">
          1920 × 1080 · 30p
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
        Source tally and visibility toggles activate with the studio bridge.
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
        Static fader positions. Live meters and mutes need the OBS bridge.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

export function ScoreboardPanel() {
  return (
    <StudioPanel title="Scoreboard" badge={<PhaseBadge phase={4} />}>
      <div className="rounded-sm border border-white/10 bg-black/40 p-3">
        <div className="flex items-center justify-between gap-3 font-mono">
          <ScoreSide label="MHS" />
          <span className="text-[0.6rem] tracking-[0.2em] text-slate-600 uppercase">
            vs
          </span>
          <ScoreSide label="VIS" />
        </div>
        <div className="mt-3 flex items-center justify-between font-mono text-[0.65rem] text-slate-500">
          <span>PERIOD —</span>
          <span>00:00</span>
        </div>
      </div>
      <StudioEmptyNote>
        Manual score entry and the Daktronics feed are Phase 4.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

function ScoreSide({ label }: { label: string }) {
  return (
    <div className="text-center">
      <p className="text-[0.6rem] tracking-[0.2em] text-slate-500 uppercase">
        {label}
      </p>
      <p className="text-2xl font-semibold text-slate-300 tabular-nums">--</p>
    </div>
  );
}

export function GraphicsPanel() {
  return (
    <StudioPanel title="Graphics" badge={<PhaseBadge />}>
      <div className="space-y-1.5">
        {STUDIO_GRAPHICS.map((graphic) => (
          <StudioTile
            key={graphic.id}
            label={graphic.label}
            detail={graphic.detail}
            state="muted"
          />
        ))}
      </div>
      <StudioEmptyNote>
        Take / clear controls arrive with the graphics engine.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

export function SponsorsPanel() {
  return (
    <StudioPanel title="Sponsors" badge={<PhaseBadge />}>
      <div className="grid grid-cols-2 gap-1.5">
        {STUDIO_SPONSORS.map((sponsor) => (
          <div
            key={sponsor.id}
            className="rounded-sm border border-dashed border-white/15 bg-white/[0.02] px-2 py-3 text-center"
          >
            <p className="text-[0.65rem] font-medium text-slate-400">
              {sponsor.label}
            </p>
            <p className="mt-0.5 text-[0.6rem] text-slate-600">
              {sponsor.detail}
            </p>
          </div>
        ))}
      </div>
      <StudioEmptyNote>
        Sponsor rotation and impression logging come with the graphics engine.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

export function RunOfShowPanel() {
  return (
    <StudioPanel
      title="Run of show"
      meta={`${DEFAULT_BROADCAST_SCRIPT_SLOTS.length} items`}
      badge={<PhaseBadge />}
    >
      <ol className="space-y-1">
        {DEFAULT_BROADCAST_SCRIPT_SLOTS.map((slot, index) => (
          <li
            key={slot.key}
            className="flex items-center gap-2 rounded-sm border border-white/5 bg-white/[0.02] px-2 py-1.5"
          >
            <span className="font-mono text-[0.6rem] text-slate-600 tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate text-[0.7rem] text-slate-300">
              {slot.label}
            </span>
            <span className="font-mono text-[0.6rem] text-slate-600">
              --:--
            </span>
          </li>
        ))}
      </ol>
      <StudioEmptyNote>
        Mirrors the Daily Rundown template. Live timing and item advance are
        Phase 3.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

export function SystemHealthPanel({
  streamKeyHint,
}: {
  streamKeyHint: string;
}) {
  return (
    <StudioPanel title="System health" badge={<PhaseBadge />}>
      <ul className="space-y-1.5">
        {STUDIO_HEALTH_CHECKS.map((check) => (
          <li
            key={check.id}
            className="flex items-center justify-between gap-2 rounded-sm border border-white/5 bg-white/[0.02] px-2 py-1.5"
          >
            <span className="min-w-0">
              <span className="block truncate text-[0.7rem] text-slate-300">
                {check.label}
              </span>
              <span className="block truncate text-[0.6rem] text-slate-600">
                {check.detail}
              </span>
            </span>
            <span className="shrink-0 rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[0.55rem] tracking-wider text-slate-500 uppercase">
              Not linked
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-white/10 pt-3">
        <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-slate-400 uppercase">
          OBS stream target
        </p>
        <StreamTargetReveal hint={streamKeyHint} tone="studio" />
      </div>
    </StudioPanel>
  );
}
