/** Build a minimal ICS file for "Add to calendar" message actions. */
export function buildIcsEvent(input: {
  title: string;
  description?: string | null;
  location?: string | null;
  start: Date;
  end: Date;
  uid?: string;
}): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

  const uid =
    input.uid ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}@campus.assetpilotedu.com`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Blue Don Virtual Campus//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(input.start)}`,
    `DTEND:${stamp(input.end)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
  ];
  if (input.description) {
    lines.push(`DESCRIPTION:${escapeIcs(input.description)}`);
  }
  if (input.location) {
    lines.push(`LOCATION:${escapeIcs(input.location)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

export function downloadIcsFile(filename: string, ics: string) {
  if (typeof window === "undefined") {
    return;
  }
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
