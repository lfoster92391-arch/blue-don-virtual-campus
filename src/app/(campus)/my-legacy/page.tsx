import Link from "next/link";
import { ExternalLink, GraduationCap } from "lucide-react";

import { GraduateLegacyBuilderForm } from "@/components/graduate-legacy/graduate-legacy-builder-form";
import { GraduateLegacyDisplay } from "@/components/graduate-legacy/graduate-legacy-display";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { GRADUATE_LEGACY_TAGLINE } from "@/config/graduate-legacy";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getGraduateLegacyForUser } from "@/services/graduate-legacy-service";

export default async function MyLegacyPage() {
  const user = await requireCompleteProfile();
  const legacy = await getGraduateLegacyForUser(user.id);

  return (
    <ShellPage
      title="My Legacy"
      description={`${GRADUATE_LEGACY_TAGLINE} Build your graduate legacy page — organizations, achievements, memories, and advice for future Blue Dons.`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/career-portfolio">Career Portfolio</Link>}
          />
          {legacy?.isPublic ? (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={
                <Link href={`/legacy/${legacy.slug}`} target="_blank">
                  View public page
                  <ExternalLink className="size-3.5" />
                </Link>
              }
            />
          ) : null}
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <GraduationCap className="size-4 text-[#D4A017]" />
        <span>
          Your legacy page extends your career portfolio with personal stories and alumni connection.
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold text-[#0A2342] dark:text-white">Legacy Builder</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seniors complete this before graduation. Publish when ready.
          </p>
          <div className="mt-4">
            <GraduateLegacyBuilderForm initial={legacy} />
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-semibold text-[#0A2342] dark:text-white">Preview</h2>
          {legacy ? (
            <GraduateLegacyDisplay legacy={legacy} preview />
          ) : (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">
                Fill out the builder to preview your legacy page.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Demo:{" "}
                <Link href="/legacy/alex-martinez-2026" className="text-[#2F80ED] hover:underline">
                  alex-martinez-2026
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </ShellPage>
  );
}
