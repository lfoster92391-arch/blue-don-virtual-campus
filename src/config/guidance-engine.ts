/**
 * W13 · Guidance + Partners — counseling resources, partner portal.
 */

export type CounselingResource = {
  id: string;
  title: string;
  description: string;
  type: "appointment" | "resource" | "crisis";
  href?: string;
};

export type PartnerProgram = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: "active" | "upcoming";
};

export const COUNSELING_RESOURCES: CounselingResource[] = [
  { id: "cr-1", title: "Schedule a counseling session", description: "Book time with your school counselor for academic or personal guidance.", type: "appointment" },
  { id: "cr-2", title: "College application checklist", description: "Track deadlines, essays, and recommendation letters.", type: "resource", href: "/pathways" },
  { id: "cr-3", title: "Scholarship finder", description: "Browse local and national scholarship opportunities.", type: "resource", href: "/scholarships" },
  { id: "cr-4", title: "Crisis support line", description: "988 Suicide & Crisis Lifeline — available 24/7.", type: "crisis" },
  { id: "cr-5", title: "Career interest inventory", description: "Discover careers aligned with your strengths and passions.", type: "resource", href: "/pathways" },
];

export const PARTNER_PROGRAMS: PartnerProgram[] = [
  { id: "pp-1", name: "Asset Pilot EDU", description: "Industry certifications and career pathway content.", category: "Education", status: "active" },
  { id: "pp-2", name: "Local Hospital Internship", description: "Summer health sciences shadowing program.", category: "Healthcare", status: "active" },
  { id: "pp-3", name: "Regional Tech Council", description: "Mentorship and hackathon opportunities.", category: "Technology", status: "active" },
  { id: "pp-4", name: "Diocesan Service Network", description: "Faith-based volunteer placements.", category: "Service", status: "upcoming" },
];
