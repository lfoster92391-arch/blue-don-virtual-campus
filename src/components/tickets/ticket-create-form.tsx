"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { createTicketAction } from "@/features/tickets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TICKET_CATEGORY_LABELS } from "@/lib/mvp/constants";

export function TicketCreateForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string; success?: string; ticketId?: string }, formData: FormData) => {
      const result = await createTicketAction(prev, formData);
      if (result.ticketId) {
        router.push(`/service-desk/${result.ticketId}`);
      }
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">Subject</label>
        <Input id="subject" name="subject" required placeholder="Brief summary" />
      </div>
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">Category</label>
        <select
          id="category"
          name="category"
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {Object.entries(TICKET_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="What happened? Include steps to reproduce if relevant."
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit ticket"}
      </Button>
    </form>
  );
}
