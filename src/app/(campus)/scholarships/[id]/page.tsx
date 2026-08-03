import Link from "next/link";
import { notFound } from "next/navigation";

import { ScholarshipDetailHero } from "@/components/scholarships/scholarship-detail-hero";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getScholarshipMatch } from "@/services/scholarship-service";

type ScholarshipDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  const { id } = await params;
  const user = await requireCompleteProfile();
  const result = await getScholarshipMatch(user.id, id);

  if (!result) {
    notFound();
  }

  return (
    <ShellPage
      title={result.scholarship.title}
      description={result.scholarship.provider}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/scholarships">Back to Scholarship Center</Link>}
        />
      }
    >
      <ScholarshipDetailHero match={result.match} />
    </ShellPage>
  );
}
