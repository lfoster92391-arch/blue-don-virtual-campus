import Link from "next/link";
import { Flag, ArrowLeft } from "lucide-react";

import { PassportChecklist } from "@/components/passports/passport-checklist";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  MILITARY_PASSPORT_CATEGORY_LABELS,
  MILITARY_PASSPORT_ITEMS,
  MILITARY_PASSPORT_TAGLINE,
} from "@/config/military-passport";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getPassportDashboard } from "@/services/passport-progress-service";

export default async function MilitaryPassportPage() {
  const user = await requireCompleteProfile();
  const dashboard = await getPassportDashboard(
    user.id,
    "MILITARY",
    MILITARY_PASSPORT_ITEMS.map((item) => item.id),
  );

  const progressMap = new Map(dashboard.items.map((item) => [item.id, item.completed]));

  const items = MILITARY_PASSPORT_ITEMS.map((item) => ({
    ...item,
    categoryLabel: MILITARY_PASSPORT_CATEGORY_LABELS[item.category],
    completed: progressMap.get(item.id) ?? false,
  }));

  return (
    <ShellPage
      title="Military Passport 🇺🇸"
      description="Prepare for service — ASVAB, fitness, ROTC, scholarships, and career pathways."
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
        <Flag className="size-4 text-[#D4A017]" />
        <span>W19 · Graduate Impact & Pathways</span>
      </div>

      <PassportChecklist
        passportType="MILITARY"
        title="Military Passport"
        tagline={MILITARY_PASSPORT_TAGLINE}
        items={items}
        percentComplete={dashboard.percentComplete}
        completedCount={dashboard.completedCount}
        totalCount={dashboard.totalCount}
      />
    </ShellPage>
  );
}
