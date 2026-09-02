-- Separate "when the money moved" from "when the row was typed in".
-- Existing ledgers were backfilled in one sitting, so seed occurred_at from
-- created_at; officers can correct individual dates from the finance tab.
ALTER TABLE "club_ledger_entries"
  ADD COLUMN IF NOT EXISTS "occurred_at" TIMESTAMP(3);

UPDATE "club_ledger_entries"
   SET "occurred_at" = "created_at"
 WHERE "occurred_at" IS NULL;

ALTER TABLE "club_ledger_entries"
  ALTER COLUMN "occurred_at" SET DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "club_ledger_entries"
  ALTER COLUMN "occurred_at" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "club_ledger_entries_organization_id_occurred_at_idx"
  ON "club_ledger_entries" ("organization_id", "occurred_at");
