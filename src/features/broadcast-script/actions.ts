"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  DEFAULT_BROADCAST_SCRIPT_SLOTS,
  type BroadcastScriptSlotDef,
  type BroadcastSlotType,
} from "@/config/broadcast-script";
import { requireCompleteProfile } from "@/lib/auth/session";
import {
  canEditBroadcastScriptPrayer,
  canEditBroadcastScriptTemplate,
  canEditBroadcastScriptValues,
  saveBroadcastScriptTemplate,
  saveTodaysBroadcastScriptValues,
} from "@/services/broadcast-script-service";

export type BroadcastScriptActionState = {
  error?: string;
  success?: string;
};

function revalidateScriptPaths() {
  revalidatePath("/organizations/broadcasting");
  revalidatePath("/media");
}

const valuesSchema = z.record(z.string(), z.string());

export async function saveDailyRundownAction(
  _prev: BroadcastScriptActionState,
  formData: FormData,
): Promise<BroadcastScriptActionState> {
  try {
    const user = await requireCompleteProfile();
    const organizationId = String(formData.get("organizationId") ?? "");
    if (!organizationId) {
      return { error: "Missing Broadcasting organization." };
    }

    const canEditValues = await canEditBroadcastScriptValues(
      user.id,
      user.role,
    );
    const canEditPrayer = await canEditBroadcastScriptPrayer(
      user.id,
      user.role,
    );

    if (!canEditValues && !canEditPrayer) {
      return {
        error:
          "Only Broadcasting producers and advisors can update the show script.",
      };
    }

    const values: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("slot_")) continue;
      values[key.slice(5)] = String(value);
    }

    const prayerRaw = formData.get("prayerText");
    const prayerText =
      canEditPrayer && typeof prayerRaw === "string"
        ? prayerRaw
        : undefined;

    if (!canEditValues && prayerText === undefined) {
      return { error: "Nothing to save." };
    }

    const parsedValues = valuesSchema.safeParse(canEditValues ? values : {});
    if (!parsedValues.success) {
      return { error: "Invalid script values." };
    }

    const saved = await saveTodaysBroadcastScriptValues({
      organizationId,
      userId: user.id,
      values: canEditValues ? parsedValues.data : {},
      prayerText,
    });

    if (!saved) {
      return {
        error:
          "Unable to save today’s rundown. Check database connectivity.",
      };
    }

    revalidateScriptPaths();
    return { success: "Show script saved for the crew." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save the show script.",
    };
  }
}

const slotTypeSchema = z.enum(["STUDENT_FILL", "LOCKED_DAILY", "FIXED"]);

export async function resetBroadcastScriptTemplateAction(
  organizationId: string,
): Promise<BroadcastScriptActionState> {
  try {
    const user = await requireCompleteProfile();
    const allowed = await canEditBroadcastScriptTemplate(user.role);
    if (!allowed) {
      return { error: "Only advisors and admins can reset the rundown template." };
    }

    const ok = await saveBroadcastScriptTemplate({
      organizationId,
      slots: DEFAULT_BROADCAST_SCRIPT_SLOTS,
    });
    if (!ok) {
      return { error: "Unable to reset template. Check database connectivity." };
    }

    revalidateScriptPaths();
    return { success: "Rundown template restored to the studio default." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to reset the rundown template.",
    };
  }
}

/** Advisor: replace slot structure from a JSON string (advanced). */
export async function saveBroadcastScriptTemplateAction(
  _prev: BroadcastScriptActionState,
  formData: FormData,
): Promise<BroadcastScriptActionState> {
  try {
    const user = await requireCompleteProfile();
    const allowed = await canEditBroadcastScriptTemplate(user.role);
    if (!allowed) {
      return {
        error: "Only advisors and admins can edit the rundown template.",
      };
    }

    const organizationId = String(formData.get("organizationId") ?? "");
    const slotsJson = String(formData.get("slotsJson") ?? "");
    if (!organizationId || !slotsJson.trim()) {
      return { error: "Organization and slots JSON are required." };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(slotsJson);
    } catch {
      return { error: "Slots must be valid JSON." };
    }

    if (!Array.isArray(raw)) {
      return { error: "Slots JSON must be an array." };
    }

    const slots: BroadcastScriptSlotDef[] = [];
    for (const [index, item] of raw.entries()) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      const key = typeof row.key === "string" ? row.key.trim() : "";
      const label = typeof row.label === "string" ? row.label.trim() : "";
      const template =
        typeof row.template === "string" ? row.template.trim() : "";
      if (!key || !label || !template) {
        return {
          error: `Slot ${index + 1} needs key, label, and template.`,
        };
      }
      const slotTypeParsed = slotTypeSchema.safeParse(
        row.slotType ?? "STUDENT_FILL",
      );
      if (!slotTypeParsed.success) {
        return { error: `Invalid slotType on slot “${key}”.` };
      }
      slots.push({
        key,
        label,
        template,
        order:
          typeof row.order === "number" ? row.order : slots.length + 1,
        required: Boolean(row.required),
        slotType: slotTypeParsed.data as BroadcastSlotType,
        placeholder:
          typeof row.placeholder === "string" ? row.placeholder : undefined,
      });
    }

    if (slots.length === 0) {
      return { error: "Add at least one slot." };
    }

    const ok = await saveBroadcastScriptTemplate({ organizationId, slots });
    if (!ok) {
      return { error: "Unable to save template. Check database connectivity." };
    }

    revalidateScriptPaths();
    return { success: "Rundown template updated." };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save the rundown template.",
    };
  }
}
