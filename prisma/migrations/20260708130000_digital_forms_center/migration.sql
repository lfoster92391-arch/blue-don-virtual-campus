-- Digital Forms Center: parent-on-behalf submissions, school year, and audit metadata.

-- AlterTable
ALTER TABLE "form_submissions"
  ADD COLUMN "subject_user_id" UUID,
  ADD COLUMN "school_year" TEXT,
  ADD COLUMN "parent_approved" BOOLEAN,
  ADD COLUMN "parent_approved_by_id" UUID,
  ADD COLUMN "parent_approved_at" TIMESTAMP(3),
  ADD COLUMN "audit_meta" JSONB;

-- CreateIndex
CREATE INDEX "form_submissions_subject_user_id_idx" ON "form_submissions"("subject_user_id");

-- CreateIndex
CREATE INDEX "form_submissions_parent_approved_idx" ON "form_submissions"("parent_approved");

-- CreateIndex
CREATE INDEX "form_submissions_school_year_idx" ON "form_submissions"("school_year");

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_subject_user_id_fkey" FOREIGN KEY ("subject_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_parent_approved_by_id_fkey" FOREIGN KEY ("parent_approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
