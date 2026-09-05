import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { CRICUT_CLUB_SLUG } from "@/config/cricut-shop";
import { GUEST_HOME_PATH } from "@/config/login-audience";
import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata = {
  title: "Cricut Shop — Coming soon",
  description:
    "Madonna Cricut Club shop. Ordering is coming soon. Future purchases go to Cricut Club financials.",
};

/**
 * Public storefront landing. Catalog/cashier stay at /cricut/shop so we do not
 * duplicate a second store. When checkout goes live, orders should post to
 * Cricut Club ledger / financials — same club that fulfills the work.
 */
export default async function ShopComingSoonPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo variant="emblem" size="sm" href={GUEST_HOME_PATH} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
                {siteConfig.institution}
              </p>
              <p className="text-sm font-medium text-[#0A2342] dark:text-white">
                Cricut Club Shop
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href={user ? "/home" : GUEST_HOME_PATH}>Back</Link>}
          />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#C9A227]">
          Coming soon
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0A2342] dark:text-white">
          Shop Madonna Cricut
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Spirit wear and maker goods from Cricut Club. Pre-orders and checkout
          are not open yet. When they are, every purchase will send funds and
          fulfillment to <strong>Cricut Club</strong> and into{" "}
          <strong>club financials</strong> — not a separate store.
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every item can be personalized: pick a Madonna sport, the name to
          print, a Canva web font (Bebas Neue, Oswald, Montserrat, or Playfair
          Display), and upload your own design if you want something different.
          Campus members already collect those details on the live catalog at{" "}
          <Link href="/cricut/shop" className="font-medium underline">
            /cricut/shop
          </Link>
          .
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            variant="action"
            size="lg"
            className="h-11"
            nativeButton={false}
            render={<Link href={GUEST_HOME_PATH}>Fan & Family home</Link>}
          />
          {user ? (
            <Button
              variant="outline"
              size="lg"
              className="h-11"
              nativeButton={false}
              render={
                <Link href={`/organizations/${CRICUT_CLUB_SLUG}`}>
                  Cricut Club
                </Link>
              }
            />
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="h-11"
              nativeButton={false}
              render={<Link href="/login?audience=school">Madonna School sign in</Link>}
            />
          )}
        </div>
      </main>
    </div>
  );
}
