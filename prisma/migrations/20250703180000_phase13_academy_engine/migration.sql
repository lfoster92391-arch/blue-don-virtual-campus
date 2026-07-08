-- Phase 13: Madonna Education Network Academy Engine

CREATE TYPE "CareerPathway" AS ENUM (
  'BROADCAST_MEDIA',
  'IT',
  'ROBOTICS_ENGINEERING',
  'SOFTWARE_DEVELOPMENT',
  'DIGITAL_MARKETING',
  'GRAPHIC_DESIGN',
  'BUSINESS_ENTREPRENEURSHIP'
);

CREATE TYPE "AcademyLevelTier" AS ENUM (
  'EXPLORER',
  'FOUNDATION',
  'INTERMEDIATE',
  'ADVANCED',
  'PROFESSIONAL',
  'COLLEGIATE',
  'INDUSTRY_CAPSTONE'
);

CREATE TYPE "LearningStepType" AS ENUM (
  'LEARN',
  'WATCH',
  'GUIDED_LAB',
  'PRACTICE_LAB',
  'CHALLENGE_LAB',
  'TROUBLESHOOTING_LAB',
  'PRACTICAL_EXAM',
  'CERTIFICATION',
  'PORTFOLIO_PROJECT',
  'CAPSTONE_MISSION'
);

CREATE TYPE "ModuleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "AssessmentType" AS ENUM ('KNOWLEDGE_CHECK', 'PRACTICAL_EXAM', 'QUIZ');
CREATE TYPE "CertificationStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'LOCKED');

ALTER TABLE "academies" ADD COLUMN "icon" TEXT;
ALTER TABLE "academies" ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "academy_pathway_mappings" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "pathway" "CareerPathway" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "academy_pathway_mappings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academy_levels" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "tier" "AcademyLevelTier" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academy_levels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "learning_modules" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "level_id" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ModuleStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "learning_modules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "step_type" "LearningStepType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT,
    "module_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT,
    "duration_min" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "module_lab_links" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "step_type" "LearningStepType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "module_lab_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "module_simulator_links" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "simulator_id" TEXT NOT NULL,
    "step_type" "LearningStepType" NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "module_simulator_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "module_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "AssessmentType" NOT NULL DEFAULT 'KNOWLEDGE_CHECK',
    "passing_score" INTEGER NOT NULL DEFAULT 70,
    "questions" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "missions" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level_tier" "AcademyLevelTier",
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lab_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "missions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "certifications" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "level_tier" "AcademyLevelTier",
    "status" "CertificationStatus" NOT NULL DEFAULT 'DRAFT',
    "requirements" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_module_progress" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "module_id" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "current_step" "LearningStepType",
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "student_module_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_academy_progress" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "academy_id" TEXT NOT NULL,
    "current_level" "AcademyLevelTier" NOT NULL DEFAULT 'EXPLORER',
    "progress_pct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "student_academy_progress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "student_certifications" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "certification_id" TEXT NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "student_certifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leaderboard_entries" (
    "id" TEXT NOT NULL,
    "academy_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "period" TEXT NOT NULL DEFAULT 'all-time',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leaderboard_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academy_pathway_mappings_academy_id_pathway_key" ON "academy_pathway_mappings"("academy_id", "pathway");
CREATE INDEX "academy_pathway_mappings_pathway_idx" ON "academy_pathway_mappings"("pathway");
CREATE UNIQUE INDEX "academy_levels_academy_id_tier_key" ON "academy_levels"("academy_id", "tier");
CREATE INDEX "academy_levels_academy_id_idx" ON "academy_levels"("academy_id");
CREATE UNIQUE INDEX "learning_modules_academy_id_slug_key" ON "learning_modules"("academy_id", "slug");
CREATE INDEX "learning_modules_academy_id_idx" ON "learning_modules"("academy_id");
CREATE INDEX "learning_modules_level_id_idx" ON "learning_modules"("level_id");
CREATE INDEX "learning_modules_status_idx" ON "learning_modules"("status");
CREATE INDEX "lessons_module_id_idx" ON "lessons"("module_id");
CREATE INDEX "videos_academy_id_idx" ON "videos"("academy_id");
CREATE INDEX "videos_module_id_idx" ON "videos"("module_id");
CREATE UNIQUE INDEX "module_lab_links_module_id_lab_id_step_type_key" ON "module_lab_links"("module_id", "lab_id", "step_type");
CREATE INDEX "module_lab_links_module_id_idx" ON "module_lab_links"("module_id");
CREATE INDEX "module_lab_links_lab_id_idx" ON "module_lab_links"("lab_id");
CREATE UNIQUE INDEX "module_simulator_links_module_id_simulator_id_step_type_key" ON "module_simulator_links"("module_id", "simulator_id", "step_type");
CREATE INDEX "module_simulator_links_module_id_idx" ON "module_simulator_links"("module_id");
CREATE INDEX "module_simulator_links_simulator_id_idx" ON "module_simulator_links"("simulator_id");
CREATE INDEX "assessments_module_id_idx" ON "assessments"("module_id");
CREATE UNIQUE INDEX "missions_academy_id_slug_key" ON "missions"("academy_id", "slug");
CREATE INDEX "missions_academy_id_idx" ON "missions"("academy_id");
CREATE INDEX "missions_status_idx" ON "missions"("status");
CREATE UNIQUE INDEX "certifications_academy_id_slug_key" ON "certifications"("academy_id", "slug");
CREATE INDEX "certifications_academy_id_idx" ON "certifications"("academy_id");
CREATE INDEX "certifications_status_idx" ON "certifications"("status");
CREATE UNIQUE INDEX "student_module_progress_user_id_module_id_key" ON "student_module_progress"("user_id", "module_id");
CREATE INDEX "student_module_progress_user_id_idx" ON "student_module_progress"("user_id");
CREATE INDEX "student_module_progress_module_id_idx" ON "student_module_progress"("module_id");
CREATE UNIQUE INDEX "student_academy_progress_user_id_academy_id_key" ON "student_academy_progress"("user_id", "academy_id");
CREATE INDEX "student_academy_progress_user_id_idx" ON "student_academy_progress"("user_id");
CREATE INDEX "student_academy_progress_academy_id_idx" ON "student_academy_progress"("academy_id");
CREATE UNIQUE INDEX "student_certifications_user_id_certification_id_key" ON "student_certifications"("user_id", "certification_id");
CREATE INDEX "student_certifications_user_id_idx" ON "student_certifications"("user_id");
CREATE UNIQUE INDEX "leaderboard_entries_academy_id_user_id_period_key" ON "leaderboard_entries"("academy_id", "user_id", "period");
CREATE INDEX "leaderboard_entries_academy_id_period_idx" ON "leaderboard_entries"("academy_id", "period");

ALTER TABLE "academy_pathway_mappings" ADD CONSTRAINT "academy_pathway_mappings_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_levels" ADD CONSTRAINT "academy_levels_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_modules" ADD CONSTRAINT "learning_modules_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "learning_modules" ADD CONSTRAINT "learning_modules_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "academy_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "videos" ADD CONSTRAINT "videos_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "videos" ADD CONSTRAINT "videos_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_lab_links" ADD CONSTRAINT "module_lab_links_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_lab_links" ADD CONSTRAINT "module_lab_links_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_simulator_links" ADD CONSTRAINT "module_simulator_links_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "module_simulator_links" ADD CONSTRAINT "module_simulator_links_simulator_id_fkey" FOREIGN KEY ("simulator_id") REFERENCES "simulators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "missions" ADD CONSTRAINT "missions_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "missions" ADD CONSTRAINT "missions_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_module_progress" ADD CONSTRAINT "student_module_progress_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "learning_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_academy_progress" ADD CONSTRAINT "student_academy_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_academy_progress" ADD CONSTRAINT "student_academy_progress_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_certifications" ADD CONSTRAINT "student_certifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "student_certifications" ADD CONSTRAINT "student_certifications_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leaderboard_entries" ADD CONSTRAINT "leaderboard_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
