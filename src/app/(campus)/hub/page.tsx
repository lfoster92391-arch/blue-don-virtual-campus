import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  FileText,
  Phone,
  School,
  UtensilsCrossed,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { FuelTheDonsRow } from "@/components/lunch/fuel-the-dons-link";
import { ShellPage } from "@/components/layout/shell-page";
import { AnnouncementsStrip } from "@/components/school-hub/announcements-strip";
import { DirectoryList } from "@/components/school-hub/directory-list";
import { Button } from "@/components/ui/button";
import { PageDropdown } from "@/components/ui/page-dropdown";
import { CAMPUS_FEED } from "@/config/campus-feed";
import { FUEL_THE_DONS_NAME } from "@/config/fuel-the-dons";
import {
  HUB_EXPLORE_GROUPS,
  HUB_QUICK_LINKS,
  HUB_RESOURCES,
  SCHOOL_DIRECTORY,
  isStaffRole,
} from "@/config/school-hub";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getTodayHubDigest } from "@/services/school-hub-service";

const ANNOUNCEMENT_CATEGORIES = new Set(["school", "faith"]);

export default async function HubPage() {
  const user = await requireCompleteProfile();
  const staff = isStaffRole(user.role);

  const digest = await getTodayHubDigest({ id: user.id, role: user.role });

  const announcements = CAMPUS_FEED.filter((post) =>
    ANNOUNCEMENT_CATEGORIES.has(post.category),
  ).slice(0, 4);

  const directory = SCHOOL_DIRECTORY.filter(
    (entry) => staff || !entry.staffOnly,
  );

  const resources = HUB_RESOURCES.filter(
    (resource) => staff || !resource.staffOnly,
  );

  const exploreGroups = HUB_EXPLORE_GROUPS.map((group) => ({
    ...group,
    links: group.links.filter((link) => staff || !link.staffOnly),
  })).filter((group) => group.links.length > 0);

  const glanceStats = [
    {
      id: "events",
      label: "Events today",
      value: String(digest.eventCount),
      hint: "on the calendar",
      icon: CalendarDays,
    },
    {
      id: "forms",
      label: "Forms due",
      value: String(digest.formsDueCount),
      hint: "need your attention",
      icon: FileText,
    },
  ];

  return (
    <ShellPage
      title="School Hub"
      description="Everything you need for the school day."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2342]/5 px-3 py-1 text-xs font-medium text-[#0A2342] dark:bg-white/10 dark:text-white">
          <School className="size-3.5" aria-hidden="true" />
          {digest.dateLabel}
        </span>
      }
    >
      {/* Mobile-friendly quick links row */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {HUB_QUICK_LINKS.map((link) => (
          <Button
            key={link.id}
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={link.href}>{link.label}</Link>}
          />
        ))}
      </div>

      {/* Today at a glance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {glanceStats.map((stat) => (
          <div key={stat.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <stat.icon className="size-4 text-[#2F80ED]" aria-hidden="true" />
              {stat.label}
            </div>
            <p className="mt-1 truncate text-2xl font-semibold text-[#0A2342] dark:text-white">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.hint}</p>
          </div>
        ))}
      </div>

      <PageDropdown
        id="explore-campus"
        title="Explore Campus"
        description="Jump to any corner of Madonna High School."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {exploreGroups.map((group) => (
            <DashboardCard
              key={group.id}
              title={group.label}
              description={group.description}
              icon={<group.icon className="size-5" />}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {group.links.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    className="group flex items-start gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40 hover:bg-[#2F80ED]/5"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#0A2342]/5 text-[#2F80ED] dark:bg-white/10">
                      <link.icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-1 font-medium text-[#0A2342] dark:text-white">
                        {link.label}
                        <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {link.description}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </DashboardCard>
          ))}
        </div>
      </PageDropdown>

      <PageDropdown
        id="lunch"
        title="Lunch"
        description={`Menus and ordering live on ${FUEL_THE_DONS_NAME}.`}
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <UtensilsCrossed className="size-4 text-[#2F80ED]" aria-hidden="true" />
          {digest.dayName} · {digest.schoolYear}
        </div>
        <FuelTheDonsRow className="mt-3" />
      </PageDropdown>

      <PageDropdown
        id="announcements"
        title="Announcements"
        description="School-wide news from the principal's office and campus ministry."
        actions={
          <Button
            variant="action"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/community">
                All announcements
                <ArrowRight className="size-3.5" />
              </Link>
            }
          />
        }
      >
        <AnnouncementsStrip posts={announcements} />
      </PageDropdown>

      <PageDropdown
        id="directory"
        title="School Directory"
        description="Quick contacts for the main office, guidance, nurse, and more."
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="size-4 text-[#2F80ED]" aria-hidden="true" />
          Main office and campus contacts
        </div>
        <div className="mt-3">
          <DirectoryList entries={directory} />
        </div>
      </PageDropdown>

      <PageDropdown
        id="resources"
        title="Resources"
        description="Handbook, forms, calendar, and everything else in one place."
      >
        {staff ? (
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#2F80ED]">
            Staff view
          </p>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={resource.href}
              className="group flex flex-col rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40"
            >
              <span className="flex items-center gap-1.5 font-medium text-[#0A2342] dark:text-white">
                {resource.label}
                <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="mt-0.5 text-sm text-muted-foreground">
                {resource.description}
              </span>
            </Link>
          ))}
        </div>
      </PageDropdown>
    </ShellPage>
  );
}
