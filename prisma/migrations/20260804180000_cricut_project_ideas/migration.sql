-- Cricut Club dollar-store project hub: idea catalog + personal make/sell builds

DO $$ BEGIN
  CREATE TYPE "CricutProjectDifficulty" AS ENUM ('EASY', 'MEDIUM', 'ADVANCED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CricutProjectBuildIntent" AS ENUM ('MAKE', 'SELL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CricutProjectBuildStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "cricut_project_ideas" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "materials" JSONB NOT NULL,
    "steps" JSONB NOT NULL,
    "estimated_cost_cents" INTEGER NOT NULL,
    "suggested_sell_price_cents" INTEGER NOT NULL,
    "image_url" TEXT,
    "storage_path" TEXT,
    "dollar_store_tag" TEXT,
    "difficulty" "CricutProjectDifficulty" NOT NULL DEFAULT 'EASY',
    "time_minutes" INTEGER,
    "sell_notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cricut_project_ideas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cricut_project_ideas_slug_key" ON "cricut_project_ideas"("slug");
CREATE INDEX IF NOT EXISTS "cricut_project_ideas_organization_id_active_idx" ON "cricut_project_ideas"("organization_id", "active");
CREATE INDEX IF NOT EXISTS "cricut_project_ideas_difficulty_idx" ON "cricut_project_ideas"("difficulty");

ALTER TABLE "cricut_project_ideas" DROP CONSTRAINT IF EXISTS "cricut_project_ideas_organization_id_fkey";
ALTER TABLE "cricut_project_ideas" ADD CONSTRAINT "cricut_project_ideas_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_project_ideas" DROP CONSTRAINT IF EXISTS "cricut_project_ideas_created_by_id_fkey";
ALTER TABLE "cricut_project_ideas" ADD CONSTRAINT "cricut_project_ideas_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "cricut_project_builds" (
    "id" TEXT NOT NULL,
    "idea_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "intent" "CricutProjectBuildIntent" NOT NULL DEFAULT 'MAKE',
    "status" "CricutProjectBuildStatus" NOT NULL DEFAULT 'PLANNED',
    "completed_steps" JSONB NOT NULL DEFAULT '[]',
    "gathered_materials" JSONB NOT NULL DEFAULT '[]',
    "notes" TEXT,
    "listed_item_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cricut_project_builds_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "cricut_project_builds_idea_id_user_id_key" ON "cricut_project_builds"("idea_id", "user_id");
CREATE INDEX IF NOT EXISTS "cricut_project_builds_user_id_status_idx" ON "cricut_project_builds"("user_id", "status");
CREATE INDEX IF NOT EXISTS "cricut_project_builds_idea_id_idx" ON "cricut_project_builds"("idea_id");

ALTER TABLE "cricut_project_builds" DROP CONSTRAINT IF EXISTS "cricut_project_builds_idea_id_fkey";
ALTER TABLE "cricut_project_builds" ADD CONSTRAINT "cricut_project_builds_idea_id_fkey" FOREIGN KEY ("idea_id") REFERENCES "cricut_project_ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_project_builds" DROP CONSTRAINT IF EXISTS "cricut_project_builds_user_id_fkey";
ALTER TABLE "cricut_project_builds" ADD CONSTRAINT "cricut_project_builds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_project_builds" DROP CONSTRAINT IF EXISTS "cricut_project_builds_listed_item_id_fkey";
ALTER TABLE "cricut_project_builds" ADD CONSTRAINT "cricut_project_builds_listed_item_id_fkey" FOREIGN KEY ("listed_item_id") REFERENCES "cricut_shop_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
