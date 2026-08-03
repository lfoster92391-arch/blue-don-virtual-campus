import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Briefcase,
  ExternalLink,
  GraduationCap,
  MapPin,
  Users,
  Wrench,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { OPPORTUNITY_TYPE_LABELS } from "@/config/business-partners";
import type { BusinessPartnerOpportunityType } from "@/generated/prisma/client";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getPartnerBySlug } from "@/services/business-partner-service";

const SECTION_ORDER: BusinessPartnerOpportunityType[] = [
  "INTERNSHIP",
  "JOB_SHADOW",
  "HIRING",
];

const SECTION_ICONS: Record<BusinessPartnerOpportunityType, React.ReactNode> = {
  CAREER_INFO: <Briefcase className="size-5" />,
  INTERNSHIP: <Wrench className="size-5" />,
  JOB_SHADOW: <Users className="size-5" />,
  HIRING: <Briefcase className="size-5" />,
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BusinessPartnerDetailPage({ params }: PageProps) {
  await requireCompleteProfile();
  const { slug } = await params;
  const partner = await getPartnerBySlug(slug);

  if (!partner) {
    notFound();
  }

  const opportunitiesByType = SECTION_ORDER.map((type) => ({
    type,
    label: OPPORTUNITY_TYPE_LABELS[type],
    items: partner.opportunities.filter((opp) => opp.type === type),
  })).filter((section) => section.items.length > 0);

  return (
    <ShellPage
      title={partner.name}
      description={partner.description}
      actions={
        <div className="flex flex-wrap gap-2">
          {partner.website ? (
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <a href={partner.website} target="_blank" rel="noopener noreferrer">
                  Website
                  <ExternalLink className="size-3.5" />
                </a>
              }
            />
          ) : null}
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/business-partners">All business partners</Link>} />
        </div>
      }
    >
      <div className="rounded-xl border border-[#0A2342]/20 bg-gradient-to-br from-[#0A2342] to-[#0A2342]/90 p-6 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-[#D4A017]">{partner.industry}</p>
        <h2 className="mt-2 text-2xl font-semibold">{partner.name}</h2>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/80">
          {partner.address ? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" />
              {partner.address}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Briefcase className="size-4" />
            {partner.opportunityCount} active opportunities
          </span>
        </div>
      </div>

      {partner.careerInfo ? (
        <DashboardCard title="Career Information" icon={<Briefcase className="size-5" />}>
          <p className="text-sm leading-relaxed text-foreground">{partner.careerInfo}</p>
        </DashboardCard>
      ) : null}

      {opportunitiesByType.map((section) => (
        <DashboardCard
          key={section.type}
          title={section.label}
          icon={SECTION_ICONS[section.type]}
        >
          <ul className="space-y-3">
            {section.items.map((opp) => (
              <li key={opp.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{opp.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{opp.description}</p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ))}

      {partner.employees.length > 0 ? (
        <DashboardCard title="Current Employees" description="Meet the team" icon={<Users className="size-5" />}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {partner.employees.map((employee) => (
              <li key={`${employee.name}-${employee.title}`} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{employee.name}</p>
                <p className="text-sm text-muted-foreground">{employee.title}</p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      {partner.alumni.length > 0 ? (
        <DashboardCard
          title="Madonna Alumni"
          description="Blue Don graduates who work here"
          icon={<GraduationCap className="size-5" />}
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partner.alumni.map((alum) => (
              <li key={`${alum.alumniName}-${alum.role}`} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium text-foreground">{alum.alumniName}</p>
                <p className="text-sm text-muted-foreground">
                  {alum.role}
                  {alum.graduationYear ? ` · Class of ${alum.graduationYear}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      <DashboardCard title="Interested students">
        <p className="text-sm text-muted-foreground">
          Talk with your counselor or visit the Future Center to connect with {partner.name} about
          internships, shadow days, or open positions.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" nativeButton={false} render={<Link href="/pathways">Future Center</Link>} />
          <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/opportunities">Opportunity Center</Link>} />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
