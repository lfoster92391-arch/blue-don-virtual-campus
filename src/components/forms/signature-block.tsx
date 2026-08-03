import { Input } from "@/components/ui/input";

type SignatureBlockProps = {
  /** Typed-signature field name (defaults to "signatureName"). */
  name?: string;
  defaultValue?: string;
  disabled?: boolean;
  /** Optional co-signer label, e.g. "Parent / Guardian". */
  signerLabel?: string;
  /** School year the signature is recorded against. */
  schoolYear: string;
  agreeLabel?: string;
};

/**
 * Reusable digital signature block (agreement #13): typed signature, agree
 * checkbox, school-year context, and a note about the audit trail. IP,
 * timestamp, and signer role are captured server-side on submit.
 */
export function SignatureBlock({
  name = "signatureName",
  defaultValue = "",
  disabled = false,
  signerLabel,
  schoolYear,
  agreeLabel = "I agree that my typed name constitutes my electronic signature.",
}: SignatureBlockProps) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium uppercase tracking-wide">Digital signature</span>
        <span>School year {schoolYear}</span>
      </div>

      <div className="space-y-2">
        <label htmlFor={name} className="text-sm font-medium">
          {signerLabel ? `${signerLabel} typed signature` : "Typed signature"}
        </label>
        <Input
          id={name}
          name={name}
          required
          disabled={disabled}
          defaultValue={defaultValue}
          placeholder="Type your full legal name"
        />
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="agreeToTerms"
          required
          disabled={disabled}
          className="mt-1 size-4 rounded border-input"
        />
        <span>{agreeLabel}</span>
      </label>

      <p className="text-xs text-muted-foreground">
        Your signature is recorded with a timestamp, your role, and request IP for the
        campus audit trail. Records are retained and never deleted.
      </p>
    </div>
  );
}
