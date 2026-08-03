"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";

import { getMobileNavigation, isNavItemActive } from "@/config/navigation";
import type { CampusRole } from "@/config/roles";
import { useShellStore } from "@/stores/shell-store";
import type { CampusUser } from "@/types/auth";
import { cn } from "@/lib/utils";

function MobileNavItems({
  user,
  membershipSlugs,
  navRole,
}: {
  user: CampusUser;
  membershipSlugs: string[];
  navRole?: CampusRole;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setMobileSidebarOpen } = useShellStore();
  const mobileItems = getMobileNavigation(navRole ?? user.role, {
    membershipSlugs,
  });

  return (
    <>
      {mobileItems.map((item) => {
        const Icon = item.icon;
        if (!item.href) {
          return null;
        }

        // Bottom tabs treat the whole club path as active (including ?tab=).
        const pathOnly = item.href.split("?")[0] ?? item.href;
        const isActive = pathname.startsWith("/organizations/")
          ? pathname === pathOnly || pathname.startsWith(`${pathOnly}/`)
          : isNavItemActive(pathname, item.href, searchParams.toString());

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
    </>
  );
}

export function MobileNav({
  user,
  membershipSlugs = [],
  navRole,
}: {
  user: CampusUser;
  membershipSlugs?: string[];
  navRole?: CampusRole;
}) {
  const tabCount = Math.min(
    4,
    Math.max(
      1,
      getMobileNavigation(navRole ?? user.role, { membershipSlugs }).length,
    ),
  );

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
    >
      <div
        className="mx-auto grid max-w-lg gap-1 px-2 py-2"
        style={{ gridTemplateColumns: `repeat(${tabCount + 1}, minmax(0, 1fr))` }}
      >
        <Suspense
          fallback={
            <button
              type="button"
              className="col-span-4 flex min-h-11 items-center justify-center text-sm text-muted-foreground"
              disabled
            >
              Menu
            </button>
          }
        >
          <MobileNavItems
            user={user}
            membershipSlugs={membershipSlugs}
            navRole={navRole}
          />
        </Suspense>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
