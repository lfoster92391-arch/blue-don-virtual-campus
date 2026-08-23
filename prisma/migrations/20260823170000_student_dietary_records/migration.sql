-- Dietary / allergy records for the cafeteria.
--
-- Two tables on purpose:
--   dietary_requests          — what a family submitted and who reviewed it.
--   student_dietary_profiles  — the canonical record on the student account.
--
-- Accepting a request copies its allergens/restrictions/notes onto the profile,
-- so the lunch board and student profile read office-approved facts rather than
-- an unreviewed form row. Declining leaves the profile untouched.

CREATE TYPE "DietaryRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

CREATE TABLE "dietary_requests" (
    "id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "submitted_by_id" UUID NOT NULL,
    "status" "DietaryRequestStatus" NOT NULL DEFAULT 'PENDING',
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dietary_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dietary_requests_student_id_idx" ON "dietary_requests"("student_id");
CREATE INDEX "dietary_requests_status_idx" ON "dietary_requests"("status");
CREATE INDEX "dietary_requests_submitted_by_id_idx" ON "dietary_requests"("submitted_by_id");

ALTER TABLE "dietary_requests"
  ADD CONSTRAINT "dietary_requests_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dietary_requests"
  ADD CONSTRAINT "dietary_requests_submitted_by_id_fkey"
  FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "dietary_requests"
  ADD CONSTRAINT "dietary_requests_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "student_dietary_profiles" (
    "id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "restrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "source_request_id" TEXT,
    "applied_by_id" UUID,
    "applied_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_dietary_profiles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "student_dietary_profiles_student_id_key" ON "student_dietary_profiles"("student_id");
CREATE INDEX "student_dietary_profiles_student_id_idx" ON "student_dietary_profiles"("student_id");

ALTER TABLE "student_dietary_profiles"
  ADD CONSTRAINT "student_dietary_profiles_student_id_fkey"
  FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "student_dietary_profiles"
  ADD CONSTRAINT "student_dietary_profiles_applied_by_id_fkey"
  FOREIGN KEY ("applied_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
