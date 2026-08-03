import Link from "next/link";
import { Archive, ArrowRight } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getArchiveCollections } from "@/services/madonna-culture-service";

export default function ArchivePage() {
  const collections = getArchiveCollections();

  return (
    <ShellPage
      title="The Madonna Archive"
      description="Digital museum — yearbooks, championships, broadcasts, newspapers, and oral histories."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Archive className="size-3.5" aria-hidden="true" />
          Digital museum
        </span>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <div key={collection.id} className="rounded-xl border border-border bg-card p-4">
            <span className="text-2xl">{collection.emoji}</span>
            <p className="mt-2 font-semibold text-foreground">{collection.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>
            <p className="mt-2 text-xs font-medium text-[#2F80ED]">
              {collection.itemCount.toLocaleString()} items
            </p>
          </div>
        ))}
      </div>

      <DashboardCard title="Related collections">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/memories">Madonna Memories</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/history">Madonna History</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/media">Media Center <ArrowRight className="size-3.5" /></Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/hall-of-champions">Hall of Champions</Link>} />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
