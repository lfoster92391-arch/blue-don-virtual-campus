"use client";

import Link from "next/link";
import { HandHeart, Menu } from "lucide-react";

import { siteConfig } from "@/config/site";
import { BrandLogo } from "@/components/brand/brand-logo";
import { CampusCampaignButton } from "@/components/fundraisers/campus-campaign-button";
import { CampusClock } from "@/components/shell/campus-clock";
import { CampusSearch } from "@/components/shell/campus-search";
import {
  HeaderQuickLinks,
  NotificationsMenu,
} from "@/components/shell/notifications-menu";
import {
  ProfileMenu,
  QuickActionsMenu,
} from "@/components/shell/profile-menu";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { ViewAsHeaderControl } from "@/components/admin/view-as-header";
import { HeaderOverflowMenu } from "@/components/layout/header-overflow-menu";
import { Button } from "@/components/ui/button";
import { useShellStore } from "@/stores/shell-store";
import type { CampusUser } from "@/types/auth";

export function Header({
  user,
  showViewAs = false,
  campaigns = [],
}: {
  user: CampusUser;
  showViewAs?: boolean;
  campaigns?: { id: string; title: string }[];
}) {
  const { setMobileSidebarOpen } = useShellStore();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center gap-2 px-3 lg:gap-3 lg:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 lg:hidden"
          aria-label="Open navigation menu"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="size-5" />
        </Button>

        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-2 lg:hidden"
        >
          <BrandLogo variant="emblem" size="xs" href={null} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#0A2342] dark:text-white">
              {siteConfig.institution}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {siteConfig.shortName}
            </p>
          </div>
        </Link>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 lg:ml-0 lg:flex-1 lg:justify-between">
          <CampusClock />
          <div className="flex items-center justify-end gap-1.5 sm:gap-2">
            <CampusCampaignButton
              campaigns={campaigns}
              compactTitle
              className="h-9 max-w-[8.25rem] px-2.5 sm:max-w-72 sm:px-3"
            />
            <Button
              variant="action"
              size="sm"
              className="h-9 px-2.5 sm:px-3"
              nativeButton={false}
              render={
                <Link href="/madonna/participate">
                  <HandHeart className="size-4 max-sm:hidden" aria-hidden="true" />
                  Participate
                </Link>
              }
            />
            <div className="lg:hidden">
              <HeaderOverflowMenu user={user} showViewAs={showViewAs} />
            </div>
            <div className="hidden items-center gap-1 sm:gap-2 lg:flex">
              <HeaderQuickLinks />
              {showViewAs ? <ViewAsHeaderControl /> : null}
              <CampusSearch />
              <NotificationsMenu />
              <ThemeToggle />
              <QuickActionsMenu />
              <ProfileMenu user={user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
