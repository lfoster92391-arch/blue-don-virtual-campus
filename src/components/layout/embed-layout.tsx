import Link from "next/link";

import { PartnerBackLink } from "@/components/layout/partner-back-link";
import { siteConfig } from "@/config/site";
import { isPartnerLinked } from "@/config/partner";

export function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2 text-sm">
        <p className="font-medium text-[#0A2342] dark:text-white">
          {siteConfig.shortName}
        </p>
        <div className="flex items-center gap-3">
          {isPartnerLinked() ? <PartnerBackLink variant="inline" /> : null}
          <Link
            href="/dashboard"
            className="text-muted-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open full campus
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 py-4">
        {children}
      </main>
    </div>
  );
}
