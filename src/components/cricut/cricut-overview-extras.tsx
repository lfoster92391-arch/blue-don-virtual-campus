import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CricutProductionCounter } from "@/components/cricut/cricut-production-counter";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCents } from "@/lib/club-finance";
import { getClubFinanceSnapshot } from "@/services/club-finance-service";
import {
  getCricutAmazonWishlistUrl,
  getCricutOrganization,
  getCricutProductionStats,
} from "@/services/cricut-shop-service";

/** Server block for Cricut overview — counter, wishlist, fundraisers, quick links. */
export async function CricutOverviewExtras() {
  const [stats, wishlistUrl, org] = await Promise.all([
    getCricutProductionStats(),
    getCricutAmazonWishlistUrl(),
    getCricutOrganization(),
  ]);
  const finance = org ? await getClubFinanceSnapshot(org.id) : null;
  const activeFundraisers =
    finance?.fundraisers.filter((f) => f.status === "ACTIVE") ?? [];

  return (
    <div className="space-y-6">
      <CricutProductionCounter stats={stats} />
      <CricutAmazonWishlistBanner url={wishlistUrl} />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          nativeButton={false}
          render={<Link href="/cricut">Production hub</Link>}
        />
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/cricut/projects">Easy cheap creations</Link>}
        />
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/cricut/shop">Shop</Link>}
        />
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/cricut/designs">Design hub</Link>}
        />
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/cricut/orders">Orders</Link>}
        />
      </div>

      {activeFundraisers.length > 0 ? (
        <DashboardCard
          title="Fundraising"
          description="Active Cricut Club goals."
        >
          <ul className="space-y-3">
            {activeFundraisers.slice(0, 3).map((f) => {
              const pct =
                f.goalCents > 0
                  ? Math.min(
                      100,
                      Math.round((f.raisedCents / f.goalCents) * 100),
                    )
                  : 0;
              return (
                <li key={f.id} className="space-y-1.5">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-medium">{f.title}</span>
                    <span className="text-muted-foreground">
                      {formatCents(f.raisedCents)} / {formatCents(f.goalCents)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#DB2777]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
          <Link
            href="/cricut"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#DB2777]"
          >
            Open hub <ArrowRight className="size-3.5" />
          </Link>
        </DashboardCard>
      ) : null}
    </div>
  );
}
