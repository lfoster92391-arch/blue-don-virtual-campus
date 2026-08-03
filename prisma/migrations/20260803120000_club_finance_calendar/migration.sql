-- Club financial tracking + shared club calendar events (club-focus pivot).

-- CreateEnum
CREATE TYPE "ClubLedgerEntryType" AS ENUM ('DEPOSIT', 'WITHDRAWAL');

-- CreateEnum
CREATE TYPE "ClubFundraiserStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "club_fundraisers" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goal_cents" INTEGER NOT NULL,
    "status" "ClubFundraiserStatus" NOT NULL DEFAULT 'ACTIVE',
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_fundraisers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_ledger_entries" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "type" "ClubLedgerEntryType" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "memo" TEXT,
    "fundraiser_id" TEXT,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "club_ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "club_calendar_events" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_calendar_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "club_fundraisers_organization_id_status_idx" ON "club_fundraisers"("organization_id", "status");

-- CreateIndex
CREATE INDEX "club_fundraisers_created_by_id_idx" ON "club_fundraisers"("created_by_id");

-- CreateIndex
CREATE INDEX "club_ledger_entries_organization_id_created_at_idx" ON "club_ledger_entries"("organization_id", "created_at");

-- CreateIndex
CREATE INDEX "club_ledger_entries_fundraiser_id_idx" ON "club_ledger_entries"("fundraiser_id");

-- CreateIndex
CREATE INDEX "club_ledger_entries_created_by_id_idx" ON "club_ledger_entries"("created_by_id");

-- CreateIndex
CREATE INDEX "club_calendar_events_organization_id_start_date_idx" ON "club_calendar_events"("organization_id", "start_date");

-- CreateIndex
CREATE INDEX "club_calendar_events_start_date_idx" ON "club_calendar_events"("start_date");

-- CreateIndex
CREATE INDEX "club_calendar_events_created_by_id_idx" ON "club_calendar_events"("created_by_id");

-- AddForeignKey
ALTER TABLE "club_fundraisers" ADD CONSTRAINT "club_fundraisers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_fundraisers" ADD CONSTRAINT "club_fundraisers_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_ledger_entries" ADD CONSTRAINT "club_ledger_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_ledger_entries" ADD CONSTRAINT "club_ledger_entries_fundraiser_id_fkey" FOREIGN KEY ("fundraiser_id") REFERENCES "club_fundraisers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_ledger_entries" ADD CONSTRAINT "club_ledger_entries_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_calendar_events" ADD CONSTRAINT "club_calendar_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "club_calendar_events" ADD CONSTRAINT "club_calendar_events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
