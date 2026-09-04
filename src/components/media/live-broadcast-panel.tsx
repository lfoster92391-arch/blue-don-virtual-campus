"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  ChevronDown,
  Mic,
  Monitor,
  MonitorPlay,
  Radio,
  SlidersHorizontal,
  Video,
} from "lucide-react";

import type { BlueDonLiveRtmpPublicConfig } from "@/config/broadcast-media";
import { PHONE_LIVE_ROUTE, PUBLIC_WATCH_PATH } from "@/config/phone-live";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  endStudioBroadcastAction,
  startStudentBroadcastAction,
  type StudioTransportState,
} from "@/features/broadcast-studio/actions";
import { endLiveBroadcastAction } from "@/features/media/actions";
import { isHostedPlayerUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView } from "@/services/media-service";

import { PublicLivePlayer } from "./public-live-player";
import { StreamTargetReveal } from "./stream-target-reveal";

const initialState: StudioTransportState = {};

type AirState = "live" | "preview" | "offline";

type LiveBroadcastPanelProps = {
  activeLive: CampusMediaItemView | null;
  isProducer: boolean;
  currentUserId: string;
  rtmp: BlueDonLiveRtmpPublicConfig;
  /** Server-resolved: inside the window around the scheduled air time. */
  previewWindow?: boolean;
  /** Show title from the countdown, offered as the default for step 2. */
  scheduledTitle?: string | null;
};

export function LiveBroadcastPanel({
  activeLive,
  isProducer,
  currentUserId,
  rtmp,
  previewWindow = false,
  scheduledTitle = null,
}: LiveBroadcastPanelProps) {
  const [ending, startEnd] = useTransition();
  const [title, setTitle] = useState(() => scheduledTitle?.trim() ?? "");
  const [obsState, obsFormAction, obsPending] = useActionState(
    startStudentBroadcastAction,
    initialState,
  );
  const isLive = Boolean(activeLive);
  const airState: AirState = isLive
    ? "live"
    : previewWindow
      ? "preview"
      : "offline";

  if (!isProducer) {
    return (
      <div className="space-y-4">
        <AirStatusBadge state={airState} />
        {activeLive ? (
          <ViewerLivePreview item={activeLive} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing on air right now. When Broadcasting goes live, the stream
            appears here and on the public{" "}
            <Link href={PUBLIC_WATCH_PATH} className="text-[#2F80ED] underline">
              Watch Broadcasting LIVE
            </Link>{" "}
            page.
          </p>
        )}
      </div>
    );
  }

  const cameraHref = title.trim()
    ? `${PHONE_LIVE_ROUTE}?title=${encodeURIComponent(title.trim())}`
    : PHONE_LIVE_ROUTE;

  if (activeLive) {
    return (
      <div className="space-y-6">
        <PanelHeading state={airState} />
        <p className="text-sm text-muted-foreground">
          On air as “{activeLive.title}”
          {activeLive.uploadedById === currentUserId
            ? " (you started this)."
            : ` · started by ${activeLive.uploaderName}.`}{" "}
          Keep the camera page open on the device that is recording.
        </p>
        <ViewerLivePreview item={activeLive} producer />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="h-12"
            disabled={ending}
            onClick={() => {
              startEnd(async () => {
                if (activeLive.isPhoneLive) {
                  await endLiveBroadcastAction(activeLive.id);
                  return;
                }
                await endStudioBroadcastAction(activeLive.id);
              });
            }}
          >
            {ending ? "Ending…" : "End broadcast"}
          </Button>
          {activeLive.isPhoneLive ? (
            <Button
              size="lg"
              className="h-12"
              nativeButton={false}
              render={
                <Link href={cameraHref}>
                  <Video className="size-4" />
                  Back to camera
                </Link>
              }
            />
          ) : null}
        </div>
        <AdvancedSetup
          rtmp={rtmp}
          showName={title}
          obsAction={obsFormAction}
          obsPending={obsPending}
          obsState={obsState}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelHeading state={airState} />
      <div className="space-y-3">
        <Input
          id="live-title"
          name="title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Morning Announcements"
          aria-label="Show name"
          className="h-12"
        />
        <div className="flex flex-wrap gap-2">
          {rtmp.showPresets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTitle(preset)}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#E11D48]/40 hover:text-foreground"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      <Button
        size="lg"
        className="h-14 w-full bg-[#E11D48] text-base text-white hover:bg-[#BE123C]"
        nativeButton={false}
        render={
          <Link href={cameraHref}>
            <Video className="size-5" />
            Open camera &amp; Go Live
          </Link>
        }
      />
      <p className="text-sm text-muted-foreground">
        Works on this phone or laptop. Viewers watch at{" "}
        <Link href={PUBLIC_WATCH_PATH} className="text-[#2F80ED] underline">
          Watch Broadcasting LIVE
        </Link>{" "}
        — no login. You do not need OBS.
      </p>
      <AdvancedSetup
        rtmp={rtmp}
        showBroadcastDetails
        showName={title}
        obsAction={obsFormAction}
        obsPending={obsPending}
        obsState={obsState}
      />
    </div>
  );
}

function PanelHeading({ state }: { state: AirState }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground">Go live</p>
        <p className="text-xs text-muted-foreground">
          Open this device&apos;s camera, press Go Live, keep the page open.
          Families watch at Watch Broadcasting LIVE — no login, no OBS.
        </p>
      </div>
      <AirStatusBadge state={state} />
    </div>
  );
}

const airStatusStyles: Record<AirState, { label: string; className: string }> = {
  live: { label: "LIVE", className: "bg-red-500/15 text-red-600" },
  preview: { label: "Preview", className: "bg-[#D4A017]/15 text-[#8a6a0f]" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
};

function AirStatusBadge({ state }: { state: AirState }) {
  const { label, className } = airStatusStyles[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          state === "live"
            ? "bg-red-500 animate-pulse"
            : state === "preview"
              ? "bg-[#D4A017]"
              : "bg-muted-foreground/50"
        }`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/**
 * Advisor-only: OBS, RTMP, and the Studio B console. Students leave this closed.
 */
function AdvancedSetup({
  rtmp,
  showBroadcastDetails = false,
  showName = "",
  obsAction,
  obsPending = false,
  obsState,
}: {
  rtmp: BlueDonLiveRtmpPublicConfig;
  showBroadcastDetails?: boolean;
  showName?: string;
  obsAction?: (formData: FormData) => void;
  obsPending?: boolean;
  obsState?: StudioTransportState;
}) {
  return (
    <details className="group rounded-lg border border-border bg-muted/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-medium text-foreground">
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Advanced · Advisor setup
        </span>
        <ChevronDown
          className="size-4 shrink-0 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>

      <div className="space-y-6 border-t border-border px-4 py-4">
        <p className="text-xs text-muted-foreground">
          Students going live from a phone or laptop do not need this. OBS and
          stream keys stay here for Studio B advisors.
        </p>

        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={
            <Link href="/broadcast/studio">
              <MonitorPlay className="size-4" />
              Open Broadcast Studio
            </Link>
          }
        />

        {showBroadcastDetails && obsAction ? (
          <form action={obsAction} className="space-y-4">
            <input type="hidden" name="title" value={showName || "Blue Don Live"} />
            <div className="space-y-2">
              <label htmlFor="live-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="live-description"
                name="description"
                placeholder="Blue Don News · Studio B"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="embedUrl" className="text-sm font-medium">
                Viewer embed URL (YouTube / Vimeo, optional)
              </label>
              <Input
                id="embedUrl"
                name="embedUrl"
                type="url"
                placeholder="https://www.youtube.com/embed/… or watch URL"
              />
            </div>
            {obsState?.error ? (
              <p className="text-sm text-destructive" role="alert">
                {obsState.error}
              </p>
            ) : null}
            <Button type="submit" size="sm" variant="outline" disabled={obsPending}>
              <Radio className="size-4" />
              {obsPending ? "Starting Studio B…" : "Go Live with Studio B (OBS)"}
            </Button>
          </form>
        ) : null}

        <div>
          <p className="text-sm font-medium text-foreground">OBS stream target</p>
          <StreamTargetReveal hint={rtmp.streamKeyHint} />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">First-time OBS setup</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            {rtmp.obsChecklist.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Scene setup</p>
          <ul className="mt-3 space-y-2">
            {rtmp.sceneTips.map((tip) => (
              <li key={tip.label} className="flex gap-2 text-sm text-muted-foreground">
                <SceneIcon label={tip.label} />
                <span>
                  <span className="font-medium text-foreground">{tip.label}:</span>{" "}
                  {tip.tip}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

function ViewerLivePreview({
  item,
  producer = false,
}: {
  item: CampusMediaItemView;
  producer?: boolean;
}) {
  if (item.isPhoneLive) {
    return (
      <div className="overflow-hidden rounded-lg border border-border">
        <PublicLivePlayer
          initial={{
            live: {
              id: item.id,
              title: item.title,
              uploaderName: item.uploaderName,
              publishedAt: item.publishedAt?.toISOString() ?? null,
              source: "phone",
              embedUrl: null,
              mimeType: null,
              segments: [],
            },
          }}
        />
        <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
          Phone live — the public player fills in as clips upload. Share{" "}
          <Link href={PUBLIC_WATCH_PATH} className="text-[#2F80ED] underline">
            Watch Broadcasting LIVE
          </Link>
          .
        </p>
      </div>
    );
  }

  if (!isHostedPlayerUrl(item.embedUrl)) {
    return (
      <p className="text-sm text-muted-foreground">
        {producer
          ? "You are on air. Campus and the public watch page see this show. Add a YouTube Live or Vimeo link under Advanced to embed a player here too — or go live from a phone so clips play automatically."
          : "Broadcasting is on air. Watch on the public Watch Broadcasting LIVE page, or wait for the crew to add a viewer link."}
      </p>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg border border-border">
      <iframe
        title={item.title}
        src={toMediaEmbedUrl(item.embedUrl!)}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function SceneIcon({ label }: { label: string }) {
  const className = "mt-0.5 size-4 shrink-0 text-[#E11D48]";
  if (label === "Mic") return <Mic className={className} aria-hidden="true" />;
  if (label === "Screen share")
    return <Monitor className={className} aria-hidden="true" />;
  if (label === "Camera")
    return <Video className={className} aria-hidden="true" />;
  return <Radio className={className} aria-hidden="true" />;
}
