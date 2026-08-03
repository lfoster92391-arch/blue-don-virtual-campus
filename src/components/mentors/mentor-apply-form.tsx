"use client";

import { useActionState } from "react";

import {
  applyMentorAction,
  type MentorActionState,
} from "@/features/mentors/actions";
import { Button } from "@/components/ui/button";
import {
  MENTOR_CATEGORY_LABELS,
  MENTOR_CATEGORY_ORDER,
} from "@/config/mentor-network";
import type { MentorCategory } from "@/generated/prisma/client";

const initialState: MentorActionState = {};

const APPLY_CATEGORIES = MENTOR_CATEGORY_ORDER.filter(
  (value): value is MentorCategory => value !== "all",
);

export function MentorApplyForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: MentorActionState, formData: FormData) => {
      return applyMentorAction({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        category: String(formData.get("category") ?? "") as MentorCategory,
        title: String(formData.get("title") ?? ""),
        organization: String(formData.get("organization") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        expertiseTags: String(formData.get("expertiseTags") ?? ""),
      });
    },
    initialState,
  );

  if (state.success) {
    return (
      <div className="rounded-xl border border-[#2E8B57]/30 bg-[#2E8B57]/5 p-6">
        <p className="font-medium text-foreground">{state.success}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Approved mentors appear in the Mentor Network for Madonna students to browse and request
          connections.
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
          <span className="text-sm font-medium text-foreground">Full name</span>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Jordan Ellis"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Email</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Mentor category</span>
        <select
          name="category"
          required
          defaultValue="ALUMNI"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {APPLY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {MENTOR_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Title / role</span>
          <input
            name="title"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Registered Nurse"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">Organization</span>
          <input
            name="organization"
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            placeholder="Hancock Regional Medical Center"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Areas of expertise</span>
        <input
          name="expertiseTags"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="Healthcare, Nursing, College Planning"
        />
        <span className="text-xs text-muted-foreground">Separate topics with commas</span>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">Bio</span>
        <textarea
          name="bio"
          required
          rows={5}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          placeholder="Share your background, how you connect with Madonna, and what you can offer students."
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit mentor application"}
      </Button>
    </form>
  );
}
