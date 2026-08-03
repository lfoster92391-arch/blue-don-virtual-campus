CREATE TYPE "CornerStoreStatus" AS ENUM ('ACTIVE', 'SOLD', 'DRAFT', 'REMOVED');

CREATE TABLE "corner_store_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price_cents" INTEGER NOT NULL,
    "image_url" TEXT,
    "storage_path" TEXT,
    "payment_methods" JSONB NOT NULL,
    "status" "CornerStoreStatus" NOT NULL DEFAULT 'ACTIVE',
    "seller_id" UUID NOT NULL,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corner_store_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "corner_store_items_status_idx" ON "corner_store_items"("status");
CREATE INDEX "corner_store_items_seller_id_idx" ON "corner_store_items"("seller_id");
CREATE INDEX "corner_store_items_organization_id_idx" ON "corner_store_items"("organization_id");
CREATE INDEX "corner_store_items_category_idx" ON "corner_store_items"("category");

ALTER TABLE "corner_store_items" ADD CONSTRAINT "corner_store_items_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "corner_store_items" ADD CONSTRAINT "corner_store_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
