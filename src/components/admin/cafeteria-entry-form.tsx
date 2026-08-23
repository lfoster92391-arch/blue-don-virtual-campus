"use client";

import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CAFETERIA_LEDGER_KINDS,
  CAFETERIA_LEDGER_KIND_META,
  type CafeteriaLedgerKind,
} from "@/config/cafeteria";
import {
  recordCafeteriaEntryAction,
  type CafeteriaActionState,
} from "@/features/cafeteria/actions";

const initialState: CafeteriaActionState = {};

export type CafeteriaFormStudent = {
  id: string;
  displayName: string;
  balanceLabel: string | null;
};

export function CafeteriaEntryForm({
  students,
}: {
  students: CafeteriaFormStudent[];
}) {
  const [state, formAction, pending] = useActionState(
    recordCafeteriaEntryAction,
    initialState,
  );
  const [kind, setKind] = useState<CafeteriaLedgerKind>("CREDIT");

  if (students.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No active student accounts yet, so there is nothing to credit.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="cafeteria-student"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Student
          </label>
          <select
            id="cafeteria-student"
            name="studentId"
            required
            disabled={pending}
            defaultValue=""
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="" disabled>
              Name on the envelope
            </option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.displayName}
                {student.balanceLabel ? ` — ${student.balanceLabel}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cafeteria-kind"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            What happened
          </label>
          <select
            id="cafeteria-kind"
            name="kind"
            required
            disabled={pending}
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as CafeteriaLedgerKind)
            }
            className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            {CAFETERIA_LEDGER_KINDS.map((value) => (
              <option key={value} value={value}>
                {CAFETERIA_LEDGER_KIND_META[value].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            {CAFETERIA_LEDGER_KIND_META[kind].hint}
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cafeteria-amount"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Amount
          </label>
          <Input
            id="cafeteria-amount"
            name="amount"
            required
            inputMode="decimal"
            placeholder="20.00"
            disabled={pending}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="cafeteria-note"
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          >
            Note{kind === "ADJUSTMENT" ? "" : " (optional)"}
          </label>
          <Input
            id="cafeteria-note"
            name="note"
            placeholder="Cash envelope, check #1042, etc."
            disabled={pending}
            required={kind === "ADJUSTMENT"}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Record it"}
        </Button>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[#2E8B57]">{state.success}</p>
        ) : null}
      </div>
    </form>
  );
}
