import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { WorkspaceFeature } from "@/config/club-workspaces";

type FeatureGridProps = {
  features: WorkspaceFeature[];
  accent: string;
};

/** Generic renderer for a club/class/sport workspace's feature cards. */
export function FeatureGrid({ features, accent }: FeatureGridProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <li
          key={feature.id}
          className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-colors"
          style={{ borderTopColor: accent, borderTopWidth: 3 }}
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-2xl" aria-hidden="true">
              {feature.icon}
            </span>
            {feature.badge ? (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                style={{ backgroundColor: accent }}
              >
                {feature.badge}
              </span>
            ) : null}
          </div>
          <h3 className="mt-3 font-semibold text-[#0A2342] dark:text-white">
            {feature.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
          {feature.itemLinks && feature.itemLinks.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {feature.itemLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-[#2F80ED]"
                  >
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                      aria-hidden="true"
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : feature.items && feature.items.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {feature.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: accent }}
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {feature.href ? (
            <Link
              href={feature.href}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: accent }}
            >
              Open
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
