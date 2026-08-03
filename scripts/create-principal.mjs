// Idempotently create or reset leadership admin accounts (principal + backup IT admin).
//
// Usage:
//   node scripts/create-principal.mjs
//   node scripts/create-principal.mjs --email=jheckathorn@weirtonmadonna.org
//   node scripts/create-principal.mjs --email=lisamorris@weirtonmadonna.org --password=YourSecurePass123!
//
// By default provisions BOTH accounts:
//   - jheckathorn@weirtonmadonna.org (primary principal)
//   - lisamorris@weirtonmadonna.org (backup leadership admin)
//
// Password resolution (first match wins):
//   --password=...  |  PRINCIPAL_PASSWORD / BACKUP_ADMIN_PASSWORD / PROVISION_PASSWORD
//   If none set, a one-time password is generated and printed to stdout.
//
// Optional env:
//   PRINCIPAL_EMAIL              (default: jheckathorn@weirtonmadonna.org)
//   BACKUP_ADMIN_EMAIL           (default: lisamorris@weirtonmadonna.org)
//   PRINCIPAL_FIRST_NAME / PRINCIPAL_LAST_NAME
//   BACKUP_ADMIN_FIRST_NAME / BACKUP_ADMIN_LAST_NAME
//   PRINCIPAL_STUDENT_EMAIL      (link child for parent portal)
//   BACKUP_ADMIN_STUDENT_EMAIL   (optional parent link for backup admin)
//   LEADERSHIP_ORG_SLUG          (e.g. it-club — advisor LEAD membership)
//   DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Passwords are never stored in the repo. Re-running resets password and
// sets email_confirm=true (so unconfirmed accounts can sign in).

import { randomBytes } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const DEFAULT_PRINCIPAL_EMAIL = "jheckathorn@weirtonmadonna.org";
const DEFAULT_BACKUP_EMAIL = "lisamorris@weirtonmadonna.org";
const SCHOOL_ID = "madonna-high-school";

const PLACEHOLDERS = ["your-project", "your-service-role-key", "xxxx.supabase.co"];

function hasRealValue(value) {
  if (!value) {
    return false;
  }
  return !PLACEHOLDERS.some((placeholder) => value.includes(placeholder));
}

function parseArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : null;
}

function generatePassword() {
  const base = randomBytes(12).toString("base64url");
  return `${base}Aa1!`;
}

function newId() {
  return `c${randomBytes(12).toString("hex")}`;
}

function displayNameFromParts(firstName, lastName, email) {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || email.split("@")[0];
}

function resolvePassword(...candidates) {
  for (const candidate of candidates) {
    const value = typeof candidate === "string" ? candidate.trim() : "";
    if (value) {
      return value;
    }
  }
  return null;
}

/**
 * Supabase pooler TLS often uses a chain Node rejects by default.
 * pg 8.22+ also maps sslmode=require → verify-full and overwrites Pool `ssl`
 * from the connection string, so strip sslmode and set rejectUnauthorized: false.
 */
function createDbPool(connectionString) {
  const needsSsl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("sslmode=require");

  let normalized = connectionString;
  if (needsSsl) {
    try {
      const u = new URL(connectionString);
      u.searchParams.delete("sslmode");
      normalized = u.toString();
    } catch {
      normalized = connectionString.replace(/([?&])sslmode=[^&]*/g, (m, sep) =>
        sep === "?" ? "?" : "",
      );
    }
  }

  return new Pool({
    connectionString: normalized,
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

function buildAccountSpecs() {
  const singleEmail =
    parseArg("email")?.toLowerCase() ||
    process.env.PROVISION_EMAIL?.trim().toLowerCase() ||
    null;
  const cliPassword = parseArg("password");

  const principalEmail =
    process.env.PRINCIPAL_EMAIL?.trim().toLowerCase() || DEFAULT_PRINCIPAL_EMAIL;
  const backupEmail =
    process.env.BACKUP_ADMIN_EMAIL?.trim().toLowerCase() || DEFAULT_BACKUP_EMAIL;

  const orgSlug = process.env.LEADERSHIP_ORG_SLUG?.trim() || null;

  const specs = [
    {
      key: "principal",
      email: principalEmail,
      password: resolvePassword(cliPassword, process.env.PRINCIPAL_PASSWORD),
      firstName: process.env.PRINCIPAL_FIRST_NAME?.trim() || "James",
      lastName: process.env.PRINCIPAL_LAST_NAME?.trim() || "Heckathorn",
      studentEmail: process.env.PRINCIPAL_STUDENT_EMAIL?.trim().toLowerCase() || null,
      relationship: process.env.PRINCIPAL_STUDENT_RELATIONSHIP?.trim() || "Parent",
      orgSlug,
    },
    {
      key: "backup",
      email: backupEmail,
      password: resolvePassword(cliPassword, process.env.BACKUP_ADMIN_PASSWORD),
      firstName: process.env.BACKUP_ADMIN_FIRST_NAME?.trim() || "Lisa",
      lastName: process.env.BACKUP_ADMIN_LAST_NAME?.trim() || "Morris",
      studentEmail: process.env.BACKUP_ADMIN_STUDENT_EMAIL?.trim().toLowerCase() || null,
      relationship: process.env.BACKUP_ADMIN_STUDENT_RELATIONSHIP?.trim() || "Parent",
      orgSlug,
    },
  ];

  if (singleEmail) {
    const match = specs.find((spec) => spec.email === singleEmail);
    if (match) {
      return [
        {
          ...match,
          password: resolvePassword(
            cliPassword,
            match.key === "backup"
              ? process.env.BACKUP_ADMIN_PASSWORD
              : process.env.PRINCIPAL_PASSWORD,
            process.env.PROVISION_PASSWORD,
            match.password,
          ),
        },
      ];
    }
    return [
      {
        key: "custom",
        email: singleEmail,
        password: resolvePassword(
          cliPassword,
          process.env.PROVISION_PASSWORD,
          process.env.PRINCIPAL_PASSWORD,
          process.env.BACKUP_ADMIN_PASSWORD,
        ),
        firstName: process.env.PRINCIPAL_FIRST_NAME?.trim() || "Leadership",
        lastName: process.env.PRINCIPAL_LAST_NAME?.trim() || "Admin",
        studentEmail: process.env.PRINCIPAL_STUDENT_EMAIL?.trim().toLowerCase() || null,
        relationship: process.env.PRINCIPAL_STUDENT_RELATIONSHIP?.trim() || "Parent",
        orgSlug,
      },
    ];
  }

  // When provisioning both accounts, --password= alone would set the same
  // password on both — only apply it when a single --email= was provided.
  return specs.map((spec) => ({
    ...spec,
    password: resolvePassword(
      spec.key === "backup"
        ? process.env.BACKUP_ADMIN_PASSWORD
        : process.env.PRINCIPAL_PASSWORD,
    ),
  }));
}

async function findAuthUserByEmail(admin, email) {
  const normalizedEmail = email.toLowerCase();
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });
    if (error) {
      throw new Error(`Could not list Supabase users: ${error.message}`);
    }
    const existing = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail,
    );
    if (existing) {
      return existing;
    }
    if (data.users.length < 1000) {
      break;
    }
  }
  return null;
}

async function ensureSupabaseAuthUser(admin, spec, password) {
  const displayName = displayNameFromParts(spec.firstName, spec.lastName, spec.email);
  const userMetadata = {
    role: "admin",
    first_name: spec.firstName,
    last_name: spec.lastName,
    display_name: displayName,
    onboarded: true,
  };

  const existing = await findAuthUserByEmail(admin, spec.email);

  if (existing) {
    const { data, error } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (error) {
      throw new Error(`Could not reset auth user (${spec.email}): ${error.message}`);
    }
    console.log(`[create-principal] Reset existing Supabase auth user (${spec.email}).`);
    return data.user?.id ?? existing.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: spec.email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (error) {
    throw new Error(`Could not create auth user (${spec.email}): ${error.message}`);
  }
  console.log(`[create-principal] Created Supabase auth user (${spec.email}).`);
  return data.user?.id ?? null;
}

async function reconcileCampusProfile(pool, spec, authUserId) {
  const displayName = displayNameFromParts(spec.firstName, spec.lastName, spec.email);

  await pool.query(`SET search_path TO public`);

  await pool.query(
    `DELETE FROM public.users WHERE lower(email) = lower($1) AND id <> $2`,
    [spec.email, authUserId],
  );

  await pool.query(
    `INSERT INTO public.schools (id, name, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (id) DO NOTHING`,
    [SCHOOL_ID, "Madonna High School"],
  );

  await pool.query(
    `INSERT INTO public.users
       (id, email, first_name, last_name, display_name, role, status, school_id, onboarded_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, 'ADMIN', 'ACTIVE', $6, now(), now())
     ON CONFLICT (id) DO UPDATE SET
       email = EXCLUDED.email,
       first_name = EXCLUDED.first_name,
       last_name = EXCLUDED.last_name,
       display_name = EXCLUDED.display_name,
       role = 'ADMIN',
       status = 'ACTIVE',
       school_id = EXCLUDED.school_id,
       onboarded_at = now(),
       updated_at = now()`,
    [authUserId, spec.email, spec.firstName, spec.lastName, displayName, SCHOOL_ID],
  );

  console.log(`[create-principal] Reconciled campus profile (${spec.email}, role ADMIN).`);
}

async function resolveStudentId(pool, studentEmail) {
  if (!studentEmail) {
    return null;
  }

  const result = await pool.query(
    `SELECT id, email, role, status FROM public.users
     WHERE lower(email) = lower($1)
     LIMIT 1`,
    [studentEmail],
  );

  const row = result.rows[0];
  if (!row) {
    console.warn(
      `[create-principal] Student not found (${studentEmail}); skipping parent link.`,
    );
    return null;
  }

  if (row.role !== "STUDENT") {
    console.warn(
      `[create-principal] ${studentEmail} is not a STUDENT; skipping parent link.`,
    );
    return null;
  }

  return row.id;
}

async function linkParentToStudent(pool, parentId, studentId, relationship) {
  await pool.query(
    `INSERT INTO public.parent_student_links
       (id, parent_id, student_id, relationship, created_at, updated_at)
     VALUES ($1, $2, $3, $4, now(), now())
     ON CONFLICT (parent_id, student_id) DO UPDATE SET
       relationship = EXCLUDED.relationship,
       updated_at = now()`,
    [newId(), parentId, studentId, relationship],
  );
  console.log(`[create-principal] Linked parent ${parentId} to student ${studentId}.`);
}

async function ensureOrgMembership(pool, userId, orgSlug) {
  const orgResult = await pool.query(
    `SELECT id, slug, name FROM public.organizations WHERE slug = $1 LIMIT 1`,
    [orgSlug],
  );
  const org = orgResult.rows[0];
  if (!org) {
    console.warn(
      `[create-principal] Organization slug "${orgSlug}" not found; skipping advisor membership.`,
    );
    return;
  }

  await pool.query(
    `INSERT INTO public.organization_memberships
       (id, organization_id, user_id, status, org_role, joined_at, created_at, updated_at)
     VALUES ($1, $2, $3, 'ACTIVE', 'LEAD', now(), now(), now())
     ON CONFLICT (organization_id, user_id) DO UPDATE SET
       status = 'ACTIVE',
       org_role = 'LEAD',
       joined_at = now(),
       updated_at = now()`,
    [newId(), org.id, userId],
  );
  console.log(
    `[create-principal] Ensured org LEAD membership on ${org.name} (${org.slug}).`,
  );
}

async function provisionAccount(admin, pool, spec) {
  const password = spec.password || generatePassword();
  const generated = !spec.password;

  const authUserId = await ensureSupabaseAuthUser(admin, spec, password);
  if (!authUserId) {
    throw new Error(`Supabase did not return an auth user id for ${spec.email}.`);
  }

  let profileReconciled = false;
  if (pool) {
    try {
      await reconcileCampusProfile(pool, spec, authUserId);

      const studentId = await resolveStudentId(pool, spec.studentEmail);
      if (studentId) {
        await linkParentToStudent(pool, authUserId, studentId, spec.relationship);
      }

      if (spec.orgSlug) {
        await ensureOrgMembership(pool, authUserId, spec.orgSlug);
      }
      profileReconciled = true;
    } catch (dbError) {
      const message =
        dbError instanceof Error ? dbError.message : String(dbError);
      console.warn(
        `[create-principal] Auth OK for ${spec.email}, but campus profile reconcile failed: ${message}`,
      );
      console.warn(
        `[create-principal] You can sign in with the password below. Re-run this script to retry DB reconcile.`,
      );
    }
  } else {
    console.log(
      `[create-principal] DATABASE_URL not set; skipped campus profile for ${spec.email}.`,
    );
  }

  return { email: spec.email, password, generated, authUserId, profileReconciled };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!hasRealValue(url) || !hasRealValue(serviceRoleKey)) {
    console.error(
      "\n[create-principal] ERROR: Supabase admin credentials are missing.\n" +
        "  Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env or\n" +
        "  .env.local, then re-run: node scripts/create-principal.mjs\n",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();
  const pool = connectionString ? createDbPool(connectionString) : null;
  const specs = buildAccountSpecs();
  const results = [];

  try {
    for (const spec of specs) {
      results.push(await provisionAccount(admin, pool, spec));
    }
  } finally {
    if (pool) {
      await pool.end();
    }
  }

  console.log("\n[create-principal] Done. Leadership accounts are ready:\n");
  for (const result of results) {
    console.log(`  Email:    ${result.email}`);
    console.log(`  Password: ${result.password}${result.generated ? " (generated — store securely)" : ""}`);
    console.log(
      `  Profile:  ${
        result.profileReconciled
          ? "ADMIN reconciled in campus DB"
          : "auth only — re-run to sync campus profile"
      }`,
    );
    console.log(`  Role:     admin (Principal Command Center + Governance)`);
    console.log(`  Teacher:  class wishlists, club directory, org LEAD when configured`);
    console.log(`  Parent:   /parent when parent_student_links exist`);
    console.log("");
  }

  console.log("Sign in at /login, then open:");
  console.log("  /admin/leadership  — Principal Command Center");
  console.log("  /admin             — Governance Center");
  console.log("  /teacher/wishlists — teacher tools");
  console.log("  /parent            — parent portal (if student link configured)");
  console.log("\nRe-run with LEADERSHIP_ORG_SLUG=it-club to attach club advisor LEAD.");
  console.log("Re-run with PRINCIPAL_STUDENT_EMAIL=<student@weirtonmadonna.org> for parent view.");
}

main().catch((error) => {
  console.error(
    `[create-principal] Failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
