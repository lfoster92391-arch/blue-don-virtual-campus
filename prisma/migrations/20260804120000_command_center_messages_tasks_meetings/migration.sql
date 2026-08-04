-- Command Center: advisor messages, club student tasks, mandatory all-club meetings

ALTER TABLE "club_calendar_events"
  ADD COLUMN "mandatory_all_clubs" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "club_calendar_events_mandatory_all_clubs_idx"
  ON "club_calendar_events"("mandatory_all_clubs");

CREATE TYPE "StudentMessageStatus" AS ENUM ('UNREAD', 'VIEW_LATER', 'DONE', 'DISMISSED');
CREATE TYPE "StudentMessageKind" AS ENUM ('GENERAL', 'ADVISOR_REQUEST', 'INVOICE_RECEIPT_REQUEST', 'CRICUT_ORDER');
CREATE TYPE "ClubStudentTaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED');

CREATE TABLE "student_messages" (
    "id" TEXT NOT NULL,
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID NOT NULL,
    "organization_id" TEXT,
    "kind" "StudentMessageKind" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "body" TEXT,
    "status" "StudentMessageStatus" NOT NULL DEFAULT 'UNREAD',
    "actions" JSONB NOT NULL,
    "calendar_title" TEXT,
    "calendar_start" TIMESTAMP(3),
    "calendar_end" TIMESTAMP(3),
    "calendar_location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "student_messages_to_user_id_status_idx" ON "student_messages"("to_user_id", "status");
CREATE INDEX "student_messages_from_user_id_idx" ON "student_messages"("from_user_id");
CREATE INDEX "student_messages_organization_id_idx" ON "student_messages"("organization_id");
CREATE INDEX "student_messages_created_at_idx" ON "student_messages"("created_at");

ALTER TABLE "student_messages"
  ADD CONSTRAINT "student_messages_from_user_id_fkey"
  FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_messages"
  ADD CONSTRAINT "student_messages_to_user_id_fkey"
  FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_messages"
  ADD CONSTRAINT "student_messages_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "club_student_tasks" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_at" TIMESTAMP(3),
    "status" "ClubStudentTaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "assignee_id" UUID NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_student_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "club_student_tasks_organization_id_status_idx" ON "club_student_tasks"("organization_id", "status");
CREATE INDEX "club_student_tasks_assignee_id_status_idx" ON "club_student_tasks"("assignee_id", "status");
CREATE INDEX "club_student_tasks_due_at_idx" ON "club_student_tasks"("due_at");
CREATE INDEX "club_student_tasks_created_by_id_idx" ON "club_student_tasks"("created_by_id");

ALTER TABLE "club_student_tasks"
  ADD CONSTRAINT "club_student_tasks_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_student_tasks"
  ADD CONSTRAINT "club_student_tasks_assignee_id_fkey"
  FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_student_tasks"
  ADD CONSTRAINT "club_student_tasks_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
