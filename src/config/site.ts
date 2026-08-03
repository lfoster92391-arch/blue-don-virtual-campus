import { DEFAULT_APP_URL, env } from "@/config/env";
import { getAssetPilotSiteUrl } from "@/config/integration";
import { CURRENT_WAVE_ID } from "@/config/waves";

export { CURRENT_WAVE_ID, WAVES, getCurrentWave, getWave, getWaveLabel, phaseToWave } from "@/config/waves";
export type { Wave, WaveStatus } from "@/config/waves";

export const brandAssets = {
  logo: "/icons/source-logo.png",
  emblem: "/icons/apple-touch-icon.png",
  icon192: "/icons/icon-192.png",
  icon512: "/icons/icon-512.png",
} as const;

export const brandColors = {
  navy: "#0A2342",
  navyMuted: "#0F2F52",
  silver: "#C6CCD6",
  white: "#FFFFFF",
  gold: "#C9A227",
  goldMuted: "#D4A017",
  success: "#2E8B57",
  info: "#2F80ED",
  danger: "#C62828",
  partnerBrand: "#0069D9",
  partnerBrandLight: "#EFF6FF",
} as const;

export const siteConfig = {
  name: "Blue Don Virtual Campus",
  shortName: "Blue Don",
  tagline: "Choose Your Path. Build Your Future.",
  institution: "Madonna High School",
  version: "0.1.0",
  // Phase 17 = enterprise navigation + Blue Don OS shell. Canonical wave = W1
  // (current). See src/config/waves.ts + docs/BLUE_DON_SYSTEM_BLUEPRINT.md Part X.
  phase: 17,
  wave: CURRENT_WAVE_ID,
  url: env.NEXT_PUBLIC_APP_URL ?? DEFAULT_APP_URL,
  assetPilotUrl: getAssetPilotSiteUrl(),
} as const;
