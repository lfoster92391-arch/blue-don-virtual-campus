-- Cafeteria lunch ordering for parents, teachers, and staff.
--
-- Menus themselves stay in config (src/config/school-hub.ts) because they rotate
-- on a fixed weekday cycle; only the per-diner decision needs to persist.
--
-- diner_id is whoever eats (a student when a parent orders for their child, or
-- the faculty member themselves), ordered_by_id is whoever placed it. One row
-- per diner per service date so changing an order updates rather than appends.

CREATE TYPE "LunchChoiceKind" AS ENUM ('HOT', 'VEGETARIAN', 'PACKED', 'NONE');

CREATE TABLE "lunch_orders" (
    "id" TEXT NOT NULL,
    "diner_id" UUID NOT NULL,
    "ordered_by_id" UUID NOT NULL,
    "service_date" DATE NOT NULL,
    "choice" "LunchChoiceKind" NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lunch_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lunch_orders_diner_id_service_date_key" ON "lunch_orders"("diner_id", "service_date");
CREATE INDEX "lunch_orders_diner_id_idx" ON "lunch_orders"("diner_id");
CREATE INDEX "lunch_orders_service_date_idx" ON "lunch_orders"("service_date");
CREATE INDEX "lunch_orders_ordered_by_id_idx" ON "lunch_orders"("ordered_by_id");

ALTER TABLE "lunch_orders"
  ADD CONSTRAINT "lunch_orders_diner_id_fkey"
  FOREIGN KEY ("diner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "lunch_orders"
  ADD CONSTRAINT "lunch_orders_ordered_by_id_fkey"
  FOREIGN KEY ("ordered_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
