"use client";

import { useActionState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarRange, Download, PiggyBank } from "lucide-react";

import {
  addClubLedgerEntryAction,
  updateClubFundraiserStatusAction,
  type ClubFinanceActionState,
} from "@/features/club-finance/actions";
import { CampusCampaignForm } from "@/components/fundraisers/campus-campaign-form";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  ALL_TIME_PERIOD_KEY,
  campusCampaignHeadline,
  formatCents,
  type ClubFinanceSnapshot,
} from "@/lib/club-finance";

const initialState: ClubFinanceActionState = {};

type ClubFinancesPanelProps = {
  snapshot: ClubFinanceSnapshot;
  canManage: boolean;
  canPostCampaign?: boolean;
  organizationType?: string;
  storageConfigured?: boolean;
};

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

/** Local (not UTC) `YYYY-MM-DD`, so the date input defaults to today here. */
function todayInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function ClubFinancesPanel({
  snapshot,
  canManage,
  canPostCampaign,
  organizationType,
  storageConfigured = false,
}: ClubFinancesPanelProps) {
  const canPost = canPostCampaign ?? canManage;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ledgerState, ledgerAction, ledgerPending] = useActionState(
    addClubLedgerEntryAction,
    initialState,
  );
  const activeFundraisers = snapshot.fundraisers.filter((f) => f.status === "ACTIVE");
  const isAllTime = snapshot.period.key === ALL_TIME_PERIOD_KEY;
  const periodLabel = snapshot.period.label;

  const selectPeriod = useCallback(
    (key: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (key === ALL_TIME_PERIOD_KEY) {
        next.delete("period");
      } else {
        next.set("period", key);
      }
      const query = next.toString();
      router.push(query ? `?${query}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const exportHref = (() => {
    const params = new URLSearchParams();
    if (!isAllTime) {
      params.set("period", snapshot.period.key);
    }
    const query = params.toString();
    return `/organizations/${snapshot.organizationSlug}/finances/export${
      query ? `?${query}` : ""
    }`;
  })();

  return (
    <div className="space-y-6">
      <DashboardCard
        title="Club balance"
        description={`Ledger for ${snapshot.organizationName}`}
        icon={<PiggyBank className="size-5" />}
        status={{
          label: formatCents(snapshot.balanceCents),
          variant: snapshot.balanceCents >= 0 ? "success" : "warning",
        }}
      >
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatCents(snapshot.balanceCents)}
          </span>{" "}
          is the all-time balance — every deposit ever recorded minus every
          expense, across {snapshot.totalEntryCount} ledger entr
          {snapshot.totalEntryCount === 1 ? "y" : "ies"}. Changing the period
          below never hides money; it only changes which entries are listed.
        </p>

        <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
          <label className="grid gap-1 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CalendarRange className="size-4" aria-hidden="true" />
              Showing period
            </span>
            <select
              className="min-w-56 rounded-md border border-border bg-background px-3 py-2"
              value={snapshot.period.key}
              onChange={(event) => selectPeriod(event.target.value)}
            >
              {snapshot.availablePeriods.map((period) => (
                <option key={period.key} value={period.key}>
                  {period.label}
                </option>
              ))}
              {snapshot.availablePeriods.some(
                (period) => period.key === snapshot.period.key,
              ) ? null : (
                <option value={snapshot.period.key}>
                  {periodLabel} (no activity)
                </option>
              )}
            </select>
          </label>

          {isAllTime ? null : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => selectPeriod(ALL_TIME_PERIOD_KEY)}
            >
              Back to all time
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a href={exportHref} download>
                <Download className="size-4" />
                Export CSV
              </a>
            }
          />
        </div>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border p-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {isAllTime ? "Opening balance" : `Balance before ${periodLabel}`}
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatCents(snapshot.openingBalanceCents)}
            </dd>
          </div>
          <div className="rounded-xl border border-border p-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Deposits in
            </dt>
            <dd className="mt-1 text-lg font-semibold text-[#2E8B57]">
              +{formatCents(snapshot.periodDepositsCents)}
            </dd>
          </div>
          <div className="rounded-xl border border-border p-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Expenses out
            </dt>
            <dd className="mt-1 text-lg font-semibold text-destructive">
              −{formatCents(snapshot.periodWithdrawalsCents)}
            </dd>
          </div>
          <div className="rounded-xl border border-border p-3">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {isAllTime ? "Balance" : `Balance after ${periodLabel}`}
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {formatCents(snapshot.closingBalanceCents)}
            </dd>
          </div>
        </dl>
      </DashboardCard>

      {canManage ? (
        <DashboardCard title="Add deposit or withdrawal" description="Advisors and club leads only.">
          <form action={ledgerAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="organizationId" value={snapshot.organizationId} />
            <input type="hidden" name="organizationSlug" value={snapshot.organizationSlug} />
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Type</span>
              <select
                name="type"
                className="rounded-md border border-border bg-background px-3 py-2"
                defaultValue="DEPOSIT"
              >
                <option value="DEPOSIT">Deposit / income</option>
                <option value="WITHDRAWAL">Withdrawal / expense</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Amount (USD)</span>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="25.00"
              />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">Date of transaction</span>
              <input
                name="occurredOn"
                type="date"
                defaultValue={todayInputValue()}
                className="rounded-md border border-border bg-background px-3 py-2"
              />
              <span className="text-xs text-muted-foreground">
                Backdate older receipts so they land in the right month.
              </span>
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">Memo</span>
              <input
                name="memo"
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Bake sale proceeds, cable purchase, …"
              />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">Tag fundraiser (optional)</span>
              <select
                name="fundraiserId"
                className="rounded-md border border-border bg-background px-3 py-2"
                defaultValue=""
              >
                <option value="">None</option>
                {activeFundraisers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" size="sm" disabled={ledgerPending}>
                {ledgerPending ? "Saving…" : "Save entry"}
              </Button>
              {ledgerState.error ? (
                <p className="mt-2 text-sm text-destructive">{ledgerState.error}</p>
              ) : null}
              {ledgerState.success ? (
                <p className="mt-2 text-sm text-[#2E8B57]">{ledgerState.success}</p>
              ) : null}
            </div>
          </form>
        </DashboardCard>
      ) : null}

      <DashboardCard
        title={`Ledger — ${periodLabel}`}
        description={
          isAllTime
            ? "Every entry, newest first"
            : `${snapshot.entries.length} entr${
                snapshot.entries.length === 1 ? "y" : "ies"
              } in ${periodLabel} · newest first`
        }
      >
        {snapshot.entries.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {snapshot.totalEntryCount === 0
                ? "No ledger entries yet."
                : `No entries dated in ${periodLabel}.`}
            </p>
            {snapshot.totalEntryCount > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => selectPeriod(ALL_TIME_PERIOD_KEY)}
              >
                Show all {snapshot.totalEntryCount} entries
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-2 font-medium">Date</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Amount</th>
                  <th className="px-2 py-2 font-medium">Memo</th>
                  <th className="px-2 py-2 font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.entries.map((entry) => {
                  const backfilled =
                    new Date(entry.occurredAt).toDateString() !==
                    new Date(entry.createdAt).toDateString();

                  return (
                    <tr key={entry.id} className="border-b border-border/60">
                      <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">
                        {formatDate(entry.occurredAt)}
                        {backfilled ? (
                          <span className="mt-0.5 block text-xs">
                            entered {formatDate(entry.createdAt)}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2">
                        <span
                          className={
                            entry.type === "DEPOSIT"
                              ? "text-[#2E8B57]"
                              : "text-destructive"
                          }
                        >
                          {entry.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                        </span>
                        {entry.fundraiserTitle ? (
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {entry.fundraiserTitle}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 font-medium">
                        {entry.type === "WITHDRAWAL" ? "−" : "+"}
                        {formatCents(entry.amountCents)}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {entry.memo || "—"}
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">
                        {entry.createdByName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>

      <DashboardCard
        title="Fundraisers"
        description="Goals vs amounts raised (from tagged deposits/withdrawals)"
      >
        {snapshot.fundraisers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fundraisers yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {snapshot.fundraisers.map((f) => {
              const pct =
                f.goalCents > 0
                  ? Math.min(100, Math.round((f.raisedCents / f.goalCents) * 100))
                  : 0;
              return (
                <li
                  key={f.id}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {campusCampaignHeadline(f.kind, f.title)}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {f.status.toLowerCase()}
                        {f.isPublic ? " · campus headline" : " · club only"}
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCents(f.raisedCents)} / {formatCents(f.goalCents)}
                    </p>
                  </div>
                  {f.description ? (
                    <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                  ) : null}
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-[#2F80ED]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pct}% of goal · all time
                  </p>
                  {isAllTime ? null : (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatCents(f.periodRaisedCents)} raised in {periodLabel}
                    </p>
                  )}
                  {f.taggedEntryCount === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      No ledger entries tagged to this fundraiser yet, so it
                      reads $0.00. Tag a deposit above to start tracking it.
                    </p>
                  ) : null}
                  {canPost && f.status === "ACTIVE" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          void updateClubFundraiserStatusAction(
                            snapshot.organizationId,
                            snapshot.organizationSlug,
                            f.id,
                            "COMPLETED",
                          )
                        }
                      >
                        Mark completed
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          void updateClubFundraiserStatusAction(
                            snapshot.organizationId,
                            snapshot.organizationSlug,
                            f.id,
                            "CANCELLED",
                          )
                        }
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}

        {canPost ? (
          <div className="mt-6 border-t border-border pt-6">
            <p className="mb-3 text-sm font-medium">Post a campus campaign</p>
            <CampusCampaignForm
              organizationId={snapshot.organizationId}
              organizationSlug={snapshot.organizationSlug}
              organizationType={organizationType}
              returnTo="finances"
              storageConfigured={storageConfigured}
            />
          </div>
        ) : null}
      </DashboardCard>
    </div>
  );
}
