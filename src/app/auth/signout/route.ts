import { NextResponse } from "next/server";

import { DEFAULT_APP_URL, env, isSupabaseConfigured } from "@/config/env";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const origin = env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  }

  const response = NextResponse.redirect(new URL("/login", origin));
  response.cookies.delete("bd_onboarded");
  return response;
}

export async function GET() {
  return POST();
}
