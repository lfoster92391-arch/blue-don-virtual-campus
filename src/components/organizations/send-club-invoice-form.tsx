"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import {
  sendOutgoingInvoiceAction,
  type ClubInvoiceActionState,
} from "@/features/club-invoices/actions";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";

const initialState: ClubInvoiceActionState = {};

export function SendClubInvoiceForm({
  organizationId,
  organizationSlug,
  organizationName,
  members,
}: {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  members: { userId: string; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    sendOutgoingInvoiceAction,
    initialState,
  );

  return (
    <DashboardCard
      title="Create and send an invoice"
      description={`${organizationName} officers and admins can bill a member or email an invoice. Paid shop orders will post to this club’s financials when checkout is live.`}
      icon={<Send className="size-5" />}
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="organizationSlug" value={organizationSlug} />
        <input type="hidden" name="organizationName" value={organizationName} />

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Club member</span>
            <select
              name="recipientUserId"
              className="rounded-md border border-border bg-background px-3 py-2"
              defaultValue=""
            >
              <option value="">Select a member…</option>
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Or email</span>
            <input
              name="recipientEmail"
              type="email"
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="family@example.com"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Amount (USD)</span>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="25.00"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">What is this for?</span>
            <input
              name="description"
              required
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder="Spirit shirt pre-order, materials…"
            />
          </label>
        </div>

        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-[#2E8B57]">{state.success}</p>
        ) : null}
        {state.mailto ? (
          <Button
            variant="action"
            size="lg"
            nativeButton={false}
            render={<a href={state.mailto}>Open email to send</a>}
          />
        ) : null}

        <Button type="submit" variant="action" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Send invoice"}
        </Button>
      </form>
    </DashboardCard>
  );
}
