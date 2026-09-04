import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { FOCUSED_CLUBS_MODE } from "@/config/app-mode";
import { getFocusedModeRedirect } from "@/config/focused-clubs-allowlist";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/auth/signout",
  "/pending-approval",
  "/onboarding",
  "/manifest.webmanifest",
  "/sw.js",
  "/icons",
  "/p/",
  "/ok",
  // OBS Browser Sources cannot log in. The long session key in the path is the
  // gate, and the page only shows graphics that are already on air.
  "/broadcast/overlay/",
  "/watch",
  "/live",
];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

function applyFocusedClubsRedirect(
  request: NextRequest,
  baseResponse: NextResponse,
): NextResponse | null {
  if (!FOCUSED_CLUBS_MODE) {
    return null;
  }

  const destination = getFocusedModeRedirect(request.nextUrl.pathname);
  if (!destination) {
    return null;
  }

  const redirectUrl = request.nextUrl.clone();
  const hashIndex = destination.indexOf("#");
  const queryIndex = destination.indexOf("?");
  const pathOnly =
    hashIndex >= 0
      ? destination.slice(0, hashIndex)
      : queryIndex >= 0
        ? destination.slice(0, queryIndex)
        : destination;

  redirectUrl.pathname = pathOnly;
  redirectUrl.search = queryIndex >= 0 ? destination.slice(queryIndex).split("#")[0] : "";
  // Hash fragments are client-only; home sections still work via id anchors when linked directly.
  const response = NextResponse.redirect(redirectUrl);
  baseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });
  return response;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const focused = applyFocusedClubsRedirect(request, supabaseResponse);
    return focused ?? supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);
  const isApiRoute = pathname.startsWith("/api/");

  if (isApiRoute) {
    return supabaseResponse;
  }

  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/home";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  const focused = applyFocusedClubsRedirect(request, supabaseResponse);
  return focused ?? supabaseResponse;
}
