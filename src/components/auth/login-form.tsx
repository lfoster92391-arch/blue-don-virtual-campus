"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({
  supabaseConfigured,
}: {
  supabaseConfigured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "auth_callback_failed"
      ? "Sign in failed. Please try again."
      : null,
  );
  const [loading, setLoading] = useState(false);
  const setupRequired =
    !supabaseConfigured || searchParams.get("setup") === "required";

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const next = searchParams.get("next") ?? "/home";
    router.push(next);
    router.refresh();
  }

  async function signInWithGoogle() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(searchParams.get("next") ?? "/home")}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  if (setupRequired) {
    return (
      <AuthShell
        title="Sign in"
        description="Configure Supabase before signing in to Blue Don Virtual Campus."
      >
        <SupabaseSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Sign in"
      description="Enter your campus credentials to access Blue Don Virtual Campus."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#0A2342] hover:underline dark:text-white"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="space-y-4">
        <div className="relative text-center text-sm text-muted-foreground">
          <span className="bg-background px-2">or continue with</span>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={signInWithGoogle}
        >
          Continue with Google
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-[#0A2342] hover:underline dark:text-white">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
