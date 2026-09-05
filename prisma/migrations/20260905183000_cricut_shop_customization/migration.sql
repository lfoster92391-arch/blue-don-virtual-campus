-- Shoppers can personalize Cricut items (sport, print name, font, custom design).
ALTER TABLE "cricut_shop_items" ADD COLUMN IF NOT EXISTS "customizable" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "cricut_shop_order_lines" ADD COLUMN IF NOT EXISTS "sport_slug" TEXT;
ALTER TABLE "cricut_shop_order_lines" ADD COLUMN IF NOT EXISTS "print_name" TEXT;
ALTER TABLE "cricut_shop_order_lines" ADD COLUMN IF NOT EXISTS "font_key" TEXT;
ALTER TABLE "cricut_shop_order_lines" ADD COLUMN IF NOT EXISTS "design_image_url" TEXT;
ALTER TABLE "cricut_shop_order_lines" ADD COLUMN IF NOT EXISTS "design_storage_path" TEXT;
