import Image from "next/image";
import Link from "next/link";

import { brandAssets, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export type BrandLogoVariant = "full" | "emblem";
export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl";

const dimensions: Record<
  BrandLogoSize,
  { emblem: number; full: { width: number; height: number } }
> = {
  xs: { emblem: 28, full: { width: 88, height: 88 } },
  sm: { emblem: 32, full: { width: 112, height: 112 } },
  md: { emblem: 36, full: { width: 140, height: 140 } },
  lg: { emblem: 44, full: { width: 180, height: 180 } },
  xl: { emblem: 56, full: { width: 240, height: 240 } },
};

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  size?: BrandLogoSize;
  className?: string;
  imageClassName?: string;
  href?: string | null;
  priority?: boolean;
};

export function BrandLogo({
  variant = "full",
  size = "md",
  className,
  imageClassName,
  href = "/",
  priority = false,
}: BrandLogoProps) {
  const dims = dimensions[size];
  const src = variant === "emblem" ? brandAssets.emblem : brandAssets.logo;
  const width = variant === "emblem" ? dims.emblem : dims.full.width;
  const height = variant === "emblem" ? dims.emblem : dims.full.height;

  const image = (
    <Image
      src={src}
      alt={siteConfig.name}
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", imageClassName)}
    />
  );

  if (href === null) {
    return <span className={cn("inline-flex shrink-0 items-center", className)}>{image}</span>;
  }

  return (
    <Link
      href={href}
      className={cn("inline-flex shrink-0 items-center", className)}
      aria-label={`${siteConfig.name} home`}
    >
      {image}
    </Link>
  );
}
