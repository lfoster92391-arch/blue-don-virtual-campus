import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Lightbulb,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CricutProductionCounter } from "@/components/cricut/cricut-production-counter";
import { CricutWishlistSettingsForm } from "@/components/cricut/cricut-wishlist-settings-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { CRICUT_CLUB_SLUG, formatShopPrice } from "@/config/cricut-shop";
import { formatCents } from "@/lib/club-finance";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listCricutDesigns } from "@/services/cricut-design-service";
import { listCricutProjectIdeas } from "@/services/cricut-project-service";
import { getClubFinanceSnapshot } from "@/services/club-finance-service";
import {
  canManageCricutShop,
  getCricutAmazonWishlistUrl,
  getCricutOrganization,
  getCricutProductionStats,
  listCricutShopItems,
} from "@/services/cricut-shop-service";

export default async function CricutHubPage() {
  const user = await requireCompleteProfile();
  const [org, stats, wishlistUrl, items, designs, projectIdeas] =
    await Promise.all([
      getCricutOrganization(),
      getCricutProductionStats(),
      getCricutAmazonWishlistUrl(),
      listCricutShopItems(),
      listCricutDesigns(),
      listCricutProjectIdeas(),
    ]);

  const finance = org ? await getClubFinanceSnapshot(org.id) : null;
  const canManage = org
    ? await canManageCricutShop(user.id, user.role, org.id)
    : false;
  const activeFundraisers =
    finance?.fundraisers.filter((f) => f.status === "ACTIVE") ?? [];
  const sellable = items.filter((i) => i.availableToSell).slice(0, 3);
  const pendingDesigns = designs.filter((d) => d.status === "PENDING").length;
  const projectCount = projectIdeas.length;
  const featuredProjects = projectIdeas.slice(0, 3);

  return (
    <ShellPage
      title="Cricut Club"
      description="Maker production at Madonna — shop, custom designs, and fundraising."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Shop</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/organizations/${CRICUT_CLUB_SLUG}`}>Club home</Link>
            }
          />
        </div>
      }
    >
      <div className="space-y-8">
        <CricutProductionCounter stats={stats} />
        <CricutAmazonWishlistBanner url={wishlistUrl} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            href="/cricut/projects"
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#DB2777]/40"
          >
            <Sparkles className="size-5 text-[#DB2777]" />
            <p className="mt-3 font-semibold">Easy cheap creations</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Dollar-store projects with supplies, steps, cost, and sell price.
              {projectCount > 0 ? ` ${projectCount} to pick from.` : ""}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#DB2777]">
              Make something <ArrowRight className="size-3.5" />
            </span>
          </Link>
          <Link
            href="/cricut/shop"
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#DB2777]/40"
          >
            <ShoppingBag className="size-5 text-[#DB2777]" />
            <p className="mt-3 font-semibold">Shop catalog</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse handmade goods — order when marked for sale.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#DB2777]">
              Open shop <ArrowRight className="size-3.5" />
            </span>
          </Link>
          <Link
            href="/cricut/designs"
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#DB2777]/40"
          >
            <Lightbulb className="size-5 text-[#DB2777]" />
            <p className="mt-3 font-semibold">Design hub</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Submit an idea you want Cricut Club to make.
              {pendingDesigns > 0 ? ` ${pendingDesigns} pending review.` : ""}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#DB2777]">
              Submit idea <ArrowRight className="size-3.5" />
            </span>
          </Link>
          <Link
            href="/cricut/orders"
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-[#DB2777]/40"
          >
            <ClipboardList className="size-5 text-[#DB2777]" />
            <p className="mt-3 font-semibold">Orders</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Track your purchases or run the production desk.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#DB2777]">
              View orders <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <DashboardCard
            title="Cheap builds to try"
            description="Dollar-store projects — tap one to see supplies, steps, and cost."
            actions={
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={<Link href="/cricut/projects">All projects</Link>}
              />
            }
          >
            <ul className="grid gap-3 sm:grid-cols-3">
              {featuredProjects.map((idea) => (
                <li key={idea.id}>
                  <Link
                    href={`/cricut/projects/${idea.id}`}
                    className="block rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#DB2777]/40"
                  >
                    <p className="font-medium line-clamp-1">{idea.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Costs {formatShopPrice(idea.estimatedCostCents)} · sells
                      for{" "}
                      <span className="text-[#DB2777]">
                        {formatShopPrice(idea.suggestedSellPriceCents)}
                      </span>
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardCard>
        ) : null}

        {sellable.length > 0 ? (
          <DashboardCard
            title="Available now"
            description="Items ready to order from the Cricut shop."
          >
            <ul className="grid gap-3 sm:grid-cols-3">
              {sellable.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/cricut/shop/${item.id}`}
                    className="block rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#DB2777]/40"
                  >
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <p className="text-sm text-[#DB2777]">
                      {formatShopPrice(item.priceCents)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </DashboardCard>
        ) : null}

        <DashboardCard
          title="Fundraising"
          description="Help Cricut Club hit its production goals."
        >
          {activeFundraisers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active fundraisers yet. Officers can add goals under club
              Finances.
            </p>
          ) : (
            <ul className="space-y-4">
              {activeFundraisers.map((f) => {
                const pct =
                  f.goalCents > 0
                    ? Math.min(
                        100,
                        Math.round((f.raisedCents / f.goalCents) * 100),
                      )
                    : 0;
                return (
                  <li key={f.id} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium">{f.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCents(f.raisedCents)} / {formatCents(f.goalCents)}
                      </p>
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
          )}
          {canManage ? (
            <Button
              className="mt-4"
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href={`/organizations/${CRICUT_CLUB_SLUG}?tab=finances`}
                >
                  Manage fundraisers
                </Link>
              }
            />
          ) : null}
        </DashboardCard>

        {canManage ? (
          <DashboardCard
            title="Club settings"
            description="President / VP — Amazon wishlist for donations."
          >
            <CricutWishlistSettingsForm currentUrl={wishlistUrl} />
          </DashboardCard>
        ) : null}
      </div>
    </ShellPage>
  );
}
