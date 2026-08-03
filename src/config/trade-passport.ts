/**
 * Trade Passport — workforce readiness checklist (Future Center).
 * Mirrors the College Passport support model for skilled-trade pathways.
 */

export type TradePassportItem = {
  id: string;
  title: string;
  description: string;
  category: "safety" | "training" | "credentials" | "workforce";
  resourceHref?: string;
};

export const TRADE_PASSPORT_TAGLINE = "Build your skilled-trade readiness, one checkpoint at a time.";

export const TRADE_PASSPORT_ITEMS: TradePassportItem[] = [
  {
    id: "osha-10",
    title: "OSHA 10-Hour Safety Certification",
    description:
      "Complete OSHA 10 general industry or construction safety training through Madonna's workforce partnership.",
    category: "safety",
    resourceHref: "/academies",
  },
  {
    id: "apprenticeship-exploration",
    title: "Apprenticeship Program Exploration",
    description:
      "Meet with a Future Center advisor and review registered apprenticeship options in your trade interest area.",
    category: "training",
    resourceHref: "/pathways",
  },
  {
    id: "jdrcc-enrollment",
    title: "JDRCC Partnership Enrollment",
    description:
      "Enroll in Jefferson Davis Regional Career Center courses aligned with your trade pathway.",
    category: "training",
  },
  {
    id: "industry-cert",
    title: "Industry Certification Earned",
    description:
      "Earn at least one industry-recognized credential (NCCER, AWS, CompTIA, EPA 608, etc.).",
    category: "credentials",
    resourceHref: "/academies",
  },
  {
    id: "tools-portfolio",
    title: "Tools & Equipment Portfolio",
    description:
      "Document tools you've mastered and equipment checkout experience through campus labs.",
    category: "credentials",
    resourceHref: "/equipment",
  },
  {
    id: "employer-shadow",
    title: "Employer Site Visit or Job Shadow",
    description:
      "Complete a job shadow or site visit with a trade employer partner.",
    category: "workforce",
    resourceHref: "/pathways",
  },
  {
    id: "resume-trade",
    title: "Trade-Ready Resume & References",
    description:
      "Build a skilled-trade resume highlighting certifications, projects, and supervisor references.",
    category: "workforce",
    resourceHref: "/career-portfolio",
  },
  {
    id: "employer-connection",
    title: "Employer Connection Secured",
    description:
      "Secure an interview, co-op placement, or post-graduation employment connection with a trade employer.",
    category: "workforce",
  },
];

export const TRADE_PASSPORT_CATEGORY_LABELS: Record<TradePassportItem["category"], string> = {
  safety: "Safety",
  training: "Training",
  credentials: "Credentials",
  workforce: "Workforce",
};
