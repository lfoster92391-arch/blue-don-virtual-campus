"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { POS_PIN_LENGTH } from "@/config/pos";
import {
  unlockRegisterAction,
  type PosUnlockState,
} from "@/features/pos/actions";

const initialState: PosUnlockState = {};

/**
 * The PIN pad in front of the register. The digits are checked on the server —
 * nothing here knows the PIN, so reading the bundle tells an onlooker nothing.
 */
export function RegisterPinGate({ cashierName }: { cashierName: string }) {
  const [state, unlock, pending] = useActionState(
    unlockRegisterAction,
    initialState,
  );
  const [pin, setPin] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  /** Clear the pad as it is sent, so a wrong PIN leaves an empty box to retype. */
  function submit(digits: string) {
    if (digits.length !== POS_PIN_LENGTH || pending) {
      return;
    }
    setPin("");
    inputRef.current?.focus();
    startTransition(() => unlock(digits));
  }

  function handleChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, POS_PIN_LENGTH);
    if (digits.length === POS_PIN_LENGTH) {
      submit(digits);
      return;
    }
    setPin(digits);
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#DB2777]/10 text-[#DB2777]">
          <Lock className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-[#0A2342] dark:text-white">
          Register locked
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hi {cashierName} — enter the {POS_PIN_LENGTH}-digit cashier PIN to open
          the drawer for this shift.
        </p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="sr-only">Cashier PIN</span>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={POS_PIN_LENGTH}
              value={pin}
              onChange={(event) => handleChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  submit(pin);
                }
              }}
              disabled={pending}
              aria-invalid={state.error ? true : undefined}
              className="w-full rounded-lg border border-border bg-background py-3 text-center text-2xl tracking-[0.6em] outline-none focus-visible:border-[#DB2777] disabled:opacity-60"
              placeholder="••••"
            />
          </label>

          <Button
            size="lg"
            className="w-full"
            onClick={() => submit(pin)}
            disabled={pending || pin.length !== POS_PIN_LENGTH}
          >
            {pending ? "Checking…" : "Open register"}
          </Button>
        </div>

        {state.error ? (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <p className="mt-4 text-xs text-muted-foreground">
          Stays open for eight hours on this device. Ask the club advisor if you
          need the PIN.
        </p>
      </div>
    </div>
  );
}
