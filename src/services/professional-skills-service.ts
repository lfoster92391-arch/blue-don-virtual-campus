import {
  PROFESSIONAL_SKILL_SLUGS,
  PROFESSIONAL_SKILL_TRACKS,
  getProfessionalSkillTrack,
  isProfessionalSkillSlug,
  type ProfessionalSkillSlug,
  type ProfessionalSkillTrack,
} from "@/config/professional-skills";

export type ProfessionalSkillTrackSummary = Pick<
  ProfessionalSkillTrack,
  | "slug"
  | "title"
  | "description"
  | "icon"
  | "xpOpportunityLabel"
  | "learningObjectives"
> & {
  stepCount: number;
  templateCount: number;
};

export type ProfessionalSkillProgress = {
  slug: ProfessionalSkillSlug;
  completedStepIds: string[];
  updatedAt: string;
};

export type ProfessionalSkillsHubData = {
  tracks: ProfessionalSkillTrackSummary[];
  totalTracks: number;
  totalSteps: number;
};

export function listProfessionalSkillTracks(): ProfessionalSkillTrackSummary[] {
  return PROFESSIONAL_SKILL_TRACKS.map((track) => ({
    slug: track.slug,
    title: track.title,
    description: track.description,
    icon: track.icon,
    xpOpportunityLabel: track.xpOpportunityLabel,
    learningObjectives: track.learningObjectives,
    stepCount: track.checklistSteps.length,
    templateCount: track.templates.length,
  }));
}

export function getProfessionalSkillsHubData(): ProfessionalSkillsHubData {
  const tracks = listProfessionalSkillTracks();
  return {
    tracks,
    totalTracks: tracks.length,
    totalSteps: tracks.reduce((sum, track) => sum + track.stepCount, 0),
  };
}

export function getProfessionalSkillTrackDetail(
  slug: string,
): ProfessionalSkillTrack | undefined {
  return getProfessionalSkillTrack(slug);
}

export function getProfessionalSkillSlugs(): ProfessionalSkillSlug[] {
  return [...PROFESSIONAL_SKILL_SLUGS];
}

export function getAiTopicForTrack(slug: string): string | undefined {
  const track = getProfessionalSkillTrack(slug);
  return track?.aiTopic;
}

/** Client-side localStorage key for checklist progress (no server schema). */
export const PROFESSIONAL_SKILLS_PROGRESS_KEY = "bd-professional-skills-progress";

export function parseProfessionalSkillsProgress(
  raw: string | null,
): Record<ProfessionalSkillSlug, string[]> {
  const empty = Object.fromEntries(
    PROFESSIONAL_SKILL_SLUGS.map((slug) => [slug, [] as string[]]),
  ) as Record<ProfessionalSkillSlug, string[]>;

  if (!raw) {
    return empty;
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    for (const slug of PROFESSIONAL_SKILL_SLUGS) {
      const ids = parsed[slug];
      if (Array.isArray(ids)) {
        empty[slug] = ids.filter((id) => typeof id === "string");
      }
    }
  } catch {
    return empty;
  }

  return empty;
}

export function computeTrackProgressPercent(
  track: ProfessionalSkillTrack,
  completedStepIds: string[],
): number {
  if (track.checklistSteps.length === 0) {
    return 0;
  }
  const completed = track.checklistSteps.filter((step) =>
    completedStepIds.includes(step.id),
  ).length;
  return Math.round((completed / track.checklistSteps.length) * 100);
}

export function validateTrackSlug(slug: string): slug is ProfessionalSkillSlug {
  return isProfessionalSkillSlug(slug);
}
