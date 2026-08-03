-- DropIndex
DROP INDEX "organizations_category_idx";

-- DropIndex
DROP INDEX "organizations_sort_order_idx";

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
