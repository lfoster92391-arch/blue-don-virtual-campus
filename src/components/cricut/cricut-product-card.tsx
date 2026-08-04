import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { formatShopPrice } from "@/config/cricut-shop";
import type { CricutShopItemView } from "@/services/cricut-shop-service";

export function CricutProductCard({ item }: { item: CricutShopItemView }) {
  return (
    <Link
      href={`/cricut/shop/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-[#DB2777]/50 hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageIcon className="size-10 opacity-40" aria-hidden="true" />
          </div>
        )}
        {!item.availableToSell ? (
          <span className="absolute left-2 top-2 rounded-md bg-[#0A2342]/85 px-2 py-0.5 text-xs font-medium text-white">
            Showcase
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-lg font-bold text-[#0A2342] dark:text-white">
          {formatShopPrice(item.priceCents)}
        </p>
        <h3 className="line-clamp-1 font-medium">{item.title}</h3>
        {item.description ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {item.description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
