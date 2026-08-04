"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { FOCUS_CLUB_TABS } from "@/config/focused-clubs";

export const CLUB_TABS = [
  { id: "overview", label: "Overview" },
  { id: "announcements", label: "Announcements" },
  { id: "projects", label: "Projects" },
  { id: "certifications", label: "Certifications" },
  { id: "labs", label: "Labs" },
  { id: "calendar", label: "Calendar" },
  { id: "finances", label: "Finances" },
  { id: "invoices", label: "Invoices" },
  { id: "shop", label: "Shop" },
  { id: "media", label: "Media" },
  { id: "fundraisers", label: "Fundraisers" },
  { id: "leadership", label: "Leadership" },
  { id: "members", label: "Members" },
  { id: "documents", label: "Documents" },
  { id: "checklists", label: "Checklists" },
] as const;

/** W20 · Club Worlds — the immersive per-club workspace tab id. */
export const WORKSPACE_TAB_ID = "workspace" as const;

export type ClubTabId =
  | (typeof CLUB_TABS)[number]["id"]
  | typeof WORKSPACE_TAB_ID
  | "script";

function focusedTabsForSlug(
  slug: string,
  options?: { canViewFinances?: boolean },
): { id: string; label: string }[] {
  const byId = new Map(FOCUS_CLUB_TABS.map((t) => [t.id, t]));
  const canViewFinances = options?.canViewFinances !== false;

  if (slug === "it-club") {
    const tabs = [
      byId.get("overview")!,
      { id: "documents", label: "Documents" },
      byId.get("invoices")!,
      byId.get("calendar")!,
      byId.get("members")!,
    ];
    if (canViewFinances) {
      tabs.splice(1, 0, byId.get("finances")!);
    }
    return tabs;
  }

  if (slug === "broadcasting") {
    const tabs = [
      byId.get("overview")!,
      { id: "script", label: "Daily Rundown" },
      { id: "media", label: "Control Room" },
      byId.get("invoices")!,
      byId.get("calendar")!,
      byId.get("members")!,
    ];
    if (canViewFinances) {
      tabs.splice(3, 0, byId.get("finances")!);
    }
    return tabs;
  }

  if (slug === "cricut-club") {
    const tabs = [
      byId.get("overview")!,
      { id: "projects", label: "Projects" },
      { id: "checklists", label: "Checklists" },
      { id: "shop", label: "Shop" },
      byId.get("invoices")!,
      byId.get("calendar")!,
      byId.get("members")!,
    ];
    if (canViewFinances) {
      tabs.splice(4, 0, byId.get("finances")!);
    }
    return tabs;
  }

  return [...FOCUS_CLUB_TABS];
}

export function ClubTabNav({
  slug,
  activeTab,
  workspaceTab,
  accent,
  focusedMode = false,
  canViewFinances = true,
}: {
  slug: string;
  activeTab: string;
  workspaceTab?: { label: string } | null;
  accent?: string;
  focusedMode?: boolean;
  canViewFinances?: boolean;
}) {
  const base = `/organizations/${slug}`;

  const tabs: { id: string; label: string }[] = focusedMode
    ? focusedTabsForSlug(slug, { canViewFinances })
    : [...CLUB_TABS];

  if (workspaceTab && !focusedMode) {
    tabs.splice(1, 0, { id: WORKSPACE_TAB_ID, label: workspaceTab.label });
  }

  const activeStyle = accent
    ? { backgroundColor: accent, color: "#ffffff" }
    : undefined;

  return (
    <nav
      className="flex flex-wrap gap-2 border-b border-border pb-4"
      aria-label="Club sections"
    >
      {tabs.map((tab) => {
        const href =
          tab.id === "shop"
            ? "/cricut/shop"
            : tab.id === "overview"
              ? base
              : `${base}?tab=${tab.id}`;
        const isActive =
          tab.id === "shop"
            ? activeTab === "shop"
            : activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={href}
            style={isActive ? activeStyle : undefined}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-[#0A2342] text-white dark:bg-[#2F80ED]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
