import Link from "next/link";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getHallCategories, getHallInductees } from "@/services/madonna-culture-service";

type HallOfChampionsPageProps = {
  searchParams: Promise<{ hall?: string }>;
};

export default async function HallOfChampionsPage({ searchParams }: HallOfChampionsPageProps) {
  const { hall } = await searchParams;
  const categories = getHallCategories();
  const inductees = getHallInductees(hall as Parameters<typeof getHallInductees>[0] | undefined);

  return (
    <ShellPage
      title="Hall of Champions"
      description="Academic, athletic, faith, and service excellence — Madonna's finest honored."
    >
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!hall ? "default" : "outline"}
          size="sm"
          nativeButton={false}
          render={<Link href="/hall-of-champions">All</Link>}
        />
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={hall === cat.id ? "default" : "outline"}
            size="sm"
            nativeButton={false}
            render={<Link href={`/hall-of-champions?hall=${cat.id}`}>{cat.label}</Link>}
          />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {inductees.map((person) => (
          <DashboardCard
            key={person.id}
            title={person.name}
            description={`Inducted ${person.inducteeYear}${person.classYear ? ` · Class of ${person.classYear}` : ""}`}
            status={{ label: categories.find((c) => c.id === person.hall)?.label ?? person.hall, variant: "info" }}
          >
            <div className="flex gap-3">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#0A2342]/10 text-sm font-bold text-[#0A2342]">
                {person.photoLabel}
              </div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{person.bio}</p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Accomplishments</p>
              <ul className="mt-1 space-y-1">
                {person.accomplishments.map((item) => (
                  <li key={item} className="text-sm text-foreground">• {item}</li>
                ))}
              </ul>
            </div>
            <blockquote className="mt-3 rounded-lg border-l-2 border-[#2F80ED] bg-muted/50 px-3 py-2 text-sm italic text-foreground">
              &ldquo;{person.advice}&rdquo;
            </blockquote>
          </DashboardCard>
        ))}
      </div>
    </ShellPage>
  );
}
