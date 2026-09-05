/**
 * Sports-aware search over the same games, roster, and stats coaches enter.
 * Keyword matching — not a general chatbot.
 */

import {
  CAMPUS_TEAM_NAME,
  formatGameDateTime,
  GAME_RESULT_LABELS,
  GAME_STATUS_LABELS,
} from "@/config/sports-highlights";
import {
  listGames,
  listPlayers,
  listPlayerStats,
  listSports,
  type SportsGameView,
} from "@/services/sports-highlights-service";

export type SportsGuideHit = {
  kind: "game" | "player" | "stat" | "next";
  title: string;
  detail: string;
  href: string;
  score?: string | null;
};

export type SportsGuideResult = {
  answer: string;
  hits: SportsGuideHit[];
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9#\s]/g, " ").replace(/\s+/g, " ").trim();
}

function includesAll(haystack: string, needles: string[]): boolean {
  return needles.every((needle) => haystack.includes(needle));
}

function gameHref(game: SportsGameView): string {
  return `/sports/games/${game.id}`;
}

function gameTitle(game: SportsGameView): string {
  return `${game.sportName} ${CAMPUS_TEAM_NAME} ${game.site === "HOME" ? "vs" : "at"} ${game.opponentName}`;
}

function gameScore(game: SportsGameView): string | null {
  if (game.teamScore === null || game.opponentScore === null) {
    return null;
  }
  const result = game.result ? ` · ${GAME_RESULT_LABELS[game.result]}` : "";
  return `${game.teamScore}–${game.opponentScore}${result}`;
}

function gameDetail(game: SportsGameView): string {
  const score = gameScore(game);
  return [
    formatGameDateTime(game.kickoffAt),
    GAME_STATUS_LABELS[game.status],
    score,
    game.venue,
  ]
    .filter(Boolean)
    .join(" · ");
}

function toGameHit(game: SportsGameView, kind: SportsGuideHit["kind"] = "game"): SportsGuideHit {
  return {
    kind,
    title: gameTitle(game),
    detail: gameDetail(game),
    href: gameHref(game),
    score: gameScore(game),
  };
}

export async function searchSportsGuide(
  rawQuery: string,
): Promise<SportsGuideResult> {
  const query = normalize(rawQuery);
  const tokens = query.split(" ").filter((token) => token.length > 1 || token.startsWith("#"));

  const [sports, upcoming, recent, players, stats] = await Promise.all([
    listSports(),
    listGames({ upcomingOnly: true, take: 12 }),
    listGames({ pastOnly: true, take: 24 }),
    listPlayers(),
    listPlayerStats({}),
  ]);

  const sportById = new Map(sports.map((sport) => [sport.id, sport]));
  const playerById = new Map(players.map((player) => [player.id, player]));

  if (!query) {
    const next = upcoming[0] ?? null;
    return {
      answer: next
        ? `Next up: ${gameTitle(next)} — ${formatGameDateTime(next.kickoffAt)}.`
        : "No upcoming games are on the board yet. Ask for a player, opponent, or “last score”.",
      hits: upcoming.slice(0, 4).map((game) => toGameHit(game, "next")),
    };
  }

  const wantsNext = /\b(next|upcoming|schedule|when|who do we play)\b/.test(query);
  const wantsScore = /\b(score|won|final|result|beat|lost)\b/.test(query);
  const wantsRoster = /\b(roster|player|who is|#\d+)\b/.test(query);
  const wantsStats = /\b(stat|stats|points|rebounds|goals|kills|assists)\b/.test(query);

  const matchedSport = sports.find((sport) => query.includes(normalize(sport.name)) || query.includes(sport.slug));

  const filterBySport = <T extends { sportId?: string; sportSlug?: string }>(items: T[]): T[] => {
    if (!matchedSport) {
      return items;
    }
    return items.filter(
      (item) =>
        item.sportId === matchedSport.id ||
        item.sportSlug === matchedSport.slug,
    );
  };

  if (wantsNext) {
    const slate = filterBySport(upcoming);
    const next = slate[0] ?? upcoming[0];
    return {
      answer: next
        ? `Next ${matchedSport?.name ?? "game"}: ${gameTitle(next)} on ${formatGameDateTime(next.kickoffAt)}.`
        : "Nothing is scheduled right now.",
      hits: slate.slice(0, 6).map((game) => toGameHit(game, "next")),
    };
  }

  if (wantsScore && tokens.length <= 3) {
    const finals = filterBySport(recent).filter(
      (game) => game.teamScore !== null && game.opponentScore !== null,
    );
    const latest = finals[0];
    return {
      answer: latest
        ? `Latest score: ${gameTitle(latest)} ${gameScore(latest)}.`
        : "No final scores posted yet.",
      hits: finals.slice(0, 6).map((game) => toGameHit(game)),
    };
  }

  const gameHits: SportsGuideHit[] = [];
  for (const game of [...upcoming, ...recent]) {
    const haystack = normalize(
      [
        game.sportName,
        game.opponentName,
        game.venue ?? "",
        game.headline ?? "",
        CAMPUS_TEAM_NAME,
        game.sportSlug,
      ].join(" "),
    );
    if (includesAll(haystack, tokens) || (matchedSport && game.sportId === matchedSport.id && wantsScore)) {
      gameHits.push(toGameHit(game));
    }
  }

  const playerHits: SportsGuideHit[] = [];
  for (const player of players) {
    const haystack = normalize(
      [
        player.fullName,
        player.jerseyNumber ? `#${player.jerseyNumber} ${player.jerseyNumber}` : "",
        player.position ?? "",
        player.sportSlug,
        sportById.get(player.sportId)?.name ?? "",
      ].join(" "),
    );
    if (includesAll(haystack, tokens) || wantsRoster && matchedSport?.id === player.sportId && tokens.length <= 2) {
      playerHits.push({
        kind: "player",
        title: `${player.jerseyNumber ? `#${player.jerseyNumber} ` : ""}${player.fullName}`,
        detail: [sportById.get(player.sportId)?.name, player.position, player.gradeYear]
          .filter(Boolean)
          .join(" · ") || "Roster",
        href: matchedSport
          ? `/sports?sport=${player.sportSlug}`
          : `/sports?sport=${player.sportSlug}`,
      });
    }
  }

  const statHits: SportsGuideHit[] = [];
  if (wantsStats || playerHits.length > 0) {
    const relevantPlayers = new Set(
      playerHits.length > 0
        ? playerHits.map((hit) => hit.title.replace(/^#\S+\s/, ""))
        : players
            .filter((player) => includesAll(normalize(player.fullName), tokens))
            .map((player) => player.fullName),
    );

    for (const row of stats) {
      const player = playerById.get(row.playerId);
      const haystack = normalize(
        [row.playerName, row.summary ?? "", row.gameLabel ?? "", player?.sportSlug ?? ""].join(" "),
      );
      const matchesPlayer = relevantPlayers.has(row.playerName);
      if (matchesPlayer || includesAll(haystack, tokens)) {
        statHits.push({
          kind: "stat",
          title: `${row.jerseyNumber ? `#${row.jerseyNumber} ` : ""}${row.playerName}`,
          detail: [row.summary, row.gameLabel].filter(Boolean).join(" · ") || "Stat line",
          href: row.gameId ? `/sports/games/${row.gameId}` : "/sports",
        });
      }
    }
  }

  const hits = [...gameHits, ...playerHits, ...statHits].slice(0, 12);

  if (hits.length === 0) {
    return {
      answer: `No sports match for “${rawQuery.trim()}”. Try a player name, opponent, “next game”, or “last score”.`,
      hits: upcoming.slice(0, 3).map((game) => toGameHit(game, "next")),
    };
  }

  const lead = hits[0];
  return {
    answer: `${lead.title}${lead.score ? ` — ${lead.score}` : ""}. ${hits.length > 1 ? `${hits.length} matches.` : ""}`.trim(),
    hits,
  };
}
