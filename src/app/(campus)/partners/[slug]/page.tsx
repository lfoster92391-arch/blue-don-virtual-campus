import { notFound } from "next/navigation";

import { BusinessPartnerDetailView } from "@/components/business-partners/business-partner-detail-view";
import { ShellPage } from "@/components/layout/shell-page";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getPartnerBySlug } from "@/services/business-partner-service";

type PartnerDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  await requireCompleteProfile();
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);

  if (!partner) {
    notFound();
  }

  return (
    <ShellPage title={partner.name} description="Business partner profile and opportunities.">
      <BusinessPartnerDetailView partner={partner} />
    </ShellPage>
  );
}
