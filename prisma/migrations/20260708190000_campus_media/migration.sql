CREATE TYPE "CampusMediaType" AS ENUM ('VIDEO_UPLOAD', 'LIVE_STREAM');
CREATE TYPE "CampusMediaStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'LIVE', 'ENDED');

CREATE TABLE "campus_media_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CampusMediaType" NOT NULL,
    "status" "CampusMediaStatus" NOT NULL DEFAULT 'DRAFT',
    "storage_path" TEXT,
    "public_url" TEXT,
    "thumbnail_url" TEXT,
    "embed_url" TEXT,
    "organization_id" TEXT,
    "uploaded_by_id" UUID NOT NULL,
    "published_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_media_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campus_media_items_status_idx" ON "campus_media_items"("status");
CREATE INDEX "campus_media_items_type_idx" ON "campus_media_items"("type");
CREATE INDEX "campus_media_items_organization_id_idx" ON "campus_media_items"("organization_id");
CREATE INDEX "campus_media_items_uploaded_by_id_idx" ON "campus_media_items"("uploaded_by_id");

ALTER TABLE "campus_media_items" ADD CONSTRAINT "campus_media_items_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "campus_media_items" ADD CONSTRAINT "campus_media_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
