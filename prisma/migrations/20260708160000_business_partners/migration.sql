-- Business Partners: local employer pages for internships, job shadowing, and hiring

CREATE TYPE "BusinessPartnerStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "BusinessPartnerOpportunityType" AS ENUM ('INTERNSHIP', 'JOB_SHADOW', 'HIRING', 'CAREER_INFO');

CREATE TABLE "business_partners" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "industry" TEXT NOT NULL,
    "address" TEXT,
    "status" "BusinessPartnerStatus" NOT NULL DEFAULT 'PENDING',
    "career_info" TEXT,
    "employees" JSONB,
    "alumni" JSONB,
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partners_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "business_partner_opportunities" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "type" "BusinessPartnerOpportunityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_partner_opportunities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "business_partners_slug_key" ON "business_partners"("slug");
CREATE INDEX "business_partners_status_idx" ON "business_partners"("status");
CREATE INDEX "business_partners_industry_idx" ON "business_partners"("industry");
CREATE INDEX "business_partner_opportunities_partner_id_idx" ON "business_partner_opportunities"("partner_id");
CREATE INDEX "business_partner_opportunities_type_idx" ON "business_partner_opportunities"("type");
CREATE INDEX "business_partner_opportunities_is_active_idx" ON "business_partner_opportunities"("is_active");

ALTER TABLE "business_partners" ADD CONSTRAINT "business_partners_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "business_partner_opportunities" ADD CONSTRAINT "business_partner_opportunities_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "business_partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
