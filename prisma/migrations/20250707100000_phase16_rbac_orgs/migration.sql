-- Phase 16: RBAC foundation — extend UserRole, add Organization models

-- AlterEnum: extend UserRole with enterprise campus roles (additive)
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TEACHER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ALUMNI';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'STAFF';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COACH';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'COUNSELOR';

-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('CLUB', 'CLASS', 'TEAM', 'ACADEMY', 'DEPARTMENT');
CREATE TYPE "OrgMembershipRole" AS ENUM ('LEAD', 'OFFICER', 'MODERATOR', 'MEMBER');
CREATE TYPE "OrgVisibility" AS ENUM ('SCHOOL', 'MEMBERS_ONLY', 'PRIVATE');
CREATE TYPE "MembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrganizationType" NOT NULL,
    "description" TEXT,
    "academy_id" TEXT,
    "visibility" "OrgVisibility" NOT NULL DEFAULT 'SCHOOL',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organization_memberships" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "org_role" "OrgMembershipRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");
CREATE UNIQUE INDEX "organizations_academy_id_key" ON "organizations"("academy_id");
CREATE INDEX "organizations_type_idx" ON "organizations"("type");

CREATE UNIQUE INDEX "organization_memberships_organization_id_user_id_key" ON "organization_memberships"("organization_id", "user_id");
CREATE INDEX "organization_memberships_organization_id_idx" ON "organization_memberships"("organization_id");
CREATE INDEX "organization_memberships_user_id_idx" ON "organization_memberships"("user_id");
CREATE INDEX "organization_memberships_status_idx" ON "organization_memberships"("status");

-- AddForeignKey
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
