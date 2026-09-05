import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { siteConfig } from "@/config/site";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#0A2342]">
      <div className="hidden w-1/2 flex-col justify-between p-10 text-white lg:flex">
        <div className="space-y-6">
          <BrandLogo variant="full" size="lg" href={null} priority />
          <div>
            <p className="text-sm text-[#C6CCD6]">{siteConfig.shortName}</p>
            <h1 className="mt-2 text-3xl font-semibold">{siteConfig.institution}</h1>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-2xl font-medium">{siteConfig.tagline}</p>
          <p className="max-w-md text-[#C6CCD6]">
            Secure campus access for students, families, faculty, and community
            partners.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-background px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="flex justify-center lg:hidden">
            <BrandLogo variant="full" size="md" href={null} priority />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#2F80ED] lg:hidden">
              {siteConfig.institution}
            </p>
            <h2 className="text-2xl font-semibold text-[#0A2342] dark:text-white">
              {title}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {children}
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/" className="font-medium text-[#0A2342] hover:underline dark:text-white">
              Return to campus home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
