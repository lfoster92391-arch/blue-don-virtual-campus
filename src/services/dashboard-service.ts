import type { WidgetId } from "@/config/dashboard-layouts";
import {
  getDashboardLayout,
  getVisibleWidgets,
  resolveDashboardPersona,
  type DashboardContext,
  type WidgetPlacement,
} from "@/config/dashboard-layouts";
import {
  getDashboardAssignments,
  getDashboardCalendarEntries,
  getDashboardEvents,
  getDashboardMetrics,
  getDashboardPortfolioSummary,
} from "@/lib/dashboard/data";
import { placeholderNotifications } from "@/lib/dashboard/mock-data";
import { getStudentProgressProfile } from "@/services/academy-engine-service";
import type { CampusUser } from "@/types/auth";

export type DashboardWidgetData = {
  metrics: Awaited<ReturnType<typeof getDashboardMetrics>>;
  assignments: Awaited<ReturnType<typeof getDashboardAssignments>>;
  events: Awaited<ReturnType<typeof getDashboardEvents>>;
  calendarEntries: Awaited<ReturnType<typeof getDashboardCalendarEntries>>;
  portfolioSummary: Awaited<ReturnType<typeof getDashboardPortfolioSummary>> | null;
  progressProfile: Awaited<ReturnType<typeof getStudentProgressProfile>> | null;
  notifications: typeof placeholderNotifications;
};

export type DashboardViewModel = {
  persona: ReturnType<typeof resolveDashboardPersona>;
  layout: ReturnType<typeof getDashboardLayout>;
  widgets: WidgetPlacement[];
  data: DashboardWidgetData;
};

const WIDGET_DATA_DEPENDENCIES: Record<WidgetId, (keyof DashboardWidgetData)[]> = {
  hero_greeting: [],
  quick_actions: [],
  metrics_strip: ["metrics"],
  assignments_due: ["assignments"],
  calendar_week: ["calendarEntries"],
  events_upcoming: ["events"],
  notifications: ["notifications"],
  portfolio_summary: ["portfolioSummary"],
  academy_progress: ["progressProfile"],
  admin_system_health: [],
  admin_compliance: [],
  admin_enrollment: [],
  admin_moderation: [],
};

function needsData(widgets: WidgetPlacement[]): Set<keyof DashboardWidgetData> {
  const keys = new Set<keyof DashboardWidgetData>();

  for (const widget of widgets) {
    for (const key of WIDGET_DATA_DEPENDENCIES[widget.id] ?? []) {
      keys.add(key);
    }
  }

  return keys;
}

export async function getDashboardViewModel(
  user: CampusUser,
  context: DashboardContext = {},
): Promise<DashboardViewModel> {
  const persona = resolveDashboardPersona(user.role, context);
  const layout = getDashboardLayout(persona);
  const widgets = getVisibleWidgets(user.role, persona, context);
  const dataKeys = needsData(widgets);

  const [
    metrics,
    assignments,
    events,
    calendarEntries,
    portfolioSummary,
    progressProfile,
  ] = await Promise.all([
    dataKeys.has("metrics") ? getDashboardMetrics(user.id) : Promise.resolve([]),
    dataKeys.has("assignments")
      ? getDashboardAssignments(user.id)
      : Promise.resolve([]),
    dataKeys.has("events") ? getDashboardEvents(user.id) : Promise.resolve([]),
    dataKeys.has("calendarEntries")
      ? getDashboardCalendarEntries(user.id)
      : Promise.resolve([]),
    dataKeys.has("portfolioSummary")
      ? getDashboardPortfolioSummary(user.id)
      : Promise.resolve(null),
    dataKeys.has("progressProfile")
      ? getStudentProgressProfile(user.id)
      : Promise.resolve(null),
  ]);

  return {
    persona,
    layout,
    widgets,
    data: {
      metrics,
      assignments,
      events,
      calendarEntries,
      portfolioSummary,
      progressProfile,
      notifications: placeholderNotifications,
    },
  };
}
