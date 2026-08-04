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
import {
  STUDIO_AUDIO_CHANNELS,
  STUDIO_GRAPHICS,
  STUDIO_HEALTH_CHECKS,
  STUDIO_SCENES,
  STUDIO_SOURCES,
  STUDIO_SPONSORS,
} from "@/config/broadcast-studio";
import { toMediaEmbedUrl } from "@/lib/media-embed";
import { cn } from "@/lib/utils";
import type {
  StudioCrewMember,
  StudioProgramState,
  StudioRunOfShowState,
} from "@/services/broadcast-studio-service";

export function ScenesPanel() {
  return (
    <StudioPanel
      title="Scenes"
      meta={`${STUDIO_SCENES.length}`}
      badge={<PhaseBadge />}
    >
      <div className="space-y-1.5">
        {STUDIO_SCENES.map((scene) => (
          <StudioTile
            key={scene.id}
            label={scene.label}
            detail={scene.shot}
            state="idle"
          />
        ))}
      </div>
      <StudioEmptyNote>
        Scene names only — no tally until the OBS bridge lands. These are the
        Studio B scenes the console will bind to.
      </StudioEmptyNote>
    </StudioPanel>
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
        {program.embedUrl ? (
          <iframe
            title={program.title ?? "Program feed"}
            src={toMediaEmbedUrl(program.embedUrl)}
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
        Nominal fader positions. Live meters and mutes need the OBS bridge.
      </StudioEmptyNote>
    </StudioPanel>
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
        Slot names only. Sponsor rotation and impression logging come with the
        graphics engine.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

/** Today's Daily Rundown (BroadcastDailyScript + org script template). */
export function RunOfShowPanel({
  runOfShow,
}: {
  runOfShow: StudioRunOfShowState | null;
}) {
  const tick = useSecondTick();

  if (!runOfShow) {
    return (
      <StudioPanel title="Run of show" className="lg:flex-1">
        <StudioEmptyNote>
          Today&apos;s rundown could not be read. Open the{" "}
          <Link
            href="/organizations/broadcasting?tab=script"
            className="text-slate-300 underline"
          >
            Daily Rundown
          </Link>{" "}
          to check it.
        </StudioEmptyNote>
      </StudioPanel>
    );
  }

  const updated = formatSinceLabel(tick, runOfShow.updatedAt);

  return (
    <StudioPanel
      title="Run of show"
      meta={`${runOfShow.filledCount}/${runOfShow.fillableCount} filled`}
      className="lg:flex-1"
    >
      <ol className="space-y-1">
        {runOfShow.items.map((item, index) => (
          <li
            key={item.key}
            className="rounded-sm border border-white/5 bg-white/[0.02] px-2 py-1.5"
          >
            <div className="flex items-center gap-2">
              <span className="font-mono text-[0.6rem] text-slate-600 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 flex-1 truncate text-[0.7rem] text-slate-300">
                {item.label}
              </span>
              <SlotChip item={item} />
            </div>
            <p
              className={cn(
                "mt-0.5 pl-6 text-[0.65rem] leading-snug",
                item.filled ? "text-slate-400" : "text-slate-600 italic",
              )}
            >
              {item.line.length > 140
                ? `${item.line.slice(0, 140)}…`
                : item.line}
            </p>
          </li>
        ))}
      </ol>
      <StudioEmptyNote>
        {runOfShow.isPersisted
          ? `Today's rundown${runOfShow.updatedByName ? ` · ${runOfShow.updatedByName}` : ""}${updated ? ` · saved ${updated}` : ""}.`
          : "No one has saved today's rundown yet — this is the template."}{" "}
        <Link
          href="/organizations/broadcasting?tab=script"
          className="text-slate-300 underline"
        >
          Edit in Daily Rundown
        </Link>
        . Segment timing and item advance need the OBS bridge.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

function SlotChip({
  item,
}: {
  item: StudioRunOfShowState["items"][number];
}) {
  const chrome =
    item.slotType === "FIXED"
      ? { label: "Fixed", tone: "border-white/10 bg-white/5 text-slate-500" }
      : item.slotType === "LOCKED_DAILY"
        ? {
            label: "Prayer",
            tone: "border-[#2F80ED]/40 bg-[#2F80ED]/10 text-[#8FBEFF]",
          }
        : item.filled
          ? {
              label: "Filled",
              tone: "border-[#2E8B57]/40 bg-[#2E8B57]/10 text-[#7FE0A8]",
            }
          : {
              label: item.required ? "Needed" : "Open",
              tone: item.required
                ? "border-[#E11D48]/40 bg-[#E11D48]/10 text-[#FF8098]"
                : "border-white/10 bg-white/5 text-slate-500",
            };

  return (
    <span
      className={cn(
        "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[0.55rem] tracking-wider uppercase",
        chrome.tone,
      )}
    >
      {chrome.label}
    </span>
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

export function SystemHealthPanel({
  streamKeyHint,
  hasSharedStreamKey,
  onAir,
}: {
  streamKeyHint: string;
  hasSharedStreamKey: boolean;
  onAir: boolean;
}) {
  return (
    <StudioPanel title="System health">
      <ul className="space-y-1.5">
        {STUDIO_HEALTH_CHECKS.map((check) => {
          const status =
            check.binding === "CAMPUS_RECORD"
              ? { label: onAir ? "On air" : "Idle", live: onAir }
              : check.binding === "STREAM_TARGET"
                ? {
                    label: hasSharedStreamKey ? "Key set" : "No key",
                    live: hasSharedStreamKey,
                  }
                : { label: "Not linked", live: false };

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
                  {check.detail}
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
      <StudioEmptyNote>
        Only the campus stream record and stream target are readable today.
        Encoder, OBS, scoreboard, and disk telemetry stay &quot;not linked&quot;
        until the bridge exists — the console will not claim a status it cannot
        measure.
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
