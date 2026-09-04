"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { AUTH_NEW_PASSWORD_INPUT_PROPS } from "@/components/auth/auth-input-props";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm({
  supabaseConfigured,
}: {
  supabaseConfigured: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    // The recovery link establishes a session (via /auth/callback for the PKCE
    // flow, or by parsing the URL hash for the implicit flow). Confirm we have
    // one before allowing a password change.
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!active) {
          return;
        }
        if (session) {
          setSessionReady(true);
          setCheckingSession(false);
        }
      },
    );

    supabase.auth.getSession().then(({ data }) => {
      if (!active) {
        return;
      }
      if (data.session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(values: ResetPasswordValues) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated. Redirecting to your dashboard...");
    setLoading(false);
    router.push("/home");
    router.refresh();
  }

  if (!supabaseConfigured) {
    return (
      <AuthShell
        title="Set a new password"
        description="Configure Supabase before resetting passwords."
      >
        <SupabaseSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a new password for your campus account."
    >
      {checkingSession ? (
        <p className="text-sm text-muted-foreground">Verifying your reset link...</p>
      ) : !sessionReady ? (
        <div className="space-y-4">
          <p className="text-sm text-destructive">
            This password reset link is invalid or has expired. Request a new one to
            continue.
          </p>
          <Button
            nativeButton={false}
            className="w-full"
            render={<Link href="/forgot-password">Request a new link</Link>}
          />
        </div>
      ) : (
        <form
          className="space-y-4"
          autoCapitalize="none"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              New password
            </label>
            <Input
              id="password"
              {...form.register("password")}
              {...AUTH_NEW_PASSWORD_INPUT_PROPS}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              {...form.register("confirmPassword")}
              {...AUTH_NEW_PASSWORD_INPUT_PROPS}
            />
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {message ? <p className="text-sm text-[#2E8B57]">{message}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating password..." : "Update password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
