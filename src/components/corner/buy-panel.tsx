"use client";

import { useState } from "react";
import {
  Banknote,
  Check,
  Coins,
  CreditCard,
  Smartphone,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CORNER_CARD_CHECKOUT_URL,
  formatPrice,
  getPaymentMethodMeta,
  type CornerPaymentConfig,
  type CornerPaymentMethodId,
} from "@/config/corner-store";

const METHOD_ICONS: Record<CornerPaymentMethodId, React.ComponentType<{ className?: string }>> = {
  cash: Banknote,
  venmo: Smartphone,
  cashapp: Smartphone,
  zelle: Smartphone,
  card: CreditCard,
  points: Coins,
};

type BuyPanelProps = {
  itemTitle: string;
  priceCents: number;
  payment: CornerPaymentConfig;
  sellerName: string;
  isSold: boolean;
};

export function BuyPanel({
  itemTitle,
  priceCents,
  payment,
  sellerName,
  isSold,
}: BuyPanelProps) {
  const [started, setStarted] = useState(false);
  const methods: CornerPaymentMethodId[] =
    payment.methods.length > 0 ? payment.methods : ["cash"];

  if (isSold) {
    return (
      <div className="rounded-xl border border-border bg-muted/40 p-4 text-center">
        <p className="font-medium text-foreground">This item has been sold</p>
        <p className="text-sm text-muted-foreground">
          Browse the corner for more from Madonna students and clubs.
        </p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="space-y-3">
        <Button className="w-full" size="lg" onClick={() => setStarted(true)}>
          <Wallet className="size-4" />
          Buy · {formatPrice(priceCents)}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          {methods.length} payment option{methods.length === 1 ? "" : "s"} · arranged
          directly with {sellerName}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Choose how to pay</p>
        <span className="text-lg font-bold text-[#0A2342] dark:text-white">
          {formatPrice(priceCents)}
        </span>
      </div>

      <ul className="space-y-2">
        {methods.map((methodId) => {
          const meta = getPaymentMethodMeta(methodId);
          if (!meta) {
            return null;
          }
          const Icon = METHOD_ICONS[methodId] ?? Wallet;
          const handle = payment.handles?.[methodId];
          const cardLink = methodId === "card" ? CORNER_CARD_CHECKOUT_URL : null;

          return (
            <li
              key={methodId}
              className="rounded-lg border border-border p-3"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] dark:bg-white/10 dark:text-white">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {meta.label}
                    {meta.comingSoon ? (
                      <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                        Coming soon
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">{meta.blurb}</p>
                  {handle ? (
                    <p className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-sm font-medium text-foreground">
                      {handle}
                    </p>
                  ) : null}
                  {cardLink ? (
                    <Button
                      className="mt-2"
                      size="sm"
                      nativeButton={false}
                      render={
                        <a href={cardLink} target="_blank" rel="noopener noreferrer">
                          Pay by card
                        </a>
                      }
                    />
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {payment.note ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Seller note: </span>
          {payment.note}
        </div>
      ) : null}

      <div className="flex items-start gap-2 rounded-lg bg-[#2F80ED]/5 p-3 text-sm text-muted-foreground">
        <Check className="mt-0.5 size-4 shrink-0 text-[#2F80ED]" />
        <span>
          Message {sellerName} on campus to arrange “{itemTitle}”. Blue Don Corner
          connects buyers and sellers — payment happens directly between you.
        </span>
      </div>
    </div>
  );
}
