"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, ImageIcon, Upload, X } from "lucide-react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { formatShopPrice } from "@/config/cricut-shop";
import { CAMPUS_IMAGE_ACCEPT, IMAGE_UPLOAD_MAX_LABEL } from "@/config/uploads";
import {
  createCricutListingAction,
  type CricutShopActionState,
} from "@/features/cricut-shop/actions";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";

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
  const [priceInput, setPriceInput] = useState("");
  const [availableToSell, setAvailableToSell] = useState(true);
  const [customizable, setCustomizable] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoGuard = useUploadGuard({ inputRef: fileInputRef });
  const priceCents = Math.round((Number(priceInput) || 0) * 100);
  const busy = pending || photoGuard.preparing;

  function openPhotoPicker(useCamera: boolean) {
    const input = fileInputRef.current;
    if (!input) return;
    if (useCamera) {
      input.setAttribute("capture", "environment");
    } else {
      input.removeAttribute("capture");
    }
    input.click();
    if (useCamera) {
      window.setTimeout(() => input.removeAttribute("capture"), 0);
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5">
          {photoGuard.preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoGuard.preview}
                alt="Listing preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={photoGuard.clear}
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
        id="cricut-listing-photo"
        name="photo"
        type="file"
        accept={CAMPUS_IMAGE_ACCEPT}
        className="sr-only"
        onChange={photoGuard.onFileChange}
      />
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={() => openPhotoPicker(false)}
        >
          <Upload className="size-4" />
          {photoGuard.preview ? "Change photo" : "Upload photo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => openPhotoPicker(true)}
        >
          <Camera className="size-4" />
          Take photo
        </Button>
      </div>
      <UploadGuardNotice guard={photoGuard} />
      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP, GIF, or HEIC — up to {IMAGE_UPLOAD_MAX_LABEL}. Phone
        photos are resized automatically.
        {!storageConfigured
          ? " Photo storage isn’t configured — you can still list without an image."
          : ""}
      </p>

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

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
        <input
          type="checkbox"
          name="availableToSell"
          value="on"
          checked={availableToSell}
          onChange={(e) => setAvailableToSell(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium">Available to sell</span>
          <span className="block text-xs text-muted-foreground">
            On = customers can order. Off = catalog showcase only.
          </span>
        </span>
      </label>
      {!availableToSell ? (
        <input type="hidden" name="availableToSell" value="off" />
      ) : null}

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3">
        <input
          type="checkbox"
          name="customizable"
          value="on"
          checked={customizable}
          onChange={(e) => setCustomizable(e.target.checked)}
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium">Customizable</span>
          <span className="block text-xs text-muted-foreground">
            On = shoppers pick sport, printed name, font, and their own design.
          </span>
        </span>
      </label>
      {!customizable ? (
        <input type="hidden" name="customizable" value="off" />
      ) : null}

      <Button type="submit" disabled={busy}>
        {pending ? "Publishing…" : "Add to catalog"}
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
