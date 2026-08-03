/**
 * Canonical wave registry for the Blue Don Virtual Campus migration.
 *
 * A "wave" is a shippable slice of the Blue Don OS rollout. Waves are the
 * user-facing versioning unit and are DISTINCT from build "phases":
 *
 *   - Phases (siteConfig.phase) track the internal build order (0..N).
 *   - Waves (W0..W20) track the migration toward the full Digital Campus.
 *
 * Source of truth: docs/BLUE_DON_SYSTEM_BLUEPRINT.md — Part X (Implementation
 * Waves) defines W0–W15. W16–W17 extend that sequence with the Intelligence
 * and Play pillars (Blue Don AI, Arcade + Campus Challenges) per the module
 * shells in src/config/module-shells.ts.
 *
 * IMPORTANT: This is a versioning/labeling registry. Marking a wave `planned`
 * does not imply its features exist yet.
 */

export type WaveStatus = "complete" | "current" | "planned";

export type Wave = {
  /** Canonical id, e.g. "W1". */
  id: string;
  /** Short human label, e.g. "Blue Don OS". */
  label: string;
  /** One-line focus / exit criteria from the blueprint. */
  focus: string;
  /** Build phase(s) this wave corresponds to. Descriptive, not 1:1. */
  phase: string;
  status: WaveStatus;
};

/** The wave the campus is currently shipping. */
export const CURRENT_WAVE_ID = "W20" as const;

/**
 * W0–W20 canonical wave table.
 * W0–W20 all complete — full Digital Campus MVP shipped.
 */
export const WAVES: readonly Wave[] = [
  {
    id: "W0",
    label: "Foundation",
    focus: "Auth, academies, forms, tickets, orgs — Phases 0–16 complete.",
    phase: "0–16",
    status: "complete",
  },
  {
    id: "W1",
    label: "Blue Don OS",
    focus: "Enterprise navigation + Blue Don OS shell, 14-item nav, Today digest.",
    phase: "17.0",
    status: "complete",
  },
  {
    id: "W2",
    label: "Event Engine v2",
    focus: "EventPublication, fan-out, reminders.",
    phase: "17.1",
    status: "complete",
  },
  {
    id: "W3",
    label: "Broadcast Engine",
    focus: "Audiences, approval, ticker.",
    phase: "17.2",
    status: "complete",
  },
  {
    id: "W4",
    label: "Journey Engine v1",
    focus: "Timeline, milestones from events.",
    phase: "17.3",
    status: "complete",
  },
  {
    id: "W5",
    label: "Rewards Engine v1",
    focus: "XP ledger, badges.",
    phase: "18.0",
    status: "complete",
  },
  {
    id: "W6",
    label: "Request Engine",
    focus: "CampusRequest, IT + Facilities queues.",
    phase: "18.1",
    status: "complete",
  },
  {
    id: "W7",
    label: "Campus Life v1",
    focus: "Today, traditions shell, spirit points.",
    phase: "19.0",
    status: "complete",
  },
  {
    id: "W8",
    label: "Identity Engine",
    focus: "Blue Don Pass, QR check-in.",
    phase: "19.1",
    status: "complete",
  },
  {
    id: "W9",
    label: "Campus Operations",
    focus: "IT Operations flagship, department workspaces.",
    phase: "21.0",
    status: "complete",
  },
  {
    id: "W10",
    label: "Integrations",
    focus: "Classroom + Calendar read sync.",
    phase: "21.1",
    status: "complete",
  },
  {
    id: "W11",
    label: "Journey v2",
    focus: "Year in Review, achievements.",
    phase: "20.1",
    status: "complete",
  },
  {
    id: "W12",
    label: "Media + Live",
    focus: "Storage, Photo of the Day, Blue Don Live.",
    phase: "19.2",
    status: "complete",
  },
  {
    id: "W13",
    label: "Guidance + Partners",
    focus: "Counseling, partner portal.",
    phase: "22.0",
    status: "complete",
  },
  {
    id: "W14",
    label: "FACTS Sync",
    focus: "StudentProfile, parents.",
    phase: "22.1",
    status: "complete",
  },
  {
    id: "W15",
    label: "Journey v3",
    focus: "Time capsule, graduation video.",
    phase: "22.2",
    status: "complete",
  },
  {
    id: "W16",
    label: "Blue Don AI",
    focus: "Scoped campus assistant for homework, careers, and planning.",
    phase: "20.0",
    status: "complete",
  },
  {
    id: "W17",
    label: "Arcade + Challenges",
    focus: "Play, learn, earn — brain games, Campus Quest, monthly seasons.",
    phase: "20.2",
    status: "complete",
  },
  {
    id: "W18",
    label: "School Culture & Traditions",
    focus: "Traditions hub, history, hall of champions, faculty, memories, campus voice.",
    phase: "23.0",
    status: "complete",
  },
  {
    id: "W19",
    label: "Graduate Impact & Pathways",
    focus: "Trade & military passports, community impact, legacy pages, impact before diploma.",
    phase: "23.1",
    status: "complete",
  },
  {
    id: "W20",
    label: "Club Worlds",
    focus: "Per-club XP + milestones, club/class/team workspaces with signature tools.",
    phase: "23.2",
    status: "complete",
  },
] as const;

/** Fast lookup by wave id. */
const WAVE_BY_ID = new Map(WAVES.map((wave) => [wave.id, wave]));

/** Returns the wave with the given id, or undefined. */
export function getWave(id: string): Wave | undefined {
  return WAVE_BY_ID.get(id);
}

/** Returns the current wave (always defined). */
export function getCurrentWave(): Wave {
  const wave = WAVE_BY_ID.get(CURRENT_WAVE_ID);
  if (!wave) {
    throw new Error(`Canonical wave registry is missing ${CURRENT_WAVE_ID}`);
  }
  return wave;
}

/**
 * Human-readable label for a wave id, e.g. "W1 · Blue Don OS".
 * Falls back to the raw id when unknown.
 */
export function getWaveLabel(id: string): string {
  const wave = WAVE_BY_ID.get(id);
  return wave ? `${wave.id} · ${wave.label}` : id;
}

/**
 * Maps a build phase to its canonical wave.
 *
 *   - Phases 0–16 → W0 (foundation)
 *   - Phase 17    → W1 (Blue Don OS)
 *   - Phase 18+   → current wave
 *
 * Accepts a number (siteConfig.phase) or a string like "17.2". Unknown or
 * future phases resolve to the current wave.
 */
export function phaseToWave(phase: number | string): Wave {
  const major = Math.floor(
    typeof phase === "number" ? phase : Number.parseFloat(phase),
  );

  if (Number.isNaN(major) || major <= 16) {
    return getWave("W0") ?? getCurrentWave();
  }
  if (major === 17) {
    return getWave("W1") ?? getCurrentWave();
  }
  return getCurrentWave();
}
