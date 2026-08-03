"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Flame, Sparkles } from "lucide-react";

import type { SignatureKind, SignatureTool } from "@/config/club-workspaces";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignatureToolCardProps = {
  tool: SignatureTool;
  accent: string;
  soft: string;
};

/** Renders a club's signature interactive widget, dispatched by kind. */
export function SignatureToolCard({ tool, accent, soft }: SignatureToolCardProps) {
  return (
    <section
      className="rounded-xl border border-border p-6"
      style={{ backgroundColor: soft }}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          {tool.icon}
        </span>
        <div>
          <p
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide"
            style={{ color: accent }}
          >
            <Sparkles className="size-3.5" aria-hidden="true" />
            Signature Tool
          </p>
          <h3 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            {tool.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      <div className="mt-5">
        <SignatureWidget kind={tool.kind} accent={accent} />
      </div>
    </section>
  );
}

function SignatureWidget({ kind, accent }: { kind: SignatureKind; accent: string }) {
  switch (kind) {
    case "impact-counter":
      return <ImpactCounter accent={accent} />;
    case "spirit-meter":
      return <SpiritMeter accent={accent} />;
    case "chess-puzzle":
      return <ChessPuzzle accent={accent} />;
    case "decision-simulator":
      return <DecisionSimulator accent={accent} />;
    case "proposal-flow":
      return <ProposalFlow accent={accent} />;
    case "prayer-requests":
      return <PrayerRequests accent={accent} />;
    case "character-builder":
      return <CharacterBuilder accent={accent} />;
    case "gallery-walkthrough":
      return <GalleryWalkthrough accent={accent} />;
    case "experiment-vault":
      return <ExperimentVault accent={accent} />;
    case "mentor-center":
      return <MentorCenter accent={accent} />;
    case "innovation-lab":
      return <InnovationLab accent={accent} />;
    default:
      return <GenericToolkit accent={accent} />;
  }
}

function useCountUp(target: number, active: boolean, durationMs = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, durationMs]);
  return value;
}

function ImpactCounter({ accent }: { accent: string }) {
  const [running, setRunning] = useState(true);
  const hours = useCountUp(1240, running);
  const projects = useCountUp(18, running);
  const served = useCountUp(3200, running);

  const stats = [
    { label: "Service hours", value: hours.toLocaleString() },
    { label: "Projects completed", value: projects.toLocaleString() },
    { label: "People served", value: served.toLocaleString() },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg bg-card p-4 text-center">
            <p className="text-3xl font-bold" style={{ color: accent }}>
              {stat.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => {
          setRunning(false);
          requestAnimationFrame(() => setRunning(true));
        }}
      >
        <Sparkles className="size-4" />
        Replay counter
      </Button>
    </div>
  );
}

function SpiritMeter({ accent }: { accent: string }) {
  const [energy, setEnergy] = useState(42);
  const label =
    energy >= 100
      ? "🔥 ROOF IS ON FIRE!"
      : energy >= 75
        ? "Deafening!"
        : energy >= 50
          ? "Loud & proud"
          : energy >= 25
            ? "Warming up"
            : "Quiet crowd";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-[#0A2342] dark:text-white">{label}</span>
        <span className="text-muted-foreground">{energy}%</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-card">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${energy}%`, backgroundColor: accent }}
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          onClick={() => setEnergy((e) => Math.min(100, e + Math.floor(Math.random() * 8) + 6))}
          style={{ backgroundColor: accent }}
        >
          <Flame className="size-4" />
          Bring the noise!
        </Button>
        <Button variant="outline" size="sm" onClick={() => setEnergy(42)}>
          Reset
        </Button>
      </div>
    </div>
  );
}

function ChessPuzzle({ accent }: { accent: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="rounded-lg bg-card p-4">
      <p className="text-sm font-medium text-[#0A2342] dark:text-white">
        Today&apos;s tactic · White to move, mate in 2
      </p>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        Position: Qd1, Rf1, Kg1 · Black: Kg8, pawns f7/g7/h7
      </p>
      <div className="mt-3 grid grid-cols-8 overflow-hidden rounded border border-border">
        {Array.from({ length: 64 }).map((_, i) => {
          const row = Math.floor(i / 8);
          const dark = (row + i) % 2 === 1;
          return (
            <div
              key={i}
              className="aspect-square"
              style={{ backgroundColor: dark ? accent : "#f1f5f9" }}
            />
          );
        })}
      </div>
      {revealed ? (
        <p className="mt-3 rounded-md bg-muted p-2 text-sm text-[#0A2342] dark:text-white">
          <strong>Coach&apos;s line:</strong> 1. Qd8+ Rxd8 2. Rf8# — back-rank mate.
        </p>
      ) : (
        <Button
          size="sm"
          className="mt-3"
          style={{ backgroundColor: accent }}
          onClick={() => setRevealed(true)}
        >
          Reveal solution
        </Button>
      )}
    </div>
  );
}

const DECISION_SCENARIOS = [
  {
    prompt: "A friend who's been drinking offers you a ride home. What do you do?",
    choices: [
      { label: "Take the ride — it's not far", good: false, outcome: "Risky. Impaired driving is dangerous at any distance. Call a trusted adult or rideshare instead." },
      { label: "Call a parent / trusted adult", good: true, outcome: "Smart call. You stayed safe and modeled a good decision for others." },
      { label: "Offer to drive if you're sober", good: true, outcome: "Great — a sober driver keeps everyone safe. Bonus: help your friend get home too." },
    ],
  },
  {
    prompt: "Group chat is spreading a rumor about a classmate. Your move?",
    choices: [
      { label: "Add a joke to fit in", good: false, outcome: "That fuels harm. Bystanders shape what's acceptable — you can set a better tone." },
      { label: "Privately check on the classmate", good: true, outcome: "Kind and courageous. Support matters more than the crowd." },
      { label: "Ask the group to stop", good: true, outcome: "Speaking up can flip the whole room. Well done." },
    ],
  },
];

function DecisionSimulator({ accent }: { accent: string }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const scenario = DECISION_SCENARIOS[index]!;
  const choice = picked !== null ? scenario.choices[picked] : null;

  return (
    <div className="rounded-lg bg-card p-4">
      <p className="text-sm font-medium text-[#0A2342] dark:text-white">
        {scenario.prompt}
      </p>
      <div className="mt-3 space-y-2">
        {scenario.choices.map((c, i) => (
          <button
            key={c.label}
            type="button"
            onClick={() => setPicked(i)}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-left text-sm transition-colors",
              picked === i
                ? "text-white"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
            style={picked === i ? { backgroundColor: accent, borderColor: accent } : undefined}
          >
            {c.label}
          </button>
        ))}
      </div>
      {choice ? (
        <p
          className={cn(
            "mt-3 rounded-md p-2 text-sm",
            choice.good ? "bg-[#059669]/10 text-[#059669]" : "bg-[#E4572E]/10 text-[#E4572E]",
          )}
        >
          {choice.good ? "✅ " : "⚠️ "}
          {choice.outcome}
        </p>
      ) : null}
      <Button
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => {
          setPicked(null);
          setIndex((i) => (i + 1) % DECISION_SCENARIOS.length);
        }}
      >
        Next scenario
        <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}

const PROPOSAL_STAGES = ["Submitted", "Student vote", "Admin approval", "Public progress"];

function ProposalFlow({ accent }: { accent: string }) {
  const [stage, setStage] = useState(1);
  const [votes, setVotes] = useState(84);
  const [voted, setVoted] = useState(false);

  return (
    <div className="rounded-lg bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-[#0A2342] dark:text-white">
          Proposal: &ldquo;Add a water-bottle refill station in the gym&rdquo;
        </p>
      </div>

      <ol className="mt-4 flex items-center">
        {PROPOSAL_STAGES.map((s, i) => (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className="flex size-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: i <= stage ? accent : "var(--muted)" }}
              >
                {i < stage ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="mt-1 max-w-[4.5rem] text-center text-[0.65rem] text-muted-foreground">
                {s}
              </span>
            </div>
            {i < PROPOSAL_STAGES.length - 1 ? (
              <span
                className="mx-1 h-0.5 flex-1"
                style={{ backgroundColor: i < stage ? accent : "var(--border)" }}
              />
            ) : null}
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={voted}
          style={{ backgroundColor: accent }}
          onClick={() => {
            setVotes((v) => v + 1);
            setVoted(true);
            setStage((s) => Math.max(s, 1));
          }}
        >
          👍 Vote {voted ? "· counted" : ""} ({votes})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStage((s) => Math.min(PROPOSAL_STAGES.length - 1, s + 1))}
        >
          Advance stage
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

const SEED_PRAYERS = [
  { text: "For my grandmother's recovery 🙏", candles: 12, approved: true },
  { text: "Strength for finals week", candles: 8, approved: true },
  { text: "Peace for a friend going through a hard time", candles: 15, approved: true },
];

function PrayerRequests({ accent }: { accent: string }) {
  const [requests, setRequests] = useState(SEED_PRAYERS);
  const [draft, setDraft] = useState("");

  return (
    <div className="rounded-lg bg-card p-4">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share an intention (moderated)…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2"
          style={{ "--tw-ring-color": accent } as React.CSSProperties}
        />
        <Button
          size="sm"
          style={{ backgroundColor: accent }}
          disabled={draft.trim().length === 0}
          onClick={() => {
            setRequests((r) => [{ text: draft.trim(), candles: 0, approved: false }, ...r]);
            setDraft("");
          }}
        >
          Post
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {requests.map((req, i) => (
          <li
            key={`${req.text}-${i}`}
            className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm"
          >
            <span className="min-w-0 truncate text-[#0A2342] dark:text-white">
              {req.text}
              {!req.approved ? (
                <span className="ml-2 rounded-full bg-[#D4A017]/15 px-2 py-0.5 text-xs text-[#D4A017]">
                  pending review
                </span>
              ) : null}
            </span>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() =>
                setRequests((r) =>
                  r.map((item, idx) =>
                    idx === i ? { ...item, candles: item.candles + 1 } : item,
                  ),
                )
              }
            >
              🕯️ {req.candles}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CharacterBuilder({ accent }: { accent: string }) {
  const [name, setName] = useState("");
  const [want, setWant] = useState("");
  const [flaw, setFlaw] = useState("");
  const built = name && want;

  const field = (
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder: string,
  ) => (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => setter(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
        style={{ "--tw-ring-color": accent } as React.CSSProperties}
      />
    </label>
  );

  return (
    <div className="rounded-lg bg-card p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {field("Character name", name, setName, "e.g. Beatrice")}
        {field("What they want", want, setWant, "e.g. to be seen")}
        {field("Their flaw", flaw, setFlaw, "e.g. too proud")}
      </div>
      {built ? (
        <div className="mt-4 rounded-md bg-muted p-3 text-sm">
          <p className="font-semibold text-[#0A2342] dark:text-white">{name}</p>
          <p className="mt-1 text-muted-foreground">
            Objective: <span className="text-foreground">{want}</span>.{" "}
            {flaw ? (
              <>
                Their <span className="text-foreground">{flaw}</span> gets in the way — that
                tension is your character&apos;s arc.
              </>
            ) : (
              "Add a flaw to shape their arc."
            )}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Fill in a name and objective to generate a character sketch for auditions.
        </p>
      )}
    </div>
  );
}

const GALLERY_PIECES = [
  { emoji: "🌅", title: "Sunrise Study", artist: "Grade 11" },
  { emoji: "🎭", title: "Masks", artist: "Grade 10" },
  { emoji: "🏙️", title: "City in Ink", artist: "Grade 12" },
  { emoji: "🌿", title: "Botanical", artist: "Grade 9" },
];

function GalleryWalkthrough({ accent }: { accent: string }) {
  const [i, setI] = useState(0);
  const piece = GALLERY_PIECES[i]!;
  return (
    <div className="rounded-lg bg-card p-4">
      <div
        className="flex aspect-video flex-col items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1a` }}
      >
        <span className="text-6xl" aria-hidden="true">
          {piece.emoji}
        </span>
        <p className="mt-2 font-semibold text-[#0A2342] dark:text-white">{piece.title}</p>
        <p className="text-xs text-muted-foreground">{piece.artist}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setI((v) => (v - 1 + GALLERY_PIECES.length) % GALLERY_PIECES.length)}
        >
          ← Prev
        </Button>
        <span className="text-xs text-muted-foreground">
          {i + 1} / {GALLERY_PIECES.length}
        </span>
        <Button
          size="sm"
          style={{ backgroundColor: accent }}
          onClick={() => setI((v) => (v + 1) % GALLERY_PIECES.length)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
}

const EXPERIMENTS = [
  { name: "Elephant Toothpaste", steps: "Mix warm water, yeast, and hydrogen peroxide with dish soap. Observe the exothermic foam reaction.", safety: "Goggles + gloves. Adult supervision." },
  { name: "Density Tower", steps: "Layer honey, dish soap, water, and oil by density. Drop small objects to test where they settle.", safety: "No open flame. Wipe spills." },
  { name: "Chromatography", steps: "Draw a marker dot on filter paper, dip the edge in water, and watch pigments separate.", safety: "Ventilated area." },
];

function ExperimentVault({ accent }: { accent: string }) {
  const [unlocked, setUnlocked] = useState<number | null>(null);
  return (
    <div className="space-y-2">
      {EXPERIMENTS.map((exp, i) => (
        <div key={exp.name} className="rounded-lg bg-card p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => setUnlocked((u) => (u === i ? null : i))}
          >
            <span className="text-sm font-medium text-[#0A2342] dark:text-white">
              🔐 {exp.name}
            </span>
            <span className="text-xs" style={{ color: accent }}>
              {unlocked === i ? "Hide" : "Unlock"}
            </span>
          </button>
          {unlocked === i ? (
            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Steps:</strong> {exp.steps}
              </p>
              <p>
                <strong className="text-foreground">Safety:</strong> {exp.safety}
              </p>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function MentorCenter({ accent }: { accent: string }) {
  const [role, setRole] = useState<"mentor" | "mentee">("mentee");
  const match =
    role === "mentee"
      ? { name: "A. Rivera (Sr.)", focus: "AP Chemistry + college apps" }
      : { name: "J. Park (Fr.)", focus: "Study skills + finding clubs" };
  return (
    <div className="rounded-lg bg-card p-4">
      <div className="inline-flex rounded-lg border border-border p-1">
        {(["mentee", "mentor"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium capitalize transition-colors",
              role === r ? "text-white" : "text-muted-foreground",
            )}
            style={role === r ? { backgroundColor: accent } : undefined}
          >
            I&apos;m a {r}
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-md bg-muted p-3 text-sm">
        <p className="font-semibold text-[#0A2342] dark:text-white">
          Suggested match: {match.name}
        </p>
        <p className="mt-1 text-muted-foreground">Focus: {match.focus}</p>
        <p className="mt-1 text-muted-foreground">Next session: this Thursday · Library</p>
      </div>
    </div>
  );
}

function InnovationLab({ accent }: { accent: string }) {
  const [ideas, setIdeas] = useState([
    { text: "Hallway digital signage app", stage: "Prototype" },
    { text: "Lost & found QR tags", stage: "Idea" },
  ]);
  const [draft, setDraft] = useState("");
  return (
    <div className="rounded-lg bg-card p-4">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Pitch a build…"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2"
          style={{ "--tw-ring-color": accent } as React.CSSProperties}
        />
        <Button
          size="sm"
          style={{ backgroundColor: accent }}
          disabled={draft.trim().length === 0}
          onClick={() => {
            setIdeas((list) => [{ text: draft.trim(), stage: "Idea" }, ...list]);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
      <ul className="mt-3 space-y-2">
        {ideas.map((idea, i) => (
          <li
            key={`${idea.text}-${i}`}
            className="flex items-center justify-between gap-3 rounded-md bg-muted/50 px-3 py-2 text-sm"
          >
            <span className="min-w-0 truncate text-[#0A2342] dark:text-white">
              {idea.text}
            </span>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: accent }}
            >
              {idea.stage}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GenericToolkit({ accent }: { accent: string }) {
  const tools = ["Meeting notes", "Member roster", "Event planner", "Resource links"];
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {tools.map((tool) => (
        <div
          key={tool}
          className="flex items-center gap-2 rounded-lg bg-card p-3 text-sm text-muted-foreground"
        >
          <span
            className="size-2 rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
          {tool}
        </div>
      ))}
    </div>
  );
}
