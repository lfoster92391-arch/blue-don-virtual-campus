-- Broadcasting Show Script / Daily Rundown: slot template + shared daily script.

CREATE TABLE "broadcast_script_templates" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "slots" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_script_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broadcast_script_templates_organization_id_key" ON "broadcast_script_templates"("organization_id");

ALTER TABLE "broadcast_script_templates" ADD CONSTRAINT "broadcast_script_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "broadcast_daily_scripts" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "script_date" DATE NOT NULL,
    "prayer_text" TEXT,
    "values" JSONB NOT NULL DEFAULT '{}',
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "broadcast_daily_scripts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "broadcast_daily_scripts_organization_id_script_date_key" ON "broadcast_daily_scripts"("organization_id", "script_date");
CREATE INDEX "broadcast_daily_scripts_organization_id_script_date_idx" ON "broadcast_daily_scripts"("organization_id", "script_date");
CREATE INDEX "broadcast_daily_scripts_updated_by_id_idx" ON "broadcast_daily_scripts"("updated_by_id");

ALTER TABLE "broadcast_daily_scripts" ADD CONSTRAINT "broadcast_daily_scripts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "broadcast_daily_scripts" ADD CONSTRAINT "broadcast_daily_scripts_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
