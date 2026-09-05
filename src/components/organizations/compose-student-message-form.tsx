"use client";

import { useActionState } from "react";
import { Mail, Receipt } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  sendStudentMessageAction,
  type StudentMessageActionState,
} from "@/features/student-messages/actions";

const initialState: StudentMessageActionState = {};

type MemberOption = {
  userId: string;
  displayName: string;
};

type ComposeStudentMessageFormProps = {
  organizationId: string;
  organizationSlug: string;
  clubName: string;
  members: MemberOption[];
  /** Secretary invoice/receipt request mode */
  mode?: "advisor" | "invoice_receipt";
};

export function ComposeStudentMessageForm({
  organizationId,
  organizationSlug,
  clubName,
  members,
  mode = "advisor",
}: ComposeStudentMessageFormProps) {
  const [state, action, pending] = useActionState(
    sendStudentMessageAction,
    initialState,
  );
  const isInvoice = mode === "invoice_receipt";

  return (
    <DashboardCard
      title={isInvoice ? "Request invoice / receipt" : "Message students"}
      description={
        isInvoice
          ? `Secretary (or President/VP) can request expense documentation from ${clubName} members. Requests appear on each student’s Command Center.`
          : `Send an advisor request to ${clubName} members with action buttons.`
      }
      icon={
        isInvoice ? (
          <Receipt className="size-5" />
        ) : (
          <Mail className="size-5" />
        )
      }
    >
      <form action={action} className="grid gap-3">
        <input type="hidden" name="organizationId" value={organizationId} />
        <input type="hidden" name="organizationSlug" value={organizationSlug} />
        <input
          type="hidden"
          name="kind"
          value={isInvoice ? "INVOICE_RECEIPT_REQUEST" : "ADVISOR_REQUEST"}
        />
        <input
          type="hidden"
          name="actionPreset"
          value={isInvoice ? "invoice_receipt" : "link"}
        />
        <input type="hidden" name="returnTab" value="messages" />

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Title</span>
          <input
            name="title"
            required
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder={
              isInvoice
                ? "Your Secretary requested an invoice/receipt for [expense]"
                : "Your Advisor has sent you a project request — Cricut Club!"
            }
            defaultValue={
              isInvoice
                ? `Your Secretary requested an invoice/receipt for ${clubName}`
                : undefined
            }
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Details</span>
          <textarea
            name="body"
            rows={3}
            className="rounded-md border border-border bg-background px-3 py-2"
            placeholder="Optional context for the student"
          />
        </label>

        {!isInvoice ? (
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Deep link (Check it out)</span>
            <input
              name="href"
              className="rounded-md border border-border bg-background px-3 py-2"
              placeholder={`/organizations/${organizationSlug}`}
            />
          </label>
        ) : null}

        {!isInvoice ? (
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="includeViewLater" defaultChecked />
              View Later button
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" name="includeAddToCalendar" />
              Add to calendar button
            </label>
          </div>
        ) : null}

        {!isInvoice ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Calendar title (optional)</span>
              <input
                name="calendarTitle"
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Calendar location</span>
              <input
                name="calendarLocation"
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Calendar start</span>
              <input
                name="calendarStart"
                type="datetime-local"
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Calendar end</span>
              <input
                name="calendarEnd"
                type="datetime-local"
                className="rounded-md border border-border bg-background px-3 py-2"
              />
            </label>
          </div>
        ) : null}

        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" name="wholeClub" />
          Send to whole club
        </label>

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">Recipients</legend>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
            {members.map((member) => (
              <label
                key={member.userId}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="recipientIds"
                  value={member.userId}
                />
                {member.displayName}
              </label>
            ))}
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active members.</p>
            ) : null}
          </div>
        </fieldset>

        <div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending
              ? "Sending…"
              : isInvoice
                ? "Send receipt request"
                : "Send message"}
          </Button>
          {state.error ? (
            <p className="mt-2 text-sm text-destructive">{state.error}</p>
          ) : null}
          {state.success ? (
            <p className="mt-2 text-sm text-[#2E8B57]">{state.success}</p>
          ) : null}
        </div>
      </form>
    </DashboardCard>
  );
}
