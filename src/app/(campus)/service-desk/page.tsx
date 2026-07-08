import Link from "next/link";
import { Headphones, Plus, Users } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/mvp/constants";
import { canCreateTickets, canManageTickets, canManageUsers } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listTicketsForUser } from "@/services/ticket-service";

export default async function ServiceDeskPage() {
  const user = await requireCompleteProfile();
  const tickets = await listTicketsForUser(user.id, {
    includeAll: canManageTickets(user.role),
  });
  const openCount = tickets.filter((t) =>
    ["OPEN", "IN_PROGRESS"].includes(t.status),
  ).length;
  const canManageAccounts = canManageUsers(user.role);

  return (
    <ShellPage
      title="Service Desk"
      description="Get help with technology, academics, facilities, and campus accounts."
    >
      {canManageAccounts ? (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Users className="mt-0.5 size-5 text-[#0A2342] dark:text-white" />
              <div>
                <p className="font-medium text-foreground">Account management</p>
                <p className="text-sm text-muted-foreground">
                  Create logins, reset passwords, and update roles for students and
                  staff.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/service-desk/users">Manage accounts</Link>}
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Open tickets</p>
            <p className="text-2xl font-semibold">{openCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{tickets.length}</p>
          </div>
        </div>
        {canCreateTickets(user.role) ? (
          <Button nativeButton={false} render={<Link href="/service-desk/new"><Plus className="size-4" /> New ticket</Link>} />
        ) : null}
      </div>

      {tickets.length > 0 ? (
        <ul className="mt-8 space-y-3">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                href={`/service-desk/${ticket.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
              >
                <div className="flex items-start gap-3">
                  <Headphones className="mt-0.5 size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {TICKET_CATEGORY_LABELS[ticket.category]}
                      {canManageTickets(user.role)
                        ? ` · ${ticket.requesterName}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  <p>{TICKET_STATUS_LABELS[ticket.status]}</p>
                  <p className="text-muted-foreground">{ticket.commentCount} replies</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No support tickets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit a ticket when you need help from campus support.
          </p>
          {canCreateTickets(user.role) ? (
            <Button className="mt-4" nativeButton={false} render={<Link href="/service-desk/new">Create ticket</Link>} />
          ) : null}
        </div>
      )}
    </ShellPage>
  );
}
