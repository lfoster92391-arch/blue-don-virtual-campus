import { env } from "@/config/env";

export const partnerConfig = {
  name: "Asset Pilot EDU",
  siteUrl: env.NEXT_PUBLIC_PARTNER_SITE_URL,
} as const;

export function isPartnerLinked(): boolean {
  return Boolean(partnerConfig.siteUrl);
}
