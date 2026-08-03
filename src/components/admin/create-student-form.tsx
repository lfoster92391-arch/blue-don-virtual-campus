"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FOCUS_CLUB_ROLE_LABELS,
} from "@/config/focus-club-access";
import { FOCUS_CLUBS, type FocusClubSlug } from "@/config/focused-clubs";
import { SCHOOL_EMAIL_DOMAIN } from "@/lib/auth/email-domain";
import { ORG_MEMBERSHIP_ROLES } from "@/config/roles";
import {
  createStudentWithClubAction,
  type StudentAdminActionState,
} from "@/features/admin/student-actions";

const initialState: StudentAdminActionState = {};

export function CreateStudentForm() {
  const [clubSlug, setClubSlug] = useState<FocusClubSlug | "">("");
  const [state, formAction, pending] = useActionState(
    createStudentWithClubAction,
    initialState,
  );

  const roleOptions = useMemo(() => {
    if (!clubSlug) {
      return ORG_MEMBERSHIP_ROLES.map((role) => ({
        value: role,
        label: role,
      }));
    }
    return ORG_MEMBERSHIP_ROLES.map((role) => ({
      value: role,
      label: FOCUS_CLUB_ROLE_LABELS[clubSlug][role],
    }));
  }, [clubSlug]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          Create student
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provision a @{SCHOOL_EMAIL_DOMAIN} login, set a temporary password, and
          optionally assign them to a club with a role.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="student-firstName" className="text-sm font-medium">
            First name
          </label>
          <Input
            id="student-firstName"
            name="firstName"
            required
            placeholder="Alex"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="student-lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input
            id="student-lastName"
            name="lastName"
            required
            placeholder="Martinez"
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="student-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="student-email"
          name="email"
          type="email"
          required
          placeholder={`firstname.lastname@${SCHOOL_EMAIL_DOMAIN}`}
          disabled={pending}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="student-password" className="text-sm font-medium">
            Temporary password
          </label>
          <Input
            id="student-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="student-confirmPassword"
            className="text-sm font-medium"
          >
            Confirm password
          </label>
          <Input
            id="student-confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={pending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="student-club" className="text-sm font-medium">
            Club (optional)
          </label>
          <select
            id="student-club"
            name="clubSlug"
            value={clubSlug}
            onChange={(e) =>
              setClubSlug(e.target.value as FocusClubSlug | "")
            }
            disabled={pending}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">Assign later</option>
            {FOCUS_CLUBS.map((club) => (
              <option key={club.slug} value={club.slug}>
                {club.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="student-orgRole" className="text-sm font-medium">
            Club role
          </label>
          <select
            id="student-orgRole"
            name="orgRole"
            key={clubSlug || "none"}
            defaultValue="member"
            disabled={pending || !clubSlug}
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create student"}
      </Button>

      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}
    </form>
  );
}
