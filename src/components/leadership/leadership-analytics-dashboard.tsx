"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  GraduationCap,
  Heart,
  LayoutGrid,
  Package,
  Ticket,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { LeadershipAnalyticsData } from "@/services/leadership-analytics-service";

type LeadershipAnalyticsDashboardProps = {
  data: LeadershipAnalyticsData;
};

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-[#0A2342] dark:text-white">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[#C9A227] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold text-[#0A2342] dark:text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function LeadershipAnalyticsDashboard({
  data,
}: LeadershipAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#0A2342]/15 bg-gradient-to-r from-[#0A2342]/5 via-[#C9A227]/5 to-transparent p-4 sm:p-5">
        <p className="text-sm font-medium text-[#0A2342] dark:text-white">
          Executive summary
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          School-wide pulse — fundraising, service, students, and campus operations at a glance.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {data.summary.map((metric) => (
            <MetricTile
              key={metric.label}
              label={metric.label}
              value={metric.value}
              hint={metric.hint}
            />
          ))}
        </div>
      </div>

      <DashboardCard
        title="Focus clubs pulse"
        description="IT, Broadcasting, and Cricut — fund balances, memberships, invoices, and media."
        icon={<CircleDollarSign className="size-4" />}
        status={
          data.focusClubs.pendingInvoicesTotal > 0
            ? {
                label: `${data.focusClubs.pendingInvoicesTotal} invoices pending`,
                variant: "warning",
              }
            : data.focusClubs.liveStreamActive
              ? { label: "Live now", variant: "success" }
              : undefined
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link href={data.focusClubs.itFinancesHref}>IT Finances</Link>
              }
            />
            <Button
              size="sm"
              variant="ghost"
              nativeButton={false}
              render={<Link href="/admin/students">Students</Link>}
            />
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {data.focusClubs.clubs.map((club) => (
              <div
                key={club.slug}
                className="rounded-lg border border-border px-3 py-3"
              >
                <p className="text-sm font-medium text-[#0A2342] dark:text-white">
                  {club.name}
                </p>
                <p className="mt-1 text-xl font-semibold">{club.balanceLabel}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {club.memberCount} members
                  {club.pendingInvoices > 0
                    ? ` · ${club.pendingInvoices} pending invoices`
                    : ""}
                </p>
                <Link
                  href={`/organizations/${club.slug}`}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#2F80ED] hover:underline"
                >
                  Open club <ArrowRight className="size-3" />
                </Link>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              Broadcast media items: {data.focusClubs.mediaUploadsBroadcast}
            </span>
            <span>·</span>
            <span>
              Live stream:{" "}
              {data.focusClubs.liveStreamActive ? "Active" : "Off air"}
            </span>
          </div>

          {data.focusClubs.recentLedger.length > 0 ? (
            <ul className="space-y-2">
              {data.focusClubs.recentLedger.slice(0, 5).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {entry.memo || entry.type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.clubName} ·{" "}
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p
                    className={
                      entry.type === "DEPOSIT"
                        ? "shrink-0 font-medium text-[#2E8B57]"
                        : "shrink-0 font-medium text-foreground"
                    }
                  >
                    {entry.type === "WITHDRAWAL" ? "−" : "+"}
                    {(entry.amountCents / 100).toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyHint>
              No recent club ledger activity yet. Approvals land in IT Finances.
            </EmptyHint>
          )}
        </div>
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard
          title="Fundraising & Revenue"
          description="Impact Fund grants and Blue Don Corner marketplace activity."
          icon={<CircleDollarSign className="size-4" />}
          status={
            data.fundraising.activeProposals + data.fundraising.votingProposals > 0
              ? {
                  label: `${data.fundraising.activeProposals + data.fundraising.votingProposals} active`,
                  variant: "info",
                }
              : undefined
          }
          actions={
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/admin/impact-fund">Impact Fund</Link>}
            />
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">Fund balance</p>
                <p className="font-semibold text-[#0A2342] dark:text-white">
                  {data.fundraising.balanceLabel}
                </p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">Total raised</p>
                <p className="font-semibold text-[#2E8B57]">
                  {data.fundraising.raisedLabel}
                </p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">Available</p>
                <p className="font-semibold text-[#0A2342] dark:text-white">
                  {data.fundraising.availableLabel}
                </p>
              </div>
            </div>

            <ProgressBar
              value={data.fundraising.totalRaisedCents}
              max={data.fundraising.balanceCents}
              label="Impact Fund allocated vs balance"
            />

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{data.fundraising.votingProposals} voting</span>
              <span>·</span>
              <span>{data.fundraising.activeProposals} submitted</span>
              <span>·</span>
              <span>{data.fundraising.cornerStoreListings} Corner listings</span>
            </div>

            {data.fundraising.fundraisers.length > 0 ? (
              <ul className="space-y-2">
                {data.fundraising.fundraisers.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="text-xs capitalize text-muted-foreground">
                        {item.status.toLowerCase().replace(/_/g, " ")}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">
                      {item.fundedCents != null
                        ? `$${(item.fundedCents / 100).toLocaleString()}`
                        : `$${(item.amountRequestedCents / 100).toLocaleString()} req.`}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyHint>
                No active fundraisers yet. Proposals appear here once students and clubs submit to the Impact Fund.
              </EmptyHint>
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Service Hours"
          description="Volunteer events and portfolio service evidence across the student body."
          icon={<Heart className="size-4" />}
          status={
            data.serviceHours.schoolTotal > 0
              ? {
                  label: `${data.serviceHours.schoolTotal} hrs total`,
                  variant: "success",
                }
              : undefined
          }
          actions={
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/service">Service Center</Link>}
            />
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-[#2E8B57]/20 bg-[#2E8B57]/5 px-3 py-2">
                <p className="text-xs text-muted-foreground">School-wide total</p>
                <p className="text-xl font-semibold text-[#2E8B57]">
                  {data.serviceHours.schoolTotal} hrs
                </p>
              </div>
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Below {data.serviceHours.threshold} hr threshold
                </p>
                <p className="text-xl font-semibold text-[#0A2342] dark:text-white">
                  {data.serviceHours.belowThreshold}
                </p>
              </div>
            </div>

            {data.serviceHours.topContributors.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Top contributors
                </p>
                <ul className="space-y-2">
                  {data.serviceHours.topContributors.map((contributor) => (
                    <li
                      key={contributor.name}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span>{contributor.name}</span>
                      <span className="font-medium text-[#2E8B57]">
                        {contributor.hours} hrs
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyHint>
                No service hours logged yet. Hours accumulate as students volunteer and add service evidence to portfolios.
              </EmptyHint>
            )}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Student Body Snapshot"
          description="Enrollment, memberships, and pending join workflows."
          icon={<Users className="size-4" />}
          actions={
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/counselor/analytics">Success Analytics</Link>}
            />
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile
              label="Active students"
              value={String(data.studentBody.activeStudents)}
              hint={data.studentBody.gradeLabel}
            />
            <MetricTile
              label="Club memberships"
              value={String(data.studentBody.clubMemberships)}
            />
            <MetricTile
              label="Academy enrollments"
              value={String(data.studentBody.academyEnrollments)}
            />
            <MetricTile
              label="Pending org joins"
              value={String(data.studentBody.pendingOrgJoins)}
            />
            <MetricTile
              label="Pending academy joins"
              value={String(data.studentBody.pendingAcademyJoins)}
            />
            <MetricTile
              label="Parent approvals"
              value={String(data.studentBody.pendingParentApprovals)}
            />
          </div>
        </DashboardCard>

        <DashboardCard
          title="Campus Activity"
          description="Forms, tickets, media uploads, and engagement signals."
          icon={<Ticket className="size-4" />}
          status={
            data.campusActivity.openTickets > 0
              ? {
                  label: `${data.campusActivity.openTickets} open tickets`,
                  variant: "warning",
                }
              : undefined
          }
        >
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricTile
                label="Forms (30 days)"
                value={String(data.campusActivity.recentFormSubmissions)}
              />
              <MetricTile
                label="Pending approvals"
                value={String(data.campusActivity.pendingApprovals)}
              />
              <MetricTile
                label="Compliance issues"
                value={String(data.campusActivity.complianceIssues)}
              />
              <MetricTile
                label="Media uploads"
                value={String(data.campusActivity.mediaUploads)}
              />
            </div>

            {data.campusActivity.ticketsByCategory.length > 0 ? (
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Tickets by category
                </p>
                <ul className="space-y-2">
                  {data.campusActivity.ticketsByCategory.map((row) => (
                    <li
                      key={row.category}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                    >
                      <span>{row.category}</span>
                      <span className="text-muted-foreground">
                        <span className="font-medium text-[#D4A017]">{row.open} open</span>
                        {" · "}
                        {row.closed} closed
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyHint>No service desk tickets yet.</EmptyHint>
            )}

            <div className="rounded-lg border border-dashed border-border bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
              Daily Discovery engagement and opportunity interest tracking are not wired yet — will appear here once activity logging ships.
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Academics & Programs"
          description="Academy pathways and equipment checkouts."
          icon={<GraduationCap className="size-4" />}
          actions={
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={<Link href="/equipment">Equipment</Link>}
            />
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetricTile
              label="Academy enrollments"
              value={String(data.academics.academyEnrollments)}
            />
            <MetricTile
              label="Pending enrollments"
              value={String(data.academics.pendingEnrollments)}
            />
            <MetricTile
              label="Equipment items"
              value={String(data.academics.equipmentTotal)}
            />
            <MetricTile
              label="Checked out"
              value={String(data.academics.equipmentCheckedOut)}
              hint={`${data.academics.equipmentAvailable} available`}
            />
          </div>
        </DashboardCard>

        <DashboardCard
          title="Quick drill-down"
          description="Jump to detailed admin and operations views."
          icon={<LayoutGrid className="size-4" />}
        >
          <ul className="grid gap-2 sm:grid-cols-2">
            {data.drillDown.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:border-[#C9A227]/40 hover:bg-[#C9A227]/5"
                >
                  <span className="font-medium">{link.label}</span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    {link.count != null && link.count > 0 ? (
                      <span className="rounded-full bg-[#D4A017]/10 px-2 py-0.5 text-xs font-medium text-[#B8860B]">
                        {link.count}
                      </span>
                    ) : null}
                    <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </DashboardCard>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#0A2342]/10 bg-[#0A2342]/5 px-4 py-3 text-sm text-muted-foreground">
        <BarChart3 className="size-4 shrink-0 text-[#0A2342]" />
        <span>
          For student support buckets and outreach lists, use{" "}
          <Link href="/counselor/analytics" className="font-medium text-[#0A2342] underline-offset-2 hover:underline dark:text-white">
            Success Analytics
          </Link>
          . This dashboard is the broader leadership view across fundraising, service, and whole-school operations.
        </span>
        <Package className="ml-auto size-4 shrink-0 text-[#C9A227]" aria-hidden="true" />
      </div>
    </div>
  );
}
