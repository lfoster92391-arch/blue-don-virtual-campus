-- Studio Bridge for the Broadcast Control Studio: paired OBS machines, agent
-- run sessions, and the outbound command queue the agent polls. The campus runs
-- on Vercel and cannot dial the Studio B PC through the school NAT, so control
-- is inverted — the console queues a command, the agent picks it up and posts
-- telemetry back. No OBS password or stream key is stored here.

CREATE TYPE "StudioCommandKind" AS ENUM (
  'SET_PROGRAM_SCENE',
  'SET_PREVIEW_SCENE',
  'TRIGGER_TRANSITION',
  'OBS_START_STREAM',
  'OBS_STOP_STREAM',
  'OBS_START_RECORD',
  'OBS_STOP_RECORD'
);

CREATE TYPE "StudioCommandStatus" AS ENUM ('QUEUED', 'CLAIMED', 'DONE', 'FAILED', 'EXPIRED');

CREATE TABLE "studio_bridges" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "token_hash" TEXT,
    "last_seen_at" TIMESTAMP(3),
    "agent_version" TEXT,
    "obs_connected" BOOLEAN NOT NULL DEFAULT false,
    "obs_version" TEXT,
    "studio_mode_enabled" BOOLEAN NOT NULL DEFAULT false,
    "program_scene" TEXT,
    "preview_scene" TEXT,
    "scenes" JSONB NOT NULL DEFAULT '[]',
    "streaming" BOOLEAN NOT NULL DEFAULT false,
    "recording" BOOLEAN NOT NULL DEFAULT false,
    "stream_timecode" TEXT,
    "record_timecode" TEXT,
    "stats" JSONB,
    "last_error" TEXT,
    "last_error_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_bridges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "studio_bridges_key_key" ON "studio_bridges"("key");

CREATE TABLE "studio_sessions" (
    "id" TEXT NOT NULL,
    "bridge_id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "agent_version" TEXT,
    "obs_version" TEXT,

    CONSTRAINT "studio_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "studio_sessions_bridge_id_run_id_key" ON "studio_sessions"("bridge_id", "run_id");
CREATE INDEX "studio_sessions_bridge_id_started_at_idx" ON "studio_sessions"("bridge_id", "started_at");

ALTER TABLE "studio_sessions"
  ADD CONSTRAINT "studio_sessions_bridge_id_fkey"
  FOREIGN KEY ("bridge_id") REFERENCES "studio_bridges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "studio_commands" (
    "id" TEXT NOT NULL,
    "bridge_id" TEXT NOT NULL,
    "session_id" TEXT,
    "kind" "StudioCommandKind" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "StudioCommandStatus" NOT NULL DEFAULT 'QUEUED',
    "requested_by_id" UUID,
    "requested_by_name" TEXT,
    "claimed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_commands_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "studio_commands_bridge_id_status_created_at_idx"
  ON "studio_commands"("bridge_id", "status", "created_at");
CREATE INDEX "studio_commands_requested_by_id_idx" ON "studio_commands"("requested_by_id");

ALTER TABLE "studio_commands"
  ADD CONSTRAINT "studio_commands_bridge_id_fkey"
  FOREIGN KEY ("bridge_id") REFERENCES "studio_bridges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "studio_commands"
  ADD CONSTRAINT "studio_commands_session_id_fkey"
  FOREIGN KEY ("session_id") REFERENCES "studio_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "studio_commands"
  ADD CONSTRAINT "studio_commands_requested_by_id_fkey"
  FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
