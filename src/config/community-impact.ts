/**
 * Community Impact — school-wide service dashboard (Open House ready).
 */

export type CommunityImpactStat = {
  id: string;
  label: string;
  value: number;
  unit?: string;
  prefix?: string;
  icon: "service" | "money" | "repair" | "broadcast" | "meals" | "projects";
  description: string;
};

export const COMMUNITY_IMPACT_HEADLINE = "Madonna Serves";

export const COMMUNITY_IMPACT_SUBHEADLINE =
  "Our students don't wait to graduate to make a difference. Every hour, every dollar, every repair — it adds up.";

export const COMMUNITY_IMPACT_STATS: CommunityImpactStat[] = [
  {
    id: "service-hours",
    label: "Service Hours",
    value: 12482,
    icon: "service",
    description: "Verified volunteer hours logged through campus events and community partnerships.",
  },
  {
    id: "money-raised",
    label: "Money Raised",
    value: 84000,
    prefix: "$",
    icon: "money",
    description: "Funds raised for local nonprofits, disaster relief, and campus service initiatives.",
  },
  {
    id: "chromebooks-repaired",
    label: "Chromebooks Repaired",
    value: 1742,
    icon: "repair",
    description: "Devices restored by student technicians for classmates and community members.",
  },
  {
    id: "broadcast-hours",
    label: "Broadcast Hours",
    value: 420,
    icon: "broadcast",
    description: "Hours of student-produced content on Blue Don Live and campus media.",
  },
  {
    id: "meals-donated",
    label: "Meals Donated",
    value: 8200,
    icon: "meals",
    description: "Meals packaged and delivered through food drives and hunger-relief partners.",
  },
  {
    id: "volunteer-projects",
    label: "Volunteer Projects",
    value: 212,
    icon: "projects",
    description: "Distinct service projects completed by clubs, classes, and academy teams.",
  },
];

export const COMMUNITY_IMPACT_HIGHLIGHTS = [
  {
    id: "tech-for-good",
    title: "Tech for Good",
    description:
      "IT Academy students repair Chromebooks, build nonprofit websites, and deploy campus Wi-Fi solutions.",
  },
  {
    id: "broadcast-impact",
    title: "Stories That Matter",
    description:
      "Media students produce documentaries, live broadcasts, and awareness campaigns for local causes.",
  },
  {
    id: "hands-on-service",
    title: "Hands-On Service",
    description:
      "From creek cleanups to meal packaging — Madonna students lead projects that change neighborhoods.",
  },
];
