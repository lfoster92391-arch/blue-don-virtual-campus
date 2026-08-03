"use client";

import Link from "next/link";
import {
  Award,
  Briefcase,
  Heart,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { SuccessAnalyticsBucketId } from "@/config/success-analytics";
import type { SuccessAnalyticsData } from "@/services/success-analytics-service";

const bucketIcons: Record<SuccessAnalyticsBucketId, React.ReactNode> = {
  needingSupport: <Heart className="size-4" />,
  excelling: <Star className="size-4" />,
  missingOpportunities: <Sparkles className="size-4" />,
  needsServiceHours: <Award className="size-4" />,
  withoutClubs: <Users className="size-4" />,
  withoutResume: <Briefcase className="size-4" />,
};

const bucketOrder: SuccessAnalyticsBucketId[] = [
  "needingSupport",
  "excelling",
  "missingOpportunities",
  "needsServiceHours",
  "withoutClubs",
  "withoutResume",
];

const tagStyles: Record<SuccessAnalyticsBucketId, string> = {
  needingSupport: "bg-[#2F80ED]/10 text-[#2F80ED]",
  excelling: "bg-[#2E8B57]/10 text-[#2E8B57]",
  missingOpportunities: "bg-[#D4A017]/10 text-[#B8860B]",
  needsServiceHours: "bg-[#2F80ED]/10 text-[#2F80ED]",
  withoutClubs: "bg-[#D4A017]/10 text-[#B8860B]",
  withoutResume: "bg-[#2F80ED]/10 text-[#2F80ED]",
};

type SuccessAnalyticsDashboardProps = {
  data: SuccessAnalyticsData;
};

export function SuccessAnalyticsDashboard({ data }: SuccessAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Active students</p>
          <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">
            {data.totalStudents}
          </p>
        </div>
        <div className="rounded-xl border border-[#2E8B57]/20 bg-[#2E8B57]/5 p-4 sm:col-span-2">
          <p className="text-sm font-medium text-[#2E8B57]">Support-first lens</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Use these lists to celebrate growth and offer help — not to label or
            rank students.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {bucketOrder.map((bucketId) => {
          const bucket = data.buckets[bucketId];

          return (
            <DashboardCard
              key={bucketId}
              title={bucket.label}
              description={bucket.description}
              icon={bucketIcons[bucketId]}
              expandable
              defaultExpanded={bucket.count > 0 && bucket.count <= 8}
              status={
                bucket.count > 0
                  ? {
                      label: `${bucket.count} student${bucket.count === 1 ? "" : "s"}`,
                      variant: bucket.statusVariant,
                    }
                  : { label: "All supported", variant: "success" }
              }
            >
              {bucket.students.length > 0 ? (
                <ul className="space-y-3">
                  {bucket.students.map((student) => (
                    <li
                      key={`${bucketId}-${student.id}`}
                      className="rounded-lg border border-border bg-muted/20 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <p className="font-medium text-[#0A2342] dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.gradeLabel}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {student.actions.map((action) => (
                            <Button
                              key={`${student.id}-${action.label}`}
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              nativeButton={false}
                              render={
                                action.href.startsWith("mailto:") ? (
                                  <a href={action.href}>{action.label}</a>
                                ) : (
                                  <Link href={action.href}>{action.label}</Link>
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {student.reasonTags.map((tag) => (
                          <span
                            key={`${student.id}-${tag}`}
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${tagStyles[bucketId]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No students in this bucket right now — a good sign for this
                  category.
                </p>
              )}
            </DashboardCard>
          );
        })}
      </div>

      <footer className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-center text-xs text-muted-foreground">
        For authorized school staff only. Use to support students.
      </footer>
    </div>
  );
}
