import Link from "next/link";
import { redirect } from "next/navigation";
import { Salad } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DietaryReviewQueue } from "@/components/dietary/dietary-review-queue";
import { DietarySummary } from "@/components/dietary/dietary-summary";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageDietary } from "@/config/roles";
import { requireCampusAccess } from "@/lib/auth/session";
import {
  listDietaryRequests,
  listPendingDietaryRequests,
} from "@/services/dietary-service";

export const metadata = {
  title: "Dietary forms",
  description:
    "Review allergy and dietary restriction forms and apply them to student accounts.",
};

export default async function AdminDietaryPage() {
  const user = await requireCampusAccess();

  if (!canManageDietary(user.role)) {
    redirect("/lunch");
  }

  const [pending, accepted] = await Promise.all([
    listPendingDietaryRequests(),
    listDietaryRequests({ status: "ACCEPTED" }),
  ]);

  return (
    <ShellPage
      title="Dietary forms"
      description="Accept allergy and restriction forms submitted by families. Accepting writes the record onto the student account, where the cafeteria and lunch ordering board read it."
      actions={
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/lunch">Cafeteria lunch</Link>}
        />
      }
    >
      <DashboardCard
        title="Waiting for review"
        description="Each accepted form replaces that student's current dietary record."
        icon={<Salad className="size-5" />}
        status={{
          label: `${pending.length} pending`,
          variant: pending.length > 0 ? "warning" : "success",
        }}
      >
        <DietaryReviewQueue requests={pending} />
      </DashboardCard>

      <DashboardCard
        title="Applied to student accounts"
        description="Dietary records currently in force across the school."
        icon={<Salad className="size-5" />}
        status={{ label: `${accepted.length} on file`, variant: "info" }}
      >
        {accepted.length > 0 ? (
          <ul className="space-y-3">
            {accepted.map((request) => (
              <li
                key={request.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {request.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Accepted by {request.reviewedByName ?? "the office"}
                    {request.reviewedAt
                      ? ` on ${new Date(request.reviewedAt).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )}`
                      : ""}
                  </p>
                </div>
                <div className="mt-2">
                  <DietarySummary
                    allergens={request.allergens}
                    restrictions={request.restrictions}
                    notes={request.notes}
                    compact
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No dietary forms have been accepted yet.
          </p>
        )}
      </DashboardCard>
    </ShellPage>
  );
}
