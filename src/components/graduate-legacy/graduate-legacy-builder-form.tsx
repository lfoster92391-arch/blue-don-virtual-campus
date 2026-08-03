"use client";

import { useActionState } from "react";

import { saveGraduateLegacyAction } from "@/features/graduate-legacy/actions";
import type { GraduateLegacyData } from "@/config/graduate-legacy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GraduateLegacyBuilderFormProps = {
  initial?: GraduateLegacyData | null;
  defaultClassYear?: number;
};

export function GraduateLegacyBuilderForm({
  initial,
  defaultClassYear = 2026,
}: GraduateLegacyBuilderFormProps) {
  const [state, formAction, pending] = useActionState(saveGraduateLegacyAction, {});

  return (
    <form action={formAction} className="grid gap-4">
      <div className="space-y-2">
        <label htmlFor="classYear" className="text-sm font-medium">Class year</label>
        <Input
          id="classYear"
          name="classYear"
          type="number"
          min={2020}
          max={2035}
          defaultValue={initial?.classYear ?? defaultClassYear}
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="college" className="text-sm font-medium">College or next step</label>
        <Input
          id="college"
          name="college"
          defaultValue={initial?.college ?? ""}
          placeholder="Louisiana State University — Computer Science"
        />
      </div>
      <Field
        id="organizations"
        label="Organizations (one per line)"
        defaultValue={initial?.organizations.join("\n") ?? ""}
        rows={4}
      />
      <Field
        id="achievements"
        label="Achievements (one per line)"
        defaultValue={initial?.achievements.join("\n") ?? ""}
        rows={4}
      />
      <Field
        id="projects"
        label="Projects (Title — Description, one per line)"
        defaultValue={
          initial?.projects.map((p) => `${p.title} — ${p.description}`).join("\n") ?? ""
        }
        rows={4}
      />
      <Field
        id="favoriteMemory"
        label="Favorite memory"
        defaultValue={initial?.favoriteMemory ?? ""}
        rows={3}
      />
      <Field id="advice" label="Advice" defaultValue={initial?.advice ?? ""} rows={3} />
      <Field
        id="legacyMessage"
        label="Leave a legacy"
        defaultValue={initial?.legacyMessage ?? ""}
        rows={3}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="alumniOptIn"
          defaultChecked={initial?.alumniOptIn ?? false}
          className="size-4 rounded border-input"
        />
        Opt in to Madonna alumni network
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isPublic"
          defaultChecked={initial?.isPublic ?? false}
          className="size-4 rounded border-input"
        />
        Publish my legacy page publicly
      </label>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save legacy page"}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  defaultValue,
  rows = 3,
}: {
  id: string;
  label: string;
  defaultValue: string;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <textarea
        id={id}
        name={id}
        rows={rows}
        defaultValue={defaultValue}
        className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
      />
    </div>
  );
}
