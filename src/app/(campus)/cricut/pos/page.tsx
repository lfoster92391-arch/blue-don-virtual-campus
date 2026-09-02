import Link from "next/link";
import { redirect } from "next/navigation";

import { ShellPage } from "@/components/layout/shell-page";
import {
  CricutRegister,
  type RegisterSale,
} from "@/components/pos/cricut-register";
import { RegisterPinGate } from "@/components/pos/register-pin-gate";
import { Button } from "@/components/ui/button";
import { CAMPUS_WEATHER_LOCATION } from "@/config/campus-weather";
import { isPosMemo } from "@/config/pos";
import { requireCompleteProfile } from "@/lib/auth/session";
import { isRegisterUnlocked } from "@/lib/pos/lock";
import { getClubFinanceSnapshot } from "@/services/club-finance-service";
import {
  canManageCricutShop,
  getCricutOrganization,
  listCricutShopItems,
} from "@/services/cricut-shop-service";

export const metadata = {
  title: "Cashier",
  description: "Ring up Cricut Club sales at the table.",
};

const CAMPUS_TIME_ZONE = CAMPUS_WEATHER_LOCATION.timezone;

const saleTimeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIME_ZONE,
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const campusDayFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: CAMPUS_TIME_ZONE,
});

export default async function CricutRegisterPage() {
  const user = await requireCompleteProfile();
  const org = await getCricutOrganization();

  if (!org) {
    redirect("/cricut");
  }

  // Same officers who run the shop and the club books run the drawer.
  const canRunRegister = await canManageCricutShop(user.id, user.role, org.id);
  if (!canRunRegister) {
    redirect("/cricut");
  }

  const backToHub = (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      render={<Link href="/cricut">Production hub</Link>}
    />
  );

  if (!(await isRegisterUnlocked(user.id))) {
    return (
      <ShellPage
        title="Cashier"
        description="The Cricut Club register. Enter the cashier PIN to open it for your shift."
        actions={backToHub}
      >
        <RegisterPinGate
          cashierName={user.displayName?.trim() || user.firstName || "there"}
        />
      </ShellPage>
    );
  }

  const [items, finance] = await Promise.all([
    listCricutShopItems(),
    getClubFinanceSnapshot(org.id),
  ]);

  const registerEntries = (finance?.entries ?? []).filter(
    (entry) => entry.type === "DEPOSIT" && isPosMemo(entry.memo),
  );

  const today = campusDayFormat.format(new Date());
  const takenTodayCents = registerEntries
    .filter((entry) => campusDayFormat.format(entry.createdAt) === today)
    .reduce((sum, entry) => sum + entry.amountCents, 0);

  const recentSales: RegisterSale[] = registerEntries.slice(0, 8).map((entry) => ({
    id: entry.id,
    amountCents: entry.amountCents,
    memo: entry.memo,
    cashierName: entry.createdByName,
    when: saleTimeFormat.format(entry.createdAt),
  }));

  return (
    <ShellPage
      title="Cashier"
      description="Ring up in-person Cricut Club sales. Every ticket posts to the club ledger as a deposit."
      actions={backToHub}
    >
      <CricutRegister
        items={items
          .filter((item) => item.availableToSell)
          .map((item) => ({
            id: item.id,
            title: item.title,
            priceCents: item.priceCents,
          }))}
        recentSales={recentSales}
        takenTodayCents={takenTodayCents}
        balanceCents={finance?.balanceCents ?? 0}
      />
    </ShellPage>
  );
}
