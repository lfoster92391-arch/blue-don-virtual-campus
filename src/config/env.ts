import { z } from "zod";

export const DEFAULT_APP_URL = "http://localhost:3000";
export const PRODUCTION_DEFAULT_APP_URL =
  "https://campus.assetpilotedu.com";
export const PRODUCTION_DEFAULT_PARTNER_SITE_URL =
  "https://www.assetpilotedu.com";

function normalizeAppUrl(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const raw = String(value).trim();
  if (!raw || raw === "undefined" || raw === "null") {
    return undefined;
  }

  const withoutTrailingSlash = raw.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `https://${withoutTrailingSlash}`;
}

function isValidAppUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function parseAppUrl(value: unknown): string | undefined {
  const normalized = normalizeAppUrl(value);
  if (!normalized || !isValidAppUrl(normalized)) {
    return undefined;
  }

  return normalized;
}

function getVercelAppUrl(): string | undefined {
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (!vercelUrl) {
    return undefined;
  }

  const normalized = normalizeAppUrl(vercelUrl);
  return normalized && isValidAppUrl(normalized) ? normalized : undefined;
}

function resolveAppUrl(
  parsedUrl: string | undefined,
  nodeEnv: "development" | "test" | "production",
): string {
  if (parsedUrl) {
    return parsedUrl;
  }

  if (nodeEnv === "development" || nodeEnv === "test") {
    return DEFAULT_APP_URL;
  }

  return getVercelAppUrl() ?? PRODUCTION_DEFAULT_APP_URL;
}

function trimOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.preprocess(trimOptionalString, z.string().optional()),
  NEXT_PUBLIC_SUPABASE_URL: z.preprocess(
    trimOptionalString,
    z.string().url().optional(),
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.preprocess(
    trimOptionalString,
    z.string().optional(),
  ),
  SUPABASE_SERVICE_ROLE_KEY: z.preprocess(
    trimOptionalString,
    z.string().optional(),
  ),
  NEXT_PUBLIC_APP_URL: z.preprocess(parseAppUrl, z.string().optional()),
  NEXT_PUBLIC_PARTNER_SITE_URL: z.preprocess(parseAppUrl, z.string().optional()),
  ASSETPILOT_SITE_URL: z.preprocess(parseAppUrl, z.string().optional()),
});

const envResult = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_PARTNER_SITE_URL: process.env.NEXT_PUBLIC_PARTNER_SITE_URL,
  ASSETPILOT_SITE_URL: process.env.ASSETPILOT_SITE_URL,
});

if (!envResult.success) {
  console.error(
    "[env] Invalid environment configuration:",
    envResult.error.flatten().fieldErrors,
  );
}

const parsed = envResult.success
  ? envResult.data
  : {
      NODE_ENV: "production" as const,
      DATABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      NEXT_PUBLIC_APP_URL: undefined,
      NEXT_PUBLIC_PARTNER_SITE_URL: undefined,
      ASSETPILOT_SITE_URL: undefined,
    };

function resolvePartnerSiteUrl(
  publicUrl: string | undefined,
  serverUrl: string | undefined,
  nodeEnv: "development" | "test" | "production",
): string | undefined {
  if (publicUrl ?? serverUrl) {
    return publicUrl ?? serverUrl;
  }

  return nodeEnv === "production"
    ? PRODUCTION_DEFAULT_PARTNER_SITE_URL
    : undefined;
}

export const env = {
  ...parsed,
  NEXT_PUBLIC_APP_URL: resolveAppUrl(
    parsed.NEXT_PUBLIC_APP_URL,
    parsed.NODE_ENV,
  ),
  NEXT_PUBLIC_PARTNER_SITE_URL: resolvePartnerSiteUrl(
    parsed.NEXT_PUBLIC_PARTNER_SITE_URL,
    parsed.ASSETPILOT_SITE_URL,
    parsed.NODE_ENV,
  ),
};

export function isDatabaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL);
}

export function isSupabaseConfigured(): boolean {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return false;
  }

  const placeholders = [
    "your-project",
    "your-anon-key",
    "your-service-role-key",
    "xxxx.supabase.co",
  ];

  return !placeholders.some(
    (placeholder) => url.includes(placeholder) || key.includes(placeholder),
  );
}

export function isSupabaseAdminConfigured(): boolean {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!isSupabaseConfigured() || !serviceRoleKey) {
    return false;
  }

  return !serviceRoleKey.includes("your-service-role-key");
}
