/**
 * Student dietary and allergy records.
 *
 * Two-step by design: a parent (or the office) submits a `DietaryRequest`, and
 * the office accepts it. Accepting copies the contents onto the student's
 * `StudentDietaryProfile`, which is the canonical record the student profile and
 * the lunch ordering board read. Nothing the cafeteria relies on comes straight
 * off an unreviewed submission.
 *
 * Every read soft-fails to an empty result so pages still render when the
 * database is unreachable.
 */

import { isDatabaseConfigured } from "@/config/env";
import { withDatabase } from "@/lib/prisma";
import {
  DIETARY_NOTES_MAX_LENGTH,
  sanitizeAllergenIds,
  sanitizeRestrictionIds,
} from "@/config/dietary";

export type DietaryRequestStatus = "PENDING" | "ACCEPTED" | "DECLINED";

export type DietaryProfile = {
  studentId: string;
  allergens: string[];
  restrictions: string[];
  notes: string | null;
  appliedByName: string | null;
  appliedAt: string | null;
  updatedAt: string;
};

export type DietaryRequestView = {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  submittedById: string;
  submittedByName: string;
  status: DietaryRequestStatus;
  allergens: string[];
  restrictions: string[];
  notes: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  createdAt: string;
};

function displayNameFor(row: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const joined = [row.firstName, row.lastName].filter(Boolean).join(" ").trim();
  return row.displayName ?? (joined.length > 0 ? joined : row.email);
}

const USER_NAME_SELECT = {
  select: {
    id: true,
    displayName: true,
    firstName: true,
    lastName: true,
    email: true,
  },
} as const;

const REQUEST_SELECT = {
  id: true,
  studentId: true,
  submittedById: true,
  status: true,
  allergens: true,
  restrictions: true,
  notes: true,
  reviewedAt: true,
  reviewNote: true,
  createdAt: true,
  student: USER_NAME_SELECT,
  submittedBy: USER_NAME_SELECT,
  reviewedBy: USER_NAME_SELECT,
} as const;

type RequestRow = {
  id: string;
  studentId: string;
  submittedById: string;
  status: string;
  allergens: string[];
  restrictions: string[];
  notes: string | null;
  reviewedAt: Date | null;
  reviewNote: string | null;
  createdAt: Date;
  student: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  submittedBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  reviewedBy: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
};

function mapRequest(row: RequestRow): DietaryRequestView {
  return {
    id: row.id,
    studentId: row.studentId,
    studentName: displayNameFor(row.student),
    studentEmail: row.student.email,
    submittedById: row.submittedById,
    submittedByName: displayNameFor(row.submittedBy),
    status: row.status as DietaryRequestStatus,
    allergens: row.allergens,
    restrictions: row.restrictions,
    notes: row.notes,
    reviewedByName: row.reviewedBy ? displayNameFor(row.reviewedBy) : null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    reviewNote: row.reviewNote,
    createdAt: row.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Canonical profile reads
// ---------------------------------------------------------------------------

/** Accepted dietary records for several students, keyed by student id. */
export async function getDietaryProfiles(
  studentIds: readonly string[],
): Promise<Record<string, DietaryProfile>> {
  if (!isDatabaseConfigured() || studentIds.length === 0) {
    return {};
  }

  const rows = await withDatabase((prisma) =>
    prisma.studentDietaryProfile.findMany({
      where: { studentId: { in: [...studentIds] } },
      select: {
        studentId: true,
        allergens: true,
        restrictions: true,
        notes: true,
        appliedAt: true,
        updatedAt: true,
        appliedBy: USER_NAME_SELECT,
      },
    }),
  );

  const profiles: Record<string, DietaryProfile> = {};
  for (const row of rows ?? []) {
    profiles[row.studentId] = {
      studentId: row.studentId,
      allergens: row.allergens,
      restrictions: row.restrictions,
      notes: row.notes,
      appliedByName: row.appliedBy ? displayNameFor(row.appliedBy) : null,
      appliedAt: row.appliedAt?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  return profiles;
}

export async function getDietaryProfile(
  studentId: string,
): Promise<DietaryProfile | null> {
  const profiles = await getDietaryProfiles([studentId]);
  return profiles[studentId] ?? null;
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export async function listDietaryRequests(options?: {
  status?: DietaryRequestStatus;
  studentIds?: readonly string[];
}): Promise<DietaryRequestView[]> {
  if (!isDatabaseConfigured()) {
    return [];
  }

  const rows = await withDatabase((prisma) =>
    prisma.dietaryRequest.findMany({
      where: {
        ...(options?.status ? { status: options.status } : {}),
        ...(options?.studentIds
          ? { studentId: { in: [...options.studentIds] } }
          : {}),
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      select: REQUEST_SELECT,
    }),
  );

  return (rows ?? []).map((row) => mapRequest(row as RequestRow));
}

export async function listPendingDietaryRequests(): Promise<DietaryRequestView[]> {
  return listDietaryRequests({ status: "PENDING" });
}

export type SubmitDietaryRequestInput = {
  studentId: string;
  submittedById: string;
  allergens: readonly string[];
  restrictions: readonly string[];
  notes?: string | null;
};

export type DietaryMutationResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Records a new dietary form for a student. Any earlier pending request for the
 * same student is superseded so the office reviews one current ask per student
 * instead of a stack of drafts.
 */
export async function submitDietaryRequest(
  input: SubmitDietaryRequestInput,
): Promise<DietaryMutationResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Dietary forms are unavailable right now." };
  }

  const allergens = sanitizeAllergenIds(input.allergens);
  const restrictions = sanitizeRestrictionIds(input.restrictions);
  const notes = input.notes?.trim().slice(0, DIETARY_NOTES_MAX_LENGTH) || null;

  const result = await withDatabase((prisma) =>
    prisma.$transaction(async (tx) => {
      await tx.dietaryRequest.updateMany({
        where: { studentId: input.studentId, status: "PENDING" },
        data: {
          status: "DECLINED",
          reviewNote: "Superseded by a newer submission.",
          reviewedAt: new Date(),
        },
      });

      return tx.dietaryRequest.create({
        data: {
          studentId: input.studentId,
          submittedById: input.submittedById,
          allergens,
          restrictions,
          notes,
          status: "PENDING",
        },
        select: { id: true },
      });
    }),
  );

  if (!result) {
    return { ok: false, error: "Unable to submit the dietary form." };
  }

  return {
    ok: true,
    message: "Dietary form submitted. The school office will review it.",
  };
}

/**
 * Accepts one request and writes its contents onto the student's canonical
 * dietary profile in the same transaction, so a student is never left with an
 * accepted form that never reached their account.
 */
export async function acceptDietaryRequest(input: {
  requestId: string;
  reviewerId: string;
  reviewNote?: string | null;
}): Promise<DietaryMutationResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Dietary forms are unavailable right now." };
  }

  const reviewNote = input.reviewNote?.trim() || null;
  const now = new Date();

  const result = await withDatabase((prisma) =>
    prisma.$transaction(async (tx) => {
      const request = await tx.dietaryRequest.findUnique({
        where: { id: input.requestId },
        select: {
          id: true,
          studentId: true,
          status: true,
          allergens: true,
          restrictions: true,
          notes: true,
        },
      });

      if (!request || request.status !== "PENDING") {
        return { applied: false as const };
      }

      await tx.dietaryRequest.update({
        where: { id: request.id },
        data: {
          status: "ACCEPTED",
          reviewedById: input.reviewerId,
          reviewedAt: now,
          reviewNote,
        },
      });

      await tx.studentDietaryProfile.upsert({
        where: { studentId: request.studentId },
        create: {
          studentId: request.studentId,
          allergens: request.allergens,
          restrictions: request.restrictions,
          notes: request.notes,
          sourceRequestId: request.id,
          appliedById: input.reviewerId,
          appliedAt: now,
        },
        update: {
          allergens: request.allergens,
          restrictions: request.restrictions,
          notes: request.notes,
          sourceRequestId: request.id,
          appliedById: input.reviewerId,
          appliedAt: now,
        },
      });

      return { applied: true as const };
    }),
  );

  if (!result) {
    return { ok: false, error: "Unable to accept the dietary form." };
  }

  if (!result.applied) {
    return { ok: false, error: "That dietary form is no longer pending." };
  }

  return {
    ok: true,
    message: "Dietary form accepted and applied to the student account.",
  };
}

export async function declineDietaryRequest(input: {
  requestId: string;
  reviewerId: string;
  reviewNote?: string | null;
}): Promise<DietaryMutationResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Dietary forms are unavailable right now." };
  }

  const updated = await withDatabase((prisma) =>
    prisma.dietaryRequest.updateMany({
      where: { id: input.requestId, status: "PENDING" },
      data: {
        status: "DECLINED",
        reviewedById: input.reviewerId,
        reviewedAt: new Date(),
        reviewNote: input.reviewNote?.trim() || null,
      },
    }),
  );

  if (!updated || updated.count === 0) {
    return { ok: false, error: "That dietary form is no longer pending." };
  }

  return { ok: true, message: "Dietary form declined. No changes were applied." };
}

/**
 * Accepts every pending request in one pass, applying each to its student's
 * profile. Used by the office to clear a backlog after go-live.
 */
export async function acceptAllPendingDietaryRequests(
  reviewerId: string,
): Promise<{ accepted: number; failed: number }> {
  const pending = await listPendingDietaryRequests();

  let accepted = 0;
  let failed = 0;

  for (const request of pending) {
    const result = await acceptDietaryRequest({
      requestId: request.id,
      reviewerId,
      reviewNote: "Bulk accepted by the school office.",
    });
    if (result.ok) {
      accepted += 1;
    } else {
      failed += 1;
    }
  }

  return { accepted, failed };
}

/**
 * Direct office edit of a student's dietary record, bypassing the form flow
 * (a nurse correcting an allergy over the phone, for example).
 */
export async function applyDietaryProfile(input: {
  studentId: string;
  appliedById: string;
  allergens: readonly string[];
  restrictions: readonly string[];
  notes?: string | null;
}): Promise<DietaryMutationResult> {
  if (!isDatabaseConfigured()) {
    return { ok: false, error: "Dietary records are unavailable right now." };
  }

  const allergens = sanitizeAllergenIds(input.allergens);
  const restrictions = sanitizeRestrictionIds(input.restrictions);
  const notes = input.notes?.trim().slice(0, DIETARY_NOTES_MAX_LENGTH) || null;
  const now = new Date();

  const row = await withDatabase((prisma) =>
    prisma.studentDietaryProfile.upsert({
      where: { studentId: input.studentId },
      create: {
        studentId: input.studentId,
        allergens,
        restrictions,
        notes,
        appliedById: input.appliedById,
        appliedAt: now,
      },
      update: {
        allergens,
        restrictions,
        notes,
        sourceRequestId: null,
        appliedById: input.appliedById,
        appliedAt: now,
      },
      select: { id: true },
    }),
  );

  if (!row) {
    return { ok: false, error: "Unable to update the dietary record." };
  }

  return { ok: true, message: "Dietary record updated on the student account." };
}
