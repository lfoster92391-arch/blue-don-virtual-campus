import { BLUE_DON_PASS } from "@/config/identity-engine";
import { SEED_TRANSCRIPT_PLACEHOLDER } from "@/config/career-portfolio";
import { MADONNA_ORGANIZATIONS } from "@/config/madonna-organizations";
import {
  getScholarshipById,
  isScholarshipDeadlinePassed,
  SCHOLARSHIPS,
  type Scholarship,
  type ScholarshipCategory,
} from "@/config/scholarships";
import { CLEAN_SLATE } from "@/config/app-mode";
import { isDatabaseConfigured } from "@/config/env";
import { isPrismaReady, withDatabase } from "@/lib/prisma";
import {
  buildScholarshipCard,
  filterScholarshipCards,
  sortScholarshipMatches,
  type ScholarshipCard,
  type ScholarshipFilters,
  type ScholarshipMatch,
} from "@/lib/scholarship";
import { getStudentProgressProfile } from "@/services/academy-engine-service";
import { getStudentContext } from "@/services/student-context-service";

export type { ScholarshipCard, ScholarshipMatch, ScholarshipFilters } from "@/lib/scholarship";

const FAITH_ORG_SLUGS = new Set([
  "campus-ministry",
  "prayer-club",
  "pro-life-alliance-of-youth",
  "interact-club-high-school",
  "interact-club-junior-high",
]);

const STEM_ACADEMY_SLUGS = new Set([
  "it",
  "cybersecurity",
  "robotics",
  "broadcast",
  "photography",
  "graphic-design",
]);

const STEM_CLUB_SLUGS = new Set(["it-club", "science-club", "geek-club"]);

const LEADERSHIP_ROLES = new Set(["LEAD", "OFFICER", "MODERATOR", "PRESIDENT", "VICE_PRESIDENT"]);

type ScholarshipSignals = {
  grade: number;
  classOf: string;
  gpa: number;
  academySlugs: string[];
  orgSlugs: string[];
  clubSlugs: string[];
  teamSlugs: string[];
  volunteerHours: number;
  certificationCount: number;
  faithInvolved: boolean;
  athleticsInvolved: boolean;
  stemInvolved: boolean;
  leadershipInvolved: boolean;
};

type MatchResult = {
  qualifies: boolean;
  score: number;
  reasons: string[];
};

async function getScholarshipSignals(userId: string): Promise<ScholarshipSignals> {
  const grade = Number.parseInt(BLUE_DON_PASS.grade, 10) || 11;
  const classOf = BLUE_DON_PASS.classOf;
  const gpa = Number.parseFloat(SEED_TRANSCRIPT_PLACEHOLDER.gpa) || 0;

  let academySlugs: string[] = [];
  let orgSlugs: string[] = [];
  let leadershipInvolved = false;

  if (isDatabaseConfigured() && isPrismaReady()) {
    const dbResult = await withDatabase((prisma) =>
      Promise.all([
        prisma.academyMembership.findMany({
          where: { userId, status: "ACTIVE" },
          include: { academy: { select: { slug: true } } },
        }),
        prisma.organizationMembership.findMany({
          where: { userId, status: "ACTIVE" },
          include: { organization: { select: { slug: true, type: true } } },
        }),
      ]),
    );

    if (dbResult) {
      const [academies, orgs] = dbResult;
      academySlugs = academies.map((row) => row.academy.slug);
      orgSlugs = orgs.map((row) => row.organization.slug);
      leadershipInvolved = orgs.some((row) => LEADERSHIP_ROLES.has(row.orgRole));
    }
  }

  const [context, progress] = await Promise.all([
    getStudentContext(userId),
    getStudentProgressProfile(userId),
  ]);

  const clubSlugs = context.clubs.map((club) => club.slug);
  const teamSlugs = context.teams.map((team) => team.slug);

  if (orgSlugs.length === 0) {
    orgSlugs = [...clubSlugs, ...teamSlugs, ...context.classes.map((c) => c.slug)];
  }

  const faithInvolved = orgSlugs.some((slug) => FAITH_ORG_SLUGS.has(slug));
  const athleticsInvolved = teamSlugs.length > 0;
  const stemInvolved =
    academySlugs.some((slug) => STEM_ACADEMY_SLUGS.has(slug)) ||
    clubSlugs.some((slug) => STEM_CLUB_SLUGS.has(slug));

  if (!leadershipInvolved) {
    leadershipInvolved = [...context.clubs, ...context.teams, ...context.classes].some((org) =>
      LEADERSHIP_ROLES.has(org.role),
    );
  }

  return {
    grade,
    classOf,
    gpa,
    academySlugs,
    orgSlugs,
    clubSlugs,
    teamSlugs,
    volunteerHours: progress.volunteerHours,
    certificationCount: progress.certificationCount,
    faithInvolved,
    athleticsInvolved,
    stemInvolved,
    leadershipInvolved,
  };
}

function clubDisplayName(slug: string): string {
  const org = MADONNA_ORGANIZATIONS.find((entry) => entry.slug === slug);
  return org?.name ?? slug.replace(/-/g, " ");
}

function passesHardRequirements(
  scholarship: Scholarship,
  signals: ScholarshipSignals,
): { passes: boolean; failReasons: string[] } {
  const req = scholarship.requirements;
  const failReasons: string[] = [];

  if (isScholarshipDeadlinePassed(scholarship.deadline)) {
    failReasons.push("Application deadline has passed.");
  }

  if (req.gradeMin !== undefined && signals.grade < req.gradeMin) {
    failReasons.push(`Requires grade ${req.gradeMin} or higher.`);
  }

  if (req.gradeMax !== undefined && signals.grade > req.gradeMax) {
    failReasons.push(`Limited to grade ${req.gradeMax} and below.`);
  }

  if (req.gpaMin !== undefined && signals.gpa < req.gpaMin) {
    failReasons.push(`Requires GPA of ${req.gpaMin} or higher.`);
  }

  if (req.classOf?.length && !req.classOf.includes(signals.classOf)) {
    failReasons.push(`Limited to Class of ${req.classOf.join(", ")}.`);
  }

  if (req.clubs?.length) {
    const hasClub = req.clubs.some(
      (slug) => signals.clubSlugs.includes(slug) || signals.orgSlugs.includes(slug),
    );
    if (!hasClub) {
      failReasons.push(`Requires membership in ${req.clubs.map(clubDisplayName).join(" or ")}.`);
    }
  }

  if (req.serviceHoursMin !== undefined && signals.volunteerHours < req.serviceHoursMin) {
    failReasons.push(`Requires at least ${req.serviceHoursMin} service hours.`);
  }

  if (req.athletics && !signals.athleticsInvolved) {
    failReasons.push("Requires participation in Madonna athletics.");
  }

  if (req.faith && !signals.faithInvolved) {
    failReasons.push("Requires involvement in faith-based campus activities.");
  }

  if (req.stem && !signals.stemInvolved) {
    failReasons.push("Requires STEM academy or club involvement.");
  }

  if (req.leadership && !signals.leadershipInvolved) {
    failReasons.push("Requires a campus leadership role.");
  }

  return { passes: failReasons.length === 0, failReasons };
}

function scoreScholarship(scholarship: Scholarship, signals: ScholarshipSignals): MatchResult {
  const { passes, failReasons } = passesHardRequirements(scholarship, signals);

  if (!passes) {
    return { qualifies: false, score: 0, reasons: failReasons.slice(0, 3) };
  }

  let score = 35;
  const reasons: string[] = [];
  const req = scholarship.requirements;

  reasons.push(`You are in grade ${signals.grade}.`);

  if (req.classOf?.includes(signals.classOf)) {
    score += 12;
    reasons.push(`Class of ${signals.classOf}.`);
  }

  if (req.gpaMin !== undefined && signals.gpa >= req.gpaMin) {
    score += 10;
    reasons.push(`Your GPA (${signals.gpa.toFixed(2)}) meets the requirement.`);
  }

  const matchingClubs =
    req.clubs?.filter(
      (slug) => signals.clubSlugs.includes(slug) || signals.orgSlugs.includes(slug),
    ) ?? [];

  for (const slug of matchingClubs) {
    score += 15;
    reasons.push(`You are in ${clubDisplayName(slug)}.`);
  }

  const matchingAcademies = signals.academySlugs.filter((slug) =>
    STEM_ACADEMY_SLUGS.has(slug),
  );
  if (matchingAcademies.length > 0 && (req.stem || scholarship.category === "stem")) {
    score += 12;
    reasons.push("Your academy pathway connects to this STEM scholarship.");
  }

  if (req.serviceHoursMin !== undefined && signals.volunteerHours >= req.serviceHoursMin) {
    score += 10;
    reasons.push(`You have ${signals.volunteerHours} verified service hours.`);
  } else if (signals.volunteerHours > 0 && scholarship.category === "service") {
    score += 6;
    reasons.push(`You have ${signals.volunteerHours} service hours on record.`);
  }

  if (req.athletics && signals.athleticsInvolved) {
    score += 12;
    const team = signals.teamSlugs[0];
    reasons.push(team ? `You compete on ${clubDisplayName(team)}.` : "You are a Madonna athlete.");
  }

  if (req.faith && signals.faithInvolved) {
    score += 10;
    reasons.push("You are active in faith-based campus life.");
  }

  if (req.leadership && signals.leadershipInvolved) {
    score += 10;
    reasons.push("You hold a campus leadership role.");
  }

  if (signals.certificationCount > 0 && (req.stem || scholarship.category === "academic")) {
    score += 5;
    reasons.push(`${signals.certificationCount} academy certification(s) strengthen your profile.`);
  }

  if (reasons.length === 1) {
    reasons.push("Your Madonna profile aligns with this opportunity.");
  }

  return {
    qualifies: true,
    score: Math.min(99, score),
    reasons: reasons.slice(0, 4),
  };
}

function toMatch(card: ScholarshipCard, result: MatchResult): ScholarshipMatch {
  return {
    ...card,
    matchScore: result.score,
    matchReasons: result.reasons,
    qualifies: result.qualifies,
  };
}

function activeScholarships(): Scholarship[] {
  // Clean slate: the scholarship board starts empty until the school adds its
  // own real opportunities. The demo catalog only appears when clean slate is off.
  return CLEAN_SLATE ? [] : SCHOLARSHIPS;
}

export async function listScholarships(
  filters: ScholarshipFilters = {},
): Promise<ScholarshipCard[]> {
  const cards = activeScholarships().map(buildScholarshipCard);
  return filterScholarshipCards(cards, filters);
}

export async function matchScholarshipsForUser(
  userId: string,
  filters: ScholarshipFilters = {},
): Promise<{
  matches: ScholarshipMatch[];
  qualifiedCount: number;
  totalCount: number;
}> {
  const scholarships = activeScholarships();
  if (scholarships.length === 0) {
    return { matches: [], qualifiedCount: 0, totalCount: 0 };
  }

  const signals = await getScholarshipSignals(userId);
  const cards = scholarships.map(buildScholarshipCard);
  const filtered = filterScholarshipCards(cards, filters);

  const matches = filtered.map((card) => {
    const scholarship = scholarships.find((s) => s.id === card.id)!;
    const result = scoreScholarship(scholarship, signals);
    return toMatch(card, result);
  });

  const sorted = sortScholarshipMatches(matches, filters.sortBy ?? "match");
  const qualifiedCount = sorted.filter((match) => match.qualifies).length;

  return {
    matches: sorted,
    qualifiedCount,
    totalCount: scholarships.length,
  };
}

export async function getScholarshipMatch(
  userId: string,
  id: string,
): Promise<{ scholarship: ScholarshipCard; match: ScholarshipMatch } | null> {
  if (CLEAN_SLATE) {
    return null;
  }

  const scholarship = getScholarshipById(id);
  if (!scholarship) {
    return null;
  }

  const signals = await getScholarshipSignals(userId);
  const card = buildScholarshipCard(scholarship);
  const result = scoreScholarship(scholarship, signals);

  return {
    scholarship: card,
    match: toMatch(card, result),
  };
}

export async function getQualifiedScholarshipCount(userId: string): Promise<number> {
  const { qualifiedCount } = await matchScholarshipsForUser(userId);
  return qualifiedCount;
}

export function listScholarshipCategories(): ScholarshipCategory[] {
  return ["academic", "athletic", "service", "faith", "stem", "arts", "local"];
}
