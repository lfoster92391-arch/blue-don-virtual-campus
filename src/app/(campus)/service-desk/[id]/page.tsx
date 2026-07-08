import Link from "next/link";
import { notFound } from "next/navigation";

import { TicketCommentForm } from "@/components/tickets/ticket-comment-form";
import { TicketStatusSelect } from "@/components/tickets/ticket-status-select";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from "@/lib/mvp/constants";
import { canManageTickets } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getTicketById } from "@/services/ticket-service";

type TicketDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const canManage = canManageTickets(user.role);
  const ticket = await getTicketById(id, user.id, canManage);

  if (!ticket) {
    notFound();
  }

  return (
    <ShellPage title={ticket.subject} description={TICKET_CATEGORY_LABELS[ticket.category]}>
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/service-desk">Back to service desk</Link>} />

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Status</dt>
          <dd className="mt-1">{TICKET_STATUS_LABELS[ticket.status]}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase text-muted-foreground">Priority</dt>
          <dd className="mt-1">{TICKET_PRIORITY_LABELS[ticket.priority]}</dd>
        </div>
        {canManage ? (
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Requester</dt>
            <dd className="mt-1">{ticket.requesterName}</dd>
          </div>
        ) : null}
      </dl>

      {canManage ? (
        <div className="mt-4">
          <TicketStatusSelect ticketId={ticket.id} currentStatus={ticket.status} />
        </div>
      ) : null}

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-medium">Description</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
          {ticket.description}
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">Conversation</h2>
        {ticket.comments.length > 0 ? (
          <ul className="space-y-3">
            {ticket.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg border border-border px-4 py-3">
                <p className="text-sm font-medium">{comment.authorName}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                  {comment.body}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No replies yet.</p>
        )}
        <TicketCommentForm ticketId={ticket.id} />
      </section>
    </ShellPage>
  );
}
