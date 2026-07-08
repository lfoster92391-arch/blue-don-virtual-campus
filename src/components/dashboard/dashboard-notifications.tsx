import { Bell, ChevronRight } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { DashboardNotification } from "@/lib/dashboard/mock-data";

type DashboardNotificationsProps = {
  notifications: DashboardNotification[];
};

export function DashboardNotifications({
  notifications,
}: DashboardNotificationsProps) {
  const unreadCount = notifications.filter((item) => item.unread).length;
  const hasNotifications = notifications.length > 0;

  return (
    <DashboardCard
      title="Notifications"
      description="Updates that need your attention"
      icon={<Bell className="size-4" />}
      status={{
        label: unreadCount > 0 ? `${unreadCount} unread` : "All caught up",
        variant: unreadCount > 0 ? "warning" : "success",
      }}
      actions={
        <Button variant="ghost" size="sm" disabled>
          View all
          <ChevronRight className="size-4" />
        </Button>
      }
      expandable
    >
      {hasNotifications ? (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="rounded-lg border border-border px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{notification.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {notification.body}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {notification.timeLabel}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center">
          <p className="text-sm font-medium text-foreground">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Assignment updates, announcements, and reminders will land here as
            campus systems come online.
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
