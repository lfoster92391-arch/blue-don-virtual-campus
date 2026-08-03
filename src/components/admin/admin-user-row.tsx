"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CAMPUS_ROLES, ROLE_LABELS, type CampusRole } from "@/config/roles";
import {
  resetUserPasswordAction,
  updateUserRoleAction,
  type AdminUserActionState,
} from "@/features/admin/user-actions";
import { ParentStudentLinkForm } from "@/components/admin/parent-student-link-form";

const initialState: AdminUserActionState = {};

type AdminUserRowProps = {
  userId: string;
  displayName: string;
  email: string;
  role: CampusRole;
  status: "active" | "inactive" | "pending";
  initials: string;
  passwordManagementEnabled: boolean;
  students?: Array<{ id: string; displayName: string; email: string }>;
};

const statusStyles: Record<AdminUserRowProps["status"], string> = {
  active: "bg-[#2E8B57]/10 text-[#2E8B57]",
  pending: "bg-[#D4A017]/10 text-[#D4A017]",
  inactive: "bg-muted text-muted-foreground",
};

export function AdminUserRow({
  userId,
  displayName,
  email,
  role,
  status,
  initials,
  passwordManagementEnabled,
  students = [],
}: AdminUserRowProps) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    resetUserPasswordAction,
    initialState,
  );
  const [roleState, roleAction, rolePending] = useActionState(
    updateUserRoleAction,
    initialState,
  );

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#0A2342] text-xs font-semibold text-white">
            {initials}
          </span>
          <div>
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <form action={roleAction} className="space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <label
            htmlFor={`role-${userId}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Role
          </label>
          <div className="flex gap-2">
            <select
              id={`role-${userId}`}
              name="role"
              defaultValue={role}
              disabled={rolePending}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {CAMPUS_ROLES.map((option) => (
                <option key={option} value={option}>
                  {ROLE_LABELS[option]}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" variant="outline" disabled={rolePending}>
              {rolePending ? "Saving..." : "Save"}
            </Button>
          </div>
          {roleState.error ? (
            <p className="text-xs text-destructive">{roleState.error}</p>
          ) : null}
          {roleState.success ? (
            <p className="text-xs text-[#2E8B57]">{roleState.success}</p>
          ) : null}
        </form>

        <form action={passwordAction} className="space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <label
            htmlFor={`password-${userId}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Set new password
          </label>
          <div className="space-y-2">
            <Input
              id={`password-${userId}`}
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={!passwordManagementEnabled || passwordPending}
              placeholder="New password (min 8 characters)"
            />
            <div className="flex gap-2">
              <Input
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                disabled={!passwordManagementEnabled || passwordPending}
                placeholder="Confirm password"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!passwordManagementEnabled || passwordPending}
              >
                {passwordPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </div>
          {!passwordManagementEnabled ? (
            <p className="text-xs text-muted-foreground">
              Add the Supabase service-role key to enable password changes.
            </p>
          ) : null}
          {passwordState.error ? (
            <p className="text-xs text-destructive">{passwordState.error}</p>
          ) : null}
          {passwordState.success ? (
            <p className="text-xs text-[#2E8B57]">{passwordState.success}</p>
          ) : null}
        </form>
      </div>

      {((role === "parent" || role === "admin") && status === "active") ? (
        <div className="mt-4 border-t border-border pt-4">
          <ParentStudentLinkForm parentId={userId} students={students} />
        </div>
      ) : null}
    </li>
  );
}
