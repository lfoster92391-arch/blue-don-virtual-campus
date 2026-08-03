"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { SignatureBlock } from "@/components/forms/signature-block";
import type { DigitalFormActionState } from "@/features/digital-forms/actions";

type AgreementSignFormProps = {
  action: (
    state: DigitalFormActionState,
    formData: FormData,
  ) => Promise<DigitalFormActionState>;
  schoolYear: string;
  defaultSignatureName?: string;
  signerLabel?: string;
  agreeLabel?: string;
  submitLabel?: string;
};

const initialState: DigitalFormActionState = {};

export function AgreementSignForm({
  action,
  schoolYear,
  defaultSignatureName = "",
  signerLabel,
  agreeLabel,
  submitLabel = "Sign and submit",
}: AgreementSignFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <SignatureBlock
        defaultValue={defaultSignatureName}
        disabled={pending}
        signerLabel={signerLabel}
        schoolYear={schoolYear}
        agreeLabel={agreeLabel}
      />

      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-[#2E8B57]">{state.success}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : submitLabel}
      </Button>
    </form>
  );
}
