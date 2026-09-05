import Link from "next/link";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canAccessAdmin, canApproveForms } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ConstitutionPage() {
  const user = await requireCompleteProfile();

  if (!canAccessAdmin(user.role) && !canApproveForms(user.role)) {
    redirect("/dashboard");
  }

  return (
    <ShellPage
      title="Campus Constitution"
      description="Governance charter for Madonna High School campus programs."
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link href="/admin">Back to governance</Link>}
      />

      <div className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Article I — Mission
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Madonna High School exists to help students choose their path and
            build their future through academy programs, service, and accountable
            participation in campus life.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Article II — Agreements &amp; Forms
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Students, parents, advisors, and sponsors complete required forms before
            participating in programs. Forms follow the campus workflow: Draft →
            Review → Approve → Publish → Complete → Archive.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Article III — Approvals
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Advisors and administrators review submissions for academy enrollment,
            purchases, events, travel, publishing, capstone work, and sponsor
            activities. The Impact Fund supports student-led proposals with campus
            voting and administrator allocation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
            Article IV — Records
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Archived forms and submissions are retained for compliance. Campus records
            are not hard-deleted from the governance system.
          </p>
        </section>

        <p className="text-xs text-muted-foreground">
          Full constitution authoring and amendment workflows are planned for a later
          governance phase. This page provides the Phase 5 shell.
        </p>
      </div>
    </ShellPage>
  );
}
