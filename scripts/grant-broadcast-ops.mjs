// Grant (or revoke) limited Broadcasting "ops" access for one existing campus
// user, without touching their global `users.role`.
//
// Why an org role and not ADMIN/ADVISOR:
//   Upload + Daily Rundown editing are gated by canManageCampusMedia()
//   (src/services/media-service.ts), which is satisfied by the Broadcasting
//   org permission `org:media:manage`. SECRETARY is the lowest officer role in
//   ORG_ROLE_PERMISSIONS that carries it, so it is the default here. Flipping
//   users.role to ADMIN/ADVISOR would grant campus-wide powers instead.
//
// Usage:
//   node scripts/grant-broadcast-ops.mjs --email=someone@weirtonmadonna.org
//   node scripts/grant-broadcast-ops.mjs --email=... --org-role=VICE_PRESIDENT
//   node scripts/grant-broadcast-ops.mjs --email=... --revoke
//   node scripts/grant-broadcast-ops.mjs --email=... --dry-run
//
// Requires DATABASE_URL (or DATABASE_POOLER_URL). Never creates accounts —
// the user must already exist, so a typo cannot silently mint a new identity.

import { randomBytes } from "node:crypto";
import { config as loadEnv } from "dotenv";
import { Pool } from "pg";

loadEnv({ path: ".env" });
loadEnv({ path: ".env.local", override: true });

const BROADCAST_ORG_SLUG = "broadcasting";

/** Officer roles carrying `org:media:manage`, least privilege first. */
const MEDIA_CAPABLE_ROLES = ["SECRETARY", "VICE_PRESIDENT", "PRESIDENT"];
const ALL_ORG_ROLES = [...MEDIA_CAPABLE_ROLES, "MEMBER"];

function parseArg(name) {
  const prefix = `--${name}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  return match ? match.slice(prefix.length).trim() : null;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function newId() {
  return `c${randomBytes(12).toString("hex")}`;
}

/**
 * Supabase pooler TLS uses a chain Node rejects by default, and pg 8.22+ maps
 * sslmode=require to verify-full, so strip it and set rejectUnauthorized off.
 */
function createDbPool(connectionString) {
  let normalized = connectionString;
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    normalized = url.toString();
  } catch {
    normalized = connectionString.replace(/([?&])sslmode=[^&]*/g, (_m, sep) =>
      sep === "?" ? "?" : "",
    );
  }

  return new Pool({
    connectionString: normalized,
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 20_000,
    ssl: { rejectUnauthorized: false },
  });
}

async function main() {
  const email = (parseArg("email") || "").toLowerCase();
  const revoke = hasFlag("revoke");
  const dryRun = hasFlag("dry-run");
  const targetRole = revoke
    ? "MEMBER"
    : (parseArg("org-role") || "SECRETARY").toUpperCase();

  if (!email) {
    throw new Error("--email=<address> is required.");
  }
  if (!ALL_ORG_ROLES.includes(targetRole)) {
    throw new Error(
      `--org-role must be one of ${ALL_ORG_ROLES.join(", ")} (got ${targetRole}).`,
    );
  }

  const connectionString =
    process.env.DATABASE_POOLER_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL (or DATABASE_POOLER_URL) is not set.");
  }

  const pool = createDbPool(connectionString);

  try {
    await pool.query("SET search_path TO public");

    const userResult = await pool.query(
      `SELECT id, email, role, status, display_name
         FROM public.users WHERE lower(email) = lower($1) LIMIT 1`,
      [email],
    );
    const user = userResult.rows[0];

    if (!user) {
      const near = await pool.query(
        `SELECT email, role, status, display_name FROM public.users
          WHERE lower(email) LIKE '%' || lower($1) || '%'
          ORDER BY email LIMIT 10`,
        [email.split("@")[0]],
      );
      console.error(
        `[grant-broadcast-ops] No campus user with email ${email}.\n` +
          "  This script never creates accounts. Confirm the address first.\n" +
          (near.rows.length
            ? `  Similar existing accounts:\n${near.rows
                .map((r) => `    - ${r.email} (${r.role}, ${r.status})`)
                .join("\n")}\n`
            : "  No similar accounts found.\n"),
      );
      process.exit(2);
    }

    const orgResult = await pool.query(
      `SELECT id, name FROM public.organizations WHERE slug = $1 LIMIT 1`,
      [BROADCAST_ORG_SLUG],
    );
    const org = orgResult.rows[0];
    if (!org) {
      throw new Error(`Organization "${BROADCAST_ORG_SLUG}" not found.`);
    }

    const beforeResult = await pool.query(
      `SELECT org_role, status FROM public.organization_memberships
        WHERE organization_id = $1 AND user_id = $2 LIMIT 1`,
      [org.id, user.id],
    );
    const before = beforeResult.rows[0] ?? null;

    console.log(`[grant-broadcast-ops] User:   ${user.email} (${user.display_name})`);
    console.log(`[grant-broadcast-ops] Global role (unchanged): ${user.role}`);
    console.log(
      `[grant-broadcast-ops] ${org.name} before: ${
        before ? `${before.org_role} / ${before.status}` : "no membership"
      }`,
    );
    console.log(`[grant-broadcast-ops] ${org.name} target: ${targetRole} / ACTIVE`);

    if (dryRun) {
      console.log("[grant-broadcast-ops] --dry-run set; no changes written.");
      return;
    }

    await pool.query(
      `INSERT INTO public.organization_memberships
         (id, organization_id, user_id, org_role, status, joined_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'ACTIVE', now(), now(), now())
       ON CONFLICT (organization_id, user_id) DO UPDATE SET
         org_role = EXCLUDED.org_role,
         status = 'ACTIVE',
         joined_at = COALESCE(public.organization_memberships.joined_at, now()),
         updated_at = now()`,
      [newId(), org.id, user.id, targetRole],
    );

    const afterResult = await pool.query(
      `SELECT org_role, status, joined_at FROM public.organization_memberships
        WHERE organization_id = $1 AND user_id = $2 LIMIT 1`,
      [org.id, user.id],
    );
    const after = afterResult.rows[0];

    console.log(
      `[grant-broadcast-ops] ${org.name} after:  ${after.org_role} / ${after.status}`,
    );

    if (MEDIA_CAPABLE_ROLES.includes(after.org_role) && after.status === "ACTIVE") {
      console.log(
        "\n[grant-broadcast-ops] Unlocked (org-scoped):\n" +
          "  - /media Control Room: upload video, go live, end broadcast\n" +
          "  - /broadcast/studio console\n" +
          "  - Broadcasting > Daily Rundown: edit slot values + prayer\n" +
          "  - Broadcasting club announcements, roster, resources, documents\n" +
          "\n[grant-broadcast-ops] Still denied (needs ADMIN/ADVISOR):\n" +
          "  - /admin governance, /admin/users, /admin/students, password resets\n" +
          "  - Daily Rundown template structure (canEditBroadcastScriptTemplate)\n" +
          "  - Any other club's workspace\n",
      );
    } else {
      console.log(
        "\n[grant-broadcast-ops] This role does NOT carry org:media:manage — " +
          "upload and Daily Rundown editing remain read-only.\n",
      );
    }

    console.log(
      `[grant-broadcast-ops] Revert with: node scripts/grant-broadcast-ops.mjs --email=${user.email} --revoke`,
    );
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(
    `[grant-broadcast-ops] Failed: ${
      error instanceof Error ? error.message : String(error)
    }`,
  );
  process.exit(1);
});
