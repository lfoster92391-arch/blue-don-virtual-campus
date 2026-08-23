-- Cafeteria money for students.
--
-- Families pay at school — cash or a check in an envelope with the student's
-- name on it — and the front office records it here. Nothing in the app takes
-- a card, so the balance only ever moves through an office-recorded entry.
--
-- Two tables:
--   cafeteria_accounts       — the running balance, one row per student.
--   cafeteria_ledger_entries — every movement, and who recorded it.
--
-- Amounts are whole cents so no rounding creeps into a school ledger.

CREATE TYPE "CafeteriaLedgerKind" AS ENUM ('CREDIT', 'CHARGE', 'ADJUSTMENT');

CREATE TABLE "cafeteria_accounts" (
    "id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "balance_cents" INTEGER NOT NULL DEFAULT 0,
    "low_balance_notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cafeteria_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "cafeteria_accounts_student_id_key" ON "cafeteria_accounts"("student_id");

ALTER TABLE "cafeteria_accounts"
  ADD CONSTRAINT "cafeteria_accounts_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "cafeteria_ledger_entries" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "kind" "CafeteriaLedgerKind" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "balance_after_cents" INTEGER NOT NULL,
    "note" TEXT,
    "recorded_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cafeteria_ledger_entries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "cafeteria_ledger_entries_account_id_created_at_idx"
  ON "cafeteria_ledger_entries"("account_id", "created_at");
CREATE INDEX "cafeteria_ledger_entries_recorded_by_id_idx"
  ON "cafeteria_ledger_entries"("recorded_by_id");

ALTER TABLE "cafeteria_ledger_entries"
  ADD CONSTRAINT "cafeteria_ledger_entries_account_id_fkey"
  FOREIGN KEY ("account_id") REFERENCES "cafeteria_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "cafeteria_ledger_entries"
  ADD CONSTRAINT "cafeteria_ledger_entries_recorded_by_id_fkey"
  FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
