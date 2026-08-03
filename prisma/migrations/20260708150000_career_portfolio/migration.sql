-- Career Portfolio: shareable graduate link
ALTER TABLE "users" ADD COLUMN "portfolio_slug" TEXT;
ALTER TABLE "users" ADD COLUMN "portfolio_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "portfolio_sections" JSONB;

CREATE UNIQUE INDEX "users_portfolio_slug_key" ON "users"("portfolio_slug");
