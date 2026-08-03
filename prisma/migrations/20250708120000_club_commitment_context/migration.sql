-- Allow one form submission per user per club/academy context (club membership commitments)
ALTER TABLE "form_submissions" ADD COLUMN "context_key" TEXT NOT NULL DEFAULT '';

DROP INDEX IF EXISTS "form_submissions_form_id_user_id_key";

CREATE UNIQUE INDEX "form_submissions_form_id_user_id_context_key_key"
  ON "form_submissions"("form_id", "user_id", "context_key");
