import Link from "next/link";
import { ArrowRight, FlaskConical, Gamepad2, Wrench } from "lucide-react";

import { ItHelpDeskPanel } from "@/components/service-desk/it-help-desk-panel";
import { Button } from "@/components/ui/button";
import { buildItHelpDeskMailto } from "@/config/it-help-desk";

const IT_TOOLKIT_LINKS = [
  {
    label: "All labs",
    description: "Hands-on virtual lab environments",
    href: "/labs",
    icon: FlaskConical,
  },
  {
    label: "All simulators",
    description: "Interactive learning simulations",
    href: "/simulators",
    icon: Gamepad2,
  },
  {
    label: "Submit IT Request",
    description: "Email the campus help desk",
    href: buildItHelpDeskMailto(),
    icon: Wrench,
  },
] as const;

/** Prominent IT toolkit entry points on the IT Club workspace tab. */
export function ItToolkitHub({ accent }: { accent: string }) {
  return (
    <div className="space-y-6">
      <ItHelpDeskPanel variant="card" />

      <section
        className="rounded-xl border border-border p-6"
        style={{ backgroundColor: `${accent}14` }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0A2342] dark:text-white">
              IT Toolkit
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Labs, simulators, and repair tools live here — your home base for campus
              technology learning.
            </p>
          </div>
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/organizations/it-club?tab=labs">
                Labs &amp; Simulators tab
                <ArrowRight className="size-4" />
              </Link>
            }
          />
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {IT_TOOLKIT_LINKS.map((tool) => {
            const Icon = tool.icon;
            const cardClassName =
              "flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-[#2F80ED]/40";
            const cardContent = (
              <>
                <Icon className="size-5" style={{ color: accent }} aria-hidden="true" />
                <span className="mt-3 font-medium text-[#0A2342] dark:text-white">
                  {tool.label}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {tool.description}
                </span>
              </>
            );

            return (
              <li key={tool.label}>
                {tool.href.startsWith("mailto:") ? (
                  <a href={tool.href} className={cardClassName}>
                    {cardContent}
                  </a>
                ) : (
                  <Link href={tool.href} className={cardClassName}>
                    {cardContent}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
