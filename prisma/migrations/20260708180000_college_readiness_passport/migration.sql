-- College Readiness Passport: per-item progress with status tracking

CREATE TYPE "CollegeReadinessStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');

CREATE TABLE "college_readiness_progress" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "item_id" TEXT NOT NULL,
    "status" "CollegeReadinessStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completed_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "college_readiness_progress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "college_readiness_progress_user_id_item_id_key" ON "college_readiness_progress"("user_id", "item_id");
CREATE INDEX "college_readiness_progress_user_id_idx" ON "college_readiness_progress"("user_id");

ALTER TABLE "college_readiness_progress" ADD CONSTRAINT "college_readiness_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
