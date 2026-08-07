-- Phase 7 of the Broadcast Control Studio: an operable run of show and a real
-- sponsor book.
--
-- studio_run_of_show holds progress only — the slot keys of today's rundown and
-- which one is on air. The words themselves stay in broadcast_daily_scripts, so
-- there is nothing here to drift out of sync with the script an operator reads.
--
-- studio_sponsors holds the broadcast-only facts about a sponsor (rotation
-- order, billboard duration, in tonight's book or not) and optionally adopts a
-- row from the campus partners directory for the name and logo. Sponsor cards
-- on studio_graphics keep a sponsor id rather than a copy, the same way score
-- cards keep a game id.

ALTER TYPE "StudioGraphicKind" ADD VALUE 'SPONSOR_FULL';

CREATE TABLE "studio_sponsors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "logo_url" TEXT,
    "partner_id" TEXT,
    "duration_seconds" INTEGER NOT NULL DEFAULT 15,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_live_at" TIMESTAMP(3),
    "updated_by_id" UUID,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_sponsors_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "studio_sponsors_is_active_priority_idx" ON "studio_sponsors"("is_active", "priority");
CREATE INDEX "studio_sponsors_partner_id_idx" ON "studio_sponsors"("partner_id");

ALTER TABLE "studio_sponsors"
  ADD CONSTRAINT "studio_sponsors_partner_id_fkey"
  FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "studio_sponsors"
  ADD CONSTRAINT "studio_sponsors_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "studio_graphics" ADD COLUMN "sponsor_id" TEXT;

CREATE INDEX "studio_graphics_sponsor_id_idx" ON "studio_graphics"("sponsor_id");

ALTER TABLE "studio_graphics"
  ADD CONSTRAINT "studio_graphics_sponsor_id_fkey"
  FOREIGN KEY ("sponsor_id") REFERENCES "studio_sponsors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "studio_run_of_show" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "show_date" DATE NOT NULL,
    "current_key" TEXT,
    "item_states" JSONB NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMP(3),
    "item_started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "updated_by_id" UUID,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_run_of_show_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "studio_run_of_show_key_show_date_key" ON "studio_run_of_show"("key", "show_date");

ALTER TABLE "studio_run_of_show"
  ADD CONSTRAINT "studio_run_of_show_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
