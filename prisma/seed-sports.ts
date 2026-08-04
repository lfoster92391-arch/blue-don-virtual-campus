/**
 * Seeds the default sport catalog for Sports Highlights.
 *
 * Opponent schools are intentionally NOT seeded — Broadcasting imports the real
 * schools (with their own logo uploads) from the Sports desk.
 *
 * Run with: npm run db:seed:sports
 */

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { DEFAULT_SPORTS } from "../src/config/sports-highlights";

async function main() {
  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() ||
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/blue_don_virtual_campus";

  const needsSsl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("sslmode=require");

  const pool = new Pool({
    // Supabase pooler serves a self-signed chain; drop sslmode so it doesn't
    // override the relaxed `ssl` option below.
    connectionString: needsSsl
      ? connectionString.replace(/[?&]sslmode=[^&]*/g, "")
      : connectionString,
    max: 1,
    connectionTimeoutMillis: 15_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (const sport of DEFAULT_SPORTS) {
      await prisma.sport.upsert({
        where: { slug: sport.slug },
        create: {
          slug: sport.slug,
          name: sport.name,
          season: sport.season,
          emoji: sport.emoji,
          sortOrder: sport.sortOrder,
        },
        update: {
          name: sport.name,
          season: sport.season,
          emoji: sport.emoji,
          sortOrder: sport.sortOrder,
        },
      });
    }

    const count = await prisma.sport.count();
    console.log(`[seed-sports] Sport catalog ready — ${count} sports.`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[seed-sports] Failed:", error);
  process.exitCode = 1;
});
