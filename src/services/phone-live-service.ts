/**
 * Phone-browser live ingest.
 *
 * Each segment is a complete MP4/WebM file the watch page can play without a
 * media server. Credentials never leave this module — the browser only receives
 * a short-lived signed PUT URL, the same pattern as campus video uploads.
 */

import { CAMPUS_MEDIA_BUCKET } from "@/config/broadcast-media";
import { resolveCampusVideoContentType } from "@/config/campus-video";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import {
  PHONE_LIVE_EMBED,
  PHONE_LIVE_MAX_SEGMENT_BYTES,
  extensionForLiveMime,
  isPhoneLiveEmbed,
  phoneLiveStorageFolder,
} from "@/config/phone-live";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import {
  ensureCampusMediaBucket,
  getActiveLiveStream,
  type CampusMediaItemView,
  type CampusVideoUploadTicket,
} from "@/services/media-service";

export type PublicLiveWatchPayload = {
  live: null | {
    id: string;
    title: string;
    uploaderName: string;
    publishedAt: string | null;
    source: "phone" | "embed" | "studio";
    embedUrl: string | null;
    mimeType: "video/mp4" | "video/webm" | null;
    segments: { index: number; url: string }[];
  };
};

const SEGMENT_TYPES = ["video/mp4", "video/webm"] as const;

function normalizeSegmentType(
  name: string,
  reported: string | null | undefined,
): (typeof SEGMENT_TYPES)[number] | null {
  const resolved = resolveCampusVideoContentType(name, reported);
  if (resolved === "video/mp4" || resolved === "video/webm") {
    return resolved;
  }
  const mime = (reported ?? "").trim().toLowerCase().split(";")[0];
  if (mime === "video/mp4" || mime === "video/webm") {
    return mime;
  }
  return null;
}

function parseSegmentIndex(fileName: string): number | null {
  const match = fileName.match(/^(\d+)\.(mp4|webm)$/i);
  if (!match) {
    return null;
  }
  const index = Number.parseInt(match[1], 10);
  return Number.isFinite(index) && index >= 1 ? index : null;
}

export async function listPhoneLiveSegments(
  itemId: string,
): Promise<{ index: number; url: string; mimeType: "video/mp4" | "video/webm" }[]> {
  if (!isSupabaseAdminConfigured()) {
    return [];
  }

  const admin = createAdminClient();
  if (!admin) {
    return [];
  }

  const folder = phoneLiveStorageFolder(itemId);
  const { data, error } = await admin.storage.from(CAMPUS_MEDIA_BUCKET).list(folder, {
    limit: 100,
    sortBy: { column: "name", order: "asc" },
  });

  if (error || !data) {
    if (error) {
      console.error("[phone-live] list segments failed:", error.message);
    }
    return [];
  }

  const segments: { index: number; url: string; mimeType: "video/mp4" | "video/webm" }[] =
    [];

  for (const entry of data) {
    const index = parseSegmentIndex(entry.name);
    if (index === null) {
      continue;
    }
    const storagePath = `${folder}/${entry.name}`;
    const { data: published } = admin.storage
      .from(CAMPUS_MEDIA_BUCKET)
      .getPublicUrl(storagePath);
    segments.push({
      index,
      url: published.publicUrl,
      mimeType: entry.name.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/webm",
    });
  }

  return segments.sort((a, b) => a.index - b.index);
}

export async function getPublicLiveWatchPayload(): Promise<PublicLiveWatchPayload> {
  const active = await getActiveLiveStream();
  if (!active) {
    return { live: null };
  }

  if (active.isPhoneLive) {
    const segments = await listPhoneLiveSegments(active.id);
    const latest = segments[segments.length - 1];
    return {
      live: {
        id: active.id,
        title: active.title,
        uploaderName: active.uploaderName,
        publishedAt: active.publishedAt?.toISOString() ?? null,
        source: "phone",
        embedUrl: null,
        mimeType: latest?.mimeType ?? null,
        segments: segments.map(({ index, url }) => ({ index, url })),
      },
    };
  }

  const hosted =
    active.embedUrl && /^https?:\/\//i.test(active.embedUrl) ? active.embedUrl : null;

  return {
    live: {
      id: active.id,
      title: active.title,
      uploaderName: active.uploaderName,
      publishedAt: active.publishedAt?.toISOString() ?? null,
      source: hosted ? "embed" : "studio",
      embedUrl: hosted,
      mimeType: null,
      segments: [],
    },
  };
}

export async function createPhoneLiveSegmentTicket(input: {
  itemId: string;
  index: number;
  name: string;
  size: number;
  type?: string | null;
  actorId: string;
}): Promise<CampusVideoUploadTicket | { error: string }> {
  if (!isSupabaseAdminConfigured()) {
    return {
      error:
        "Campus video storage is not connected, so a phone cannot go live yet. Ask an advisor to finish storage setup.",
    };
  }

  if (!Number.isInteger(input.index) || input.index < 1 || input.index > 20_000) {
    return { error: "Invalid segment." };
  }

  if (input.size <= 0) {
    return { error: "That clip was empty. Try going live again." };
  }

  if (input.size > PHONE_LIVE_MAX_SEGMENT_BYTES) {
    return { error: "That clip was too large for a live segment. Stay at 720p." };
  }

  const live = await loadLiveItemForCrew(input.itemId);
  if ("error" in live) {
    return live;
  }

  const contentType = normalizeSegmentType(input.name, input.type);
  if (!contentType) {
    return { error: "Phone live needs MP4 or WebM clips." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return { error: "Campus video storage is not connected." };
  }

  await ensureCampusMediaBucket(admin);

  const ext = extensionForLiveMime(contentType);
  const storagePath = `${phoneLiveStorageFolder(input.itemId)}/${String(input.index).padStart(5, "0")}.${ext}`;

  const { data, error } = await admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error("[phone-live] Signed upload URL failed:", error?.message);
    return {
      error: `Campus storage did not hand out an upload slot (${error?.message ?? "unknown error"}).`,
    };
  }

  return {
    signedUrl: data.signedUrl,
    storagePath,
    contentType,
    maxBytes: PHONE_LIVE_MAX_SEGMENT_BYTES,
  };
}

async function loadLiveItemForCrew(
  itemId: string,
): Promise<{ id: string } | { error: string }> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "The media library is not connected right now." };
  }

  const item = await withDatabase((prisma) =>
    prisma.campusMediaItem.findUnique({
      where: { id: itemId },
      select: { id: true, type: true, status: true, embedUrl: true },
    }),
  );

  if (!item || item.type !== "LIVE_STREAM" || item.status !== "LIVE") {
    return { error: "That broadcast is not live anymore." };
  }

  if (!isPhoneLiveEmbed(item.embedUrl)) {
    return { error: "This live was not started from a phone." };
  }

  return { id: item.id };
}

export function phoneLiveEmbedUrl(): string {
  return PHONE_LIVE_EMBED;
}

export type PhoneLiveStartInput = {
  userId: string;
  title: string;
  description?: string;
  organizationId?: string;
};

export async function markPhoneLiveStorageFolder(
  itemId: string,
): Promise<void> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return;
  }

  await withDatabase((prisma) =>
    prisma.campusMediaItem.update({
      where: { id: itemId },
      data: { storagePath: `${phoneLiveStorageFolder(itemId)}/` },
    }),
  );
}

export function isPhoneLiveView(item: CampusMediaItemView): boolean {
  return item.isPhoneLive;
}
