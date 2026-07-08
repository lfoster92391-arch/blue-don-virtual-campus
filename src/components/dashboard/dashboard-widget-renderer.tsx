import type { WidgetId } from "@/config/dashboard-layouts";
import { StudentProgressWidget } from "@/components/academy-engine/student-progress-widget";
import {
  AdminComplianceWidget,
  AdminEnrollmentWidget,
  AdminModerationWidget,
  AdminSystemHealthWidget,
} from "@/components/dashboard/dashboard-admin-widgets";
import { DashboardAssignments } from "@/components/dashboard/dashboard-assignments";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { DashboardEvents } from "@/components/dashboard/dashboard-events";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { DashboardPortfolioSummary } from "@/components/dashboard/dashboard-portfolio-summary";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import type { DashboardWidgetData } from "@/services/dashboard-service";
import type { CampusUser } from "@/types/auth";

type DashboardWidgetRendererProps = {
  widgetId: WidgetId;
  user: CampusUser;
  data: DashboardWidgetData;
};

export function DashboardWidgetRenderer({
  widgetId,
  user,
  data,
}: DashboardWidgetRendererProps) {
  switch (widgetId) {
    case "hero_greeting":
      return <DashboardHero user={user} />;
    case "quick_actions":
      return <DashboardQuickActions user={user} />;
    case "metrics_strip":
      return <DashboardMetrics metrics={data.metrics} />;
    case "assignments_due":
      return <DashboardAssignments assignments={data.assignments} />;
    case "calendar_week":
      return <DashboardCalendar entries={data.calendarEntries} />;
    case "events_upcoming":
      return <DashboardEvents events={data.events} />;
    case "notifications":
      return <DashboardNotifications notifications={data.notifications} />;
    case "portfolio_summary":
      return data.portfolioSummary ? (
        <DashboardPortfolioSummary summary={data.portfolioSummary} />
      ) : null;
    case "academy_progress":
      return data.progressProfile ? (
        <StudentProgressWidget profile={data.progressProfile} />
      ) : null;
    case "admin_system_health":
      return <AdminSystemHealthWidget />;
    case "admin_compliance":
      return <AdminComplianceWidget />;
    case "admin_enrollment":
      return <AdminEnrollmentWidget />;
    case "admin_moderation":
      return <AdminModerationWidget />;
    default:
      return null;
  }
}
