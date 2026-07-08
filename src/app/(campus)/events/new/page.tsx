import { redirect } from "next/navigation";

import { EventForm } from "@/components/events/event-form";
import { ShellPage } from "@/components/layout/shell-page";
import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { parseDateParam } from "@/lib/calendar/utils";
import { listAcademies } from "@/services/event-service";

type NewEventPageProps = {
  searchParams: Promise<{ start?: string }>;
};

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const user = await requireCompleteProfile();

  if (!canManageEvents(user.role)) {
    redirect("/events");
  }

  const params = await searchParams;
  const defaultStart = parseDateParam(params.start);
  const academies = await listAcademies();

  return (
    <ShellPage
      title="New event"
      description="Schedule a campus or academy event. Students can view and join once published."
    >
      {academies.length > 0 ? (
        <EventForm academies={academies} defaultStart={defaultStart} />
      ) : (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          No academies found. Run the database migration and seed script first.
        </div>
      )}
    </ShellPage>
  );
}
