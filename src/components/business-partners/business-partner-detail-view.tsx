"use client";

import Link from "next/link";
import { Briefcase, GraduationCap, MapPin, Users } from "lucide-react";

import { OPPORTUNITY_TYPE_LABELS } from "@/config/business-partners";
import type { BusinessPartnerDetail } from "@/services/business-partner-service";

type BusinessPartnerDetailViewProps = {
  partner: BusinessPartnerDetail;
};

export function BusinessPartnerDetailView({ partner }: BusinessPartnerDetailViewProps) {
  return (
    <div className="space-y-6">
      <Link href="/business-partners" className="text-sm font-medium text-[#2F80ED] hover:underline">
        ← All business partners
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm font-medium text-[#2F80ED]">{partner.industry}</p>
        <h2 className="mt-1 text-2xl font-semibold text-[#0A2342] dark:text-white">{partner.name}</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">{partner.description}</p>
        {partner.address ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4" />
            {partner.address}
          </p>
        ) : null}
        {partner.website ? (
          <a
            href={partner.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-[#2F80ED] hover:underline"
          >
            Visit website
          </a>
        ) : null}
      </div>

      {partner.careerInfo ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2">
            <Briefcase className="size-5 text-[#0A2342] dark:text-white" />
            <h3 className="text-lg font-semibold">Career information</h3>
          </div>
          <p className="text-sm text-muted-foreground">{partner.careerInfo}</p>
        </section>
      ) : null}

      {partner.opportunities.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold">Opportunities</h3>
          <ul className="mt-4 space-y-3">
            {partner.opportunities.map((opportunity) => (
              <li key={opportunity.id} className="rounded-lg border border-border px-4 py-3">
                <p className="font-medium">{opportunity.title}</p>
                <p className="text-xs text-[#2F80ED]">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</p>
                <p className="mt-2 text-sm text-muted-foreground">{opportunity.description}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {partner.employees.length > 0 ? (
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <Users className="size-5" />
              <h3 className="text-lg font-semibold">Team</h3>
            </div>
            <ul className="space-y-2">
              {partner.employees.map((employee) => (
                <li key={`${employee.name}-${employee.title}`} className="text-sm">
                  <span className="font-medium">{employee.name}</span>
                  <span className="text-muted-foreground"> · {employee.title}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {partner.alumni.length > 0 ? (
          <section className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <GraduationCap className="size-5" />
              <h3 className="text-lg font-semibold">Madonna alumni</h3>
            </div>
            <ul className="space-y-2">
              {partner.alumni.map((alum) => (
                <li key={alum.alumniName} className="text-sm">
                  <span className="font-medium">{alum.alumniName}</span>
                  {alum.graduationYear ? (
                    <span className="text-muted-foreground"> · Class of {alum.graduationYear}</span>
                  ) : null}
                  {alum.role ? (
                    <span className="block text-muted-foreground">{alum.role}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
