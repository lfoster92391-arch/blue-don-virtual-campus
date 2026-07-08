"use client";

import { useState, useTransition } from "react";

import { addTicketCommentAction } from "@/features/tickets/actions";
import { Button } from "@/components/ui/button";

export function TicketCommentForm({ ticketId }: { ticketId: string }) {
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          await addTicketCommentAction(ticketId, body);
          setBody("");
        });
      }}
    >
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder="Add a reply…"
        required
        className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
      />
      <Button type="submit" size="sm" disabled={pending || !body.trim()}>
        {pending ? "Sending…" : "Send reply"}
      </Button>
    </form>
  );
}
