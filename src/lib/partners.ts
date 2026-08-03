import type { PartnerListItem } from "@/services/partner-service";
import type { BusinessPartnerSummary } from "@/services/business-partner-service";

export function businessPartnerToListItem(partner: BusinessPartnerSummary): PartnerListItem {
  return {
    id: partner.id,
    slug: partner.slug,
    name: partner.name,
    description: partner.description,
    partnerType: "BUSINESS",
    communityCategory: null,
    businessCategory: null,
    schoolApproved: true,
    sortOrder: 0,
    opportunityCount: partner.opportunityCount,
  };
}
