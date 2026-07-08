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
    typeof client.learningModule?.findMany === "function"
  );
}

function resolveConnectionString(raw: string): string {
  const poolerUrl = process.env.DATABASE_POOLER_URL?.trim();
  if (poolerUrl) {
    return poolerUrl;
  }

  if (!process.env.VERCEL) {
    return raw;
  }

  const directMatch = raw.match(
    /^postgresql:\/\/postgres:([^@]+)@db\.([a-z0-9]+)\.supabase\.co:5432\/([^?]+)/i,
  );
  if (!directMatch) {
    return raw;
  }

  const [, password, projectRef, database] = directMatch;
  const region = process.env.SUPABASE_POOLER_REGION ?? "us-east-1";
  return `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/${database}?pgbouncer=true`;
}

function createPool(connectionString: string): Pool {
  const needsSsl =
    connectionString.includes("supabase.co") ||
    connectionString.includes("sslmode=require");

  return new Pool({
    connectionString,
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
