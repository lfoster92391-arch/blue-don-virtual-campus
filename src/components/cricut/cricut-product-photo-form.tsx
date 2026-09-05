"use client";

import { useActionState, useRef } from "react";
import { Camera, Upload } from "lucide-react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { CAMPUS_IMAGE_ACCEPT, IMAGE_UPLOAD_MAX_LABEL } from "@/config/uploads";
import {
  updateCricutListingPhotoAction,
  type CricutShopActionState,
} from "@/features/cricut-shop/actions";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";

const initialState: CricutShopActionState = {};

export function CricutProductPhotoForm({
  itemId,
  hasImage,
  storageConfigured,
}: {
  itemId: string;
  hasImage: boolean;
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateCricutListingPhotoAction,
    initialState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoGuard = useUploadGuard({ inputRef: fileInputRef });
  const busy = pending || photoGuard.preparing;
  const canSave = Boolean(photoGuard.preview) && !photoGuard.error && !busy;

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
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-dashed border-border p-4"
    >
      <input type="hidden" name="itemId" value={itemId} />
      <p className="text-sm font-medium">
        {hasImage ? "Replace product photo" : "Add a product photo"}
      </p>
      <p className="text-xs text-muted-foreground">
        Shoppers see this on the catalog card and product page. JPG, PNG, WebP,
        GIF, or HEIC — up to {IMAGE_UPLOAD_MAX_LABEL}. Phone photos are resized
        automatically.
      </p>

      <input
        ref={fileInputRef}
        id={`cricut-product-photo-${itemId}`}
        name="photo"
        type="file"
        accept={CAMPUS_IMAGE_ACCEPT}
        className="sr-only"
        onChange={photoGuard.onFileChange}
      />

      {photoGuard.preview ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoGuard.preview}
            alt="New product photo preview"
            className="aspect-square w-full max-w-56 object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy}
          onClick={() => openPhotoPicker(false)}
        >
          <Upload className="size-4" />
          {photoGuard.preview || hasImage ? "Choose photo" : "Upload photo"}
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
        <Button type="submit" disabled={!canSave}>
          {pending ? "Saving…" : "Save photo"}
        </Button>
      </div>
      <UploadGuardNotice guard={photoGuard} />
      {!storageConfigured ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Photo storage isn’t configured — ask an admin to set the campus media
          bucket.
        </p>
      ) : null}
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[#2E8B57]">{state.success}</p>
      ) : null}
    </form>
  );
}
