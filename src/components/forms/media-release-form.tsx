"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { SignatureBlock } from "@/components/forms/signature-block";
import { MEDIA_RELEASE_CATEGORIES } from "@/config/digital-agreements";
import {
  submitMediaReleaseAction,
  type DigitalFormActionState,
} from "@/features/digital-forms/actions";

type StudentOption = { id: string; displayName: string };

type MediaReleaseFormProps = {
  students: StudentOption[];
  schoolYear: string;
  defaultSignatureName?: string;
  existingByStudent: Record<string, Record<string, boolean>>;
};

const initialState: DigitalFormActionState = {};

export function MediaReleaseForm({
  students,
  schoolYear,
  defaultSignatureName = "",
  existingByStudent,
}: MediaReleaseFormProps) {
  const [state, formAction, pending] = useActionState(
    submitMediaReleaseAction,
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
        <legend className="px-1 text-sm font-medium">
          Approved media channels
        </legend>
        <p className="mb-2 text-xs text-muted-foreground">
          Check each channel where your student&apos;s name, image, or work may appear.
          Unchecked channels are denied by default.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {MEDIA_RELEASE_CATEGORIES.map((category) => (
            <label
              key={category.id}
              className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name={`media_${category.id}`}
                defaultChecked={existing[category.id] ?? false}
                disabled={pending}
                className="size-4 rounded border-input"
              />
              <span>{category.label}</span>
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
        {pending ? "Saving..." : "Save Media Release"}
      </Button>
    </form>
  );
}
