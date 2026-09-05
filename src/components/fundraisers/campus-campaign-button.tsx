import Link from "next/link";
import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";

export type CampaignButtonItem = {
  id: string;
  title: string;
};

export function CampusCampaignButton({
  campaigns,
  hrefBase = "/fundraisers",
  size = "sm",
  className,
}: {
  campaigns: CampaignButtonItem[];
  hrefBase?: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const featured = campaigns[0];
  const href =
    featured && campaigns.length === 1
      ? `${hrefBase}/${featured.id}`
      : hrefBase;

  return (
    <Button
      size={size}
      className={className}
      nativeButton={false}
      render={
        <Link href={href}>
          <Megaphone className="size-4" aria-hidden="true" />
          <span className="truncate">
            Fundraisers
            {featured?.title ? ` · ${featured.title}` : ""}
          </span>
        </Link>
      }
    />
  );
}
