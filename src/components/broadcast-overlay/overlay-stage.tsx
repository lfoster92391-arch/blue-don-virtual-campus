"use client";

import { useEffect, useRef, useState } from "react";

import { useSecondTick } from "@/components/studio/studio-time";
import {
  STUDIO_GRAPHIC_DEFS,
  type StudioGraphicRegion,
} from "@/config/broadcast-studio";
import { cn } from "@/lib/utils";
import type { StudioOverlayGraphic } from "@/services/broadcast-studio-service";
import type { StudioGraphicClock } from "@/services/studio-graphics-service";

/**
 * The 16:9 graphics stage, rendered both full-frame in the OBS Browser Source
 * and shrunk into the console's preview monitor.
 *
 * Every size below is in `cqw` — one percent of the stage's own width — so the
 * same markup is correct at 1920 px and at 320 px. That is what lets the
 * operator preview exactly what the audience will get instead of a mock-up.
 */

const EXIT_MS = 420;

export function OverlayStage({
  graphics,
  className,
}: {
  graphics: StudioOverlayGraphic[];
  className?: string;
}) {
  const visible = useOverlayTransitions(graphics);

  return (
    <div
      className={cn(
        "@container relative h-full w-full overflow-hidden font-sans",
        className,
      )}
    >
      {visible.map((entry) => (
        <RegionSlot key={entry.animationKey} entry={entry} />
      ))}
    </div>
  );
}

type StageEntry = {
  graphic: StudioOverlayGraphic;
  /** Key that changes on a re-take, so the animation replays. */
  animationKey: string;
  leaving: boolean;
};

/**
 * Keeps a removed graphic mounted long enough to animate out. Broadcast
 * graphics that vanish between frames read as a glitch, not as a clear.
 */
function useOverlayTransitions(graphics: StudioOverlayGraphic[]): StageEntry[] {
  const [leaving, setLeaving] = useState<StageEntry[]>([]);
  const previous = useRef<StudioOverlayGraphic[]>([]);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const goneNow = previous.current.filter(
      (before) => !graphics.some((graphic) => graphic.id === before.id),
    );
    previous.current = graphics;

    if (goneNow.length === 0) {
      return;
    }

    const isGone = (id: string) => goneNow.some((gone) => gone.id === id);

    setLeaving((current) => [
      ...current.filter((entry) => !isGone(entry.graphic.id)),
      ...goneNow.map((graphic) => ({
        graphic,
        animationKey: `${graphic.id}:leaving`,
        leaving: true,
      })),
    ]);

    const pending = timers.current;
    const timer = window.setTimeout(() => {
      pending.delete(timer);
      setLeaving((current) =>
        current.filter((entry) => !isGone(entry.graphic.id)),
      );
    }, EXIT_MS);
    pending.add(timer);
  }, [graphics]);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const live = graphics.map((graphic) => ({
    graphic,
    animationKey: `${graphic.id}:${graphic.takenAt ?? "cued"}`,
    leaving: false,
  }));

  // A graphic that came back before its exit finished is live again.
  return [
    ...leaving.filter(
      (entry) => !graphics.some((graphic) => graphic.id === entry.graphic.id),
    ),
    ...live,
  ];
}

const REGION_POSITION: Record<StudioGraphicRegion, string> = {
  LOWER: "absolute bottom-[8cqw] left-[5cqw] max-w-[62cqw] origin-bottom-left",
  BUG: "absolute top-[3cqw] left-[3cqw] origin-top-left",
  FULL: "absolute inset-0 flex items-center justify-center",
};

const REGION_ENTER: Record<StudioGraphicRegion, string> = {
  LOWER: "animate-in fade-in slide-in-from-left-8 duration-500 ease-out",
  BUG: "animate-in fade-in slide-in-from-top-4 duration-500 ease-out",
  FULL: "animate-in fade-in zoom-in-95 duration-500 ease-out",
};

const REGION_EXIT: Record<StudioGraphicRegion, string> = {
  LOWER: "animate-out fade-out slide-out-to-left-8 duration-300 ease-in",
  BUG: "animate-out fade-out slide-out-to-top-4 duration-300 ease-in",
  FULL: "animate-out fade-out zoom-out-95 duration-300 ease-in",
};

function RegionSlot({ entry }: { entry: StageEntry }) {
  const { graphic, leaving } = entry;

  return (
    <div
      className={cn(
        REGION_POSITION[graphic.region],
        leaving ? REGION_EXIT[graphic.region] : REGION_ENTER[graphic.region],
      )}
      style={{ animationFillMode: "both" }}
    >
      <GraphicBody graphic={graphic} />
    </div>
  );
}

function GraphicBody({ graphic }: { graphic: StudioOverlayGraphic }) {
  switch (graphic.kind) {
    case "SCORE_BUG":
      return <ScoreBug graphic={graphic} />;
    case "LINEUP":
      return <LineupCard graphic={graphic} />;
    case "GAME_ANNOUNCEMENT":
      return <GameAnnouncementCard graphic={graphic} />;
    case "FINAL_SCORE":
      return <FinalScoreCard graphic={graphic} />;
    case "ANNOUNCEMENT":
      return <AnnouncementStrap graphic={graphic} />;
    case "SPONSOR":
      return <SponsorStrap graphic={graphic} />;
    case "SPONSOR_FULL":
      return <SponsorBillboard graphic={graphic} />;
    default:
      return <LowerThird graphic={graphic} />;
  }
}

/* ------------------------------------------------------------ furniture */

const NAVY = "#0A2342";
const GOLD = "#C9A227";

/** The gold rule every card shares, so the package reads as one show. */
function AccentBar() {
  return (
    <span
      aria-hidden="true"
      className="block w-[0.5cqw] shrink-0 self-stretch rounded-full"
      style={{ backgroundColor: GOLD }}
    />
  );
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-stretch gap-[1cqw] shadow-2xl", className)}
      style={{ backgroundColor: `${NAVY}F2` }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-semibold uppercase"
      style={{
        color: GOLD,
        fontSize: "1.05cqw",
        letterSpacing: "0.28em",
      }}
    >
      {children}
    </p>
  );
}

/* --------------------------------------------------------------- cards */

/** Lower third, player ID, and anything else that names a person. */
function LowerThird({ graphic }: { graphic: StudioOverlayGraphic }) {
  const { title, subtitle, detail, note } = graphic.fields;
  const def = STUDIO_GRAPHIC_DEFS[graphic.kind];

  return (
    <Panel className="rounded-r-[0.4cqw]">
      <AccentBar />
      <div className="py-[1.4cqw] pr-[3cqw] pl-[1.4cqw]">
        {note ? <Eyebrow>{note}</Eyebrow> : null}
        <p
          className="font-semibold text-white"
          style={{ fontSize: "3cqw", lineHeight: 1.05 }}
        >
          {title ?? def.label}
        </p>
        {subtitle ? (
          <p
            className="text-white/85"
            style={{ fontSize: "1.6cqw", lineHeight: 1.3 }}
          >
            {subtitle}
          </p>
        ) : null}
        {detail ? (
          <p
            className="uppercase"
            style={{
              color: GOLD,
              fontSize: "1.2cqw",
              letterSpacing: "0.12em",
              marginTop: "0.4cqw",
            }}
          >
            {detail}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

function AnnouncementStrap({ graphic }: { graphic: StudioOverlayGraphic }) {
  const { title, subtitle, note } = graphic.fields;

  return (
    <Panel className="rounded-r-[0.4cqw]">
      <span
        aria-hidden="true"
        className="flex items-center px-[1.2cqw] font-semibold uppercase"
        style={{
          backgroundColor: GOLD,
          color: NAVY,
          fontSize: "1.2cqw",
          letterSpacing: "0.2em",
        }}
      >
        {note ?? "Announcement"}
      </span>
      <div className="py-[1.3cqw] pr-[3cqw] pl-[1.4cqw]">
        <p
          className="font-semibold text-white"
          style={{ fontSize: "2.4cqw", lineHeight: 1.1 }}
        >
          {title ?? ""}
        </p>
        {subtitle ? (
          <p className="text-white/85" style={{ fontSize: "1.5cqw" }}>
            {subtitle}
          </p>
        ) : null}
      </div>
    </Panel>
  );
}

/**
 * Sponsor copy for a card: the book's row when one is attached, and whatever
 * the operator typed in the Graphics panel otherwise. The book wins, so
 * correcting a name there corrects every card that points at it.
 */
function sponsorCopy(graphic: StudioOverlayGraphic) {
  const { title, subtitle, note } = graphic.fields;

  return {
    name: graphic.sponsor?.name ?? title ?? "",
    line: graphic.sponsor?.tagline ?? subtitle,
    tag: note ?? "Tonight's sponsor",
    logoUrl: graphic.sponsor?.logoUrl ?? null,
  };
}

function SponsorLogo({ url, height }: { url: string; height: string }) {
  return (
    // Sponsor logos are arbitrary remote URLs; next/image would need every
    // business host allowlisted in next.config.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt=""
      className="shrink-0 rounded-[0.3cqw] bg-white object-contain"
      style={{ height, maxWidth: "22cqw", padding: "0.4cqw" }}
    />
  );
}

function SponsorStrap({ graphic }: { graphic: StudioOverlayGraphic }) {
  const { name, line, tag, logoUrl } = sponsorCopy(graphic);

  return (
    <Panel className="items-center rounded-[0.4cqw]">
      <AccentBar />
      <div className="flex items-center gap-[1.4cqw] py-[1.2cqw] pr-[2.6cqw] pl-[1.2cqw]">
        {logoUrl ? <SponsorLogo url={logoUrl} height="4.4cqw" /> : null}
        <div>
          <Eyebrow>{tag}</Eyebrow>
          <p
            className="font-semibold text-white"
            style={{ fontSize: "2.2cqw", lineHeight: 1.1 }}
          >
            {name}
          </p>
          {line ? (
            <p className="text-white/80" style={{ fontSize: "1.3cqw" }}>
              {line}
            </p>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

/** The break card: one sponsor, full frame, logo first. */
function SponsorBillboard({ graphic }: { graphic: StudioOverlayGraphic }) {
  const { name, line, tag, logoUrl } = sponsorCopy(graphic);

  return (
    <div
      className="flex w-[52cqw] flex-col items-center gap-[1.4cqw] rounded-[0.6cqw] px-[4cqw] py-[3cqw] text-center shadow-2xl"
      style={{ backgroundColor: `${NAVY}F5` }}
    >
      <Eyebrow>{tag}</Eyebrow>
      {logoUrl ? <SponsorLogo url={logoUrl} height="12cqw" /> : null}
      <p
        className="font-semibold text-white"
        style={{ fontSize: "3.4cqw", lineHeight: 1.1 }}
      >
        {name}
      </p>
      {line ? (
        <p className="text-white/85" style={{ fontSize: "1.6cqw" }}>
          {line}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Corner score bug. The score comes from the resolved `SportsGame` row, and the
 * clock runs locally from the anchor the console pushed — the console does not
 * write a row every second.
 */
function ScoreBug({ graphic }: { graphic: StudioOverlayGraphic }) {
  const board = graphic.scoreboard;
  const clock = useRunningClock(graphic.fields.clock);

  if (!board) {
    return null;
  }

  return (
    <div
      className="overflow-hidden rounded-[0.4cqw] shadow-2xl"
      style={{ backgroundColor: `${NAVY}F2` }}
    >
      <div className="flex items-stretch">
        <div className="flex flex-col justify-center gap-[0.35cqw] py-[0.9cqw] pr-[1.2cqw] pl-[1.2cqw]">
          <ScoreLine label={board.awayLabel} score={board.awayScore} />
          <ScoreLine label={board.homeLabel} score={board.homeScore} />
        </div>
        {clock || graphic.fields.clock?.period ? (
          <div
            className="flex flex-col items-center justify-center gap-[0.2cqw] px-[1.2cqw]"
            style={{ backgroundColor: `${GOLD}26` }}
          >
            {graphic.fields.clock?.period ? (
              <span
                className="font-semibold uppercase"
                style={{
                  color: GOLD,
                  fontSize: "1cqw",
                  letterSpacing: "0.18em",
                }}
              >
                {periodLabel(graphic.fields.clock.period)}
              </span>
            ) : null}
            {clock ? (
              <span
                className="font-semibold text-white tabular-nums"
                style={{ fontSize: "1.8cqw" }}
              >
                {clock}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
      {graphic.fields.note ? (
        <p
          className="px-[1.2cqw] py-[0.35cqw] font-semibold uppercase"
          style={{
            backgroundColor: GOLD,
            color: NAVY,
            fontSize: "0.85cqw",
            letterSpacing: "0.2em",
          }}
        >
          {graphic.fields.note}
        </p>
      ) : null}
    </div>
  );
}

function ScoreLine({
  label,
  score,
}: {
  label: string;
  score: number | null;
}) {
  return (
    <div className="flex items-center gap-[1.6cqw]">
      <span
        className="font-semibold text-white uppercase"
        style={{ fontSize: "1.4cqw", letterSpacing: "0.08em" }}
      >
        {label}
      </span>
      <span
        className="ml-auto font-semibold text-white tabular-nums"
        style={{ fontSize: "1.8cqw" }}
      >
        {score ?? 0}
      </span>
    </div>
  );
}

function LineupCard({ graphic }: { graphic: StudioOverlayGraphic }) {
  const { title, subtitle, entries } = graphic.fields;

  return (
    <div
      className="w-[58cqw] overflow-hidden rounded-[0.6cqw] shadow-2xl"
      style={{ backgroundColor: `${NAVY}F5` }}
    >
      <div
        className="px-[2.4cqw] py-[1.4cqw]"
        style={{ borderBottom: `0.2cqw solid ${GOLD}` }}
      >
        <p
          className="font-semibold text-white"
          style={{ fontSize: "2.6cqw", lineHeight: 1.1 }}
        >
          {title ?? "Starting lineup"}
        </p>
        {subtitle ? <Eyebrow>{subtitle}</Eyebrow> : null}
      </div>
      <ul className="grid grid-cols-2 gap-x-[2.4cqw] gap-y-[0.6cqw] px-[2.4cqw] py-[1.6cqw]">
        {entries.map((entry, index) => (
          <li
            key={`${entry.name}-${index}`}
            className="flex items-baseline gap-[1cqw]"
          >
            <span
              className="font-semibold tabular-nums"
              style={{ color: GOLD, fontSize: "1.5cqw", minWidth: "3cqw" }}
            >
              {entry.number ? `#${entry.number}` : ""}
            </span>
            <span
              className="font-medium text-white"
              style={{ fontSize: "1.5cqw" }}
            >
              {entry.name}
            </span>
            {entry.detail ? (
              <span
                className="text-white/70 uppercase"
                style={{ fontSize: "1.1cqw", letterSpacing: "0.1em" }}
              >
                {entry.detail}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GameAnnouncementCard({ graphic }: { graphic: StudioOverlayGraphic }) {
  const board = graphic.scoreboard;
  const { title, note } = graphic.fields;

  return (
    <div
      className="w-[54cqw] rounded-[0.6cqw] px-[3cqw] py-[2.4cqw] text-center shadow-2xl"
      style={{ backgroundColor: `${NAVY}F5` }}
    >
      <Eyebrow>{title ?? "Tonight on MHS Broadcasting"}</Eyebrow>
      <p
        className="mt-[0.8cqw] font-semibold text-white"
        style={{ fontSize: "3.2cqw", lineHeight: 1.1 }}
      >
        {board ? `${board.awayLabel} at ${board.homeLabel}` : (note ?? "")}
      </p>
      {board ? (
        <p
          className="mt-[0.6cqw] text-white/80"
          style={{ fontSize: "1.5cqw" }}
        >
          {[board.sportName, board.level, board.venue]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}
      {board && note ? (
        <p
          className="mt-[0.8cqw] font-medium"
          style={{ color: GOLD, fontSize: "1.5cqw" }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

function FinalScoreCard({ graphic }: { graphic: StudioOverlayGraphic }) {
  const board = graphic.scoreboard;
  const { title, note } = graphic.fields;

  if (!board) {
    return null;
  }

  return (
    <div
      className="w-[52cqw] rounded-[0.6cqw] px-[3cqw] py-[2.4cqw] shadow-2xl"
      style={{ backgroundColor: `${NAVY}F5` }}
    >
      <Eyebrow>{title ?? board.statusLabel}</Eyebrow>
      <div className="mt-[1.2cqw] space-y-[0.8cqw]">
        <FinalLine label={board.awayLabel} score={board.awayScore} />
        <FinalLine label={board.homeLabel} score={board.homeScore} />
      </div>
      <p
        className="mt-[1.4cqw] text-white/75"
        style={{ fontSize: "1.3cqw" }}
      >
        {note ?? [board.sportName, board.venue].filter(Boolean).join(" · ")}
      </p>
    </div>
  );
}

function FinalLine({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="flex items-baseline gap-[2cqw]">
      <span
        className="flex-1 font-semibold text-white uppercase"
        style={{ fontSize: "2.4cqw", letterSpacing: "0.06em" }}
      >
        {label}
      </span>
      <span
        className="font-semibold tabular-nums"
        style={{ color: GOLD, fontSize: "3cqw" }}
      >
        {score ?? 0}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- clock */

function periodLabel(period: string): string {
  return /^\d+$/.test(period) ? `${ordinal(Number(period))}` : period;
}

function ordinal(value: number): string {
  const suffix =
    value % 10 === 1 && value % 100 !== 11
      ? "st"
      : value % 10 === 2 && value % 100 !== 12
        ? "nd"
        : value % 10 === 3 && value % 100 !== 13
          ? "rd"
          : "th";
  return `${value}${suffix}`;
}

/**
 * Runs the pushed clock forward locally. The console sends an anchor — seconds
 * left at a moment — and the overlay counts down from it, so a running clock
 * costs one write instead of one per second and still re-syncs every poll.
 */
function useRunningClock(clock: StudioGraphicClock | null): string | null {
  const tick = useSecondTick();

  if (!clock) {
    return null;
  }

  if (!clock.running) {
    return formatClockSeconds(clock.seconds);
  }

  const elapsed = tick
    ? Math.floor((tick - Date.parse(clock.at)) / 1000)
    : 0;

  return formatClockSeconds(clock.seconds - Math.max(0, elapsed));
}

function formatClockSeconds(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
