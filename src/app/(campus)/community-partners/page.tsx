import Link from "next/link";
import { Suspense } from "react";
import { Handshake } from "lucide-react";

import { PartnerDirectory } from "@/components/partners/partner-directory";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import type { CommunityCategory } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listCommunityPartnerGroups } from "@/services/partner-service";

type CommunityPartnersPageProps = {
  searchParams: Promise<{ category?: string }>;
};

export default async function CommunityPartnersPage({
  searchParams,
}: CommunityPartnersPageProps) {
  await requireCompleteProfile();
  const params = await searchParams;
  const category = params.category as CommunityCategory | undefined;
  const groups = await listCommunityPartnerGroups(category);

  return (
    <ShellPage
      title="Community Partners"
      description="Hospitals, police, fire, banks, churches, manufacturers, tech firms, and builders serving the Madonna community."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/partners?type=community">
              <Handshake className="size-3.5" />
              All partners
            </Link>
          }
        />
      }
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">Loading partners…</p>}>
        <PartnerDirectory groups={groups} activeCategory={category ?? null} />
      </Suspense>
    </ShellPage>
  );
}
