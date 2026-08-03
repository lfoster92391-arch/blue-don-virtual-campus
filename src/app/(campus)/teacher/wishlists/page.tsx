import Link from "next/link";
import { redirect } from "next/navigation";
import { Gift } from "lucide-react";

import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { canManageAcademy } from "@/config/roles";
import { requireCompleteProfile } from "@/lib/auth/session";
import { listWishlistManageTargets } from "@/services/wishlist-service";

const WISHLIST_MANAGER_ROLES = new Set([
  "teacher",
  "advisor",
  "admin",
  "coach",
  "staff",
]);

export default async function TeacherWishlistsPage() {
  const user = await requireCompleteProfile();

  if (!WISHLIST_MANAGER_ROLES.has(user.role) && !canManageAcademy(user.role)) {
    redirect("/home");
  }

  const targets = await listWishlistManageTargets(user.id, user.role);

  return (
    <ShellPage
      title="Class & club wishlists"
      description="Manage supply lists for your classes, clubs, and academies. Add Amazon product links or any custom URL."
    >
      {targets.length > 0 ? (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {targets.map((target) => (
            <li
              key={`${target.type}-${target.id}`}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="space-y-1">
                <p className="font-semibold text-[#0A2342] dark:text-white">{target.name}</p>
                <p className="text-sm text-muted-foreground">
                  {target.type === "academy" ? "Academy pathway" : "Club / class / team"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {target.itemCount} wishlist item{target.itemCount === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                nativeButton={false}
                render={
                  <Link
                    href={
                      target.type === "academy"
                        ? `/academies/${target.slug}#wishlist`
                        : `/organizations/${target.slug}#wishlist`
                    }
                  >
                    <Gift className="size-4" />
                    Manage wishlist
                  </Link>
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-muted-foreground">
          You do not have any clubs or classes to manage yet. Organization leads and advisors
          can add wishlist items from an academy or organization page.
        </p>
      )}
    </ShellPage>
  );
}
