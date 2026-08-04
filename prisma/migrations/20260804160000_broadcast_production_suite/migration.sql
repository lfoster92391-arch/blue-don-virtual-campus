-- Broadcasting production suite: countdown, VOD categories, bookings,
-- announcement submissions, crew credits, equipment checklist, join applications.

CREATE TYPE "CampusMediaCategory" AS ENUM (
  'MORNING_ANNOUNCEMENTS',
  'SPORTS_HIGHLIGHTS',
  'STUDENT_SPOTLIGHT',
  'SPECIAL_EVENTS',
  'HIGHLIGHT_REEL',
  'OTHER'
);

ALTER TABLE "campus_media_items"
  ADD COLUMN "category" "CampusMediaCategory",
  ADD COLUMN "is_highlight_reel" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "campus_media_items_category_idx" ON "campus_media_items"("category");
CREATE INDEX "campus_media_items_is_highlight_reel_idx" ON "campus_media_items"("is_highlight_reel");

CREATE TABLE "broadcast_schedules" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "next_air_at" TIMESTAMP(3),
    "title" TEXT,
    "notes" TEXT,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_schedules_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broadcast_schedules_organization_id_key" ON "broadcast_schedules"("organization_id");
CREATE INDEX "broadcast_schedules_next_air_at_idx" ON "broadcast_schedules"("next_air_at");

ALTER TABLE "broadcast_schedules"
  ADD CONSTRAINT "broadcast_schedules_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_schedules"
  ADD CONSTRAINT "broadcast_schedules_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "BroadcastBookingService" AS ENUM (
  'FILM_COVERAGE',
  'PHOTOGRAPHY',
  'LIVE_STREAMING'
);

CREATE TYPE "BroadcastBookingStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DECLINED',
  'COMPLETED'
);

CREATE TABLE "broadcast_booking_requests" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "requester_id" UUID NOT NULL,
    "requester_name" TEXT NOT NULL,
    "requester_email" TEXT,
    "club_or_team" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "event_at" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "services" "BroadcastBookingService"[],
    "details" TEXT,
    "status" "BroadcastBookingStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_booking_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "broadcast_booking_requests_organization_id_status_idx"
  ON "broadcast_booking_requests"("organization_id", "status");
CREATE INDEX "broadcast_booking_requests_requester_id_idx"
  ON "broadcast_booking_requests"("requester_id");
CREATE INDEX "broadcast_booking_requests_event_at_idx"
  ON "broadcast_booking_requests"("event_at");

ALTER TABLE "broadcast_booking_requests"
  ADD CONSTRAINT "broadcast_booking_requests_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_booking_requests"
  ADD CONSTRAINT "broadcast_booking_requests_requester_id_fkey"
  FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_booking_requests"
  ADD CONSTRAINT "broadcast_booking_requests_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "BroadcastSubmissionStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'DECLINED',
  'AIRED'
);

CREATE TABLE "broadcast_announcement_submissions" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "submitter_id" UUID NOT NULL,
    "submitter_name" TEXT NOT NULL,
    "submitter_role" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "preferred_air_date" TIMESTAMP(3),
    "status" "BroadcastSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_announcement_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "broadcast_announcement_submissions_organization_id_status_idx"
  ON "broadcast_announcement_submissions"("organization_id", "status");
CREATE INDEX "broadcast_announcement_submissions_submitter_id_idx"
  ON "broadcast_announcement_submissions"("submitter_id");

ALTER TABLE "broadcast_announcement_submissions"
  ADD CONSTRAINT "broadcast_announcement_submissions_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_announcement_submissions"
  ADD CONSTRAINT "broadcast_announcement_submissions_submitter_id_fkey"
  FOREIGN KEY ("submitter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_announcement_submissions"
  ADD CONSTRAINT "broadcast_announcement_submissions_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "BroadcastProductionRole" AS ENUM (
  'HOST',
  'CAMERA',
  'EDITOR',
  'PRODUCER',
  'GRAPHICS',
  'AUDIO',
  'FLOOR_DIRECTOR',
  'WRITER',
  'OTHER'
);

CREATE TABLE "broadcast_crew_credits" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "production_role" "BroadcastProductionRole" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_crew_credits_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broadcast_crew_credits_organization_id_user_id_production_role_key"
  ON "broadcast_crew_credits"("organization_id", "user_id", "production_role");
CREATE INDEX "broadcast_crew_credits_organization_id_idx"
  ON "broadcast_crew_credits"("organization_id");
CREATE INDEX "broadcast_crew_credits_user_id_idx"
  ON "broadcast_crew_credits"("user_id");

ALTER TABLE "broadcast_crew_credits"
  ADD CONSTRAINT "broadcast_crew_credits_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_crew_credits"
  ADD CONSTRAINT "broadcast_crew_credits_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "broadcast_equipment_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "notes" TEXT,
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_by_id" UUID,
    "checked_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_equipment_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "broadcast_equipment_items_organization_id_idx"
  ON "broadcast_equipment_items"("organization_id");
CREATE INDEX "broadcast_equipment_items_checked_by_id_idx"
  ON "broadcast_equipment_items"("checked_by_id");

ALTER TABLE "broadcast_equipment_items"
  ADD CONSTRAINT "broadcast_equipment_items_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_equipment_items"
  ADD CONSTRAINT "broadcast_equipment_items_checked_by_id_fkey"
  FOREIGN KEY ("checked_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TYPE "BroadcastJoinTrack" AS ENUM (
  'HOST',
  'CAMERA',
  'EDITOR',
  'GRAPHICS',
  'AUDIO',
  'PRODUCER',
  'WRITER',
  'FLEXIBLE'
);

CREATE TYPE "BroadcastJoinStatus" AS ENUM (
  'PENDING',
  'ACCEPTED',
  'DECLINED'
);

CREATE TABLE "broadcast_join_applications" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "applicant_id" UUID NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "applicant_email" TEXT,
    "grade_or_year" TEXT,
    "desired_tracks" "BroadcastJoinTrack"[],
    "experience" TEXT,
    "availability" TEXT,
    "why_join" TEXT NOT NULL,
    "status" "BroadcastJoinStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_join_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "broadcast_join_applications_organization_id_status_idx"
  ON "broadcast_join_applications"("organization_id", "status");
CREATE INDEX "broadcast_join_applications_applicant_id_idx"
  ON "broadcast_join_applications"("applicant_id");

ALTER TABLE "broadcast_join_applications"
  ADD CONSTRAINT "broadcast_join_applications_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_join_applications"
  ADD CONSTRAINT "broadcast_join_applications_applicant_id_fkey"
  FOREIGN KEY ("applicant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "broadcast_join_applications"
  ADD CONSTRAINT "broadcast_join_applications_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TYPE "StudentMessageKind" ADD VALUE 'BROADCAST_BOOKING';
ALTER TYPE "StudentMessageKind" ADD VALUE 'BROADCAST_ANNOUNCEMENT_SUBMISSION';
ALTER TYPE "StudentMessageKind" ADD VALUE 'BROADCAST_JOIN_APPLICATION';
