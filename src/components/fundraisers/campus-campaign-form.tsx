"use client";

import { useActionState, useRef } from "react";
import { Camera, ImageIcon, Upload, X } from "lucide-react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { CAMPUS_IMAGE_ACCEPT, IMAGE_UPLOAD_MAX_LABEL } from "@/config/uploads";
import {
  createClubFundraiserAction,
  type ClubFinanceActionState,
} from "@/features/club-finance/actions";
import {
  CAMPUS_CAMPAIGN_KIND_LABELS,
  CAMPUS_CAMPAIGN_KINDS,
  defaultCampaignKind,
  type CampusCampaignKind,
} from "@/lib/club-finance";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";

const initialState: ClubFinanceActionState = {};

export type CampaignHostOption = {
  id: string;
  slug: string;
  name: string;
  type: string;
};

export function CampusCampaignForm({
  organizationId,
  organizationSlug,
  organizationType,
  hosts,
  returnTo = "finances",
  storageConfigured,
}: {
  organizationId?: string;
  organizationSlug?: string;
  organizationType?: string;
  hosts?: CampaignHostOption[];
  returnTo?: "finances" | "fundraisers" | "campus";
  storageConfigured: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    createClubFundraiserAction,
    initialState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flyerGuard = useUploadGuard({ inputRef: fileInputRef });
  const busy = pending || flyerGuard.preparing;
  const defaultKind: CampusCampaignKind = defaultCampaignKind(
    organizationType ?? hosts?.[0]?.type ?? "CLUB",
  );
  const pickHost = Boolean(hosts && hosts.length > 0 && !organizationId);

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
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {organizationId ? (
        <input type="hidden" name="organizationId" value={organizationId} />
      ) : null}
      {organizationSlug ? (
        <input type="hidden" name="organizationSlug" value={organizationSlug} />
      ) : null}
      <input type="hidden" name="returnTo" value={returnTo} />

      {pickHost ? (
        <label className="grid gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Host club, class, or team</span>
          <select
            name="organizationId"
            required
            className="rounded-md border border-border bg-background px-3 py-2"
            defaultValue={hosts?.[0]?.id ?? ""}
            onChange={(event) => {
              const host = hosts?.find((item) => item.id === event.target.value);
              const slugInput = event.currentTarget.form?.elements.namedItem(
                "organizationSlug",
              );
              if (slugInput instanceof HTMLInputElement) {
                slugInput.value = host?.slug ?? "";
              }
            }}
          >
            {hosts?.map((host) => (
              <option key={host.id} value={host.id}>
                {host.name}
              </option>
            ))}
          </select>
          <input
            type="hidden"
            name="organizationSlug"
            defaultValue={hosts?.[0]?.slug ?? ""}
          />
        </label>
      ) : null}

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Type</span>
        <select
          name="kind"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={defaultKind}
        >
          {CAMPUS_CAMPAIGN_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {CAMPUS_CAMPAIGN_KIND_LABELS[kind]}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Title</span>
        <input
          name="title"
          required
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Cookie dough sale"
        />
      </label>

      <div className="grid gap-2 sm:col-span-2">
        <span className="text-sm font-medium">Flyer</span>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-muted/40">
            {flyerGuard.preview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flyerGuard.preview}
                  alt="Flyer preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={flyerGuard.clear}
                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                  aria-label="Remove flyer"
                >
                  <X className="size-4" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="size-10 opacity-40" />
                <span className="text-sm">Add a flyer photo</span>
              </div>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          name="flyer"
          type="file"
          accept={CAMPUS_IMAGE_ACCEPT}
          className="sr-only"
          onChange={flyerGuard.onFileChange}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() => openPhotoPicker(false)}
          >
            <Upload className="size-4" />
            {flyerGuard.preview ? "Change flyer" : "Upload from library"}
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
        <UploadGuardNotice guard={flyerGuard} />
        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP, GIF, or HEIC — up to {IMAGE_UPLOAD_MAX_LABEL}. Phone
          photos are resized automatically.
          {!storageConfigured
            ? " Photo storage isn’t configured — you can still post without a flyer."
            : ""}
        </p>
      </div>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Information</span>
        <textarea
          name="description"
          rows={3}
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="What families should know"
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">What this raises money for</span>
        <input
          name="raisingFor"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="State tournament travel, classroom supplies, …"
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Prices</span>
        <input
          name="pricesText"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="$12 cookie tub · $20 T-shirt"
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Order / info link</span>
        <input
          name="linkUrl"
          type="url"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="https://"
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Ordering opens</span>
        <input
          name="orderOpensAt"
          type="datetime-local"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Ordering closes</span>
        <input
          name="orderClosesAt"
          type="datetime-local"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">When the order arrives</span>
        <input
          name="arrivesOn"
          type="date"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Goal (USD, optional)</span>
        <input
          name="goalAmount"
          type="number"
          min="0"
          step="0.01"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="500"
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Pickup location</span>
        <input
          name="pickupLocation"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Main office, after school"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Contact name</span>
        <input
          name="contactName"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Contact email</span>
        <input
          name="contactEmail"
          type="email"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Contact phone</span>
        <input
          name="contactPhone"
          type="tel"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 sm:col-span-2">
        <input
          type="checkbox"
          name="isPublic"
          value="on"
          defaultChecked
          className="mt-1"
        />
        <span>
          <span className="block text-sm font-medium">
            Show on school home and Fan & Family
          </span>
          <span className="block text-xs text-muted-foreground">
            On by default. Uncheck only if this should stay inside the club.
          </span>
        </span>
      </label>

      <div className="sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? "Posting…" : "Post to campus"}
        </Button>
        {state.error ? (
          <p className="mt-2 text-sm text-destructive">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="mt-2 text-sm text-[#2E8B57]">{state.success}</p>
        ) : null}
      </div>
    </form>
  );
}
