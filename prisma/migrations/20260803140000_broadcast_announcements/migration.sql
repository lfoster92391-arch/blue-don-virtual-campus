-- Daily Broadcasting announcements + optional per-session stream key on media items.

ALTER TABLE "campus_media_items" ADD COLUMN IF NOT EXISTS "stream_key" TEXT;

CREATE TABLE "broadcast_announcements" (
    "id" TEXT NOT NULL,
    "announcement_date" DATE NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author_id" UUID NOT NULL,
    "media_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_announcements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broadcast_announcements_announcement_date_key" ON "broadcast_announcements"("announcement_date");
CREATE INDEX "broadcast_announcements_announcement_date_idx" ON "broadcast_announcements"("announcement_date");
CREATE INDEX "broadcast_announcements_author_id_idx" ON "broadcast_announcements"("author_id");
CREATE INDEX "broadcast_announcements_media_item_id_idx" ON "broadcast_announcements"("media_item_id");

ALTER TABLE "broadcast_announcements" ADD CONSTRAINT "broadcast_announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "broadcast_announcements" ADD CONSTRAINT "broadcast_announcements_media_item_id_fkey" FOREIGN KEY ("media_item_id") REFERENCES "campus_media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
