"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DIETARY_ALLERGENS,
  DIETARY_NOTES_MAX_LENGTH,
  DIETARY_RESTRICTIONS,
} from "@/config/dietary";
import { submitDietaryRequestAction } from "@/features/dietary/actions";
import { cn } from "@/lib/utils";

export type DietaryFormStudent = {
  id: string;
  displayName: string;
  /** Currently accepted record, pre-selected so families edit rather than retype. */
  allergens: string[];
  restrictions: string[];
  notes: string | null;
  hasPendingRequest: boolean;
};

type DietaryRequestFormProps = {
  students: DietaryFormStudent[];
};

function TagToggle({
  label,
  hint,
  selected,
  disabled,
  onToggle,
}: {
  label: string;
  hint: string;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      title={hint}
      className={cn(
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-[#2F80ED] bg-[#2F80ED]/10 text-[#2F80ED]"
          : "border-border bg-background text-muted-foreground hover:border-[#2F80ED]/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function DietaryRequestForm({ students }: DietaryRequestFormProps) {
  const [pending, startTransition] = useTransition();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const student = students.find((entry) => entry.id === studentId) ?? null;

  const [allergens, setAllergens] = useState<string[]>(
    students[0]?.allergens ?? [],
  );
  const [restrictions, setRestrictions] = useState<string[]>(
    students[0]?.restrictions ?? [],
  );
  const [notes, setNotes] = useState(students[0]?.notes ?? "");

  function selectStudent(nextId: string) {
    const next = students.find((entry) => entry.id === nextId);
    setStudentId(nextId);
    setAllergens(next?.allergens ?? []);
    setRestrictions(next?.restrictions ?? []);
    setNotes(next?.notes ?? "");
    setMessage(null);
    setError(null);
  }

  function toggle(list: string[], id: string): string[] {
    return list.includes(id)
      ? list.filter((entry) => entry !== id)
      : [...list, id];
  }

  function handleSubmit() {
    if (!student) {
      setError("Choose which student this form is for.");
      return;
    }

    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await submitDietaryRequestAction({
        studentId: student.id,
        allergens,
        restrictions,
        notes: notes.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(result.success ?? "Dietary form submitted.");
    });
  }

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No students are linked to your account yet. Contact the main office to
        get connected, then submit a dietary form here.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {message ? (
        <p className="rounded-lg bg-[#2E8B57]/10 px-3 py-2 text-sm text-[#2E8B57]">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {students.length > 1 ? (
        <div className="space-y-1.5">
          <label
            htmlFor="dietary-student"
            className="text-sm font-medium text-foreground"
          >
            Student
          </label>
          <select
            id="dietary-student"
            value={studentId}
            onChange={(event) => selectStudent(event.target.value)}
            disabled={pending}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {students.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.displayName}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {student?.hasPendingRequest ? (
        <p className="rounded-lg bg-[#D4A017]/10 px-3 py-2 text-sm text-[#D4A017]">
          A dietary form for {student.displayName} is already waiting for office
          review. Submitting again replaces it.
        </p>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Allergies
        </legend>
        <p className="text-xs text-muted-foreground">
          Select every allergen the cafeteria must avoid.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {DIETARY_ALLERGENS.map((allergen) => (
            <TagToggle
              key={allergen.id}
              label={allergen.label}
              hint={allergen.severityHint}
              selected={allergens.includes(allergen.id)}
              disabled={pending}
              onToggle={() => setAllergens((list) => toggle(list, allergen.id))}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">
          Dietary restrictions
        </legend>
        <p className="text-xs text-muted-foreground">
          Religious, medical, or preference-based restrictions.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <TagToggle
              key={restriction.id}
              label={restriction.label}
              hint={restriction.description}
              selected={restrictions.includes(restriction.id)}
              disabled={pending}
              onToggle={() =>
                setRestrictions((list) => toggle(list, restriction.id))
              }
            />
          ))}
        </div>
      </fieldset>

      <div className="space-y-1.5">
        <label
          htmlFor="dietary-notes"
          className="text-sm font-medium text-foreground"
        >
          Anything else the kitchen should know
        </label>
        <textarea
          id="dietary-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={DIETARY_NOTES_MAX_LENGTH}
          rows={3}
          disabled={pending}
          placeholder="e.g. Carries an EpiPen in her bag. Severe reaction to cross-contact."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
        <p className="text-xs text-muted-foreground">
          {notes.length}/{DIETARY_NOTES_MAX_LENGTH} characters. Do not include
          medical record numbers or insurance details.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={pending} onClick={handleSubmit}>
          {pending ? "Submitting…" : "Submit dietary form"}
        </Button>
        <p className="text-xs text-muted-foreground">
          The office reviews and accepts the form before it reaches the
          cafeteria.
        </p>
      </div>
    </div>
  );
}
