"use client";

import { useActionState } from "react";

import {
  assignRoleAction,
  type AuthActionState,
} from "@/features/auth/actions";
import {
  CAMPUS_ROLES,
  ROLE_LABELS,
  type CampusRole,
} from "@/config/roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialState: AuthActionState = {};

export function RoleAssignmentForm() {
  const [state, formAction, pending] = useActionState(
    assignRoleAction,
    initialState,
  );

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
          Role Assignment
        </h2>
        <p className="text-sm text-muted-foreground">
          Administrators can assign campus roles to users by account ID.
        </p>
      </div>

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label htmlFor="userId" className="text-sm font-medium">
            User ID
          </label>
          <Input
            id="userId"
            name="userId"
            placeholder="Supabase user UUID"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="role" className="text-sm font-medium">
            Role
          </label>
          <select
            id="role"
            name="role"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            defaultValue="student"
            required
          >
            {CAMPUS_ROLES.map((role: CampusRole) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[#2E8B57]">{state.success}</p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Assigning role..." : "Assign role"}
        </Button>
      </form>
    </div>
  );
}
