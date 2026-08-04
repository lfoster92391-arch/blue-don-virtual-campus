"use server";

import { revalidatePath } from "next/cache";

import { STUDIO_ROUTE } from "@/config/broadcast-studio";
import type { GameStatusKey } from "@/config/sports-highlights";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  buildScoreboard,
  type StudioScoreboardState,
} from "@/services/broadcast-studio-service";
import { setGameScore } from "@/services/sports-highlights-service";

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
