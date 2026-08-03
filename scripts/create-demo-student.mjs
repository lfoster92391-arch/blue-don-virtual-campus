// Idempotently create or reset the demo student Supabase auth user.
//
// Usage:
//   node scripts/create-demo-student.mjs
//
// What it does:
//   1. Ensures a Supabase auth user exists for the demo student email with the
//      known password and email_confirm = true (so login is not blocked on
//      email verification). If the user already exists, its password is reset
//      to the known value and its email is force-confirmed.
//   2. If DATABASE_URL is set, reconciles the Prisma `User` row so its primary
//      key matches the Supabase auth user id (critical: the app looks up the
//      campus profile by the Supabase user id). Any stale row that shares the
//      demo email but has a different id is removed first.
//
// Requires SUPABASE_SERVICE_ROLE_KEY (admin key). Nothing here is destructive
// beyond the single demo account.

import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

// Load .env then .env.local (local overrides win, matching Next.js behavior).
loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const DEMO_STUDENT_EMAIL = "demo.student@bluedon.test";
const DEMO_STUDENT_PASSWORD = "DemoStudent123!";
const DEMO_STUDENT_FIRST_NAME = "Alex";
const DEMO_STUDENT_LAST_NAME = "Martinez";
const DEMO_STUDENT_DISPLAY_NAME = "Alex Martinez";
const DEMO_SCHOOL_ID = "madonna-high-school";

const PLACEHOLDERS = ["your-project", "your-service-role-key", "xxxx.supabase.co"];

function hasRealValue(value) {
  if (!value) {
    return false;
  }
  return !PLACEHOLDERS.some((placeholder) => value.includes(placeholder));
}

async function ensureSupabaseAuthUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!hasRealValue(url) || !hasRealValue(serviceRoleKey)) {
    console.error(
      "\n[create-demo-student] WARNING: Supabase admin credentials are missing.\n" +
        "  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or\n" +
        "  .env.local (Project Settings -> API -> service_role key), then re-run:\n" +
        "    node scripts/create-demo-student.mjs\n" +
        "\n  Without the service role key the demo auth user cannot be created.\n" +
        "  Alternative: self-register the demo email at /register, then run\n" +
        "  `npm run db:seed` to attach memberships.\n",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalizedEmail = DEMO_STUDENT_EMAIL.toLowerCase();
  const userMetadata = {
    role: "student",
    first_name: DEMO_STUDENT_FIRST_NAME,
    last_name: DEMO_STUDENT_LAST_NAME,
    display_name: DEMO_STUDENT_DISPLAY_NAME,
    onboarded: true,
  };

  // Find an existing auth user with this email (paginate defensively).
  let existing = null;
  for (let page = 1; page <= 20 && !existing; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      throw new Error(`Could not list Supabase users: ${error.message}`);
    }
    existing = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail,
    );
    if (data.users.length < 1000) {
      break;
    }
  }

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO_STUDENT_PASSWORD,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (error) {
      throw new Error(`Could not reset demo auth user: ${error.message}`);
    }
    console.log(
      `[create-demo-student] Reset existing Supabase auth user (${DEMO_STUDENT_EMAIL}).`,
    );
    return data.user?.id ?? existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_STUDENT_EMAIL,
    password: DEMO_STUDENT_PASSWORD,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (error) {
    throw new Error(`Could not create demo auth user: ${error.message}`);
  }
  console.log(
    `[create-demo-student] Created Supabase auth user (${DEMO_STUDENT_EMAIL}).`,
  );
  return data.user?.id ?? null;
}

async function reconcilePrismaUser(authUserId) {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    console.log(
      "[create-demo-student] DATABASE_URL not set; skipping campus profile reconcile.\n" +
        "  Run `npm run db:seed` once the database is configured to attach the profile and memberships.",
    );
    return;
  }

  const pool = new Pool({ connectionString });
  try {
    // Tables are mapped to snake_case/plural names in the Prisma schema
    // (e.g. model User -> "users"). Qualify with the public schema because a
    // raw pg connection's search_path may differ on Supabase.
    await pool.query(`SET search_path TO public`);

    // Remove any stale profile that shares the email but has a different id.
    // FK memberships cascade on delete, so this is safe for the demo account.
    await pool.query(
      `DELETE FROM public.users WHERE lower(email) = lower($1) AND id <> $2`,
      [DEMO_STUDENT_EMAIL, authUserId],
    );

    // Ensure the school exists so the FK on users.school_id is satisfied.
    // updated_at is NOT NULL with no DB default (Prisma sets @updatedAt), so
    // set it explicitly on raw inserts.
    await pool.query(
      `INSERT INTO public.schools (id, name, updated_at) VALUES ($1, $2, now())
       ON CONFLICT (id) DO NOTHING`,
      [DEMO_SCHOOL_ID, "Madonna High School"],
    );

    await pool.query(
      `INSERT INTO public.users
         (id, email, first_name, last_name, display_name, role, status, school_id, onboarded_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'STUDENT', 'ACTIVE', $6, now(), now())
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         display_name = EXCLUDED.display_name,
         role = 'STUDENT',
         status = 'ACTIVE',
         school_id = EXCLUDED.school_id,
         onboarded_at = now(),
         updated_at = now()`,
      [
        authUserId,
        DEMO_STUDENT_EMAIL,
        DEMO_STUDENT_FIRST_NAME,
        DEMO_STUDENT_LAST_NAME,
        DEMO_STUDENT_DISPLAY_NAME,
        DEMO_SCHOOL_ID,
      ],
    );

    console.log(
      `[create-demo-student] Reconciled campus profile (id ${authUserId}).`,
    );
    console.log(
      "[create-demo-student] Run `npm run db:seed` to (re)attach IT Club, Student Council, NHS, and IT Academy memberships.",
    );
  } catch (error) {
    console.warn(
      `[create-demo-student] Could not reconcile campus profile: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    console.warn(
      "  The auth user is ready; run `npm run db:seed` to create the campus profile.",
    );
  } finally {
    await pool.end();
  }
}

async function main() {
  const authUserId = await ensureSupabaseAuthUser();
  if (!authUserId) {
    throw new Error("Supabase did not return an auth user id.");
  }

  await reconcilePrismaUser(authUserId);

  console.log("\n[create-demo-student] Done. Sign in at /login with:");
  console.log(`  Email:    ${DEMO_STUDENT_EMAIL}`);
  console.log(`  Password: ${DEMO_STUDENT_PASSWORD}`);
}

main().catch((error) => {
  console.error(
    `[create-demo-student] Failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
