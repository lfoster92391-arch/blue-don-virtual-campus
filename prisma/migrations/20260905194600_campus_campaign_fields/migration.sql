-- Campus-wide fundraiser / event posts (flyer, order window, public headline).

CREATE TYPE "CampusCampaignKind" AS ENUM (
  'CLUB_FUNDRAISER',
  'CLUB_EVENT',
  'CLASS_FUNDRAISER',
  'CLASS_EVENT',
  'SCHOOL_FUNDRAISER',
  'SCHOOL_EVENT',
  'TEAM_FUNDRAISER',
  'TEAM_EVENT'
);

ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "kind" "CampusCampaignKind" NOT NULL DEFAULT 'CLUB_FUNDRAISER';
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "flyer_url" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "flyer_storage_path" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "link_url" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "prices_text" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "arrives_at" TIMESTAMP(3);
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "pickup_location" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "contact_name" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "contact_email" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "contact_phone" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "raising_for" TEXT;
ALTER TABLE "club_fundraisers" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "club_fundraisers_status_is_public_idx"
  ON "club_fundraisers"("status", "is_public");
