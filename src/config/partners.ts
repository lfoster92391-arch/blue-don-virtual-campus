import type {
  BusinessCategory,
  CommunityCategory,
  PartnerOpportunityType,
  PartnerStatus,
  PartnerType,
} from "@/generated/prisma/client";

export type CommunityCategoryMeta = {
  label: string;
  emoji: string;
  description: string;
};

export const COMMUNITY_CATEGORY_META: Record<CommunityCategory, CommunityCategoryMeta> = {
  HOSPITAL: {
    label: "Hospitals",
    emoji: "🏥",
    description: "Healthcare partners offering shadowing, volunteering, and career exploration.",
  },
  POLICE: {
    label: "Police",
    emoji: "👮",
    description: "Law enforcement agencies supporting civic education and public safety careers.",
  },
  FIRE: {
    label: "Fire & Rescue",
    emoji: "🚒",
    description: "Fire departments and EMS partners for service learning and emergency services pathways.",
  },
  BANK: {
    label: "Banks",
    emoji: "🏦",
    description: "Financial institutions supporting financial literacy and business pathways.",
  },
  CHURCH: {
    label: "Churches",
    emoji: "⛪",
    description: "Faith communities partnering on service, retreats, and parish outreach.",
  },
  MANUFACTURING: {
    label: "Manufacturing",
    emoji: "🏭",
    description: "Regional manufacturers offering plant tours, apprenticeships, and STEM connections.",
  },
  TECHNOLOGY: {
    label: "Technology",
    emoji: "💻",
    description: "Tech companies supporting internships, mentorship, and IT career pathways.",
  },
  CONSTRUCTION: {
    label: "Construction",
    emoji: "🏗️",
    description: "Builders and trades partners for job shadows, apprenticeships, and skilled trades exploration.",
  },
};

export const COMMUNITY_CATEGORY_ORDER: CommunityCategory[] = [
  "HOSPITAL",
  "POLICE",
  "FIRE",
  "BANK",
  "CHURCH",
  "MANUFACTURING",
  "TECHNOLOGY",
  "CONSTRUCTION",
];

export const BUSINESS_CATEGORY_META: Record<
  BusinessCategory,
  { label: string; emoji: string; description: string }
> = {
  EMPLOYER: {
    label: "Employers",
    emoji: "💼",
    description: "Local employers offering internships and career pathways.",
  },
  SPONSOR: {
    label: "Sponsors",
    emoji: "🤝",
    description: "Organizations supporting Madonna programs and events.",
  },
  EDUCATION: {
    label: "Education",
    emoji: "🎓",
    description: "Education partners providing certifications and learning content.",
  },
  TECHNOLOGY: {
    label: "Technology",
    emoji: "💻",
    description: "Technology industry partners for STEM and IT pathways.",
  },
  HEALTHCARE: {
    label: "Healthcare",
    emoji: "🩺",
    description: "Healthcare industry partners for clinical and allied health careers.",
  },
  OTHER: {
    label: "Other",
    emoji: "🏢",
    description: "Additional business partners connected to Madonna.",
  },
};

export const PARTNER_TYPE_LABELS: Record<PartnerType, string> = {
  BUSINESS: "Business",
  COMMUNITY: "Community",
};

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  SUSPENDED: "Suspended",
};

export const PARTNER_OPPORTUNITY_TYPE_LABELS: Record<PartnerOpportunityType, string> = {
  VOLUNTEER: "Volunteer",
  JOB_SHADOW: "Job shadow",
  INTERNSHIP: "Internship",
  CAREER_TALK: "Career talk",
  SERVICE: "Service opportunity",
  SCHOLARSHIP: "Scholarship",
  WORKSHOP: "Workshop",
};

export const PARTNER_OPPORTUNITY_TYPE_EMOJI: Record<PartnerOpportunityType, string> = {
  VOLUNTEER: "❤️",
  JOB_SHADOW: "👀",
  INTERNSHIP: "💼",
  CAREER_TALK: "🎤",
  SERVICE: "🤲",
  SCHOLARSHIP: "🎓",
  WORKSHOP: "🛠️",
};

export function getPartnerHref(slug: string, partnerType: PartnerType): string {
  return partnerType === "COMMUNITY"
    ? `/community-partners/${slug}`
    : `/partners/${slug}`;
}

export function getPartnerDirectoryHref(partnerType: PartnerType): string {
  return partnerType === "COMMUNITY" ? "/community-partners" : "/partners?type=business";
}
