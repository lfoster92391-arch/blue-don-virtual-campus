-- Cricut shop + club invoices / expense receipts → ledger

ALTER TABLE "club_ledger_entries" ADD COLUMN IF NOT EXISTS "invoice_id" TEXT;
ALTER TABLE "club_ledger_entries" ADD COLUMN IF NOT EXISTS "receipt_url" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "club_ledger_entries_invoice_id_key" ON "club_ledger_entries"("invoice_id");

CREATE TYPE "ClubInvoiceStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE IF NOT EXISTS "club_invoices" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "invoice_date" TIMESTAMP(3) NOT NULL,
    "total_cents" INTEGER NOT NULL,
    "memo" TEXT,
    "receipt_url" TEXT,
    "receipt_storage_path" TEXT,
    "status" "ClubInvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_by_id" UUID NOT NULL,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_invoices_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "club_invoice_lines" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_cost_cents" INTEGER NOT NULL,
    "line_total_cents" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "club_invoice_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "club_invoices_organization_id_status_idx" ON "club_invoices"("organization_id", "status");
CREATE INDEX IF NOT EXISTS "club_invoices_submitted_by_id_idx" ON "club_invoices"("submitted_by_id");
CREATE INDEX IF NOT EXISTS "club_invoices_status_idx" ON "club_invoices"("status");
CREATE INDEX IF NOT EXISTS "club_invoice_lines_invoice_id_idx" ON "club_invoice_lines"("invoice_id");

ALTER TABLE "club_invoices" DROP CONSTRAINT IF EXISTS "club_invoices_organization_id_fkey";
ALTER TABLE "club_invoices" ADD CONSTRAINT "club_invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_invoices" DROP CONSTRAINT IF EXISTS "club_invoices_submitted_by_id_fkey";
ALTER TABLE "club_invoices" ADD CONSTRAINT "club_invoices_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_invoices" DROP CONSTRAINT IF EXISTS "club_invoices_reviewed_by_id_fkey";
ALTER TABLE "club_invoices" ADD CONSTRAINT "club_invoices_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "club_invoice_lines" DROP CONSTRAINT IF EXISTS "club_invoice_lines_invoice_id_fkey";
ALTER TABLE "club_invoice_lines" ADD CONSTRAINT "club_invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "club_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_ledger_entries" DROP CONSTRAINT IF EXISTS "club_ledger_entries_invoice_id_fkey";
ALTER TABLE "club_ledger_entries" ADD CONSTRAINT "club_ledger_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "club_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "CricutShopItemStatus" AS ENUM ('ACTIVE', 'SOLD', 'DRAFT', 'REMOVED');
CREATE TYPE "CricutFulfillmentMethod" AS ENUM ('PICKUP', 'SHIP');
CREATE TYPE "CricutShopOrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS "cricut_shop_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price_cents" INTEGER NOT NULL,
    "image_url" TEXT,
    "storage_path" TEXT,
    "status" "CricutShopItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "seller_id" UUID NOT NULL,
    "organization_id" TEXT NOT NULL,
    "inventory_qty" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cricut_shop_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "cricut_shop_orders" (
    "id" TEXT NOT NULL,
    "buyer_id" UUID NOT NULL,
    "fulfillment" "CricutFulfillmentMethod" NOT NULL,
    "status" "CricutShopOrderStatus" NOT NULL DEFAULT 'PENDING',
    "subtotal_cents" INTEGER NOT NULL,
    "shipping_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "ship_name" TEXT,
    "ship_line1" TEXT,
    "ship_line2" TEXT,
    "ship_city" TEXT,
    "ship_state" TEXT,
    "ship_postal" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cricut_shop_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "cricut_shop_order_lines" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unit_price_cents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "line_total_cents" INTEGER NOT NULL,

    CONSTRAINT "cricut_shop_order_lines_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "cricut_shop_items_status_idx" ON "cricut_shop_items"("status");
CREATE INDEX IF NOT EXISTS "cricut_shop_items_organization_id_idx" ON "cricut_shop_items"("organization_id");
CREATE INDEX IF NOT EXISTS "cricut_shop_items_seller_id_idx" ON "cricut_shop_items"("seller_id");
CREATE INDEX IF NOT EXISTS "cricut_shop_orders_buyer_id_idx" ON "cricut_shop_orders"("buyer_id");
CREATE INDEX IF NOT EXISTS "cricut_shop_orders_status_idx" ON "cricut_shop_orders"("status");
CREATE INDEX IF NOT EXISTS "cricut_shop_order_lines_order_id_idx" ON "cricut_shop_order_lines"("order_id");
CREATE INDEX IF NOT EXISTS "cricut_shop_order_lines_item_id_idx" ON "cricut_shop_order_lines"("item_id");

ALTER TABLE "cricut_shop_items" DROP CONSTRAINT IF EXISTS "cricut_shop_items_seller_id_fkey";
ALTER TABLE "cricut_shop_items" ADD CONSTRAINT "cricut_shop_items_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_shop_items" DROP CONSTRAINT IF EXISTS "cricut_shop_items_organization_id_fkey";
ALTER TABLE "cricut_shop_items" ADD CONSTRAINT "cricut_shop_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_shop_orders" DROP CONSTRAINT IF EXISTS "cricut_shop_orders_buyer_id_fkey";
ALTER TABLE "cricut_shop_orders" ADD CONSTRAINT "cricut_shop_orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_shop_order_lines" DROP CONSTRAINT IF EXISTS "cricut_shop_order_lines_order_id_fkey";
ALTER TABLE "cricut_shop_order_lines" ADD CONSTRAINT "cricut_shop_order_lines_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "cricut_shop_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cricut_shop_order_lines" DROP CONSTRAINT IF EXISTS "cricut_shop_order_lines_item_id_fkey";
ALTER TABLE "cricut_shop_order_lines" ADD CONSTRAINT "cricut_shop_order_lines_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "cricut_shop_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
