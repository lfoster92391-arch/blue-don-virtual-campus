import Link from "next/link";

import { CricutOrderProgress } from "@/components/cricut/cricut-order-progress";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { formatShopPrice } from "@/config/cricut-shop";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canCreateCricutListing,
  canManageCricutShop,
  getCricutOrganization,
  listCricutOrdersForBuyer,
  listCricutOrdersForCrew,
} from "@/services/cricut-shop-service";

export default async function CricutOrdersPage() {
  const user = await requireCompleteProfile();
  const org = await getCricutOrganization();
  const canCrew = org
    ? (await canCreateCricutListing(user.id, user.role, org.id)) ||
      (await canManageCricutShop(user.id, user.role, org.id))
    : false;

  const [myOrders, crewOrders] = await Promise.all([
    listCricutOrdersForBuyer(user.id),
    canCrew ? listCricutOrdersForCrew() : Promise.resolve([]),
  ]);

  return (
    <ShellPage
      title="Cricut orders"
      description="Track production progress — Order sent → In production → Ready for pickup → Completed."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Shop</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut">Hub</Link>}
          />
        </div>
      }
    >
      <div className="space-y-10">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Your orders</h2>
          {myOrders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
              No orders yet.{" "}
              <Link href="/cricut/shop" className="text-[#DB2777] underline">
                Browse the shop
              </Link>
            </p>
          ) : (
            <ul className="space-y-4">
              {myOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">
                        {order.lines.map((l) => l.title).join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatShopPrice(order.totalCents)} · {order.statusLabel}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      nativeButton={false}
                      render={
                        <Link href={`/cricut/orders/${order.id}`}>
                          Track order
                        </Link>
                      }
                    />
                  </div>
                  <CricutOrderProgress
                    status={order.status}
                    className="mt-4"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        {canCrew ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Production desk</h2>
            <p className="text-sm text-muted-foreground">
              Officers and members update status for open orders.
            </p>
            {crewOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders in queue.</p>
            ) : (
              <ul className="space-y-3">
                {crewOrders.map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">
                        {order.contactName ?? order.buyerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.lines.map((l) => `${l.quantity}× ${l.title}`).join(", ")}{" "}
                        · {order.statusLabel}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      nativeButton={false}
                      render={
                        <Link href={`/cricut/orders/${order.id}`}>Open</Link>
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </ShellPage>
  );
}
