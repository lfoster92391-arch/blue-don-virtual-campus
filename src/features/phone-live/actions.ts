"use server";

import { z } from "zod";

import {
  endLiveBroadcastAction,
  requirePhoneLiveProducer,
  type MediaActionState,
} from "@/features/media/actions";
import { revalidateMediaPaths } from "@/lib/media/revalidate";
import {
  createPhoneLiveSegmentTicket,
  markPhoneLiveStorageFolder,
  phoneLiveEmbedUrl,
} from "@/services/phone-live-service";
import {
  resolveBroadcastOrganizationId,
  startCampusLiveStream,
  type CampusVideoUploadTicket,
} from "@/services/media-service";

export type PhoneLiveActionState = MediaActionState;

const startSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(500).optional(),
});

const segmentSchema = z.object({
  itemId: z.string().trim().min(1),
  index: z.number().int().min(1).max(20_000),
  name: z.string().trim().min(1).max(80),
  size: z.number().int().positive(),
  type: z.string().trim().max(80).optional().nullable(),
});

/**
 * Phone Go Live — writes the campus LIVE row marked as a phone encoder.
 * The browser then keeps getUserMedia on and uploads segments. No OBS.
 */
export async function startPhoneLiveBroadcastAction(input: {
  title: string;
  description?: string;
}): Promise<PhoneLiveActionState> {
  try {
    const user = await requirePhoneLiveProducer();
    const parsed = startSchema.safeParse(input);

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Name today's show first." };
    }

    const organizationId = await resolveBroadcastOrganizationId();
    const started = await startCampusLiveStream({
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      embedUrl: phoneLiveEmbedUrl(),
      organizationId: organizationId ?? undefined,
    });

    if (!started) {
      return { error: "Unable to start live broadcast. Check database connectivity." };
    }

    await markPhoneLiveStorageFolder(started.id);
    revalidateMediaPaths();

    return {
      success: "You are live from this phone. Keep this page open until you End broadcast.",
      itemId: started.id,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to start a phone live broadcast.",
    };
  }
}

export async function createPhoneLiveSegmentTicketAction(input: {
  itemId: string;
  index: number;
  name: string;
  size: number;
  type?: string | null;
}): Promise<{ error?: string; ticket?: CampusVideoUploadTicket }> {
  try {
    const user = await requirePhoneLiveProducer();
    const parsed = segmentSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid live clip." };
    }

    const result = await createPhoneLiveSegmentTicket({
      ...parsed.data,
      actorId: user.id,
    });

    if ("error" in result) {
      return { error: result.error };
    }

    return { ticket: result };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to upload this live clip.",
    };
  }
}

export async function endPhoneLiveBroadcastAction(
  itemId: string,
): Promise<MediaActionState> {
  return endLiveBroadcastAction(itemId);
}
