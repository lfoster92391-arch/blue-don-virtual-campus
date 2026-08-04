"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Eye, EyeOff, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  revealStreamCredentialsAction,
  type StreamCredentialsState,
} from "@/features/media/actions";

type StreamTargetRevealProps = {
  hint: string;
  /** Dark studio console styling instead of the campus card styling. */
  tone?: "campus" | "studio";
};

const scopeLabels: Record<string, string> = {
  session: "Live session key — valid while this broadcast is on air.",
  shared: "Shared school studio key.",
  none: "No key configured. Ask your advisor to set BLUE_DON_LIVE_STREAM_KEY.",
};

/**
 * Crew-only stream target. The RTMP URL and key are fetched through a gated
 * server action on click, so credentials never ride along in page props.
 */
export function StreamTargetReveal({
  hint,
  tone = "campus",
}: StreamTargetRevealProps) {
  const [state, setState] = useState<StreamCredentialsState | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, startReveal] = useTransition();
  const studio = tone === "studio";

  const credentials = state?.credentials;

  return (
    <div className="mt-3 space-y-3">
      {visible && credentials ? (
        <dl className="space-y-3 text-sm">
          <CopyField
            label="RTMP server URL"
            value={credentials.ingestUrl}
            studio={studio}
          />
          <CopyField
            label="Stream key"
            value={credentials.streamKey ?? ""}
            placeholder={hint}
            studio={studio}
          />
          <p
            className={
              studio
                ? "text-xs text-slate-400"
                : "text-xs text-muted-foreground"
            }
          >
            {scopeLabels[credentials.scope]}
          </p>
        </dl>
      ) : (
        <p
          className={
            studio ? "text-xs text-slate-400" : "text-xs text-muted-foreground"
          }
        >
          {hint}
        </p>
      )}

      {state?.error ? (
        <p
          className="flex items-center gap-1.5 text-xs text-destructive"
          role="alert"
        >
          <ShieldAlert className="size-3.5" aria-hidden="true" />
          {state.error}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={loading}
        className={
          studio
            ? "border-white/20 bg-white/5 text-slate-200 hover:bg-white/10"
            : undefined
        }
        onClick={() => {
          if (visible) {
            setVisible(false);
            setState(null);
            return;
          }
          startReveal(async () => {
            const result = await revealStreamCredentialsAction();
            setState(result);
            setVisible(!result.error);
          });
        }}
      >
        {visible ? (
          <EyeOff className="size-3.5" aria-hidden="true" />
        ) : (
          <Eye className="size-3.5" aria-hidden="true" />
        )}
        {loading
          ? "Loading…"
          : visible
            ? "Hide stream target"
            : "Reveal stream target"}
      </Button>
    </div>
  );
}

function CopyField({
  label,
  value,
  placeholder,
  studio,
}: {
  label: string;
  value: string;
  placeholder?: string;
  studio: boolean;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <dt className={studio ? "text-slate-400" : "text-muted-foreground"}>
        {label}
      </dt>
      <dd className="mt-1 flex items-start gap-2">
        <span
          className={`min-w-0 flex-1 break-all font-mono text-xs ${
            value
              ? studio
                ? "text-slate-100"
                : "text-foreground"
              : studio
                ? "text-slate-500"
                : "text-muted-foreground"
          }`}
        >
          {value || placeholder}
        </span>
        {value ? (
          <button
            type="button"
            className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-xs ${
              studio
                ? "border-white/20 text-slate-300 hover:text-white"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            onClick={async () => {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        ) : null}
      </dd>
    </div>
  );
}
