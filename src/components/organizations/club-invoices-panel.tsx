"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { Camera, FileText, Plus, Trash2 } from "lucide-react";

import {
  approveClubInvoiceAction,
  rejectClubInvoiceAction,
  submitClubInvoiceAction,
  type ClubInvoiceActionState,
} from "@/features/club-invoices/actions";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { CAMPUS_IMAGE_ACCEPT_WITH_PDF } from "@/config/uploads";
import { formatCents } from "@/lib/club-finance";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";
import type { ClubInvoiceView } from "@/services/club-invoice-service";

const initialState: ClubInvoiceActionState = {};

type LineDraft = {
  key: string;
  description: string;
  quantity: string;
  unitCost: string;
};

type ClubInvoicesPanelProps = {
  organizationId: string;
  organizationSlug: string;
  organizationName: string;
  invoices: ClubInvoiceView[];
  canSubmit: boolean;
  canReview: boolean;
  storageConfigured: boolean;
  /** Compact mode for embedding under IT multi-club finance hub. */
  showForm?: boolean;
};

function todayInputValue() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export function ClubInvoicesPanel({
  organizationId,
  organizationSlug,
  organizationName,
  invoices,
  canSubmit,
  canReview,
  storageConfigured,
  showForm = true,
}: ClubInvoicesPanelProps) {
  const [state, formAction, pending] = useActionState(
    submitClubInvoiceAction,
    initialState,
  );
  const [lines, setLines] = useState<LineDraft[]>([
    { key: "1", description: "", quantity: "1", unitCost: "" },
  ]);
  const receiptRef = useRef<HTMLInputElement>(null);
  const receiptGuard = useUploadGuard({
    inputRef: receiptRef,
    allowNonImage: true,
  });

  const estimatedTotal = useMemo(() => {
    return lines.reduce((sum, line) => {
      const qty = Number(line.quantity) || 0;
      const unit = Number(line.unitCost) || 0;
      return sum + Math.round(qty * unit * 100);
    }, 0);
  }, [lines]);

  return (
    <div className="space-y-6">
      {showForm && canSubmit ? (
        <DashboardCard
          title="Submit expense / invoice"
          description={`${organizationName} · materials + receipt scan`}
          icon={<FileText className="size-5" />}
        >
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="organizationId" value={organizationId} />
            <input type="hidden" name="organizationSlug" value={organizationSlug} />

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Vendor / payee</span>
                <input
                  name="vendor"
                  required
                  className="rounded-md border border-border bg-background px-3 py-2"
                  placeholder="Amazon, Michaels, local vendor…"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="font-medium">Invoice date</span>
                <input
                  name="invoiceDate"
                  type="date"
                  required
                  defaultValue={todayInputValue()}
                  className="rounded-md border border-border bg-background px-3 py-2"
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium">Notes</span>
              <input
                name="memo"
                className="rounded-md border border-border bg-background px-3 py-2"
                placeholder="What was this for?"
              />
            </label>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Materials / line items</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setLines((prev) => [
                      ...prev,
                      {
                        key: String(Date.now()),
                        description: "",
                        quantity: "1",
                        unitCost: "",
                      },
                    ])
                  }
                >
                  <Plus className="size-4" />
                  Add line
                </Button>
              </div>
              <ul className="space-y-2">
                {lines.map((line, index) => (
                  <li
                    key={line.key}
                    className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[1fr_5rem_6rem_auto]"
                  >
                    <input
                      name="lineDescription"
                      value={line.description}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? { ...row, description: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Material name"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      required={index === 0}
                    />
                    <input
                      name="lineQuantity"
                      type="number"
                      min="0.001"
                      step="any"
                      value={line.quantity}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? { ...row, quantity: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Qty"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      required={index === 0}
                    />
                    <input
                      name="lineUnitCost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.unitCost}
                      onChange={(e) =>
                        setLines((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? { ...row, unitCost: e.target.value }
                              : row,
                          ),
                        )
                      }
                      placeholder="Unit $"
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      required={index === 0}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={lines.length === 1}
                      onClick={() =>
                        setLines((prev) => prev.filter((_, i) => i !== index))
                      }
                      aria-label="Remove line"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground">
                Estimated total:{" "}
                <span className="font-semibold text-foreground">
                  {formatCents(estimatedTotal)}
                </span>
              </p>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="font-medium">Scan receipt</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <Camera className="size-3.5" aria-hidden="true" />
                Use camera or choose a photo / PDF
                {!storageConfigured ? " · storage not configured yet" : ""}
              </span>
              <input
                ref={receiptRef}
                name="receipt"
                type="file"
                accept={CAMPUS_IMAGE_ACCEPT_WITH_PDF}
                capture="environment"
                onChange={receiptGuard.onFileChange}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[#0A2342] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white"
              />
              <UploadGuardNotice guard={receiptGuard} />
            </label>

            <div>
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Submitting…" : "Submit for approval"}
              </Button>
              {state.error ? (
                <p className="mt-2 text-sm text-destructive">{state.error}</p>
              ) : null}
              {state.success ? (
                <p className="mt-2 text-sm text-[#2E8B57]">{state.success}</p>
              ) : null}
            </div>
          </form>
        </DashboardCard>
      ) : null}

      <DashboardCard
        title="Expense submissions"
        description="Pending invoices post to the club ledger when approved."
      >
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <ul className="space-y-3">
            {invoices.map((invoice) => (
              <li
                key={invoice.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{invoice.vendor}</p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.organizationName} ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(invoice.invoiceDate))}{" "}
                      · {invoice.submittedByName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCents(invoice.totalCents)}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {invoice.status.toLowerCase()}
                    </p>
                  </div>
                </div>
                {invoice.memo ? (
                  <p className="mt-2 text-sm text-muted-foreground">{invoice.memo}</p>
                ) : null}
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {invoice.lines.map((line) => (
                    <li key={line.id}>
                      {line.description} · {line.quantity} ×{" "}
                      {formatCents(line.unitCostCents)} ={" "}
                      {formatCents(line.lineTotalCents)}
                    </li>
                  ))}
                </ul>
                {invoice.receiptUrl ? (
                  <a
                    href={invoice.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm font-medium text-[#2F80ED] hover:underline"
                  >
                    View receipt
                  </a>
                ) : null}

                {canReview && invoice.status === "PENDING" ? (
                  <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                    <form action={approveClubInvoiceAction}>
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <input
                        type="hidden"
                        name="organizationId"
                        value={invoice.organizationId}
                      />
                      <input
                        type="hidden"
                        name="organizationSlug"
                        value={invoice.organizationSlug}
                      />
                      <Button type="submit" size="sm">
                        Approve → ledger
                      </Button>
                    </form>
                    <form action={rejectClubInvoiceAction}>
                      <input type="hidden" name="invoiceId" value={invoice.id} />
                      <input
                        type="hidden"
                        name="organizationId"
                        value={invoice.organizationId}
                      />
                      <input
                        type="hidden"
                        name="organizationSlug"
                        value={invoice.organizationSlug}
                      />
                      <Button type="submit" size="sm" variant="outline">
                        Reject
                      </Button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </DashboardCard>
    </div>
  );
}
