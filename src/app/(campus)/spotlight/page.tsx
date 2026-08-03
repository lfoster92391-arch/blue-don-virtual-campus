import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getStudentSpotlight } from "@/services/madonna-culture-service";

export default function SpotlightPage() {
  const spotlight = getStudentSpotlight();

  if (!spotlight) {
    return (
      <ShellPage
        title="Student Spotlight"
        description="Weekly features celebrating Blue Dons who lead, serve, create, and innovate."
      >
        <DashboardCard title="No spotlight yet">
          <p className="text-sm text-muted-foreground">
            No student has been featured yet. Once Student Council selects the
            first Blue Don of the week, their story will appear here.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/hall-of-champions">Hall of Champions</Link>} />
            <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/find-your-place">Find Your Place</Link>} />
          </div>
        </DashboardCard>
      </ShellPage>
    );
  }

  return (
    <ShellPage
      title="Student Spotlight"
      description="Weekly features celebrating Blue Dons who lead, serve, create, and innovate."
      actions={
        <span className="rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          {spotlight.weekLabel}
        </span>
      }
    >
      <DashboardCard
        title={`${spotlight.emoji} ${spotlight.name}`}
        description={`${spotlight.grade} · ${spotlight.category}`}
        status={{ label: "This week", variant: "info" }}
      >
        <p className="text-sm leading-relaxed text-foreground">{spotlight.bio}</p>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Achievements</p>
          <ul className="mt-2 space-y-1.5">
            {spotlight.achievements.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                <span className="text-[#2F80ED]">★</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342] to-[#2F80ED]/40">
          <div className="text-center text-white">
            <span className="text-4xl">{spotlight.emoji}</span>
            <p className="mt-2 font-semibold">{spotlight.name}</p>
            <p className="text-sm text-white/70">Student Spotlight</p>
          </div>
        </div>
      </DashboardCard>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/hall-of-champions">Hall of Champions</Link>} />
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/find-your-place">Find Your Place</Link>} />
      </div>
    </ShellPage>
  );
}
