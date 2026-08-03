"use client";

import { usePathname } from "next/navigation";

import { BrandLogo } from "@/components/brand/brand-logo";
import { NavMembershipSections } from "@/components/layout/nav-membership-sections";
import { NavTree } from "@/components/layout/nav-tree";
import { resolveGroupedNavigation } from "@/config/navigation";
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
import type { StudentContext } from "@/services/student-context-service";
import type { CampusUser } from "@/types/auth";

export function MobileSidebar({
  user,
  context,
}: {
  user: CampusUser;
  context: StudentContext;
}) {
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useShellStore();
  const navEntries = resolveGroupedNavigation(user.role);

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
            <NavTree
              entries={navEntries}
              pathname={pathname}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </nav>
          <NavMembershipSections
            context={context}
            role={user.role}
            onNavigate={() => setMobileSidebarOpen(false)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
