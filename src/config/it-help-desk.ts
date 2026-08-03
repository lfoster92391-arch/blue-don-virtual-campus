/** Spiceworks help desk for campus IT support requests. */
export const IT_HELP_DESK_NAME = "Weirton Madonna High School Help Desk";

export const IT_HELP_DESK_EMAIL =
  process.env.NEXT_PUBLIC_IT_HELP_DESK_EMAIL ??
  process.env.IT_HELP_DESK_EMAIL ??
  "help@weirtonmadonna.on.spiceworks.com";

export const IT_TICKET_GUIDANCE_HEADLINE =
  "When making a ticket, add as much detail as possible";

export const IT_TICKET_GUIDANCE_ITEMS = [
  "What you have already tried / steps taken",
  "Device model and serial numbers (if applicable)",
  "A clear description of the issue you are having",
  "Your location (room number or building area)",
  "Urgency and impact (blocking class, one person, etc.)",
  "Screenshots or error messages if available",
] as const;

export const IT_TICKET_MAILTO_SUBJECT = "IT Support Request";

export function buildItHelpDeskMailtoBody(): string {
  return [
    "Issue description:",
    "[Describe the problem]",
    "",
    "Steps already tried:",
    "[What you have done so far]",
    "",
    "Device (if applicable):",
    "Model: ",
    "Serial number: ",
    "",
    "Location:",
    "[Room or area]",
    "",
    "Urgency:",
    "[How this affects your work]",
  ].join("\n");
}

export function buildItHelpDeskMailto(
  options: { subject?: string } = {},
): string {
  const subject = options.subject ?? IT_TICKET_MAILTO_SUBJECT;
  const params = new URLSearchParams({
    subject,
    body: buildItHelpDeskMailtoBody(),
  });

  return `mailto:${IT_HELP_DESK_EMAIL}?${params.toString()}`;
}
