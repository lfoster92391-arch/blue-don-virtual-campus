/**
 * W16 · Blue Don AI — scoped campus assistant disclosure and capabilities.
 */

export type AiCapability = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  scope: string;
};

export type AiDisclosurePoint = {
  id: string;
  title: string;
  body: string;
};

export const AI_DISCLOSURE_POINTS: AiDisclosurePoint[] = [
  {
    id: "disc-1",
    title: "Scoped to campus context",
    body: "Blue Don AI only accesses your Madonna profile, enrolled academies, and published campus resources. It cannot browse the open internet.",
  },
  {
    id: "disc-2",
    title: "Not a replacement for teachers",
    body: "The assistant helps with homework hints, career exploration, and planning — not graded answers. Always verify with your instructor.",
  },
  {
    id: "disc-3",
    title: "Data handling",
    body: "Conversations are logged for safety review. Parents can request transcripts. Data is retained per the AI Assistant Disclosure agreement.",
  },
  {
    id: "disc-4",
    title: "Parent acknowledgment required",
    body: "Students under 18 need parent approval via the AI Assistant Disclosure form before first use.",
  },
];

export const AI_CAPABILITIES: AiCapability[] = [
  { id: "cap-hw", name: "Homework help", description: "Step-by-step hints for academy coursework", enabled: true, scope: "Enrolled academies" },
  { id: "cap-career", name: "Career exploration", description: "What-if career paths and pathway recommendations", enabled: true, scope: "Future Center" },
  { id: "cap-plan", name: "Planning assistant", description: "Schedule, event, and deadline awareness", enabled: true, scope: "Calendar + assignments" },
  { id: "cap-write", name: "Writing coach", description: "Grammar, structure, and citation guidance", enabled: true, scope: "Portfolio + essays" },
  { id: "cap-code", name: "Code helper", description: "Debugging hints for lab assignments", enabled: true, scope: "STEM labs" },
  { id: "cap-chat", name: "Open chat", description: "General campus questions", enabled: false, scope: "Disabled — scoped modes only" },
];
