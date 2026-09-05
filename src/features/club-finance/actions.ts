"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import {
  CAMPUS_CAMPAIGN_KINDS,
  isCampusCampaignKind,
} from "@/lib/club-finance";
import { redirectToClubTab, rethrowIfRedirect } from "@/lib/club-tab-path";
import { parseCampusFormDateTime } from "@/lib/datetime/campus-local";
import type { ClubFundraiserStatus, ClubLedgerEntryType } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import {
  addClubLedgerEntry,
  canManageClubFinances,
  canPostCampusCampaign,
  createClubFundraiser,
  deleteClubFundraiser,
  getClubFundraiserRecord,
  isClubFundraiserStorageConfigured,
  updateClubFundraiser,
  updateClubFundraiserStatus,
  uploadClubFundraiserFlyer,
} from "@/services/club-finance-service";

export type ClubFinanceActionState = {
  error?: string;
  success?: string;
};

const moneySchema = z.object({
  organizationId: z.string().min(1),
  organizationSlug: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  memo: z.string().trim().max(240).optional(),
  fundraiserId: z.string().optional(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  occurredOn: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the transaction date as YYYY-MM-DD")
    .optional(),
});

/**
 * `YYYY-MM-DD` from a date input is midday local time, not midnight UTC, so
 * an entry cannot slip into the previous month for negative-offset campuses.
 */
function parseOccurredOn(value: string | undefined): Date | undefined {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year, month - 1, day, 12, 0, 0, 0);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

const fundraiserSchema = z.object({
  organizationId: z.string().min(1),
  organizationSlug: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(120),
  description: z.string().trim().max(2000).optional(),
  goalAmount: z.coerce.number().min(0, "Goal cannot be negative").optional(),
  kind: z.enum(CAMPUS_CAMPAIGN_KINDS).optional(),
  linkUrl: z.string().trim().max(500).optional(),
  pricesText: z.string().trim().max(500).optional(),
  orderOpensAt: z.string().optional(),
  orderClosesAt: z.string().optional(),
  arrivesOn: z.string().optional(),
  pickupLocation: z.string().trim().max(200).optional(),
  contactName: z.string().trim().max(120).optional(),
  contactEmail: z.string().trim().max(200).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  raisingFor: z.string().trim().max(240).optional(),
  isPublic: z.boolean().optional(),
  returnTo: z.enum(["finances", "fundraisers", "campus"]).optional(),
});

function parseDateTimeLocal(value: string | undefined): Date | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return parseCampusFormDateTime(trimmed) ?? undefined;
}

function parseOptionalCampusDate(value: string | undefined): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return parseCampusFormDateTime(trimmed);
}

function normalizeLinkUrl(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Link must start with http:// or https://");
  }
  return trimmed;
}

function revalidateFinancePaths(slug: string) {
  revalidatePath(`/organizations/${slug}`);
  revalidatePath("/finances");
  revalidatePath("/fundraisers");
  revalidatePath("/guest/fundraisers");
  revalidatePath("/home");
  revalidatePath("/guest");
  revalidatePath("/parent");
  revalidatePath("/madonna");
  revalidatePath("/calendar");
}

async function requireFinanceManager(organizationId: string) {
  const user = await requireCompleteProfile();
  const allowed = await canManageClubFinances(user.id, user.role, organizationId);
  if (!allowed) {
    throw new Error("You do not have permission to manage club finances.");
  }
  return user;
}

async function requireCampaignPoster(organizationId: string) {
  const user = await requireCompleteProfile();
  const allowed = await canPostCampusCampaign(user.id, user.role, organizationId);
  if (!allowed) {
    throw new Error("You do not have permission to post a campus campaign.");
  }
  return user;
}

export async function addClubLedgerEntryAction(
  _prev: ClubFinanceActionState,
  formData: FormData,
): Promise<ClubFinanceActionState> {
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  try {
    const parsed = moneySchema.safeParse({
      organizationId: formData.get("organizationId"),
      organizationSlug,
      amount: formData.get("amount"),
      memo: formData.get("memo") || undefined,
      fundraiserId: formData.get("fundraiserId") || undefined,
      type: formData.get("type"),
      occurredOn: formData.get("occurredOn") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid ledger entry." };
    }

    const user = await requireFinanceManager(parsed.data.organizationId);
    const amountCents = Math.round(parsed.data.amount * 100);
    const id = await addClubLedgerEntry({
      organizationId: parsed.data.organizationId,
      type: parsed.data.type as ClubLedgerEntryType,
      amountCents,
      memo: parsed.data.memo,
      fundraiserId: parsed.data.fundraiserId,
      createdById: user.id,
      occurredAt: parseOccurredOn(parsed.data.occurredOn),
    });

    if (!id) {
      return { error: "Unable to save ledger entry." };
    }

    revalidateFinancePaths(parsed.data.organizationSlug);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to save ledger entry.",
    };
  }

  redirectToClubTab(organizationSlug, "finances");
}

export async function createClubFundraiserAction(
  _prev: ClubFinanceActionState,
  formData: FormData,
): Promise<ClubFinanceActionState> {
  const organizationSlug = String(formData.get("organizationSlug") ?? "");
  try {
    const parsed = fundraiserSchema.safeParse({
      organizationId: formData.get("organizationId"),
      organizationSlug,
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      goalAmount: formData.get("goalAmount") || undefined,
      kind: formData.get("kind") || undefined,
      linkUrl: formData.get("linkUrl") || undefined,
      pricesText: formData.get("pricesText") || undefined,
      orderOpensAt: formData.get("orderOpensAt") || undefined,
      orderClosesAt: formData.get("orderClosesAt") || undefined,
      arrivesOn: formData.get("arrivesOn") || undefined,
      pickupLocation: formData.get("pickupLocation") || undefined,
      contactName: formData.get("contactName") || undefined,
      contactEmail: formData.get("contactEmail") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
      raisingFor: formData.get("raisingFor") || undefined,
      isPublic: formData.get("isPublic") === "on",
      returnTo: formData.get("returnTo") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid fundraiser." };
    }

    const user = await requireCampaignPoster(parsed.data.organizationId);
    const kind = parsed.data.kind && isCampusCampaignKind(parsed.data.kind)
      ? parsed.data.kind
      : undefined;

    let flyerUrl: string | undefined;
    let flyerStoragePath: string | undefined;
    const flyer = formData.get("flyer");
    if (flyer instanceof File && flyer.size > 0) {
      if (!isClubFundraiserStorageConfigured()) {
        return {
          error:
            "Photo storage isn’t configured. Ask an admin to set the campus media bucket, or post without a flyer.",
        };
      }
      const uploaded = await uploadClubFundraiserFlyer(flyer, user.id);
      flyerUrl = uploaded.publicUrl;
      flyerStoragePath = uploaded.storagePath;
    }

    const goalAmount = parsed.data.goalAmount ?? 0;
    const id = await createClubFundraiser({
      organizationId: parsed.data.organizationId,
      title: parsed.data.title,
      description: parsed.data.description,
      goalCents: Math.round(goalAmount * 100),
      kind,
      flyerUrl,
      flyerStoragePath,
      linkUrl: normalizeLinkUrl(parsed.data.linkUrl),
      pricesText: parsed.data.pricesText,
      startsAt: parseDateTimeLocal(parsed.data.orderOpensAt),
      endsAt: parseDateTimeLocal(parsed.data.orderClosesAt),
      arrivesAt: parseDateTimeLocal(parsed.data.arrivesOn),
      pickupLocation: parsed.data.pickupLocation,
      contactName: parsed.data.contactName,
      contactEmail: parsed.data.contactEmail,
      contactPhone: parsed.data.contactPhone,
      raisingFor: parsed.data.raisingFor,
      isPublic: parsed.data.isPublic ?? true,
      createdById: user.id,
    });

    if (!id) {
      return { error: "Unable to create fundraiser." };
    }

    revalidateFinancePaths(parsed.data.organizationSlug);
    revalidatePath(`/fundraisers/${id}`);

    const returnTo = parsed.data.returnTo ?? "finances";
    if (returnTo === "campus") {
      redirect(`/fundraisers/${id}`);
    }
    if (returnTo === "fundraisers") {
      redirectToClubTab(organizationSlug, "fundraisers");
    }
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to create fundraiser.",
    };
  }

  redirectToClubTab(organizationSlug, "finances");
}

export async function updateClubFundraiserAction(
  _prev: ClubFinanceActionState,
  formData: FormData,
): Promise<ClubFinanceActionState> {
  try {
    const parsed = fundraiserSchema.extend({
      fundraiserId: z.string().min(1),
    }).safeParse({
      fundraiserId: formData.get("fundraiserId"),
      organizationId: formData.get("organizationId"),
      organizationSlug: formData.get("organizationSlug"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      goalAmount: formData.get("goalAmount") || undefined,
      kind: formData.get("kind") || undefined,
      linkUrl: formData.get("linkUrl") || undefined,
      pricesText: formData.get("pricesText") || undefined,
      orderOpensAt: formData.get("orderOpensAt") || undefined,
      orderClosesAt: formData.get("orderClosesAt") || undefined,
      arrivesOn: formData.get("arrivesOn") || undefined,
      pickupLocation: formData.get("pickupLocation") || undefined,
      contactName: formData.get("contactName") || undefined,
      contactEmail: formData.get("contactEmail") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
      raisingFor: formData.get("raisingFor") || undefined,
      isPublic: formData.get("isPublic") === "on",
      returnTo: formData.get("returnTo") || undefined,
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid fundraiser." };
    }

    const existing = await getClubFundraiserRecord(parsed.data.fundraiserId);
    if (!existing) {
      return { error: "That campaign is gone." };
    }

    const user = await requireCampaignPoster(existing.organizationId);
    const kind = parsed.data.kind && isCampusCampaignKind(parsed.data.kind)
      ? parsed.data.kind
      : undefined;

    let flyer:
      | { url: string | null; storagePath: string | null }
      | undefined;
    const flyerFile = formData.get("flyer");
    if (flyerFile instanceof File && flyerFile.size > 0) {
      if (!isClubFundraiserStorageConfigured()) {
        return {
          error:
            "Photo storage isn’t configured. Ask an admin to set the campus media bucket, or keep the current flyer.",
        };
      }
      const uploaded = await uploadClubFundraiserFlyer(flyerFile, user.id);
      flyer = { url: uploaded.publicUrl, storagePath: uploaded.storagePath };
    } else if (formData.get("clearFlyer") === "1") {
      flyer = { url: null, storagePath: null };
    }

    const goalAmount = parsed.data.goalAmount ?? 0;
    const ok = await updateClubFundraiser({
      fundraiserId: existing.id,
      organizationId: existing.organizationId,
      title: parsed.data.title,
      description: parsed.data.description,
      goalCents: Math.round(goalAmount * 100),
      kind,
      flyer,
      linkUrl: parsed.data.linkUrl
        ? normalizeLinkUrl(parsed.data.linkUrl)
        : null,
      pricesText: parsed.data.pricesText ?? null,
      startsAt: parseOptionalCampusDate(parsed.data.orderOpensAt),
      endsAt: parseOptionalCampusDate(parsed.data.orderClosesAt),
      arrivesAt: parseOptionalCampusDate(parsed.data.arrivesOn),
      pickupLocation: parsed.data.pickupLocation ?? null,
      contactName: parsed.data.contactName ?? null,
      contactEmail: parsed.data.contactEmail ?? null,
      contactPhone: parsed.data.contactPhone ?? null,
      raisingFor: parsed.data.raisingFor ?? null,
      isPublic: parsed.data.isPublic ?? true,
    });

    if (!ok) {
      return { error: "Unable to update this campaign." };
    }

    revalidateFinancePaths(existing.organizationSlug);
    revalidatePath(`/fundraisers/${existing.id}`);
    return { success: "Campaign updated." };
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to update campaign.",
    };
  }
}

export async function deleteClubFundraiserAction(
  fundraiserId: string,
  returnTo: "finances" | "fundraisers" | "campus" = "campus",
): Promise<ClubFinanceActionState> {
  let organizationSlug = "";
  try {
    const existing = await getClubFundraiserRecord(fundraiserId);
    if (!existing) {
      return { error: "That campaign is already gone." };
    }

    await requireCampaignPoster(existing.organizationId);
    organizationSlug = existing.organizationSlug;

    const ok = await deleteClubFundraiser({
      fundraiserId: existing.id,
      organizationId: existing.organizationId,
    });

    if (!ok) {
      return { error: "Unable to delete this campaign." };
    }

    revalidateFinancePaths(existing.organizationSlug);
    revalidatePath(`/fundraisers/${existing.id}`);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to delete campaign.",
    };
  }

  if (returnTo === "finances") {
    redirectToClubTab(organizationSlug, "finances");
  }
  if (returnTo === "fundraisers") {
    redirectToClubTab(organizationSlug, "fundraisers");
  }
  redirect("/fundraisers");
}

export async function updateClubFundraiserStatusAction(
  organizationId: string,
  organizationSlug: string,
  fundraiserId: string,
  status: ClubFundraiserStatus,
): Promise<ClubFinanceActionState> {
  try {
    const user = await requireCompleteProfile();
    const allowed =
      (await canManageClubFinances(user.id, user.role, organizationId)) ||
      (await canPostCampusCampaign(user.id, user.role, organizationId));
    if (!allowed) {
      throw new Error("You do not have permission to update this fundraiser.");
    }
    const ok = await updateClubFundraiserStatus({
      fundraiserId,
      organizationId,
      status,
    });

    if (!ok) {
      return { error: "Unable to update fundraiser." };
    }

    revalidateFinancePaths(organizationSlug);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to update fundraiser.",
    };
  }

  redirectToClubTab(organizationSlug, "finances");
}
