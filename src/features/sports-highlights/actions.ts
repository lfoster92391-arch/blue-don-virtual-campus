"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type {
  GameSiteKey,
  GameStatusKey,
  HighlightKindKey,
  HighlightStatusKey,
  ReportKindKey,
  ReportStatusKey,
  SportSeasonKey,
} from "@/config/sports-highlights";
import { statFieldsForSport } from "@/config/sports-highlights";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  createHighlight,
  removeGame,
  removeHighlight,
  removeOpponentSchool,
  removeOpponentSportTeam,
  removePlayer,
  savePlayerStat,
  setSportActive,
  submitGameReport,
  updateHighlightStatus,
  updateReportStatus,
  uploadSportsImage,
  upsertGame,
  upsertOpponentSchool,
  upsertOpponentSportTeam,
  upsertPlayer,
  upsertSport,
} from "@/services/sports-highlights-service";

export type SportsActionState = {
  error?: string;
  success?: string;
};

const seasons = z.enum(["FALL", "WINTER", "SPRING", "YEAR_ROUND"]);
const sites = z.enum(["HOME", "AWAY", "NEUTRAL"]);
const gameStatuses = z.enum([
  "SCHEDULED",
  "LIVE",
  "FINAL",
  "POSTPONED",
  "CANCELED",
]);
const highlightKinds = z.enum(["CLIP", "PHOTO", "STORY", "REEL", "INTERVIEW"]);
const highlightStatuses = z.enum(["PENDING", "PUBLISHED", "ARCHIVED"]);
const reportKinds = z.enum(["RECAP", "PREVIEW"]);
const reportStatuses = z.enum(["PENDING", "APPROVED", "PUBLISHED", "DECLINED"]);

function revalidateSportsPaths() {
  revalidatePath("/sports");
  revalidatePath("/media");
  revalidatePath("/organizations/broadcasting");
  revalidatePath("/home");
}

function personName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
}): string {
  return (
    user.displayName?.trim() ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    "Campus user"
  );
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string): string | null {
  return text(formData, key) || null;
}

function optionalInt(formData: FormData, key: string): number | null {
  const raw = text(formData, key);
  if (!raw) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function failure(error: unknown, fallback: string): SportsActionState {
  return { error: error instanceof Error ? error.message : fallback };
}

/**
 * Uploaded file wins; otherwise fall back to a pasted URL. Returns `undefined`
 * when neither is present so the service keeps the existing image.
 */
async function resolveImage(
  formData: FormData,
  userId: string,
  folder: string,
  fileField = "image",
  urlField = "imageUrl",
): Promise<
  | { imageUrl: string | null; imagePath: string | null }
  | undefined
  | { error: string }
> {
  const file = formData.get(fileField);
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSportsImage(file, userId, folder);
    if (!uploaded) {
      return {
        error:
          "Image upload failed. Use a PNG, JPG, WEBP, or SVG under 4 MB, or paste an image URL instead.",
      };
    }
    return { imageUrl: uploaded.publicUrl, imagePath: uploaded.storagePath };
  }

  const url = String(formData.get(urlField) ?? "").trim();
  if (url) {
    if (!/^https?:\/\//i.test(url)) {
      return { error: "Image URL must start with http:// or https://." };
    }
    return { imageUrl: url, imagePath: null };
  }

  if (String(formData.get("clearImage") ?? "") === "1") {
    return { imageUrl: null, imagePath: null };
  }

  return undefined;
}

/* ------------------------------------------------------------- sport list */

export async function saveSportAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = z
      .object({
        sportId: z.string().optional(),
        name: z.string().trim().min(1).max(60),
        season: seasons,
        emoji: z.string().trim().max(8).optional(),
        headline: z.string().trim().max(160).optional(),
        sortOrder: z.coerce.number().int().min(0).max(999).optional(),
      })
      .safeParse({
        sportId: text(formData, "sportId") || undefined,
        name: formData.get("name"),
        season: formData.get("season") || "FALL",
        emoji: optionalText(formData, "emoji") ?? undefined,
        headline: optionalText(formData, "headline") ?? undefined,
        sortOrder: text(formData, "sortOrder") || 0,
      });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid sport." };
    }

    const result = await upsertSport({
      actorId: user.id,
      role: user.role,
      sportId: parsed.data.sportId ?? null,
      name: parsed.data.name,
      season: parsed.data.season as SportSeasonKey,
      emoji: parsed.data.emoji,
      headline: parsed.data.headline,
      sortOrder: parsed.data.sortOrder,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return { success: `${parsed.data.name} saved to the sport list.` };
  } catch (error) {
    return failure(error, "Unable to save sport.");
  }
}

export async function toggleSportAction(
  sportId: string,
  isActive: boolean,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await setSportActive({
      actorId: user.id,
      role: user.role,
      sportId,
      isActive,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: isActive ? "Sport shown." : "Sport hidden." };
  } catch (error) {
    return failure(error, "Unable to update sport.");
  }
}

/* ------------------------------------------------- opponent school directory */

export async function saveOpponentSchoolAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = z
      .object({
        schoolId: z.string().optional(),
        name: z.string().trim().min(1).max(120),
        shortName: z.string().trim().max(60).optional(),
        mascot: z.string().trim().max(60).optional(),
        city: z.string().trim().max(80).optional(),
        state: z.string().trim().max(40).optional(),
        colorPrimary: z.string().trim().max(20).optional(),
        websiteUrl: z.string().trim().max(300).optional(),
        notes: z.string().trim().max(1000).optional(),
      })
      .safeParse({
        schoolId: text(formData, "schoolId") || undefined,
        name: formData.get("name"),
        shortName: optionalText(formData, "shortName") ?? undefined,
        mascot: optionalText(formData, "mascot") ?? undefined,
        city: optionalText(formData, "city") ?? undefined,
        state: optionalText(formData, "state") ?? undefined,
        colorPrimary: optionalText(formData, "colorPrimary") ?? undefined,
        websiteUrl: optionalText(formData, "websiteUrl") ?? undefined,
        notes: optionalText(formData, "notes") ?? undefined,
      });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid school." };
    }

    const image = await resolveImage(formData, user.id, "schools", "logo", "logoUrl");
    if (image && "error" in image) {
      return { error: image.error };
    }

    const result = await upsertOpponentSchool({
      actorId: user.id,
      role: user.role,
      schoolId: parsed.data.schoolId ?? null,
      name: parsed.data.name,
      shortName: parsed.data.shortName,
      mascot: parsed.data.mascot,
      city: parsed.data.city,
      state: parsed.data.state,
      colorPrimary: parsed.data.colorPrimary,
      websiteUrl: parsed.data.websiteUrl,
      notes: parsed.data.notes,
      ...(image ? { logoUrl: image.imageUrl, logoPath: image.imagePath } : {}),
    });

    if ("error" in result) {
      return { error: result.error };
    }

    // "Add school + link a sport" in one pass when a sport was picked.
    const sportId = text(formData, "sportId");
    if (sportId) {
      const teamName = text(formData, "teamName") || parsed.data.name;
      const teamResult = await upsertOpponentSportTeam({
        actorId: user.id,
        role: user.role,
        schoolId: result.schoolId,
        sportId,
        teamName,
      });
      if ("error" in teamResult) {
        return { error: teamResult.error };
      }
    }

    revalidateSportsPaths();
    return {
      success: `${parsed.data.name} saved. Students can now pick this school by name.`,
    };
  } catch (error) {
    return failure(error, "Unable to save school.");
  }
}

export async function saveOpponentTeamAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const schoolId = text(formData, "schoolId");
    const sportId = text(formData, "sportId");
    const teamName = text(formData, "teamName");

    if (!schoolId || !sportId) {
      return { error: "Pick a school and a sport." };
    }
    if (!teamName) {
      return { error: "Team name is required (e.g. Indian Creek Football)." };
    }

    const image = await resolveImage(formData, user.id, "teams", "logo", "logoUrl");
    if (image && "error" in image) {
      return { error: image.error };
    }

    const result = await upsertOpponentSportTeam({
      actorId: user.id,
      role: user.role,
      schoolId,
      sportId,
      teamName,
      notes: optionalText(formData, "notes"),
      ...(image ? { logoUrl: image.imageUrl, logoPath: image.imagePath } : {}),
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return { success: `${teamName} is now selectable for this sport.` };
  } catch (error) {
    return failure(error, "Unable to save team.");
  }
}

export async function archiveOpponentSchoolAction(
  schoolId: string,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await removeOpponentSchool({
      actorId: user.id,
      role: user.role,
      schoolId,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: "School archived." };
  } catch (error) {
    return failure(error, "Unable to archive school.");
  }
}

export async function removeOpponentTeamAction(
  teamId: string,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await removeOpponentSportTeam({
      actorId: user.id,
      role: user.role,
      teamId,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: "Sport link removed." };
  } catch (error) {
    return failure(error, "Unable to remove sport link.");
  }
}

/* ------------------------------------------------------------------- games */

export async function saveGameAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const sportId = text(formData, "sportId");
    const kickoffRaw = text(formData, "kickoffAt");

    if (!sportId) {
      return { error: "Pick a sport." };
    }
    if (!kickoffRaw) {
      return { error: "Pick a date and time." };
    }

    const kickoffAt = new Date(kickoffRaw);
    if (Number.isNaN(kickoffAt.getTime())) {
      return { error: "Invalid game date/time." };
    }

    const site = sites.safeParse(text(formData, "site") || "HOME");
    const status = gameStatuses.safeParse(text(formData, "status") || "SCHEDULED");
    if (!site.success || !status.success) {
      return { error: "Invalid game location or status." };
    }

    const result = await upsertGame({
      actorId: user.id,
      role: user.role,
      gameId: optionalText(formData, "gameId"),
      sportId,
      opponentTeamId: optionalText(formData, "opponentTeamId"),
      opponentLabel: optionalText(formData, "opponentLabel"),
      kickoffAt,
      site: site.data as GameSiteKey,
      venue: optionalText(formData, "venue"),
      level: optionalText(formData, "level"),
      status: status.data as GameStatusKey,
      teamScore: optionalInt(formData, "teamScore"),
      opponentScore: optionalInt(formData, "opponentScore"),
      headline: optionalText(formData, "headline"),
      summary: optionalText(formData, "summary"),
      broadcastNote: optionalText(formData, "broadcastNote"),
      streamUrl: optionalText(formData, "streamUrl"),
      isFeatured: formData.get("isFeatured") === "on",
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return { success: "Game saved to the schedule." };
  } catch (error) {
    return failure(error, "Unable to save game.");
  }
}

export async function deleteGameAction(
  gameId: string,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await removeGame({
      actorId: user.id,
      role: user.role,
      gameId,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: "Game removed." };
  } catch (error) {
    return failure(error, "Unable to remove game.");
  }
}

/* -------------------------------------------------------------- highlights */

export async function saveHighlightAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const sportId = text(formData, "sportId");
    const title = text(formData, "title");

    if (!sportId) {
      return { error: "Pick a sport." };
    }
    if (!title) {
      return { error: "Give the highlight a title." };
    }

    const kind = highlightKinds.safeParse(text(formData, "kind") || "CLIP");
    if (!kind.success) {
      return { error: "Invalid highlight type." };
    }

    const image = await resolveImage(formData, user.id, "highlights");
    if (image && "error" in image) {
      return { error: image.error };
    }

    const result = await createHighlight({
      actorId: user.id,
      actorName: personName(user),
      role: user.role,
      sportId,
      gameId: optionalText(formData, "gameId"),
      title,
      description: optionalText(formData, "description"),
      kind: kind.data as HighlightKindKey,
      videoUrl: optionalText(formData, "videoUrl"),
      credit: optionalText(formData, "credit"),
      isFeatured: formData.get("isFeatured") === "on",
      ...(image ? { imageUrl: image.imageUrl, imagePath: image.imagePath } : {}),
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return { success: "Highlight saved." };
  } catch (error) {
    return failure(error, "Unable to save highlight.");
  }
}

export async function setHighlightStatusAction(
  highlightId: string,
  status: HighlightStatusKey,
  isFeatured?: boolean,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = highlightStatuses.safeParse(status);
    if (!parsed.success) {
      return { error: "Invalid status." };
    }
    const result = await updateHighlightStatus({
      actorId: user.id,
      role: user.role,
      highlightId,
      status: parsed.data as HighlightStatusKey,
      isFeatured,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: `Highlight ${status.toLowerCase()}.` };
  } catch (error) {
    return failure(error, "Unable to update highlight.");
  }
}

export async function deleteHighlightAction(
  highlightId: string,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await removeHighlight({
      actorId: user.id,
      role: user.role,
      highlightId,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: "Highlight removed." };
  } catch (error) {
    return failure(error, "Unable to remove highlight.");
  }
}

/* --------------------------------------------- student recaps and previews */

export async function submitGameReportAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const gameId = text(formData, "gameId");
    if (!gameId) {
      return { error: "Pick the game you are writing about." };
    }

    const parsed = z
      .object({
        kind: reportKinds,
        headline: z.string().trim().min(1).max(160),
        body: z.string().trim().min(1).max(4000),
        playerOfGame: z.string().trim().max(120).optional(),
        keyMoment: z.string().trim().max(500).optional(),
        whatToWatch: z.string().trim().max(500).optional(),
      })
      .safeParse({
        kind: text(formData, "kind") || "RECAP",
        headline: formData.get("headline"),
        body: formData.get("body"),
        playerOfGame: optionalText(formData, "playerOfGame") ?? undefined,
        keyMoment: optionalText(formData, "keyMoment") ?? undefined,
        whatToWatch: optionalText(formData, "whatToWatch") ?? undefined,
      });

    if (!parsed.success) {
      return {
        error: parsed.error.issues[0]?.message ?? "Fill in a headline and story.",
      };
    }

    const result = await submitGameReport({
      actorId: user.id,
      actorName: personName(user),
      role: user.role,
      gameId,
      kind: parsed.data.kind as ReportKindKey,
      headline: parsed.data.headline,
      body: parsed.data.body,
      playerOfGame: parsed.data.playerOfGame,
      keyMoment: parsed.data.keyMoment,
      whatToWatch: parsed.data.whatToWatch,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return {
      success:
        "Submitted. Broadcasting crew reviews write-ups before they publish to the Sports page.",
    };
  } catch (error) {
    return failure(error, "Unable to submit write-up.");
  }
}

export async function setReportStatusAction(
  reportId: string,
  status: ReportStatusKey,
  reviewNote?: string,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const parsed = reportStatuses.safeParse(status);
    if (!parsed.success) {
      return { error: "Invalid status." };
    }
    const result = await updateReportStatus({
      actorId: user.id,
      role: user.role,
      reportId,
      status: parsed.data as ReportStatusKey,
      reviewNote,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: `Write-up ${status.toLowerCase()}.` };
  } catch (error) {
    return failure(error, "Unable to update write-up.");
  }
}

/* ------------------------------------------------- roster and player stats */

export async function savePlayerAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const sportId = text(formData, "sportId");
    if (!sportId) {
      return { error: "Pick a sport." };
    }

    const parsed = z
      .object({
        firstName: z.string().trim().min(1).max(60),
        lastName: z.string().trim().min(1).max(60),
        jerseyNumber: z.string().trim().max(6).optional(),
        position: z.string().trim().max(60).optional(),
        gradeYear: z.string().trim().max(30).optional(),
        bio: z.string().trim().max(1000).optional(),
      })
      .safeParse({
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        jerseyNumber: optionalText(formData, "jerseyNumber") ?? undefined,
        position: optionalText(formData, "position") ?? undefined,
        gradeYear: optionalText(formData, "gradeYear") ?? undefined,
        bio: optionalText(formData, "bio") ?? undefined,
      });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid player." };
    }

    const image = await resolveImage(formData, user.id, "players", "photo", "photoUrl");
    if (image && "error" in image) {
      return { error: image.error };
    }

    const result = await upsertPlayer({
      actorId: user.id,
      role: user.role,
      playerId: optionalText(formData, "playerId"),
      sportId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      jerseyNumber: parsed.data.jerseyNumber,
      position: parsed.data.position,
      gradeYear: parsed.data.gradeYear,
      bio: parsed.data.bio,
      ...(image ? { photoUrl: image.imageUrl, photoPath: image.imagePath } : {}),
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return {
      success: `${parsed.data.firstName} ${parsed.data.lastName} saved to the roster.`,
    };
  } catch (error) {
    return failure(error, "Unable to save player.");
  }
}

export async function archivePlayerAction(
  playerId: string,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await removePlayer({
      actorId: user.id,
      role: user.role,
      playerId,
    });
    if ("error" in result) {
      return { error: result.error };
    }
    revalidateSportsPaths();
    return { success: "Player archived." };
  } catch (error) {
    return failure(error, "Unable to archive player.");
  }
}

export async function savePlayerStatAction(
  _prev: SportsActionState,
  formData: FormData,
): Promise<SportsActionState> {
  try {
    const user = await requireCompleteProfile();
    const playerId = text(formData, "playerId");
    const gameId = text(formData, "gameId");
    const sportSlug = text(formData, "sportSlug");

    if (!playerId || !gameId) {
      return { error: "Pick a player and a game." };
    }

    const stats = statFieldsForSport(sportSlug).reduce<Record<string, string>>(
      (acc, field) => {
        const value = text(formData, `stat_${field.key}`);
        if (value) {
          acc[field.key] = value;
        }
        return acc;
      },
      {},
    );

    const result = await savePlayerStat({
      actorId: user.id,
      role: user.role,
      playerId,
      gameId,
      sportSlug,
      stats,
      notes: optionalText(formData, "notes"),
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateSportsPaths();
    return { success: "Stat line saved." };
  } catch (error) {
    return failure(error, "Unable to save stats.");
  }
}
