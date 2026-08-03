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
] as const;

/** W20 · Club Worlds — the immersive per-club workspace tab id. */
export const WORKSPACE_TAB_ID = "workspace" as const;

export type ClubTabId =
  | (typeof CLUB_TABS)[number]["id"]
  | typeof WORKSPACE_TAB_ID;

function focusedTabsForSlug(slug: string): { id: string; label: string }[] {
  const byId = new Map(FOCUS_CLUB_TABS.map((t) => [t.id, t]));

  if (slug === "it-club") {
    return [
      byId.get("overview")!,
      byId.get("finances")!,
      byId.get("invoices")!,
      byId.get("calendar")!,
      byId.get("members")!,
    ];
  }

  if (slug === "broadcasting") {
    return [
      byId.get("overview")!,
      { id: "media", label: "Live / Media" },
      byId.get("invoices")!,
      byId.get("calendar")!,
      byId.get("members")!,
    ];
  }

  if (slug === "cricut-club") {
    return [
      byId.get("overview")!,
      { id: "shop", label: "Shop" },
      byId.get("invoices")!,
      byId.get("calendar")!,
      byId.get("members")!,
    ];
  }

  return [...FOCUS_CLUB_TABS];
}

export function ClubTabNav({
  slug,
  activeTab,
  workspaceTab,
  accent,
  focusedMode = false,
}: {
  slug: string;
  activeTab: string;
  workspaceTab?: { label: string } | null;
  accent?: string;
  focusedMode?: boolean;
}) {
  const base = `/organizations/${slug}`;

  const tabs: { id: string; label: string }[] = focusedMode
    ? focusedTabsForSlug(slug)
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
