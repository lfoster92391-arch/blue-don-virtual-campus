"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, RefreshCw, X } from "lucide-react";

import { OverlayStage } from "@/components/broadcast-overlay/overlay-stage";
import { StudioEmptyNote, StudioPanel } from "@/components/studio/studio-frame";
import { formatSinceLabel, useSecondTick } from "@/components/studio/studio-time";
import { useStudioGameClock } from "@/components/studio/use-studio-game-clock";
import {
  STUDIO_GRAPHIC_DEFS,
  STUDIO_GRAPHIC_ORDER,
  STUDIO_GRAPHIC_REGION_LABELS,
  STUDIO_LINEUP_MAX_ENTRIES,
  studioGraphicRegion,
} from "@/config/broadcast-studio";
import {
  clearAllStudioGraphicsAction,
  clearStudioGraphicAction,
  rotateStudioOverlayKeyAction,
  saveStudioGraphicAction,
} from "@/features/broadcast-studio/actions";
import type { StudioGraphicKind } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import type {
  StudioOverlayGraphic,
  StudioRosterPlayer,
  StudioScoreboardState,
} from "@/services/broadcast-studio-service";
import type {
  StudioGraphicEntry,
  StudioGraphicsState,
  StudioGraphicView,
} from "@/services/studio-graphics-service";
import type { StudioSponsorView } from "@/services/studio-sponsors-service";

/**
 * Graphics control.
 *
 * The three operator verbs are separate keys and never share one: **Preview**
 * cues a graphic on this console only, **Take live** puts it on the overlay,
 * and **Remove** pulls it. The two monitors on the right render with the same
 * components the OBS Browser Source uses, so PVW is what the audience will get
 * rather than an impression of it.
 *
 * Copy is editable and stored per kind, so tonight's lower third is next
 * week's starting point — there is no hardcoded name anywhere in the package.
 */

type Draft = {
  title: string;
  subtitle: string;
  detail: string;
  note: string;
  entries: StudioGraphicEntry[];
  playerId: string | null;
  /** Set when the card is bound to the sponsor book rather than typed copy. */
  sponsorId: string | null;
};

type LocalWrite = {
  savedAt: number;
  kind: StudioGraphicKind;
  /** Null when the operator removed the graphic. */
  view: StudioGraphicView | null;
};

type GraphicsPanelProps = {
  graphics: StudioGraphicsState;
  /** When the snapshot behind `graphics` was read — ages out local writes. */
  fetchedAt: string;
  scoreboard: StudioScoreboardState | null;
  roster: StudioRosterPlayer[];
  /** The sponsor book, for the cards that read a sponsor rather than copy one. */
  sponsors: StudioSponsorView[];
  /** Browser Source URL path, handed over once with the crew-gated page. */
  overlayPath: string | null;
  onChanged: () => void;
};

function emptyDraft(): Draft {
  return {
    title: "",
    subtitle: "",
    detail: "",
    note: "",
    entries: [],
    playerId: null,
    sponsorId: null,
  };
}

function draftFrom(view: StudioGraphicView | undefined): Draft {
  if (!view) {
    return emptyDraft();
  }

  return {
    title: view.fields.title ?? "",
    subtitle: view.fields.subtitle ?? "",
    detail: view.fields.detail ?? "",
    note: view.fields.note ?? "",
    entries: view.fields.entries,
    playerId: view.playerId,
    sponsorId: view.sponsorId,
  };
}

export function GraphicsPanel({
  graphics,
  fetchedAt,
  scoreboard,
  roster,
  sponsors,
  overlayPath,
  onChanged,
}: GraphicsPanelProps) {
  const [selectedKind, setSelectedKind] =
    useState<StudioGraphicKind>("LOWER_THIRD");
  const [drafts, setDrafts] = useState<Partial<Record<StudioGraphicKind, Draft>>>(
    {},
  );
  const [writes, setWrites] = useState<LocalWrite[]>([]);
  const [busyKind, setBusyKind] = useState<StudioGraphicKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  const items = useMergedGraphics(graphics.items, writes, fetchedAt);
  const def = STUDIO_GRAPHIC_DEFS[selectedKind];
  const current = items.get(selectedKind);
  const clock = useStudioGameClock(scoreboard?.gameId ?? null);

  // The editor falls back to the stored copy until the operator types, and
  // from then on the local draft wins: a poll landing mid-sentence must never
  // eat what is being typed.
  const draft = drafts[selectedKind] ?? draftFrom(current);

  const patchDraft = (patch: Partial<Draft>) => {
    setDrafts((previous) => ({
      ...previous,
      [selectedKind]: { ...draft, ...patch },
    }));
  };

  const fieldsFor = useCallback(
    (kind: StudioGraphicKind, source: Draft) => ({
      title: source.title || null,
      subtitle: source.subtitle || null,
      detail: source.detail || null,
      note: source.note || null,
      entries: kind === "LINEUP" ? source.entries : [],
      clock:
        kind === "SCORE_BUG"
          ? {
              seconds: clock.remainingSeconds,
              running: clock.running,
              at: new Date().toISOString(),
              period: clock.periodLabel,
            }
          : null,
    }),
    [clock.periodLabel, clock.remainingSeconds, clock.running],
  );

  const save = useCallback(
    async (
      kind: StudioGraphicKind,
      intent: "CUE" | "TAKE",
      source: Draft,
    ) => {
      setBusyKind(kind);
      const result = await saveStudioGraphicAction({
        kind,
        intent,
        fields: fieldsFor(kind, source),
        gameId: needsGame(kind) ? (scoreboard?.gameId ?? null) : null,
        playerId: kind === "PLAYER_ID" ? source.playerId : null,
        sponsorId: needsSponsor(kind) ? source.sponsorId : null,
      });
      setBusyKind(null);
      setError(result.error ?? null);

      const saved = result.graphic;
      if (saved) {
        setWrites((previous) => [
          ...previous.filter((entry) => entry.kind !== kind),
          { savedAt: Date.now(), kind, view: saved },
        ]);
        onChanged();
      }
    },
    [fieldsFor, onChanged, scoreboard?.gameId],
  );

  const remove = useCallback(
    async (kind: StudioGraphicKind) => {
      setBusyKind(kind);
      const result = await clearStudioGraphicAction({ kind });
      setBusyKind(null);
      setError(result.error ?? null);

      if (!result.error) {
        setWrites((previous) => [
          ...previous.filter((entry) => entry.kind !== kind),
          { savedAt: Date.now(), kind, view: null },
        ]);
        onChanged();
      }
    },
    [onChanged],
  );

  const clearAll = useCallback(async () => {
    setBusyKind(null);
    const result = await clearAllStudioGraphicsAction();
    setError(result.error ?? null);

    if (!result.error) {
      const savedAt = Date.now();
      setWrites(
        STUDIO_GRAPHIC_ORDER.map((kind) => ({ savedAt, kind, view: null })),
      );
      onChanged();
    }
  }, [onChanged]);

  useLiveClockPush({
    live: items.get("SCORE_BUG")?.state === "LIVE",
    clock,
    push: () =>
      void save(
        "SCORE_BUG",
        "CUE",
        drafts.SCORE_BUG ?? draftFrom(items.get("SCORE_BUG")),
      ),
  });

  const liveGraphics = useMemo(
    () =>
      STUDIO_GRAPHIC_ORDER.map((kind) => items.get(kind))
        .filter(
          (item): item is StudioGraphicView => item?.state === "LIVE",
        )
        .map((item) => toOverlayGraphic(item.kind, item, scoreboard)),
    [items, scoreboard],
  );

  const draftSponsor =
    sponsors.find((sponsor) => sponsor.id === draft.sponsorId) ?? null;

  const previewGraphic = useMemo(
    () =>
      toOverlayGraphic(
        selectedKind,
        {
          kind: selectedKind,
          state: "PREVIEW",
          fields: fieldsFor(selectedKind, draft),
          gameId: needsGame(selectedKind) ? (scoreboard?.gameId ?? null) : null,
          playerId: draft.playerId,
          sponsorId: needsSponsor(selectedKind) ? draft.sponsorId : null,
          sponsor: needsSponsor(selectedKind) ? draftSponsor : null,
          takenAt: null,
          updatedAt: new Date(0).toISOString(),
          updatedByName: null,
        },
        scoreboard,
      ),
    [draft, draftSponsor, fieldsFor, scoreboard, selectedKind],
  );

  const liveCount = liveGraphics.length;
  const blocked = needsGame(selectedKind) && !scoreboard;

  return (
    <StudioPanel
      title="Graphics"
      meta={liveCount > 0 ? `${liveCount} on air` : "Clear"}
      className="lg:flex-1"
    >
      <OverlayStatusLine
        graphics={graphics}
        overlayPath={overlayPath}
        onRotated={onChanged}
      />

      <div className="mt-2 grid gap-2 xl:grid-cols-[10.5rem_minmax(0,1fr)_14rem]">
        <ul className="space-y-1">
          {STUDIO_GRAPHIC_ORDER.map((kind) => {
            const item = items.get(kind);
            const live = item?.state === "LIVE";
            const cued = item?.state === "PREVIEW";

            return (
              <li key={kind}>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-sm border px-2 py-1.5",
                    live
                      ? "border-[#E11D48]/50 bg-[#E11D48]/15"
                      : kind === selectedKind
                        ? "border-[#2F80ED]/50 bg-[#2F80ED]/10"
                        : "border-white/10 bg-white/[0.03]",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedKind(kind)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span
                      className={cn(
                        "block truncate text-xs font-semibold tracking-wide",
                        live
                          ? "text-[#FF8098]"
                          : kind === selectedKind
                            ? "text-[#8FBEFF]"
                            : "text-slate-300",
                      )}
                    >
                      {STUDIO_GRAPHIC_DEFS[kind].label}
                    </span>
                    <span className="block truncate font-mono text-[0.55rem] tracking-wider text-slate-600 uppercase">
                      {live
                        ? "On air"
                        : cued
                          ? "Cued"
                          : STUDIO_GRAPHIC_REGION_LABELS[
                              studioGraphicRegion(kind)
                            ]}
                    </span>
                  </button>
                  {live ? (
                    <button
                      type="button"
                      disabled={busyKind === kind}
                      onClick={() => void remove(kind)}
                      aria-label={`Remove ${STUDIO_GRAPHIC_DEFS[kind].label}`}
                      title={`Remove ${STUDIO_GRAPHIC_DEFS[kind].label}`}
                      className="shrink-0 rounded-sm border border-[#E11D48]/40 p-1 text-[#FF8098] transition-colors hover:bg-[#E11D48]/20 disabled:opacity-40"
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}

          <li>
            <button
              type="button"
              disabled={liveCount === 0}
              onClick={() => void clearAll()}
              className="mt-1 w-full rounded-sm border border-white/15 bg-white/[0.04] px-2 py-1.5 font-mono text-[0.6rem] font-semibold tracking-[0.15em] text-slate-300 uppercase transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear overlay
            </button>
          </li>
        </ul>

        <div className="min-w-0 space-y-2">
          <p className="font-mono text-[0.6rem] tracking-[0.15em] text-slate-500 uppercase">
            {def.label} · {STUDIO_GRAPHIC_REGION_LABELS[def.region]} ·{" "}
            {sourceLabel(def.source)}
          </p>

          {def.source === "PLAYER" ? (
            <PlayerPicker
              roster={roster}
              value={draft.playerId}
              onPick={(player) =>
                patchDraft({
                  playerId: player?.id ?? null,
                  title: player?.fullName ?? draft.title,
                  subtitle: player ? playerLine(player) : draft.subtitle,
                })
              }
            />
          ) : null}

          {def.source === "SPONSOR" ? (
            <SponsorPicker
              sponsors={sponsors}
              value={draft.sponsorId}
              onPick={(sponsor) => patchDraft({ sponsorId: sponsor?.id ?? null })}
            />
          ) : null}

          {def.fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
                {field.label}
              </span>
              <input
                value={draft[field.key]}
                placeholder={field.placeholder}
                onChange={(event) =>
                  patchDraft({ [field.key]: event.target.value } as Partial<Draft>)
                }
                className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.75rem] text-slate-100 placeholder:text-slate-600 focus:border-[#2F80ED] focus:outline-none"
              />
            </label>
          ))}

          {selectedKind === "LINEUP" ? (
            <LineupEditor
              entries={draft.entries}
              roster={roster}
              onChange={(entries) => patchDraft({ entries })}
            />
          ) : null}

          {needsGame(selectedKind) ? (
            <p className="rounded-sm border border-white/10 bg-white/[0.02] px-2 py-1.5 text-[0.65rem] leading-snug text-slate-400">
              {scoreboard
                ? `Reads ${scoreboard.awayLabel} at ${scoreboard.homeLabel} live from the game record — the score on air is the score on /sports.`
                : "Pick a game in Game control first. This card reads the score from the game record rather than copying it."}
            </p>
          ) : null}

          {needsSponsor(selectedKind) ? (
            <p className="rounded-sm border border-white/10 bg-white/[0.02] px-2 py-1.5 text-[0.65rem] leading-snug text-slate-400">
              {draftSponsor
                ? `Reads ${draftSponsor.name} from the sponsor book — fixing the name or logo there fixes this card on air.`
                : "No sponsor attached, so this card uses the copy typed above. Attach one from the book to get the logo and keep it correctable."}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-1 pt-0.5">
            {current?.state === "LIVE" ? (
              <ActionKey
                tone="preview"
                disabled={busyKind === selectedKind}
                onClick={() => void save(selectedKind, "CUE", draft)}
              >
                Update on air
              </ActionKey>
            ) : (
              <>
                <ActionKey
                  tone="preview"
                  disabled={busyKind === selectedKind}
                  onClick={() => void save(selectedKind, "CUE", draft)}
                >
                  Preview
                </ActionKey>
                <ActionKey
                  tone="program"
                  disabled={busyKind === selectedKind || blocked}
                  title={
                    blocked
                      ? "Pick a game in Game control first."
                      : `Take ${def.label} to air`
                  }
                  onClick={() => void save(selectedKind, "TAKE", draft)}
                >
                  Take live
                </ActionKey>
              </>
            )}
            <ActionKey
              tone="neutral"
              disabled={busyKind === selectedKind || !current}
              onClick={() => void remove(selectedKind)}
            >
              Remove
            </ActionKey>
          </div>

          {error ? (
            <p
              className="rounded-sm border border-[#E11D48]/40 bg-[#E11D48]/10 px-2 py-1.5 text-[0.65rem] leading-snug text-[#FF8098]"
              role="status"
            >
              {error}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Monitor label="PVW" tone="preview">
            <OverlayStage graphics={previewGraphic ? [previewGraphic] : []} />
          </Monitor>
          <Monitor label="PGM" tone="program">
            <OverlayStage graphics={liveGraphics} />
          </Monitor>
        </div>
      </div>

      <StudioEmptyNote>
        Graphics render in the OBS Browser Source, not in OBS itself — the
        overlay pulls this state about once a second. One graphic per region, so
        a take replaces whatever shared that part of the frame. Sponsor cards
        are faster to run from the Sponsors panel; this is where one-off
        wording lives.
      </StudioEmptyNote>
    </StudioPanel>
  );
}

/* ------------------------------------------------------------- helpers */

function needsGame(kind: StudioGraphicKind): boolean {
  return STUDIO_GRAPHIC_DEFS[kind].source === "GAME";
}

function needsSponsor(kind: StudioGraphicKind): boolean {
  return STUDIO_GRAPHIC_DEFS[kind].source === "SPONSOR";
}

function sourceLabel(source: string): string {
  switch (source) {
    case "GAME":
      return "Reads the game record";
    case "PLAYER":
      return "Reads the roster";
    case "ROSTER":
      return "Reads the roster";
    case "SPONSOR":
      return "Reads the sponsor book";
    default:
      return "Typed here";
  }
}

function playerLine(player: StudioRosterPlayer): string {
  return [player.jerseyNumber ? `#${player.jerseyNumber}` : null, player.position]
    .filter(Boolean)
    .join(" • ");
}

/**
 * Server state, with a just-saved write held on top until a read from after it
 * lands — the same rule the score panel uses, so a take never appears to
 * bounce back to "cued" while the 5 s poll catches up.
 */
function useMergedGraphics(
  serverItems: StudioGraphicView[],
  writes: LocalWrite[],
  fetchedAt: string,
): Map<StudioGraphicKind, StudioGraphicView> {
  return useMemo(() => {
    const merged = new Map<StudioGraphicKind, StudioGraphicView>();
    for (const item of serverItems) {
      merged.set(item.kind, item);
    }

    const readAt = Date.parse(fetchedAt);
    for (const write of writes) {
      if (readAt >= write.savedAt) {
        continue;
      }
      if (write.view) {
        merged.set(write.kind, write.view);
      } else {
        merged.delete(write.kind);
      }
    }

    return merged;
  }, [fetchedAt, serverItems, writes]);
}

/**
 * Pushes the console clock to the overlay when it actually changes state —
 * started, stopped, reset, or a new period. A running clock is never written
 * per second: the overlay is handed an anchor and counts down itself.
 */
function useLiveClockPush({
  live,
  clock,
  push,
}: {
  live: boolean;
  clock: ReturnType<typeof useStudioGameClock>;
  push: () => void;
}) {
  const lastPushed = useRef<string | null>(null);
  const pushRef = useRef(push);

  useEffect(() => {
    pushRef.current = push;
  });

  const signature = clock.running
    ? `run:${clock.periodLabel}`
    : `stop:${clock.periodLabel}:${clock.remainingSeconds}`;

  useEffect(() => {
    if (!live) {
      lastPushed.current = null;
      return;
    }

    if (lastPushed.current === null) {
      lastPushed.current = signature;
      return;
    }

    if (lastPushed.current !== signature) {
      lastPushed.current = signature;
      pushRef.current();
    }
  }, [live, signature]);
}

/** Build what the overlay would render from a console-side row. */
function toOverlayGraphic(
  kind: StudioGraphicKind,
  view: StudioGraphicView,
  scoreboard: StudioScoreboardState | null,
): StudioOverlayGraphic {
  return {
    id: kind,
    kind,
    region: studioGraphicRegion(kind),
    takenAt: view.takenAt,
    fields: view.fields,
    // The console only holds the game it is pointed at, so a card bound to a
    // different game previews without a score rather than with the wrong one.
    scoreboard:
      view.gameId && scoreboard?.gameId === view.gameId ? scoreboard : null,
    sponsor: view.sponsor,
  };
}

/* -------------------------------------------------------------- pieces */

function Monitor({
  label,
  tone,
  children,
}: {
  label: string;
  tone: "preview" | "program";
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden rounded-sm border bg-[#101418]",
          tone === "program" ? "border-[#E11D48]/50" : "border-[#2F80ED]/40",
        )}
      >
        {children}
        <span
          className={cn(
            "absolute top-1 left-1 rounded-sm px-1 py-0.5 font-mono text-[0.5rem] tracking-[0.2em] uppercase",
            tone === "program"
              ? "bg-[#E11D48]/80 text-white"
              : "bg-[#2F80ED]/80 text-white",
          )}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

function ActionKey({
  tone,
  className,
  children,
  ...props
}: {
  tone: "preview" | "program" | "neutral";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const tones = {
    preview:
      "border-[#2F80ED]/50 bg-[#2F80ED]/15 text-[#8FBEFF] hover:bg-[#2F80ED]/25",
    program:
      "border-[#E11D48]/50 bg-[#E11D48]/15 text-[#FF8098] hover:bg-[#E11D48]/25",
    neutral: "border-white/15 bg-white/[0.04] text-slate-300 hover:bg-white/10",
  };

  return (
    <button
      {...props}
      type="button"
      className={cn(
        "rounded-sm border px-2.5 py-1.5 font-mono text-[0.6rem] font-semibold tracking-[0.15em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

function PlayerPicker({
  roster,
  value,
  onPick,
}: {
  roster: StudioRosterPlayer[];
  value: string | null;
  onPick: (player: StudioRosterPlayer | null) => void;
}) {
  if (roster.length === 0) {
    return (
      <p className="rounded-sm border border-white/10 bg-white/[0.02] px-2 py-1.5 text-[0.65rem] text-slate-400">
        No roster for this sport yet. Add players on the Sports Desk, or type
        the name below.
      </p>
    );
  }

  return (
    <label className="block">
      <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
        Roster
      </span>
      <select
        value={value ?? ""}
        onChange={(event) =>
          onPick(
            roster.find((player) => player.id === event.target.value) ?? null,
          )
        }
        className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.7rem] text-slate-200 focus:border-[#2F80ED] focus:outline-none"
      >
        <option value="" className="bg-[#0C1A2E]">
          Type a name instead
        </option>
        {roster.map((player) => (
          <option key={player.id} value={player.id} className="bg-[#0C1A2E]">
            {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
            {player.fullName}
            {player.position ? ` · ${player.position}` : ""}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Attaches a card to the sponsor book. Leaving it unattached is a real choice
 * — a one-off thank-you does not belong in the season's book — so the empty
 * option stays available rather than being a placeholder.
 */
function SponsorPicker({
  sponsors,
  value,
  onPick,
}: {
  sponsors: StudioSponsorView[];
  value: string | null;
  onPick: (sponsor: StudioSponsorView | null) => void;
}) {
  if (sponsors.length === 0) {
    return (
      <p className="rounded-sm border border-white/10 bg-white/[0.02] px-2 py-1.5 text-[0.65rem] text-slate-400">
        The sponsor book is empty. Add sponsors in the Sponsors panel, or type
        the copy below for a one-off.
      </p>
    );
  }

  return (
    <label className="block">
      <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
        Sponsor book
      </span>
      <select
        value={value ?? ""}
        onChange={(event) =>
          onPick(
            sponsors.find((sponsor) => sponsor.id === event.target.value) ??
              null,
          )
        }
        className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.7rem] text-slate-200 focus:border-[#2F80ED] focus:outline-none"
      >
        <option value="" className="bg-[#0C1A2E]">
          Type the copy instead
        </option>
        {sponsors.map((sponsor) => (
          <option key={sponsor.id} value={sponsor.id} className="bg-[#0C1A2E]">
            {sponsor.name}
            {sponsor.isActive ? "" : " · off the book"}
          </option>
        ))}
      </select>
    </label>
  );
}

function LineupEditor({
  entries,
  roster,
  onChange,
}: {
  entries: StudioGraphicEntry[];
  roster: StudioRosterPlayer[];
  onChange: (entries: StudioGraphicEntry[]) => void;
}) {
  const available = roster.filter(
    (player) => !entries.some((entry) => entry.name === player.fullName),
  );

  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.02] p-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
          Lineup · {entries.length}/{STUDIO_LINEUP_MAX_ENTRIES}
        </span>
        <button
          type="button"
          disabled={roster.length === 0}
          onClick={() =>
            onChange(
              roster.slice(0, STUDIO_LINEUP_MAX_ENTRIES).map((player) => ({
                name: player.fullName,
                number: player.jerseyNumber,
                detail: player.position,
              })),
            )
          }
          className="rounded-sm border border-white/15 px-1.5 py-0.5 font-mono text-[0.55rem] tracking-wider text-slate-300 uppercase hover:bg-white/10 disabled:opacity-40"
        >
          Fill from roster
        </button>
      </div>

      {entries.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {entries.map((entry, index) => (
            <li
              key={`${entry.name}-${index}`}
              className="flex items-center gap-1.5 text-[0.7rem] text-slate-300"
            >
              <span className="font-mono text-slate-500">
                {entry.number ? `#${entry.number}` : "--"}
              </span>
              <span className="min-w-0 flex-1 truncate">{entry.name}</span>
              <button
                type="button"
                aria-label={`Remove ${entry.name}`}
                onClick={() =>
                  onChange(entries.filter((_, position) => position !== index))
                }
                className="rounded-sm p-0.5 text-slate-500 hover:text-[#FF8098]"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-[0.65rem] text-slate-500">
          Empty. Fill from the roster, then trim to the starters.
        </p>
      )}

      {available.length > 0 && entries.length < STUDIO_LINEUP_MAX_ENTRIES ? (
        <select
          value=""
          onChange={(event) => {
            const player = roster.find(
              (candidate) => candidate.id === event.target.value,
            );
            if (player) {
              onChange([
                ...entries,
                {
                  name: player.fullName,
                  number: player.jerseyNumber,
                  detail: player.position,
                },
              ]);
            }
          }}
          className="mt-1.5 h-7 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.7rem] text-slate-200 focus:border-[#2F80ED] focus:outline-none"
        >
          <option value="" className="bg-[#0C1A2E]">
            Add a player…
          </option>
          {available.map((player) => (
            <option key={player.id} value={player.id} className="bg-[#0C1A2E]">
              {player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}
              {player.fullName}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

/**
 * Is a Browser Source actually attached? Measured from the overlay's own
 * polling, so an OBS machine that was closed reads as gone rather than staying
 * green because someone once opened it.
 */
function OverlayStatusLine({
  graphics,
  overlayPath,
  onRotated,
}: {
  graphics: StudioGraphicsState;
  overlayPath: string | null;
  onRotated: () => void;
}) {
  const tick = useSecondTick();
  // A rotation returns the new path before the page re-renders, so it wins
  // until the server hands over a fresh one.
  const [rotatedPath, setRotatedPath] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);
  const seen = formatSinceLabel(tick, graphics.overlayLastSeenAt);
  const path = rotatedPath ?? overlayPath;

  const url =
    path && typeof window !== "undefined"
      ? `${window.location.origin}${path}`
      : path;

  const copy = async () => {
    if (!url) {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const rotate = async () => {
    if (
      !window.confirm(
        "Issue a new overlay URL? The Browser Source in OBS has to be updated with the new address before graphics appear again.",
      )
    ) {
      return;
    }

    setRotating(true);
    const result = await rotateStudioOverlayKeyAction();
    setRotating(false);

    if (result.path) {
      setRotatedPath(result.path);
      onRotated();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <p
        className={cn(
          "flex items-center gap-1.5 font-mono text-[0.6rem] tracking-wider uppercase",
          graphics.overlayOnline ? "text-[#7FE0A8]" : "text-slate-500",
        )}
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            graphics.overlayOnline ? "bg-[#2E8B57]" : "bg-slate-600",
          )}
          aria-hidden="true"
        />
        {graphics.overlayOnline
          ? `Browser source attached${seen ? ` · read ${seen}` : ""}`
          : graphics.overlayLastSeenAt
            ? `No browser source · last read ${seen}`
            : "No browser source has loaded the overlay yet"}
      </p>

      <span className="ml-auto flex items-center gap-1">
        <button
          type="button"
          disabled={!url}
          onClick={() => void copy()}
          className="inline-flex items-center gap-1 rounded-sm border border-white/15 bg-white/[0.04] px-1.5 py-1 font-mono text-[0.55rem] tracking-wider text-slate-300 uppercase hover:bg-white/10 disabled:opacity-40"
        >
          {copied ? (
            <Check className="size-3" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy overlay URL"}
        </button>
        <button
          type="button"
          disabled={rotating}
          onClick={() => void rotate()}
          title="Issue a new overlay URL"
          aria-label="Issue a new overlay URL"
          className="rounded-sm border border-white/15 bg-white/[0.04] p-1 text-slate-400 hover:bg-white/10 disabled:opacity-40"
        >
          <RefreshCw className="size-3" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}
