"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { AUTH_EMAIL_INPUT_PROPS } from "@/components/auth/auth-input-props";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeAuthEmail } from "@/lib/auth/email-domain";
import { createClient } from "@/lib/supabase/client";

const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm({
  supabaseConfigured,
}: {
  supabaseConfigured: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      "/reset-password",
    )}`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      normalizeAuthEmail(values.email),
      { redirectTo },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage(
      "If an account exists for that email, a password reset link is on its way. Open it on this device to set a new password.",
    );
    setLoading(false);
  }

  if (!supabaseConfigured) {
    return (
      <AuthShell
        title="Reset password"
        description="Configure Supabase before resetting passwords."
      >
        <SupabaseSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset password"
      description="Enter your email and we'll send you a link to set a new password."
    >
      <form
        className="space-y-4"
        autoCapitalize="none"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            {...form.register("email")}
            {...AUTH_EMAIL_INPUT_PROPS}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-[#2E8B57]">{message}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending link..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-[#0A2342] hover:underline dark:text-white"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
