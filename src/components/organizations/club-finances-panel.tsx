"use client";

import { useActionState } from "react";
import { Download, PiggyBank } from "lucide-react";

import {
  addClubLedgerEntryAction,
  createClubFundraiserAction,
  updateClubFundraiserStatusAction,
  type ClubFinanceActionState,
} from "@/features/club-finance/actions";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import {
  formatCents,
  type ClubFinanceSnapshot,
} from "@/lib/club-finance";

const initialState: ClubFinanceActionState = {};

type ClubFinancesPanelProps = {
  snapshot: ClubFinanceSnapshot;
  canManage: boolean;
};

export function ClubFinancesPanel({ snapshot, canManage }: ClubFinancesPanelProps) {
  const [ledgerState, ledgerAction, ledgerPending] = useActionState(
    addClubLedgerEntryAction,
    initialState,
  );
  const [fundraiserState, fundraiserAction, fundraiserPending] = useActionState(
    createClubFundraiserAction,
    initialState,
  );

  const activeFundraisers = snapshot.fundraisers.filter((f) => f.status === "ACTIVE");

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
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {snapshot.entries.length} ledger entr
            {snapshot.entries.length === 1 ? "y" : "ies"}
          </p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={
              <a
                href={`/organizations/${snapshot.organizationSlug}/finances/export`}
                download
              >
                <Download className="size-4" />
                Export CSV
              </a>
            }
          />
        </div>
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

      <DashboardCard title="Ledger" description="Newest first">
        {snapshot.entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No ledger entries yet.</p>
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
                {snapshot.entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-border/60">
                    <td className="px-2 py-2 whitespace-nowrap text-muted-foreground">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(entry.createdAt))}
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
                ))}
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
                      <p className="font-semibold">{f.title}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {f.status.toLowerCase()}
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
                  <p className="mt-1 text-xs text-muted-foreground">{pct}% of goal</p>
                  {canManage && f.status === "ACTIVE" ? (
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

        {canManage ? (
          <form action={fundraiserAction} className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            <input type="hidden" name="organizationId" value={snapshot.organizationId} />
            <input type="hidden" name="organizationSlug" value={snapshot.organizationSlug} />
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">New fundraiser title</span>
              <input
                name="title"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Spring merch sale"
              />
            </label>
            <label className="grid gap-1 text-sm sm:col-span-2">
              <span className="font-medium">Description</span>
              <input
                name="description"
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="Optional details"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-medium">Goal (USD)</span>
              <input
                name="goalAmount"
                type="number"
                min="1"
                step="0.01"
                required
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="500"
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" size="sm" disabled={fundraiserPending}>
                {fundraiserPending ? "Creating…" : "Create fundraiser"}
              </Button>
            </div>
            {fundraiserState.error ? (
              <p className="text-sm text-destructive sm:col-span-2">{fundraiserState.error}</p>
            ) : null}
            {fundraiserState.success ? (
              <p className="text-sm text-[#2E8B57] sm:col-span-2">{fundraiserState.success}</p>
            ) : null}
          </form>
        ) : null}
      </DashboardCard>
    </div>
  );
}
