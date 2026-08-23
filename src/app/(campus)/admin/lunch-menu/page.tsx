import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Info } from "lucide-react";

import {
  LunchMenuDayForm,
  MenuWeekHeading,
  PublishWeekForm,
} from "@/components/admin/lunch-menu-editor";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { listLunchServiceDates, toLunchDateKey } from "@/config/lunch";
import { canManageLunch } from "@/config/roles";
import { groupIntoServiceWeeks } from "@/lib/lunch-weeks";
import { requireCampusAccess } from "@/lib/auth/session";
import {
  countFamiliesToNotify,
  listLunchMenuDays,
} from "@/services/lunch-menu-service";

export const metadata = {
  title: "Lunch menu calendar",
  description:
    "Build the cafeteria menu a week at a time and publish it to families.",
};

/** Three school weeks — enough to work ahead without an endless page. */
const MENU_WINDOW_DAYS = 15;

export default async function AdminLunchMenuPage() {
  const user = await requireCampusAccess();

  if (!canManageLunch(user.role)) {
    redirect("/lunch");
  }

  const dateKeys = listLunchServiceDates(new Date(), MENU_WINDOW_DAYS).map(
    toLunchDateKey,
  );

  const [days, familyCount] = await Promise.all([
    listLunchMenuDays(dateKeys),
    countFamiliesToNotify(),
  ]);

  const weeks = groupIntoServiceWeeks(days, (day) => day.dateKey);
  const publishedTotal = days.filter((day) => day.publishedAt !== null).length;

  return (
    <ShellPage
      title="Lunch menu calendar"
      description="Set the menu for each day, then publish a week to families. Anything you do not publish falls back to the standard rotating menu, so the ordering board is never blank."
      actions={
        <>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/lunch">See it as a family does</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/lunch/kitchen">Kitchen prep sheet</Link>}
          />
        </>
      }
    >
      <DashboardCard
        title="How this works"
        description="Three steps, and only the third one families can see."
        icon={<Info className="size-5" />}
        status={{
          label: `${publishedTotal} of ${days.length} days published`,
          variant: publishedTotal > 0 ? "success" : "warning",
        }}
      >
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">1. Edit a day.</span>{" "}
            Each day is prefilled from the standard rotation. Change the hot
            lunch, vegetarian option, sides, and dessert, then{" "}
            <span className="font-medium text-foreground">Save day</span>. Saving
            does not publish.
          </li>
          <li>
            <span className="font-medium text-foreground">
              2. Check the week.
            </span>{" "}
            Days you saved show as{" "}
            <span className="font-medium text-foreground">Draft</span>. Days you
            have not touched keep showing the standard rotation.
          </li>
          <li>
            <span className="font-medium text-foreground">
              3. Publish the week.
            </span>{" "}
            Families see it on the Cafeteria Lunch page right away, and get a
            message on their Home page if you leave the notify box ticked.
          </li>
        </ol>
      </DashboardCard>

      {weeks.map((week) => {
        const published = week.days.filter((day) => day.publishedAt !== null);
        const drafts = week.days.filter(
          (day) => day.publishedAt === null && !day.isFallback,
        );

        return (
          <DashboardCard
            key={week.key}
            title={week.shortLabel}
            description={week.label}
            icon={<CalendarDays className="size-5" />}
            status={{
              label:
                published.length === week.days.length
                  ? "Published"
                  : published.length > 0
                    ? "Partly published"
                    : "Not published",
              variant:
                published.length === week.days.length
                  ? "success"
                  : published.length > 0
                    ? "warning"
                    : "default",
            }}
            expandable
            defaultExpanded={published.length < week.days.length}
            className="overflow-hidden"
          >
            <div className="-mx-4 -my-4 sm:-mx-5 sm:-my-5">
              <div className="border-b border-border px-4 py-3">
                <MenuWeekHeading
                  label={week.label}
                  publishedCount={published.length}
                  totalCount={week.days.length}
                />
              </div>

              {week.days.map((day) => (
                <LunchMenuDayForm key={day.dateKey} day={day} />
              ))}

              <PublishWeekForm
                dateKeys={week.dateKeys}
                rangeLabel={week.label}
                familyCount={familyCount}
                publishedCount={published.length}
                draftCount={drafts.length}
              />
            </div>
          </DashboardCard>
        );
      })}
    </ShellPage>
  );
}
