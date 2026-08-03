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
import { DEFAULT_BROADCAST_SCRIPT_SLOTS } from "../src/config/broadcast-script";
import { FOCUS_CLUB_SLUGS } from "../src/config/focused-clubs";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to seed focus clubs.");
  }

  // Node pg v8+ treats sslmode=require as verify-full; force app-level SSL skip.
  let normalized = connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    url.searchParams.set("uselibpqcompat", "true");
    url.searchParams.set("sslmode", "require");
    normalized = url.toString();
  } catch {
    // keep raw
  }

  const pool = new Pool({
    connectionString: normalized,
    max: 1,
    ssl: { rejectUnauthorized: false },
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

      if (seed.slug === "broadcasting") {
        const org = await prisma.organization.findUnique({
          where: { slug: "broadcasting" },
          select: { id: true },
        });
        if (org && typeof prisma.broadcastScriptTemplate?.upsert === "function") {
          try {
            await prisma.broadcastScriptTemplate.upsert({
              where: { organizationId: org.id },
              create: {
                organizationId: org.id,
                slots: DEFAULT_BROADCAST_SCRIPT_SLOTS,
              },
              update: {},
            });
            console.log("Seeded Broadcasting Daily Rundown template");
          } catch (error) {
            console.warn(
              "Skipped BroadcastScriptTemplate seed (table may be missing):",
              error instanceof Error ? error.message : error,
            );
          }
        }
      }

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
