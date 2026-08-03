"use client";

import { useActionState, useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatShopPrice } from "@/config/cricut-shop";
import {
  createCricutListingAction,
  type CricutShopActionState,
} from "@/features/cricut-shop/actions";

const initialState: CricutShopActionState = {};

export function CricutListingForm({
  storageConfigured,
}: {
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    createCricutListingAction,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const priceCents = Math.round((Number(priceInput) || 0) * 100);

  return (
    <form action={formAction} className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5">
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Listing preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                aria-label="Remove photo"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="size-12 opacity-40" />
              <span className="text-sm">Add a photo</span>
            </div>
          )}
        </div>
        <div className="border-t border-border px-3 py-2">
          <p className="text-lg font-bold">
            {priceCents > 0 ? formatShopPrice(priceCents) : "$0"}
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        name="photo"
        type="file"
        accept="image/*"
        capture="environment"
        className="text-sm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : null);
        }}
      />
      {!storageConfigured ? (
        <p className="text-xs text-muted-foreground">
          Photo storage isn’t configured — you can still list without an image.
        </p>
      ) : null}

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Blue Don decal"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Price (USD)</span>
        <input
          name="price"
          type="number"
          min="0"
          step="0.01"
          required
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          name="description"
          rows={4}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Materials, size, color options…"
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Publishing…" : "List in Cricut Shop"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}
    </form>
  );
}
