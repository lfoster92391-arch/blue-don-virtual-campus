import Link from "next/link";
import { Headphones, Mail, Monitor, Plus, Users, Wrench } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { ItHelpDeskPanel } from "@/components/service-desk/it-help-desk-panel";
import { Button } from "@/components/ui/button";
import { buildItHelpDeskMailto } from "@/config/it-help-desk";
import { canCreateTickets, canManageTickets, canManageUsers } from "@/config/roles";
import { enforceFocusClubAccess } from "@/lib/auth/focus-club-guard";
import { resolveAccessIdentity } from "@/lib/auth/preview";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/mvp/constants";
import { listTicketsForUser } from "@/services/ticket-service";

const IT_CATEGORIES = ["TECHNICAL", "ACCOUNT"] as const;
const FACILITIES_CATEGORIES = ["FACILITIES"] as const;

export default async function ServiceDeskPage() {
  const user = await requireCompleteProfile();
  const identity = await resolveAccessIdentity(user);
  await enforceFocusClubAccess({
    userId: user.id,
    role: identity.navRole,
    clubSlug: "it-club",
    options: {
      forceScoped: identity.isPreviewing,
      membershipUserId: identity.membershipUserId,
      forcedMembershipSlugs: identity.forcedMembershipSlugs,
    },
  });
  const tickets = await listTicketsForUser(user.id, {
    includeAll: canManageTickets(user.role),
  });
  const openCount = tickets.filter((t) =>
    ["OPEN", "IN_PROGRESS"].includes(t.status),
  ).length;
  const itTickets = tickets.filter((t) =>
    IT_CATEGORIES.includes(t.category as (typeof IT_CATEGORIES)[number]),
  );
  const facilitiesTickets = tickets.filter((t) =>
    FACILITIES_CATEGORIES.includes(t.category as (typeof FACILITIES_CATEGORIES)[number]),
  );
  const otherTickets = tickets.filter(
    (t) =>
      !IT_CATEGORIES.includes(t.category as (typeof IT_CATEGORIES)[number]) &&
      !FACILITIES_CATEGORIES.includes(t.category as (typeof FACILITIES_CATEGORIES)[number]),
  );
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
                  Create logins, reset passwords, and update roles for students and staff.
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

      <ItHelpDeskPanel id="it-help-desk" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Open tickets</p>
          <p className="text-2xl font-semibold">{openCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">IT & Accounts</p>
          <p className="text-2xl font-semibold">{itTickets.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Facilities</p>
          <p className="text-2xl font-semibold">{facilitiesTickets.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="IT Requests"
          description="Email the help desk for new IT issues. Staff can also track in-app tickets below."
          icon={<Monitor className="size-5" />}
          status={{ label: "Spiceworks", variant: "info" }}
          actions={
            <Button
              size="sm"
              nativeButton={false}
              render={
                <a href={buildItHelpDeskMailto()}>
                  <Mail className="size-3.5" />
                  Submit IT Request
                </a>
              }
            />
          }
        >
          <TicketList tickets={itTickets} canManage={canManageTickets(user.role)} />
        </DashboardCard>

        <DashboardCard
          title="Facilities Requests"
          description="Maintenance, room issues, and physical campus needs."
          icon={<Wrench className="size-5" />}
        >
          <TicketList tickets={facilitiesTickets} canManage={canManageTickets(user.role)} />
        </DashboardCard>
      </div>

      {otherTickets.length > 0 ? (
        <DashboardCard title="Other Requests" description="Academic and general support.">
          <TicketList tickets={otherTickets} canManage={canManageTickets(user.role)} />
        </DashboardCard>
      ) : null}

      <div className="flex justify-end">
        {canCreateTickets(user.role) ? (
          <Button nativeButton={false} render={<Link href="/service-desk/new"><Plus className="size-4" /> New ticket</Link>} />
        ) : null}
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="font-medium">No support tickets yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit a ticket when you need help from campus support.
          </p>
          {canCreateTickets(user.role) ? (
            <Button className="mt-4" nativeButton={false} render={<Link href="/service-desk/new">Create ticket</Link>} />
          ) : null}
        </div>
      ) : null}
    </ShellPage>
  );
}

function TicketList({
  tickets,
  canManage,
}: {
  tickets: Awaited<ReturnType<typeof listTicketsForUser>>;
  canManage: boolean;
}) {
  if (tickets.length === 0) {
    return <p className="text-sm text-muted-foreground">No tickets in this category.</p>;
  }

  return (
    <ul className="space-y-2">
      {tickets.map((ticket) => (
        <li key={ticket.id}>
          <Link
            href={`/service-desk/${ticket.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:border-[#2F80ED]/40"
          >
            <div className="flex items-start gap-2">
              <Headphones className="mt-0.5 size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{ticket.subject}</p>
                <p className="text-xs text-muted-foreground">
                  {TICKET_CATEGORY_LABELS[ticket.category]}
                  {canManage ? ` · ${ticket.requesterName}` : ""}
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p>{TICKET_STATUS_LABELS[ticket.status]}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
