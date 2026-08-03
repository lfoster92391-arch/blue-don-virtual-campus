import Link from "next/link";
import { Hammer, ArrowLeft } from "lucide-react";

import { PassportChecklist } from "@/components/passports/passport-checklist";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  TRADE_PASSPORT_CATEGORY_LABELS,
  TRADE_PASSPORT_ITEMS,
  TRADE_PASSPORT_TAGLINE,
} from "@/config/trade-passport";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getPassportDashboard } from "@/services/passport-progress-service";

export default async function TradePassportPage() {
  const user = await requireCompleteProfile();
  const dashboard = await getPassportDashboard(
    user.id,
    "TRADE",
    TRADE_PASSPORT_ITEMS.map((item) => item.id),
  );

  const progressMap = new Map(dashboard.items.map((item) => [item.id, item.completed]));

  const items = TRADE_PASSPORT_ITEMS.map((item) => ({
    ...item,
    categoryLabel: TRADE_PASSPORT_CATEGORY_LABELS[item.category],
    completed: progressMap.get(item.id) ?? false,
  }));

  return (
    <ShellPage
      title="Trade Passport"
      description="Track your skilled-trade readiness — safety, training, credentials, and employer connections."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/pathways">
              <ArrowLeft className="size-3.5" />
              Future Center
            </Link>
          }
        />
      }
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Hammer className="size-4 text-[#D4A017]" />
        <span>W19 · Graduate Impact & Pathways</span>
      </div>

      <PassportChecklist
        passportType="TRADE"
        title="Trade Passport"
        tagline={TRADE_PASSPORT_TAGLINE}
        items={items}
        percentComplete={dashboard.percentComplete}
        completedCount={dashboard.completedCount}
        totalCount={dashboard.totalCount}
      />
    </ShellPage>
  );
}
