"use server";

import { revalidatePath } from "next/cache";

import { STUDIO_ROUTE } from "@/config/broadcast-studio";
import type { GameStatusKey } from "@/config/sports-highlights";
import {
  endLiveBroadcastAction,
  startLiveBroadcastAction,
  type MediaActionState,
} from "@/features/media/actions";
import type { StudioCommandKind } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  buildScoreboard,
  type StudioScoreboardState,
} from "@/services/broadcast-studio-service";
import { setGameScore } from "@/services/sports-highlights-service";
import {
  queueStudioCommand,
  type StudioCommandView,
} from "@/services/studio-bridge-service";

export type StudioScoreActionState = {
  error?: string;
  /** The saved row, so the console can show the write without waiting on a poll. */
  scoreboard?: StudioScoreboardState;
  /** When the write landed — the console uses it to age out its local copy. */
  savedAt?: number;
};

/**
 * The Sports Desk edits the same `SportsGame` rows, so a console write has to
 * refresh those surfaces too. Same list `saveGameAction` revalidates, plus the
 * studio itself.
 */
function revalidateScoreSurfaces() {
  revalidatePath("/sports");
  revalidatePath("/media");
  revalidatePath("/organizations/broadcasting");
  revalidatePath("/home");
  revalidatePath(STUDIO_ROUTE);
}

/**
 * Manual scoreboard write from the Broadcast Control Studio.
 *
 * Authoritative state stays in `SportsGame` — there is no console-side score
 * table and no scoreboard hardware feed. Scores arrive campus-relative
 * (`teamScore` = Blue Dons) because that is how the row stores them; the panel
 * maps its home / away readout onto those columns before calling. Crew
 * permission is re-checked inside `setGameScore`.
 */
export async function saveStudioScoreAction(input: {
  gameId: string;
  teamScore?: number | null;
  opponentScore?: number | null;
  status?: GameStatusKey;
}): Promise<StudioScoreActionState> {
  try {
    const user = await requireCompleteProfile();

    if (!input.gameId) {
      return { error: "Pick a game first." };
    }

    const result = await setGameScore({
      actorId: user.id,
      role: user.role,
      gameId: input.gameId,
      teamScore: input.teamScore,
      opponentScore: input.opponentScore,
      status: input.status,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateScoreSurfaces();

    return {
      scoreboard: buildScoreboard(result.game) ?? undefined,
      savedAt: Date.now(),
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to save the score.",
    };
  }
}

/* ------------------------------------------------------------ OBS control */

export type StudioCommandActionState = {
  error?: string;
  /** The queued row, so the console can show it pending before the next poll. */
  command?: StudioCommandView;
};

/**
 * Queues one whitelisted OBS action for the Studio Bridge.
 *
 * Nothing here talks to OBS. The command lands in `StudioCommand` and the agent
 * on the Studio B PC picks it up within a poll; if the agent is not up, the
 * service refuses rather than queuing an action that would fire minutes later.
 * Permission is re-checked inside `queueStudioCommand`.
 */
export async function queueStudioCommandAction(input: {
  kind: StudioCommandKind;
  sceneName?: string | null;
}): Promise<StudioCommandActionState> {
  try {
    const user = await requireCompleteProfile();

    const result = await queueStudioCommand({
      actorId: user.id,
      actorName: user.displayName || user.email,
      role: user.role,
      kind: input.kind,
      sceneName: input.sceneName,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    return { command: result.command };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to reach the studio bridge.",
    };
  }
}

/**
 * What happened to the OBS half of a transport press, reported separately from
 * the campus record so the operator is never told OBS did something it did not.
 */
export type StudioObsOutcome = {
  queued: boolean;
  note: string;
};

export type StudioTransportState = MediaActionState & {
  obs?: StudioObsOutcome;
};

async function queueTransport(
  kind: Extract<StudioCommandKind, "OBS_START_STREAM" | "OBS_STOP_STREAM">,
): Promise<StudioObsOutcome> {
  const result = await queueStudioCommandAction({ kind });

  if (result.error) {
    return { queued: false, note: result.error };
  }

  return {
    queued: true,
    note:
      kind === "OBS_START_STREAM"
        ? "OBS start stream sent to the studio bridge."
        : "OBS stop stream sent to the studio bridge.",
  };
}

/**
 * GO LIVE from the console.
 *
 * Two independent things happen, and they are reported separately on purpose:
 * the campus `CampusMediaItem` record flips to on air (the single source of
 * truth the whole campus reads), and — only if the bridge is up — OBS is asked
 * to start streaming. When the bridge is down the campus record still goes
 * live and the console says to start OBS by hand, rather than implying the
 * encoder was touched.
 */
export async function startStudioBroadcastAction(
  prev: StudioTransportState,
  formData: FormData,
): Promise<StudioTransportState> {
  const started = await startLiveBroadcastAction(prev, formData);

  if (started.error) {
    return started;
  }

  const obs = await queueTransport("OBS_START_STREAM");
  revalidatePath(STUDIO_ROUTE);

  return { ...started, obs };
}

/** END BROADCAST — ends the campus record, and stops OBS when the bridge is up. */
export async function endStudioBroadcastAction(
  itemId: string,
): Promise<StudioTransportState> {
  const ended = await endLiveBroadcastAction(itemId);

  if (ended.error) {
    return ended;
  }

  const obs = await queueTransport("OBS_STOP_STREAM");
  revalidatePath(STUDIO_ROUTE);

  return { ...ended, obs };
}
