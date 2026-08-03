CREATE TYPE "WishlistLinkType" AS ENUM ('AMAZON', 'CUSTOM');

CREATE TABLE "wishlist_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT,
    "academy_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "link_type" "WishlistLinkType" NOT NULL DEFAULT 'CUSTOM',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "fulfilled" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "wishlist_items_organization_id_idx" ON "wishlist_items"("organization_id");
CREATE INDEX "wishlist_items_academy_id_idx" ON "wishlist_items"("academy_id");
CREATE INDEX "wishlist_items_fulfilled_idx" ON "wishlist_items"("fulfilled");

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
