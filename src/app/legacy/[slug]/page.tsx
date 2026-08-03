import { notFound } from "next/navigation";

import { GraduateLegacyDisplay } from "@/components/graduate-legacy/graduate-legacy-display";
import { GRADUATE_LEGACY_TAGLINE } from "@/config/graduate-legacy";
import { siteConfig } from "@/config/site";
import { getPublicGraduateLegacy } from "@/services/graduate-legacy-service";

type PublicLegacyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicLegacyPageProps) {
  const { slug } = await params;
  const legacy = await getPublicGraduateLegacy(slug);

  if (!legacy) {
    return { title: "Legacy page not found" };
  }

  return {
    title: `${legacy.displayName} · Class of ${legacy.classYear}`,
    description: `${GRADUATE_LEGACY_TAGLINE} Graduate legacy for ${legacy.displayName}.`,
  };
}

export default async function PublicLegacyPage({ params }: PublicLegacyPageProps) {
  const { slug } = await params;
  const legacy = await getPublicGraduateLegacy(slug);

  if (!legacy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2F80ED]">
            {siteConfig.institution}
          </p>
          <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <GraduateLegacyDisplay legacy={legacy} />
      </main>
    </div>
  );
}
