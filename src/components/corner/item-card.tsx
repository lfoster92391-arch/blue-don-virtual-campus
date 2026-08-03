import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { formatPrice, getCornerCategory } from "@/config/corner-store";
import type { CornerStoreItemView } from "@/services/corner-store-service";

type ItemCardProps = {
  item: CornerStoreItemView;
};

export function ItemCard({ item }: ItemCardProps) {
  const category = getCornerCategory(item.category);
  const sellerLabel = item.organizationName ?? item.sellerName;

  return (
    <Link
      href={`/corner/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-[#2F80ED]/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#0A2342]/5 to-[#2F80ED]/10">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="size-10 opacity-40" aria-hidden="true" />
            {category ? (
              <span className="text-3xl" aria-hidden="true">
                {category.emoji}
              </span>
            ) : null}
          </div>
        )}
        {item.status === "SOLD" ? (
          <span className="absolute right-2 top-2 rounded-full bg-[#0A2342] px-2.5 py-1 text-xs font-semibold text-white">
            Sold
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {/* Price lives directly under the photo, per spec. */}
        <p className="text-lg font-bold text-[#0A2342] dark:text-white">
          {formatPrice(item.priceCents)}
        </p>
        <h3 className="line-clamp-1 font-medium text-foreground">{item.title}</h3>
        {item.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}
        <p className="mt-auto pt-1 text-xs text-muted-foreground">
          {category ? `${category.label} · ` : ""}
          {sellerLabel}
        </p>
      </div>
    </Link>
  );
}
