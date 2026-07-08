"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import {
  filterNavigationByRole,
  isNavItemActive,
  legacyNavigation,
  primaryNavigation,
} from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useShellStore } from "@/stores/shell-store";
import type { CampusUser } from "@/types/auth";
import { cn } from "@/lib/utils";

function NavSection({
  items,
  pathname,
  sidebarCollapsed,
  onNavigate,
}: {
  items: typeof primaryNavigation;
  pathname: string;
  sidebarCollapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href && isNavItemActive(pathname, item.href);

        const content = (
          <span
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              item.enabled
                ? isActive
                  ? "bg-white/15 text-white"
                  : "text-[#C6CCD6] hover:bg-white/10 hover:text-white"
                : "cursor-not-allowed text-white/35",
              sidebarCollapsed && "justify-center px-2",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!sidebarCollapsed ? (
              <span className="truncate">{item.label}</span>
            ) : null}
          </span>
        );

        if (!item.enabled || !item.href) {
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger
                render={
                  <div aria-disabled="true" className="w-full">
                    {content}
                  </div>
                }
              />
              <TooltipContent side="right">
                {item.label} — available in a later phase
              </TooltipContent>
            </Tooltip>
          );
        }

        if (sidebarCollapsed) {
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger
                render={
                  <Link href={item.href} onClick={onNavigate}>
                    {content}
                  </Link>
                }
              />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
          >
            {content}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar({ user }: { user: CampusUser }) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useShellStore();
  const primaryItems = filterNavigationByRole(primaryNavigation, user.role);

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
          <NavSection
            items={primaryItems}
            pathname={pathname}
            sidebarCollapsed={sidebarCollapsed}
          />
        </nav>

        {!sidebarCollapsed ? (
          <div className="mt-6 space-y-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-white/50">
              Campus Tools
            </p>
            <nav className="space-y-1" aria-label="Campus tools">
              <NavSection
                items={legacyNavigation}
                pathname={pathname}
                sidebarCollapsed={sidebarCollapsed}
              />
            </nav>
          </div>
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
