-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('BUSINESS', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "CommunityCategory" AS ENUM ('HOSPITAL', 'POLICE', 'FIRE', 'BANK', 'CHURCH', 'MANUFACTURING', 'TECHNOLOGY', 'CONSTRUCTION');

-- CreateEnum
CREATE TYPE "BusinessCategory" AS ENUM ('EMPLOYER', 'SPONSOR', 'EDUCATION', 'TECHNOLOGY', 'HEALTHCARE', 'OTHER');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "PartnerOpportunityType" AS ENUM ('VOLUNTEER', 'JOB_SHADOW', 'INTERNSHIP', 'CAREER_TALK', 'SERVICE', 'SCHOLARSHIP', 'WORKSHOP');

-- CreateEnum
CREATE TYPE "PartnerOpportunityStatus" AS ENUM ('PENDING', 'APPROVED', 'PUBLISHED', 'CLOSED');

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "partner_type" "PartnerType" NOT NULL,
    "community_category" "CommunityCategory",
    "business_category" "BusinessCategory",
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "school_approved" BOOLEAN NOT NULL DEFAULT false,
    "logo_url" TEXT,
    "website_url" TEXT,
    "contact_name" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address" TEXT,
    "madonna_connections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "service_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_opportunities" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PartnerOpportunityType" NOT NULL,
    "status" "PartnerOpportunityStatus" NOT NULL DEFAULT 'PENDING',
    "grade_levels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "spots" INTEGER,
    "deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_slug_key" ON "partners"("slug");

-- CreateIndex
CREATE INDEX "partners_partner_type_idx" ON "partners"("partner_type");

-- CreateIndex
CREATE INDEX "partners_community_category_idx" ON "partners"("community_category");

-- CreateIndex
CREATE INDEX "partners_business_category_idx" ON "partners"("business_category");

-- CreateIndex
CREATE INDEX "partners_status_idx" ON "partners"("status");

-- CreateIndex
CREATE INDEX "partner_opportunities_partner_id_idx" ON "partner_opportunities"("partner_id");

-- CreateIndex
CREATE INDEX "partner_opportunities_status_idx" ON "partner_opportunities"("status");

-- CreateIndex
CREATE INDEX "partner_opportunities_type_idx" ON "partner_opportunities"("type");

-- AddForeignKey
ALTER TABLE "partner_opportunities" ADD CONSTRAINT "partner_opportunities_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
