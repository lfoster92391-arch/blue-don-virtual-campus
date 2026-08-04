-- Club officer roles: LEAD/OFFICER/MODERATOR → PRESIDENT/VICE_PRESIDENT/SECRETARY
-- Plus IT documents + Cricut projects/checklists

CREATE TYPE "OrgMembershipRole_new" AS ENUM ('PRESIDENT', 'VICE_PRESIDENT', 'SECRETARY', 'MEMBER');

ALTER TABLE "organization_memberships"
  ALTER COLUMN "org_role" DROP DEFAULT;

ALTER TABLE "organization_memberships"
  ALTER COLUMN "org_role" TYPE "OrgMembershipRole_new"
  USING (
    CASE "org_role"::text
      WHEN 'LEAD' THEN 'PRESIDENT'::"OrgMembershipRole_new"
      WHEN 'OFFICER' THEN 'VICE_PRESIDENT'::"OrgMembershipRole_new"
      WHEN 'MODERATOR' THEN 'SECRETARY'::"OrgMembershipRole_new"
      WHEN 'MEMBER' THEN 'MEMBER'::"OrgMembershipRole_new"
      WHEN 'PRESIDENT' THEN 'PRESIDENT'::"OrgMembershipRole_new"
      WHEN 'VICE_PRESIDENT' THEN 'VICE_PRESIDENT'::"OrgMembershipRole_new"
      WHEN 'SECRETARY' THEN 'SECRETARY'::"OrgMembershipRole_new"
      ELSE 'MEMBER'::"OrgMembershipRole_new"
    END
  );

DROP TYPE "OrgMembershipRole";
ALTER TYPE "OrgMembershipRole_new" RENAME TO "OrgMembershipRole";

ALTER TABLE "organization_memberships"
  ALTER COLUMN "org_role" SET DEFAULT 'MEMBER'::"OrgMembershipRole";

CREATE TYPE "ClubDocumentType" AS ENUM ('BYLAWS', 'CONSTITUTION', 'OTHER');
CREATE TYPE "ClubProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

CREATE TABLE "club_documents" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "doc_type" "ClubDocumentType" NOT NULL,
    "body" TEXT,
    "file_url" TEXT,
    "created_by_id" UUID NOT NULL,
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_documents_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "club_projects" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ClubProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "owner_user_id" UUID,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "club_project_checklists" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "project_id" TEXT,
    "title" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_project_checklists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "club_project_checklist_items" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "done_by_id" UUID,
    "done_at" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "club_project_checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "club_documents_organization_id_idx" ON "club_documents"("organization_id");
CREATE INDEX "club_documents_doc_type_idx" ON "club_documents"("doc_type");
CREATE INDEX "club_documents_created_by_id_idx" ON "club_documents"("created_by_id");

CREATE INDEX "club_projects_organization_id_idx" ON "club_projects"("organization_id");
CREATE INDEX "club_projects_owner_user_id_idx" ON "club_projects"("owner_user_id");
CREATE INDEX "club_projects_status_idx" ON "club_projects"("status");

CREATE INDEX "club_project_checklists_organization_id_idx" ON "club_project_checklists"("organization_id");
CREATE INDEX "club_project_checklists_project_id_idx" ON "club_project_checklists"("project_id");
CREATE INDEX "club_project_checklists_created_by_id_idx" ON "club_project_checklists"("created_by_id");

CREATE INDEX "club_project_checklist_items_checklist_id_idx" ON "club_project_checklist_items"("checklist_id");
CREATE INDEX "club_project_checklist_items_done_by_id_idx" ON "club_project_checklist_items"("done_by_id");

ALTER TABLE "club_documents" ADD CONSTRAINT "club_documents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_documents" ADD CONSTRAINT "club_documents_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_documents" ADD CONSTRAINT "club_documents_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "club_projects" ADD CONSTRAINT "club_projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_projects" ADD CONSTRAINT "club_projects_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "club_projects" ADD CONSTRAINT "club_projects_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_project_checklists" ADD CONSTRAINT "club_project_checklists_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_project_checklists" ADD CONSTRAINT "club_project_checklists_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "club_projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "club_project_checklists" ADD CONSTRAINT "club_project_checklists_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "club_project_checklist_items" ADD CONSTRAINT "club_project_checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "club_project_checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "club_project_checklist_items" ADD CONSTRAINT "club_project_checklist_items_done_by_id_fkey" FOREIGN KEY ("done_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
