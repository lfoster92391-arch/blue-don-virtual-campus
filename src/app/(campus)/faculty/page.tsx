import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { getFaculty } from "@/services/madonna-culture-service";

export default function FacultyPage() {
  const faculty = getFaculty();

  return (
    <ShellPage
      title="Meet the Faculty"
      description="The educators, mentors, and leaders who shape every Blue Don journey."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <GraduationCap className="size-3.5" aria-hidden="true" />
          {faculty.length} profiles
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {faculty.map((member) => (
          <DashboardCard
            key={member.slug}
            title={member.name}
            description={`${member.title} · ${member.department}`}
          >
            <blockquote className="rounded-lg border-l-2 border-[#2F80ED] px-3 py-2 text-sm italic text-foreground">
              &ldquo;{member.quote}&rdquo;
            </blockquote>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Education</p>
                <ul className="mt-1 space-y-0.5">
                  {member.education.map((item) => (
                    <li key={item} className="text-sm text-foreground">{item}</li>
                  ))}
                </ul>
              </div>
              {member.courses.length > 0 ? (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Courses</p>
                  <ul className="mt-1 space-y-0.5">
                    {member.courses.map((item) => (
                      <li key={item} className="text-sm text-foreground">{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {member.clubs.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Clubs & activities</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {member.clubs.map((club) => (
                    <span key={club} className="rounded-full bg-muted px-2 py-0.5 text-xs text-foreground">{club}</span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Office hours</p>
                <p className="text-foreground">{member.officeHours}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Fun fact</p>
                <p className="text-muted-foreground">{member.funFact}</p>
              </div>
            </div>

            <div className="mt-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342]/10 to-[#2F80ED]/10">
              <p className="text-xs text-muted-foreground">Photo gallery placeholder</p>
            </div>
          </DashboardCard>
        ))}
      </div>
    </ShellPage>
  );
}
