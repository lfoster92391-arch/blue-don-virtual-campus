"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { upsertTodaysBroadcastAnnouncement } from "@/services/broadcast-announcement-service";
import {
  canManageCampusMedia,
  createCampusVideoUpload,
  endCampusLiveStream,
  resolveBroadcastOrganizationId,
  startCampusLiveStream,
  uploadCampusVideoFile,
} from "@/services/media-service";

export type MediaActionState = {
  error?: string;
  success?: string;
  itemId?: string;
  streamKey?: string;
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

function revalidateMediaPaths() {
  revalidatePath("/media");
  revalidatePath("/organizations/broadcasting");
  revalidatePath("/home");
}

async function requireMediaProducer() {
  const user = await requireCompleteProfile();
  const allowed = await canManageCampusMedia(user.id, user.role);

  if (!allowed) {
    throw new Error(
      "Only Broadcasting club members and Broadcast Academy students can upload or go live.",
    );
  }

  return user;
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
    let publicUrl = parsed.data.videoUrl || undefined;
    let storagePath: string | undefined;

    if (file instanceof File && file.size > 0) {
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
      streamKey: started.streamKey,
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
