import { randomBytes } from "crypto";

import {
  BROADCAST_ACADEMY_SLUG,
  BROADCAST_ORG_SLUG,
  CAMPUS_MEDIA_BUCKET,
  CAMPUS_MEDIA_MAX_BYTES,
  CAMPUS_MEDIA_MAX_LABEL,
  CAMPUS_MEDIA_VIDEO_TYPES,
  DEMO_SCHOOL_BROADCASTS,
  getBlueDonLiveStreamSecrets,
  resolveCampusVideoContentType,
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

/**
 * On the Broadcasting roster today — any ACTIVE club member or Broadcast
 * Academy member, officer or not.
 *
 * This is deliberately weaker than {@link canManageCampusMedia}, which needs
 * the `org:media:manage` officer permission. Publishing video, driving OBS, and
 * selling sponsor slots stay with the officers; writing the crew's own show is
 * the whole point of being on the crew.
 */
export async function isBroadcastCrewMember(userId: string): Promise<boolean> {
  try {
    const broadcastOrgId = await getBroadcastOrganizationId();
    if (broadcastOrgId) {
      const membership = await withDatabase((prisma) =>
        prisma.organizationMembership.findUnique({
          where: {
            organizationId_userId: { organizationId: broadcastOrgId, userId },
          },
          select: { status: true },
        }),
      );
      if (membership?.status === "ACTIVE") {
        return true;
      }
    }

    return await hasBroadcastAcademyMembership(userId);
  } catch (error) {
    console.error("[media] isBroadcastCrewMember failed:", error);
    return false;
  }
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

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;

/**
 * A fresh Supabase project has no buckets, and every upload then fails with an
 * opaque "Bucket not found". Create `campus-media` on first use rather than
 * relying on someone having run a setup script.
 *
 * Cached per server instance: the happy path is a single `getBucket` on the
 * first upload after a cold start, and nothing afterwards.
 */
let bucketReady: Promise<void> | null = null;

export async function ensureCampusMediaBucket(admin: AdminClient): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data } = await admin.storage.getBucket(CAMPUS_MEDIA_BUCKET);
      if (data) {
        return;
      }

      const { error } = await admin.storage.createBucket(CAMPUS_MEDIA_BUCKET, {
        public: true,
        fileSizeLimit: CAMPUS_MEDIA_MAX_BYTES,
      });

      // A parallel request may have won the race; that is a success for us.
      if (error && !/already exists/i.test(error.message)) {
        throw new Error(
          `Campus media storage is unavailable (${error.message}). Ask an admin to create the ${CAMPUS_MEDIA_BUCKET} bucket.`,
        );
      }
    })().catch((error) => {
      bucketReady = null;
      throw error;
    });
  }

  return bucketReady;
}

function buildVideoStoragePath(userId: string, fileName: string): string {
  return `videos/${userId}/${Date.now()}-${sanitizeFilename(fileName)}`;
}

/** Shared file validation for both the direct-upload and server-relay paths. */
function assertUploadableVideo(input: {
  name: string;
  size: number;
  type?: string | null;
}): (typeof CAMPUS_MEDIA_VIDEO_TYPES)[number] {
  if (input.size <= 0) {
    throw new Error("That file is empty. Pick the video again and retry.");
  }

  if (input.size > CAMPUS_MEDIA_MAX_BYTES) {
    throw new Error(
      `Video must be ${CAMPUS_MEDIA_MAX_LABEL} or smaller. Trim the clip, export at 1080p, or paste a hosted video URL instead.`,
    );
  }

  const contentType = resolveCampusVideoContentType(input.name, input.type);
  if (!contentType) {
    throw new Error(
      "Upload an MP4, WebM, or MOV video file. (Convert .avi, .mkv, or .wmv to MP4 first.)",
    );
  }

  return contentType;
}

export type CampusVideoUploadTicket = {
  /** Pre-authorized one-shot PUT target — the file never passes through our server. */
  signedUrl: string;
  storagePath: string;
  contentType: string;
  maxBytes: number;
};

/**
 * Issues a signed Supabase upload URL so the browser can send the video
 * straight to storage.
 *
 * Video cannot be relayed through a Server Action in production: Next.js caps
 * action bodies at 1 MB by default and Vercel rejects any function request body
 * over 4.5 MB at the infrastructure level, which no config can raise. Every
 * real clip exceeds both.
 *
 * Callers must authorize with {@link canManageCampusMedia} first.
 */
export async function createCampusVideoUploadTicket(
  input: { name: string; size: number; type?: string | null },
  userId: string,
): Promise<CampusVideoUploadTicket | null> {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  const contentType = assertUploadableVideo(input);

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  await ensureCampusMediaBucket(admin);

  const storagePath = buildVideoStoragePath(userId, input.name);
  const { data, error } = await admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    console.error("[media] Signed upload URL failed:", error?.message);
    throw new Error(
      `Campus storage did not hand out an upload slot (${error?.message ?? "unknown error"}).`,
    );
  }

  return {
    signedUrl: data.signedUrl,
    storagePath,
    contentType,
    maxBytes: CAMPUS_MEDIA_MAX_BYTES,
  };
}

/**
 * Confirms a browser-uploaded object really landed, and resolves its public URL
 * server-side. The client only ever hands back a storage path — never a URL —
 * so a tampered form cannot point a media item at arbitrary content.
 */
export async function resolveUploadedCampusVideo(
  storagePath: string,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  const expectedPrefix = `videos/${userId}/`;
  if (!storagePath.startsWith(expectedPrefix) || storagePath.includes("..")) {
    throw new Error("That upload does not belong to your account. Try again.");
  }

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  const separator = storagePath.lastIndexOf("/");
  const directory = storagePath.slice(0, separator);
  const fileName = storagePath.slice(separator + 1);

  const { data, error } = await admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .list(directory, { search: fileName, limit: 1 });

  if (error) {
    console.error("[media] Upload verification failed:", error.message);
    throw new Error("Could not confirm the uploaded video in campus storage.");
  }

  const object = data?.find((entry) => entry.name === fileName);
  if (!object) {
    throw new Error(
      "The video did not finish uploading. Check your connection and try again.",
    );
  }

  const { data: published } = admin.storage
    .from(CAMPUS_MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, publicUrl: published.publicUrl };
}

/**
 * Server-relayed upload. Only reachable for small files (the Server Action body
 * cap applies) — the browser uses {@link createCampusVideoUploadTicket} instead.
 * Kept so the form still works with JavaScript disabled.
 */
export async function uploadCampusVideoFile(
  file: File,
  userId: string,
): Promise<{ storagePath: string; publicUrl: string } | null> {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  const contentType = assertUploadableVideo({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  const admin = createAdminClient();
  if (!admin) {
    return null;
  }

  await ensureCampusMediaBucket(admin);

  const storagePath = buildVideoStoragePath(userId, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage.from(CAMPUS_MEDIA_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.error("[media] Storage upload failed:", error.message);
    throw new Error(`Unable to upload video to campus storage (${error.message}).`);
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

/**
 * Curation toggle for the Sports Highlight Reel.
 *
 * Two signals put a clip in the reel — the `isHighlightReel` flag and the
 * `HIGHLIGHT_REEL` category — so clearing only the flag would leave the clip
 * on the reel. When removing, a categorized clip is demoted to
 * `fallbackCategory` (the surface's own category) so it stays in the library.
 */
export async function setCampusMediaReelFlag(input: {
  mediaId: string;
  actorId: string;
  role: CampusRole;
  isHighlightReel: boolean;
  fallbackCategory?: CampusMediaCategory | null;
}): Promise<{ ok: true } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can curate the highlight reel." };
  }

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "The media library is not connected right now." };
  }

  const existing = await withDatabase((prisma) =>
    prisma.campusMediaItem.findUnique({
      where: { id: input.mediaId },
      select: { id: true, category: true },
    }),
  );

  if (!existing) {
    return { error: "That video is no longer in the library." };
  }

  const category = input.isHighlightReel
    ? existing.category
    : existing.category === "HIGHLIGHT_REEL"
      ? (input.fallbackCategory ?? null)
      : existing.category;

  const updated = await withDatabase((prisma) =>
    prisma.campusMediaItem.update({
      where: { id: input.mediaId },
      data: { isHighlightReel: input.isHighlightReel, category },
      select: { id: true },
    }),
  );

  if (!updated) {
    return { error: "Unable to update the reel. Try again." };
  }

  return { ok: true };
}

/**
 * Permanently removes an upload or past broadcast from the media library.
 *
 * The row goes first because that is what every surface reads from; the
 * stored object is best-effort cleanup afterwards. Storage that outlives its
 * row is invisible waste, but a failed storage call that blocked the delete
 * would leave the clip playing on a student-facing page, which is the outcome
 * a producer is trying to prevent.
 *
 * Drive/YouTube items carry no `storagePath`, so the row is the whole record.
 */
export async function deleteCampusMediaItem(input: {
  mediaId: string;
  actorId: string;
  role: CampusRole;
}): Promise<{ ok: true; title: string } | { error: string }> {
  if (!(await canManageCampusMedia(input.actorId, input.role))) {
    return { error: "Only Broadcasting crew can delete campus videos." };
  }

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return { error: "The media library is not connected right now." };
  }

  const existing = await withDatabase((prisma) =>
    prisma.campusMediaItem.findUnique({
      where: { id: input.mediaId },
      select: { id: true, title: true, status: true, storagePath: true },
    }),
  );

  if (!existing) {
    return { error: "That video is no longer in the library." };
  }

  if (existing.status === "LIVE") {
    return { error: "End the live broadcast before deleting it." };
  }

  const deleted = await withDatabase((prisma) =>
    prisma.campusMediaItem.delete({
      where: { id: input.mediaId },
      select: { id: true },
    }),
  );

  if (!deleted) {
    return { error: "Unable to delete this video. Try again." };
  }

  if (existing.storagePath) {
    try {
      const admin = createAdminClient();
      const { error } = (await admin?.storage
        .from(CAMPUS_MEDIA_BUCKET)
        .remove([existing.storagePath])) ?? { error: null };

      if (error) {
        console.error("[media] Storage cleanup failed:", error.message);
      }
    } catch (error) {
      console.error("[media] Storage cleanup threw:", error);
    }
  }

  return { ok: true, title: existing.title };
}

export function isCampusMediaStorageConfigured(): boolean {
  return isSupabaseAdminConfigured();
}

/* ------------------------------------------------- Madonna hub video feeds */

/**
 * Flattened card used by the Madonna hub grids. Sports recap merges two
 * sources (campus media uploads and sports-desk highlights), so the pages
 * render this instead of {@link CampusMediaItemView}.
 */
export type CampusVideoCard = {
  id: string;
  /** Where the row came from, so the UI can label sports-desk submissions. */
  source: "media" | "highlight";
  title: string;
  description: string | null;
  /** Direct file URL or embeddable page URL. Null means nothing to play yet. */
  url: string | null;
  thumbnailUrl: string | null;
  /** Short badge text — category, sport, or clip kind. */
  kicker: string;
  credit: string;
  /** Raw category for crew curation controls. Null for sports-desk rows. */
  category: CampusMediaCategory | null;
  isHighlightReel: boolean;
  /** True for ended live streams replayed from the archive. */
  isReplay: boolean;
  publishedAt: Date | null;
  /** Normalized timestamp the grids sort on (newest first). */
  sortAt: Date;
};

/** Categories that always belong in Madonna Sports Recap. */
const SPORTS_RECAP_CATEGORIES = ["SPORTS_HIGHLIGHTS", "HIGHLIGHT_REEL"] as const;

/**
 * True when a stream is tagged as sports coverage, so Sports Recap can play it
 * inline instead of pointing at the announcements surface.
 */
export function isSportsTaggedMedia(item: CampusMediaItemView | null): boolean {
  if (!item) {
    return false;
  }
  return (
    item.isHighlightReel ||
    item.category === "SPORTS_HIGHLIGHTS" ||
    item.category === "HIGHLIGHT_REEL"
  );
}

/** Published uploads plus ended live streams — the "watchable archive" filter. */
const WATCHABLE_ARCHIVE = [
  { type: "VIDEO_UPLOAD" as const, status: "PUBLISHED" as const },
  { type: "LIVE_STREAM" as const, status: "ENDED" as const },
];

function mediaViewToCard(item: CampusMediaItemView, kicker: string): CampusVideoCard {
  const sortAt = item.publishedAt ?? item.endedAt ?? item.createdAt;

  return {
    id: item.id,
    source: "media",
    title: item.title,
    description: item.description,
    url: item.publicUrl ?? item.embedUrl,
    thumbnailUrl: item.thumbnailUrl,
    kicker,
    credit: item.uploaderName,
    category: item.category,
    isHighlightReel: item.isHighlightReel || item.category === "HIGHLIGHT_REEL",
    isReplay: item.type === "LIVE_STREAM",
    publishedAt: item.publishedAt ?? item.endedAt,
    sortAt,
  };
}

function categoryKicker(category: CampusMediaCategory | null): string {
  switch (category) {
    case "MORNING_ANNOUNCEMENTS":
      return "Morning Announcements";
    case "SPORTS_HIGHLIGHTS":
      return "Sports Highlights";
    case "STUDENT_SPOTLIGHT":
      return "Student Spotlight";
    case "SPECIAL_EVENTS":
      return "Special Events";
    case "HIGHLIGHT_REEL":
      return "Highlight Reel";
    default:
      return "Broadcasting";
  }
}

function sortCardsNewestFirst(cards: CampusVideoCard[]): CampusVideoCard[] {
  return cards.sort((a, b) => b.sortAt.getTime() - a.sortAt.getTime());
}

/**
 * Every sports / recap video the crew has published, newest first.
 *
 * Category tagging is still partial, so three signals are unioned:
 * `SPORTS_HIGHLIGHTS` / `HIGHLIGHT_REEL` categories, the `isHighlightReel`
 * flag, and any media item linked from a {@link SportsHighlight}. Published
 * sports-desk highlights that carry their own video URL (no linked upload)
 * are merged in as well so nothing the crew posts goes missing.
 */
export async function listSportsRecapVideos(options?: {
  take?: number;
}): Promise<CampusVideoCard[]> {
  const take = options?.take ?? 120;

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return sortCardsNewestFirst(
      demoBroadcastViews()
        .filter(
          (item) =>
            item.status !== "LIVE" &&
            (item.isHighlightReel ||
              item.category === "SPORTS_HIGHLIGHTS" ||
              item.category === "HIGHLIGHT_REEL"),
        )
        .map((item) => mediaViewToCard(item, categoryKicker(item.category))),
    );
  }

  const [mediaRows, highlightRows] = await Promise.all([
    withDatabase((prisma) =>
      prisma.campusMediaItem.findMany({
        where: {
          OR: WATCHABLE_ARCHIVE,
          AND: [
            {
              OR: [
                { category: { in: [...SPORTS_RECAP_CATEGORIES] } },
                { isHighlightReel: true },
                { sportsHighlights: { some: {} } },
              ],
            },
          ],
        },
        orderBy: [
          { publishedAt: "desc" },
          { endedAt: "desc" },
          { createdAt: "desc" },
        ],
        take,
        select: {
          ...mediaSelect,
          sportsHighlights: {
            take: 1,
            select: { sport: { select: { name: true } } },
          },
        },
      }),
    ),
    withDatabase((prisma) =>
      prisma.sportsHighlight.findMany({
        where: {
          status: "PUBLISHED",
          mediaItemId: null,
          videoUrl: { not: null },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take,
        select: {
          id: true,
          title: true,
          description: true,
          videoUrl: true,
          imageUrl: true,
          credit: true,
          submittedByName: true,
          publishedAt: true,
          createdAt: true,
          sport: { select: { name: true } },
        },
      }),
    ),
  ]);

  const cards: CampusVideoCard[] = [];

  for (const row of mediaRows ?? []) {
    const view = mapMediaRow(row);
    const sportName = row.sportsHighlights[0]?.sport?.name ?? null;
    cards.push(mediaViewToCard(view, sportName ?? categoryKicker(view.category)));
  }

  for (const row of highlightRows ?? []) {
    cards.push({
      id: `highlight-${row.id}`,
      source: "highlight",
      title: row.title,
      description: row.description,
      url: row.videoUrl,
      thumbnailUrl: row.imageUrl,
      kicker: row.sport?.name ?? "Sports desk",
      credit: row.credit?.trim() || row.submittedByName?.trim() || "Sports desk",
      category: null,
      isHighlightReel: false,
      isReplay: false,
      publishedAt: row.publishedAt,
      sortAt: row.publishedAt ?? row.createdAt,
    });
  }

  return sortCardsNewestFirst(cards).slice(0, take);
}

/**
 * Announcement videos for the Madonna Broadcast page — anything tagged
 * `MORNING_ANNOUNCEMENTS` plus media attached to a Daily Announcement.
 */
export async function listAnnouncementVideos(options?: {
  take?: number;
}): Promise<CampusVideoCard[]> {
  const take = options?.take ?? 60;

  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return sortCardsNewestFirst(
      demoBroadcastViews()
        .filter(
          (item) =>
            item.status !== "LIVE" && item.category === "MORNING_ANNOUNCEMENTS",
        )
        .map((item) => mediaViewToCard(item, categoryKicker(item.category))),
    );
  }

  const rows = await withDatabase((prisma) =>
    prisma.campusMediaItem.findMany({
      where: {
        OR: WATCHABLE_ARCHIVE,
        AND: [
          {
            OR: [
              { category: "MORNING_ANNOUNCEMENTS" },
              { announcements: { some: {} } },
            ],
          },
        ],
      },
      orderBy: [
        { publishedAt: "desc" },
        { endedAt: "desc" },
        { createdAt: "desc" },
      ],
      take,
      select: mediaSelect,
    }),
  );

  return sortCardsNewestFirst(
    (rows ?? [])
      .map(mapMediaRow)
      .map((view) => mediaViewToCard(view, categoryKicker(view.category))),
  );
}
