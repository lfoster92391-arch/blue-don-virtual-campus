"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { getMobileNavigation, isNavItemActive } from "@/config/navigation";
import { useShellStore } from "@/stores/shell-store";
import type { CampusUser } from "@/types/auth";
import { cn } from "@/lib/utils";

export function MobileNav({ user }: { user: CampusUser }) {
  const pathname = usePathname();
  const { setMobileSidebarOpen } = useShellStore();
  const mobileItems = getMobileNavigation(user.role);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-2">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href && isNavItemActive(pathname, item.href);

          if (!item.href) {
            return null;
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.7rem] font-medium",
                isActive
                  ? "text-[#0A2342] dark:text-white"
                  : "text-muted-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[0.7rem] font-medium text-muted-foreground"
          aria-label="Open campus menu"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="size-5" />
          <span>Menu</span>
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
