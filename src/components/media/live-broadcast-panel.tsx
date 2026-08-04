"use client";

import { useActionState, useState, useTransition } from "react";
import { Check, Copy, Mic, Monitor, Radio, Video } from "lucide-react";

import type { BlueDonLiveRtmpConfig } from "@/config/broadcast-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  endLiveBroadcastAction,
  startLiveBroadcastAction,
  type MediaActionState,
} from "@/features/media/actions";
import { toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView } from "@/services/media-service";

const initialState: MediaActionState = {};

type LiveBroadcastPanelProps = {
  activeLive: CampusMediaItemView | null;
  isProducer: boolean;
  currentUserId: string;
  rtmp: BlueDonLiveRtmpConfig;
};

export function LiveBroadcastPanel({
  activeLive,
  isProducer,
  currentUserId,
  rtmp,
}: LiveBroadcastPanelProps) {
  const [state, formAction, pending] = useActionState(startLiveBroadcastAction, initialState);
  const [ending, startEnd] = useTransition();
  const isLive = Boolean(activeLive);
  const displayStreamKey =
    activeLive?.streamKey || state.streamKey || rtmp.streamKey || null;

  if (!isProducer) {
    return (
      <div className="space-y-4">
        <StreamStatusBadge live={isLive} />
        {activeLive ? (
          <ViewerLivePreview item={activeLive} />
        ) : (
          <p className="text-sm text-muted-foreground">
            Nothing on air right now. When Broadcasting goes live, the stream
            appears here for everyone on campus.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Control room</p>
          <p className="text-xs text-muted-foreground">
            Mini OBS workflow — configure stream, go live, then end for the archive.
          </p>
        </div>
        <StreamStatusBadge live={isLive} />
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4">
        <p className="text-sm font-medium text-foreground">OBS / RTMP setup</p>
        <dl className="mt-3 space-y-3 text-sm">
          <CopyField label="RTMP server URL" value={rtmp.ingestUrl} />
          <CopyField
            label="Stream key"
            value={displayStreamKey ?? ""}
            placeholder={rtmp.streamKeyHint}
            mono={!displayStreamKey}
          />
        </dl>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          {rtmp.obsChecklist.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border p-4">
        <p className="text-sm font-medium text-foreground">Scene tips</p>
        <ul className="mt-3 space-y-2">
          {rtmp.sceneTips.map((tip) => (
            <li key={tip.label} className="flex gap-2 text-sm text-muted-foreground">
              <SceneIcon label={tip.label} />
              <span>
                <span className="font-medium text-foreground">{tip.label}:</span> {tip.tip}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {activeLive ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm font-semibold text-red-600">On air: {activeLive.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Started by {activeLive.uploaderName}
            {activeLive.uploadedById === currentUserId ? " (you)" : ""}
          </p>
          <ViewerLivePreview item={activeLive} />
          <Button
            className="mt-4"
            variant="outline"
            size="sm"
            disabled={ending}
            onClick={() => {
              startEnd(async () => {
                await endLiveBroadcastAction(activeLive.id);
              });
            }}
          >
            {ending ? "Ending…" : "End broadcast"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Ending marks the stream ENDED and keeps it in Past Broadcasts.
          </p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="live-title" className="text-sm font-medium">
              Broadcast title
            </label>
            <Input
              id="live-title"
              name="title"
              required
              placeholder="Morning Announcements"
            />
          </div>
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
            <p className="text-xs text-muted-foreground">
              OBS pushes to RTMP; paste the public player URL so campus can watch here.
            </p>
          </div>

          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="text-sm text-emerald-600" role="status">
              {state.success}
              {state.streamKey ? (
                <span className="mt-1 block font-mono text-xs text-foreground">
                  Session stream key: {state.streamKey}
                </span>
              ) : null}
            </p>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Going live…" : "Go Live"}
          </Button>
        </form>
      )}
    </div>
  );
}

function StreamStatusBadge({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        live ? "bg-red-500/15 text-red-600" : "bg-muted text-muted-foreground"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${live ? "bg-red-500 animate-pulse" : "bg-muted-foreground/50"}`}
        aria-hidden="true"
      />
      {live ? "Live" : "Offline"}
    </span>
  );
}

function ViewerLivePreview({ item }: { item: CampusMediaItemView }) {
  if (!item.embedUrl) {
    return (
      <p className="mt-3 text-sm text-muted-foreground">
        Stream is live — add a YouTube Live or Vimeo embed URL to show the player here.
      </p>
    );
  }

  return (
    <div className="mt-3 aspect-video overflow-hidden rounded-lg border border-border">
      <iframe
        title={item.title}
        src={toMediaEmbedUrl(item.embedUrl)}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function CopyField({
  label,
  value,
  placeholder,
  mono = true,
}: {
  label: string;
  value: string;
  placeholder?: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const canCopy = Boolean(value);

  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-start gap-2">
        <span
          className={`min-w-0 flex-1 break-all text-xs ${
            mono ? "font-mono" : ""
          } ${value ? "text-foreground" : "text-muted-foreground"}`}
        >
          {value || placeholder}
        </span>
        {canCopy ? (
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={async () => {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </dd>
    </div>
  );
}

function SceneIcon({ label }: { label: string }) {
  const className = "mt-0.5 size-4 shrink-0 text-[#E11D48]";
  if (label === "Mic") return <Mic className={className} aria-hidden="true" />;
  if (label === "Screen share") return <Monitor className={className} aria-hidden="true" />;
  if (label === "Camera") return <Video className={className} aria-hidden="true" />;
  return <Radio className={className} aria-hidden="true" />;
}
