"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import {
  filterNavigationByRole,
  isNavItemActive,
  legacyNavigation,
  primaryNavigation,
} from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useShellStore } from "@/stores/shell-store";
import type { CampusUser } from "@/types/auth";
import { cn } from "@/lib/utils";

export function MobileSidebar({ user }: { user: CampusUser }) {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useShellStore();
  const primaryItems = filterNavigationByRole(primaryNavigation, user.role);

  function renderItems(items: typeof primaryNavigation) {
    return items.map((item) => {
      const Icon = item.icon;
      const isActive =
        item.href && isNavItemActive(pathname, item.href);

      const className = cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm",
        item.enabled
          ? isActive
            ? "bg-white/15 text-white"
            : "text-[#C6CCD6] hover:bg-white/10 hover:text-white"
          : "cursor-not-allowed text-white/35",
      );

      if (!item.enabled || !item.href) {
        return (
          <div key={item.label} aria-disabled="true" className={className}>
            <Icon className="size-4" />
            <span>{item.label}</span>
          </div>
        );
      }

      return (
        <Link
          key={item.label}
          href={item.href}
          className={className}
          onClick={() => setMobileSidebarOpen(false)}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon className="size-4" />
          <span>{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetContent side="left" className="w-80 bg-[#0A2342] p-0 text-white">
        <SheetHeader className="border-b border-white/10 px-4 py-4 text-left">
          <SheetTitle className="flex items-center gap-3 text-white">
            <BrandLogo variant="emblem" size="sm" href={null} />
            <span className="min-w-0 truncate">{siteConfig.shortName}</span>
          </SheetTitle>
          <SheetDescription className="text-[#C6CCD6]">
            {siteConfig.institution}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-6rem)] px-3 py-4">
          <nav className="space-y-1" aria-label="Campus destinations">
            {renderItems(primaryItems)}
          </nav>
          <div className="mt-6 space-y-2">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-white/50">
              Campus Tools
            </p>
            <nav className="space-y-1" aria-label="Campus tools">
              {renderItems(legacyNavigation)}
            </nav>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
