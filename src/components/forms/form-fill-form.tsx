"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitFormAction,
  type FormActionState,
} from "@/features/forms/actions";

const initialState: FormActionState = {};

type FormFillFormProps = {
  formId: string;
  defaultSignatureName?: string;
  disabled?: boolean;
};

export function FormFillForm({
  formId,
  defaultSignatureName = "",
  disabled = false,
}: FormFillFormProps) {
  const [state, formAction, pending] = useActionState(
    submitFormAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="formId" value={formId} />

      <div className="space-y-2">
        <label htmlFor="signatureName" className="text-sm font-medium">
          Typed signature
        </label>
        <Input
          id="signatureName"
          name="signatureName"
          required
          disabled={disabled || pending}
          defaultValue={defaultSignatureName}
          placeholder="Type your full legal name"
        />
        <p className="text-xs text-muted-foreground">
          Phase 5 uses a checkbox and typed name as your electronic signature.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="agreeToTerms"
          required
          disabled={disabled || pending}
          className="mt-1 size-4 rounded border-input"
        />
        <span>
          I have read this form and agree that my typed name constitutes my
          electronic signature.
        </span>
      </label>

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}

      <Button type="submit" disabled={disabled || pending}>
        {pending ? "Submitting..." : "Sign and submit"}
      </Button>
    </form>
  );
}
