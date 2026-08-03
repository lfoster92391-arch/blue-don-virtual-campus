"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { SignatureBlock } from "@/components/forms/signature-block";
import { STUDENT_PROFILE_PERMISSIONS } from "@/config/digital-agreements";
import {
  submitProfilePermissionAction,
  type DigitalFormActionState,
} from "@/features/digital-forms/actions";

type StudentOption = { id: string; displayName: string };

type ProfilePermissionFormProps = {
  students: StudentOption[];
  schoolYear: string;
  defaultSignatureName?: string;
  existingByStudent: Record<string, Record<string, boolean>>;
};

const initialState: DigitalFormActionState = {};

export function ProfilePermissionForm({
  students,
  schoolYear,
  defaultSignatureName = "",
  existingByStudent,
}: ProfilePermissionFormProps) {
  const [state, formAction, pending] = useActionState(
    submitProfilePermissionAction,
    initialState,
  );
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");

  const existing = existingByStudent[studentId] ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="studentId" className="text-sm font-medium">
          Student
        </label>
        <select
          id="studentId"
          name="studentId"
          required
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
          disabled={pending}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.displayName}
            </option>
          ))}
        </select>
      </div>

      <fieldset key={studentId} className="space-y-2 rounded-xl border border-border p-4">
        <legend className="px-1 text-sm font-medium">Visible profile fields</legend>
        <p className="mb-2 text-xs text-muted-foreground">
          Enable the fields that may be shown on your student&apos;s Blue Don profile and
          in the campus directory. Everything is private until enabled.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {STUDENT_PROFILE_PERMISSIONS.map((field) => (
            <label
              key={field.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name={`profile_${field.id}`}
                defaultChecked={existing[field.id] ?? false}
                disabled={pending}
                className="size-4 rounded border-input"
              />
              <span>{field.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <SignatureBlock
        defaultValue={defaultSignatureName}
        disabled={pending}
        signerLabel="Parent / Guardian"
        schoolYear={schoolYear}
        agreeLabel="I am the parent/guardian and my typed name is my electronic signature for these selections."
      />

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}

      <Button type="submit" disabled={pending || students.length === 0}>
        {pending ? "Saving..." : "Save Profile Permissions"}
      </Button>
    </form>
  );
}
