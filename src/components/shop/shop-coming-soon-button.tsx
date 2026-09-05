import Link from "next/link";

import { Button } from "@/components/ui/button";

/** Public Cricut shop door — ordering is not live yet. */
export function ShopComingSoonButton({
  className,
  size = "lg",
}: {
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <Button
      variant="action"
      size={size}
      className={className}
      nativeButton={false}
      render={<Link href="/shop">Shop · Coming soon</Link>}
    />
  );
}
