"use client";

import { useActionState } from "react";

import { submitImpactProjectAction } from "@/features/impact-project/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ImpactProjectProposalForm() {
  const [state, formAction, pending] = useActionState(submitImpactProjectAction, {});

  return (
    <form action={formAction} className="grid gap-4">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">Project title</label>
        <Input id="title" name="title" required placeholder="Community creek cleanup" />
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Project description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          required
          placeholder="Describe your impact, timeline, partners, and how you'll measure success."
          className="min-h-28 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit proposal"}
      </Button>
    </form>
  );
}
