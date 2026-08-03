import { DEMO_DAILY_ANNOUNCEMENT } from "@/config/broadcast-media";
import { isDatabaseConfigured } from "@/config/env";
import { CLEAN_SLATE } from "@/config/app-mode";
import { isPrismaReady, withDatabase } from "@/lib/prisma";

export type BroadcastAnnouncementView = {
  id: string;
  title: string;
  body: string;
  announcementDate: Date;
  authorName: string;
  mediaItemId: string | null;
  updatedAt: Date;
};

function startOfUtcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function mapAnnouncement(row: {
  id: string;
  title: string;
  body: string;
  announcementDate: Date;
  mediaItemId: string | null;
  updatedAt: Date;
  author: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
}): BroadcastAnnouncementView {
  const authorName =
    row.author.displayName?.trim() ||
    [row.author.firstName, row.author.lastName].filter(Boolean).join(" ") ||
    "Broadcasting";

  return {
    id: row.id,
    title: row.title,
    body: row.body,
    announcementDate: row.announcementDate,
    authorName,
    mediaItemId: row.mediaItemId,
    updatedAt: row.updatedAt,
  };
}

const announcementSelect = {
  id: true,
  title: true,
  body: true,
  announcementDate: true,
  mediaItemId: true,
  updatedAt: true,
  author: {
    select: {
      displayName: true,
      firstName: true,
      lastName: true,
    },
  },
} as const;

export async function getTodaysBroadcastAnnouncement(): Promise<BroadcastAnnouncementView | null> {
  try {
    if (!isDatabaseConfigured() || !isPrismaReady()) {
      if (CLEAN_SLATE) {
        return null;
      }
      return {
        id: DEMO_DAILY_ANNOUNCEMENT.id,
        title: DEMO_DAILY_ANNOUNCEMENT.title,
        body: DEMO_DAILY_ANNOUNCEMENT.body,
        announcementDate: DEMO_DAILY_ANNOUNCEMENT.announcementDate,
        authorName: DEMO_DAILY_ANNOUNCEMENT.authorName,
        mediaItemId: DEMO_DAILY_ANNOUNCEMENT.mediaItemId,
        updatedAt: new Date(),
      };
    }

    const today = startOfUtcDay();
    const row = await withDatabase((prisma) =>
      prisma.broadcastAnnouncement.findUnique({
        where: { announcementDate: today },
        select: announcementSelect,
      }),
    );

    return row ? mapAnnouncement(row) : null;
  } catch (error) {
    console.error("[broadcast] getTodaysBroadcastAnnouncement failed:", error);
    return null;
  }
}

export async function upsertTodaysBroadcastAnnouncement(input: {
  userId: string;
  title: string;
  body: string;
  mediaItemId?: string | null;
}): Promise<BroadcastAnnouncementView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  const today = startOfUtcDay();
  const row = await withDatabase((prisma) =>
    prisma.broadcastAnnouncement.upsert({
      where: { announcementDate: today },
      create: {
        announcementDate: today,
        title: input.title,
        body: input.body,
        authorId: input.userId,
        mediaItemId: input.mediaItemId ?? null,
      },
      update: {
        title: input.title,
        body: input.body,
        authorId: input.userId,
        mediaItemId: input.mediaItemId ?? undefined,
      },
      select: announcementSelect,
    }),
  );

  return row ? mapAnnouncement(row) : null;
}
