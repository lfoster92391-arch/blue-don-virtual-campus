-- Product kind on listings (shirt / tumbler / other / custom-built)
-- plus size + buyer note on order lines.

CREATE TYPE "CricutShopItemKind" AS ENUM (
  'SHIRT',
  'TUMBLER',
  'OTHER',
  'CUSTOM_BUILT'
);

ALTER TABLE "cricut_shop_items"
  ADD COLUMN IF NOT EXISTS "kind" "CricutShopItemKind" NOT NULL DEFAULT 'OTHER';

ALTER TABLE "cricut_shop_order_lines"
  ADD COLUMN IF NOT EXISTS "size" TEXT;

ALTER TABLE "cricut_shop_order_lines"
  ADD COLUMN IF NOT EXISTS "buyer_note" TEXT;
