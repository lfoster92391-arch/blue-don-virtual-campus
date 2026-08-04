import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { isDatabaseConfigured } from "@/config/env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function isPrismaClientComplete(client: PrismaClient): boolean {
  return (
    typeof client.academy?.findMany === "function" &&
    typeof client.assignment?.findMany === "function" &&
    typeof client.event?.findMany === "function" &&
    typeof client.form?.findMany === "function" &&
    typeof client.formSubmission?.findMany === "function" &&
    typeof client.academyMembership?.findMany === "function" &&
    typeof client.checklist?.findMany === "function" &&
    typeof client.portfolioItem?.findMany === "function" &&
    typeof client.ticket?.findMany === "function" &&
    typeof client.knowledgeArticle?.findMany === "function" &&
    typeof client.lab?.findMany === "function" &&
    typeof client.simulator?.findMany === "function" &&
    typeof client.learningModule?.findMany === "function" &&
    typeof client.campusMediaItem?.findMany === "function" &&
    typeof client.cornerStoreItem?.findMany === "function"
  );
}

function supabaseProjectRefFromEnv(): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return null;
  }

  try {
    const host = new URL(supabaseUrl).hostname;
    const ref = host.split(".")[0];
    return /^[a-z0-9]+$/i.test(ref) ? ref : null;
  } catch {
    return null;
  }
}

/**
 * Normalize Supabase connection strings for Prisma:
 * - On Vercel, direct `db.*.supabase.co` → transaction pooler with `postgres.<ref>`
 * - Pooler URLs that still use bare `postgres` → `postgres.<ref>` (fixes P1000)
 * - On Vercel, session pooler `:5432` → transaction pooler `:6543?pgbouncer=true`
 */
function rewriteSupabaseConnectionString(raw: string): string {
  const envRef = supabaseProjectRefFromEnv();
  let url = raw;

  const directMatch = url.match(
    /^postgresql:\/\/postgres:([^@]+)@db\.([a-z0-9]+)\.supabase\.co:5432\/([^?]+)/i,
  );
  if (directMatch && process.env.VERCEL) {
    const [, password, projectRef, database] = directMatch;
    const region = process.env.SUPABASE_POOLER_REGION ?? "us-east-1";
    url = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/${database}?pgbouncer=true`;
  }

  // Common misconfig: pooler host with bare user `postgres` (must be postgres.<ref>).
  const barePoolerMatch = url.match(
    /^(postgresql:\/\/)postgres(:[^@]+)(@aws-0-[a-z0-9-]+\.pooler\.supabase\.com:\d+\/[^?]*)(\?.*)?$/i,
  );
  if (barePoolerMatch && envRef) {
    const [, scheme, password, rest, query = ""] = barePoolerMatch;
    url = `${scheme}postgres.${envRef}${password}${rest}${query}`;
  }

  // Serverless prefers transaction mode (6543) over session mode (5432).
  if (process.env.VERCEL && /pooler\.supabase\.com:5432\//i.test(url)) {
    try {
      const parsed = new URL(url);
      parsed.port = "6543";
      parsed.searchParams.set("pgbouncer", "true");
      parsed.searchParams.delete("sslmode");
      parsed.searchParams.set("sslmode", "require");
      url = parsed.toString();
    } catch {
      url = url.replace(/:5432\//, ":6543/");
      if (!/[?&]pgbouncer=true/i.test(url)) {
        url += url.includes("?") ? "&pgbouncer=true" : "?pgbouncer=true";
      }
    }
  }

  return url;
}

function resolveConnectionString(raw: string): string {
  const poolerUrl = process.env.DATABASE_POOLER_URL?.trim();
  return rewriteSupabaseConnectionString(poolerUrl || raw);
}

function createPool(connectionString: string): Pool {
  const needsSsl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("supabase.com") ||
    connectionString.includes("sslmode=require");

  // Avoid pg treating sslmode=require as verify-full on Node 24+.
  let normalized = connectionString;
  try {
    const parsed = new URL(connectionString);
    if (needsSsl) {
      parsed.searchParams.set("uselibpqcompat", "true");
      parsed.searchParams.set("sslmode", "require");
      normalized = parsed.toString();
    }
  } catch {
    // keep raw
  }

  return new Pool({
    connectionString: normalized,
    max: 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });
}

function createPrismaClient(connectionString: string): PrismaClient {
  const pool = globalForPrisma.pool ?? createPool(connectionString);
  const adapter = new PrismaPg(pool);

  globalForPrisma.pool = pool;

  return new PrismaClient({ adapter });
}

function getPrismaClient(): PrismaClient | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  const cached = globalForPrisma.prisma;
  if (cached && isPrismaClientComplete(cached)) {
    return cached;
  }

  const connectionString = resolveConnectionString(process.env.DATABASE_URL!.trim());
  const client = createPrismaClient(connectionString);

  globalForPrisma.prisma = client;

  return client;
}

export function isPrismaReady(): boolean {
  const client = getPrismaClient();
  return client !== null && isPrismaClientComplete(client);
}

export async function withDatabase<T>(
  operation: (client: PrismaClient) => Promise<T>,
): Promise<T | null> {
  const client = getPrismaClient();
  if (!client || !isPrismaClientComplete(client)) {
    return null;
  }

  try {
    return await operation(client);
  } catch (error) {
    console.error("[prisma] Database operation failed:", error);
    return null;
  }
}

function requirePrismaClient(): PrismaClient {
  const client = getPrismaClient();
  if (!client || !isPrismaClientComplete(client)) {
    throw new Error("Database is not configured or Prisma client is unavailable.");
  }

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = requirePrismaClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
