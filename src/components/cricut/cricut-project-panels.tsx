"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, DollarSign, ShoppingBag, Square, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CRICUT_PROJECT_DIFFICULTY_LABELS,
  cricutProjectMargin,
} from "@/config/cricut-projects";
import { formatShopPrice } from "@/config/cricut-shop";
import {
  listCricutProjectInShopAction,
  startCricutProjectAction,
  toggleCricutBuildProgressAction,
  updateCricutBuildStatusAction,
  type CricutProjectActionState,
} from "@/features/cricut-projects/actions";
import type {
  CricutProjectBuildView,
  CricutProjectIdeaView,
} from "@/services/cricut-project-service";

const initialState: CricutProjectActionState = {};

type PanelView = "make" | "sell";

function ChecklistRow({
  buildId,
  ideaId,
  kind,
  index,
  checked,
  title,
  detail,
  trailing,
}: {
  buildId: string | null;
  ideaId: string;
  kind: "step" | "material";
  index: number;
  checked: boolean;
  title: React.ReactNode;
  detail?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  const body = (
    <>
      <span
        className={
          checked
            ? "mt-0.5 text-[#2E8B57]"
            : "mt-0.5 text-muted-foreground"
        }
        aria-hidden="true"
      >
        {checked ? <Check className="size-4" /> : <Square className="size-4" />}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={
            checked
              ? "block font-medium text-muted-foreground line-through"
              : "block font-medium"
          }
        >
          {title}
        </span>
        {detail ? (
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {detail}
          </span>
        ) : null}
      </span>
      {trailing ? (
        <span className="shrink-0 text-sm font-medium">{trailing}</span>
      ) : null}
    </>
  );

  if (!buildId) {
    return (
      <li className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5">
        {body}
      </li>
    );
  }

  return (
    <li>
      <form action={toggleCricutBuildProgressAction}>
        <input type="hidden" name="buildId" value={buildId} />
        <input type="hidden" name="ideaId" value={ideaId} />
        <input type="hidden" name="kind" value={kind} />
        <input type="hidden" name="index" value={index} />
        <button
          type="submit"
          className="flex w-full items-start gap-3 rounded-lg border border-border px-3 py-2.5 text-left transition-colors hover:border-[#DB2777]/40 hover:bg-muted/40"
        >
          {body}
        </button>
      </form>
    </li>
  );
}

export function CricutProjectPanels({
  idea,
  build,
  canList,
  initialView = "make",
}: {
  idea: CricutProjectIdeaView;
  build: CricutProjectBuildView | null;
  canList: boolean;
  initialView?: PanelView;
}) {
  const [view, setView] = useState<PanelView>(initialView);
  const [startState, startAction, starting] = useActionState(
    startCricutProjectAction,
    initialState,
  );
  const [sellState, sellAction, selling] = useActionState(
    listCricutProjectInShopAction,
    initialState,
  );
  const [priceInput, setPriceInput] = useState(
    (idea.suggestedSellPriceCents / 100).toFixed(2),
  );

  const buildId = build?.id ?? null;
  const completedSteps = build?.completedSteps ?? [];
  const gatheredMaterials = build?.gatheredMaterials ?? [];
  const stepProgress =
    idea.steps.length > 0
      ? Math.round((completedSteps.length / idea.steps.length) * 100)
      : 0;

  const outOfPocketCents = idea.materials
    .filter((material) => !material.clubSupply)
    .reduce((total, material) => total + material.costCents, 0);
  const clubSuppliedCents = idea.materials
    .filter((material) => material.clubSupply)
    .reduce((total, material) => total + material.costCents, 0);

  const livePriceCents = Math.round((Number(priceInput) || 0) * 100);
  const margin = cricutProjectMargin(
    idea.estimatedCostCents,
    livePriceCents > 0 ? livePriceCents : idea.suggestedSellPriceCents,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={view === "make" ? "default" : "outline"}
          onClick={() => setView("make")}
        >
          Make this
        </Button>
        <Button
          size="sm"
          variant={view === "sell" ? "default" : "outline"}
          onClick={() => setView("sell")}
        >
          Sell this
        </Button>
      </div>

      {view === "make" ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">What you need</h2>
              <span className="text-xs text-muted-foreground">
                {CRICUT_PROJECT_DIFFICULTY_LABELS[idea.difficulty]}
                {idea.timeMinutes ? ` · about ${idea.timeMinutes} min` : ""}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {idea.materials.map((material, index) => (
                <ChecklistRow
                  key={`${material.name}-${index}`}
                  buildId={buildId}
                  ideaId={idea.id}
                  kind="material"
                  index={index}
                  checked={gatheredMaterials.includes(index)}
                  title={material.name}
                  detail={
                    [
                      material.qty,
                      material.source,
                      material.clubSupply ? "Club supply" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined
                  }
                  trailing={formatShopPrice(material.costCents)}
                />
              ))}
            </ul>

            <div className="mt-5 rounded-xl border border-[#DB2777]/30 bg-[#DB2777]/5 px-4 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-[#DB2777]">
                <Wallet className="size-4" aria-hidden="true" />
                Total funds needed
              </p>
              <p className="mt-1 text-3xl font-bold text-[#0A2342] dark:text-white">
                {formatShopPrice(idea.estimatedCostCents)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatShopPrice(outOfPocketCents)} you buy at the dollar store
                {clubSuppliedCents > 0
                  ? ` · ${formatShopPrice(clubSuppliedCents)} from club supplies`
                  : ""}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Step-by-step</h2>
              {buildId ? (
                <span className="text-xs text-muted-foreground">
                  {completedSteps.length} of {idea.steps.length} done
                </span>
              ) : null}
            </div>

            {buildId ? (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[#DB2777] transition-all"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
            ) : null}

            <ol className="mt-4 space-y-2">
              {idea.steps.map((step, index) => (
                <ChecklistRow
                  key={`${step.title}-${index}`}
                  buildId={buildId}
                  ideaId={idea.id}
                  kind="step"
                  index={index}
                  checked={completedSteps.includes(index)}
                  title={`${index + 1}. ${step.title}`}
                  detail={step.detail}
                />
              ))}
            </ol>
          </section>

          {buildId ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="mr-auto text-sm text-muted-foreground">
                Tap a supply or step to check it off.
              </p>
              <form action={updateCricutBuildStatusAction}>
                <input type="hidden" name="buildId" value={buildId} />
                <input type="hidden" name="ideaId" value={idea.id} />
                <input type="hidden" name="status" value="COMPLETED" />
                <Button type="submit" size="sm">
                  Mark it made
                </Button>
              </form>
              <form action={updateCricutBuildStatusAction}>
                <input type="hidden" name="buildId" value={buildId} />
                <input type="hidden" name="ideaId" value={idea.id} />
                <input type="hidden" name="status" value="ABANDONED" />
                <Button type="submit" size="sm" variant="outline">
                  Set aside
                </Button>
              </form>
            </div>
          ) : (
            <form action={startAction} className="space-y-2">
              <input type="hidden" name="ideaId" value={idea.id} />
              <input type="hidden" name="intent" value="MAKE" />
              <Button type="submit" disabled={starting}>
                {starting ? "Adding…" : "Make this"}
              </Button>
              <p className="text-sm text-muted-foreground">
                Adds a personal checklist so you can tick off supplies and steps.
              </p>
              {startState.error ? (
                <p className="text-sm text-destructive">{startState.error}</p>
              ) : null}
              {startState.success ? (
                <p className="text-sm text-[#2E8B57]">{startState.success}</p>
              ) : null}
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <DollarSign className="size-4 text-[#DB2777]" aria-hidden="true" />
              How much it would sell for
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Suggested campus price based on what the supplies cost.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">Supplies cost</p>
                <p className="text-xl font-bold">
                  {formatShopPrice(idea.estimatedCostCents)}
                </p>
              </div>
              <div className="rounded-lg border border-[#DB2777]/30 bg-[#DB2777]/5 px-4 py-3">
                <p className="text-xs text-muted-foreground">Sell it for</p>
                <p className="text-xl font-bold text-[#DB2777]">
                  {formatShopPrice(
                    livePriceCents > 0
                      ? livePriceCents
                      : idea.suggestedSellPriceCents,
                  )}
                </p>
              </div>
              <div className="rounded-lg border border-border px-4 py-3">
                <p className="text-xs text-muted-foreground">You keep</p>
                <p className="text-xl font-bold text-[#2E8B57]">
                  {formatShopPrice(margin.profitCents)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {margin.marginPercent}% margin
                  {margin.multiple > 0 ? ` · ${margin.multiple}x cost` : ""}
                </p>
              </div>
            </div>

            {idea.sellNotes ? (
              <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-sm">
                {idea.sellNotes}
              </p>
            ) : null}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingBag className="size-4 text-[#DB2777]" aria-hidden="true" />
              List it in the Cricut shop
            </h2>

            {canList ? (
              <form action={sellAction} className="mt-4 space-y-4">
                <input type="hidden" name="ideaId" value={idea.id} />
                <label className="grid max-w-xs gap-1 text-sm">
                  <span className="font-medium">Your price (USD)</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={priceInput}
                    onChange={(event) => setPriceInput(event.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2"
                  />
                </label>
                <label className="flex max-w-md cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
                  <input
                    type="checkbox"
                    name="availableToSell"
                    value="on"
                    defaultChecked
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      Available to sell
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      On = campus can order it. Off = showcase only.
                    </span>
                  </span>
                </label>
                <Button type="submit" disabled={selling}>
                  {selling ? "Listing…" : "Sell this"}
                </Button>
                {sellState.error ? (
                  <p className="text-sm text-destructive">{sellState.error}</p>
                ) : null}
                {sellState.success ? (
                  <p className="text-sm text-[#2E8B57]">
                    {sellState.success}{" "}
                    {sellState.itemId ? (
                      <Link
                        href={`/cricut/shop/${sellState.itemId}`}
                        className="font-medium underline"
                      >
                        View listing
                      </Link>
                    ) : null}
                  </p>
                ) : null}
              </form>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Join Cricut Club to publish creations. Anyone can still browse the{" "}
                <Link href="/cricut/shop" className="font-medium underline">
                  shop catalog
                </Link>
                .
              </p>
            )}

            {build?.listedItemId ? (
              <p className="mt-4 text-sm text-muted-foreground">
                You already listed this one.{" "}
                <Link
                  href={`/cricut/shop/${build.listedItemId}`}
                  className="font-medium underline"
                >
                  Open the listing
                </Link>
              </p>
            ) : null}
          </section>
        </div>
      )}
    </div>
  );
}
