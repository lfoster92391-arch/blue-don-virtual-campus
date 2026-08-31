import Link from "next/link";

import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { FUEL_THE_DONS_NAME } from "@/config/fuel-the-dons";
import { requireCampusAccess } from "@/lib/auth/session";

export const metadata = {
  title: "Lunch",
  description: `The Madonna lunch menu and ordering live on ${FUEL_THE_DONS_NAME}.`,
};

/**
 * Retired surface. Campus lunch ordering, kitchen counts, dietary review, and
 * cafeteria balances were removed in favour of FuelTheDons; this page keeps the
 * old URL working and points people at the real one.
 */
export default async function LunchPage() {
  await requireCampusAccess();

  return (
    <ShellPage
      title="Lunch"
      description={`Madonna lunch is on ${FUEL_THE_DONS_NAME}. Menus, orders, and payments are all handled there — this app no longer takes lunch orders.`}
      actions={
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/madonna">Madonna Hub</Link>}
        />
      }
    >
      <FuelTheDonsRow />

      <p className="text-sm text-muted-foreground">
        Nothing you saved here before is used to feed anyone — the kitchen works
        from {FUEL_THE_DONS_NAME}. Questions about a charge or a food allergy go
        to the school office directly.
      </p>
    </ShellPage>
  );
}
