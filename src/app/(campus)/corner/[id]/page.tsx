import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ImageIcon, Store, User as UserIcon } from "lucide-react";

import { BuyPanel } from "@/components/corner/buy-panel";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { formatPrice, getCornerCategory } from "@/config/corner-store";
import { requireCompleteProfile } from "@/lib/auth/session";
import { getCornerItem } from "@/services/corner-store-service";

type CornerItemPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CornerItemPage({ params }: CornerItemPageProps) {
  const { id } = await params;
  await requireCompleteProfile();
  const item = await getCornerItem(id);

  if (!item || item.status === "REMOVED") {
    notFound();
  }

  const category = getCornerCategory(item.category);
  const sellerLabel = item.organizationName ?? item.sellerName;
  const isSold = item.status === "SOLD";

  return (
    <ShellPage
      title={item.title}
      description={sellerLabel}
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/corner">
              <ArrowLeft className="size-3.5" />
              Back to the corner
            </Link>
          }
        />
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Photo with price directly underneath */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#0A2342]/5 to-[#2F80ED]/10">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-14 opacity-40" aria-hidden="true" />
                  {category ? (
                    <span className="text-4xl" aria-hidden="true">
                      {category.emoji}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <p className="text-2xl font-bold text-[#0A2342] dark:text-white">
                {formatPrice(item.priceCents)}
              </p>
              {category ? (
                <span className="rounded-full bg-[#2F80ED]/10 px-2.5 py-0.5 text-xs font-medium text-[#2F80ED]">
                  {category.emoji} {category.label}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Details + payment */}
        <div className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0A2342] dark:text-white">
              {item.title}
            </h2>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {item.organizationName ? (
                <Store className="size-4" aria-hidden="true" />
              ) : (
                <UserIcon className="size-4" aria-hidden="true" />
              )}
              Sold by <span className="font-medium text-foreground">{sellerLabel}</span>
            </p>
          </div>

          {item.description ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ) : null}

          <div className="rounded-xl border border-border bg-card p-4">
            <BuyPanel
              itemTitle={item.title}
              priceCents={item.priceCents}
              payment={item.payment}
              sellerName={sellerLabel}
              isSold={isSold}
            />
          </div>
        </div>
      </div>
    </ShellPage>
  );
}
