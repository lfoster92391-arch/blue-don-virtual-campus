"use server";

import { requireCampusAccess } from "@/lib/auth/session";
import {
  searchSportsGuide,
  type SportsGuideResult,
} from "@/services/sports-guide-service";

export type SportsGuideState = SportsGuideResult & {
  query: string;
};

export async function askSportsGuideAction(
  _prev: SportsGuideState,
  formData: FormData,
): Promise<SportsGuideState> {
  await requireCampusAccess();
  const query = String(formData.get("q") ?? "").trim();
  const result = await searchSportsGuide(query);
  return { ...result, query };
}
