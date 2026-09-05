"use server";

import { z } from "zod";

import { requireCoachWorkspace } from "@/lib/auth/session";
import { revalidateMediaPaths } from "@/lib/media/revalidate";
import {
  createCampusVideoUpload,
  createCampusVideoUploadTicket,
  resolveUploadedCampusVideo,
  uploadCampusVideoFile,
  type CampusVideoUploadTicket,
} from "@/services/media-service";

export type CoachFilmActionState = {
  error?: string;
  success?: string;
  itemId?: string;
};

export type CoachFilmTicketState = {
  error?: string;
  ticket?: CampusVideoUploadTicket;
};

const filmSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  videoUrl: z
    .string()
    .trim()
    .url("Enter a valid video URL")
    .optional()
    .or(z.literal("")),
});

export async function createCoachFilmUploadTicketAction(input: {
  name: string;
  size: number;
  type?: string | null;
}): Promise<CoachFilmTicketState> {
  try {
    const user = await requireCoachWorkspace();
    const ticket = await createCampusVideoUploadTicket(input, user.id, {
      folder: "coach-film",
    });

    if (!ticket) {
      return {
        error:
          "Campus video storage is not configured. Paste a YouTube or hosted video URL instead.",
      };
    }

    return { ticket };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to start the upload.",
    };
  }
}

export async function uploadCoachFilmAction(
  _prev: CoachFilmActionState,
  formData: FormData,
): Promise<CoachFilmActionState> {
  try {
    const user = await requireCoachWorkspace();

    const parsed = filmSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      videoUrl: formData.get("videoUrl") || "",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid upload data." };
    }

    const file = formData.get("videoFile");
    const uploadedPath = String(formData.get("storagePath") ?? "").trim();
    let publicUrl = parsed.data.videoUrl || undefined;
    let storagePath: string | undefined;

    if (uploadedPath) {
      const resolved = await resolveUploadedCampusVideo(uploadedPath, user.id);
      if (!resolved) {
        return {
          error:
            "Campus video storage is not configured. Paste a YouTube or hosted video URL instead.",
        };
      }
      publicUrl = resolved.publicUrl;
      storagePath = resolved.storagePath;
    } else if (file instanceof File && file.size > 0) {
      const uploaded = await uploadCampusVideoFile(file, user.id);
      if (uploaded) {
        publicUrl = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      } else if (!publicUrl) {
        return {
          error:
            "Campus video storage is not configured. Paste a YouTube or hosted video URL instead.",
        };
      }
    }

    if (!publicUrl) {
      return { error: "Choose a video file or paste a hosted video URL." };
    }

    const itemId = await createCampusVideoUpload({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      publicUrl,
      storagePath,
      category: "COACH_FILM",
      isHighlightReel: false,
    });

    if (!itemId) {
      return { error: "Unable to save this film. Check database connectivity." };
    }

    revalidateMediaPaths();
    return { success: "Film added to the coach film room.", itemId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to upload film.",
    };
  }
}
