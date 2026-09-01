"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  Check,
  ChevronDown,
  Mic,
  Monitor,
  MonitorPlay,
  Radio,
  SlidersHorizontal,
  Video,
} from "lucide-react";

import type { BlueDonLiveRtmpPublicConfig } from "@/config/broadcast-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  endLiveBroadcastAction,
  startLiveBroadcastAction,
  type MediaActionState,
} from "@/features/media/actions";
import { toMediaEmbedUrl } from "@/lib/media-embed";
import type { CampusMediaItemView } from "@/services/media-service";

import { StreamTargetReveal } from "./stream-target-reveal";

const initialState: MediaActionState = {};

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
  const [state, formAction, pending] = useActionState(
    startLiveBroadcastAction,
    initialState,
  );
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
            appears here for everyone on campus.
          </p>
        )}
      </div>
    );
  }

  const steps = rtmp.goLiveSteps;

  const openStudioStep = (
    <Step
      index={1}
      state={isLive ? "done" : "now"}
      title={steps[0]?.title ?? "Open the studio"}
      detail={steps[0]?.detail ?? ""}
    >
      <Button
        size="lg"
        nativeButton={false}
        render={
          <Link href="/broadcast/studio">
            <MonitorPlay className="size-4" />
            Open Broadcast Studio
          </Link>
        }
      />
    </Step>
  );

  if (activeLive) {
    return (
      <div className="space-y-6">
        <PanelHeading state={airState} />
        <ol className="space-y-3">
          {openStudioStep}
          <Step
            index={2}
            state="done"
            title={steps[1]?.title ?? "Pick today's show"}
            detail={`On air as “${activeLive.title}”.`}
          />
          <Step
            index={3}
            state="done"
            title={steps[2]?.title ?? "Check your preview"}
            detail="This is exactly what campus sees right now."
          >
            <ViewerLivePreview item={activeLive} producer />
          </Step>
          <Step
            index={4}
            state="done"
            title={steps[3]?.title ?? "Go live"}
            detail={`Started by ${activeLive.uploaderName}${
              activeLive.uploadedById === currentUserId ? " (you)" : ""
            }.`}
          />
          <Step
            index={5}
            state="now"
            title={steps[4]?.title ?? "End broadcast"}
            detail={steps[4]?.detail ?? ""}
          >
            <Button
              type="button"
              size="lg"
              variant="outline"
              disabled={ending}
              onClick={() => {
                startEnd(async () => {
                  await endLiveBroadcastAction(activeLive.id);
                });
              }}
            >
              {ending ? "Ending…" : "End broadcast"}
            </Button>
          </Step>
        </ol>
        <AdvancedSetup rtmp={rtmp} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PanelHeading state={airState} />
      <form action={formAction} className="space-y-6">
        <ol className="space-y-3">
          {openStudioStep}

          <Step
            index={2}
            state="now"
            title={steps[1]?.title ?? "Pick today's show"}
            detail={steps[1]?.detail ?? ""}
          >
            <div className="space-y-3">
              <Input
                id="live-title"
                name="title"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Morning Announcements"
                aria-label="Show name"
              />
              <div className="flex flex-wrap gap-2">
                {rtmp.showPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTitle(preset)}
                    className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-[#E11D48]/40 hover:text-foreground"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </Step>

          <Step
            index={3}
            state="now"
            title={steps[2]?.title ?? "Check your preview"}
            detail={steps[2]?.detail ?? ""}
          >
            <ul className="space-y-1.5">
              {rtmp.previewChecks.map((check) => (
                <li
                  key={check}
                  className="flex gap-2.5 text-sm text-muted-foreground"
                >
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full border border-muted-foreground/50"
                    aria-hidden="true"
                  />
                  <span>{check}</span>
                </li>
              ))}
            </ul>
          </Step>

          <Step
            index={4}
            state="now"
            title={steps[3]?.title ?? "Go live"}
            detail={steps[3]?.detail ?? ""}
          >
            {state.error ? (
              <p className="mb-3 text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="bg-[#E11D48] text-white hover:bg-[#BE123C]"
            >
              <Radio className="size-4" />
              {pending ? "Going live…" : "Go Live"}
            </Button>
          </Step>

          <Step
            index={5}
            state="later"
            title={steps[4]?.title ?? "End broadcast"}
            detail={steps[4]?.detail ?? ""}
          />
        </ol>

        <AdvancedSetup rtmp={rtmp} showBroadcastDetails />
      </form>
    </div>
  );
}

function PanelHeading({ state }: { state: AirState }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-foreground">
          Go live in five steps
        </p>
        <p className="text-xs text-muted-foreground">
          Work down the list. Stream keys and OBS settings live under Advanced —
          you should not need them.
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

type StepState = "done" | "now" | "later";

function Step({
  index,
  state,
  title,
  detail,
  children,
}: {
  index: number;
  state: StepState;
  title: string;
  detail: string;
  children?: React.ReactNode;
}) {
  const later = state === "later";

  return (
    <li
      className={`rounded-lg border p-4 ${
        state === "now"
          ? "border-border bg-card"
          : "border-border/60 bg-muted/20"
      }`}
    >
      <div className="flex gap-3">
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
            state === "done"
              ? "bg-[#2E8B57]/15 text-[#2E8B57]"
              : later
                ? "bg-muted text-muted-foreground"
                : "bg-[#0A2342] text-white dark:bg-white dark:text-[#0A2342]"
          }`}
        >
          {state === "done" ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            index
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${later ? "text-muted-foreground" : "text-foreground"}`}
          >
            {title}
          </p>
          {detail ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Everything a student should never have to touch: credentials, the raw OBS
 * checklist, and the optional fields that only matter when we simulcast.
 */
function AdvancedSetup({
  rtmp,
  showBroadcastDetails = false,
}: {
  rtmp: BlueDonLiveRtmpPublicConfig;
  showBroadcastDetails?: boolean;
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
          Advisors configure this once per machine. Students running a normal
          show can leave this closed.
        </p>

        {showBroadcastDetails ? (
          <div className="space-y-4">
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
                Only needed when we also simulcast. Leave blank for a
                campus-only show.
              </p>
            </div>
          </div>
        ) : null}

        <div>
          <p className="text-sm font-medium text-foreground">
            OBS stream target
          </p>
          <StreamTargetReveal hint={rtmp.streamKeyHint} />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            First-time OBS setup
          </p>
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
                  <span className="font-medium text-foreground">
                    {tip.label}:
                  </span>{" "}
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
  if (!item.embedUrl) {
    return (
      <p className="text-sm text-muted-foreground">
        {producer
          ? "You are on air. Campus sees the show in Studio B — add a YouTube Live or Vimeo link under Advanced to show a player here too."
          : "Broadcasting is on air — a player appears here once the crew adds a viewer link."}
      </p>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg border border-border">
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

function SceneIcon({ label }: { label: string }) {
  const className = "mt-0.5 size-4 shrink-0 text-[#E11D48]";
  if (label === "Mic") return <Mic className={className} aria-hidden="true" />;
  if (label === "Screen share")
    return <Monitor className={className} aria-hidden="true" />;
  if (label === "Camera")
    return <Video className={className} aria-hidden="true" />;
  return <Radio className={className} aria-hidden="true" />;
}
