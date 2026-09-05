import Link from "next/link";
import { notFound } from "next/navigation";

import { CricutOrderProgress } from "@/components/cricut/cricut-order-progress";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  cricutFontFamily,
  summarizeCricutCustomization,
} from "@/config/cricut-customization";
import {
  CRICUT_ORDER_UPDATE_STATUSES,
  CRICUT_ORDER_STATUS_LABELS,
  formatShopPrice,
} from "@/config/cricut-shop";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listActiveClubMembers } from "@/lib/command-center-permissions";
import {
  assignCricutOrderAction,
  updateCricutOrderStatusAction,
} from "@/features/cricut-shop/actions";
import {
  canManageCricutShop,
  canUpdateCricutOrder,
  getCricutOrder,
  getCricutOrganization,
} from "@/services/cricut-shop-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CricutOrderDetailPage({ params }: PageProps) {
  const user = await requireCompleteProfile();
  const { id } = await params;
  const [order, org] = await Promise.all([
    getCricutOrder(id),
    getCricutOrganization(),
  ]);

  if (!order) {
    notFound();
  }

  const isBuyer = order.buyerId === user.id;
  const canManage = org
    ? await canManageCricutShop(user.id, user.role, org.id)
    : false;
  const canUpdate = org
    ? await canUpdateCricutOrder(user.id, user.role, org.id, order)
    : false;

  if (!isBuyer && !canUpdate) {
    notFound();
  }

  const members = org && canManage ? await listActiveClubMembers(org.id) : [];

  return (
    <ShellPage
      title={`Order ${order.id.slice(0, 8)}…`}
      description={order.statusLabel}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/cricut/orders">All orders</Link>}
        />
      }
    >
      <div className="mx-auto max-w-2xl space-y-8">
        <CricutOrderProgress status={order.status} />

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
          <h2 className="font-semibold">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.lines.map((line) => {
              const summary = summarizeCricutCustomization({
                sportSlug: line.sportSlug,
                printName: line.printName,
                fontKey: line.fontKey,
                hasDesign: Boolean(line.designImageUrl),
              });
              return (
                <li key={line.id} className="flex justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    {line.designImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.designImageUrl}
                        alt=""
                        className="size-12 rounded-md object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p>
                        {line.quantity}× {line.title}
                      </p>
                      {line.printName ? (
                        <p
                          className="truncate text-lg leading-none text-[#0A2342] dark:text-white"
                          style={{ fontFamily: cricutFontFamily(line.fontKey) }}
                        >
                          {line.printName}
                        </p>
                      ) : null}
                      {summary ? (
                        <p className="text-xs text-muted-foreground">{summary}</p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0">
                    {formatShopPrice(line.lineTotalCents)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-border pt-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatShopPrice(order.subtotalCents)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>
                {order.shippingCents === 0
                  ? "Free"
                  : formatShopPrice(order.shippingCents)}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatShopPrice(order.totalCents)}</span>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-2 text-sm">
          <h2 className="font-semibold">Order details</h2>
          <p>
            <span className="text-muted-foreground">Contact: </span>
            {order.contactName ?? order.buyerName}
            {order.contactEmail ? ` · ${order.contactEmail}` : ""}
            {order.contactPhone ? ` · ${order.contactPhone}` : ""}
          </p>
          <p>
            <span className="text-muted-foreground">Fulfillment: </span>
            {order.fulfillment === "PICKUP" ? "Pickup at Madonna" : "Ship"}
          </p>
          {order.fulfillment === "SHIP" ? (
            <p className="whitespace-pre-wrap">
              {[
                order.shipName,
                order.shipLine1,
                order.shipLine2,
                [order.shipCity, order.shipState, order.shipPostal]
                  .filter(Boolean)
                  .join(", "),
              ]
                .filter(Boolean)
                .join("\n")}
            </p>
          ) : null}
          {order.notes ? (
            <p>
              <span className="text-muted-foreground">Pickup/ship notes: </span>
              {order.notes}
            </p>
          ) : null}
          {order.customizationNotes ? (
            <p>
              <span className="text-muted-foreground">Customization: </span>
              {order.customizationNotes}
            </p>
          ) : null}
          {order.assignedToName ? (
            <p>
              <span className="text-muted-foreground">Assigned to: </span>
              {order.assignedToName}
            </p>
          ) : null}
        </section>

        {canUpdate ? (
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="font-semibold">Update status</h2>
            <form action={updateCricutOrderStatusAction} className="flex flex-wrap gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <select
                name="status"
                defaultValue={
                  order.status === "CONFIRMED"
                    ? "IN_PRODUCTION"
                    : order.status === "FULFILLED"
                      ? "COMPLETED"
                      : order.status
                }
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {CRICUT_ORDER_UPDATE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {CRICUT_ORDER_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm">
                Save status
              </Button>
            </form>

            {canManage ? (
              <form action={assignCricutOrderAction} className="space-y-2">
                <input type="hidden" name="orderId" value={order.id} />
                <label className="grid gap-1 text-sm">
                  <span className="font-medium">Assign crew member</span>
                  <select
                    name="assigneeId"
                    defaultValue={order.assignedToId ?? ""}
                    className="rounded-md border border-border bg-background px-3 py-2"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.displayName}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" size="sm" variant="outline">
                  Save assignment
                </Button>
              </form>
            ) : null}
          </section>
        ) : null}
      </div>
    </ShellPage>
  );
}
