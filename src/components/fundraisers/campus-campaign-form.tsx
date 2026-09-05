"use client";

import { useActionState, useRef, useState } from "react";
import { Camera, ImageIcon, Upload, X } from "lucide-react";

import { UploadGuardNotice } from "@/components/uploads/upload-guard-notice";
import { Button } from "@/components/ui/button";
import { CAMPUS_IMAGE_ACCEPT, IMAGE_UPLOAD_MAX_LABEL } from "@/config/uploads";
import {
  createClubFundraiserAction,
  updateClubFundraiserAction,
  type ClubFinanceActionState,
} from "@/features/club-finance/actions";
import {
  CAMPUS_CAMPAIGN_KIND_LABELS,
  CAMPUS_CAMPAIGN_KINDS,
  defaultCampaignKind,
  type CampusCampaignFormValues,
  type CampusCampaignKind,
} from "@/lib/club-finance";
import {
  campusDateKey,
  utcToCampusDateTimeLocal,
} from "@/lib/datetime/campus-local";
import { useUploadGuard } from "@/lib/uploads/use-upload-guard";

const initialState: ClubFinanceActionState = {};

export type CampaignHostOption = {
  id: string;
  slug: string;
  name: string;
  type: string;
};

function toDateTimeLocalValue(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return utcToCampusDateTimeLocal(date);
}

function toDateInputValue(value: Date | string | null | undefined): string {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return campusDateKey(date);
}

export function CampusCampaignForm({
  organizationId,
  organizationSlug,
  organizationType,
  hosts,
  returnTo = "finances",
  storageConfigured,
  campaign,
}: {
  organizationId?: string;
  organizationSlug?: string;
  organizationType?: string;
  hosts?: CampaignHostOption[];
  returnTo?: "finances" | "fundraisers" | "campus";
  storageConfigured: boolean;
  campaign?: CampusCampaignFormValues;
}) {
  const editing = Boolean(campaign);
  const [state, formAction, pending] = useActionState(
    editing ? updateClubFundraiserAction : createClubFundraiserAction,
    initialState,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const flyerGuard = useUploadGuard({ inputRef: fileInputRef });
  const [removeExistingFlyer, setRemoveExistingFlyer] = useState(false);
  const busy = pending || flyerGuard.preparing;
  const defaultKind: CampusCampaignKind =
    campaign?.kind ??
    defaultCampaignKind(organizationType ?? hosts?.[0]?.type ?? "CLUB");
  const pickHost = Boolean(hosts && hosts.length > 0 && !organizationId && !editing);
  const existingFlyer =
    campaign?.flyerUrl && !removeExistingFlyer ? campaign.flyerUrl : null;
  const shownFlyer = flyerGuard.preview ?? existingFlyer;

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

  function clearFlyerPreview() {
    flyerGuard.clear();
    if (campaign?.flyerUrl) {
      setRemoveExistingFlyer(true);
    }
  }

  return (
    <form action={formAction} className="grid gap-3 sm:grid-cols-2">
      {campaign ? (
        <input type="hidden" name="fundraiserId" value={campaign.id} />
      ) : null}
      {organizationId ? (
        <input type="hidden" name="organizationId" value={organizationId} />
      ) : null}
      {organizationSlug ? (
        <input type="hidden" name="organizationSlug" value={organizationSlug} />
      ) : null}
      <input type="hidden" name="returnTo" value={returnTo} />
      {removeExistingFlyer && !flyerGuard.preview ? (
        <input type="hidden" name="clearFlyer" value="1" />
      ) : null}

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
          defaultValue={campaign?.title}
        />
      </label>

      <div className="grid gap-2 sm:col-span-2">
        <span className="text-sm font-medium">Flyer</span>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="relative flex aspect-[16/9] w-full items-center justify-center bg-muted/40">
            {shownFlyer ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shownFlyer}
                  alt="Flyer preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={clearFlyerPreview}
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
          onChange={(event) => {
            setRemoveExistingFlyer(false);
            flyerGuard.onFileChange(event);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={busy}
            onClick={() => openPhotoPicker(false)}
          >
            <Upload className="size-4" />
            {shownFlyer ? "Change flyer" : "Upload from library"}
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
          defaultValue={campaign?.description ?? undefined}
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">What this raises money for</span>
        <input
          name="raisingFor"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="State tournament travel, classroom supplies, …"
          defaultValue={campaign?.raisingFor ?? undefined}
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Prices</span>
        <input
          name="pricesText"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="$12 cookie tub · $20 T-shirt"
          defaultValue={campaign?.pricesText ?? undefined}
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Order / info link</span>
        <input
          name="linkUrl"
          type="url"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="https://"
          defaultValue={campaign?.linkUrl ?? undefined}
        />
      </label>

      <label className="grid gap-1 text-sm">
        <span className="font-medium">Ordering opens</span>
        <input
          name="orderOpensAt"
          type="datetime-local"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={toDateTimeLocalValue(campaign?.startsAt)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Ordering closes</span>
        <input
          name="orderClosesAt"
          type="datetime-local"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={toDateTimeLocalValue(campaign?.endsAt)}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">When the order arrives</span>
        <input
          name="arrivesOn"
          type="date"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={toDateInputValue(campaign?.arrivesAt)}
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
          defaultValue={
            campaign && campaign.goalCents > 0
              ? (campaign.goalCents / 100).toFixed(2)
              : undefined
          }
        />
      </label>

      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Pickup location</span>
        <input
          name="pickupLocation"
          className="rounded-md border border-border bg-background px-3 py-2"
          placeholder="Main office, after school"
          defaultValue={campaign?.pickupLocation ?? undefined}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Contact name</span>
        <input
          name="contactName"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={campaign?.contactName ?? undefined}
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-medium">Contact email</span>
        <input
          name="contactEmail"
          type="email"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={campaign?.contactEmail ?? undefined}
        />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-medium">Contact phone</span>
        <input
          name="contactPhone"
          type="tel"
          className="rounded-md border border-border bg-background px-3 py-2"
          defaultValue={campaign?.contactPhone ?? undefined}
        />
      </label>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 sm:col-span-2">
        <input
          type="checkbox"
          name="isPublic"
          value="on"
          defaultChecked={campaign ? campaign.isPublic : true}
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
          {busy
            ? editing
              ? "Saving…"
              : "Posting…"
            : editing
              ? "Save campaign"
              : "Post to campus"}
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
