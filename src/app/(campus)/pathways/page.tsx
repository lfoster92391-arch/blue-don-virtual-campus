import Link from "next/link";
import { Briefcase, Compass, GraduationCap, Heart, Handshake, Hammer, Flag, Target, Globe, Sparkles } from "lucide-react";

import { PathwayCard } from "@/components/academy-engine/pathway-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { HiddenCareersExplorer } from "@/components/pathways/hidden-careers-explorer";
import { Button } from "@/components/ui/button";
import { CAREER_PATHWAYS } from "@/lib/academy-engine/constants";
import { COUNSELING_RESOURCES } from "@/config/guidance-engine";
import { COMMUNITY_CATEGORY_META, getPartnerHref } from "@/config/partners";
import { PROFESSIONAL_SKILLS_WAVE_LABEL } from "@/config/professional-skills";
import { businessPartnerToListItem } from "@/lib/partners";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listPathwayDashboards } from "@/services/academy-engine-service";
import { listApprovedPartners } from "@/services/business-partner-service";
import { listCommunityPartners } from "@/services/partner-service";
import { listProfessionalSkillTracks } from "@/services/professional-skills-service";

export default async function PathwaysPage() {
  const user = await requireCompleteProfile();
  const [dashboards, businessRows, communityPartners] = await Promise.all([
    listPathwayDashboards(user.id),
    listApprovedPartners(),
    listCommunityPartners(),
  ]);

  const partnerHighlights = [
    ...businessRows.slice(0, 2).map(businessPartnerToListItem),
    ...communityPartners.slice(0, 4),
  ];

  const ordered = CAREER_PATHWAYS.map((pathway) =>
    dashboards.find((d) => d.pathway === pathway.value),
  ).filter((d): d is NonNullable<typeof d> => d !== undefined);
  const professionalTracks = listProfessionalSkillTracks();

  return (
    <ShellPage
      title="Career Pathway Dashboard"
      description="Choose your destination. Madonna Education Network recommends labs, certifications, projects, and leadership opportunities across all academies."
    >
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/opportunities">Opportunity Center</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/scholarships">Scholarship Center</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/academies">All academies</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/mentors">Mentor Network</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/partners">All partners</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/community-partners">Community partners</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/business-partners">Business partners</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/career-portfolio">Career Portfolio</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/professional-skills">Professional Skills</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/dashboard">Dashboard</Link>} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-4">
          <Compass className="size-6 shrink-0 text-[#2F80ED]" />
          <p className="text-sm text-muted-foreground">
            One Academy Engine powers all pathways. Content changes; architecture stays the same.
            Progression: Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone.
          </p>
        </div>
        <Link
          href="/scholarships"
          className="flex items-center gap-3 rounded-xl border border-[#2E8B57]/40 bg-gradient-to-br from-[#2E8B57]/10 to-[#C9A227]/10 p-4 transition-colors hover:border-[#2E8B57]/60"
        >
          <GraduationCap className="size-6 shrink-0 text-[#2E8B57]" />
          <div>
            <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
              Scholarship Center
            </p>
            <p className="text-sm text-muted-foreground">
              Good News! Blue Don matches your profile to scholarships you qualify for.
            </p>
          </div>
        </Link>
        <Link
          href="/opportunities"
          className="flex items-center gap-3 rounded-xl border border-[#2F80ED]/40 bg-gradient-to-br from-[#2F80ED]/10 to-[#C9A227]/10 p-4 transition-colors hover:border-[#2F80ED]/60"
        >
          <Sparkles className="size-6 shrink-0 text-[#2F80ED]" />
          <div>
            <p className="text-sm font-semibold text-[#0A2342] dark:text-white">
              Opportunity Center
            </p>
            <p className="text-sm text-muted-foreground">
              Internships, jobs, volunteering, and summer programs across the Ohio Valley.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {ordered.map((dashboard) => (
          <PathwayCard key={dashboard.pathway} dashboard={dashboard} />
        ))}
      </div>

      <DashboardCard
        title="Hidden Careers of the Ohio Valley"
        description="Real jobs in Weirton, East Liverpool, and the upper Ohio Valley that most students never hear about in high school."
        icon={<Sparkles className="size-5" />}
        status={{ label: "Local", variant: "warning" }}
        defaultExpanded
        className="mt-8"
      >
        <HiddenCareersExplorer />
      </DashboardCard>

      <DashboardCard
        title="Graduate Impact & Pathways"
        description="Passports, capstone projects, legacy pages, and community impact — W19."
        icon={<GraduationCap className="size-5" />}
        status={{ label: "W19", variant: "success" }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <HubLink href="/college-passport" icon={<GraduationCap className="size-4" />} label="College Readiness Passport" detail="SAT, FAFSA, essays, scholarships" />
          <HubLink href="/trade-passport" icon={<Hammer className="size-4" />} label="Trade Passport" detail="OSHA, apprenticeships, certifications" />
          <HubLink href="/military-passport" icon={<Flag className="size-4" />} label="Military Passport" detail="ASVAB, ROTC, fitness, scholarships" />
          <HubLink href="/impact-project" icon={<Target className="size-4" />} label="Impact Before Diploma" detail="Senior capstone requirement" />
          <HubLink href="/my-legacy" icon={<GraduationCap className="size-4" />} label="My Legacy" detail="Build your graduate legacy page" />
          <HubLink href="/community-impact" icon={<Globe className="size-4" />} label="Community Impact" detail="School-wide service dashboard" />
          <HubLink href="/career-portfolio" icon={<Compass className="size-4" />} label="Career Portfolio" detail="Everything. One link." />
        </div>
      </DashboardCard>

      <DashboardCard
        title="Professional Skills"
        description="Resume writing, interview prep, business email, and customer service — career-readiness tracks."
        icon={<Briefcase className="size-5" />}
        status={{ label: PROFESSIONAL_SKILLS_WAVE_LABEL.split(" · ")[0] ?? "W19", variant: "info" }}
        actions={
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/professional-skills">View all tracks</Link>}
          />
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {professionalTracks.map((track) => (
            <Link
              key={track.slug}
              href={`/professional-skills/${track.slug}`}
              className="rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40"
            >
              <p className="font-medium text-foreground">
                {track.icon} {track.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {track.description}
              </p>
              <p className="mt-2 text-xs text-[#2E8B57]">{track.xpOpportunityLabel}</p>
            </Link>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard
        title="Guidance & Counseling"
        description="Academic, personal, and crisis support resources."
        icon={<Heart className="size-5" />}
        status={{ label: "W13", variant: "info" }}
      >
        <ul className="space-y-2">
          {COUNSELING_RESOURCES.map((resource) => (
            <li key={resource.id}>
              {resource.href ? (
                <Link
                  href={resource.href}
                  className={`block rounded-lg border px-3 py-2 transition-colors hover:border-[#2F80ED]/40 ${
                    resource.type === "crisis"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </Link>
              ) : (
                <div
                  className={`rounded-lg border px-3 py-2 ${
                    resource.type === "crisis"
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-border"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{resource.title}</p>
                  <p className="text-xs text-muted-foreground">{resource.description}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </DashboardCard>

      <DashboardCard
        title="Partner Programs"
        description="Business and community partners connected to Madonna pathways."
        icon={<Handshake className="size-5" />}
        actions={
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/partners">Browse all</Link>} />
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Button size="sm" nativeButton={false} render={<Link href="/community-partners">Community directory</Link>} />
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/business-partners/apply">Apply as a partner</Link>} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {partnerHighlights.map((program) => {
            const categoryLabel = program.communityCategory
              ? COMMUNITY_CATEGORY_META[program.communityCategory].label
              : program.partnerType === "BUSINESS"
                ? "Business"
                : "Partner";

            return (
              <Link
                key={program.id}
                href={getPartnerHref(program.slug, program.partnerType)}
                className="rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#2F80ED]/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{program.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{program.description}</p>
                    <p className="mt-1 text-xs text-[#2F80ED]">{categoryLabel}</p>
                  </div>
                  {program.schoolApproved ? (
                    <span className="shrink-0 rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
                      approved
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      </DashboardCard>
    </ShellPage>
  );
}

function HubLink({
  href,
  icon,
  label,
  detail,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:border-[#D4A017]/40"
    >
      <span className="mt-0.5 text-[#D4A017]">{icon}</span>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </Link>
  );
}
