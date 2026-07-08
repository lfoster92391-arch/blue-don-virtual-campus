"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  APPROVAL_TYPE_LABELS,
  FORM_TYPE_LABELS,
} from "@/lib/forms/constants";
import {
  createFormAction,
  type FormActionState,
} from "@/features/forms/actions";

const initialState: FormActionState = {};

const formTypes = Object.keys(FORM_TYPE_LABELS);
const approvalTypes = Object.keys(APPROVAL_TYPE_LABELS);

export function AdminFormCreate() {
  const [state, formAction, pending] = useActionState(
    createFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input id="title" name="title" required placeholder="Student Agreement" />
      </div>

      <div className="space-y-2">
        <label htmlFor="type" className="text-sm font-medium">
          Form type
        </label>
        <select
          id="type"
          name="type"
          required
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue="CUSTOM"
        >
          {formTypes.map((type) => (
            <option key={type} value={type}>
              {FORM_TYPE_LABELS[type as keyof typeof FORM_TYPE_LABELS]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Input
          id="description"
          name="description"
          placeholder="Short summary for campus users"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          Form content
        </label>
        <textarea
          id="content"
          name="content"
          rows={6}
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
          placeholder="Agreement text, instructions, or policy body"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="approvalRequired" className="size-4 rounded" />
        Requires advisor or admin approval after submission
      </label>

      <div className="space-y-2">
        <label htmlFor="approvalType" className="text-sm font-medium">
          Approval category (optional)
        </label>
        <select
          id="approvalType"
          name="approvalType"
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          defaultValue=""
        >
          <option value="">None</option>
          {approvalTypes.map((type) => (
            <option key={type} value={type}>
              {APPROVAL_TYPE_LABELS[type as keyof typeof APPROVAL_TYPE_LABELS]}
            </option>
          ))}
        </select>
      </div>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Create draft form"}
      </Button>
    </form>
  );
}
