"use client";

import { useState, useTransition } from "react";

import { CampusCampaignForm } from "@/components/fundraisers/campus-campaign-form";
import { Button } from "@/components/ui/button";
import { deleteClubFundraiserAction } from "@/features/club-finance/actions";
import type { CampusCampaignFormValues } from "@/lib/club-finance";

export function CampusCampaignManageActions({
  campaign,
  storageConfigured,
  returnTo = "campus",
}: {
  campaign: CampusCampaignFormValues;
  storageConfigured: boolean;
  returnTo?: "finances" | "fundraisers" | "campus";
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (
      !window.confirm(
        `Delete “${campaign.title}”? This removes the whole campaign.`,
      )
    ) {
      return;
    }
    startTransition(() => {
      void deleteClubFundraiserAction(campaign.id, returnTo);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="min-h-10 w-full sm:w-auto"
          onClick={() => setEditing((open) => !open)}
        >
          {editing ? "Cancel edit" : "Edit"}
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="min-h-10 w-full sm:w-auto"
          disabled={pending}
          onClick={onDelete}
        >
          {pending ? "Deleting…" : "Delete"}
        </Button>
      </div>
      {editing ? (
        <CampusCampaignForm
          key={campaign.id}
          organizationId={campaign.organizationId}
          organizationSlug={campaign.organizationSlug}
          returnTo={returnTo}
          storageConfigured={storageConfigured}
          campaign={campaign}
        />
      ) : null}
    </div>
  );
}
