import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/** Shared cookie options so set/delete always match (path is required for reliable clear). */
export function previewCookieOptions(
  maxAgeSeconds = 60 * 60 * 4,
): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
    secure: process.env.NODE_ENV === "production",
  };
}

export function previewCookieDeleteOptions(name: string): {
  name: string;
  path: string;
  secure?: boolean;
} {
  return {
    name,
    path: "/",
    ...(process.env.NODE_ENV === "production" ? { secure: true } : {}),
  };
}
