"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Video } from "lucide-react";

import type { BlueDonLiveRtmpPublicConfig } from "@/config/broadcast-media";
import { PHONE_LIVE_ROUTE, PUBLIC_WATCH_PATH } from "@/config/phone-live";
import { BroadcastPrimaryActions } from "@/components/media/broadcast-primary-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endStudioBroadcastAction } from "@/features/broadcast-studio/actions";
import { endLiveBroadcastAction } from "@/features/media/actions";
import { isHostedPlayerUrl, toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView } from "@/services/media-service";

import { PublicLivePlayer } from "./public-live-player";

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
  /** Officers can Record (publish a clip) as well as Go Live. */
  canRecord?: boolean;
};

export function LiveBroadcastPanel({
  activeLive,
  isProducer,
  currentUserId,
  rtmp,
  previewWindow = false,
  scheduledTitle = null,
  canRecord = false,
}: LiveBroadcastPanelProps) {
  const [ending, startEnd] = useTransition();
  const [title, setTitle] = useState(() => scheduledTitle?.trim() ?? "");
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
              variant="action"
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
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#0A2342]/40 hover:text-foreground"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
      <BroadcastPrimaryActions
        canGoLive
        canRecord={canRecord}
        title={title}
      />
      <p className="text-sm text-muted-foreground">
        Works on this phone or laptop. Viewers watch at{" "}
        <Link href={PUBLIC_WATCH_PATH} className="text-[#2F80ED] underline">
          Watch Broadcasting LIVE
        </Link>
        .
      </p>
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
          Families watch at Watch Broadcasting LIVE — no login.
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
          ? "You are on air. Campus and the public watch page see this show. Go live from a phone so clips play automatically."
          : "Broadcasting is on air. Watch on the public Watch Broadcasting LIVE page."}
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
