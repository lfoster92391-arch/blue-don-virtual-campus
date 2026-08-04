-- Cricut Club production shop: sellable catalog, order tracking, designs, wishlist

ALTER TABLE "organizations" ADD COLUMN IF NOT EXISTS "amazon_wishlist_url" TEXT;

ALTER TABLE "cricut_shop_items" ADD COLUMN IF NOT EXISTS "available_to_sell" BOOLEAN NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS "cricut_shop_items_available_to_sell_idx" ON "cricut_shop_items"("available_to_sell");

ALTER TABLE "cricut_shop_orders" ADD COLUMN IF NOT EXISTS "contact_name" TEXT;
ALTER TABLE "cricut_shop_orders" ADD COLUMN IF NOT EXISTS "contact_email" TEXT;
ALTER TABLE "cricut_shop_orders" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;
ALTER TABLE "cricut_shop_orders" ADD COLUMN IF NOT EXISTS "customization_notes" TEXT;
ALTER TABLE "cricut_shop_orders" ADD COLUMN IF NOT EXISTS "assigned_to_id" UUID;

CREATE INDEX IF NOT EXISTS "cricut_shop_orders_assigned_to_id_idx" ON "cricut_shop_orders"("assigned_to_id");

ALTER TABLE "cricut_shop_orders" DROP CONSTRAINT IF EXISTS "cricut_shop_orders_assigned_to_id_fkey";
ALTER TABLE "cricut_shop_orders" ADD CONSTRAINT "cricut_shop_orders_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend order status enum (Postgres ADD VALUE is transactional-safe when not in same tx as use)
DO $$ BEGIN
  ALTER TYPE "CricutShopOrderStatus" ADD VALUE IF NOT EXISTS 'IN_PRODUCTION';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "CricutShopOrderStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "CricutShopOrderStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CricutDesignStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'IN_PRODUCTION', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "cricut_design_submissions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "submitter_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "storage_path" TEXT,
    "status" "CricutDesignStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cricut_design_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "cricut_design_submissions_organization_id_status_idx" ON "cricut_design_submissions"("organization_id", "status");
CREATE INDEX IF NOT EXISTS "cricut_design_submissions_submitter_id_idx" ON "cricut_design_submissions"("submitter_id");
CREATE INDEX IF NOT EXISTS "cricut_design_submissions_status_idx" ON "cricut_design_submissions"("status");

ALTER TABLE "cricut_design_submissions" DROP CONSTRAINT IF EXISTS "cricut_design_submissions_organization_id_fkey";
ALTER TABLE "cricut_design_submissions" ADD CONSTRAINT "cricut_design_submissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_design_submissions" DROP CONSTRAINT IF EXISTS "cricut_design_submissions_submitter_id_fkey";
ALTER TABLE "cricut_design_submissions" ADD CONSTRAINT "cricut_design_submissions_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_design_submissions" DROP CONSTRAINT IF EXISTS "cricut_design_submissions_reviewed_by_id_fkey";
ALTER TABLE "cricut_design_submissions" ADD CONSTRAINT "cricut_design_submissions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

DO $$ BEGIN
  ALTER TYPE "StudentMessageKind" ADD VALUE IF NOT EXISTS 'CRICUT_ORDER';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
