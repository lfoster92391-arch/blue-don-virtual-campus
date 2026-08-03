import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { CareerPortfolioHero } from "@/components/career-portfolio/career-portfolio-hero";
import { CareerPortfolioSections } from "@/components/career-portfolio/career-portfolio-sections";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { CAREER_PORTFOLIO_TAGLINE } from "@/config/career-portfolio";
import { requireCompleteProfile } from "@/lib/auth/session";
import { buildCareerPortfolio } from "@/services/career-portfolio-service";

export default async function CareerPortfolioPage() {
  const user = await requireCompleteProfile();
  const portfolio = await buildCareerPortfolio(user.id, { includeDrafts: true });

  return (
    <ShellPage
      title="Career Portfolio"
      description={`${CAREER_PORTFOLIO_TAGLINE} Share your resume, certifications, service, and achievements with one link.`}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/portfolio">
              Manage items
              <ExternalLink className="size-3.5" />
            </Link>
          }
        />
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/my-legacy">My Legacy</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/impact-project">Impact Before Diploma</Link>} />
      </div>

      <CareerPortfolioHero
        displayName={portfolio.profile.displayName}
        shareUrl={portfolio.settings.shareUrl}
        slug={portfolio.settings.slug}
        isPublic={portfolio.settings.isPublic}
        completionPercent={portfolio.completionPercent}
        classLabel={portfolio.profile.classLabel}
        academyLabel={portfolio.profile.academyLabel}
      />

      <CareerPortfolioSections sections={portfolio.sections} />
    </ShellPage>
  );
}
