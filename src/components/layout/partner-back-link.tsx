import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { partnerConfig } from "@/config/partner";
import { cn } from "@/lib/utils";

type PartnerBackLinkProps = {
  className?: string;
  variant?: "footer" | "menu" | "inline";
};

export function PartnerBackLink({
  className,
  variant = "inline",
}: PartnerBackLinkProps) {
  const siteUrl = partnerConfig.siteUrl;
  if (!siteUrl) {
    return null;
  }

  const label = `Back to ${partnerConfig.name}`;

  if (variant === "menu") {
    return (
      <Link
        href={siteUrl}
        className={cn(
          "flex w-full items-center gap-2 text-sm",
          className,
        )}
        target="_blank"
        rel="noopener noreferrer"
      >
        <ArrowLeft className="size-4" />
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={siteUrl}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-[#0A2342] underline-offset-4 hover:underline dark:text-white",
        variant === "footer" && "text-xs text-muted-foreground",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ArrowLeft className="size-3.5" />
      {label}
    </Link>
  );
}
