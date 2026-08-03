import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/config/env";
import { normalizeRole } from "@/config/roles";
import { validateEmailForRole } from "@/lib/auth/email-domain";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/services/user-service";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login?setup=required`);
  }

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next") ?? "/home";
  const next = type === "recovery" ? "/reset-password" : requestedNext;
  const role = normalizeRole(searchParams.get("role"));

  if (code || tokenHash) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?setup=required`);
    }

    const { error } = tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : await supabase.auth.exchangeCodeForSession(code!);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const resolvedRole =
          role ?? normalizeRole(user.user_metadata?.role as string | undefined) ?? "student";
        const emailCheck = validateEmailForRole(user.email, resolvedRole);

        if (!emailCheck.valid) {
          await supabase.auth.signOut();
          return NextResponse.redirect(
            `${origin}/login?error=email_not_allowed&message=${encodeURIComponent(emailCheck.message)}`,
          );
        }

        try {
          await ensureUserProfile({
            id: user.id,
            email: user.email,
            displayName: user.user_metadata?.display_name as string | undefined,
            profileImage: user.user_metadata?.avatar_url as string | undefined,
            role: resolvedRole,
            relationshipNote:
              (user.user_metadata?.relationship_note as string | undefined) ?? null,
          });
        } catch (profileError) {
          console.error("[auth/callback] Failed to sync user profile:", profileError);
          await supabase.auth.signOut();
          const message =
            profileError instanceof Error
              ? profileError.message
              : "Account setup failed.";
          return NextResponse.redirect(
            `${origin}/login?error=email_not_allowed&message=${encodeURIComponent(message)}`,
          );
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
