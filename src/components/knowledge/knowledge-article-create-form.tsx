"use client";

import { useActionState } from "react";

import { createKnowledgeArticleAction } from "@/features/knowledge/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type KnowledgeArticleCreateFormProps = {
  academies: { id: string; name: string }[];
};

export function KnowledgeArticleCreateForm({
  academies,
}: KnowledgeArticleCreateFormProps) {
  const [state, formAction, pending] = useActionState(
    createKnowledgeArticleAction,
    {},
  );

  return (
    <form action={formAction} className="mt-4 grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-medium">Slug</label>
        <Input id="slug" name="slug" required placeholder="getting-started" />
      </div>
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-medium">Category</label>
        <Input id="category" name="category" placeholder="Onboarding" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <label htmlFor="content" className="text-sm font-medium">Content</label>
        <textarea
          id="content"
          name="content"
          required
          rows={6}
          className="min-h-32 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</label>
        <Input id="tags" name="tags" placeholder="forms, onboarding" />
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
      {state.error ? <p className="text-sm text-destructive sm:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57] sm:col-span-2">{state.success}</p> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Create draft"}
        </Button>
      </div>
    </form>
  );
}
