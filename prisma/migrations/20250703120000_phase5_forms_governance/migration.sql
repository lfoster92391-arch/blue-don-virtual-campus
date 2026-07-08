-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'COMPLETE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('ENROLLMENT_PACKET', 'STUDENT_AGREEMENT', 'PARENT_AGREEMENT', 'PARTICIPATION_COMMITMENT', 'MEDIA_RELEASE', 'TECHNOLOGY_AGREEMENT', 'EVENT_REGISTRATION', 'VOLUNTEER_FORM', 'SPONSOR_PACKET', 'PURCHASE_REQUEST', 'TRAVEL_APPROVAL', 'RISK_ACKNOWLEDGEMENT', 'EQUIPMENT_CHECKOUT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ApprovalType" AS ENUM ('JOIN_ACADEMY', 'PURCHASE', 'SPONSOR', 'EVENT', 'TRAVEL', 'IMPACT_FUND', 'CAPSTONE', 'PUBLISHING');

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "FormType" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "FormStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "content" TEXT,
    "form_fields" JSONB,
    "approval_required" BOOLEAN NOT NULL DEFAULT false,
    "approval_type" "ApprovalType",
    "archive_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_submissions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "signature_name" TEXT,
    "approved" BOOLEAN,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "response_data" JSONB,
    "submitted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "forms_status_idx" ON "forms"("status");

-- CreateIndex
CREATE INDEX "forms_archive_flag_idx" ON "forms"("archive_flag");

-- CreateIndex
CREATE INDEX "forms_type_idx" ON "forms"("type");

-- CreateIndex
CREATE INDEX "form_submissions_user_id_idx" ON "form_submissions"("user_id");

-- CreateIndex
CREATE INDEX "form_submissions_approved_idx" ON "form_submissions"("approved");

-- CreateIndex
CREATE INDEX "form_submissions_submitted_at_idx" ON "form_submissions"("submitted_at");

-- CreateIndex
CREATE UNIQUE INDEX "form_submissions_form_id_user_id_key" ON "form_submissions"("form_id", "user_id");

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
