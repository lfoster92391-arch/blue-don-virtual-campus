import { DashboardAssignments } from "@/components/dashboard/dashboard-assignments";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { DashboardEvents } from "@/components/dashboard/dashboard-events";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { DashboardPortfolioSummary } from "@/components/dashboard/dashboard-portfolio-summary";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { StudentProgressWidget } from "@/components/academy-engine/student-progress-widget";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  getDashboardAssignments,
  getDashboardCalendarEntries,
  getDashboardEvents,
  getDashboardMetrics,
  getDashboardPortfolioSummary,
} from "@/lib/dashboard/data";
import { placeholderNotifications } from "@/lib/dashboard/mock-data";
import { getStudentProgressProfile } from "@/services/academy-engine-service";

export const metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function EmbedDashboardPage() {
  const user = await requireCompleteProfile();

  const [metrics, assignments, events, calendarEntries, portfolioSummary, progressProfile] =
    await Promise.all([
      getDashboardMetrics(user.id),
      getDashboardAssignments(user.id),
      getDashboardEvents(user.id),
      getDashboardCalendarEntries(user.id),
      getDashboardPortfolioSummary(user.id),
      getStudentProgressProfile(user.id),
    ]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <DashboardHero user={user} />
      <DashboardQuickActions user={user} />
      <DashboardMetrics metrics={metrics} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardAssignments assignments={assignments} />
        <DashboardCalendar entries={calendarEntries} />
        <DashboardEvents events={events} />
        <DashboardNotifications notifications={placeholderNotifications} />
      </div>

      <DashboardPortfolioSummary summary={portfolioSummary} />
      <StudentProgressWidget profile={progressProfile} />
    </div>
  );
}
