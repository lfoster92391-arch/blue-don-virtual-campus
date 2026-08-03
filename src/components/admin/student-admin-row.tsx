"use client";

import { useActionState } from "react";
import { Eye } from "lucide-react";

import { AssignClubForm } from "@/components/admin/assign-club-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { focusClubRoleLabel } from "@/config/focus-club-access";
import {
  resetUserPasswordAction,
  type AdminUserActionState,
} from "@/features/admin/user-actions";
import { startStudentPreviewAction } from "@/features/admin/preview-actions";
import {
  setStudentStatusAction,
  type StudentAdminActionState,
} from "@/features/admin/student-actions";
import type { FocusClubMembershipSummary } from "@/services/org-membership-service";
import type { CampusRole } from "@/config/roles";

const passwordInitial: AdminUserActionState = {};
const statusInitial: StudentAdminActionState = {};

type StudentAdminRowProps = {
  userId: string;
  displayName: string;
  email: string;
  status: "active" | "inactive" | "pending";
  initials: string;
  role: CampusRole;
  memberships: FocusClubMembershipSummary[];
  passwordManagementEnabled: boolean;
};

const statusStyles: Record<StudentAdminRowProps["status"], string> = {
  active: "bg-[#2E8B57]/10 text-[#2E8B57]",
  pending: "bg-[#D4A017]/10 text-[#D4A017]",
  inactive: "bg-muted text-muted-foreground",
};

export function StudentAdminRow({
  userId,
  displayName,
  email,
  status,
  initials,
  memberships,
  passwordManagementEnabled,
}: StudentAdminRowProps) {
  const [passwordState, passwordAction, passwordPending] = useActionState(
    resetUserPasswordAction,
    passwordInitial,
  );
  const [statusState, statusAction, statusPending] = useActionState(
    setStudentStatusAction,
    statusInitial,
  );

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#0A2342] text-xs font-semibold text-white">
            {initials}
          </span>
          <div>
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            {memberships.length > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {memberships
                  .map(
                    (m) =>
                      `${m.name} · ${focusClubRoleLabel(m.slug, m.orgRole)}`,
                  )
                  .join(" · ")}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                No club assignment yet
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusStyles[status]}`}
          >
            {status}
          </span>
          <form action={startStudentPreviewAction}>
            <input type="hidden" name="userId" value={userId} />
            <Button type="submit" size="sm" variant="outline">
              <Eye className="size-4" />
              Preview
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <form action={passwordAction} className="space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <label
            htmlFor={`pw-${userId}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Reset password
          </label>
          <Input
            id={`pw-${userId}`}
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            disabled={!passwordManagementEnabled || passwordPending}
            placeholder="New temporary password"
          />
          <div className="flex gap-2">
            <Input
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              disabled={!passwordManagementEnabled || passwordPending}
              placeholder="Confirm"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!passwordManagementEnabled || passwordPending}
            >
              {passwordPending ? "Saving..." : "Update"}
            </Button>
          </div>
          {passwordState.error ? (
            <p className="text-xs text-destructive">{passwordState.error}</p>
          ) : null}
          {passwordState.success ? (
            <p className="text-xs text-[#2E8B57]">{passwordState.success}</p>
          ) : null}
        </form>

        <form action={statusAction} className="space-y-2">
          <input type="hidden" name="userId" value={userId} />
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Account status
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              name="status"
              value="active"
              size="sm"
              variant="outline"
              disabled={statusPending || status === "active"}
            >
              Activate
            </Button>
            <Button
              type="submit"
              name="status"
              value="inactive"
              size="sm"
              variant="outline"
              disabled={statusPending || status === "inactive"}
            >
              Disable
            </Button>
          </div>
          {statusState.error ? (
            <p className="text-xs text-destructive">{statusState.error}</p>
          ) : null}
          {statusState.success ? (
            <p className="text-xs text-[#2E8B57]">{statusState.success}</p>
          ) : null}
        </form>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <AssignClubForm userId={userId} memberships={memberships} />
      </div>
    </li>
  );
}
