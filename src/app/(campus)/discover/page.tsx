import { Sparkles } from "lucide-react";

import { DailyDiscoveryHub } from "@/components/discover/daily-discovery-hub";
import { ShellPage } from "@/components/layout/shell-page";
import { CLEAN_SLATE } from "@/config/app-mode";
import { getDailyDiscovery } from "@/config/daily-discovery";

export default function DiscoverPage() {
  const today = new Date();
  const items = getDailyDiscovery(today);
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ShellPage
      title="Daily Discovery"
      description="Learn something new every day — saints, brain games, fun facts, careers, words, and good news from campus."
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Something new every day
        </span>
      }
    >
      <DailyDiscoveryHub today={items} dateLabel={dateLabel} cleanSlate={CLEAN_SLATE} />
    </ShellPage>
  );
}
