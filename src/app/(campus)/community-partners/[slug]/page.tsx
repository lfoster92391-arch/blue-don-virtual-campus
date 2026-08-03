import { notFound } from "next/navigation";

import { PartnerDetailView } from "@/components/partners/partner-detail-view";
import { ShellPage } from "@/components/layout/shell-page";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getCommunityPartnerBySlug } from "@/services/partner-service";

type CommunityPartnerDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CommunityPartnerDetailPage({
  params,
}: CommunityPartnerDetailPageProps) {
  await requireCompleteProfile();
  const { slug } = await params;
  const partner = await getCommunityPartnerBySlug(slug);

  if (!partner) {
    notFound();
  }

  return (
    <ShellPage title={partner.name} description="Community partner profile and opportunities.">
      <PartnerDetailView
        partner={partner}
        backHref="/community-partners"
        backLabel="Community partners directory"
      />
    </ShellPage>
  );
}
