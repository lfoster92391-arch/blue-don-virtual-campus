"use client";

import { useActionState } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import {
  completeOnboardingAction,
  type AuthActionState,
} from "@/features/auth/actions";
import { IT_CONTACT_EMAIL } from "@/lib/auth/email-domain";
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
  const isParent = user.role === "parent";

  return (
    <AuthShell
      title="Complete your profile"
      description={
        isParent
          ? "Tell us who you are. Parent accounts require IT approval before campus access."
          : "Tell us who you are so your campus experience can begin."
      }
    >
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
        Signed in as <span className="font-medium">{user.email}</span>
        <br />
        Campus role:{" "}
        <span className="font-medium">{ROLE_LABELS[user.role]}</span>
      </div>

      {isParent ? (
        <p className="text-sm text-muted-foreground">
          After submitting, email IT at{" "}
          <a
            href={`mailto:${IT_CONTACT_EMAIL}`}
            className="font-medium text-[#0A2342] underline dark:text-white"
          >
            {IT_CONTACT_EMAIL}
          </a>{" "}
          with your relationship to Madonna High School while your account is
          reviewed.
        </p>
      ) : null}

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

        {isParent ? (
          <div className="space-y-2">
            <label htmlFor="relationshipNote" className="text-sm font-medium">
              Relationship to school
            </label>
            <Input
              id="relationshipNote"
              name="relationshipNote"
              defaultValue={user.relationshipNote ?? ""}
              placeholder="Parent of Jane Smith, Class of 2028"
              required
            />
          </div>
        ) : null}

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
