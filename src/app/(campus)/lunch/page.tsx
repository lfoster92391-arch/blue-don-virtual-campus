import Link from "next/link";
import { ChefHat, Salad, UtensilsCrossed } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  DietaryRequestForm,
  type DietaryFormStudent,
} from "@/components/dietary/dietary-request-form";
import { LunchOrderBoard } from "@/components/lunch/lunch-order-board";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { LUNCH_ORDER_CUTOFF_HOUR } from "@/config/lunch";
import {
  canManageDietary,
  canManageLunch,
  canOrderLunch,
  canSubmitDietaryForm,
} from "@/config/roles";
import { formatMinutes } from "@/config/school-hub";
import { requireCampusAccess } from "@/lib/auth/session";
import { listDietaryRequests } from "@/services/dietary-service";
import { getLunchBoard, getLunchKitchenCounts } from "@/services/lunch-service";

export const metadata = {
  title: "Cafeteria Lunch",
  description:
    "Order hot lunch, the vegetarian option, or mark a packed lunch for the week ahead.",
};

export default async function LunchPage() {
  const user = await requireCampusAccess();

  const canOrder = canOrderLunch(user.role);
  const canManage = canManageLunch(user.role);
  const canReviewDietary = canManageDietary(user.role);

  const [board, kitchenCounts] = await Promise.all([
    getLunchBoard({
      id: user.id,
      displayName: user.displayName,
      role: user.role,
    }),
    canManage ? getLunchKitchenCounts() : Promise.resolve([]),
  ]);

  const cutoffLabel = formatMinutes(LUNCH_ORDER_CUTOFF_HOUR * 60);

  // Dietary forms are submitted for students, never for a faculty member's own
  // tray, so the form only covers linked students on this board.
  const studentDiners = board.diners.filter((diner) => diner.kind === "student");
  const showDietaryForm =
    canSubmitDietaryForm(user.role) && studentDiners.length > 0;

  const pendingDietary = showDietaryForm
    ? await listDietaryRequests({
        status: "PENDING",
        studentIds: studentDiners.map((diner) => diner.id),
      })
    : [];

  const dietaryStudents: DietaryFormStudent[] = studentDiners.map((diner) => ({
    id: diner.id,
    displayName: diner.displayName,
    allergens: diner.dietary?.allergens ?? [],
    restrictions: diner.dietary?.restrictions ?? [],
    notes: diner.dietary?.notes ?? null,
    hasPendingRequest: pendingDietary.some(
      (request) => request.studentId === diner.id,
    ),
  }));

  return (
    <ShellPage
      title="Cafeteria Lunch"
      description={
        canOrder
          ? `Choose hot lunch, the vegetarian option, or a packed lunch for the days ahead. Orders for each day close at ${cutoffLabel} that morning.`
          : "The rotating cafeteria menu for the week ahead."
      }
      actions={
        canReviewDietary ? (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href="/admin/dietary">Review dietary forms</Link>}
          />
        ) : undefined
      }
    >
      {canOrder ? (
        <DashboardCard
          title="Place your lunch order"
          description="Pick a choice for each day. Changes save as you tap and can be updated until the morning cutoff."
          icon={<UtensilsCrossed className="size-5" />}
        >
          <LunchOrderBoard board={board} />
        </DashboardCard>
      ) : (
        <DashboardCard
          title="This week's menu"
          description="Your account does not order cafeteria lunch."
          icon={<UtensilsCrossed className="size-5" />}
        >
          <ul className="divide-y divide-border">
            {board.days.map((day) => (
              <li key={day.dateKey} className="py-2">
                <p className="text-sm font-medium text-foreground">
                  {day.shortLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {day.menu
                    ? `${day.menu.entree} · ${day.menu.sides.join(", ")}`
                    : "Menu to be announced."}
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      )}

      {showDietaryForm ? (
        <DashboardCard
          title="Allergies & dietary needs"
          description="Tell the cafeteria what your student can and cannot eat. The school office reviews and accepts each form before it takes effect."
          icon={<Salad className="size-5" />}
        >
          <DietaryRequestForm students={dietaryStudents} />
        </DashboardCard>
      ) : null}

      {canManage ? (
        <DashboardCard
          title="Kitchen counts"
          description="Trays to prepare per day across the whole school."
          icon={<ChefHat className="size-5" />}
          status={{ label: "Staff view", variant: "info" }}
        >
          {kitchenCounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Day</th>
                    <th className="py-2 pr-3 font-medium">Hot</th>
                    <th className="py-2 pr-3 font-medium">Vegetarian</th>
                    <th className="py-2 pr-3 font-medium">Packed</th>
                    <th className="py-2 pr-3 font-medium">Not eating</th>
                    <th className="py-2 font-medium">Trays</th>
                  </tr>
                </thead>
                <tbody>
                  {kitchenCounts.map((row) => (
                    <tr key={row.dateKey} className="border-b border-border/60">
                      <td className="py-2 pr-3 font-medium text-foreground">
                        {row.shortLabel}
                      </td>
                      <td className="py-2 pr-3">{row.counts.HOT}</td>
                      <td className="py-2 pr-3">{row.counts.VEGETARIAN}</td>
                      <td className="py-2 pr-3">{row.counts.PACKED}</td>
                      <td className="py-2 pr-3">{row.counts.NONE}</td>
                      <td className="py-2 font-semibold text-[#2E8B57]">
                        {row.traysToPrepare}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No lunch orders recorded for the days ahead yet.
            </p>
          )}
        </DashboardCard>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Menus rotate on a weekly cycle. Questions about allergies or billing go to
        the main office.
      </p>
    </ShellPage>
  );
}
