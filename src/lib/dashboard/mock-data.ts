export type DashboardMetric = {
  label: string;
  value: string;
  hint: string;
};

export type DashboardAssignment = {
  id: string;
  title: string;
  course: string;
  dueLabel: string;
  status: "upcoming" | "due-soon" | "submitted";
};

export type DashboardEvent = {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  type: "academic" | "community" | "deadline";
};

export type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  timeLabel: string;
  unread: boolean;
};

export const dashboardMetrics: DashboardMetric[] = [
  { label: "Due This Week", value: "0", hint: "Assignments arrive in Phase 6" },
  { label: "Upcoming Events", value: "0", hint: "Events connect in Phase 4" },
  { label: "Unread Alerts", value: "0", hint: "Live notifications in Phase 4+" },
  { label: "Portfolio Items", value: "0", hint: "Portfolio unlocks in Phase 7" },
];

export const placeholderAssignments: DashboardAssignment[] = [];

export const placeholderEvents: DashboardEvent[] = [];

export const placeholderNotifications: DashboardNotification[] = [];
