import { notFound } from "next/navigation";

import { CareerPortfolioHero } from "@/components/career-portfolio/career-portfolio-hero";
import { CareerPortfolioSections } from "@/components/career-portfolio/career-portfolio-sections";
import { CAREER_PORTFOLIO_TAGLINE } from "@/config/career-portfolio";
import { siteConfig } from "@/config/site";
import { getPublicCareerPortfolio } from "@/services/career-portfolio-service";

type PublicCareerPortfolioPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PublicCareerPortfolioPageProps) {
  const { slug } = await params;
  const portfolio = await getPublicCareerPortfolio(slug);

  if (!portfolio) {
    return { title: "Portfolio not found" };
  }

  return {
    title: `${portfolio.profile.displayName} · Career Portfolio`,
    description: `${CAREER_PORTFOLIO_TAGLINE} Graduate portfolio for ${portfolio.profile.displayName}.`,
  };
}

export default async function PublicCareerPortfolioPage({
  params,
}: PublicCareerPortfolioPageProps) {
  const { slug } = await params;
  const portfolio = await getPublicCareerPortfolio(slug);

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2F80ED]">
              {siteConfig.institution}
            </p>
            <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
          </div>
          <p className="text-sm font-medium text-[#D4A017]">{CAREER_PORTFOLIO_TAGLINE}</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
        <CareerPortfolioHero
          displayName={portfolio.profile.displayName}
          shareUrl={portfolio.settings.shareUrl}
          slug={portfolio.settings.slug}
          isPublic={portfolio.settings.isPublic}
          completionPercent={portfolio.completionPercent}
          classLabel={portfolio.profile.classLabel}
          academyLabel={portfolio.profile.academyLabel}
          preview
        />

        <CareerPortfolioSections sections={portfolio.sections} publicView />
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        {siteConfig.institution} · {siteConfig.shortName}
      </footer>
    </div>
  );
}
