"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireCompleteProfile } from "@/lib/auth/session";
import { redirectToClubTab, rethrowIfRedirect } from "@/lib/club-tab-path";
import type { ClubFundraiserStatus, ClubLedgerEntryType } from "@/generated/prisma/client";
import {
  addClubLedgerEntry,
  canManageClubFinances,
  createClubFundraiser,
  updateClubFundraiserStatus,
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
  description: z.string().trim().max(500).optional(),
  goalAmount: z.coerce.number().positive("Goal must be greater than zero"),
});

function revalidateFinancePaths(slug: string) {
  revalidatePath(`/organizations/${slug}`);
  revalidatePath("/finances");
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
      goalAmount: formData.get("goalAmount"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid fundraiser." };
    }

    const user = await requireFinanceManager(parsed.data.organizationId);
    const id = await createClubFundraiser({
      organizationId: parsed.data.organizationId,
      title: parsed.data.title,
      description: parsed.data.description,
      goalCents: Math.round(parsed.data.goalAmount * 100),
      createdById: user.id,
    });

    if (!id) {
      return { error: "Unable to create fundraiser." };
    }

    revalidateFinancePaths(parsed.data.organizationSlug);
  } catch (error) {
    rethrowIfRedirect(error);
    return {
      error: error instanceof Error ? error.message : "Unable to create fundraiser.",
    };
  }

  redirectToClubTab(organizationSlug, "finances");
}

export async function updateClubFundraiserStatusAction(
  organizationId: string,
  organizationSlug: string,
  fundraiserId: string,
  status: ClubFundraiserStatus,
): Promise<ClubFinanceActionState> {
  try {
    await requireFinanceManager(organizationId);
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
