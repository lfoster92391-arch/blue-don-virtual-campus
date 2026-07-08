"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAMPUS_ROLES, ROLE_LABELS } from "@/config/roles";
import {
  createCampusUserAction,
  type AdminUserActionState,
} from "@/features/admin/user-actions";

const initialState: AdminUserActionState = {};

export function ServiceDeskUserCreate() {
  const [state, formAction, pending] = useActionState(
    createCampusUserAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          Create campus account
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Provision a student, staff, or family login. The user can sign in
          immediately with the password you set.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="firstName" className="text-sm font-medium">
            First name
          </label>
          <Input id="firstName" name="firstName" placeholder="Jordan" />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="text-sm font-medium">
            Last name
          </label>
          <Input id="lastName" name="lastName" placeholder="Smith" />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="student@madonnahs.edu"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Min 8 characters"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm password
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue="student"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm sm:max-w-xs"
        >
          {CAMPUS_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
