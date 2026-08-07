"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, X } from "lucide-react";

import { StudioEmptyNote, StudioPanel } from "@/components/studio/studio-frame";
import { formatSinceLabel, useSecondTick } from "@/components/studio/studio-time";
import {
  clampSponsorDuration,
  STUDIO_SPONSOR_DURATION_DEFAULT,
  STUDIO_SPONSOR_DURATION_MAX,
  STUDIO_SPONSOR_DURATION_MIN,
  STUDIO_SPONSOR_NAME_MAX,
  STUDIO_SPONSOR_TAGLINE_MAX,
} from "@/config/broadcast-studio";
import {
  clearStudioGraphicAction,
  deleteStudioSponsorAction,
  loadSponsorPartnerOptionsAction,
  saveStudioSponsorAction,
  takeStudioSponsorAction,
} from "@/features/broadcast-studio/actions";
import type { StudioGraphicKind } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import type { StudioGraphicsState } from "@/services/studio-graphics-service";
import type {
  StudioSponsorPartnerOption,
  StudioSponsorView,
} from "@/services/studio-sponsors-service";

/**
 * The sponsor book, and the three keys that put one on the air.
 *
 * A sponsor card stores the sponsor's **id**, never a copy of its name or
 * logo, so a correction in this list is a correction on air one second later —
 * the same rule the score bug follows with the game record. Two places a
 * sponsor can land: the strap along the bottom during the show, and the
 * full-frame billboard for breaks.
 *
 * Rotation is a **Next** key, not a scheduler. Auto-advance is available but
 * runs from this console tab and says so, because a rotation that silently
 * stops when someone closes a laptop is worse than one an operator drives.
 * Nothing counts impressions.
 */

type SponsorPanelProps = {
  sponsors: StudioSponsorView[];
  graphics: StudioGraphicsState;
  /** When the snapshot behind `graphics` was read — ages out local writes. */
  fetchedAt: string;
  onChanged: () => void;
};

/** A just-saved book, held until a poll from after the write lands. */
type BookWrite = {
  savedAt: number;
  sponsors: StudioSponsorView[];
};

type Draft = {
  id: string | null;
  name: string;
  tagline: string;
  logoUrl: string;
  partnerId: string | null;
  durationSeconds: number;
  priority: number;
  isActive: boolean;
};

type SponsorRegion = Extract<StudioGraphicKind, "SPONSOR" | "SPONSOR_FULL">;

const REGION_LABELS: Record<SponsorRegion, string> = {
  SPONSOR: "Strap",
  SPONSOR_FULL: "Billboard",
};

function emptyDraft(): Draft {
  return {
    id: null,
    name: "",
    tagline: "",
    logoUrl: "",
    partnerId: null,
    durationSeconds: STUDIO_SPONSOR_DURATION_DEFAULT,
    priority: 0,
    isActive: true,
  };
}

function draftFrom(sponsor: StudioSponsorView): Draft {
  return {
    id: sponsor.id,
    name: sponsor.name,
    tagline: sponsor.tagline ?? "",
    logoUrl: sponsor.logoUrl ?? "",
    partnerId: sponsor.partnerId,
    durationSeconds: sponsor.durationSeconds,
    priority: sponsor.priority,
    isActive: sponsor.isActive,
  };
}

export function SponsorPanel({
  sponsors: serverSponsors,
  graphics,
  fetchedAt,
  onChanged,
}: SponsorPanelProps) {
  const tick = useSecondTick();
  const [region, setRegion] = useState<SponsorRegion>("SPONSOR");
  const [write, setWrite] = useState<BookWrite | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // A list write returns the whole book, so it stands in until a read from
  // after the write lands — the panel never briefly loses a sponsor someone
  // just added, and the server is authoritative again as soon as it catches up.
  const sponsors =
    write && Date.parse(fetchedAt) < write.savedAt
      ? write.sponsors
      : serverSponsors;

  const strap = graphics.items.find(
    (item) => item.kind === "SPONSOR" && item.state === "LIVE",
  );
  const billboard = graphics.items.find(
    (item) => item.kind === "SPONSOR_FULL" && item.state === "LIVE",
  );
  const liveIn = (kind: SponsorRegion) =>
    kind === "SPONSOR" ? strap : billboard;
  const liveSponsorId = liveIn(region)?.sponsorId ?? null;
  // One graphic per region (Phase 6), so there is nowhere to cue a second
  // sponsor while one is up — the panel says so rather than quietly cutting.
  const regionLive = Boolean(liveIn(region));
  const cuedSponsorId =
    graphics.items.find(
      (item) => item.kind === region && item.state === "PREVIEW",
    )?.sponsorId ?? null;

  const take = useCallback(
    async (sponsorId: string, intent: "CUE" | "TAKE") => {
      setBusy(true);
      const result = await takeStudioSponsorAction({
        sponsorId,
        kind: region,
        intent,
      });
      setBusy(false);
      setError(result.error ?? null);

      if (!result.error) {
        onChanged();
      }
    },
    [onChanged, region],
  );

  const remove = useCallback(async () => {
    setBusy(true);
    const result = await clearStudioGraphicAction({ kind: region });
    setBusy(false);
    setError(result.error ?? null);

    if (!result.error) {
      setAutoRotate(false);
      onChanged();
    }
  }, [onChanged, region]);

  // Rotation order is the book's own order, wrapping at the end, so "next" is
  // the sponsor an operator can point at in the list rather than a surprise.
  const next = async () => {
    const active = sponsors.filter((sponsor) => sponsor.isActive);
    if (active.length === 0) {
      return;
    }

    const index = active.findIndex((sponsor) => sponsor.id === liveSponsorId);
    const following = active[(index + 1) % active.length];
    if (following) {
      await take(following.id, "TAKE");
    }
  };

  const saveSponsor = useCallback(
    async (value: Draft) => {
      setBusy(true);
      const result = await saveStudioSponsorAction({
        id: value.id,
        name: value.name,
        tagline: value.tagline,
        logoUrl: value.logoUrl,
        partnerId: value.partnerId,
        durationSeconds: value.durationSeconds,
        priority: value.priority,
        isActive: value.isActive,
      });
      setBusy(false);
      setError(result.error ?? null);

      if (result.sponsors) {
        setWrite({ savedAt: Date.now(), sponsors: result.sponsors });
        setDraft(null);
        onChanged();
      }
    },
    [onChanged],
  );

  const removeSponsor = useCallback(
    async (sponsor: StudioSponsorView) => {
      if (!window.confirm(`Remove ${sponsor.name} from the sponsor book?`)) {
        return;
      }

      setBusy(true);
      const result = await deleteStudioSponsorAction({ sponsorId: sponsor.id });
      setBusy(false);
      setError(result.error ?? null);

      if (result.sponsors) {
        setWrite({ savedAt: Date.now(), sponsors: result.sponsors });
        setDraft(null);
        onChanged();
      }
    },
    [onChanged],
  );

  useSponsorRotation({
    enabled: autoRotate && Boolean(liveSponsorId),
    seconds:
      sponsors.find((sponsor) => sponsor.id === liveSponsorId)
        ?.durationSeconds ?? STUDIO_SPONSOR_DURATION_DEFAULT,
    onAdvance: () => void next(),
  });

  const liveCount = [strap, billboard].filter(Boolean).length;

  return (
    <StudioPanel
      title="Sponsors"
      meta={liveCount > 0 ? `${liveCount} on air` : `${sponsors.length}`}
      className="lg:flex-1"
    >
      <div className="flex items-center gap-1">
        {(["SPONSOR", "SPONSOR_FULL"] as SponsorRegion[]).map((kind) => {
          const live = liveIn(kind);

          return (
            <button
              key={kind}
              type="button"
              onClick={() => setRegion(kind)}
              className={cn(
                "flex-1 rounded-sm border px-2 py-1 font-mono text-[0.55rem] tracking-[0.12em] uppercase transition-colors",
                kind === region
                  ? "border-[#2F80ED]/50 bg-[#2F80ED]/15 text-[#8FBEFF]"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/10",
              )}
            >
              {REGION_LABELS[kind]}
              {live ? (
                <span
                  className="ml-1 inline-block size-1.5 rounded-full bg-[#FF3B5C] align-middle"
                  aria-label="on air"
                />
              ) : null}
            </button>
          );
        })}
      </div>

      {sponsors.length === 0 ? (
        <StudioEmptyNote>
          The sponsor book is empty. Add one below, or adopt an approved campus
          partner so the name and logo are only entered once.
        </StudioEmptyNote>
      ) : (
        <ul className="mt-2 space-y-1">
          {sponsors.map((sponsor) => {
            const live = sponsor.id === liveSponsorId;
            const cued = !live && sponsor.id === cuedSponsorId;

            return (
              <li
                key={sponsor.id}
                className={cn(
                  "rounded-sm border px-2 py-1.5",
                  live
                    ? "border-[#E11D48]/50 bg-[#E11D48]/15"
                    : cued
                      ? "border-[#2F80ED]/40 bg-[#2F80ED]/10"
                      : sponsor.isActive
                        ? "border-white/10 bg-white/[0.03]"
                        : "border-white/5 bg-white/[0.01]",
                )}
              >
                <div className="flex items-center gap-1.5">
                  {sponsor.logoUrl ? (
                    // Sponsor logos are arbitrary remote URLs; next/image would
                    // need every business host allowlisted in next.config.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.logoUrl}
                      alt=""
                      className="size-5 shrink-0 rounded-sm bg-white object-contain p-0.5"
                    />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-[0.7rem] font-semibold",
                        live
                          ? "text-[#FF8098]"
                          : sponsor.isActive
                            ? "text-slate-200"
                            : "text-slate-500",
                      )}
                    >
                      {sponsor.name}
                    </span>
                    <span className="block truncate font-mono text-[0.55rem] tracking-wider text-slate-600 uppercase">
                      {live
                        ? "On air"
                        : cued
                          ? "Cued"
                          : sponsor.isActive
                            ? `${sponsor.durationSeconds}s${sponsor.partnerName ? ` · ${sponsor.partnerName}` : ""}`
                            : "Off the book"}
                    </span>
                  </span>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setDraft(draftFrom(sponsor))}
                    aria-label={`Edit ${sponsor.name}`}
                    title={`Edit ${sponsor.name}`}
                    className="shrink-0 rounded-sm border border-white/10 p-1 text-slate-500 transition-colors hover:bg-white/10 disabled:opacity-40"
                  >
                    <Pencil className="size-3" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void removeSponsor(sponsor)}
                    aria-label={`Remove ${sponsor.name}`}
                    title={`Remove ${sponsor.name} from the book`}
                    className="shrink-0 rounded-sm border border-white/10 p-1 text-slate-500 transition-colors hover:bg-white/10 hover:text-[#FF8098] disabled:opacity-40"
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-1 flex flex-wrap gap-1">
                  <SponsorKey
                    tone="preview"
                    disabled={busy || regionLive}
                    title={
                      regionLive
                        ? "This region is on air. Take live replaces what is up; preview is only available when it is clear."
                        : `Cue ${sponsor.name} without putting it on air`
                    }
                    onClick={() => void take(sponsor.id, "CUE")}
                  >
                    Preview
                  </SponsorKey>
                  <SponsorKey
                    tone="program"
                    disabled={busy}
                    onClick={() => void take(sponsor.id, "TAKE")}
                  >
                    Take live
                  </SponsorKey>
                  {live ? (
                    <SponsorKey
                      tone="neutral"
                      disabled={busy}
                      onClick={() => void remove()}
                    >
                      Remove
                    </SponsorKey>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <SponsorKey
          tone="neutral"
          disabled={
            busy ||
            sponsors.filter((sponsor) => sponsor.isActive).length < 2
          }
          title="Take the next active sponsor in the book"
          onClick={() => void next()}
        >
          Next sponsor
        </SponsorKey>
        <label
          className={cn(
            "inline-flex items-center gap-1 rounded-sm border px-2 py-1.5 font-mono text-[0.6rem] tracking-[0.12em] uppercase",
            autoRotate
              ? "border-[#C9A227]/50 bg-[#C9A227]/15 text-[#E0B93B]"
              : "border-white/15 bg-white/[0.04] text-slate-400",
          )}
          title="Advance to the next sponsor when the current one's time is up. Runs from this console tab only."
        >
          <input
            type="checkbox"
            checked={autoRotate}
            disabled={!liveSponsorId}
            onChange={(event) => setAutoRotate(event.target.checked)}
            className="size-3 accent-[#C9A227]"
          />
          Auto
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => setDraft(draft ? null : emptyDraft())}
          className="ml-auto inline-flex items-center gap-1 rounded-sm border border-white/15 bg-white/[0.04] px-2 py-1.5 font-mono text-[0.6rem] tracking-[0.12em] text-slate-300 uppercase transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          <Plus className="size-3" aria-hidden="true" />
          {draft ? "Close" : "Add sponsor"}
        </button>
      </div>

      {draft ? (
        <SponsorEditor
          draft={draft}
          busy={busy}
          onChange={setDraft}
          onSave={() => void saveSponsor(draft)}
          onCancel={() => setDraft(null)}
        />
      ) : null}

      {error ? (
        <p
          className="mt-2 rounded-sm border border-[#E11D48]/40 bg-[#E11D48]/10 px-2 py-1.5 text-[0.65rem] leading-snug text-[#FF8098]"
          role="status"
        >
          {error}
        </p>
      ) : null}

      <StudioEmptyNote>
        Cards hold the sponsor row, not a copy of it — fixing a name or a logo
        here fixes what is on air within a second.{" "}
        {autoRotate
          ? "Auto-advance is running from this console tab; closing it stops the rotation."
          : "Rotation is the Next key, or Auto while this tab stays open."}{" "}
        Nothing counts impressions.
        {strap?.sponsor ? (
          <>
            {" "}
            Strap: {strap.sponsor.name}
            {strap.takenAt
              ? ` · ${formatSinceLabel(tick, strap.takenAt) ?? "just now"}`
              : ""}
            .
          </>
        ) : null}
      </StudioEmptyNote>
    </StudioPanel>
  );
}

/* -------------------------------------------------------------- pieces */

/**
 * Console-side auto-advance. Deliberately not a server scheduler: nothing on
 * the campus runs a timer for the studio, and pretending otherwise would leave
 * a rotation that stops when a laptop lid closes without anyone knowing why.
 */
function useSponsorRotation({
  enabled,
  seconds,
  onAdvance,
}: {
  enabled: boolean;
  seconds: number;
  onAdvance: () => void;
}) {
  const advance = useRef(onAdvance);

  useEffect(() => {
    advance.current = onAdvance;
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const timer = window.setInterval(
      () => advance.current(),
      clampSponsorDuration(seconds) * 1000,
    );

    return () => window.clearInterval(timer);
  }, [enabled, seconds]);
}

function SponsorKey({
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
        "rounded-sm border px-2 py-1 font-mono text-[0.55rem] font-semibold tracking-[0.12em] uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        tones[tone],
        className,
      )}
    >
      {children}
    </button>
  );
}

function SponsorEditor({
  draft,
  busy,
  onChange,
  onSave,
  onCancel,
}: {
  draft: Draft;
  busy: boolean;
  onChange: (draft: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [partners, setPartners] = useState<StudioSponsorPartnerOption[] | null>(
    null,
  );
  const [loadingPartners, setLoadingPartners] = useState(false);

  const loadPartners = async () => {
    setLoadingPartners(true);
    const result = await loadSponsorPartnerOptionsAction();
    setLoadingPartners(false);
    setPartners(result.partners ?? []);
  };

  return (
    <div className="mt-2 space-y-1.5 rounded-sm border border-white/10 bg-white/[0.02] p-2">
      <Field
        label="Sponsor"
        value={draft.name}
        maxLength={STUDIO_SPONSOR_NAME_MAX}
        placeholder="Hometown Hardware"
        onChange={(name) => onChange({ ...draft, name })}
      />
      <Field
        label="Line"
        value={draft.tagline}
        maxLength={STUDIO_SPONSOR_TAGLINE_MAX}
        placeholder="Proud to back the Dons"
        onChange={(tagline) => onChange({ ...draft, tagline })}
      />
      <Field
        label="Logo URL"
        value={draft.logoUrl}
        placeholder="https://…/logo.png"
        onChange={(logoUrl) => onChange({ ...draft, logoUrl })}
      />

      {partners === null ? (
        <button
          type="button"
          disabled={loadingPartners}
          onClick={() => void loadPartners()}
          className="w-full rounded-sm border border-white/15 px-2 py-1 font-mono text-[0.55rem] tracking-wider text-slate-300 uppercase hover:bg-white/10 disabled:opacity-40"
        >
          {loadingPartners ? "Reading partners…" : "Adopt a campus partner"}
        </button>
      ) : (
        <label className="block">
          <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
            Campus partner
          </span>
          <select
            value={draft.partnerId ?? ""}
            onChange={(event) => {
              const partner = partners.find(
                (option) => option.id === event.target.value,
              );
              onChange({
                ...draft,
                partnerId: partner?.id ?? null,
                name: partner?.name ?? draft.name,
                logoUrl: partner?.logoUrl ?? draft.logoUrl,
              });
            }}
            className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.7rem] text-slate-200 focus:border-[#2F80ED] focus:outline-none"
          >
            <option value="" className="bg-[#0C1A2E]">
              Not from the directory
            </option>
            {partners.map((partner) => (
              <option
                key={partner.id}
                value={partner.id}
                disabled={partner.adopted && partner.id !== draft.partnerId}
                className="bg-[#0C1A2E]"
              >
                {partner.name}
                {partner.adopted && partner.id !== draft.partnerId
                  ? " · already in the book"
                  : ""}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="flex gap-1.5">
        <label className="flex-1">
          <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
            Seconds
          </span>
          <input
            type="number"
            min={STUDIO_SPONSOR_DURATION_MIN}
            max={STUDIO_SPONSOR_DURATION_MAX}
            value={draft.durationSeconds}
            onChange={(event) =>
              onChange({
                ...draft,
                durationSeconds: Number(event.target.value),
              })
            }
            className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.75rem] text-slate-100 focus:border-[#2F80ED] focus:outline-none"
          />
        </label>
        <label className="flex-1">
          <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
            Order
          </span>
          <input
            type="number"
            min={0}
            value={draft.priority}
            onChange={(event) =>
              onChange({ ...draft, priority: Number(event.target.value) })
            }
            className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.75rem] text-slate-100 focus:border-[#2F80ED] focus:outline-none"
          />
        </label>
      </div>

      <label className="flex items-center gap-1.5 text-[0.65rem] text-slate-300">
        <input
          type="checkbox"
          checked={draft.isActive}
          onChange={(event) =>
            onChange({ ...draft, isActive: event.target.checked })
          }
          className="size-3 accent-[#2F80ED]"
        />
        In tonight&apos;s rotation
      </label>

      <div className="flex gap-1 pt-0.5">
        <SponsorKey
          tone="preview"
          disabled={busy || draft.name.trim().length === 0}
          onClick={onSave}
        >
          {draft.id ? "Save sponsor" : "Add to book"}
        </SponsorKey>
        <SponsorKey tone="neutral" disabled={busy} onClick={onCancel}>
          Cancel
        </SponsorKey>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  maxLength?: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-0.5 block font-mono text-[0.55rem] tracking-[0.15em] text-slate-500 uppercase">
        {label}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-full rounded-sm border border-white/15 bg-white/5 px-2 text-[0.75rem] text-slate-100 placeholder:text-slate-600 focus:border-[#2F80ED] focus:outline-none"
      />
    </label>
  );
}
