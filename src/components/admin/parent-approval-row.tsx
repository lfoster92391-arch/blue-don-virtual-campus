"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  approveParentAccountAction,
  type AdminUserActionState,
} from "@/features/admin/user-actions";
import type { PendingParent } from "@/services/parent-student-service";

const initialState: AdminUserActionState = {};

type ParentApprovalRowProps = {
  parent: PendingParent;
  students: Array<{ id: string; displayName: string; email: string }>;
};

export function ParentApprovalRow({ parent, students }: ParentApprovalRowProps) {
  const [state, formAction, pending] = useActionState(
    approveParentAccountAction,
    initialState,
  );

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="space-y-1">
        <p className="font-medium text-foreground">{parent.displayName}</p>
        <p className="text-sm text-muted-foreground">{parent.email}</p>
        {parent.relationshipNote ? (
          <p className="text-sm text-muted-foreground">
            Relationship: {parent.relationshipNote}
          </p>
        ) : (
          <p className="text-sm text-[#D4A017]">No relationship note provided</p>
        )}
        <p className="text-xs text-muted-foreground">
          Registered {new Date(parent.createdAt).toLocaleString()}
        </p>
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="parentId" value={parent.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor={`student-${parent.id}`}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Link to student
            </label>
            <select
              id={`student-${parent.id}`}
              name="studentId"
              required
              disabled={pending || students.length === 0}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                {students.length > 0 ? "Select student" : "No active students"}
              </option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.displayName} ({student.email})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label
              htmlFor={`relationship-${parent.id}`}
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Relationship label
            </label>
            <Input
              id={`relationship-${parent.id}`}
              name="relationship"
              placeholder="Mother, Father, Guardian"
              disabled={pending}
            />
          </div>
        </div>
        <Button type="submit" size="sm" disabled={pending || students.length === 0}>
          {pending ? "Approving..." : "Approve and link"}
        </Button>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-xs text-[#2E8B57]">{state.success}</p> : null}
      </form>
    </li>
  );
}
