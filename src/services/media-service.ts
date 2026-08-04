import { randomBytes } from "crypto";

import {
  BROADCAST_ACADEMY_SLUG,
  BROADCAST_ORG_SLUG,
  CAMPUS_MEDIA_BUCKET,
  CAMPUS_MEDIA_MAX_BYTES,
  CAMPUS_MEDIA_VIDEO_TYPES,
  DEMO_SCHOOL_BROADCASTS,
  getBlueDonLiveStreamSecrets,
} from "@/config/broadcast-media";
import { isDatabaseConfigured, isSupabaseAdminConfigured } from "@/config/env";
import type { CampusRole } from "@/config/roles";
import { canManageAcademy } from "@/config/roles";
import type {
  CampusMediaCategory,
  CampusMediaStatus,
  CampusMediaType,
} from "@/generated/prisma/client";
import { hasOrgPermission } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

/**
 * Audience-safe media shape. Deliberately omits `streamKey` — these views are
 * serialized into client components across the whole campus. Crew fetch stream
 * credentials through {@link getStudioStreamCredentials} instead.
 */
export type CampusMediaItemView = {
  id: string;
  title: string;
  description: string | null;
  type: CampusMediaType;
  status: CampusMediaStatus;
  category: CampusMediaCategory | null;
  isHighlightReel: boolean;
  publicUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  organizationId: string | null;
  uploadedById: string;
  uploaderName: string;
  publishedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
};

export type VideoArchiveFilter =
  | "all"
  | "videos"
  | "past_lives"
  | "MORNING_ANNOUNCEMENTS"
  | "SPORTS_HIGHLIGHTS"
  | "STUDENT_SPOTLIGHT"
  | "SPECIAL_EVENTS"
  | "HIGHLIGHT_REEL";

function mapMediaRow(row: {
  id: string;
  title: string;
  description: string | null;
  type: CampusMediaType;
  status: CampusMediaStatus;
  category?: CampusMediaCategory | null;
  isHighlightReel?: boolean;
  publicUrl: string | null;
  embedUrl: string | null;
  thumbnailUrl: string | null;
  organizationId: string | null;
  uploadedById: string;
  publishedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  uploadedBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}): CampusMediaItemView {
  const uploaderName =
    row.uploadedBy.displayName?.trim() ||
    [row.uploadedBy.firstName, row.uploadedBy.lastName].filter(Boolean).join(" ") ||
    "Student";

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    category: row.category ?? null,
    isHighlightReel: Boolean(row.isHighlightReel),
    publicUrl: row.publicUrl,
    embedUrl: row.embedUrl,
    thumbnailUrl: row.thumbnailUrl,
    organizationId: row.organizationId,
    uploadedById: row.uploadedById,
    uploaderName,
    publishedAt: row.publishedAt,
    endedAt: row.endedAt,
    createdAt: row.createdAt,
  };
}

const mediaSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  status: true,
  category: true,
  isHighlightReel: true,
  publicUrl: true,
  embedUrl: true,
  thumbnailUrl: true,
  organizationId: true,
  uploadedById: true,
  publishedAt: true,
  endedAt: true,
  createdAt: true,
  uploadedBy: {
    select: {
      displayName: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

async function getBroadcastOrganizationId(): Promise<string | null> {
  const org = await withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { slug: BROADCAST_ORG_SLUG },
      select: { id: true },
    }),
  );

  return org?.id ?? null;
}

async function hasBroadcastAcademyMembership(userId: string): Promise<boolean> {
  const membership = await withDatabase((prisma) =>
    prisma.academyMembership.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        academy: { slug: BROADCAST_ACADEMY_SLUG },
      },
      select: { id: true },
    }),
  );

  return Boolean(membership);
}

export async function canManageCampusMedia(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  if (canManageAcademy(role)) {
    return true;
  }

  const broadcastOrgId = await getBroadcastOrganizationId();
  if (
    broadcastOrgId &&
    (await hasOrgPermission(userId, broadcastOrgId, "org:media:manage"))
  ) {
    return true;
  }

  return hasBroadcastAcademyMembership(userId);
}

function demoBroadcastViews(): CampusMediaItemView[] {
  return DEMO_SCHOOL_BROADCASTS.map((item, index) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    type: item.type,
    status: item.status,
    category:
      index === 0
        ? ("MORNING_ANNOUNCEMENTS" as const)
        : ("SPORTS_HIGHLIGHTS" as const),
    isHighlightReel: index === 1,
    publicUrl: item.publicUrl,
    embedUrl: item.embedUrl,
    thumbnailUrl: null,
    organizationId: null,
    uploadedById: "demo",
    uploaderName: item.uploaderName,
    publishedAt: null,
    endedAt: null,
    createdAt: new Date(),
  }));
}

export async function listSchoolBroadcasts(): Promise<CampusMediaItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return demoBroadcastViews();
  }

  const rows = await withDatabase((prisma) =>
    prisma.campusMediaItem.findMany({
      where: {
        status: { in: ["PUBLISHED", "LIVE", "ENDED"] },
      },
      orderBy: [{ status: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 48,
      select: mediaSelect,
    }),
  );

  return (rows ?? []).map(mapMediaRow);
}

/** Past broadcasts archive — PUBLISHED videos + ENDED lives (newest first). */
export async function listVideoArchive(options?: {
  organizationId?: string;
  filter?: VideoArchiveFilter;
  take?: number;
}): Promise<CampusMediaItemView[]> {
  const filter = options?.filter ?? "all";
  const take = options?.take ?? 48;

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    const demos = demoBroadcastViews().filter((item) => item.status !== "LIVE");
    if (filter === "videos") {
      return demos.filter((item) => item.type === "VIDEO_UPLOAD");
    }
    if (filter === "past_lives") {
      return demos.filter((item) => item.type === "LIVE_STREAM");
    }
    return demos;
  }

  const typeFilter =
    filter === "videos"
      ? ({ type: "VIDEO_UPLOAD" as const, status: "PUBLISHED" as const })
      : filter === "past_lives"
        ? ({ type: "LIVE_STREAM" as const, status: "ENDED" as const })
        : {
            OR: [
              { type: "VIDEO_UPLOAD" as const, status: "PUBLISHED" as const },
              { type: "LIVE_STREAM" as const, status: "ENDED" as const },
            ],
          };

  const rows = await withDatabase((prisma) =>
    prisma.campusMediaItem.findMany({
      where: {
        ...(options?.organizationId
          ? { organizationId: options.organizationId }
          : {}),
        ...typeFilter,
      },
      orderBy: [{ publishedAt: "desc" }, { endedAt: "desc" }, { createdAt: "desc" }],
      take,
      select: mediaSelect,
    }),
  );

  return (rows ?? []).map(mapMediaRow);
}

export async function listUserMediaUploads(
  userId: string,
): Promise<CampusMediaItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.campusMediaItem.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: "desc" },
      take: 48,
      select: mediaSelect,
    }),
  );

  return (rows ?? []).map(mapMediaRow);
}

export async function listOrganizationMedia(
  organizationId: string,
): Promise<CampusMediaItemView[]> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return demoBroadcastViews();
  }

  const rows = await withDatabase((prisma) =>
    prisma.campusMediaItem.findMany({
      where: {
        organizationId,
        status: { in: ["PUBLISHED", "LIVE", "ENDED"] },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 48,
      select: mediaSelect,
    }),
  );

  return (rows ?? []).map(mapMediaRow);
}

export async function getActiveLiveStream(): Promise<CampusMediaItemView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const row = await withDatabase((prisma) =>
    prisma.campusMediaItem.findFirst({
      where: { type: "LIVE_STREAM", status: "LIVE" },
      orderBy: { publishedAt: "desc" },
      select: mediaSelect,
    }),
  );

  return row ? mapMediaRow(row) : null;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function resolveSessionStreamKey(): string {
  const shared = getBlueDonLiveStreamSecrets().streamKey;
  if (shared) {
    return shared;
  }
  return `bd-${randomBytes(8).toString("hex")}`;
}

export type StudioStreamCredentials = {
  ingestUrl: string;
  streamKey: string | null;
  /** Where the key came from, so the UI can explain what the operator is holding. */
  scope: "session" | "shared" | "none";
};

/**
 * Crew-only. Resolve the OBS stream target: the live session key when a stream
 * is already on air, otherwise the shared school key. Callers must check
 * {@link canManageCampusMedia} first — this function does not authorize.
 */
export async function getStudioStreamCredentials(): Promise<StudioStreamCredentials> {
  const { ingestUrl, streamKey: sharedKey } = getBlueDonLiveStreamSecrets();

  if (isDatabaseConfigured() && isPrismaReady()) {
    const row = await withDatabase((prisma) =>
      prisma.campusMediaItem.findFirst({
        where: { type: "LIVE_STREAM", status: "LIVE" },
        orderBy: { publishedAt: "desc" },
        select: { streamKey: true },
      }),
    );

    if (row?.streamKey) {
      return { ingestUrl, streamKey: row.streamKey, scope: "session" };
    }
  }

  return {
    ingestUrl,
    streamKey: sharedKey,
    scope: sharedKey ? "shared" : "none",
  };
}

export async function uploadCampusVideoFile(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  if (file.size > CAMPUS_MEDIA_MAX_BYTES) {
    throw new Error("Video must be 100 MB or smaller.");
  }

  if (
    !CAMPUS_MEDIA_VIDEO_TYPES.includes(
      file.type as (typeof CAMPUS_MEDIA_VIDEO_TYPES)[number],
    )
  ) {
    throw new Error("Upload MP4, WebM, or MOV video files.");
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const storagePath = `videos/${userId}/${Date.now()}-${sanitizeFilename(file.name)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(CAMPUS_MEDIA_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    console.error("[media] Storage upload failed:", error.message);
    throw new Error("Unable to upload video to campus storage.");
  }

  const { data } = admin.storage.from(CAMPUS_MEDIA_BUCKET).getPublicUrl(storagePath);

  return {
    storagePath,
    publicUrl: data.publicUrl,
  };
}

export async function createCampusVideoUpload(input: {
  userId: string;
  title: string;
  description?: string;
  publicUrl: string;
  storagePath?: string;
  organizationId?: string;
  category?: CampusMediaCategory | null;
  isHighlightReel?: boolean;
}): Promise<string | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const item = await withDatabase((prisma) =>
    prisma.campusMediaItem.create({
      data: {
        title: input.title,
        description: input.description,
        type: "VIDEO_UPLOAD",
        status: "PUBLISHED",
        category: input.category ?? null,
        isHighlightReel:
          input.isHighlightReel ?? input.category === "HIGHLIGHT_REEL",
        publicUrl: input.publicUrl,
        storagePath: input.storagePath,
        organizationId: input.organizationId,
        uploadedById: input.userId,
        publishedAt: new Date(),
      },
      select: { id: true },
    }),
  );

  return item?.id ?? null;
}

export async function startCampusLiveStream(input: {
  userId: string;
  title: string;
  description?: string;
  embedUrl?: string;
  organizationId?: string;
}): Promise<{ id: string; streamKey: string } | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const streamKey = resolveSessionStreamKey();

  const item = await withDatabase(async (prisma) => {
    await prisma.campusMediaItem.updateMany({
      where: { type: "LIVE_STREAM", status: "LIVE" },
      data: { status: "ENDED", endedAt: new Date() },
    });

    return prisma.campusMediaItem.create({
      data: {
        title: input.title,
        description: input.description,
        type: "LIVE_STREAM",
        status: "LIVE",
        embedUrl: input.embedUrl,
        streamKey,
        organizationId: input.organizationId,
        uploadedById: input.userId,
        publishedAt: new Date(),
      },
      select: { id: true, streamKey: true },
    });
  });

  if (!item) {
    return null;
  }

  return { id: item.id, streamKey: item.streamKey ?? streamKey };
}

export async function endCampusLiveStream(itemId: string): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const result = await withDatabase((prisma) =>
    prisma.campusMediaItem.updateMany({
      where: {
        id: itemId,
        type: "LIVE_STREAM",
        status: "LIVE",
      },
      data: {
        status: "ENDED",
        endedAt: new Date(),
      },
    }),
  );

  return (result?.count ?? 0) > 0;
}

export async function resolveBroadcastOrganizationId(): Promise<string | null> {
  return getBroadcastOrganizationId();
}

export function isCampusMediaStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}
