"use client";

import { useMemo, useState, useActionState, useTransition } from "react";
import { Check, ClipboardCopy, Lock, Printer, ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  resetBroadcastScriptTemplateAction,
  saveBroadcastScriptTemplateAction,
  saveDailyRundownAction,
  type BroadcastScriptActionState,
} from "@/features/broadcast-script/actions";
import {
  renderFullScript,
  type BroadcastDailyScriptView,
  type BroadcastScriptSlotView,
} from "@/config/broadcast-script";

const initialState: BroadcastScriptActionState = {};

type DailyRundownPanelProps = {
  script: BroadcastDailyScriptView;
  organizationId: string;
  canEditValues: boolean;
  canEditPrayer: boolean;
  canEditTemplate: boolean;
};

function buildPreviewSlots(
  slots: BroadcastScriptSlotView[],
  draftValues: Record<string, string>,
  prayerText: string,
): BroadcastScriptSlotView[] {
  return slots.map((slot) => {
    if (slot.slotType === "LOCKED_DAILY") {
      return { ...slot, value: prayerText };
    }
    if (slot.slotType === "FIXED") {
      return slot;
    }
    return {
      ...slot,
      value: draftValues[slot.key] ?? slot.value,
    };
  });
}

export function DailyRundownPanel({
  script,
  organizationId,
  canEditValues,
  canEditPrayer,
  canEditTemplate,
}: DailyRundownPanelProps) {
  const [saveState, saveAction, savePending] = useActionState(
    saveDailyRundownAction,
    initialState,
  );
  const [templateState, templateAction, templatePending] = useActionState(
    saveBroadcastScriptTemplateAction,
    initialState,
  );
  const [resetPending, startReset] = useTransition();

  const [draftValues, setDraftValues] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        script.slots
          .filter((s) => s.slotType === "STUDENT_FILL")
          .map((s) => [s.key, s.value]),
      ),
  );
  const [prayerText, setPrayerText] = useState(script.prayerText);
  const [copied, setCopied] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [slotsJson, setSlotsJson] = useState(() =>
    JSON.stringify(
      script.slots.map(
        ({ key, label, template, order, required, slotType, placeholder }) => ({
          key,
          label,
          template,
          order,
          required,
          slotType,
          placeholder,
        }),
      ),
      null,
      2,
    ),
  );

  const preview = useMemo(() => {
    const slots = buildPreviewSlots(script.slots, draftValues, prayerText);
    return renderFullScript(slots, prayerText);
  }, [script.slots, draftValues, prayerText]);

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function printScript() {
    const w = window.open("", "_blank", "noopener,noreferrer,width=720,height=900");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Show Script</title>
      <style>
        body { font-family: Georgia, "Times New Roman", serif; padding: 2rem; line-height: 1.55; color: #0a2342; }
        h1 { font-size: 1.25rem; letter-spacing: 0.04em; text-transform: uppercase; }
        pre { white-space: pre-wrap; font-family: inherit; font-size: 1rem; }
      </style></head><body>
      <h1>Blue Don Live · Daily Rundown</h1>
      <p>${script.scriptDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}</p>
      <pre>${preview.replace(/</g, "&lt;")}</pre>
      </body></html>`);
    w.document.close();
    w.focus();
    w.print();
  }

  const dateLabel = script.scriptDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E11D48]">
            <ScrollText className="size-3.5" aria-hidden="true" />
            Daily Rundown · Show Script
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Shared production sheet for {dateLabel}. The crew fills slots;
            advisors set the daily prayer.
          </p>
          {script.updatedByName && script.updatedAt ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Last updated by {script.updatedByName} ·{" "}
              {script.updatedAt.toLocaleString()}
            </p>
          ) : !script.isPersisted ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Draft from studio template — save to share with the crew.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyScript}>
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <ClipboardCopy className="size-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy script"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={printScript}>
            <Printer className="size-4" aria-hidden="true" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveAction} className="space-y-5">
          <input type="hidden" name="organizationId" value={organizationId} />

          {script.slots.map((slot) => {
            if (slot.slotType === "FIXED") {
              return (
                <div
                  key={slot.key}
                  className="rounded-lg border border-[#0A2342]/15 bg-[#0A2342]/5 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {slot.order}. {slot.label}
                  </p>
                  <p className="mt-1 font-semibold tracking-wide text-[#0A2342] dark:text-white">
                    {slot.template}
                  </p>
                </div>
              );
            }

            if (slot.slotType === "LOCKED_DAILY") {
              return (
                <div key={slot.key} className="space-y-2">
                  <label
                    htmlFor={`prayer-${slot.key}`}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Lock className="size-3.5 text-[#C9A227]" aria-hidden="true" />
                    {slot.order}. {slot.label}
                    <span className="text-xs font-normal text-muted-foreground">
                      (advisor / daily)
                    </span>
                  </label>
                  <textarea
                    id={`prayer-${slot.key}`}
                    name="prayerText"
                    rows={4}
                    value={prayerText}
                    onChange={(e) => setPrayerText(e.target.value)}
                    readOnly={!canEditPrayer}
                    placeholder={slot.placeholder}
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 read-only:bg-muted/40"
                  />
                </div>
              );
            }

            return (
              <div key={slot.key} className="space-y-2">
                <label
                  htmlFor={`slot-${slot.key}`}
                  className="text-sm font-medium"
                >
                  {slot.order}. {slot.label}
                  {slot.required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </label>
                <p className="text-xs text-muted-foreground">{slot.template}</p>
                {canEditValues ? (
                  <Input
                    id={`slot-${slot.key}`}
                    name={`slot_${slot.key}`}
                    value={draftValues[slot.key] ?? ""}
                    onChange={(e) =>
                      setDraftValues((prev) => ({
                        ...prev,
                        [slot.key]: e.target.value,
                      }))
                    }
                    required={slot.required}
                    placeholder={slot.placeholder}
                  />
                ) : (
                  <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
                    {(draftValues[slot.key] || slot.value).trim() || (
                      <span className="text-muted-foreground">Not filled yet</span>
                    )}
                  </p>
                )}
              </div>
            );
          })}

          {saveState.error ? (
            <p className="text-sm text-destructive" role="alert">
              {saveState.error}
            </p>
          ) : null}
          {saveState.success ? (
            <p className="text-sm text-emerald-600" role="status">
              {saveState.success}
            </p>
          ) : null}

          {canEditValues || canEditPrayer ? (
            <Button type="submit" size="sm" disabled={savePending}>
              {savePending ? "Saving…" : "Save show script"}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">
              View-only — join the Broadcasting roster to edit the shared
              rundown.
            </p>
          )}
        </form>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#E11D48]/25 bg-gradient-to-br from-[#E11D48]/5 to-transparent p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#E11D48]">
              Live preview
            </p>
            <pre className="mt-4 whitespace-pre-wrap font-serif text-sm leading-relaxed text-[#0A2342] dark:text-white">
              {preview}
            </pre>
          </div>

          {canEditTemplate ? (
            <div className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">Advisor · template structure</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTemplateEditor((v) => !v)}
                  >
                    {showTemplateEditor ? "Hide editor" : "Edit slots JSON"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={resetPending}
                    onClick={() =>
                      startReset(async () => {
                        await resetBroadcastScriptTemplateAction(organizationId);
                      })
                    }
                  >
                    {resetPending ? "Resetting…" : "Reset to default"}
                  </Button>
                </div>
              </div>
              {showTemplateEditor ? (
                <form action={templateAction} className="mt-4 space-y-3">
                  <input
                    type="hidden"
                    name="organizationId"
                    value={organizationId}
                  />
                  <textarea
                    name="slotsJson"
                    rows={14}
                    value={slotsJson}
                    onChange={(e) => setSlotsJson(e.target.value)}
                    className="w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  />
                  {templateState.error ? (
                    <p className="text-sm text-destructive" role="alert">
                      {templateState.error}
                    </p>
                  ) : null}
                  {templateState.success ? (
                    <p className="text-sm text-emerald-600" role="status">
                      {templateState.success}
                    </p>
                  ) : null}
                  <Button type="submit" size="sm" disabled={templatePending}>
                    {templatePending ? "Saving…" : "Save template"}
                  </Button>
                </form>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Slot types: STUDENT_FILL (crew fills), LOCKED_DAILY (prayer),
                  FIXED (closer). Extensible for future segments.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
