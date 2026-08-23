import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarRange,
  ChefHat,
  ClipboardList,
  Lock,
  Salad,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DietarySummary } from "@/components/dietary/dietary-summary";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  LUNCH_CHOICES,
  LUNCH_CHOICE_META,
  LUNCH_ORDER_CUTOFF_HOUR,
  type LunchChoice,
} from "@/config/lunch";
import { canManageLunch } from "@/config/roles";
import { formatMinutes } from "@/config/school-hub";
import { groupIntoServiceWeeks } from "@/lib/lunch-weeks";
import { requireCampusAccess } from "@/lib/auth/session";
import {
  getLunchKitchenPlan,
  isServiceDayToday,
  summarizeKitchenPlan,
  type KitchenDayPlan,
  type KitchenDinerLine,
} from "@/services/lunch-kitchen-service";

export const metadata = {
  title: "Kitchen prep sheet",
  description:
    "Lunch choices totalled by day and by dish, with the serving list and allergies.",
};

const COUNT_TONE: Record<LunchChoice, string> = {
  HOT: "border-[#2F80ED]/40 bg-[#2F80ED]/10 text-[#2F80ED]",
  VEGETARIAN: "border-[#2E8B57]/40 bg-[#2E8B57]/10 text-[#2E8B57]",
  PACKED: "border-border bg-muted text-muted-foreground",
  NONE: "border-border bg-muted text-muted-foreground",
};

function CountTile({
  choice,
  value,
  detail,
}: {
  choice: LunchChoice;
  value: number;
  detail?: string | null;
}) {
  return (
    <div className={`rounded-xl border p-3 ${COUNT_TONE[choice]}`}>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1.5 text-xs font-medium">
        {LUNCH_CHOICE_META[choice].label}
      </p>
      {detail ? (
        <p className="mt-0.5 text-xs opacity-80">{detail}</p>
      ) : null}
    </div>
  );
}

function ServingList({
  title,
  dish,
  lines,
}: {
  title: string;
  dish: string | null;
  lines: KitchenDinerLine[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title} — {lines.length}
      </p>
      {dish ? (
        <p className="mt-0.5 text-sm font-medium text-foreground">{dish}</p>
      ) : null}
      {lines.length > 0 ? (
        <ul className="mt-1.5 space-y-0.5 text-sm text-muted-foreground">
          {lines.map((line) => (
            <li key={line.dinerId}>
              {line.name}
              {line.isFaculty ? (
                <span className="ml-1.5 text-xs opacity-70">(staff)</span>
              ) : null}
              {line.allergens.length > 0 || line.restrictions.length > 0 ? (
                <span className="ml-1.5 text-xs font-medium text-[#C0392B]">
                  see allergies
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1.5 text-sm text-muted-foreground">Nobody yet.</p>
      )}
    </div>
  );
}

function DayCard({
  day,
  defaultExpanded,
}: {
  day: KitchenDayPlan;
  defaultExpanded: boolean;
}) {
  return (
    <DashboardCard
      title={`${day.shortLabel}${day.isToday ? " · Today" : ""}`}
      description={
        day.menu
          ? `${day.menu.entree} · ${day.menu.sides.join(", ")}`
          : "Menu to be announced."
      }
      icon={<ChefHat className="size-5" />}
      status={{
        label: day.isOpen ? "Still open" : "Locked in",
        variant: day.isOpen ? "warning" : "success",
      }}
      expandable
      defaultExpanded={defaultExpanded}
    >
      {day.menuNote ? (
        <p className="mb-3 rounded-lg border border-[#D4A017]/40 bg-[#D4A017]/10 px-3 py-2 text-sm text-foreground">
          {day.menuNote}
        </p>
      ) : null}
      {!day.menuPublished ? (
        <p className="mb-3 text-xs text-muted-foreground">
          Standard rotating menu — no menu has been published for this day yet.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LUNCH_CHOICES.map((choice) => (
          <CountTile
            key={choice}
            choice={choice}
            value={day.counts[choice]}
            detail={
              choice === "HOT"
                ? day.menu?.entree
                : choice === "VEGETARIAN"
                  ? day.menu?.vegetarian
                  : null
            }
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 rounded-lg bg-muted/40 px-3 py-2 text-sm">
        <span>
          <span className="font-semibold text-[#2E8B57]">
            {day.traysToPrepare}
          </span>{" "}
          trays to prepare
        </span>
        <span className="text-muted-foreground">
          {day.totalResponses} response{day.totalResponses === 1 ? "" : "s"}
        </span>
        {!day.isOpen ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            Count is final
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <ServingList
          title="Hot lunch"
          dish={day.menu?.entree ?? null}
          lines={day.hot}
        />
        <ServingList
          title="Vegetarian"
          dish={day.menu?.vegetarian ?? null}
          lines={day.vegetarian}
        />
      </div>

      {day.dietaryFlags.length > 0 ? (
        <div className="mt-5 rounded-xl border border-[#C0392B]/30 bg-[#C0392B]/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#C0392B]">
            <Salad className="size-3.5" aria-hidden="true" />
            Allergies on the line — {day.dietaryFlags.length}
          </p>
          <ul className="mt-2 space-y-2.5">
            {day.dietaryFlags.map((line) => (
              <li key={line.dinerId}>
                <p className="text-sm font-medium text-foreground">
                  {line.name}
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    {LUNCH_CHOICE_META[line.choice].label}
                  </span>
                </p>
                <div className="mt-1">
                  <DietarySummary
                    allergens={line.allergens}
                    restrictions={line.restrictions}
                    notes={line.dietaryNotes}
                    compact
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {day.orderNotes.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Notes from families
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {day.orderNotes.map((line) => (
              <li key={line.dinerId}>
                <span className="font-medium text-foreground">{line.name}:</span>{" "}
                {line.orderNote}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </DashboardCard>
  );
}

export default async function LunchKitchenPage() {
  const user = await requireCampusAccess();

  if (!canManageLunch(user.role)) {
    redirect("/lunch");
  }

  const plan = await getLunchKitchenPlan();
  const totals = summarizeKitchenPlan(plan);
  const cutoffLabel = formatMinutes(LUNCH_ORDER_CUTOFF_HOUR * 60);

  const weeks = groupIntoServiceWeeks(plan, (day) => day.dateKey);
  const onServiceDay = isServiceDayToday();

  // On a weekend nothing is "today", so the first upcoming day is expanded
  // instead — Sunday prep should land on numbers, not on collapsed cards.
  const expandedDateKey =
    plan.find((day) => day.isToday)?.dateKey ?? plan[0]?.dateKey ?? null;

  return (
    <ShellPage
      title="Kitchen prep sheet"
      description={`What families chose, totalled by day and by dish. A day's count is final once ordering closes at ${cutoffLabel} that morning.`}
      actions={
        <>
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/lunch-menu">Menu calendar</Link>}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/lunch">Cafeteria lunch</Link>}
          />
        </>
      }
    >
      {!onServiceDay ? (
        <div className="rounded-xl border border-[#2F80ED]/40 bg-[#2F80ED]/10 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CalendarRange className="size-4 text-[#2F80ED]" aria-hidden="true" />
            No service today — here are the head counts for the week ahead
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The cafeteria is closed on weekends, but every count below is live.
            Families can still change a day until {cutoffLabel} that morning, so
            treat an open day as a working number and a locked day as final.
          </p>
        </div>
      ) : null}

      <DashboardCard
        title={`Next ${totals.daysCovered} service day${totals.daysCovered === 1 ? "" : "s"}`}
        description="Everything ordered across the whole window."
        icon={<ClipboardList className="size-5" />}
        status={{
          label: `${totals.traysToPrepare} trays`,
          variant: "info",
        }}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {LUNCH_CHOICES.map((choice) => (
            <CountTile
              key={choice}
              choice={choice}
              value={totals.counts[choice]}
            />
          ))}
        </div>
        {totals.dietaryFlagCount > 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {totals.dietaryFlagCount} tray
            {totals.dietaryFlagCount === 1 ? " goes" : "s go"} to someone with an
            allergy or restriction on file. Each day below lists them by name.
          </p>
        ) : null}
      </DashboardCard>

      {weeks.length > 0 ? (
        weeks.map((week, index) => {
          const weekTotals = summarizeKitchenPlan(week.days);

          return (
            <section key={week.key} className="space-y-4">
              <DashboardCard
                title={
                  index === 0 && !onServiceDay
                    ? `${week.shortLabel} — the week ahead`
                    : week.shortLabel
                }
                description={week.label}
                icon={<CalendarRange className="size-5" />}
                status={{
                  label: `${weekTotals.traysToPrepare} trays`,
                  variant: "info",
                }}
              >
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {LUNCH_CHOICES.map((choice) => (
                    <CountTile
                      key={choice}
                      choice={choice}
                      value={weekTotals.counts[choice]}
                    />
                  ))}
                </div>
              </DashboardCard>

              {week.days.map((day) => (
                <DayCard
                  key={day.dateKey}
                  day={day}
                  defaultExpanded={day.dateKey === expandedDateKey}
                />
              ))}
            </section>
          );
        })
      ) : (
        <DashboardCard
          title="Nothing to prepare yet"
          description="No lunch orders have been placed for the days ahead."
          icon={<ChefHat className="size-5" />}
        >
          <p className="text-sm text-muted-foreground">
            Orders appear here as families choose them on the Cafeteria Lunch
            page.
          </p>
        </DashboardCard>
      )}
    </ShellPage>
  );
}
