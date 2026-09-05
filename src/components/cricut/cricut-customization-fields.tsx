"use client";

import { Camera, Upload, X } from "lucide-react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import {
  CRICUT_DEFAULT_PRINT_FONT,
  CRICUT_PRINT_FONTS,
  CRICUT_PRINT_NAME_MAX,
  CRICUT_SHOP_SPORTS,
  cricutFontFamily,
  type CricutPrintFontKey,
} from "@/config/cricut-customization";
import { CAMPUS_IMAGE_ACCEPT, IMAGE_UPLOAD_MAX_LABEL } from "@/config/uploads";
import type { UploadGuard } from "@/lib/uploads/use-upload-guard";

export type CricutCustomizationDraft = {
  sportSlug: string;
  printName: string;
  fontKey: CricutPrintFontKey;
};

export function CricutCustomizationFields({
  value,
  onChange,
  designInputRef,
  photoGuard,
  storageConfigured,
  idPrefix = "cricut-custom",
}: {
  value: CricutCustomizationDraft;
  onChange: (next: CricutCustomizationDraft) => void;
  designInputRef: React.RefObject<HTMLInputElement | null>;
  photoGuard: UploadGuard;
  storageConfigured: boolean;
  idPrefix?: string;
}) {
  function openPhotoPicker(useCamera: boolean) {
    const input = designInputRef.current;
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

  const previewName = value.printName.trim() || "Your name";

  return (
    <fieldset className="space-y-4 rounded-xl border border-border bg-card p-4">
      <legend className="px-1 text-sm font-semibold">Customize this item</legend>
      <p className="text-xs text-muted-foreground">
        Sport, the name to print, a Canva web font, and an optional design of
        your own. Saved with the order so Cricut Club can make it.
      </p>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Sport</span>
        <select
          value={value.sportSlug}
          onChange={(e) => onChange({ ...value, sportSlug: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2"
        >
          <option value="">No sport / other</option>
          {CRICUT_SHOP_SPORTS.map((sport) => (
            <option key={sport.slug} value={sport.slug}>
              {sport.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Name on item</span>
        <input
          value={value.printName}
          maxLength={CRICUT_PRINT_NAME_MAX}
          onChange={(e) => onChange({ ...value, printName: e.target.value })}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="MORRIS"
        />
      </label>

      <div className="space-y-2">
        <p className="text-sm font-medium">Font</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {CRICUT_PRINT_FONTS.map((font) => {
            const selected = value.fontKey === font.key;
            return (
              <button
                key={font.key}
                type="button"
                onClick={() => onChange({ ...value, fontKey: font.key })}
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  selected
                    ? "border-[#1e56c8] bg-[#1e56c8]/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <span className="block text-xs text-muted-foreground">
                  {font.label} · {font.blurb}
                </span>
                <span
                  className="mt-1 block truncate text-xl leading-tight text-[#0A2342] dark:text-white"
                  style={{ fontFamily: cricutFontFamily(font.key) }}
                >
                  {previewName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-dashed border-border bg-[#0A2342] px-4 py-6 text-center text-white"
        aria-live="polite"
      >
        <p className="text-xs uppercase tracking-[0.16em] text-[#C9A227]">
          Live preview
        </p>
        <p
          className="mt-2 break-words text-4xl leading-none"
          style={{
            fontFamily: cricutFontFamily(value.fontKey || CRICUT_DEFAULT_PRINT_FONT),
          }}
        >
          {previewName}
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Different design (optional)</p>
        <p className="text-xs text-muted-foreground">
          Upload the image you want printed if the catalog photo isn’t it. JPG,
          PNG, WebP, GIF, or HEIC — up to {IMAGE_UPLOAD_MAX_LABEL}.
        </p>
        <input
          ref={designInputRef}
          id={`${idPrefix}-design`}
          name="customDesign"
          type="file"
          accept={CAMPUS_IMAGE_ACCEPT}
          className="sr-only"
          onChange={photoGuard.onFileChange}
        />
        {photoGuard.preview ? (
          <div className="relative overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoGuard.preview}
              alt="Custom design preview"
              className="aspect-square w-full max-w-56 object-cover"
            />
            <button
              type="button"
              onClick={photoGuard.clear}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
              aria-label="Remove custom design"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={photoGuard.preparing}
            onClick={() => openPhotoPicker(false)}
          >
            <Upload className="size-4" />
            {photoGuard.preview ? "Change design" : "Upload design"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={photoGuard.preparing}
            onClick={() => openPhotoPicker(true)}
          >
            <Camera className="size-4" />
            Take photo
          </Button>
        </div>
        <UploadGuardNotice guard={photoGuard} />
        {!storageConfigured ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Photo storage isn’t configured — you can still save sport, name, and
            font.
          </p>
        ) : null}
      </div>
    </fieldset>
  );
}
