import Link from "next/link";
import { ArrowRight, Monitor, Package, Server } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  DEPARTMENT_WORKSPACES,
  OPS_METRICS,
  OPS_QUEUE,
} from "@/config/campus-operations";
import { requireCompleteProfile } from "@/lib/auth/session";

export default async function OperationsPage() {
  await requireCompleteProfile();

  return (
    <ShellPage
      title="Campus Operations"
      description="IT Operations flagship — department workspaces, queues, and campus health metrics."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/equipment">
                <Package className="size-3.5" />
                Equipment
              </Link>
            }
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/service-desk">
                Service Desk
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {OPS_METRICS.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-semibold">{metric.value}</p>
            {metric.trend ? (
              <p className="text-xs text-muted-foreground capitalize">{metric.trend}</p>
            ) : null}
          </div>
        ))}
      </div>

      <DashboardCard
        title="Operations Queue"
        description="Active items across IT, facilities, and accounts."
        icon={<Server className="size-5" />}
        status={{ label: "Campus Operations", variant: "info" }}
      >
        <ul className="space-y-2">
          {OPS_QUEUE.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.category.toUpperCase()}
                  {item.assignee ? ` · ${item.assignee}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.priority === "urgent"
                      ? "bg-red-500/10 text-red-600"
                      : item.priority === "high"
                        ? "bg-[#D4A017]/10 text-[#D4A017]"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.priority}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">{item.ageLabel}</p>
              </div>
            </li>
          ))}
        </ul>
      </DashboardCard>

      <DashboardCard
        title="Department Workspaces"
        description="Focused views for each campus operations team."
        icon={<Monitor className="size-5" />}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {DEPARTMENT_WORKSPACES.map((ws) => (
            <Link
              key={ws.id}
              href={ws.href}
              className="rounded-lg border border-border px-4 py-3 transition-colors hover:border-[#2F80ED]/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{ws.name}</p>
                  <p className="text-sm text-muted-foreground">{ws.description}</p>
                </div>
                <span className="rounded-full bg-[#2F80ED]/10 px-2 py-0.5 text-xs font-medium text-[#2F80ED]">
                  {ws.openItems} open
                </span>
              </div>
            </Link>
          ))}
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
