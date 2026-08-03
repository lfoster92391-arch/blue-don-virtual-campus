import Link from "next/link";
import { Globe, GraduationCap, Heart, Shield } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getAlumniLocations } from "@/services/madonna-culture-service";

const TYPE_ICONS = {
  college: GraduationCap,
  military: Shield,
  mission: Heart,
  career: Globe,
  alumni: Globe,
};

const TYPE_LABELS = {
  college: "College",
  military: "Military",
  mission: "Mission",
  career: "Career",
  alumni: "Alumni",
};

export default function MadonnaWorldPage() {
  const locations = getAlumniLocations();

  return (
    <ShellPage
      title="Madonna Around the World"
      description="Blue Dons across the globe — colleges, careers, military service, and missions."
      actions={
        <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/hall-of-champions?hall=alumni">Alumni Hall</Link>} />
      }
    >
      <div className="rounded-xl border border-border bg-gradient-to-br from-[#0A2342]/5 to-[#2F80ED]/10 p-6 text-center">
        <Globe className="mx-auto size-12 text-[#2F80ED]" />
        <p className="mt-2 text-lg font-semibold text-foreground">{locations.length} Blue Dons mapped</p>
        <p className="text-sm text-muted-foreground">From Weirton to the world — our alumni family grows every year.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {locations.map((person) => {
          const Icon = TYPE_ICONS[person.type];
          return (
            <div key={person.id} className="flex gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#2F80ED]/10">
                <Icon className="size-5 text-[#2F80ED]" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">{person.name}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    &apos;{person.classYear.slice(-2)}
                  </span>
                </div>
                <p className="text-sm text-[#2F80ED]">{person.location}</p>
                <p className="text-sm text-muted-foreground">{person.detail}</p>
                <span className="mt-1 inline-block text-xs font-medium capitalize text-muted-foreground">
                  {TYPE_LABELS[person.type]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <DashboardCard title="Add your location" description="Alumni — update your pin on the map.">
        <p className="text-sm text-muted-foreground">
          Contact the Alumni Office to add your college, career, or mission location to the Blue Don map.
        </p>
      </DashboardCard>
    </ShellPage>
  );
}
