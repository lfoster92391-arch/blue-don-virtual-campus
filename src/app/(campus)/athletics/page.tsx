import Link from "next/link";

import { OrganizationDirectory } from "@/components/organizations/organization-directory";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { ATHLETICS_CATEGORIES } from "@/config/madonna-organizations";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listOrganizationGroups } from "@/services/org-service";

export default async function AthleticsPage() {
  await requireCompleteProfile();
  const groups = await listOrganizationGroups(ATHLETICS_CATEGORIES);

  return (
    <ShellPage
      title="Athletics"
      description="Fall, winter, and spring Blue Don teams — schedules, rosters, and team headquarters."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/find-your-place">Find Your Place</Link>} />

      <div className="mt-8">
        <OrganizationDirectory groups={groups} />
      </div>
    </ShellPage>
  );
}
