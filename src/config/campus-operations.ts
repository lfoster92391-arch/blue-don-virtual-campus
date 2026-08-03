/**
 * W9 · Campus Operations — IT Operations flagship, department workspaces.
 */

export type OpsMetric = {
  label: string;
  value: string;
  trend?: "up" | "down" | "stable";
};

export type OpsQueueItem = {
  id: string;
  title: string;
  category: "it" | "facilities" | "accounts";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  ageLabel: string;
};

export type DepartmentWorkspace = {
  id: string;
  name: string;
  description: string;
  openItems: number;
  href: string;
};

export const OPS_METRICS: OpsMetric[] = [
  { label: "Open IT tickets", value: "14", trend: "down" },
  { label: "Avg resolution", value: "4.2h", trend: "stable" },
  { label: "Facilities requests", value: "6", trend: "up" },
  { label: "Account actions today", value: "3", trend: "stable" },
];

export const OPS_QUEUE: OpsQueueItem[] = [
  { id: "oq-1", title: "Projector not displaying in Room 108", category: "it", priority: "high", assignee: "IT Desk", ageLabel: "2h" },
  { id: "oq-2", title: "Wi-Fi intermittent in Library", category: "it", priority: "medium", assignee: "Network Team", ageLabel: "5h" },
  { id: "oq-3", title: "Broken locker — Hall B", category: "facilities", priority: "low", ageLabel: "1d" },
  { id: "oq-4", title: "New student account provisioning", category: "accounts", priority: "urgent", assignee: "Admin", ageLabel: "30m" },
  { id: "oq-5", title: "HVAC noise — Room 214", category: "facilities", priority: "medium", ageLabel: "3h" },
];

export const DEPARTMENT_WORKSPACES: DepartmentWorkspace[] = [
  { id: "ws-it", name: "IT Operations", description: "Tickets, device inventory, network health", openItems: 14, href: "/equipment" },
  { id: "ws-fac", name: "Facilities", description: "Maintenance requests, room bookings, safety", openItems: 6, href: "/service-desk" },
  { id: "ws-acct", name: "Accounts", description: "User provisioning, password resets, roles", openItems: 3, href: "/service-desk/users" },
  { id: "ws-media", name: "Broadcasting", description: "Livestreams, morning announcements, studio", openItems: 2, href: "/media" },
];
