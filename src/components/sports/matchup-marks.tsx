import {
  CAMPUS_TEAM_LOGO_URL,
  CAMPUS_TEAM_NAME,
} from "@/config/sports-highlights";
import { cn } from "@/lib/utils";
import type { SportsGameView } from "@/services/sports-highlights-service";

type MarkSize = "sm" | "md";

function CampusMark({
  size = "md",
  tone = "light",
}: {
  size?: MarkSize;
  tone?: "light" | "dark";
}) {
  const dimension = size === "sm" ? "size-8" : "size-12";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={CAMPUS_TEAM_LOGO_URL}
      alt={`Madonna ${CAMPUS_TEAM_NAME} logo`}
      className={cn(
        dimension,
        "shrink-0 rounded-lg bg-white object-contain p-0.5",
        tone === "dark" ? "ring-1 ring-white/30" : "ring-1 ring-border",
      )}
    />
  );
}

function OpponentMark({
  name,
  logoUrl,
  size = "md",
  tone = "light",
}: {
  name: string;
  logoUrl: string | null;
  size?: MarkSize;
  tone?: "light" | "dark";
}) {
  const dimension = size === "sm" ? "size-8" : "size-12";
  if (logoUrl) {
    return (
      // Opponent logos are remote or uploaded; next/image would need every host.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={`${name} logo`}
        className={cn(
          dimension,
          "shrink-0 rounded-lg bg-white object-contain p-0.5",
          tone === "dark" ? "ring-1 ring-white/30" : "ring-1 ring-border",
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        dimension,
        "flex shrink-0 items-center justify-center rounded-lg text-xs font-semibold uppercase",
        tone === "dark"
          ? "bg-white/15 text-white"
          : "bg-muted text-muted-foreground",
      )}
      aria-hidden="true"
    >
      {name.slice(0, 2) || "VS"}
    </span>
  );
}

/** Blue Dons mark plus opponent mark (or initials) for a matchup. */
export function MatchupMarks({
  game,
  size = "md",
  tone = "light",
}: {
  game: Pick<SportsGameView, "site" | "opponentName" | "opponentLogoUrl">;
  size?: MarkSize;
  tone?: "light" | "dark";
}) {
  return (
    <span className="flex shrink-0 items-center gap-2">
      <CampusMark size={size} tone={tone} />
      <span
        className={cn(
          "text-xs font-semibold uppercase",
          tone === "dark" ? "text-white/60" : "text-muted-foreground",
        )}
      >
        {game.site === "HOME" ? "vs" : "at"}
      </span>
      <OpponentMark
        name={game.opponentName}
        logoUrl={game.opponentLogoUrl}
        size={size}
        tone={tone}
      />
    </span>
  );
}

export { CampusMark, OpponentMark };
