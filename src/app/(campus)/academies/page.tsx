import Link from "next/link";
import { GraduationCap, Users } from "lucide-react";

import { AcademyJoinButton } from "@/components/academies/academy-join-button";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_STATUS_LABELS } from "@/lib/mvp/constants";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listAcademiesForUser } from "@/services/academy-service";

export default async function AcademiesPage() {
  const user = await requireCompleteProfile();
  const academies = await listAcademiesForUser(user.id);
  const activeCount = academies.filter((a) => a.membership?.status === "ACTIVE").length;

  return (
    <ShellPage
      title="Madonna Education Network"
      description="14 academy pathways powered by one Academy Engine. Explore modules, labs, certifications, and missions."
    >
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/pathways">Career pathways</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Academies</p>
          <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">
            {academies.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Your memberships</p>
          <p className="text-2xl font-semibold text-[#2E8B57]">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Pending requests</p>
          <p className="text-2xl font-semibold text-[#D4A017]">
            {academies.filter((a) => a.membership?.status === "PENDING").length}
          </p>
        </div>
      </div>

      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {academies.map((academy) => (
          <li
            key={academy.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg"
                  style={{ backgroundColor: `${academy.color ?? "#0A2342"}20` }}
                >
                  {academy.icon ?? <GraduationCap className="size-5" style={{ color: academy.color ?? "#0A2342" }} />}
                </div>
                <div>
                  <Link
                    href={`/academies/${academy.slug}`}
                    className="font-semibold text-[#0A2342] hover:underline dark:text-white"
                  >
                    {academy.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {academy.description}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" />
                    {academy.memberCount} members · {academy.eventCount} events
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              {academy.membership ? (
                <span className="text-sm text-muted-foreground">
                  {MEMBERSHIP_STATUS_LABELS[academy.membership.status]}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Not a member</span>
              )}
              <AcademyJoinButton
                academyId={academy.id}
                academyName={academy.name}
                slug={academy.slug}
                membershipStatus={academy.membership?.status ?? null}
                defaultSignatureName={user.displayName}
              />
            </div>
          </li>
        ))}
      </ul>
    </ShellPage>
  );
}
