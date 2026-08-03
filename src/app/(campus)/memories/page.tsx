import Link from "next/link";
import { ArrowRight, Camera, Clock } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import { getMemoryHighlights } from "@/services/madonna-culture-service";

const TYPE_LABELS = {
  "photo-of-week": "Photo of the Week",
  "video-of-week": "Video of the Week",
  throwback: "Throwback Thursday",
  event: "Event Highlight",
};

export default function MemoriesPage() {
  const highlights = getMemoryHighlights();

  return (
    <ShellPage
      title="Madonna Memories"
      description="Photo of the Week, Throwback Thursday, and event highlights from across campus."
      actions={
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/media">
              Media Center
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {highlights.map((item) => (
          <DashboardCard
            key={item.id}
            title={`${item.emoji} ${item.title}`}
            description={item.dateLabel}
            status={{ label: TYPE_LABELS[item.type], variant: "info" }}
          >
            <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-[#0A2342]/10 to-[#2F80ED]/20">
              <Camera className="size-10 text-muted-foreground/50" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
          </DashboardCard>
        ))}
      </div>

      <DashboardCard title="Memory archive" description="Browse decades of Blue Don moments." icon={<Clock className="size-5" />}>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/archive">The Madonna Archive</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/traditions">Traditions Hub</Link>} />
          <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/history">Madonna History</Link>} />
        </div>
      </DashboardCard>
    </ShellPage>
  );
}
