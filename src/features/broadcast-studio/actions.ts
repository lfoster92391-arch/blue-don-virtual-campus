"use server";

import { revalidatePath } from "next/cache";

import { STUDIO_ROUTE, pickCameraProgramScene } from "@/config/broadcast-studio";
import type { GameStatusKey } from "@/config/sports-highlights";
import {
  endLiveBroadcastAction,
  startLiveBroadcastAction,
  type MediaActionState,
} from "@/features/media/actions";
import type {
  StudioCommandKind,
  StudioGraphicKind,
} from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  buildScoreboard,
  type StudioScoreboardState,
} from "@/services/broadcast-studio-service";
import { canManageCampusMedia } from "@/services/media-service";
import { setGameScore } from "@/services/sports-highlights-service";
import {
  describeStudioEncoderBlocker,
  getStudioBridgeSnapshot,
  queueStudioCommand,
  type StudioCommandView,
} from "@/services/studio-bridge-service";
import {
  clearAllStudioGraphics,
  clearStudioGraphic,
  rotateStudioOverlayKey,
  saveStudioGraphic,
  type StudioGraphicFields,
  type StudioGraphicIntent,
  type StudioGraphicView,
} from "@/services/studio-graphics-service";
import {
  applyStudioRunCommand,
  type StudioRunCommand,
  type StudioRunProgress,
} from "@/services/studio-run-of-show-service";
import {
  deleteStudioSponsor,
  listSponsorPartnerOptions,
  listStudioSponsors,
  saveStudioSponsor,
  type StudioSponsorInput,
  type StudioSponsorPartnerOption,
  type StudioSponsorView,
} from "@/services/studio-sponsors-service";

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

/**
 * Student / Control Room Go Live with Studio B.
 *
 * Unlike the advisor console, this refuses to flip campus LIVE if the bridge
 * or OBS is down — the student should use the phone camera path instead of
 * seeing a LIVE badge with no picture.
 */
export async function startStudentBroadcastAction(
  prev: StudioTransportState,
  formData: FormData,
): Promise<StudioTransportState> {
  const snapshot = await getStudioBridgeSnapshot();
  const blocker = describeStudioEncoderBlocker(snapshot);
  if (blocker) {
    return { error: blocker };
  }

  const cameraScene = pickCameraProgramScene(snapshot.device?.scenes ?? []);
  const alreadyStreaming = Boolean(snapshot.device?.streaming);
  if (
    cameraScene &&
    !alreadyStreaming &&
    cameraScene !== snapshot.device?.programScene
  ) {
    const scene = await queueStudioCommandAction({
      kind: "SET_PROGRAM_SCENE",
      sceneName: cameraScene,
    });
    if (scene.error) {
      return {
        error: `Could not switch OBS to the camera scene (${cameraScene}): ${scene.error}`,
      };
    }
  }

  const obs = await queueTransport("OBS_START_STREAM");
  if (!obs.queued) {
    return { error: obs.note };
  }

  const started = await startLiveBroadcastAction(prev, formData);
  if (started.error) {
    return { ...started, obs };
  }

  revalidatePath(STUDIO_ROUTE);
  return {
    ...started,
    obs,
    success: "You are live. OBS is starting the Studio B stream.",
  };
}

/* --------------------------------------------------------------- graphics */

export type StudioGraphicActionState = {
  error?: string;
  /** The saved row, so the panel can show the take before the next poll. */
  graphic?: StudioGraphicView;
};

/**
 * Cue or take one graphic on the overlay.
 *
 * Nothing about OBS is involved: the overlay is a Browser Source polling the
 * campus, so a take is a database write and the graphic appears within a
 * second. Crew permission and the copy limits are re-checked inside
 * `saveStudioGraphic`.
 */
export async function saveStudioGraphicAction(input: {
  kind: StudioGraphicKind;
  intent: StudioGraphicIntent;
  fields: Partial<StudioGraphicFields>;
  gameId?: string | null;
  playerId?: string | null;
  sponsorId?: string | null;
}): Promise<StudioGraphicActionState> {
  try {
    const user = await requireCompleteProfile();

    const result = await saveStudioGraphic({
      actorId: user.id,
      actorName: user.displayName || user.email,
      role: user.role,
      kind: input.kind,
      intent: input.intent,
      fields: input.fields,
      gameId: input.gameId,
      playerId: input.playerId,
      sponsorId: input.sponsorId,
    });

    return "error" in result ? { error: result.error } : { graphic: result.graphic };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to save the graphic.",
    };
  }
}

/** Takes one graphic off the overlay. The copy stays for the next take. */
export async function clearStudioGraphicAction(input: {
  kind: StudioGraphicKind;
}): Promise<{ error?: string }> {
  try {
    const user = await requireCompleteProfile();

    const result = await clearStudioGraphic({
      actorId: user.id,
      role: user.role,
      kind: input.kind,
    });

    return "error" in result ? { error: result.error } : {};
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to clear the graphic.",
    };
  }
}

/** Clears the whole overlay in one press. */
export async function clearAllStudioGraphicsAction(): Promise<{
  error?: string;
  cleared?: number;
}> {
  try {
    const user = await requireCompleteProfile();

    const result = await clearAllStudioGraphics({
      actorId: user.id,
      role: user.role,
    });

    return "error" in result ? { error: result.error } : { cleared: result.cleared };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to clear the overlay.",
    };
  }
}

/**
 * Issues a new Browser Source URL. The old one stops resolving immediately, so
 * this is both the between-seasons hygiene step and the recovery if a URL is
 * shared outside the crew.
 */
export async function rotateStudioOverlayKeyAction(): Promise<{
  error?: string;
  path?: string;
}> {
  try {
    const user = await requireCompleteProfile();

    const result = await rotateStudioOverlayKey({
      actorId: user.id,
      role: user.role,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidatePath(STUDIO_ROUTE);
    return { path: result.path };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to rotate the overlay URL.",
    };
  }
}

/* ------------------------------------------------------------ run of show */

export type StudioRunActionState = {
  error?: string;
  /** The saved progress, so the rundown moves before the next poll lands. */
  progress?: StudioRunProgress;
  savedAt?: number;
};

/**
 * One press on the run of show — advance, back, jump, ready, skip, or reset.
 *
 * The rundown's words stay in `BroadcastDailyScript`; only the crew's position
 * in them is written here. The ordering is resolved server-side from today's
 * script, so a console left open across a template edit cannot advance into a
 * slot that no longer exists. Crew permission is re-checked in the service.
 */
export async function runStudioShowAction(
  command: StudioRunCommand,
): Promise<StudioRunActionState> {
  try {
    const user = await requireCompleteProfile();

    const result = await applyStudioRunCommand({
      actorId: user.id,
      actorName: user.displayName || user.email,
      role: user.role,
      command,
    });

    return "error" in result
      ? { error: result.error }
      : { progress: result.progress, savedAt: Date.now() };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to update the run of show.",
    };
  }
}

/* --------------------------------------------------------------- sponsors */

export type StudioSponsorActionState = {
  error?: string;
  sponsor?: StudioSponsorView;
  /** The whole book after the write, so the panel and rotation stay in order. */
  sponsors?: StudioSponsorView[];
};

/** Adds or edits one sponsor in the book. Crew-gated inside the service. */
export async function saveStudioSponsorAction(
  sponsor: StudioSponsorInput,
): Promise<StudioSponsorActionState> {
  try {
    const user = await requireCompleteProfile();

    const result = await saveStudioSponsor({
      actorId: user.id,
      actorName: user.displayName || user.email,
      role: user.role,
      sponsor,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidatePath(STUDIO_ROUTE);
    return { sponsor: result.sponsor, sponsors: await listStudioSponsors() };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to save the sponsor.",
    };
  }
}

/** Removes a sponsor from the book. Refused while that sponsor is on air. */
export async function deleteStudioSponsorAction(input: {
  sponsorId: string;
}): Promise<StudioSponsorActionState> {
  try {
    const user = await requireCompleteProfile();

    const result = await deleteStudioSponsor({
      actorId: user.id,
      role: user.role,
      sponsorId: input.sponsorId,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidatePath(STUDIO_ROUTE);
    return { sponsors: await listStudioSponsors() };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove the sponsor.",
    };
  }
}

/**
 * Cues or takes one sponsor to the overlay.
 *
 * The graphic stores the sponsor's id, never a copy of its name or logo, so
 * the card on air and the book are the same row — the same rule score cards
 * follow with `SportsGame`.
 */
export async function takeStudioSponsorAction(input: {
  sponsorId: string;
  kind: Extract<StudioGraphicKind, "SPONSOR" | "SPONSOR_FULL">;
  intent: StudioGraphicIntent;
}): Promise<StudioGraphicActionState> {
  try {
    const user = await requireCompleteProfile();

    const result = await saveStudioGraphic({
      actorId: user.id,
      actorName: user.displayName || user.email,
      role: user.role,
      kind: input.kind,
      intent: input.intent,
      // Copy is deliberately empty: the renderer reads the resolved sponsor,
      // and an operator who wants one-off wording uses the Graphics panel.
      fields: {},
      sponsorId: input.sponsorId,
    });

    return "error" in result
      ? { error: result.error }
      : { graphic: result.graphic };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to put the sponsor on air.",
    };
  }
}

/**
 * Approved campus partners, for adopting one into the book instead of
 * retyping a name and a logo. Loaded on demand — it is a directory, not
 * something the console needs on every poll.
 */
export async function loadSponsorPartnerOptionsAction(): Promise<{
  error?: string;
  partners?: StudioSponsorPartnerOption[];
}> {
  try {
    const user = await requireCompleteProfile();

    if (!(await canManageCampusMedia(user.id, user.role))) {
      return { error: "Only Broadcasting crew can manage sponsors." };
    }

    return { partners: await listSponsorPartnerOptions() };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to read the partner directory.",
    };
  }
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
