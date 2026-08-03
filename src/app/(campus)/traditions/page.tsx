import Link from "next/link";
import { ArrowRight, Flame, Plus } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getTraditions } from "@/services/madonna-culture-service";

export default function TraditionsPage() {
  const traditions = getTraditions();

  return (
    <ShellPage
      title="Traditions Hub"
      description="Homecoming, Spirit Week, faith celebrations, and every ritual that makes Madonna home."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/traditions/propose">
              <Plus className="size-3.5" />
              Propose a tradition
            </Link>
          }
        />
      }
    >
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
        <Flame className="size-3.5" aria-hidden="true" />
        W18 · School Culture & Traditions
      </span>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {traditions.map((tradition) => (
          <Link
            key={tradition.slug}
            href={`/traditions/${tradition.slug}`}
            className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-[#2F80ED]/40"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tradition.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground group-hover:text-[#2F80ED]">{tradition.name}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{tradition.tagline}</p>
                <p className="mt-2 text-xs font-medium text-[#2F80ED]">{tradition.season}</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>

      <DashboardCard title="Explore more culture" description="Madonna's digital heartbeat across campus.">
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Why Madonna? · Our Story", href: "/why-madonna" },
            { label: "Madonna History", href: "/history" },
            { label: "Hall of Champions", href: "/hall-of-champions" },
            { label: "Madonna Memories", href: "/memories" },
            { label: "The Madonna Archive", href: "/archive" },
          ].map((link) => (
            <Button
              key={link.href}
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={link.href}>{link.label}</Link>}
            />
          ))}
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
