import { AlertTriangle, Leaf, ShieldCheck } from "lucide-react";

import {
  dietaryAllergenLabel,
  dietaryRestrictionLabel,
  hasDietaryNeeds,
} from "@/config/dietary";

type DietarySummaryProps = {
  allergens: readonly string[];
  restrictions: readonly string[];
  notes?: string | null;
  /** Who applied the record, shown as provenance on the student profile. */
  appliedByName?: string | null;
  appliedAt?: string | null;
  /** Compact form drops the provenance line and the "on file" empty state. */
  compact?: boolean;
};

/**
 * Read-only view of a student's accepted dietary record. Used on the lunch
 * ordering board, the student profile, and the office review queue so all three
 * describe an allergy the same way.
 */
export function DietarySummary({
  allergens,
  restrictions,
  notes,
  appliedByName,
  appliedAt,
  compact = false,
}: DietarySummaryProps) {
  const trimmedNotes = notes?.trim() || null;
  const anyNeeds = hasDietaryNeeds({ allergens, restrictions, notes });

  if (!anyNeeds) {
    if (compact) {
      return null;
    }
    return (
      <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        <ShieldCheck className="size-4" aria-hidden="true" />
        No dietary restrictions on file.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {allergens.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#C0392B]">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            Allergies
          </span>
          {allergens.map((id) => (
            <span
              key={id}
              className="rounded-full bg-[#C0392B]/10 px-2 py-0.5 text-xs font-medium text-[#C0392B]"
            >
              {dietaryAllergenLabel(id)}
            </span>
          ))}
        </div>
      ) : null}

      {restrictions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#2E8B57]">
            <Leaf className="size-3.5" aria-hidden="true" />
            Restrictions
          </span>
          {restrictions.map((id) => (
            <span
              key={id}
              className="rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]"
            >
              {dietaryRestrictionLabel(id)}
            </span>
          ))}
        </div>
      ) : null}

      {trimmedNotes ? (
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Note: </span>
          {trimmedNotes}
        </p>
      ) : null}

      {!compact && appliedByName ? (
        <p className="text-xs text-muted-foreground">
          Accepted by {appliedByName}
          {appliedAt
            ? ` on ${new Date(appliedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}`
            : ""}
          .
        </p>
      ) : null}
    </div>
  );
}
