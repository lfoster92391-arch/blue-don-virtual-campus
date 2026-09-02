"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Minus, Plus, Receipt, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  POS_MAX_LINE_QUANTITY,
  POS_TENDERS,
  formatPosMoney,
  parsePosAmountToCents,
  type PosTenderId,
} from "@/config/pos";
import {
  lockRegisterAction,
  recordRegisterSaleAction,
  type PosSaleState,
} from "@/features/pos/actions";

export type RegisterItem = {
  id: string;
  title: string;
  priceCents: number;
};

export type RegisterSale = {
  id: string;
  amountCents: number;
  memo: string | null;
  cashierName: string;
  when: string;
};

type CricutRegisterProps = {
  items: RegisterItem[];
  recentSales: RegisterSale[];
  takenTodayCents: number;
  balanceCents: number;
};

const initialState: PosSaleState = {};

export function CricutRegister({
  items,
  recentSales,
  takenTodayCents,
  balanceCents,
}: CricutRegisterProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    recordRegisterSaleAction,
    initialState,
  );

  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [customLabel, setCustomLabel] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [tender, setTender] = useState<PosTenderId>("CASH");
  const [note, setNote] = useState("");
  /**
   * The recorded sale the cashier has already cleared. A ticket stays on screen
   * until they start the next one, so a misread total is still visible after
   * the money is in the ledger.
   */
  const [clearedSaleId, setClearedSaleId] = useState<string | null>(null);

  const showReceipt = Boolean(state.saleId && state.saleId !== clearedSaleId);

  function startNextTicket(seed: Record<string, number> = {}) {
    setClearedSaleId(state.saleId ?? null);
    setQuantities(seed);
    setCustomLabel("");
    setCustomAmount("");
    setNote("");
  }

  const byId = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  const ticket = Object.entries(quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([itemId, quantity]) => ({ item: byId.get(itemId), quantity }))
    .filter((line): line is { item: RegisterItem; quantity: number } =>
      Boolean(line.item),
    );

  const customCents = customAmount ? parsePosAmountToCents(customAmount) : null;
  const customInvalid = customAmount.trim().length > 0 && customCents === null;
  const totalCents =
    ticket.reduce((sum, line) => sum + line.item.priceCents * line.quantity, 0) +
    (customCents ?? 0);

  function bump(itemId: string, delta: number) {
    // Ringing anything while the last receipt is up starts the next ticket.
    if (showReceipt) {
      startNextTicket(delta > 0 ? { [itemId]: 1 } : {});
      return;
    }

    setQuantities((current) => {
      const next = Math.min(
        POS_MAX_LINE_QUANTITY,
        Math.max(0, (current[itemId] ?? 0) + delta),
      );
      const copy = { ...current };
      if (next === 0) {
        delete copy[itemId];
      } else {
        copy[itemId] = next;
      }
      return copy;
    });
  }

  const linesPayload = JSON.stringify(
    ticket.map((line) => ({ itemId: line.item.id, quantity: line.quantity })),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Rung up today" value={formatPosMoney(takenTodayCents)} />
        <Stat label="Club balance" value={formatPosMoney(balanceCents)} />
        <Stat label="On this ticket" value={formatPosMoney(totalCents)} accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <DashboardCard
          title="Catalog"
          description="Tap an item to add it to the ticket."
        >
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is marked for sale yet. Publish items in the Cricut shop,
              or ring the sale as a one-off amount on the ticket.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => {
                const quantity = quantities[item.id] ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => bump(item.id, 1)}
                    className={`rounded-xl border p-4 text-left transition-colors ${
                      quantity > 0
                        ? "border-[#DB2777] bg-[#DB2777]/5"
                        : "border-border bg-card hover:border-[#DB2777]/40"
                    }`}
                  >
                    <p className="font-medium line-clamp-2">{item.title}</p>
                    <p className="mt-1 text-sm text-[#DB2777]">
                      {formatPosMoney(item.priceCents)}
                    </p>
                    {quantity > 0 ? (
                      <p className="mt-2 text-xs font-medium text-muted-foreground">
                        {quantity} on ticket
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </DashboardCard>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="lines" value={linesPayload} />
          <input type="hidden" name="tender" value={tender} />

          <DashboardCard
            title="Ticket"
            description="Money lands in the Cricut Club ledger."
            icon={<Receipt className="size-4" />}
          >
            {ticket.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing rung up yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {ticket.map((line) => (
                  <li
                    key={line.item.id}
                    className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {line.item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatPosMoney(line.item.priceCents)} each
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      aria-label={`One fewer ${line.item.title}`}
                      onClick={() => bump(line.item.id, -1)}
                    >
                      <Minus />
                    </Button>
                    <span className="w-6 text-center text-sm font-semibold tabular-nums">
                      {line.quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-xs"
                      aria-label={`One more ${line.item.title}`}
                      onClick={() => bump(line.item.id, 1)}
                    >
                      <Plus />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Remove ${line.item.title}`}
                      onClick={() => bump(line.item.id, -line.quantity)}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid gap-2 rounded-lg border border-dashed border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                One-off item
              </p>
              <input
                name="customLabel"
                value={customLabel}
                onChange={(event) => setCustomLabel(event.target.value)}
                maxLength={60}
                placeholder="What was it?"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <input
                name="customAmount"
                value={customAmount}
                onChange={(event) => setCustomAmount(event.target.value)}
                inputMode="decimal"
                placeholder="Amount, like 5.00"
                aria-invalid={customInvalid || undefined}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              {customInvalid ? (
                <p className="text-xs text-destructive">
                  Enter dollars, like 5.00.
                </p>
              ) : null}
            </div>

            <fieldset className="mt-4">
              <legend className="text-xs font-medium text-muted-foreground">
                Paid with
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {POS_TENDERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    title={option.hint}
                    onClick={() => setTender(option.id)}
                    aria-pressed={tender === option.id}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                      tender === option.id
                        ? "border-[#DB2777] bg-[#DB2777]/10 font-medium text-[#DB2777]"
                        : "border-border hover:border-[#DB2777]/40"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <input
              name="note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={80}
              placeholder="Note for the ledger (optional)"
              className="mt-4 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold text-[#0A2342] dark:text-white">
                {formatPosMoney(totalCents)}
              </span>
            </div>

            {showReceipt ? (
              <Button
                type="button"
                size="lg"
                className="mt-4 w-full"
                onClick={() => startNextTicket()}
              >
                Start next ticket
              </Button>
            ) : (
              <Button
                type="submit"
                size="lg"
                className="mt-4 w-full"
                disabled={pending || totalCents <= 0 || customInvalid}
              >
                {pending ? "Recording…" : "Record sale"}
              </Button>
            )}

            {state.error ? (
              <p role="alert" className="mt-3 text-sm text-destructive">
                {state.error}
                {state.locked ? (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => router.refresh()}
                  >
                    Enter PIN
                  </Button>
                ) : null}
              </p>
            ) : null}
            {showReceipt ? (
              <p className="mt-3 text-sm text-[#2E8B57]">{state.success}</p>
            ) : null}
          </DashboardCard>
        </form>
      </div>

      <DashboardCard
        title="Recent register sales"
        description="The last few tickets, straight off the club ledger."
        actions={
          <form action={lockRegisterAction}>
            <Button type="submit" variant="outline" size="sm">
              <Lock />
              Lock register
            </Button>
          </form>
        }
      >
        {recentSales.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No sales rung on this register yet.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {recentSales.map((sale) => (
              <li
                key={sale.id}
                className="flex items-start justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm">{sale.memo}</p>
                  <p className="text-xs text-muted-foreground">
                    {sale.when} · {sale.cashierName}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {formatPosMoney(sale.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-bold ${
          accent ? "text-[#DB2777]" : "text-[#0A2342] dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
