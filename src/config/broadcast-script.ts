/**
 * Default Show Script / Daily Rundown template for Broadcasting.
 * Extensible — advisors can override slot structure per org in the DB.
 */

export type BroadcastSlotType = "STUDENT_FILL" | "LOCKED_DAILY" | "FIXED";

export type BroadcastScriptSlotDef = {
  key: string;
  label: string;
  /** Spoken line with ____ placeholders for fill-in values. */
  template: string;
  order: number;
  required: boolean;
  slotType: BroadcastSlotType;
  /** Hint shown under the input. */
  placeholder?: string;
};

/** Default Madonna morning-show rundown — seed / fallback when no org template exists. */
export const DEFAULT_BROADCAST_SCRIPT_SLOTS: BroadcastScriptSlotDef[] = [
  {
    key: "intro",
    label: "Intro opener",
    template:
      "Hello Blue Don Family. We are your host(s). I'm ____ and I'm ____.",
    order: 1,
    required: true,
    slotType: "STUDENT_FILL",
    placeholder: "Host 1 name · Host 2 name",
  },
  {
    key: "discussion",
    label: "Today's discussion",
    template: "Today's discussion will be over: ____",
    order: 2,
    required: true,
    slotType: "STUDENT_FILL",
    placeholder: "Topic of the day",
  },
  {
    key: "prayer",
    label: "School prayer",
    template: "____",
    order: 3,
    required: true,
    slotType: "LOCKED_DAILY",
    placeholder: "Advisor sets today's prayer text",
  },
  {
    key: "events",
    label: "Events today",
    template: "Events today: ____",
    order: 4,
    required: false,
    slotType: "STUDENT_FILL",
    placeholder: "Assemblies, games, club meetings…",
  },
  {
    key: "announcements",
    label: "Morning announcements",
    template: "Announcements from this morning: ____",
    order: 5,
    required: false,
    slotType: "STUDENT_FILL",
    placeholder: "Office / admin notes",
  },
  {
    key: "fundraisers",
    label: "Current fundraisers",
    template: "Current fundraisers: ____",
    order: 6,
    required: false,
    slotType: "STUDENT_FILL",
    placeholder: "Active drives and deadlines",
  },
  {
    key: "sports",
    label: "Sports & games",
    template: "Sports currently going on / any games tonight: ____",
    order: 7,
    required: false,
    slotType: "STUDENT_FILL",
    placeholder: "Games, practices, results",
  },
  {
    key: "lunch",
    label: "Lunch menu",
    template: "Lunch menu for today: ____",
    order: 8,
    required: false,
    slotType: "STUDENT_FILL",
    placeholder: "Entree and sides",
  },
  {
    key: "closer",
    label: "Closer",
    template: "HAVE A BLUE DON DAY MADONNA",
    order: 9,
    required: true,
    slotType: "FIXED",
  },
];

export const DEFAULT_SCHOOL_PRAYER =
  "In the name of the Father, and of the Son, and of the Holy Spirit. Amen. Lord, bless our Blue Don family today — guide our words, our work, and our witness. Amen.";

export type BroadcastScriptSlotView = BroadcastScriptSlotDef & {
  value: string;
};

function fillTemplate(template: string, value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return template;
  }
  if (!template.includes("____")) {
    return trimmed || template;
  }
  // Distribute multi-part values (e.g. "Alex · Jordan") across blanks.
  const parts = trimmed.split(/\s*[·|/,]\s*|\s+and\s+/i).filter(Boolean);
  let partIndex = 0;
  return template.replace(/____/g, () => {
    const next = parts[partIndex] ?? (partIndex === 0 ? trimmed : "____");
    partIndex += 1;
    return next;
  });
}

/** Build the spoken show script from slots + prayer (shared client/server). */
export function renderFullScript(
  slots: BroadcastScriptSlotView[],
  prayerText: string,
): string {
  const lines: string[] = [];
  for (const slot of slots) {
    if (slot.slotType === "FIXED") {
      lines.push(slot.template);
      continue;
    }
    if (slot.slotType === "LOCKED_DAILY") {
      const prayer = prayerText.trim() || "____";
      lines.push(
        slot.template.includes("____")
          ? fillTemplate(slot.template, prayer)
          : prayer,
      );
      continue;
    }
    lines.push(fillTemplate(slot.template, slot.value));
  }
  return lines.join("\n\n");
}

export type BroadcastDailyScriptView = {
  id: string | null;
  organizationId: string;
  scriptDate: Date;
  prayerText: string;
  slots: BroadcastScriptSlotView[];
  fullScript: string;
  updatedAt: Date | null;
  updatedByName: string | null;
  isPersisted: boolean;
};
