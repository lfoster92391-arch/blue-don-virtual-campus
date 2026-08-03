"use client";

import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { NavMembershipSections } from "@/components/layout/nav-membership-sections";
import { NavTree } from "@/components/layout/nav-tree";
import { resolveGroupedNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShellStore } from "@/stores/shell-store";
import type { StudentContext } from "@/services/student-context-service";
import type { CampusUser } from "@/types/auth";
import { cn } from "@/lib/utils";

export function Sidebar({
  user,
  context,
}: {
  user: CampusUser;
  context: StudentContext;
}) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useShellStore();
  const navEntries = resolveGroupedNavigation(user.role);

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-[#0A2342] text-white transition-[width] duration-200 lg:flex",
        sidebarCollapsed ? "w-[4.5rem]" : "w-64",
      )}
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-3",
          sidebarCollapsed ? "justify-center" : "px-4",
        )}
      >
        {!sidebarCollapsed ? (
          <div className="min-w-0 space-y-1">
            <BrandLogo
              variant="full"
              size="sm"
              href="/home"
              imageClassName="max-h-10 w-auto"
            />
            <p className="truncate text-xs text-[#C6CCD6]">
              {siteConfig.institution}
            </p>
          </div>
        ) : (
          <BrandLogo variant="emblem" size="sm" href="/home" />
        )}
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1" aria-label="Campus destinations">
          <NavTree
            entries={navEntries}
            pathname={pathname}
            sidebarCollapsed={sidebarCollapsed}
          />
        </nav>

        {!sidebarCollapsed ? (
          <NavMembershipSections context={context} role={user.role} />
        ) : null}
      </ScrollArea>

      <div className="border-t border-white/10 p-2">
        <Button
          variant="ghost"
          size={sidebarCollapsed ? "icon" : "sm"}
          className="w-full text-white hover:bg-white/10 hover:text-white"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <>
              <ChevronLeft className="size-4" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
