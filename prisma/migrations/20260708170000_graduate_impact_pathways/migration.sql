-- W19 Graduate Impact & Pathways: passports, legacy pages, impact projects

CREATE TYPE "PassportType" AS ENUM ('TRADE', 'MILITARY', 'COLLEGE');

CREATE TABLE "passport_progress" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "passport_type" "PassportType" NOT NULL,
    "completed_items" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passport_progress_pkey" PRIMARY KEY ("id")
);

CREATE TYPE "ImpactProjectStatus" AS ENUM ('PROPOSAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETE', 'REJECTED');

CREATE TABLE "impact_projects" (
    "id" TEXT NOT NULL,
    "student_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ImpactProjectStatus" NOT NULL DEFAULT 'PROPOSAL',
    "milestones" JSONB NOT NULL DEFAULT '[]',
    "advisor_id" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "graduate_legacies" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "class_year" INTEGER NOT NULL,
    "organizations" JSONB NOT NULL DEFAULT '[]',
    "achievements" JSONB NOT NULL DEFAULT '[]',
    "projects" JSONB NOT NULL DEFAULT '[]',
    "college" TEXT,
    "favorite_memory" TEXT,
    "advice" TEXT,
    "legacy_message" TEXT,
    "alumni_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "graduate_legacies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "passport_progress_user_id_passport_type_key" ON "passport_progress"("user_id", "passport_type");
CREATE INDEX "passport_progress_user_id_idx" ON "passport_progress"("user_id");

CREATE INDEX "impact_projects_student_id_idx" ON "impact_projects"("student_id");
CREATE INDEX "impact_projects_status_idx" ON "impact_projects"("status");
CREATE INDEX "impact_projects_advisor_id_idx" ON "impact_projects"("advisor_id");

CREATE UNIQUE INDEX "graduate_legacies_user_id_key" ON "graduate_legacies"("user_id");
CREATE UNIQUE INDEX "graduate_legacies_slug_key" ON "graduate_legacies"("slug");
CREATE INDEX "graduate_legacies_slug_idx" ON "graduate_legacies"("slug");
CREATE INDEX "graduate_legacies_class_year_idx" ON "graduate_legacies"("class_year");

ALTER TABLE "passport_progress" ADD CONSTRAINT "passport_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "impact_projects" ADD CONSTRAINT "impact_projects_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "impact_projects" ADD CONSTRAINT "impact_projects_advisor_id_fkey" FOREIGN KEY ("advisor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "graduate_legacies" ADD CONSTRAINT "graduate_legacies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
