"use client";

import { useActionState } from "react";

import { applyPartnerFormAction, type PartnerActionState } from "@/features/business-partners/actions";
import { Button } from "@/components/ui/button";

const initialState: PartnerActionState = {};

export function PartnerApplyForm() {
  const [state, formAction, pending] = useActionState(applyPartnerFormAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-6">
        <p className="font-medium text-foreground">{state.success}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Approved partners appear in the Business Partners directory for Madonna students.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Business name</span>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Dan's Plumbing"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Industry</span>
          <input
            name="industry"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Plumbing & HVAC"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Contact email</span>
        <input
          name="contactEmail"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="owner@business.com"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Website (optional)</span>
        <input
          name="website"
          type="url"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="https://yourbusiness.com"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Address (optional)</span>
        <input
          name="address"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="412 Main Street, Weirton, WV"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">
          About your business & student opportunities
        </span>
        <textarea
          name="description"
          required
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="Describe internships, job shadowing, hiring needs, and how Madonna students can connect with your team."
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
