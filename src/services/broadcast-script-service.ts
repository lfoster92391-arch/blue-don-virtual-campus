/**
 * Broadcasting Show Script / Daily Rundown — shared team script for the day.
 */

import {
  DEFAULT_BROADCAST_SCRIPT_SLOTS,
  DEFAULT_SCHOOL_PRAYER,
  renderFullScript,
  type BroadcastDailyScriptView,
  type BroadcastScriptSlotDef,
  type BroadcastScriptSlotView,
} from "@/config/broadcast-script";
import { BROADCAST_ORG_SLUG } from "@/config/broadcast-media";
import { isDatabaseConfigured } from "@/config/env";
import { getLunchForWeekday } from "@/config/school-hub";
import { canManageAcademy, type CampusRole } from "@/config/roles";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import { canManageCampusMedia } from "@/services/media-service";

export type { BroadcastDailyScriptView, BroadcastScriptSlotView };

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function campusWeekday(date = new Date()): number {
  // Align with school-hub lunch menus (local weekday).
  return date.getDay();
}

function parseSlotDefs(raw: unknown): BroadcastScriptSlotDef[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_BROADCAST_SCRIPT_SLOTS;
  }

  const parsed: BroadcastScriptSlotDef[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const key = typeof row.key === "string" ? row.key : null;
    const label = typeof row.label === "string" ? row.label : null;
    const template = typeof row.template === "string" ? row.template : null;
    const order = typeof row.order === "number" ? row.order : parsed.length + 1;
    const required = Boolean(row.required);
    const slotType =
      row.slotType === "LOCKED_DAILY" ||
      row.slotType === "FIXED" ||
      row.slotType === "STUDENT_FILL"
        ? row.slotType
        : "STUDENT_FILL";
    if (!key || !label || !template) continue;
    parsed.push({
      key,
      label,
      template,
      order,
      required,
      slotType,
      placeholder:
        typeof row.placeholder === "string" ? row.placeholder : undefined,
    });
  }

  return parsed.length > 0
    ? parsed.sort((a, b) => a.order - b.order)
    : DEFAULT_BROADCAST_SCRIPT_SLOTS;
}

function parseValues(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "string") {
      out[key] = value;
    }
  }
  return out;
}

function defaultPrefillValues(): Record<string, string> {
  const lunch = getLunchForWeekday(campusWeekday());
  if (!lunch) return {};
  const sides = lunch.sides.length ? ` with ${lunch.sides.join(", ")}` : "";
  return {
    lunch: `${lunch.entree}${sides}`,
  };
}

function buildView(input: {
  id: string | null;
  organizationId: string;
  scriptDate: Date;
  prayerText: string | null;
  values: Record<string, string>;
  slots: BroadcastScriptSlotDef[];
  updatedAt: Date | null;
  updatedByName: string | null;
  isPersisted: boolean;
}): BroadcastDailyScriptView {
  const prayerText = input.prayerText?.trim() || DEFAULT_SCHOOL_PRAYER;
  const slotViews: BroadcastScriptSlotView[] = input.slots.map((slot) => ({
    ...slot,
    value:
      slot.slotType === "LOCKED_DAILY"
        ? prayerText
        : slot.slotType === "FIXED"
          ? slot.template
          : (input.values[slot.key] ?? ""),
  }));

  return {
    id: input.id,
    organizationId: input.organizationId,
    scriptDate: input.scriptDate,
    prayerText,
    slots: slotViews,
    fullScript: renderFullScript(slotViews, prayerText),
    updatedAt: input.updatedAt,
    updatedByName: input.updatedByName,
    isPersisted: input.isPersisted,
  };
}

export async function resolveBroadcastOrgId(
  organizationId?: string,
): Promise<string | null> {
  if (organizationId) return organizationId;
  if (!isDatabaseConfigured() || !isPrismaReady()) return null;

  const row = await withDatabase((prisma) =>
    prisma.organization.findUnique({
      where: { slug: BROADCAST_ORG_SLUG },
      select: { id: true },
    }),
  );
  return row?.id ?? null;
}

async function loadSlotDefs(
  organizationId: string,
): Promise<BroadcastScriptSlotDef[]> {
  const template = await withDatabase((prisma) =>
    prisma.broadcastScriptTemplate.findUnique({
      where: { organizationId },
      select: { slots: true },
    }),
  );
  return parseSlotDefs(template?.slots);
}

/**
 * Ensure the Broadcasting org has a seed template matching the default rundown.
 */
export async function ensureBroadcastScriptTemplate(
  organizationId: string,
): Promise<void> {
  if (!isDatabaseConfigured() || !isPrismaReady()) return;

  await withDatabase((prisma) =>
    prisma.broadcastScriptTemplate.upsert({
      where: { organizationId },
      create: {
        organizationId,
        slots: DEFAULT_BROADCAST_SCRIPT_SLOTS,
      },
      update: {},
    }),
  );
}

export async function getTodaysBroadcastScript(
  organizationId: string,
): Promise<BroadcastDailyScriptView | null> {
  try {
    if (!isDatabaseConfigured() || !isPrismaReady()) {
      const prefill = defaultPrefillValues();
      return buildView({
        id: null,
        organizationId,
        scriptDate: startOfUtcDay(),
        prayerText: DEFAULT_SCHOOL_PRAYER,
        values: prefill,
        slots: DEFAULT_BROADCAST_SCRIPT_SLOTS,
        updatedAt: null,
        updatedByName: null,
        isPersisted: false,
      });
    }

    await ensureBroadcastScriptTemplate(organizationId);
    const slots = await loadSlotDefs(organizationId);
    const today = startOfUtcDay();

    const row = await withDatabase((prisma) =>
      prisma.broadcastDailyScript.findUnique({
        where: {
          organizationId_scriptDate: {
            organizationId,
            scriptDate: today,
          },
        },
        select: {
          id: true,
          organizationId: true,
          scriptDate: true,
          prayerText: true,
          values: true,
          updatedAt: true,
          updatedBy: {
            select: {
              displayName: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
    );

    if (!row) {
      return buildView({
        id: null,
        organizationId,
        scriptDate: today,
        prayerText: DEFAULT_SCHOOL_PRAYER,
        values: defaultPrefillValues(),
        slots,
        updatedAt: null,
        updatedByName: null,
        isPersisted: false,
      });
    }

    const updatedByName =
      row.updatedBy?.displayName?.trim() ||
      [row.updatedBy?.firstName, row.updatedBy?.lastName]
        .filter(Boolean)
        .join(" ") ||
      null;

    return buildView({
      id: row.id,
      organizationId: row.organizationId,
      scriptDate: row.scriptDate,
      prayerText: row.prayerText,
      values: parseValues(row.values),
      slots,
      updatedAt: row.updatedAt,
      updatedByName,
      isPersisted: true,
    });
  } catch (error) {
    console.error("[broadcast-script] getTodaysBroadcastScript failed:", error);
    return null;
  }
}

export async function canEditBroadcastScriptValues(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  return canManageCampusMedia(userId, role);
}

export async function canEditBroadcastScriptPrayer(
  userId: string,
  role: CampusRole,
): Promise<boolean> {
  if (canManageAcademy(role)) {
    return true;
  }
  // Lead producers can also set prayer when advisors are unavailable.
  return canManageCampusMedia(userId, role);
}

export async function canEditBroadcastScriptTemplate(
  role: CampusRole,
): Promise<boolean> {
  return canManageAcademy(role);
}

export async function saveTodaysBroadcastScriptValues(input: {
  organizationId: string;
  userId: string;
  values: Record<string, string>;
  prayerText?: string;
}): Promise<BroadcastDailyScriptView | null> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return null;
  }

  await ensureBroadcastScriptTemplate(input.organizationId);
  const today = startOfUtcDay();
  const existing = await withDatabase((prisma) =>
    prisma.broadcastDailyScript.findUnique({
      where: {
        organizationId_scriptDate: {
          organizationId: input.organizationId,
          scriptDate: today,
        },
      },
      select: { values: true, prayerText: true },
    }),
  );

  const mergedValues = {
    ...defaultPrefillValues(),
    ...parseValues(existing?.values),
    ...input.values,
  };

  const prayerText =
    input.prayerText !== undefined
      ? input.prayerText.trim()
      : (existing?.prayerText ?? DEFAULT_SCHOOL_PRAYER);

  const row = await withDatabase((prisma) =>
    prisma.broadcastDailyScript.upsert({
      where: {
        organizationId_scriptDate: {
          organizationId: input.organizationId,
          scriptDate: today,
        },
      },
      create: {
        organizationId: input.organizationId,
        scriptDate: today,
        prayerText,
        values: mergedValues,
        updatedById: input.userId,
      },
      update: {
        values: mergedValues,
        ...(input.prayerText !== undefined ? { prayerText } : {}),
        updatedById: input.userId,
      },
      select: {
        id: true,
        organizationId: true,
        scriptDate: true,
        prayerText: true,
        values: true,
        updatedAt: true,
        updatedBy: {
          select: {
            displayName: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  );

  if (!row) return null;

  const slots = await loadSlotDefs(input.organizationId);
  const updatedByName =
    row.updatedBy?.displayName?.trim() ||
    [row.updatedBy?.firstName, row.updatedBy?.lastName]
      .filter(Boolean)
      .join(" ") ||
    null;

  return buildView({
    id: row.id,
    organizationId: row.organizationId,
    scriptDate: row.scriptDate,
    prayerText: row.prayerText,
    values: parseValues(row.values),
    slots,
    updatedAt: row.updatedAt,
    updatedByName,
    isPersisted: true,
  });
}

export async function saveBroadcastScriptTemplate(input: {
  organizationId: string;
  slots: BroadcastScriptSlotDef[];
}): Promise<boolean> {
  if (!isDatabaseConfigured() || !isPrismaReady()) {
    return false;
  }

  const sorted = [...input.slots].sort((a, b) => a.order - b.order);
  await withDatabase((prisma) =>
    prisma.broadcastScriptTemplate.upsert({
      where: { organizationId: input.organizationId },
      create: {
        organizationId: input.organizationId,
        slots: sorted,
      },
      update: { slots: sorted },
    }),
  );
  return true;
}
