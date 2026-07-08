-- Phase 6–10: Academy Framework, Checklist Engine, Portfolio Engine, Service Desk, Knowledge Vault

CREATE TYPE "AcademyMembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');
CREATE TYPE "ChecklistStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETE', 'ARCHIVED');
CREATE TYPE "PortfolioItemType" AS ENUM ('PROJECT', 'CERTIFICATION', 'SERVICE', 'LEADERSHIP', 'ACHIEVEMENT');
CREATE TYPE "PortfolioItemStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "TicketCategory" AS ENUM ('TECHNICAL', 'ACADEMIC', 'FACILITIES', 'ACCOUNT', 'OTHER');
CREATE TYPE "KnowledgeArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "academy_memberships" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "academy_id" TEXT NOT NULL,
    "status" "AcademyMembershipStatus" NOT NULL DEFAULT 'PENDING',
    "joined_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academy_memberships_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "checklists" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_id" TEXT,
    "academy_id" TEXT,
    "status" "ChecklistStatus" NOT NULL DEFAULT 'DRAFT',
    "archive_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "checklist_items" (
    "id" TEXT NOT NULL,
    "checklist_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "checklist_item_completions" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checklist_item_completions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "portfolio_items" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "PortfolioItemType" NOT NULL,
    "status" "PortfolioItemStatus" NOT NULL DEFAULT 'DRAFT',
    "evidence_url" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "academy_id" TEXT,
    "event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "TicketCategory" NOT NULL DEFAULT 'OTHER',
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "assigned_to_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ticket_comments" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "knowledge_articles" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "KnowledgeArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "author_id" UUID NOT NULL,
    "academy_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "academy_memberships_user_id_academy_id_key" ON "academy_memberships"("user_id", "academy_id");
CREATE INDEX "academy_memberships_academy_id_idx" ON "academy_memberships"("academy_id");
CREATE INDEX "academy_memberships_status_idx" ON "academy_memberships"("status");

CREATE INDEX "checklists_event_id_idx" ON "checklists"("event_id");
CREATE INDEX "checklists_academy_id_idx" ON "checklists"("academy_id");
CREATE INDEX "checklists_status_idx" ON "checklists"("status");

CREATE INDEX "checklist_items_checklist_id_idx" ON "checklist_items"("checklist_id");

CREATE UNIQUE INDEX "checklist_item_completions_item_id_user_id_key" ON "checklist_item_completions"("item_id", "user_id");
CREATE INDEX "checklist_item_completions_user_id_idx" ON "checklist_item_completions"("user_id");

CREATE INDEX "portfolio_items_user_id_idx" ON "portfolio_items"("user_id");
CREATE INDEX "portfolio_items_status_idx" ON "portfolio_items"("status");
CREATE INDEX "portfolio_items_type_idx" ON "portfolio_items"("type");

CREATE INDEX "tickets_user_id_idx" ON "tickets"("user_id");
CREATE INDEX "tickets_status_idx" ON "tickets"("status");
CREATE INDEX "tickets_assigned_to_id_idx" ON "tickets"("assigned_to_id");

CREATE INDEX "ticket_comments_ticket_id_idx" ON "ticket_comments"("ticket_id");

CREATE UNIQUE INDEX "knowledge_articles_slug_key" ON "knowledge_articles"("slug");
CREATE INDEX "knowledge_articles_status_idx" ON "knowledge_articles"("status");
CREATE INDEX "knowledge_articles_category_idx" ON "knowledge_articles"("category");

ALTER TABLE "academy_memberships" ADD CONSTRAINT "academy_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "academy_memberships" ADD CONSTRAINT "academy_memberships_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "checklists" ADD CONSTRAINT "checklists_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "checklists" ADD CONSTRAINT "checklists_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "checklist_items" ADD CONSTRAINT "checklist_items_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "checklists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "checklist_item_completions" ADD CONSTRAINT "checklist_item_completions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "checklist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "checklist_item_completions" ADD CONSTRAINT "checklist_item_completions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "portfolio_items" ADD CONSTRAINT "portfolio_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ticket_comments" ADD CONSTRAINT "ticket_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_academy_id_fkey" FOREIGN KEY ("academy_id") REFERENCES "academies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
