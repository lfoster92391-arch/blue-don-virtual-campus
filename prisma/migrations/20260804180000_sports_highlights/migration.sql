-- Sports Highlights for Broadcasting: configurable sports, opponent school
-- directory (with uploaded logos), games, highlights, student recaps/previews,
-- rosters, and per-game player stats.

CREATE TYPE "SportSeason" AS ENUM ('FALL', 'WINTER', 'SPRING', 'YEAR_ROUND');
CREATE TYPE "SportsGameSite" AS ENUM ('HOME', 'AWAY', 'NEUTRAL');
CREATE TYPE "SportsGameStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINAL', 'POSTPONED', 'CANCELED');
CREATE TYPE "SportsGameResult" AS ENUM ('WIN', 'LOSS', 'TIE');
CREATE TYPE "SportsHighlightKind" AS ENUM ('CLIP', 'PHOTO', 'STORY', 'REEL', 'INTERVIEW');
CREATE TYPE "SportsHighlightStatus" AS ENUM ('PENDING', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "SportsReportKind" AS ENUM ('RECAP', 'PREVIEW');
CREATE TYPE "SportsReportStatus" AS ENUM ('PENDING', 'APPROVED', 'PUBLISHED', 'DECLINED');

CREATE TABLE "sports" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "season" "SportSeason" NOT NULL DEFAULT 'FALL',
    "emoji" TEXT,
    "headline" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sports_slug_key" ON "sports"("slug");
CREATE INDEX "sports_is_active_sort_order_idx" ON "sports"("is_active", "sort_order");

CREATE TABLE "opponent_schools" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT,
    "mascot" TEXT,
    "city" TEXT,
    "state" TEXT,
    "color_primary" TEXT,
    "logo_url" TEXT,
    "logo_path" TEXT,
    "website_url" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opponent_schools_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "opponent_schools_slug_key" ON "opponent_schools"("slug");
CREATE INDEX "opponent_schools_is_active_name_idx" ON "opponent_schools"("is_active", "name");

ALTER TABLE "opponent_schools"
  ADD CONSTRAINT "opponent_schools_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "opponent_sport_teams" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "sport_id" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "logo_url" TEXT,
    "logo_path" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opponent_sport_teams_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "opponent_sport_teams_school_id_sport_id_key"
  ON "opponent_sport_teams"("school_id", "sport_id");
CREATE INDEX "opponent_sport_teams_sport_id_is_active_idx"
  ON "opponent_sport_teams"("sport_id", "is_active");

ALTER TABLE "opponent_sport_teams"
  ADD CONSTRAINT "opponent_sport_teams_school_id_fkey"
  FOREIGN KEY ("school_id") REFERENCES "opponent_schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "opponent_sport_teams"
  ADD CONSTRAINT "opponent_sport_teams_sport_id_fkey"
  FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "sports_games" (
    "id" TEXT NOT NULL,
    "sport_id" TEXT NOT NULL,
    "opponent_id" TEXT,
    "opponent_team_id" TEXT,
    "opponent_label" TEXT,
    "kickoff_at" TIMESTAMP(3) NOT NULL,
    "site" "SportsGameSite" NOT NULL DEFAULT 'HOME',
    "venue" TEXT,
    "level" TEXT,
    "status" "SportsGameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "team_score" INTEGER,
    "opponent_score" INTEGER,
    "result" "SportsGameResult",
    "headline" TEXT,
    "summary" TEXT,
    "broadcast_note" TEXT,
    "stream_url" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_games_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sports_games_sport_id_kickoff_at_idx" ON "sports_games"("sport_id", "kickoff_at");
CREATE INDEX "sports_games_status_kickoff_at_idx" ON "sports_games"("status", "kickoff_at");

ALTER TABLE "sports_games"
  ADD CONSTRAINT "sports_games_sport_id_fkey"
  FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_games"
  ADD CONSTRAINT "sports_games_opponent_id_fkey"
  FOREIGN KEY ("opponent_id") REFERENCES "opponent_schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sports_games"
  ADD CONSTRAINT "sports_games_opponent_team_id_fkey"
  FOREIGN KEY ("opponent_team_id") REFERENCES "opponent_sport_teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sports_games"
  ADD CONSTRAINT "sports_games_created_by_id_fkey"
  FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "sports_highlights" (
    "id" TEXT NOT NULL,
    "sport_id" TEXT NOT NULL,
    "game_id" TEXT,
    "media_item_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" "SportsHighlightKind" NOT NULL DEFAULT 'CLIP',
    "status" "SportsHighlightStatus" NOT NULL DEFAULT 'PENDING',
    "video_url" TEXT,
    "image_url" TEXT,
    "image_path" TEXT,
    "credit" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMP(3),
    "submitted_by_id" UUID,
    "submitted_by_name" TEXT,
    "reviewed_by_id" UUID,
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_highlights_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sports_highlights_sport_id_status_idx" ON "sports_highlights"("sport_id", "status");
CREATE INDEX "sports_highlights_game_id_idx" ON "sports_highlights"("game_id");
CREATE INDEX "sports_highlights_is_featured_idx" ON "sports_highlights"("is_featured");

ALTER TABLE "sports_highlights"
  ADD CONSTRAINT "sports_highlights_sport_id_fkey"
  FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_highlights"
  ADD CONSTRAINT "sports_highlights_game_id_fkey"
  FOREIGN KEY ("game_id") REFERENCES "sports_games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sports_highlights"
  ADD CONSTRAINT "sports_highlights_media_item_id_fkey"
  FOREIGN KEY ("media_item_id") REFERENCES "campus_media_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sports_highlights"
  ADD CONSTRAINT "sports_highlights_submitted_by_id_fkey"
  FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "sports_highlights"
  ADD CONSTRAINT "sports_highlights_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "sports_game_reports" (
    "id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "kind" "SportsReportKind" NOT NULL DEFAULT 'RECAP',
    "author_id" UUID NOT NULL,
    "author_name" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "player_of_game" TEXT,
    "key_moment" TEXT,
    "what_to_watch" TEXT,
    "status" "SportsReportStatus" NOT NULL DEFAULT 'PENDING',
    "review_note" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_game_reports_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sports_game_reports_game_id_status_idx" ON "sports_game_reports"("game_id", "status");
CREATE INDEX "sports_game_reports_author_id_idx" ON "sports_game_reports"("author_id");

ALTER TABLE "sports_game_reports"
  ADD CONSTRAINT "sports_game_reports_game_id_fkey"
  FOREIGN KEY ("game_id") REFERENCES "sports_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_game_reports"
  ADD CONSTRAINT "sports_game_reports_author_id_fkey"
  FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_game_reports"
  ADD CONSTRAINT "sports_game_reports_reviewed_by_id_fkey"
  FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "sports_players" (
    "id" TEXT NOT NULL,
    "sport_id" TEXT NOT NULL,
    "user_id" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "jersey_number" TEXT,
    "position" TEXT,
    "grade_year" TEXT,
    "photo_url" TEXT,
    "photo_path" TEXT,
    "bio" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_players_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "sports_players_sport_id_is_active_idx" ON "sports_players"("sport_id", "is_active");

ALTER TABLE "sports_players"
  ADD CONSTRAINT "sports_players_sport_id_fkey"
  FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_players"
  ADD CONSTRAINT "sports_players_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "sports_player_stats" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "game_id" TEXT NOT NULL,
    "stats" JSONB NOT NULL DEFAULT '{}',
    "summary" TEXT,
    "notes" TEXT,
    "recorded_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_player_stats_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sports_player_stats_player_id_game_id_key"
  ON "sports_player_stats"("player_id", "game_id");
CREATE INDEX "sports_player_stats_game_id_idx" ON "sports_player_stats"("game_id");

ALTER TABLE "sports_player_stats"
  ADD CONSTRAINT "sports_player_stats_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "sports_players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_player_stats"
  ADD CONSTRAINT "sports_player_stats_game_id_fkey"
  FOREIGN KEY ("game_id") REFERENCES "sports_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "sports_player_stats"
  ADD CONSTRAINT "sports_player_stats_recorded_by_id_fkey"
  FOREIGN KEY ("recorded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TYPE "StudentMessageKind" ADD VALUE IF NOT EXISTS 'SPORTS_COVERAGE';
