"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  AUTH_CURRENT_PASSWORD_INPUT_PROPS,
  AUTH_EMAIL_INPUT_PROPS,
} from "@/components/auth/auth-input-props";
import {
  PhoneAccessHint,
  type PhoneAccessHintData,
} from "@/components/auth/phone-access-hint";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeAuthEmail } from "@/lib/auth/email-domain";
import { createClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

function isInvalidCredentialsError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid email or password")
  );
}

function formatSignInError(message: string): string {
  if (isInvalidCredentialsError(message)) {
    return "That email or password did not match. On a phone, check Caps Lock and that the keyboard did not auto-capitalize the first letter.";
  }
  if (message.toLowerCase().includes("email not confirmed")) {
    return "This email is not confirmed yet. Ask an admin to confirm the account, or use Reset password.";
  }
  return message;
}

export function LoginForm({
  supabaseConfigured,
  phoneAccessHint,
}: {
  supabaseConfigured: boolean;
  phoneAccessHint?: PhoneAccessHintData | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(() => {
    if (searchParams.get("error") === "auth_callback_failed") {
      return "Sign in failed. Please try again.";
    }
    if (searchParams.get("error") === "email_not_allowed") {
      return (
        searchParams.get("message") ??
        "This email is not allowed for your account type."
      );
    }
    return null;
  });
  const [credentialsFailed, setCredentialsFailed] = useState(false);
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
    setCredentialsFailed(false);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizeAuthEmail(values.email),
      password: values.password,
    });

    if (signInError) {
      setCredentialsFailed(isInvalidCredentialsError(signInError.message));
      setError(formatSignInError(signInError.message));
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
    setCredentialsFailed(false);

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
      {phoneAccessHint ? <PhoneAccessHint hint={phoneAccessHint} /> : null}

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
            enterKeyHint="next"
            {...form.register("email")}
            {...AUTH_EMAIL_INPUT_PROPS}
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
            enterKeyHint="go"
            {...form.register("password")}
            {...AUTH_CURRENT_PASSWORD_INPUT_PROPS}
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

        {error ? (
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{error}</p>
            {credentialsFailed ? (
              <Button
                variant="action"
                nativeButton={false}
                className="w-full"
                size="lg"
                render={<Link href="/forgot-password">Reset password</Link>}
              />
            ) : null}
          </div>
        ) : null}

        <Button type="submit" variant="action" className="w-full" disabled={loading}>
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
        {" · "}
        <Link
          href="/register?role=parent"
          className="font-medium text-[#0A2342] hover:underline dark:text-white"
        >
          Parent registration
        </Link>
        {" · "}
        <Link href="/watch" className="font-medium text-[#0A2342] hover:underline dark:text-white">
          Watch Broadcasting LIVE
        </Link>
      </p>
    </AuthShell>
  );
}
