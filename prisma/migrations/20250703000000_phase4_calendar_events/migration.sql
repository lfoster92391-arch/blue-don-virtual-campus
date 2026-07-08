-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('ORGANIZER', 'VOLUNTEER', 'ATTENDEE', 'SPEAKER');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('REGISTERED', 'ATTENDED', 'ABSENT', 'CANCELLED');

-- CreateTable
CREATE TABLE "academies" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "description" TEXT,
    "budget_id" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "impact_points" INTEGER NOT NULL DEFAULT 0,
    "archive_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_participants" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ParticipantRole" NOT NULL DEFAULT 'ATTENDEE',
    "attendance" "AttendanceStatus" NOT NULL DEFAULT 'REGISTERED',
    "hours" DOUBLE PRECISION,
    "reflection" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "user_id" UUID,
    "academy_id" TEXT,
    "event_id" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING',
    "points" INTEGER NOT NULL DEFAULT 0,
    "completion" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_reminders" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academies_slug_key" ON "academies"("slug");

-- CreateIndex
CREATE INDEX "events_academy_id_idx" ON "events"("academy_id");

-- CreateIndex
CREATE INDEX "events_start_date_idx" ON "events"("start_date");

-- CreateIndex
CREATE INDEX "events_archive_flag_idx" ON "events"("archive_flag");

-- CreateIndex
CREATE INDEX "events_created_by_id_idx" ON "events"("created_by_id");

-- CreateIndex
CREATE INDEX "event_participants_user_id_idx" ON "event_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_participants_event_id_user_id_key" ON "event_participants"("event_id", "user_id");

-- CreateIndex
CREATE INDEX "assignments_user_id_idx" ON "assignments"("user_id");

-- CreateIndex
CREATE INDEX "assignments_event_id_idx" ON "assignments"("event_id");

-- CreateIndex
CREATE INDEX "assignments_due_date_idx" ON "assignments"("due_date");

-- CreateIndex
CREATE INDEX "assignments_academy_id_idx" ON "assignments"("academy_id");

-- CreateIndex
CREATE INDEX "event_reminders_user_id_remind_at_idx" ON "event_reminders"("user_id", "remind_at");

-- CreateIndex
CREATE INDEX "event_reminders_event_id_idx" ON "event_reminders"("event_id");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_participants" ADD CONSTRAINT "event_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reminders" ADD CONSTRAINT "event_reminders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_reminders" ADD CONSTRAINT "event_reminders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed default academies
INSERT INTO "academies" ("id", "slug", "name", "description", "color", "updated_at")
VALUES
  ('academy-technology', 'technology', 'Technology Academy', 'Software, robotics, and digital innovation pathways.', '#2F80ED', CURRENT_TIMESTAMP),
  ('academy-broadcast', 'broadcast', 'Broadcast Academy', 'Media production, journalism, and live broadcasting.', '#9B51E0', CURRENT_TIMESTAMP),
  ('academy-creative-studio', 'creative-studio', 'Creative Studio', 'Design, visual arts, and creative storytelling.', '#EB5757', CURRENT_TIMESTAMP),
  ('academy-business', 'business', 'Business & Entrepreneurship', 'Leadership, finance, and venture skills.', '#27AE60', CURRENT_TIMESTAMP),
  ('academy-service', 'service', 'Service & Community', 'Volunteering, outreach, and civic engagement.', '#F2994A', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
