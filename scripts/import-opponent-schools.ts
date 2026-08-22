/**
 * Imports Broadcasting's opponent directory: uploads each committed logo to the
 * `campus-media` bucket under the same `sports-schools/` prefix the Sports desk
 * upload form uses, then upserts `OpponentSchool` + `OpponentSportTeam` rows.
 *
 * Safe to re-run. Schools are keyed on `slug`, teams on (school, sport), and
 * storage objects on a stable path — so a second run overwrites the same objects
 * instead of piling up timestamped copies. Fields Lisa has since edited by hand
 * are left alone: an existing logo, mascot, or note is never clobbered unless
 * you pass --force.
 *
 * Usage:
 *   npx tsx scripts/import-opponent-schools.ts --dry-run
 *   npx tsx scripts/import-opponent-schools.ts
 *   npx tsx scripts/import-opponent-schools.ts --force   # re-point logos/metadata
 *
 * Reads DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * from the environment (.env / .env.local, or Vercel production values).
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { Pool } from "pg";

import { PrismaClient } from "../src/generated/prisma/client";
import { CAMPUS_MEDIA_BUCKET } from "../src/config/broadcast-media";
import { SPORTS_STORAGE_PREFIX } from "../src/config/sports-highlights";
import { CORE_SPORT_SLUGS, OPPONENT_SCHOOLS } from "./opponent-schools-data";

dotenv.config({ path: ".env", quiet: true });
dotenv.config({ path: ".env.local", override: true, quiet: true });

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const LOGO_DIR = path.join(REPO_ROOT, "public", "images", "sports", "opponents");

/**
 * Stable, non-timestamped storage path. The interactive upload form namespaces
 * by uploader id and time; a re-runnable import wants idempotency instead.
 */
const STORAGE_FOLDER = `${SPORTS_STORAGE_PREFIX}/schools/import`;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const force = args.includes("--force");

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

function buildStorage() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to upload logos.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * The app assumes `campus-media` already exists, but a fresh Supabase project
 * has no buckets, and every upload then fails with "Bucket not found". Create it
 * public: `getPublicUrl()` is what the Sports desk stores, and the directory,
 * scoreboard, and overlay all render those URLs in a plain `<img>`.
 */
async function ensureBucket(storage: ReturnType<typeof buildStorage>) {
  const { data: buckets, error } = await storage.storage.listBuckets();
  if (error) {
    throw new Error(`Could not list storage buckets: ${error.message}`);
  }

  const existing = buckets.find((bucket) => bucket.name === CAMPUS_MEDIA_BUCKET);
  if (existing) {
    if (!existing.public) {
      console.warn(
        `[opponents] Bucket ${CAMPUS_MEDIA_BUCKET} is private — logo URLs will 404 until it is made public.`,
      );
    }
    return;
  }

  // No explicit fileSizeLimit: Supabase rejects a bucket limit above the
  // project's global cap, so inherit the project default and let the app's own
  // CAMPUS_MEDIA_MAX_BYTES check reject oversized uploads first.
  const { error: createError } = await storage.storage.createBucket(CAMPUS_MEDIA_BUCKET, {
    public: true,
  });
  if (createError) {
    throw new Error(`Could not create bucket ${CAMPUS_MEDIA_BUCKET}: ${createError.message}`);
  }
  console.log(`[opponents] Created public storage bucket "${CAMPUS_MEDIA_BUCKET}".`);
}

async function main() {
  const missingLogos = OPPONENT_SCHOOLS.filter(
    (school) => !existsSync(path.join(LOGO_DIR, `${school.slug}.png`)),
  );
  if (missingLogos.length === OPPONENT_SCHOOLS.length) {
    console.error(
      `[opponents] No prepared logos in ${path.relative(REPO_ROOT, LOGO_DIR)} — run ` +
        "`npx tsx scripts/prepare-opponent-logos.ts` first.",
    );
    process.exitCode = 1;
    return;
  }
  for (const school of missingLogos) {
    console.warn(`[opponents] No logo file for ${school.name} — importing without one.`);
  }

  const storage = dryRun ? null : buildStorage();
  if (storage) {
    await ensureBucket(storage);
  }

  const pool = buildPool();
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  const counts = {
    schoolsCreated: 0,
    schoolsUpdated: 0,
    logosUploaded: 0,
    logosKept: 0,
    teamsCreated: 0,
    teamsExisting: 0,
  };

  try {
    const sports = await prisma.sport.findMany({
      where: { slug: { in: [...CORE_SPORT_SLUGS] } },
      select: { id: true, slug: true, name: true },
    });

    const foundSlugs = new Set(sports.map((sport) => sport.slug));
    const absent = CORE_SPORT_SLUGS.filter((slug) => !foundSlugs.has(slug));
    if (absent.length > 0) {
      console.warn(
        `[opponents] Sport catalog is missing ${absent.join(", ")} — run \`npm run db:seed:sports\` ` +
          "to link those. Continuing with the sports that do exist.",
      );
    }
    console.log(
      `[opponents] Linking to ${sports.length} sport(s): ${sports.map((s) => s.name).join(", ")}`,
    );
    console.log(
      `[opponents] ${dryRun ? "DRY RUN — no writes." : `Writing to ${CAMPUS_MEDIA_BUCKET}/${STORAGE_FOLDER} and the campus database.`}\n`,
    );

    for (const school of OPPONENT_SCHOOLS) {
      const existing = await prisma.opponentSchool.findUnique({
        where: { slug: school.slug },
        select: { id: true, logoUrl: true, mascot: true, notes: true, shortName: true },
      });

      // Upload only when there's nothing to preserve, so a logo Lisa swapped in
      // from the Sports desk survives a re-run.
      const shouldUpload = Boolean(!existing?.logoUrl || force);
      let logo: { logoUrl: string; logoPath: string } | null = null;
      const logoFile = path.join(LOGO_DIR, `${school.slug}.png`);

      if (shouldUpload && existsSync(logoFile)) {
        const storagePath = `${STORAGE_FOLDER}/${school.slug}.png`;

        if (dryRun) {
          logo = {
            logoUrl: `(dry-run) ${CAMPUS_MEDIA_BUCKET}/${storagePath}`,
            logoPath: storagePath,
          };
        } else {
          const bytes = readFileSync(logoFile);
          const { error } = await storage!.storage
            .from(CAMPUS_MEDIA_BUCKET)
            .upload(storagePath, bytes, { contentType: "image/png", upsert: true });

          if (error) {
            console.error(`[opponents] Logo upload failed for ${school.name}: ${error.message}`);
          } else {
            const { data } = storage!.storage
              .from(CAMPUS_MEDIA_BUCKET)
              .getPublicUrl(storagePath);
            logo = { logoUrl: data.publicUrl, logoPath: storagePath };
            counts.logosUploaded++;
          }
        }
      } else if (existing?.logoUrl) {
        counts.logosKept++;
      }

      let schoolId = existing?.id ?? "(dry-run)";

      if (!dryRun) {
        const saved = await prisma.opponentSchool.upsert({
          where: { slug: school.slug },
          create: {
            slug: school.slug,
            name: school.name,
            shortName: school.shortName,
            mascot: school.mascot ?? null,
            notes: school.notes ?? null,
            isActive: true,
            ...(logo ?? {}),
          },
          update: {
            name: school.name,
            // Don't overwrite details Lisa has filled in from the Sports desk.
            shortName: existing?.shortName ?? school.shortName,
            mascot: force ? (school.mascot ?? null) : (existing?.mascot ?? school.mascot ?? null),
            notes: force ? (school.notes ?? null) : (existing?.notes ?? school.notes ?? null),
            isActive: true,
            ...(logo ?? {}),
          },
          select: { id: true },
        });
        schoolId = saved.id;
      }

      if (existing) counts.schoolsUpdated++;
      else counts.schoolsCreated++;

      let linked = 0;
      if (!school.skipSportLinking) {
        for (const sport of sports) {
          const teamName = `${school.shortName} ${sport.name}`;

          if (dryRun) {
            linked++;
            counts.teamsCreated++;
            continue;
          }

          const existingTeam = await prisma.opponentSportTeam.findUnique({
            where: { schoolId_sportId: { schoolId, sportId: sport.id } },
            select: { id: true },
          });

          if (existingTeam) {
            counts.teamsExisting++;
            linked++;
            continue;
          }

          await prisma.opponentSportTeam.create({
            data: { schoolId, sportId: sport.id, teamName, isActive: true },
          });
          counts.teamsCreated++;
          linked++;
        }
      }

      const state = existing ? "exists" : "new   ";
      const logoNote = logo ? "logo uploaded" : existing?.logoUrl ? "logo kept" : "no logo";
      console.log(
        `[opponents] ${state} ${school.name.padEnd(45)} ${String(linked).padStart(2)} sport(s)  ${logoNote}`,
      );
    }

    const totalSchools = await prisma.opponentSchool.count({ where: { isActive: true } });

    console.log(
      `\n[opponents] Schools: ${counts.schoolsCreated} created, ${counts.schoolsUpdated} already present.`,
    );
    console.log(
      `[opponents] Logos: ${counts.logosUploaded} uploaded, ${counts.logosKept} left as-is.`,
    );
    console.log(
      `[opponents] Sport teams: ${counts.teamsCreated} created, ${counts.teamsExisting} already linked.`,
    );
    if (!dryRun) {
      console.log(`[opponents] Opponent directory now holds ${totalSchools} active school(s).`);
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[opponents] Failed:", error);
  process.exitCode = 1;
});
