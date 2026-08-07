"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  SkipForward,
} from "lucide-react";

import { StudioEmptyNote, StudioPanel } from "@/components/studio/studio-frame";
import {
  formatSegmentTimer,
  formatSinceLabel,
  useSecondTick,
} from "@/components/studio/studio-time";
import {
  STUDIO_RUN_STATE_LABELS,
  STUDIO_SEGMENT_LONG_SECONDS,
  type StudioRunItemState,
} from "@/config/broadcast-studio";
import { runStudioShowAction } from "@/features/broadcast-studio/actions";
import { cn } from "@/lib/utils";
import type {
  StudioRunOfShowItem,
  StudioRunOfShowState,
} from "@/services/broadcast-studio-service";
import type {
  StudioRunCommand,
  StudioRunProgress,
} from "@/services/studio-run-of-show-service";

/**
 * The run of show, driven rather than read.
 *
 * Today's rundown is still the Daily Rundown's — the filled lines below each
 * item are the words the anchors are reading, and nothing here edits them.
 * What the console owns is the crew's position in that script: which item is
 * up, which are done, and which got skipped. Advance and Back are the two keys
 * an operator uses at speed, and tapping any item jumps straight to it, so a
 * show that goes out of order does not have to be fought back into line.
 */

type LocalWrite = {
  savedAt: number;
  progress: StudioRunProgress;
};

export function RunOfShowPanel({
  runOfShow,
  fetchedAt,
  onChanged,
}: {
  runOfShow: StudioRunOfShowState | null;
  /** When the snapshot was read — ages out a just-saved press. */
  fetchedAt: string;
  onChanged: () => void;
}) {
  const tick = useSecondTick();
  const [write, setWrite] = useState<LocalWrite | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (command: StudioRunCommand) => {
      setBusy(true);
      const result = await runStudioShowAction(command);
      setBusy(false);
      setError(result.error ?? null);

      if (result.progress && result.savedAt) {
        setWrite({ savedAt: result.savedAt, progress: result.progress });
        onChanged();
      }
    },
    [onChanged],
  );

  // A press and the 5 s poll race each other, so the saved progress is held
  // until a read from after the press lands — the same rule the score and
  // graphics panels use, and the reason Advance never appears to bounce back.
  const pending =
    write && Date.parse(fetchedAt) < write.savedAt ? write.progress : null;

  const items = useMemo(
    () => applyProgress(runOfShow?.items ?? [], pending),
    [pending, runOfShow?.items],
  );

  if (!runOfShow) {
    return (
      <StudioPanel title="Run of show" className="lg:flex-1">
        <StudioEmptyNote>
          Today&apos;s rundown could not be read, so it cannot be driven. Open
          the{" "}
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

  const currentIndex = items.findIndex((item) => item.state === "CURRENT");
  const current = currentIndex >= 0 ? items[currentIndex] : null;
  const itemStartedAt =
    pending?.itemStartedAt ?? runOfShow.progress.itemStartedAt;
  const segment = current ? formatSegmentTimer(tick, itemStartedAt) : null;
  const longSegment = Boolean(
    tick &&
      itemStartedAt &&
      tick - Date.parse(itemStartedAt) > STUDIO_SEGMENT_LONG_SECONDS * 1000,
  );
  const done = items.filter((item) => item.state === "COMPLETED").length;
  const started = Boolean(pending?.startedAt ?? runOfShow.progress.startedAt);
  const ended = Boolean(pending?.endedAt ?? runOfShow.progress.endedAt);
  const drivenBy =
    pending?.updatedByName ?? runOfShow.progress.updatedByName ?? null;
  const drivenAt = formatSinceLabel(
    tick,
    pending?.updatedAt ?? runOfShow.progress.updatedAt,
  );

  return (
    <StudioPanel
      title="Run of show"
      meta={
        current
          ? `${currentIndex + 1}/${items.length}`
          : `${done}/${items.length} done`
      }
      badge={
        segment ? (
          <span
            className={cn(
              "rounded-sm border px-1.5 py-0.5 font-mono text-[0.6rem] tracking-wider tabular-nums",
              longSegment
                ? "border-[#C9A227]/50 bg-[#C9A227]/15 text-[#E0B93B]"
                : "border-[#2E8B57]/40 bg-[#2E8B57]/10 text-[#7FE0A8]",
            )}
            title="Time on the current item"
          >
            {segment}
          </span>
        ) : undefined
      }
      className="lg:flex-1"
    >
      <div className="flex items-center gap-1">
        <TransportKey
          label="Back"
          icon={<ChevronLeft className="size-3" aria-hidden="true" />}
          tone="neutral"
          disabled={busy || (!started && !current)}
          title="Step back one item and re-open it"
          onClick={() => void send({ action: "BACK" })}
        />
        <TransportKey
          label={current ? "Advance" : ended ? "Restart" : "Start show"}
          icon={
            current ? (
              <ChevronRight className="size-3" aria-hidden="true" />
            ) : (
              <Play className="size-3" aria-hidden="true" />
            )
          }
          tone="program"
          className="flex-1"
          disabled={busy}
          title={
            current
              ? "Mark this item done and move to the next"
              : "Put the first item up"
          }
          onClick={() =>
            void send({ action: current ? "ADVANCE" : "START" })
          }
        />
        <TransportKey
          label="Reset"
          icon={<RotateCcw className="size-3" aria-hidden="true" />}
          tone="neutral"
          disabled={busy || (!started && done === 0)}
          title="Clear tonight's progress. The script itself is untouched."
          onClick={() => {
            if (
              window.confirm(
                "Clear the run of show progress for today? The rundown script itself is not changed.",
              )
            ) {
              void send({ action: "RESET" });
            }
          }}
        />
      </div>

      <ol className="mt-2 space-y-1">
        {items.map((item, index) => (
          <RunItemRow
            key={item.key}
            item={item}
            index={index}
            busy={busy}
            onSelect={() => void send({ action: "SELECT", itemKey: item.key })}
            onReady={() =>
              void send({ action: "TOGGLE_READY", itemKey: item.key })
            }
            onSkip={() => void send({ action: "SKIP", itemKey: item.key })}
          />
        ))}
      </ol>

      {error ? (
        <p
          className="mt-2 rounded-sm border border-[#E11D48]/40 bg-[#E11D48]/10 px-2 py-1.5 text-[0.65rem] leading-snug text-[#FF8098]"
          role="status"
        >
          {error}
        </p>
      ) : null}

      <StudioEmptyNote>
        {runOfShow.isPersisted
          ? `Today's script${runOfShow.updatedByName ? ` · ${runOfShow.updatedByName}` : ""}.`
          : "No one has saved today's rundown yet — this is the template."}{" "}
        {drivenBy
          ? `Driven by ${drivenBy}${drivenAt ? ` · ${drivenAt}` : ""}. `
          : "Progress is shared with every console on this rundown. "}
        <Link
          href="/organizations/broadcasting?tab=script"
          className="text-slate-300 underline"
        >
          Edit in Daily Rundown
        </Link>
        .
      </StudioEmptyNote>
    </StudioPanel>
  );
}

/* ------------------------------------------------------------- helpers */

/**
 * Lays a just-saved press over the server's items. The server derives item
 * state the same way; this only exists so the panel does not sit still for up
 * to five seconds after a key is pressed.
 */
function applyProgress(
  items: StudioRunOfShowItem[],
  progress: StudioRunProgress | null,
): StudioRunOfShowItem[] {
  if (!progress) {
    return items;
  }

  return items.map((item) => ({
    ...item,
    state:
      progress.currentKey === item.key
        ? "CURRENT"
        : (progress.states[item.key] ?? "PENDING"),
  }));
}

const STATE_CHROME: Record<
  StudioRunItemState,
  { row: string; label: string; chip: string }
> = {
  CURRENT: {
    row: "border-[#E11D48]/50 bg-[#E11D48]/15",
    label: "text-[#FF8098]",
    chip: "border-[#E11D48]/50 bg-[#E11D48]/20 text-[#FFB3C2]",
  },
  READY: {
    row: "border-[#2F80ED]/40 bg-[#2F80ED]/10",
    label: "text-[#8FBEFF]",
    chip: "border-[#2F80ED]/40 bg-[#2F80ED]/10 text-[#8FBEFF]",
  },
  COMPLETED: {
    row: "border-white/5 bg-white/[0.02]",
    label: "text-slate-500 line-through",
    chip: "border-[#2E8B57]/40 bg-[#2E8B57]/10 text-[#7FE0A8]",
  },
  SKIPPED: {
    row: "border-white/5 bg-white/[0.01]",
    label: "text-slate-600 line-through",
    chip: "border-[#C9A227]/40 bg-[#C9A227]/10 text-[#E0B93B]",
  },
  PENDING: {
    row: "border-white/5 bg-white/[0.02]",
    label: "text-slate-300",
    chip: "border-white/10 bg-white/5 text-slate-500",
  },
};

function RunItemRow({
  item,
  index,
  busy,
  onSelect,
  onReady,
  onSkip,
}: {
  item: StudioRunOfShowItem;
  index: number;
  busy: boolean;
  onSelect: () => void;
  onReady: () => void;
  onSkip: () => void;
}) {
  const chrome = STATE_CHROME[item.state];
  const isCurrent = item.state === "CURRENT";

  return (
    <li className={cn("rounded-sm border px-2 py-1.5", chrome.row)}>
      <div className="flex items-center gap-1.5">
        <span className="font-mono text-[0.6rem] text-slate-600 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={onSelect}
          title={`Put "${item.label}" up now`}
          className={cn(
            "min-w-0 flex-1 truncate text-left text-[0.7rem]",
            chrome.label,
          )}
        >
          {item.label}
        </button>

        <RowKey
          label="Ready"
          active={item.state === "READY"}
          disabled={busy || isCurrent}
          onClick={onReady}
        >
          <Check className="size-3" aria-hidden="true" />
        </RowKey>
        <RowKey
          label="Skip"
          active={item.state === "SKIPPED"}
          disabled={busy}
          onClick={onSkip}
        >
          <SkipForward className="size-3" aria-hidden="true" />
        </RowKey>

        <span
          className={cn(
            "shrink-0 rounded-sm border px-1.5 py-0.5 font-mono text-[0.55rem] tracking-wider uppercase",
            chrome.chip,
          )}
        >
          {item.state === "PENDING"
            ? slotLabel(item)
            : STUDIO_RUN_STATE_LABELS[item.state]}
        </span>
      </div>

      {/* The words stay visible whatever the item's state — the point of the
          panel is that the operator reads the script from it. */}
      <p
        className={cn(
          "mt-0.5 pl-6 leading-snug",
          isCurrent
            ? "text-[0.7rem] text-slate-200"
            : "text-[0.65rem] text-slate-500",
          !item.filled && "text-slate-600 italic",
        )}
      >
        {isCurrent || item.line.length <= 140
          ? item.line
          : `${item.line.slice(0, 140)}…`}
      </p>
    </li>
  );
}

/** Pending items keep the Phase 3 chip, so "needed" is still visible at a glance. */
function slotLabel(item: StudioRunOfShowItem): string {
  if (item.slotType === "FIXED") {
    return "Fixed";
  }
  if (item.slotType === "LOCKED_DAILY") {
    return "Prayer";
  }
  if (item.filled) {
    return "Filled";
  }
  return item.required ? "Needed" : "Open";
}

function RowKey({
  label,
  active,
  children,
  className,
  ...props
}: {
  label: string;
  active: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "shrink-0 rounded-sm border p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30",
        active
          ? "border-[#2F80ED]/60 bg-[#2F80ED]/25 text-[#BFD9FF]"
          : "border-white/10 bg-white/[0.03] text-slate-500 hover:bg-white/10",
        className,
      )}
    >
      {children}
    </button>
  );
}

function TransportKey({
  label,
  icon,
  tone,
  className,
  ...props
}: {
  label: string;
  icon: React.ReactNode;
  tone: "program" | "neutral";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    program:
      "border-[#E11D48]/50 bg-[#E11D48]/15 text-[#FF8098] hover:bg-[#E11D48]/25",
    neutral: "border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/10",
  };

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-1 rounded-sm border px-2 py-1.5 font-mono text-[0.6rem] font-semibold tracking-[0.12em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}
