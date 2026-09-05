"use client";

import { useActionState, useMemo, useState } from "react";

import {
  AUTH_EMAIL_INPUT_PROPS,
  AUTH_NEW_PASSWORD_INPUT_PROPS,
} from "@/components/auth/auth-input-props";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FOCUS_CLUB_ROLE_LABELS,
} from "@/config/focus-club-access";
import { FOCUS_CLUBS, type FocusClubSlug } from "@/config/focused-clubs";
import { SCHOOL_EMAIL_DOMAIN } from "@/lib/auth/email-domain";
import {
  ADMIN_CREATABLE_ROLES,
  ORG_MEMBERSHIP_ROLES,
  ORG_ROLE_LABELS,
  ROLE_LABELS,
  type CampusRole,
} from "@/config/roles";
import {
  createStudentWithClubAction,
  type StudentAdminActionState,
} from "@/features/admin/student-actions";

const initialState: StudentAdminActionState = {};

const ACCOUNT_ROLE_LABELS: Record<(typeof ADMIN_CREATABLE_ROLES)[number], string> =
  {
    student: ROLE_LABELS.student,
    coach: ROLE_LABELS.coach,
    teacher: "Faculty",
    parent: ROLE_LABELS.parent,
    staff: ROLE_LABELS.staff,
  };

export function CreateStudentForm() {
  const [clubSlug, setClubSlug] = useState<FocusClubSlug | "">("");
  const [accountRole, setAccountRole] = useState<CampusRole>("student");
  const [state, formAction, pending] = useActionState(
    createStudentWithClubAction,
    initialState,
  );

  const roleOptions = useMemo(() => {
    if (!clubSlug) {
      return ORG_MEMBERSHIP_ROLES.map((role) => ({
        value: role,
        label: ORG_ROLE_LABELS[role],
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
          Create account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the account type, set a temporary password, and optionally
          assign a club. Use @{SCHOOL_EMAIL_DOMAIN} when they have a school
          mailbox; an outside address works too.
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
          required
          placeholder={`firstname.lastname@${SCHOOL_EMAIL_DOMAIN}`}
          disabled={pending}
          {...AUTH_EMAIL_INPUT_PROPS}
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
            required
            minLength={8}
            disabled={pending}
            {...AUTH_NEW_PASSWORD_INPUT_PROPS}
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
            required
            minLength={8}
            disabled={pending}
            {...AUTH_NEW_PASSWORD_INPUT_PROPS}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="student-role" className="text-sm font-medium">
          Account type
        </label>
        <select
          id="student-role"
          name="role"
          required
          value={accountRole}
          onChange={(e) => setAccountRole(e.target.value as CampusRole)}
          disabled={pending}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm sm:max-w-xs"
        >
          {ADMIN_CREATABLE_ROLES.map((role) => (
            <option key={role} value={role}>
              {ACCOUNT_ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      {accountRole === "parent" ? null : (
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
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create account"}
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
