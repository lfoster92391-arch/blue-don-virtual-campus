import { env } from "@/config/env";

function normalizeSiteUrl(value: string): URL | undefined {
  const raw = value.trim().replace(/\/+$/, "");
  if (!raw) {
    return undefined;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return new URL(withProtocol);
  } catch {
    return undefined;
  }
}

/** Canonical Asset Pilot EDU origin when configured (e.g. https://assetpilotedu.com). */
export function getAssetPilotSiteUrl(): string | undefined {
  const url = env.ASSETPILOT_SITE_URL
    ? normalizeSiteUrl(env.ASSETPILOT_SITE_URL)
    : undefined;
  return url?.origin;
}

/** Origins allowed to embed Blue Don via iframe (CSP frame-ancestors). */
export function getEmbedFrameAncestors(): string[] {
  const ancestors = ["'self'"];
  const siteUrl = getAssetPilotSiteUrl();

  if (siteUrl) {
    ancestors.push(siteUrl);
    try {
      const hostname = new URL(siteUrl).hostname.replace(/^www\./, "");
      ancestors.push(`https://*.${hostname}`);
    } catch {
      // ignore invalid URL
    }
  }

  return ancestors;
}

/** Origins allowed for cross-origin API reads (e.g. /api/health). */
export function getAllowedApiOrigins(): string[] {
  const origins: string[] = [];
  const siteUrl = getAssetPilotSiteUrl();

  if (siteUrl) {
    origins.push(siteUrl);
  }

  return origins;
}
