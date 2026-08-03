/**
 * Military Passport — service pathway readiness checklist (Future Center).
 */

export type MilitaryPassportItem = {
  id: string;
  title: string;
  description: string;
  category: "assessment" | "exploration" | "preparation" | "opportunities";
  resourceHref?: string;
};

export const MILITARY_PASSPORT_TAGLINE = "Prepare to serve with confidence — academics, fitness, and career clarity.";

export const MILITARY_PASSPORT_ITEMS: MilitaryPassportItem[] = [
  {
    id: "asvab",
    title: "ASVAB Assessment Completed",
    description:
      "Take the Armed Services Vocational Aptitude Battery and review your score breakdown with a counselor.",
    category: "assessment",
    resourceHref: "/pathways",
  },
  {
    id: "recruiter-visits",
    title: "Recruiter Information Sessions",
    description:
      "Attend at least two branch recruiter visits or Future Center military pathway briefings.",
    category: "exploration",
  },
  {
    id: "rotc-exploration",
    title: "ROTC / Service Academy Exploration",
    description:
      "Explore ROTC programs, service academies, and officer commissioning pathways.",
    category: "exploration",
    resourceHref: "/pathways",
  },
  {
    id: "fitness-goals",
    title: "Physical Fitness Benchmarks",
    description:
      "Meet branch-specific fitness standards — track push-ups, run time, and body composition goals.",
    category: "preparation",
  },
  {
    id: "branch-research",
    title: "Branch & MOS Research",
    description:
      "Research at least three military occupational specialties aligned with your skills and interests.",
    category: "exploration",
  },
  {
    id: "scholarships",
    title: "Military Scholarship Applications",
    description:
      "Apply for ROTC scholarships, GI Bill pathways, or service-specific tuition assistance programs.",
    category: "opportunities",
  },
  {
    id: "career-paths",
    title: "Military Career Path Plan",
    description:
      "Create a written plan mapping enlistment or commissioning goals to civilian career outcomes.",
    category: "opportunities",
    resourceHref: "/career-portfolio",
  },
  {
    id: "mentor-connection",
    title: "Veteran Mentor Connection",
    description:
      "Connect with a Madonna alumni veteran mentor through the alumni network.",
    category: "preparation",
    resourceHref: "/madonna-world",
  },
];

export const MILITARY_PASSPORT_CATEGORY_LABELS: Record<MilitaryPassportItem["category"], string> = {
  assessment: "Assessment",
  exploration: "Exploration",
  preparation: "Preparation",
  opportunities: "Opportunities",
};
