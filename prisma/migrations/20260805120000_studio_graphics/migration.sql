-- On-air graphics for the Broadcast Control Studio. One overlay row per Browser
-- Source surface (holding the unguessable session key in its URL), and at most
-- one active graphic per kind on it. Score, lineup, and final-score cards keep a
-- game id rather than a copied score, so the overlay renders the same
-- sports_games row the campus reads. Nothing here holds a stream key.

CREATE TYPE "StudioGraphicKind" AS ENUM (
  'LOWER_THIRD',
  'PLAYER_ID',
  'SCORE_BUG',
  'LINEUP',
  'GAME_ANNOUNCEMENT',
  'FINAL_SCORE',
  'ANNOUNCEMENT',
  'SPONSOR'
);

CREATE TYPE "StudioGraphicState" AS ENUM ('PREVIEW', 'LIVE', 'CLEARED');

CREATE TABLE "studio_overlays" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "session_key" TEXT NOT NULL,
    "last_seen_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_overlays_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "studio_overlays_key_key" ON "studio_overlays"("key");
CREATE UNIQUE INDEX "studio_overlays_session_key_key" ON "studio_overlays"("session_key");

CREATE TABLE "studio_graphics" (
    "id" TEXT NOT NULL,
    "overlay_id" TEXT NOT NULL,
    "kind" "StudioGraphicKind" NOT NULL,
    "state" "StudioGraphicState" NOT NULL DEFAULT 'PREVIEW',
    "fields" JSONB NOT NULL DEFAULT '{}',
    "game_id" TEXT,
    "player_id" TEXT,
    "taken_at" TIMESTAMP(3),
    "cleared_at" TIMESTAMP(3),
    "updated_by_id" UUID,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studio_graphics_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "studio_graphics_overlay_id_kind_key" ON "studio_graphics"("overlay_id", "kind");
CREATE INDEX "studio_graphics_overlay_id_state_idx" ON "studio_graphics"("overlay_id", "state");
CREATE INDEX "studio_graphics_game_id_idx" ON "studio_graphics"("game_id");

ALTER TABLE "studio_graphics"
  ADD CONSTRAINT "studio_graphics_overlay_id_fkey"
  FOREIGN KEY ("overlay_id") REFERENCES "studio_overlays"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "studio_graphics"
  ADD CONSTRAINT "studio_graphics_game_id_fkey"
  FOREIGN KEY ("game_id") REFERENCES "sports_games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "studio_graphics"
  ADD CONSTRAINT "studio_graphics_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "sports_players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "studio_graphics"
  ADD CONSTRAINT "studio_graphics_updated_by_id_fkey"
  FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
