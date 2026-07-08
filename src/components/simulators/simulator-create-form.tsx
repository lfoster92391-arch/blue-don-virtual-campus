"use client";

import { useActionState } from "react";

import { createSimulatorAction } from "@/features/simulators/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIMULATOR_CATEGORY_LABELS } from "@/lib/mvp/constants";

type SimulatorCreateFormProps = {
  academies: { id: string; name: string }[];
};

export function SimulatorCreateForm({ academies }: SimulatorCreateFormProps) {
  const [state, formAction, pending] = useActionState(createSimulatorAction, {});

  return (
    <form action={formAction} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <Input id="title" name="title" required placeholder="Business pitch simulator" />
      </div>
      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">Slug</label>
        <Input id="slug" name="slug" required placeholder="business-pitch" />
      </div>
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">Category</label>
        <select id="category" name="category" className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm">
          {Object.entries(SIMULATOR_CATEGORY_LABELS).map(([value, label]) => (
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
        <label htmlFor="sortOrder" className="text-sm font-medium">Sort order</label>
        <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="launchUrl" className="text-sm font-medium">Launch URL</label>
        <Input id="launchUrl" name="launchUrl" type="url" required placeholder="https://" />
      </div>
      {state.error ? <p className="text-sm text-destructive sm:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57] sm:col-span-2">{state.success}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? "Saving…" : "Create simulator"}</Button>
      </div>
    </form>
  );
}
