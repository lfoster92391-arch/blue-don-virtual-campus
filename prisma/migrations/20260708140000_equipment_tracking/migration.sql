-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('CAMERA', 'CHROMEBOOK', 'MICROPHONE', 'PROJECTOR', 'LAPTOP_CART', 'OTHER');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'CHECKED_OUT', 'REPAIR', 'RETIRED');

-- CreateTable
CREATE TABLE "equipment_items" (
    "id" TEXT NOT NULL,
    "asset_tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "EquipmentCategory" NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "location" TEXT NOT NULL,
    "serial_number" TEXT,
    "notes" TEXT,
    "assigned_to_user_id" UUID,
    "checked_out_at" TIMESTAMP(3),
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_checkouts" (
    "id" TEXT NOT NULL,
    "equipment_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "checked_out_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_at" TIMESTAMP(3),
    "returned_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "equipment_checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipment_items_asset_tag_key" ON "equipment_items"("asset_tag");

-- CreateIndex
CREATE INDEX "equipment_items_category_idx" ON "equipment_items"("category");

-- CreateIndex
CREATE INDEX "equipment_items_status_idx" ON "equipment_items"("status");

-- CreateIndex
CREATE INDEX "equipment_items_organization_id_idx" ON "equipment_items"("organization_id");

-- CreateIndex
CREATE INDEX "equipment_items_assigned_to_user_id_idx" ON "equipment_items"("assigned_to_user_id");

-- CreateIndex
CREATE INDEX "equipment_checkouts_equipment_id_idx" ON "equipment_checkouts"("equipment_id");

-- CreateIndex
CREATE INDEX "equipment_checkouts_user_id_idx" ON "equipment_checkouts"("user_id");

-- CreateIndex
CREATE INDEX "equipment_checkouts_returned_at_idx" ON "equipment_checkouts"("returned_at");

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_assigned_to_user_id_fkey" FOREIGN KEY ("assigned_to_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_checkouts" ADD CONSTRAINT "equipment_checkouts_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_checkouts" ADD CONSTRAINT "equipment_checkouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
