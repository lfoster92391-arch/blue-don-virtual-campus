"use client";

import { useActionState } from "react";

import { createPortfolioItemAction } from "@/features/portfolio/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PORTFOLIO_TYPE_LABELS } from "@/lib/mvp/constants";

type PortfolioCreateFormProps = {
  academies: { id: string; name: string }[];
};

export function PortfolioCreateForm({ academies }: PortfolioCreateFormProps) {
  const [state, formAction, pending] = useActionState(createPortfolioItemAction, {});

  return (
    <form action={formAction} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <Input id="title" name="title" required placeholder="Capstone project name" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="What did you accomplish?"
          className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">Type</label>
        <select
          id="type"
          name="type"
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {Object.entries(PORTFOLIO_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="academyId" className="text-sm font-medium">Academy (optional)</label>
        <select
          id="academyId"
          name="academyId"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="">Campus-wide</option>
          {academies.map((academy) => (
            <option key={academy.id} value={academy.id}>
              {academy.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="evidenceUrl" className="text-sm font-medium">Evidence URL (optional)</label>
        <Input id="evidenceUrl" name="evidenceUrl" type="url" placeholder="https://" />
      </div>
      <div className="space-y-2">
        <label htmlFor="points" className="text-sm font-medium">Points / hours</label>
        <Input id="points" name="points" type="number" min={0} defaultValue={0} />
      </div>
      {state.error ? <p className="text-sm text-destructive sm:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57] sm:col-span-2">{state.success}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Add item"}
        </Button>
      </div>
    </form>
  );
}
