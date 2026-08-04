import Link from "next/link";
import { ImageIcon } from "lucide-react";

import { CricutAmazonWishlistBanner } from "@/components/cricut/cricut-amazon-wishlist";
import { CricutDesignSubmitForm } from "@/components/cricut/cricut-design-submit-form";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { requireCompleteProfile } from "@/lib/auth/session";
import { reviewCricutDesignAction } from "@/features/cricut-shop/actions";
import {
  CRICUT_DESIGN_STATUS_LABELS,
  listCricutDesigns,
} from "@/services/cricut-design-service";
import {
  canManageCricutShop,
  getCricutAmazonWishlistUrl,
  getCricutOrganization,
  isCricutShopStorageConfigured,
} from "@/services/cricut-shop-service";
import type { CricutDesignStatus } from "@/generated/prisma/client";

const REVIEW_STATUSES: CricutDesignStatus[] = [
  "PENDING",
  "ACCEPTED",
  "DECLINED",
  "IN_PRODUCTION",
  "COMPLETED",
];

export default async function CricutDesignsPage() {
  const user = await requireCompleteProfile();
  const [designs, org, wishlistUrl] = await Promise.all([
    listCricutDesigns(),
    getCricutOrganization(),
    getCricutAmazonWishlistUrl(),
  ]);

  const canReview = org
    ? await canManageCricutShop(user.id, user.role, org.id)
    : false;

  return (
    <ShellPage
      title="Design submission hub"
      description="Any Madonna student can pitch an idea. Cricut crew reviews and produces accepted designs."
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut">Hub</Link>}
          />
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/cricut/shop">Shop</Link>}
          />
        </div>
      }
    >
      <CricutAmazonWishlistBanner url={wishlistUrl} className="mb-8" compact />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <aside className="rounded-xl border border-border bg-card p-4 shadow-sm h-fit">
          <h2 className="font-semibold">Submit an idea</h2>
          <p className="mt-1 mb-4 text-xs text-muted-foreground">
            Title, description, optional reference photo
          </p>
          <CricutDesignSubmitForm
            storageConfigured={isCricutShopStorageConfigured()}
          />
        </aside>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ideas board</h2>
          {designs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              No design submissions yet — be the first.
            </p>
          ) : (
            <ul className="space-y-4">
              {designs.map((design) => (
                <li
                  key={design.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                  <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                    <div className="aspect-square bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5 sm:aspect-auto sm:min-h-[8rem]">
                      {design.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={design.imageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-[8rem] items-center justify-center text-muted-foreground">
                          <ImageIcon className="size-8 opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 p-4 sm:pl-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{design.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {design.submitterName} ·{" "}
                            {CRICUT_DESIGN_STATUS_LABELS[design.status]}
                          </p>
                        </div>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                          {CRICUT_DESIGN_STATUS_LABELS[design.status]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {design.description}
                      </p>
                      {design.reviewNote ? (
                        <p className="text-sm">
                          <span className="font-medium">Crew note: </span>
                          {design.reviewNote}
                        </p>
                      ) : null}
                      {canReview ? (
                        <form
                          action={reviewCricutDesignAction}
                          className="flex flex-wrap items-end gap-2 border-t border-border pt-3"
                        >
                          <input type="hidden" name="designId" value={design.id} />
                          <label className="grid gap-1 text-xs">
                            Status
                            <select
                              name="status"
                              defaultValue={design.status}
                              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                            >
                              {REVIEW_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                  {CRICUT_DESIGN_STATUS_LABELS[status]}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="grid min-w-[12rem] flex-1 gap-1 text-xs">
                            Note
                            <input
                              name="reviewNote"
                              defaultValue={design.reviewNote ?? ""}
                              className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
                              placeholder="Optional"
                            />
                          </label>
                          <Button type="submit" size="sm">
                            Update
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ShellPage>
  );
}
