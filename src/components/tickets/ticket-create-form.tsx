"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { ItHelpDeskPanel } from "@/components/service-desk/it-help-desk-panel";
import { createTicketAction } from "@/features/tickets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TICKET_CATEGORY_LABELS } from "@/lib/mvp/constants";
import type { TicketCategory } from "@/generated/prisma/client";

const IT_TICKET_CATEGORIES: TicketCategory[] = ["TECHNICAL", "ACCOUNT"];

const NON_IT_CATEGORIES = Object.entries(TICKET_CATEGORY_LABELS).filter(
  ([value]) => !IT_TICKET_CATEGORIES.includes(value as TicketCategory),
);

export function TicketCreateForm() {
  const router = useRouter();
  const [category, setCategory] = useState<TicketCategory>("FACILITIES");
  const isItCategory = IT_TICKET_CATEGORIES.includes(category);
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
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">
          What do you need help with?
        </label>
        <select
          id="category"
          name="category"
          required
          value={category}
          onChange={(event) => setCategory(event.target.value as TicketCategory)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <optgroup label="IT — email help desk">
            {IT_TICKET_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {TICKET_CATEGORY_LABELS[value]}
              </option>
            ))}
          </optgroup>
          <optgroup label="Campus support — submit in-app ticket">
            {NON_IT_CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {isItCategory ? (
        <ItHelpDeskPanel variant="card" />
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="category" value={category} />
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              Subject
            </label>
            <Input id="subject" name="subject" required placeholder="Brief summary" />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
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
      )}
    </div>
  );
}
