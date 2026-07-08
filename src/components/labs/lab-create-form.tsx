"use client";

import { useActionState } from "react";

import { createLabAction } from "@/features/labs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LAB_DIFFICULTY_LABELS } from "@/lib/mvp/constants";

type LabCreateFormProps = {
  academies: { id: string; name: string }[];
};

export function LabCreateForm({ academies }: LabCreateFormProps) {
  const [state, formAction, pending] = useActionState(createLabAction, {});

  return (
    <form action={formAction} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <Input id="title" name="title" required placeholder="Robotics prototyping lab" />
      </div>
      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">Slug</label>
        <Input id="slug" name="slug" required placeholder="robotics-prototyping" />
      </div>
      <div className="space-y-2">
        <label htmlFor="difficulty" className="text-sm font-medium">Difficulty</label>
        <select id="difficulty" name="difficulty" className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
          {Object.entries(LAB_DIFFICULTY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea id="description" name="description" rows={3} className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm" />
      </div>
      <div className="space-y-2">
        <label htmlFor="academyId" className="text-sm font-medium">Academy (optional)</label>
        <select id="academyId" name="academyId" className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
          <option value="">Campus-wide</option>
          {academies.map((academy) => (
            <option key={academy.id} value={academy.id}>{academy.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="launchUrl" className="text-sm font-medium">Launch URL (optional)</label>
        <Input id="launchUrl" name="launchUrl" type="url" placeholder="https://" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="equipment" className="text-sm font-medium">Equipment notes</label>
        <Input id="equipment" name="equipment" placeholder="3D printer, soldering station" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="safetyNotes" className="text-sm font-medium">Safety notes</label>
        <textarea id="safetyNotes" name="safetyNotes" rows={2} className="min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm" />
      </div>
      {state.error ? <p className="text-sm text-destructive sm:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57] sm:col-span-2">{state.success}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Create lab"}</Button>
      </div>
    </form>
  );
}
