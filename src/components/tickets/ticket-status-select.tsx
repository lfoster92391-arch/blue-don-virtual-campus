"use client";

import { useTransition } from "react";

import { updateTicketStatusAction } from "@/features/tickets/actions";
import { TICKET_STATUS_LABELS } from "@/lib/mvp/constants";
import type { TicketStatus } from "@/generated/prisma/client";

export function TicketStatusSelect({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: TicketStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Update status</span>
      <select
        value={currentStatus}
        disabled={pending}
        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        onChange={(event) =>
          startTransition(async () => {
            await updateTicketStatusAction(
              ticketId,
              event.target.value as TicketStatus,
            );
          })
        }
      >
        {Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
