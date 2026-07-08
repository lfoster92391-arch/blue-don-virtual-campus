import Link from "next/link";
import { notFound } from "next/navigation";

import { LearningFlow } from "@/components/academy-engine/learning-flow";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getModuleDetail } from "@/services/academy-engine-service";

type ModuleDetailPageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export default async function ModuleDetailPage({ params }: ModuleDetailPageProps) {
  const { slug, id } = await params;
  const user = await requireCompleteProfile();
  const module = await getModuleDetail(slug, id, user.id);

  if (!module) {
    notFound();
  }

  return (
    <ShellPage
      title={module.title}
      description={module.description ?? `Learning module in ${module.academyName}`}
    >
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href={`/academies/${slug}?tab=modules`}>Back to academy</Link>}
      />
      <div className="mt-6">
        <LearningFlow module={module} />
      </div>
    </ShellPage>
  );
}
