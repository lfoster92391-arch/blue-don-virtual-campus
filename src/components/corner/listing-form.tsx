"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, ImageIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CORNER_CATEGORIES,
  CORNER_PAYMENT_METHODS,
  formatPrice,
} from "@/config/corner-store";
import {
  createCornerListingAction,
  type CornerActionState,
} from "@/features/corner/actions";

const initialState: CornerActionState = {};

type SellableOrg = { id: string; name: string };

type ListingFormProps = {
  storageConfigured: boolean;
  organizations: SellableOrg[];
};

export function ListingForm({ storageConfigured, organizations }: ListingFormProps) {
  const [state, formAction, pending] = useActionState(
    createCornerListingAction,
    initialState,
  );
  const [preview, setPreview] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [methods, setMethods] = useState<string[]>(["cash"]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const priceCents = Math.round((Number(priceInput) || 0) * 100);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
  }

  function clearPhoto() {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function toggleMethod(id: string) {
    setMethods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Photo + live preview with price underneath */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Photo</span>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-[#0A2342]/5 to-[#2F80ED]/10">
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
                  onClick={clearPhoto}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="size-12 opacity-40" aria-hidden="true" />
                <span className="text-sm">Add a photo of your item</span>
              </div>
            )}
          </div>
          {/* Price displayed under the photo */}
          <div className="border-t border-border bg-card px-3 py-2">
            <p className="text-lg font-bold text-[#0A2342] dark:text-white">
              {priceCents > 0 ? formatPrice(priceCents) : "$0"}
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          id="photo"
          name="photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="sr-only"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-4" />
            Take photo
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute("capture");
                fileInputRef.current.click();
                // Restore capture for the next "Take photo" tap.
                setTimeout(
                  () => fileInputRef.current?.setAttribute("capture", "environment"),
                  0,
                );
              }
            }}
          >
            <Upload className="size-4" />
            Choose from library
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use your camera on mobile, or pick a photo from your phone or computer.
          JPEG/PNG/WebP/HEIC up to 8 MB.
          {storageConfigured
            ? ""
            : " · Photo storage isn't configured yet — you can still post without a photo."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input id="title" name="title" required placeholder="Blue Dons spirit hoodie" />
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">
            Price (USD)
          </label>
          <Input
            id="price"
            name="price"
            required
            inputMode="decimal"
            type="number"
            min="0"
            step="0.01"
            placeholder="25.00"
            value={priceInput}
            onChange={(event) => setPriceInput(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue=""
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Choose a category</option>
            {CORNER_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description (optional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe the item — size, condition, pickup details, and anything a buyer should know."
          className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {organizations.length > 0 ? (
        <div className="space-y-2">
          <label htmlFor="organizationId" className="text-sm font-medium">
            List on behalf of (optional)
          </label>
          <select
            id="organizationId"
            name="organizationId"
            defaultValue=""
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">Just me</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* Payment options the seller accepts */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">How can buyers pay?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {CORNER_PAYMENT_METHODS.map((method) => {
            const checked = methods.includes(method.id);
            return (
              <label
                key={method.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-[#2F80ED] has-[:checked]:bg-[#2F80ED]/5"
              >
                <input
                  type="checkbox"
                  name="paymentMethods"
                  value={method.id}
                  checked={checked}
                  onChange={() => toggleMethod(method.id)}
                  className="mt-0.5 size-4"
                />
                <span className="min-w-0">
                  <span className="font-medium text-foreground">
                    {method.label}
                    {method.comingSoon ? (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        (soon)
                      </span>
                    ) : null}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {method.blurb}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {/* Handle inputs for the peer-to-peer methods that are selected */}
        {CORNER_PAYMENT_METHODS.filter(
          (method) => method.needsHandle && methods.includes(method.id),
        ).map((method) => (
          <div key={method.id} className="space-y-1.5">
            <label htmlFor={`handle_${method.id}`} className="text-sm font-medium">
              {method.handleLabel}
            </label>
            <Input
              id={`handle_${method.id}`}
              name={`handle_${method.id}`}
              placeholder={method.handlePlaceholder}
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <label htmlFor="paymentNote" className="text-sm font-medium">
            Payment / pickup note (optional)
          </label>
          <Input
            id="paymentNote"
            name="paymentNote"
            placeholder="Meet at the front office during lunch."
          />
        </div>
      </fieldset>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-600" role="status">
          {state.success}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Posting..." : "Post to Blue Don Corner"}
      </Button>
    </form>
  );
}
