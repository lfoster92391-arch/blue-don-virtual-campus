/**
 * Production-safe upsert of the three focus clubs (IT, Broadcasting, Cricut).
 *
 * Usage:
 *   npm run db:seed:focus-clubs
 *
 * Requires DATABASE_URL. Does not wipe data or create demo memberships.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { MADONNA_ORGANIZATIONS } from "../src/config/madonna-organizations";
import { FOCUS_CLUB_SLUGS } from "../src/config/focused-clubs";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed focus clubs.");
  }

  const pool = new Pool({
    connectionString,
    max: 1,
    ...(connectionString.includes("supabase.co") ||
    connectionString.includes("sslmode=require")
      ? { ssl: { rejectUnauthorized: false } }
      : {}),
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    for (const slug of FOCUS_CLUB_SLUGS) {
      const seed = MADONNA_ORGANIZATIONS.find((org) => org.slug === slug);
      if (!seed) {
        throw new Error(`Missing Madonna catalog entry for focus club: ${slug}`);
      }

      await prisma.organization.upsert({
        where: { slug: seed.slug },
        update: {
          name: seed.name,
          description: seed.description,
          type: seed.type,
          category: seed.category,
          sortOrder: seed.sortOrder,
        },
        create: {
          id: seed.id,
          slug: seed.slug,
          name: seed.name,
          type: seed.type,
          category: seed.category,
          sortOrder: seed.sortOrder,
          description: seed.description,
        },
      });

      console.log(`Upserted focus club: ${seed.slug}`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
