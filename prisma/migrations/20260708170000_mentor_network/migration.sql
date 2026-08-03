-- Mentor Network: school-approved mentor profiles and student connection requests

CREATE TYPE "MentorCategory" AS ENUM ('TEACHER', 'ALUMNI', 'BUSINESS', 'COLLEGE_STUDENT', 'INDUSTRY');
CREATE TYPE "MentorProfileStatus" AS ENUM ('PENDING', 'APPROVED', 'INACTIVE');
CREATE TYPE "MentorConnectionRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

CREATE TABLE "mentor_profiles" (
    "id" TEXT NOT NULL,
    "user_id" UUID,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" "MentorCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "expertise_tags" TEXT[],
    "photo_url" TEXT,
    "status" "MentorProfileStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "mentor_connection_requests" (
    "id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "mentor_profile_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MentorConnectionRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentor_connection_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mentor_profiles_status_idx" ON "mentor_profiles"("status");
CREATE INDEX "mentor_profiles_category_idx" ON "mentor_profiles"("category");
CREATE INDEX "mentor_profiles_user_id_idx" ON "mentor_profiles"("user_id");
CREATE INDEX "mentor_connection_requests_status_idx" ON "mentor_connection_requests"("status");
CREATE INDEX "mentor_connection_requests_student_id_idx" ON "mentor_connection_requests"("student_id");
CREATE INDEX "mentor_connection_requests_mentor_profile_id_idx" ON "mentor_connection_requests"("mentor_profile_id");
CREATE UNIQUE INDEX "mentor_connection_requests_student_id_mentor_profile_id_key" ON "mentor_connection_requests"("student_id", "mentor_profile_id");

ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "mentor_connection_requests" ADD CONSTRAINT "mentor_connection_requests_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_connection_requests" ADD CONSTRAINT "mentor_connection_requests_mentor_profile_id_fkey" FOREIGN KEY ("mentor_profile_id") REFERENCES "mentor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "mentor_connection_requests" ADD CONSTRAINT "mentor_connection_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
