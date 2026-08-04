import { CalendarViewSwitcher } from "@/components/calendar/calendar-view";
import { AddEventButton } from "@/components/calendar/add-event-button";
import { ShellPage } from "@/components/layout/shell-page";
import { FOCUS_CLUBS } from "@/config/focused-clubs";
import { canBrowseAllFocusClubs } from "@/config/focus-club-access";
import { canManageEvents } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  clubEventsToCalendarEntries,
  listClubCalendarEvents,
  listMeetingsForStudent,
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
  const rangeEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 12,
    0,
    23,
    59,
    59,
    999,
  );

  const seeAllClubs = canBrowseAllFocusClubs(user.role);

  const [entries, academies, clubEvents] = await Promise.all([
    getCalendarEntries({
      userId: user.id,
      rangeStart,
      rangeEnd,
    }),
    listAcademies(),
    seeAllClubs
      ? listClubCalendarEvents({ rangeStart, rangeEnd })
      : listMeetingsForStudent(user.id, { rangeStart, rangeEnd }),
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
  const initialClubFilter = clubFilter ? `club:${clubFilter}` : "all";

  return (
    <ShellPage
      title="Calendar"
      description={
        seeAllClubs
          ? "Shared school and club calendar — staff can view every club."
          : "Your club meetings plus mandatory campus all-hands."
      }
      actions={canCreate ? <AddEventButton className="hidden sm:inline-flex" /> : null}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {merged.length} item{merged.length === 1 ? "" : "s"} in range
          {canCreate ? " · click a date to schedule an academy event" : null}
          {seeAllClubs
            ? " · all club meetings visible"
            : " · only your clubs (+ mandatory all-hands)"}
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
