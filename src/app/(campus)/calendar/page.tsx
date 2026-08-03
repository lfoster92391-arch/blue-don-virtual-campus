import { CalendarViewSwitcher } from "@/components/calendar/calendar-view";
import { AddEventButton } from "@/components/calendar/add-event-button";
import { ShellPage } from "@/components/layout/shell-page";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  clubEventsToCalendarEntries,
  listClubCalendarEvents,
} from "@/services/club-calendar-service";
import { getCalendarEntries, listAcademies } from "@/services/event-service";

type CalendarPageProps = {
  searchParams: Promise<{ club?: string }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const user = await requireCompleteProfile();
  const { club: clubFilter } = await searchParams;
  const now = new Date();
  const rangeStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = new Date(now.getFullYear(), now.getMonth() + 12, 0, 23, 59, 59, 999);

  const [entries, academies, clubEvents] = await Promise.all([
    getCalendarEntries({
      userId: user.id,
      rangeStart,
      rangeEnd,
    }),
    listAcademies(),
    listClubCalendarEvents({ rangeStart, rangeEnd }),
  ]);

  const clubEntries = clubEventsToCalendarEntries(clubEvents);
  const merged = [...entries, ...clubEntries].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  const clubFilterOptions = FOCUS_CLUBS.map((club) => ({
    id: `club:${club.slug}`,
    name: club.name,
    color: club.accent,
  }));

  const canCreate = canManageEvents(user.role);
  const initialClubFilter = clubFilter
    ? `club:${clubFilter}`
    : "all";

  return (
    <ShellPage
      title="Calendar"
      description="Shared school and club calendar — all students can view IT, Broadcasting, and Cricut events."
      actions={canCreate ? <AddEventButton className="hidden sm:inline-flex" /> : null}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {merged.length} item{merged.length === 1 ? "" : "s"} in range
          {canCreate ? " · click a date to schedule an academy event" : null}
          {" · "}
          club meetings appear for everyone
        </p>
        {canCreate ? (
          <AddEventButton size="sm" className="sm:hidden" />
        ) : null}
      </div>

      <CalendarViewSwitcher
        entries={merged}
        academies={[...academies, ...clubFilterOptions]}
        canCreate={canCreate}
        initialAcademyId={initialClubFilter}
        clubFilters={FOCUS_CLUBS.map((c) => ({
          slug: c.slug,
          name: c.name,
          accent: c.accent,
        }))}
      />

      {canCreate ? (
        <div className="fixed bottom-24 right-4 z-50 sm:hidden">
          <AddEventButton variant="fab" />
        </div>
      ) : null}
    </ShellPage>
  );
}
