ALTER TABLE "organizations" ADD COLUMN "category" TEXT;
ALTER TABLE "organizations" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "organizations_category_idx" ON "organizations"("category");
CREATE INDEX "organizations_sort_order_idx" ON "organizations"("sort_order");
