import Link from "next/link";

import { TicketCreateForm } from "@/components/tickets/ticket-create-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canCreateTickets } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function NewTicketPage() {
  const user = await requireCompleteProfile();

  if (!canCreateTickets(user.role)) {
    redirect("/service-desk");
  }

  return (
    <ShellPage
      title="New Support Ticket"
      description="Describe your issue and the campus support team will respond."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/service-desk">Back to service desk</Link>} />
      <div className="mt-6 max-w-xl">
        <TicketCreateForm />
      </div>
    </ShellPage>
  );
}
