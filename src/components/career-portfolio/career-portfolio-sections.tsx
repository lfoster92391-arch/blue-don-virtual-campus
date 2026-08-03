import Link from "next/link";
import {
  Award,
  Briefcase,
  FileText,
  FolderOpen,
  GraduationCap,
  Heart,
  Mail,
  Trophy,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import type { CareerPortfolioSection } from "@/services/career-portfolio-service";
import type { CareerPortfolioSectionId } from "@/config/career-portfolio";

const SECTION_ICONS: Record<CareerPortfolioSectionId, React.ReactNode> = {
  resume: <FileText className="size-5" />,
  portfolio: <FolderOpen className="size-5" />,
  "reference-letters": <Mail className="size-5" />,
  certifications: <Award className="size-5" />,
  projects: <Trophy className="size-5" />,
  internships: <Briefcase className="size-5" />,
  volunteer: <Heart className="size-5" />,
  leadership: <Users className="size-5" />,
  transcript: <GraduationCap className="size-5" />,
};

const SOURCE_VARIANTS = {
  live: "success",
  seed: "warning",
  placeholder: "info",
} as const;

type CareerPortfolioSectionsProps = {
  sections: CareerPortfolioSection[];
  publicView?: boolean;
};

export function CareerPortfolioSections({
  sections,
  publicView = false,
}: CareerPortfolioSectionsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {sections.map((section) => (
        <DashboardCard
          key={section.id}
          title={section.title}
          description={section.description}
          icon={SECTION_ICONS[section.id]}
          status={{
            label: section.source,
            variant: SOURCE_VARIANTS[section.source],
          }}
          expandable
          defaultExpanded={section.items.length > 0}
        >
          {section.items.length > 0 ? (
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-[#2F80ED]/30"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {item.href && !publicView ? (
                        <Link
                          href={item.href}
                          className="font-medium text-foreground hover:text-[#2F80ED]"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <p className="font-medium text-foreground">{item.title}</p>
                      )}
                      {item.subtitle ? (
                        <p className="text-sm text-[#2F80ED]">{item.subtitle}</p>
                      ) : null}
                      {item.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-muted-foreground">
                      {item.dateLabel ? <span>{item.dateLabel}</span> : null}
                      {item.badge ? (
                        <span className="rounded bg-muted px-1.5 py-0.5 capitalize">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {section.emptyMessage ?? "No items yet."}
            </p>
          )}
        </DashboardCard>
      ))}
    </div>
  );
}
