/**
 * Soft-wipe allowlist for FOCUSED_CLUBS_MODE.
 * Paths not matched here redirect to /home (except public/auth/api).
 * See docs/CLUB_FOCUS_PIVOT.md.
 */

/** Exact path prefixes that remain reachable in focused mode. */
export const FOCUSED_MODE_ALLOWED_PREFIXES = [
  "/home",
  // The Madonna Hub front door and its five sections (Today / Sports /
  // Broadcast / Campus / Participate), plus the legacy URLs that redirect into
  // them. One prefix covers every child.
  "/madonna",
  "/organizations/it-club",
  "/organizations/broadcasting",
  "/organizations/cricut-club",
  "/cricut",
  // Group messaging to the focus clubs — officers and staff compose here.
  "/messages",
  "/media",
  "/broadcast",
  "/sports",
  "/coach",
  "/archive",
  "/service-desk",
  "/weather",
  "/history",
  "/calendar",
  "/clubs",
  "/finances",
  "/profile",
  "/settings",
  "/pass",
  // Real school ops that outlive the club pivot: families still have to sign
  // agreements. `/lunch` stays reachable only as the retired landing page that
  // points at FuelTheDons — see src/config/fuel-the-dons.ts.
  "/parent",
  "/lunch",
  "/admin",
  "/counselor",
  "/teacher",
  // Auth & onboarding
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth",
  "/onboarding",
  "/pending-approval",
  // Public / infra
  "/api",
  "/p/",
  "/embed",
  "/community-impact",
  "/legacy/",
  "/manifest.webmanifest",
  "/sw.js",
  "/icons",
  "/watch",
  "/live",
] as const;

/**
 * Explicit soft-wipe destinations that should bounce to Home
 * (or a club deep-link) even if a broader prefix might otherwise match.
 */
export const FOCUSED_MODE_SOFT_REDIRECTS: Record<string, string> = {
  "/discover": "/home#daily-discovery",
  "/hub": "/home#schedule",
  "/dashboard": "/home",
  "/future": "/home",
  "/pathways": "/home",
  "/find-your-place": "/clubs",
  "/student-life": "/clubs",
  "/corner": "/cricut/shop",
  "/rewards": "/home",
  "/arcade": "/home",
};

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** True when the path may stay live under focused clubs mode. */
export function isFocusedModeAllowedPath(pathname: string): boolean {
  const path = normalizePathname(pathname);

  if (path === "/" || path === "") {
    return true;
  }

  return FOCUSED_MODE_ALLOWED_PREFIXES.some((prefix) => {
    if (prefix.endsWith("/")) {
      return path.startsWith(prefix) || `${path}/` === prefix;
    }
    return path === prefix || path.startsWith(`${prefix}/`);
  });
}

/**
 * Returns a redirect destination for soft-wiped routes, or null to allow through.
 * Call only when FOCUSED_CLUBS_MODE is on.
 */
export function getFocusedModeRedirect(pathname: string): string | null {
  const path = normalizePathname(pathname);

  if (path === "/" || path === "") {
    return null;
  }

  const explicit = FOCUSED_MODE_SOFT_REDIRECTS[path];
  if (explicit) {
    return explicit;
  }

  // Prefix soft-redirects for nested wiped modules
  for (const [from, to] of Object.entries(FOCUSED_MODE_SOFT_REDIRECTS)) {
    if (path.startsWith(`${from}/`)) {
      return to;
    }
  }

  if (isFocusedModeAllowedPath(path)) {
    return null;
  }

  return "/home";
}
