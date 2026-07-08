"use client";

import { Bell, CalendarDays, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NotificationsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="size-4" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
          No notifications yet. Updates will appear here in a later phase.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function HeaderQuickLinks() {
  return (
    <div className="hidden items-center gap-1 md:flex">
      <Button variant="ghost" size="sm" disabled aria-label="Calendar">
        <CalendarDays className="size-4" />
        <span className="hidden xl:inline">Calendar</span>
      </Button>
      <Button variant="ghost" size="sm" disabled aria-label="Assignments">
        <ClipboardList className="size-4" />
        <span className="hidden xl:inline">Assignments</span>
      </Button>
    </div>
  );
}
