/**
 * Imports Madonna's 2026 fall schedules (football + volleyball) into the Sports
 * desk from the printed sheets transcribed in `madonna-2026-schedule-data.ts`.
 *
 * Safe to re-run. A game is keyed on sport + Eastern calendar date, not on the
 * exact timestamp, so a second run corrects a kickoff that was entered with the
 * wrong time instead of scheduling the game twice.
 *
 * What a re-run will and won't touch:
 *   - Schedule facts (kickoff, site, opponent) are rewritten from the sheet.
 *   - Anything Lisa typed — venue, crew note, headline, summary, scores — is
 *     left alone unless you pass --force.
 *   - Games that are no longer SCHEDULED (final, postponed, canceled) are only
 *     ever filled in, never rewritten, so a played game keeps its result.
 *   - Games on dates the sheets don't list are never touched or deleted.
 *
 * Missing opponents are created without a logo, mascot, city, or state — the
 * same call `opponent-schools-data.ts` makes, since guessing those puts wrong
 * details on the scoreboard. Lisa fills them in from the Sports desk.
 *
 * Usage:
 *   npx tsx scripts/import-sports-schedule.ts --dry-run
 *   npx tsx scripts/import-sports-schedule.ts
 *   npx tsx scripts/import-sports-schedule.ts --force   # re-assert sheet text
 *
 * Reads DATABASE_URL from .env / .env.local.
 */

import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { SCHEDULE_SCHOOLS, SCHEDULES, type ScheduleRow } from "./madonna-2026-schedule-data";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

/** Madonna is in Weirton, WV — the same zone `formatGameDateTime` renders in. */
const CAMPUS_TIME_ZONE = "America/New_York";

/**
 * `kickoffAt` is NOT NULL, so a sheet that says "TBD" still needs a timestamp.
 * Midnight reads as an obvious placeholder rather than a plausible tip-off, and
 * the row's venue tag says "time TBD" out loud on the public schedule.
 */
const TBD_PLACEHOLDER_TIME = "00:00";

const NEW_SCHOOL_NOTE =
  "Added from Lisa's 2026 schedule import. Logo, mascot, city, and state still need filling in from the Sports desk.";

function buildPool() {
  const connectionString = process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — cannot reach the campus database.");
  }

  const needsSsl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("sslmode=require");

  return new Pool({
    // Supabase's pooler serves a self-signed chain; drop sslmode so it can't
    // override the relaxed `ssl` option below.
    connectionString: needsSsl
      ? connectionString.replace(/[?&]sslmode=[^&]*/g, "")
      : connectionString,
    max: 1,
    connectionTimeoutMillis: 20_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

const zonedFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function zonedParts(instant: Date) {
  const parts = zonedFormatter.formatToParts(instant);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return {
    year: value("year"),
    month: value("month"),
    day: value("day"),
    // Some ICU builds render midnight as hour 24.
    hour: value("hour") % 24,
    minute: value("minute"),
    second: value("second"),
  };
}

/** Milliseconds Eastern is ahead of UTC at that instant (negative, here). */
function zoneOffsetMs(instant: Date): number {
  const parts = zonedParts(instant);
  return (
    Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) -
    instant.getTime()
  );
}

/**
 * "2026-08-28" + "19:00" Eastern → the UTC instant to store. Two passes because
 * the offset looked up from the naive guess can be on the wrong side of a DST
 * boundary; the second pass uses the offset at the corrected instant.
 */
function campusTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const naive = Date.UTC(year, month - 1, day, hour, minute);

  let instant = new Date(naive - zoneOffsetMs(new Date(naive)));
  instant = new Date(naive - zoneOffsetMs(instant));
  return instant;
}

/** Eastern calendar date of a stored kickoff — the upsert key. */
function campusDateKey(instant: Date): string {
  const parts = zonedParts(instant);
  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0"),
  ].join("-");
}

function describeRow(row: ScheduleRow): string {
  const when = row.time ? `${row.date} ${row.time}` : `${row.date} TBD  `;
  const who = row.opponentSlug ?? row.opponentLabel ?? "—";
  return `${when} ${row.site.padEnd(7)} ${who}`;
}

async function main() {
  const pool = buildPool();
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const counts = {
    schoolsCreated: 0,
    schoolsMatched: 0,
    teamsCreated: 0,
    teamsExisting: 0,
    gamesCreated: {} as Record<string, number>,
    gamesUpdated: {} as Record<string, number>,
    gamesLocked: 0,
  };
  const created: string[] = [];
  const problems: string[] = [];

  try {
    const sportSlugs = SCHEDULES.map((schedule) => schedule.sportSlug);
    const sports = await prisma.sport.findMany({
      where: { slug: { in: sportSlugs } },
      select: { id: true, slug: true, name: true },
    });
    const sportBySlug = new Map(sports.map((sport) => [sport.slug, sport]));

    const missingSports = sportSlugs.filter((slug) => !sportBySlug.has(slug));
    if (missingSports.length > 0) {
      console.error(
        `[schedule] Sport catalog is missing ${missingSports.join(", ")} — run ` +
          "`npm run db:seed:sports` first.",
      );
      process.exitCode = 1;
      return;
    }

    console.log(
      `[schedule] ${dryRun ? "DRY RUN — no writes." : "Writing to the campus database."}\n`,
    );

    // ---- Opponent schools ------------------------------------------------
    // On a dry run the new schools are never written, so their team links can't
    // be looked up by id — track them by slug to keep the preview counts honest.
    const plannedSchools = new Set<string>();

    console.log("[schedule] Opponent directory");
    for (const seed of SCHEDULE_SCHOOLS) {
      const existing = await prisma.opponentSchool.findUnique({
        where: { slug: seed.slug },
        select: { id: true, name: true, shortName: true, notes: true, logoUrl: true },
      });

      if (existing) {
        counts.schoolsMatched++;
        console.log(`[schedule]   matched  ${seed.name}`);
        continue;
      }

      counts.schoolsCreated++;
      created.push(seed.name);
      plannedSchools.add(seed.slug);
      console.log(`[schedule]   CREATE   ${seed.name}  (no logo)`);

      if (!dryRun) {
        await prisma.opponentSchool.create({
          data: {
            slug: seed.slug,
            name: seed.name,
            shortName: seed.shortName,
            notes: NEW_SCHOOL_NOTE,
            isActive: true,
          },
        });
      }
    }

    // Every opponent the sheets touch, whether we just made it or not.
    const referencedSlugs = new Set<string>(SCHEDULE_SCHOOLS.map((seed) => seed.slug));
    for (const schedule of SCHEDULES) {
      for (const row of schedule.rows) {
        if (row.opponentSlug) referencedSlugs.add(row.opponentSlug);
      }
    }

    const schools = await prisma.opponentSchool.findMany({
      where: { slug: { in: [...referencedSlugs] } },
      select: { id: true, slug: true, name: true, shortName: true },
    });
    const schoolBySlug = new Map(schools.map((school) => [school.slug, school]));

    const unresolved = [...referencedSlugs].filter((slug) => !schoolBySlug.has(slug));
    if (unresolved.length > 0 && !dryRun) {
      console.error(
        `[schedule] No opponent school for ${unresolved.join(", ")} — add them to ` +
          "SCHEDULE_SCHOOLS and re-run.",
      );
      process.exitCode = 1;
      return;
    }

    // ---- Per-sport team links -------------------------------------------
    // A game can only point at an opponent through its per-sport team, so every
    // school a sheet names needs one. Schools that only appear as the third team
    // in a tri-match are linked too, via their declared sports, so Lisa can
    // schedule them head-to-head later.
    const neededTeams = new Map<string, Set<string>>();
    const require = (sportSlug: string, schoolSlug: string) => {
      const set = neededTeams.get(sportSlug) ?? new Set<string>();
      set.add(schoolSlug);
      neededTeams.set(sportSlug, set);
    };

    for (const schedule of SCHEDULES) {
      for (const row of schedule.rows) {
        if (row.opponentSlug && !row.useSchoolOnly) {
          require(schedule.sportSlug, row.opponentSlug);
        }
      }
    }
    for (const seed of SCHEDULE_SCHOOLS) {
      for (const sportSlug of seed.sports) require(sportSlug, seed.slug);
    }

    console.log("\n[schedule] Sport team links");
    for (const schedule of SCHEDULES) {
      const sport = sportBySlug.get(schedule.sportSlug)!;
      const needed = neededTeams.get(schedule.sportSlug) ?? new Set<string>();

      for (const slug of needed) {
        const school = schoolBySlug.get(slug);
        if (!school) {
          const seed = SCHEDULE_SCHOOLS.find((entry) => entry.slug === slug);
          if (dryRun && seed && plannedSchools.has(slug)) {
            counts.teamsCreated++;
            console.log(`[schedule]   CREATE   ${seed.shortName} ${sport.name}`);
          }
          continue;
        }

        const existing = await prisma.opponentSportTeam.findUnique({
          where: { schoolId_sportId: { schoolId: school.id, sportId: sport.id } },
          select: { id: true },
        });

        if (existing) {
          counts.teamsExisting++;
          continue;
        }

        counts.teamsCreated++;
        const teamName = `${school.shortName ?? school.name} ${sport.name}`;
        console.log(`[schedule]   CREATE   ${teamName}`);

        if (!dryRun) {
          await prisma.opponentSportTeam.create({
            data: { schoolId: school.id, sportId: sport.id, teamName, isActive: true },
          });
        }
      }
    }

    // ---- Games -----------------------------------------------------------
    for (const schedule of SCHEDULES) {
      const sport = sportBySlug.get(schedule.sportSlug)!;
      counts.gamesCreated[schedule.label] = 0;
      counts.gamesUpdated[schedule.label] = 0;

      // Teams are re-read so links created moments ago are visible.
      const teams = await prisma.opponentSportTeam.findMany({
        where: { sportId: sport.id },
        select: { id: true, schoolId: true },
      });
      const teamBySchoolId = new Map(teams.map((team) => [team.schoolId, team.id]));

      const dates = schedule.rows.map((row) => row.date).sort();
      const windowStart = campusTimeToUtc(dates[0], "00:00");
      const windowEnd = campusTimeToUtc(dates[dates.length - 1], "23:59");

      const existingGames = await prisma.sportsGame.findMany({
        where: { sportId: sport.id, kickoffAt: { gte: windowStart, lte: windowEnd } },
        select: {
          id: true,
          kickoffAt: true,
          site: true,
          status: true,
          venue: true,
          broadcastNote: true,
          opponentId: true,
          opponentTeamId: true,
          opponentLabel: true,
        },
      });

      const byDate = new Map<string, typeof existingGames>();
      for (const game of existingGames) {
        const key = campusDateKey(game.kickoffAt);
        byDate.set(key, [...(byDate.get(key) ?? []), game]);
      }

      console.log(`\n[schedule] ${schedule.label} — ${schedule.rows.length} game(s)`);

      for (const row of schedule.rows) {
        const school = row.opponentSlug ? schoolBySlug.get(row.opponentSlug) : undefined;
        const kickoffAt = campusTimeToUtc(row.date, row.time ?? TBD_PLACEHOLDER_TIME);
        const opponentTeamId =
          school && !row.useSchoolOnly ? (teamBySchoolId.get(school.id) ?? null) : null;
        const opponentLabel = row.opponentLabel ?? null;

        const sameDate = byDate.get(row.date) ?? [];
        if (sameDate.length > 1) {
          problems.push(
            `${schedule.label} ${row.date}: ${sameDate.length} games already on that date — skipped, resolve by hand.`,
          );
          console.log(`[schedule]   SKIP     ${describeRow(row)}  (ambiguous existing rows)`);
          continue;
        }

        const existing = sameDate[0];

        if (!existing) {
          counts.gamesCreated[schedule.label]++;
          console.log(`[schedule]   CREATE   ${describeRow(row)}`);

          if (!dryRun) {
            await prisma.sportsGame.create({
              data: {
                sportId: sport.id,
                opponentId: school?.id ?? null,
                opponentTeamId,
                opponentLabel,
                kickoffAt,
                site: row.site,
                venue: row.venue ?? null,
                broadcastNote: row.broadcastNote ?? null,
                status: "SCHEDULED",
              },
            });
          }
          continue;
        }

        // A game that already kicked off keeps its facts; only blanks get filled.
        const locked = existing.status !== "SCHEDULED";
        if (locked) counts.gamesLocked++;

        const keepText = (mine: string | undefined, theirs: string | null) =>
          force ? (mine ?? theirs) : (theirs?.trim() ? theirs : (mine ?? null));

        const data = {
          opponentId: locked ? (existing.opponentId ?? school?.id ?? null) : (school?.id ?? null),
          opponentTeamId: locked ? (existing.opponentTeamId ?? opponentTeamId) : opponentTeamId,
          opponentLabel: locked ? (existing.opponentLabel ?? opponentLabel) : opponentLabel,
          kickoffAt: locked ? existing.kickoffAt : kickoffAt,
          site: locked ? existing.site : row.site,
          venue: keepText(row.venue, existing.venue),
          broadcastNote: keepText(row.broadcastNote, existing.broadcastNote),
        };

        const changed =
          data.opponentId !== existing.opponentId ||
          data.opponentTeamId !== existing.opponentTeamId ||
          data.opponentLabel !== existing.opponentLabel ||
          data.kickoffAt.getTime() !== existing.kickoffAt.getTime() ||
          data.site !== existing.site ||
          data.venue !== existing.venue ||
          data.broadcastNote !== existing.broadcastNote;

        if (!changed) {
          console.log(`[schedule]   ok       ${describeRow(row)}`);
          continue;
        }

        counts.gamesUpdated[schedule.label]++;
        const why = locked ? "(filled blanks only — already played)" : "";
        const timeFix =
          !locked && data.kickoffAt.getTime() !== existing.kickoffAt.getTime()
            ? `(kickoff was ${existing.kickoffAt.toISOString()})`
            : "";
        console.log(`[schedule]   UPDATE   ${describeRow(row)}  ${why}${timeFix}`);

        if (!dryRun) {
          await prisma.sportsGame.update({ where: { id: existing.id }, data });
        }
      }
    }

    // ---- Summary ---------------------------------------------------------
    console.log("\n[schedule] ── Summary ──");
    console.log(
      `[schedule] Opponent schools: ${counts.schoolsCreated} created, ${counts.schoolsMatched} already present.`,
    );
    if (created.length > 0) {
      console.log(`[schedule]   created: ${created.join(", ")}`);
    }
    console.log(
      `[schedule] Sport team links: ${counts.teamsCreated} created, ${counts.teamsExisting} already linked.`,
    );
    for (const schedule of SCHEDULES) {
      console.log(
        `[schedule] ${schedule.label}: ${counts.gamesCreated[schedule.label]} created, ` +
          `${counts.gamesUpdated[schedule.label]} updated, of ${schedule.rows.length} on the sheet.`,
      );
    }
    if (counts.gamesLocked > 0) {
      console.log(
        `[schedule] ${counts.gamesLocked} game(s) already past SCHEDULED — facts left as recorded.`,
      );
    }
    for (const problem of problems) {
      console.warn(`[schedule] NEEDS ATTENTION: ${problem}`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[schedule] Failed:", error);
  process.exitCode = 1;
});
