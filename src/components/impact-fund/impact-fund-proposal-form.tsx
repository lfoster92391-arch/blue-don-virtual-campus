"use client";

import { useActionState } from "react";

import { createImpactFundProposalAction } from "@/features/impact-fund/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ImpactFundProposalFormProps = {
  academies: { id: string; name: string }[];
};

export function ImpactFundProposalForm({ academies }: ImpactFundProposalFormProps) {
  const [state, formAction, pending] = useActionState(createImpactFundProposalAction, {});

  return (
    <form action={formAction} className="mt-4 grid gap-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Project title</label>
        <Input id="title" name="title" required placeholder="Community garden expansion" />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Proposal description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          placeholder="Describe the impact, timeline, and how funds will be used."
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="amountRequested" className="text-sm font-medium">Amount requested (USD)</label>
          <Input id="amountRequested" name="amountRequested" type="number" min={1} required placeholder="500" />
          <p className="text-xs text-muted-foreground">Enter whole dollars; stored as cents internally.</p>
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
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit proposal"}</Button>
    </form>
  );
}
