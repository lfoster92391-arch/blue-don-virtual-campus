import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { CommunityImpactDisplay } from "@/components/community-impact/community-impact-display";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { getCommunityImpactDashboard } from "@/services/community-impact-service";

export default function CommunityImpactPage() {
  const dashboard = getCommunityImpactDashboard();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#2F80ED]">
              {siteConfig.institution}
            </p>
            <p className="text-sm text-muted-foreground">{siteConfig.name}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <Link href="/why-madonna">
                <ArrowLeft className="size-3.5" />
                Why Madonna
              </Link>
            }
          />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <CommunityImpactDisplay dashboard={dashboard} />
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Open House ready · Powered by {siteConfig.name}
      </footer>
    </div>
  );
}
