import Link from "next/link";

import { FindYourPlaceExplorer } from "@/components/organizations/find-your-place-explorer";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { isFacultyClubLookupRole } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import type { OrganizationDiscoveryCard } from "@/lib/organization-discovery";
import {
  getRecommendedOrganizations,
  listDiscoverableOrganizations,
} from "@/services/organization-discovery-service";

function attachApplicationStatuses(
  organizations: OrganizationDiscoveryCard[],
  statusByAcademyId: Map<string, OrganizationDiscoveryCard["applicationStatus"]>,
): OrganizationDiscoveryCard[] {
  return organizations.map((organization) => ({
    ...organization,
    applicationStatus: organization.academyId
      ? (statusByAcademyId.get(organization.academyId) ?? null)
      : null,
  }));
}

export default async function FindYourPlacePage() {
  const user = await requireCompleteProfile();
  const facultyLookup = isFacultyClubLookupRole(user.role);

  const [organizations, recommended, membershipStatuses] = await Promise.all([
    listDiscoverableOrganizations(),
    facultyLookup
      ? Promise.resolve([])
      : getRecommendedOrganizations(user.id),
    user.role === "student" && isPrismaReady()
      ? withDatabase((prisma) =>
          prisma.academyMembership.findMany({
            where: { userId: user.id },
            select: { academyId: true, status: true },
          }),
        )
      : Promise.resolve(null),
  ]);

  const statusByAcademyId = new Map(
    (membershipStatuses ?? []).map((row) => [row.academyId, row.status]),
  );

  const organizationsWithStatus = attachApplicationStatuses(
    organizations,
    statusByAcademyId,
  );
  const recommendedWithStatus = recommended.map((org) => ({
    ...org,
    applicationStatus: org.academyId
      ? (statusByAcademyId.get(org.academyId) ?? null)
      : null,
  }));

  return (
    <ShellPage
      title={facultyLookup ? "Clubs & Organizations" : "Find Your Place"}
      description={
        facultyLookup
          ? "Browse every club on campus so you can look up Art Club, Drama Club, Chess Club, and more with students."
          : "Find your community. Build your future. Every card answers: What is this? Why should I join? How will it help me?"
      }
    >
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/athletics">Athletics</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/academies">Academies</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/events">Events</Link>} />
      </div>

      <div className="mt-8">
        <FindYourPlaceExplorer
          organizations={organizationsWithStatus}
          recommended={recommendedWithStatus}
          facultyLookup={facultyLookup}
        />
      </div>
    </ShellPage>
  );
}
