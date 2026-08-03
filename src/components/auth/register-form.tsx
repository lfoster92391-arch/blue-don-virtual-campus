"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AuthShell } from "@/components/auth/auth-shell";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import {
  CAMPUS_ROLES,
  ROLE_LABELS,
  normalizeRole,
  type CampusRole,
} from "@/config/roles";
import {
  IT_CONTACT_EMAIL,
  SCHOOL_EMAIL_DOMAIN,
  validateEmailForRole,
} from "@/lib/auth/email-domain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    email: z.email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
    relationshipNote: z.string().trim().optional(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm({
  supabaseConfigured,
}: {
  supabaseConfigured: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteRole = normalizeRole(searchParams.get("role"));
  const role: CampusRole =
    inviteRole && CAMPUS_ROLES.includes(inviteRole) ? inviteRole : "student";
  const isParentRegistration = role === "parent";
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      relationshipNote: "",
    },
  });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    setError(null);
    setMessage(null);

    const emailCheck = validateEmailForRole(values.email, role);
    if (!emailCheck.valid) {
      setError(emailCheck.message);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          role,
          relationship_note: values.relationshipNote?.trim() || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/onboarding");
      router.refresh();
      return;
    }

    if (isParentRegistration) {
      setMessage(
        `Check your email to confirm your account. After signing in, your account will remain pending until IT approves it. Email ${IT_CONTACT_EMAIL} with your relationship to the school.`,
      );
    } else {
      setMessage("Check your email to confirm your account, then sign in.");
    }
    setLoading(false);
  }

  async function signUpWithGoogle() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add credentials to .env first.");
      setLoading(false);
      return;
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?role=${role}`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setLoading(false);
    }
  }

  if (!supabaseConfigured) {
    return (
      <AuthShell
        title="Create account"
        description="Configure Supabase before registering for Blue Don Virtual Campus."
      >
        <SupabaseSetupNotice />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create account"
      description="Register for secure access to Madonna High School's digital campus."
    >
      {inviteRole ? (
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
          Invited role:{" "}
          <span className="font-medium">{ROLE_LABELS[inviteRole]}</span>
        </div>
      ) : null}

      {!isParentRegistration ? (
        <p className="text-sm text-muted-foreground">
          Students and staff must use a @{SCHOOL_EMAIL_DOMAIN} email address.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Parents may use a personal email. Access requires IT approval — contact{" "}
          <a
            href={`mailto:${IT_CONTACT_EMAIL}`}
            className="font-medium text-[#0A2342] underline dark:text-white"
          >
            {IT_CONTACT_EMAIL}
          </a>{" "}
          with your relationship to the school.
        </p>
      )}

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        {isParentRegistration ? (
          <div className="space-y-2">
            <label htmlFor="relationshipNote" className="text-sm font-medium">
              Relationship to school
            </label>
            <Input
              id="relationshipNote"
              placeholder="Parent of Jane Smith, Class of 2028"
              {...form.register("relationshipNote")}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
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
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={loading}
          onClick={signUpWithGoogle}
        >
          Continue with Google
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[#0A2342] hover:underline dark:text-white">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
