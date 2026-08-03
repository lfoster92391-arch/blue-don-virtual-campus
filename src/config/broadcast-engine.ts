/**
 * W3 · Broadcast Engine — audiences, approval queue, and campus ticker.
 */

export type BroadcastAudienceTier = "all_campus" | "grade" | "academy" | "org" | "role";

export const AUDIENCE_TIER_LABELS: Record<BroadcastAudienceTier, string> = {
  all_campus: "All Campus",
  grade: "Grade Level",
  academy: "Academy",
  org: "Organization",
  role: "Role",
};

export type BroadcastAudience = {
  id: string;
  label: string;
  tier: BroadcastAudienceTier;
  reach: number;
};

export type BroadcastApprovalItem = {
  id: string;
  title: string;
  author: string;
  audience: string;
  submittedLabel: string;
  status: "pending" | "approved" | "rejected";
};

export type TickerItem = {
  id: string;
  text: string;
  priority: "normal" | "urgent";
};

export const BROADCAST_AUDIENCES: BroadcastAudience[] = [
  { id: "aud-all", label: "All Campus", tier: "all_campus", reach: 1240 },
  { id: "aud-9-12", label: "Grades 9–12", tier: "grade", reach: 980 },
  { id: "aud-stem", label: "STEM Academy", tier: "academy", reach: 186 },
  { id: "aud-it-club", label: "IT Club", tier: "org", reach: 42 },
  { id: "aud-parents", label: "Parents", tier: "role", reach: 620 },
];

export const BROADCAST_APPROVAL_QUEUE: BroadcastApprovalItem[] = [
  {
    id: "appr-1",
    title: "Spirit Week dress code reminder",
    author: "Student Council",
    audience: "All Campus",
    submittedLabel: "Submitted 1h ago",
    status: "pending",
  },
  {
    id: "appr-2",
    title: "Robotics showcase volunteer call",
    author: "STEM Academy",
    audience: "STEM Academy",
    submittedLabel: "Submitted yesterday",
    status: "pending",
  },
  {
    id: "appr-3",
    title: "Parent-teacher conference schedule",
    author: "Main Office",
    audience: "Parents",
    submittedLabel: "Approved this morning",
    status: "approved",
  },
];

export const CAMPUS_TICKER: TickerItem[] = [
  { id: "t1", text: "🏈 Home game Friday 7 PM — Go Blue Dons!", priority: "normal" },
  { id: "t2", text: "📋 Cap & gown orders due this Friday for seniors", priority: "urgent" },
  { id: "t3", text: "🎉 Spirit Week starts Monday — check dress themes", priority: "normal" },
  { id: "t4", text: "💻 IT Club help desk shifts open — earn service hours", priority: "normal" },
];
