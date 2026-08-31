"use client";

import { useActionState, useRef } from "react";
import { ImageIcon, X } from "lucide-react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { CAMPUS_IMAGE_ACCEPT } from "@/config/uploads";
import {
  submitCricutDesignAction,
  type CricutShopActionState,
} from "@/features/cricut-shop/actions";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";

const initialState: CricutShopActionState = {};

export function CricutDesignSubmitForm({
  storageConfigured,
}: {
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    submitCricutDesignAction,
    initialState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoGuard = useUploadGuard({ inputRef: fileInputRef });

  return (
    <form action={formAction} className="space-y-4">
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Spirit banner for pep rally"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">What should we make?</span>
        <textarea
          name="description"
          required
          rows={4}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Describe materials, size, colors, and how it will be used…"
        />
      </label>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="relative flex aspect-video w-full items-center justify-center bg-gradient-to-br from-[#DB2777]/10 to-[#0A2342]/5">
          {photoGuard.preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoGuard.preview}
                alt="Reference preview"
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
              <ImageIcon className="size-10 opacity-40" />
              <span className="text-sm">Reference image (optional)</span>
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        name="photo"
        type="file"
        accept={CAMPUS_IMAGE_ACCEPT}
        className="text-sm"
        onChange={photoGuard.onFileChange}
      />
      <UploadGuardNotice guard={photoGuard} />
      {!storageConfigured ? (
        <p className="text-xs text-muted-foreground">
          Image upload isn’t configured — text-only ideas are fine.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit design idea"}
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
