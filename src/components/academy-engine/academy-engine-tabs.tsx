"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", suffix: "" },
  { id: "modules", label: "Modules", suffix: "?tab=modules" },
  { id: "labs", label: "Labs", suffix: "?tab=labs" },
  { id: "progress", label: "Progress", suffix: "?tab=progress" },
  { id: "certifications", label: "Certifications", suffix: "?tab=certifications" },
] as const;

type AcademyEngineTabsProps = {
  slug: string;
  activeTab: string;
};

export function AcademyEngineTabs({ slug, activeTab }: AcademyEngineTabsProps) {
  const pathname = usePathname();
  const base = `/academies/${slug}`;

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Academy sections">
      {TABS.map((tab) => {
        const href = `${base}${tab.suffix}`;
        const isActive =
          tab.id === "overview"
            ? activeTab === "overview" && pathname === base
            : activeTab === tab.id;

        return (
          <Link
            key={tab.id}
            href={href}
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
