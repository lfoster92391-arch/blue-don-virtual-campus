import Link from "next/link";
import { UserPlus } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { CampusUser } from "@/types/auth";
import { listPendingMembershipsForLedOrgs } from "@/services/academy-service";

const REVIEWER_ROLES = new Set<CampusUser["role"]>([
  "admin",
  "teacher",
  "advisor",
  "coach",
  "staff",
]);

export async function ClubJoinRequestsAlert({ user }: { user: CampusUser }) {
  if (!REVIEWER_ROLES.has(user.role)) {
    return null;
  }

  let pending: Awaited<ReturnType<typeof listPendingMembershipsForLedOrgs>> = [];
  try {
    pending = await listPendingMembershipsForLedOrgs(user.id, user.role);
  } catch (error) {
    console.error("[home] club join requests alert failed:", error);
    return null;
  }

  if (pending.length === 0) {
    return null;
  }

  const byOrg = new Map<string, { name: string; slug: string; count: number }>();
  for (const membership of pending) {
    const slug = membership.organizationSlug ?? membership.academy.slug;
    const existing = byOrg.get(slug);
    if (existing) {
      existing.count += 1;
    } else {
      byOrg.set(slug, {
        name: membership.academy.name,
        slug,
        count: 1,
      });
    }
  }

  const orgs = [...byOrg.values()];
  const primary = orgs[0];

  return (
    <DashboardCard
      title="Club join requests"
      description="Students are waiting for advisor approval."
      icon={<UserPlus className="size-5" />}
      status={{
        label: `${pending.length} pending`,
        variant: "warning",
      }}
      actions={
        primary ? (
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/organizations/${primary.slug}`}>Review</Link>}
          />
        ) : null
      }
    >
      <ul className="space-y-2 text-sm">
        {orgs.map((org) => (
          <li
            key={org.slug}
            className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
          >
            <Link
              href={`/organizations/${org.slug}`}
              className="font-medium hover:underline"
            >
              {org.name}
            </Link>
            <span className="text-xs font-medium text-[#D4A017]">
              {org.count} request{org.count === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Open the organization page to approve or reject each request.
      </p>
    </DashboardCard>
  );
}
