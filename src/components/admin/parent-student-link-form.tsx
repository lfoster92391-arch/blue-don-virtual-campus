"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  linkParentStudentAction,
  type AdminUserActionState,
} from "@/features/admin/user-actions";

const initialState: AdminUserActionState = {};

type ParentStudentLinkFormProps = {
  parentId: string;
  students: Array<{ id: string; displayName: string; email: string }>;
};

export function ParentStudentLinkForm({
  parentId,
  students,
}: ParentStudentLinkFormProps) {
  const [state, formAction, pending] = useActionState(
    linkParentStudentAction,
    initialState,
  );

  if (students.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No active student accounts available to link.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="parentId" value={parentId} />
      <label
        htmlFor={`link-student-${parentId}`}
        className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        Link student
      </label>
      <div className="flex gap-2">
        <select
          id={`link-student-${parentId}`}
          name="studentId"
          required
          disabled={pending}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue=""
        >
          <option value="" disabled>
            Select student
          </option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.displayName}
            </option>
          ))}
        </select>
        <Input
          name="relationship"
          placeholder="Relationship"
          disabled={pending}
          className="max-w-36"
        />
        <Button type="submit" size="sm" variant="outline" disabled={pending}>
          {pending ? "Linking..." : "Link"}
        </Button>
      </div>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-xs text-[#2E8B57]">{state.success}</p> : null}
    </form>
  );
}
