import Link from "next/link";
import { ArrowLeft, GraduationCap } from "lucide-react";

import { CollegePassport } from "@/components/college-readiness/college-passport";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  COLLEGE_READINESS_PASSPORT_TAGLINE,
  isCollegePassportEligible,
} from "@/config/college-readiness-passport";
import { BLUE_DON_PASS } from "@/config/identity-engine";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getPassport } from "@/services/college-readiness-service";

export default async function CollegePassportPage() {
  const user = await requireCompleteProfile();
  const gradeLevel = Number.parseInt(BLUE_DON_PASS.grade, 10) || null;
  const passport = await getPassport(user.id, gradeLevel);
  const eligible = isCollegePassportEligible(gradeLevel);

  return (
    <ShellPage
      title="College Readiness Passport"
      description={COLLEGE_READINESS_PASSPORT_TAGLINE}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/pathways">
              <ArrowLeft className="size-3.5" />
              Future Center
            </Link>
          }
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <GraduationCap className="size-4 text-[#D4A017]" />
        <span>W19 · Graduate Impact & Pathways</span>
        {eligible ? (
          <span className="rounded-full bg-[#D4A017]/15 px-2 py-0.5 text-xs font-medium text-[#D4A017]">
            Grades 11–12
          </span>
        ) : null}
      </div>

      {!eligible ? (
        <div className="mb-6 rounded-xl border border-[#2F80ED]/30 bg-[#2F80ED]/5 p-4 text-sm text-muted-foreground">
          This passport is designed for juniors and seniors. You can still preview milestones
          and track progress when you reach grade 11.
        </div>
      ) : null}

      <CollegePassport
        items={passport.items}
        remainingItems={passport.remainingItems}
        percentComplete={passport.percentComplete}
        completedCount={passport.completedCount}
        totalCount={passport.totalCount}
      />
    </ShellPage>
  );
}
