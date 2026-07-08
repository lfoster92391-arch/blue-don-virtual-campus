"use client";

import { useActionState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  completeOnboardingAction,
  type AuthActionState,
} from "@/features/auth/actions";
import { ROLE_LABELS } from "@/config/roles";
import type { CampusUser } from "@/types/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function OnboardingForm({ user }: { user: CampusUser }) {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  return (
    <AuthShell
      title="Complete your profile"
      description="Tell us who you are so your campus experience can begin."
    >
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        Signed in as <span className="font-medium">{user.email}</span>
        <br />
        Campus role:{" "}
        <span className="font-medium">{ROLE_LABELS[user.role]}</span>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <Input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={user.firstName ?? ""}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={user.lastName ?? ""}
            required
          />
        </div>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[#2E8B57]">{state.success}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Saving profile..." : "Enter campus"}
        </Button>
      </form>
    </AuthShell>
  );
}
