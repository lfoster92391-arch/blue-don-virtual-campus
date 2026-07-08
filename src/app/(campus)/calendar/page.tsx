import { CalendarViewSwitcher } from "@/components/calendar/calendar-view";
import { AddEventButton } from "@/components/calendar/add-event-button";
import { ShellPage } from "@/components/layout/shell-page";
import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getCalendarEntries, listAcademies } from "@/services/event-service";

export default async function CalendarPage() {
  const user = await requireCompleteProfile();
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 12, 0, 23, 59, 59, 999);

  const [entries, academies] = await Promise.all([
    getCalendarEntries({
      userId: user.id,
      rangeStart,
      rangeEnd,
    }),
    listAcademies(),
  ]);

  const canCreate = canManageEvents(user.role);

  return (
    <ShellPage
      title="Calendar"
      description="Month, week, day, agenda, and academy views for campus coordination across all academies."
      actions={canCreate ? <AddEventButton className="hidden sm:inline-flex" /> : null}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {entries.length} item{entries.length === 1 ? "" : "s"} this month
          {canCreate ? " · click a date to schedule an event" : null}
        </p>
        {canCreate ? (
          <AddEventButton size="sm" className="sm:hidden" />
        ) : null}
      </div>

      <CalendarViewSwitcher
        entries={entries}
        academies={academies}
        canCreate={canCreate}
      />

      {canCreate ? (
        <div className="fixed bottom-24 right-4 z-50 sm:hidden">
          <AddEventButton variant="fab" />
        </div>
      ) : null}
    </ShellPage>
  );
}
