-- Published cafeteria menus, one row per calendar date.
--
-- The rotating weekday menu in src/config/school-hub.ts stays as the fallback
-- for any date without a row here, so nothing goes blank the day this ships.
-- A row with a NULL published_at is a draft: the kitchen can build three weeks
-- ahead without families seeing half-finished days.

CREATE TABLE "lunch_menu_days" (
    "id" TEXT NOT NULL,
    "service_date" DATE NOT NULL,
    "entree" TEXT NOT NULL,
    "vegetarian" TEXT NOT NULL,
    "sides" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dessert" TEXT,
    "note" TEXT,
    "published_at" TIMESTAMP(3),
    "published_by_id" UUID,
    "updated_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lunch_menu_days_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lunch_menu_days_service_date_key" ON "lunch_menu_days"("service_date");
CREATE INDEX "lunch_menu_days_service_date_published_at_idx"
  ON "lunch_menu_days"("service_date", "published_at");

ALTER TABLE "lunch_menu_days"
  ADD CONSTRAINT "lunch_menu_days_published_by_id_fkey"
  FOREIGN KEY ("published_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lunch_menu_days"
  ADD CONSTRAINT "lunch_menu_days_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
