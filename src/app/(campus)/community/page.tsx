import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Handshake, Megaphone } from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { ShellPage } from "@/components/layout/shell-page";
import { Button } from "@/components/ui/button";
import {
  AUDIENCE_TIER_LABELS,
  BROADCAST_APPROVAL_QUEUE,
  BROADCAST_AUDIENCES,
  CAMPUS_TICKER,
} from "@/config/broadcast-engine";
import { CAMPUS_FEED } from "@/config/campus-feed";
import { getModuleShell } from "@/config/module-shells";

export default function CommunityPage() {
  const config = getModuleShell("community")!;

  return (
    <ShellPage
      title={config.title}
      description={config.description}
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2F80ED]/10 px-3 py-1 text-xs font-medium text-[#2F80ED]">
          <Megaphone className="size-3.5" aria-hidden="true" />
          Broadcast Engine
        </span>
      }
    >
      <div className="overflow-hidden rounded-xl border border-[#0A2342]/20 bg-[#0A2342] px-4 py-2.5 text-sm text-white">
        <div className="flex gap-8 whitespace-nowrap">
          {CAMPUS_TICKER.map((item) => (
            <span key={item.id} className={item.priority === "urgent" ? "font-semibold text-[#D4A017]" : ""}>
              {item.text}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardCard
          title="Audience Tiers"
          description="Target broadcasts by campus, grade, academy, org, or role."
          status={{ label: "W3", variant: "info" }}
        >
          <ul className="space-y-2">
            {BROADCAST_AUDIENCES.map((aud) => (
              <li
                key={aud.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="font-medium text-foreground">{aud.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {AUDIENCE_TIER_LABELS[aud.tier]}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {aud.reach.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Approval Queue"
          description="Broadcasts awaiting moderator review before fan-out."
        >
          <ul className="space-y-3">
            {BROADCAST_APPROVAL_QUEUE.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-border px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.author} · {item.audience}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === "pending"
                        ? "bg-[#D4A017]/10 text-[#D4A017]"
                        : item.status === "approved"
                          ? "bg-[#2E8B57]/10 text-[#2E8B57]"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  {item.status === "pending" ? (
                    <Clock className="size-3" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}
                  {item.submittedLabel}
                </p>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <DashboardCard
        title="Business Partners"
        description="Local employers offering internships, job shadowing, and career pathways."
        icon={<Handshake className="size-5" />}
      >
        <p className="text-sm text-muted-foreground">
          Connect with Ohio Valley businesses — from Dan&apos;s Plumbing to Hancock Regional Medical Center.
        </p>
        <Button
          className="mt-4"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/business-partners">
              Browse partners
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </DashboardCard>

      <DashboardCard title="Campus Feed" description="Recent posts from across Madonna.">
        <ul className="space-y-3">
          {CAMPUS_FEED.slice(0, 5).map((post) => (
            <li key={post.id} className="flex gap-3 rounded-lg border border-border px-3 py-2.5">
              <span className="text-xl">{post.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">{post.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.source} · {post.timeLabel}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <Button
          className="mt-4"
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link href="/home">
              View on Home
              <ArrowRight className="size-3.5" />
            </Link>
          }
        />
      </DashboardCard>
    </ShellPage>
  );
}
