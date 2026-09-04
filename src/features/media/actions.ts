"use server";

import { z } from "zod";

import type { CampusMediaCategoryKey } from "@/config/broadcast-production";
import { requireCompleteProfile } from "@/lib/auth/session";
import { revalidateMediaPaths } from "@/lib/media/revalidate";
import { upsertTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import {
  canManageCampusMedia,
  createCampusVideoUpload,
  createCampusVideoUploadTicket,
  deleteCampusMediaItem,
  endCampusLiveStream,
  getStudioStreamCredentials,
  resolveBroadcastOrganizationId,
  resolveUploadedCampusVideo,
  setCampusMediaReelFlag,
  startCampusLiveStream,
  uploadCampusVideoFile,
  type CampusVideoUploadTicket,
  type StudioStreamCredentials,
} from "@/services/media-service";

export type MediaActionState = {
  error?: string;
  success?: string;
  itemId?: string;
};

export type StreamCredentialsState = {
  error?: string;
  credentials?: StudioStreamCredentials;
};

export type VideoUploadTicketState = {
  error?: string;
  ticket?: CampusVideoUploadTicket;
};

const uploadSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  videoUrl: z.string().trim().url("Enter a valid video URL").optional().or(z.literal("")),
  category: z
    .enum([
      "MORNING_ANNOUNCEMENTS",
      "SPORTS_HIGHLIGHTS",
      "STUDENT_SPOTLIGHT",
      "SPECIAL_EVENTS",
      "HIGHLIGHT_REEL",
      "OTHER",
    ])
    .optional()
    .nullable(),
  isHighlightReel: z.boolean().optional(),
});

const liveSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
  embedUrl: z.string().trim().url("Enter a valid embed or watch URL").optional().or(z.literal("")),
});

const announcementSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(160),
  body: z.string().trim().min(1, "Announcement body is required").max(2000),
  mediaItemId: z.string().trim().optional().or(z.literal("")),
});

export async function requireMediaProducer() {
  const user = await requireCompleteProfile();
  const allowed = await canManageCampusMedia(user.id, user.role);

  if (!allowed) {
    throw new Error(
      "Only Broadcasting club members and Broadcast Academy students can upload or go live.",
    );
  }

  return user;
}

/**
 * Step 1 of a video upload: authorize the producer and hand back a signed
 * Supabase URL the browser PUTs the file to directly. The bytes never touch
 * this server, which is what keeps 50 MB clips under Vercel's 4.5 MB request
 * body ceiling.
 */
export async function createVideoUploadTicketAction(input: {
  name: string;
  size: number;
  type?: string | null;
}): Promise<VideoUploadTicketState> {
  try {
    const user = await requireMediaProducer();
    const ticket = await createCampusVideoUploadTicket(input, user.id);

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

export async function uploadCampusVideoAction(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  try {
    const user = await requireMediaProducer();

    const parsed = uploadSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      videoUrl: formData.get("videoUrl") || "",
      category: (() => {
        const raw = String(formData.get("category") ?? "").trim();
        return raw || null;
      })(),
      isHighlightReel: formData.get("isHighlightReel") === "1",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid upload data." };
    }

    const file = formData.get("videoFile");
    const uploadedPath = String(formData.get("storagePath") ?? "").trim();
    let publicUrl = parsed.data.videoUrl || undefined;
    let storagePath: string | undefined;

    // Step 2 of the direct upload: the browser already pushed the file to
    // storage and hands back only the path, which we re-verify and resolve.
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
      if (!uploaded) {
        if (!publicUrl) {
          return {
            error:
              "Campus video storage is not configured. Paste a YouTube or hosted video URL instead.",
          };
        }
      } else {
        publicUrl = uploaded.publicUrl;
        storagePath = uploaded.storagePath;
      }
    }

    if (!publicUrl) {
      return { error: "Choose a video file or paste a hosted video URL." };
    }

    const organizationId = await resolveBroadcastOrganizationId();
    const category = parsed.data.category ?? null;
    const itemId = await createCampusVideoUpload({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      publicUrl,
      storagePath,
      organizationId: organizationId ?? undefined,
      category,
      isHighlightReel:
        parsed.data.isHighlightReel || category === "HIGHLIGHT_REEL",
    });

    if (!itemId) {
      return { error: "Unable to save your upload. Check database connectivity." };
    }

    revalidateMediaPaths();
    return { success: "Video published to the video library.", itemId };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to upload video.",
    };
  }
}

/**
 * Crew curation: add a clip to the Sports Highlight Reel or pull it back out.
 * Removing keeps the video in the library — only the reel placement changes.
 */
export async function setHighlightReelFlagAction(
  mediaId: string,
  isHighlightReel: boolean,
  fallbackCategory?: CampusMediaCategoryKey | null,
): Promise<MediaActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await setCampusMediaReelFlag({
      mediaId,
      actorId: user.id,
      role: user.role,
      isHighlightReel,
      fallbackCategory: fallbackCategory ?? null,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateMediaPaths();
    return {
      success: isHighlightReel
        ? "Added to the highlight reel."
        : "Removed from the reel — still in the video library.",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update the reel.",
    };
  }
}

/** Crew delete: pulls the video off every campus surface for good. */
export async function deleteCampusMediaAction(
  mediaId: string,
): Promise<MediaActionState> {
  try {
    const user = await requireCompleteProfile();
    const result = await deleteCampusMediaItem({
      mediaId,
      actorId: user.id,
      role: user.role,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    revalidateMediaPaths();
    return { success: `Deleted “${result.title}”.` };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to delete this video.",
    };
  }
}

export async function startLiveBroadcastAction(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  try {
    const user = await requireMediaProducer();

    const parsed = liveSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      embedUrl: formData.get("embedUrl") || "",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid live stream data." };
    }

    const organizationId = await resolveBroadcastOrganizationId();
    const started = await startCampusLiveStream({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      embedUrl: parsed.data.embedUrl || undefined,
      organizationId: organizationId ?? undefined,
    });

    if (!started) {
      return { error: "Unable to start live broadcast. Check database connectivity." };
    }

    revalidateMediaPaths();
    return {
      success: "You are live on Blue Don Live. Keep OBS streaming until you End broadcast.",
      itemId: started.id,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to start live broadcast.",
    };
  }
}

export async function endLiveBroadcastAction(itemId: string): Promise<MediaActionState> {
  try {
    await requireMediaProducer();
    const ended = await endCampusLiveStream(itemId);

    if (!ended) {
      return { error: "Unable to end this live stream." };
    }

    revalidateMediaPaths();
    return { success: "Broadcast ended — saved to Past Broadcasts." };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to end live broadcast.",
    };
  }
}

/**
 * Hands the RTMP ingest URL and stream key to an authorized operator on demand.
 * Credentials never ship in page props — the crew asks for them here.
 */
export async function revealStreamCredentialsAction(): Promise<StreamCredentialsState> {
  try {
    await requireMediaProducer();
    return { credentials: await getStudioStreamCredentials() };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to load stream credentials.",
    };
  }
}

export async function upsertDailyAnnouncementAction(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  try {
    const user = await requireMediaProducer();

    const parsed = announcementSchema.safeParse({
      title: formData.get("title"),
      body: formData.get("body"),
      mediaItemId: formData.get("mediaItemId") || "",
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid announcement." };
    }

    const saved = await upsertTodaysBroadcastAnnouncement({
      userId: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      mediaItemId: parsed.data.mediaItemId || null,
    });

    if (!saved) {
      return { error: "Unable to save today’s announcement. Check database connectivity." };
    }

    revalidateMediaPaths();
    return { success: "Today’s announcement is live for campus.", itemId: saved.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to save announcement.",
    };
  }
}
