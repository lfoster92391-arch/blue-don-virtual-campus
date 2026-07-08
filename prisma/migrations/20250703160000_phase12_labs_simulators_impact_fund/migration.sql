-- Phase 12: Labs, Simulators, Impact Fund (post-MVP)

CREATE TYPE "LabStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "LabDifficulty" AS ENUM ('INTRODUCTORY', 'INTERMEDIATE', 'ADVANCED');
CREATE TYPE "LabSessionStatus" AS ENUM ('REGISTERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "SimulatorStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "SimulatorCategory" AS ENUM ('STEM', 'BUSINESS', 'MEDIA', 'SERVICE', 'GENERAL');
CREATE TYPE "ImpactFundProposalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'VOTING', 'APPROVED', 'REJECTED', 'FUNDED', 'ARCHIVED');
CREATE TYPE "ImpactFundVoteChoice" AS ENUM ('FOR', 'AGAINST', 'ABSTAIN');

CREATE TABLE "labs" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "academy_id" TEXT,
    "difficulty" "LabDifficulty" NOT NULL DEFAULT 'INTRODUCTORY',
    "status" "LabStatus" NOT NULL DEFAULT 'DRAFT',
    "equipment" TEXT,
    "safety_notes" TEXT,
    "launch_url" TEXT,
    "archive_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lab_sessions" (
    "id" TEXT NOT NULL,
    "lab_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "LabSessionStatus" NOT NULL DEFAULT 'REGISTERED',
    "reflection" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lab_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulators" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "SimulatorCategory" NOT NULL DEFAULT 'GENERAL',
    "academy_id" TEXT,
    "status" "SimulatorStatus" NOT NULL DEFAULT 'DRAFT',
    "launch_url" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "archive_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulators_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulator_runs" (
    "id" TEXT NOT NULL,
    "simulator_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "score" INTEGER,
    "duration_min" INTEGER,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulator_runs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "impact_fund_proposals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount_requested" INTEGER NOT NULL,
    "academy_id" TEXT,
    "submitted_by_id" UUID NOT NULL,
    "status" "ImpactFundProposalStatus" NOT NULL DEFAULT 'DRAFT',
    "vote_deadline" TIMESTAMP(3),
    "funded_amount" INTEGER,
    "archive_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "impact_fund_proposals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "impact_fund_votes" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "choice" "ImpactFundVoteChoice" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "impact_fund_votes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "labs_slug_key" ON "labs"("slug");
CREATE INDEX "labs_status_idx" ON "labs"("status");
CREATE INDEX "labs_academy_id_idx" ON "labs"("academy_id");

CREATE INDEX "lab_sessions_lab_id_idx" ON "lab_sessions"("lab_id");
CREATE INDEX "lab_sessions_user_id_idx" ON "lab_sessions"("user_id");

CREATE UNIQUE INDEX "simulators_slug_key" ON "simulators"("slug");
CREATE INDEX "simulators_status_idx" ON "simulators"("status");
CREATE INDEX "simulators_academy_id_idx" ON "simulators"("academy_id");

CREATE INDEX "simulator_runs_simulator_id_idx" ON "simulator_runs"("simulator_id");
CREATE INDEX "simulator_runs_user_id_idx" ON "simulator_runs"("user_id");

CREATE INDEX "impact_fund_proposals_status_idx" ON "impact_fund_proposals"("status");
CREATE INDEX "impact_fund_proposals_submitted_by_id_idx" ON "impact_fund_proposals"("submitted_by_id");

CREATE UNIQUE INDEX "impact_fund_votes_proposal_id_user_id_key" ON "impact_fund_votes"("proposal_id", "user_id");
CREATE INDEX "impact_fund_votes_proposal_id_idx" ON "impact_fund_votes"("proposal_id");

ALTER TABLE "labs" ADD CONSTRAINT "labs_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "lab_sessions" ADD CONSTRAINT "lab_sessions_lab_id_fkey" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lab_sessions" ADD CONSTRAINT "lab_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "simulators" ADD CONSTRAINT "simulators_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "simulator_runs" ADD CONSTRAINT "simulator_runs_simulator_id_fkey" FOREIGN KEY ("simulator_id") REFERENCES "simulators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "simulator_runs" ADD CONSTRAINT "simulator_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "impact_fund_proposals" ADD CONSTRAINT "impact_fund_proposals_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "impact_fund_proposals" ADD CONSTRAINT "impact_fund_proposals_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "impact_fund_votes" ADD CONSTRAINT "impact_fund_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "impact_fund_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "impact_fund_votes" ADD CONSTRAINT "impact_fund_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
