/**
 * W20 · Club Worlds — Club milestones + Club XP level ladder.
 *
 * Each club has its OWN XP/level track (distinct from the school-wide Rewards
 * Engine XP). Milestones are the per-club achievement checklist that drives a
 * club member's sense of progression ("Art: First Exhibition", "Chess: 25
 * Wins", "Interact: Community Hero", ...).
 *
 * This is a config + seed MVP: no Prisma tables are required. See
 * `club-xp-service.ts` for how a club's XP/level and milestone completion are
 * derived deterministically for display.
 */

/** Club personality archetype — drives milestones, workspace, and theme. */
export type ClubType =
  | "interact"
  | "student-council"
  | "drama"
  | "art"
  | "chess"
  | "science"
  | "pep"
  | "prayer"
  | "sadd"
  | "nhs"
  | "it"
  | "broadcasting"
  | "cricut"
  | "generic";

/** Grade cohort for `type: CLASS` organizations. */
export type ClassGrade =
  | "senior"
  | "junior"
  | "sophomore"
  | "freshman"
  | "junior-high";

/** Sport archetype for `type: TEAM` organizations. */
export type SportType =
  | "football"
  | "basketball"
  | "cross-country"
  | "golf"
  | "generic";

export type ClubMilestone = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Club XP awarded when this milestone is reached. */
  xp: number;
};

/**
 * Per-club milestone checklists. Ordered from earliest (first meeting) to
 * capstone (the club's signature achievement).
 */
export const CLUB_MILESTONES: Record<ClubType, ClubMilestone[]> = {
  interact: [
    { id: "int-1", name: "First Service Project", description: "Complete your first volunteer project with the club.", icon: "🤝", xp: 100 },
    { id: "int-2", name: "50 Service Hours", description: "Log 50 collective service hours as a member.", icon: "⏱️", xp: 200 },
    { id: "int-3", name: "Community Partner", description: "Build an ongoing partnership with a local organization.", icon: "🏘️", xp: 250 },
    { id: "int-4", name: "Donation Drive Lead", description: "Organize and run a full donation drive.", icon: "📦", xp: 300 },
    { id: "int-5", name: "Community Hero", description: "Reach 250 service hours and lead a signature impact project.", icon: "🦸", xp: 500 },
  ],
  "student-council": [
    { id: "sc-1", name: "Elected Officer", description: "Win a seat or officer role in student government.", icon: "🗳️", xp: 150 },
    { id: "sc-2", name: "First Proposal Passed", description: "Get a student proposal approved by administration.", icon: "📜", xp: 250 },
    { id: "sc-3", name: "Spirit Week Producer", description: "Plan and execute a full spirit week.", icon: "🎉", xp: 300 },
    { id: "sc-4", name: "Homecoming Host", description: "Lead homecoming planning end to end.", icon: "👑", xp: 350 },
    { id: "sc-5", name: "Voice of the Class", description: "Drive 5 student proposals into public progress.", icon: "📣", xp: 500 },
  ],
  drama: [
    { id: "dr-1", name: "Cast in a Show", description: "Earn a role or crew spot in a production.", icon: "🎭", xp: 120 },
    { id: "dr-2", name: "Opening Night", description: "Perform in your first live production.", icon: "🌟", xp: 250 },
    { id: "dr-3", name: "Lead Role", description: "Take on a lead role or department head.", icon: "🎬", xp: 350 },
    { id: "dr-4", name: "Full Season", description: "Complete a full production season.", icon: "📅", xp: 300 },
    { id: "dr-5", name: "Standing Ovation", description: "Star in a sold-out mainstage performance.", icon: "👏", xp: 500 },
  ],
  art: [
    { id: "art-1", name: "First Piece", description: "Add your first work to the club gallery.", icon: "🖼️", xp: 100 },
    { id: "art-2", name: "Monthly Challenge", description: "Complete a monthly themed art challenge.", icon: "🎯", xp: 200 },
    { id: "art-3", name: "First Exhibition", description: "Show a piece in a club exhibition.", icon: "🏛️", xp: 300 },
    { id: "art-4", name: "Competition Entry", description: "Enter an external art competition.", icon: "🏅", xp: 350 },
    { id: "art-5", name: "Featured Artist", description: "Headline a showcase in the Virtual Gallery.", icon: "🎨", xp: 500 },
  ],
  chess: [
    { id: "ch-1", name: "First Win", description: "Win your first rated club match.", icon: "♟️", xp: 100 },
    { id: "ch-2", name: "Puzzle Streak", description: "Solve the puzzle of the week 4 times in a row.", icon: "🧩", xp: 200 },
    { id: "ch-3", name: "10 Wins", description: "Record 10 match victories.", icon: "🔟", xp: 250 },
    { id: "ch-4", name: "Bracket Finalist", description: "Reach a tournament bracket final.", icon: "🥈", xp: 300 },
    { id: "ch-5", name: "25 Wins", description: "Reach 25 career wins and climb the leaderboard.", icon: "👑", xp: 500 },
  ],
  science: [
    { id: "sci-1", name: "Lab Notebook Started", description: "Log your first experiment in the lab notebook.", icon: "📓", xp: 100 },
    { id: "sci-2", name: "Experiment Complete", description: "Run a full experiment from the library.", icon: "🧪", xp: 200 },
    { id: "sci-3", name: "Field Trip", description: "Participate in a science field trip.", icon: "🚌", xp: 200 },
    { id: "sci-4", name: "Competition Entry", description: "Submit a project to a science competition.", icon: "🏆", xp: 350 },
    { id: "sci-5", name: "Published Researcher", description: "Complete a capstone research project.", icon: "🔬", xp: 500 },
  ],
  pep: [
    { id: "pep-1", name: "First Game", description: "Show up and cheer at a home game.", icon: "📣", xp: 100 },
    { id: "pep-2", name: "Theme Night", description: "Lead a student section theme night.", icon: "🎨", xp: 200 },
    { id: "pep-3", name: "Chant Master", description: "Teach the crowd a new chant.", icon: "🔊", xp: 200 },
    { id: "pep-4", name: "Spirit Week Champion", description: "Win a spirit week competition.", icon: "🏆", xp: 300 },
    { id: "pep-5", name: "Sixth Man", description: "Max out the Spirit Meter for a full season.", icon: "🔥", xp: 500 },
  ],
  prayer: [
    { id: "pr-1", name: "First Intention", description: "Post your first intention to the prayer wall.", icon: "🙏", xp: 100 },
    { id: "pr-2", name: "Rosary Circle", description: "Attend a scheduled rosary gathering.", icon: "📿", xp: 150 },
    { id: "pr-3", name: "Reflection Journal", description: "Keep a reflection journal for a full week.", icon: "📖", xp: 200 },
    { id: "pr-4", name: "Saint Study", description: "Complete a saint study series.", icon: "😇", xp: 250 },
    { id: "pr-5", name: "Faith in Action", description: "Finish a full Bible reading plan and lead a devotion.", icon: "✝️", xp: 500 },
  ],
  sadd: [
    { id: "sadd-1", name: "First Campaign", description: "Support an awareness campaign.", icon: "📢", xp: 100 },
    { id: "sadd-2", name: "Guest Speaker", description: "Help host a guest speaker event.", icon: "🎤", xp: 200 },
    { id: "sadd-3", name: "Wellness Champion", description: "Complete a wellness challenge series.", icon: "💪", xp: 250 },
    { id: "sadd-4", name: "Decision Maker", description: "Finish every Decision Simulator scenario.", icon: "🧭", xp: 300 },
    { id: "sadd-5", name: "Peer Leader", description: "Lead a school-wide awareness campaign.", icon: "🌟", xp: 500 },
  ],
  nhs: [
    { id: "nhs-1", name: "Inducted", description: "Complete your NHS induction.", icon: "📖", xp: 150 },
    { id: "nhs-2", name: "Tutor Hours", description: "Log 10 peer tutoring hours.", icon: "🧑‍🏫", xp: 200 },
    { id: "nhs-3", name: "Service Leadership", description: "Lead a chapter service project.", icon: "🤝", xp: 300 },
    { id: "nhs-4", name: "Scholarship Applicant", description: "Complete an NHS scholarship application.", icon: "🎓", xp: 250 },
    { id: "nhs-5", name: "Chapter Mentor", description: "Mentor an underclassman through the Mentor Center.", icon: "🌟", xp: 500 },
  ],
  it: [
    { id: "it-1", name: "First Repair", description: "Close your first ticket at the Repair Center.", icon: "🔧", xp: 120 },
    { id: "it-2", name: "On the Air", description: "Run a live broadcast or morning announcement.", icon: "🎥", xp: 250 },
    { id: "it-3", name: "Design Published", description: "Ship a digital design used across campus.", icon: "🎨", xp: 250 },
    { id: "it-4", name: "Certified", description: "Earn an industry certification (ITF+, A+, ...).", icon: "📜", xp: 400 },
    { id: "it-5", name: "Innovation Award", description: "Win an innovation challenge with a built project.", icon: "🏆", xp: 500 },
  ],
  broadcasting: [
    { id: "bc-1", name: "First Shoot", description: "Help film or produce a campus video.", icon: "🎬", xp: 120 },
    { id: "bc-2", name: "Go Live", description: "Participate in a Blue Don Live broadcast.", icon: "📡", xp: 250 },
    { id: "bc-3", name: "Morning Show", description: "Contribute to morning announcements.", icon: "🎙️", xp: 200 },
    { id: "bc-4", name: "Game Day Crew", description: "Crew a live athletic livestream.", icon: "🏀", xp: 300 },
    { id: "bc-5", name: "Producer Credit", description: "Lead a full production as producer.", icon: "🏆", xp: 500 },
  ],
  cricut: [
    { id: "cr-1", name: "First Cut", description: "Complete your first Cricut project.", icon: "✂️", xp: 120 },
    { id: "cr-2", name: "Vinyl Pro", description: "Weed and apply a multi-layer vinyl design.", icon: "🎨", xp: 200 },
    { id: "cr-3", name: "Heat Press", description: "Press HTV apparel for a campus event.", icon: "👕", xp: 250 },
    { id: "cr-4", name: "Fundraiser Merch", description: "Produce items for a club fundraiser.", icon: "💰", xp: 300 },
    { id: "cr-5", name: "Production Lead", description: "Lead a batch production run.", icon: "🏆", xp: 500 },
  ],
  generic: [
    { id: "gen-1", name: "First Meeting", description: "Attend your first club meeting.", icon: "🙌", xp: 100 },
    { id: "gen-2", name: "Active Member", description: "Attend 5 meetings or events.", icon: "✅", xp: 200 },
    { id: "gen-3", name: "Event Contributor", description: "Help run a club event.", icon: "🎉", xp: 250 },
    { id: "gen-4", name: "Officer Track", description: "Take on a leadership responsibility.", icon: "⭐", xp: 300 },
    { id: "gen-5", name: "Club Legend", description: "Complete a full year of active membership.", icon: "🏆", xp: 500 },
  ],
};

/** Level titles by band; a club member climbs this ladder as club XP grows. */
export const CLUB_LEVEL_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 1, title: "Rookie" },
  { minLevel: 4, title: "Contributor" },
  { minLevel: 7, title: "Leader" },
  { minLevel: 10, title: "Veteran" },
  { minLevel: 13, title: "Champion" },
  { minLevel: 16, title: "Legend" },
];

/**
 * Cumulative club XP required to *be at* a given level. Level 1 starts at 0 XP;
 * each level L requires an additional `L * 100` XP to advance to L+1.
 *
 * cumulative(L) = 100 * (L-1) * L / 2
 */
export function cumulativeClubXp(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return (100 * (l - 1) * l) / 2;
}

/** Derives the club level for a given amount of club XP. */
export function clubLevelForXp(xp: number): number {
  let level = 1;
  while (cumulativeClubXp(level + 1) <= xp) {
    level += 1;
  }
  return level;
}

/** Human-friendly title for a club level, e.g. "Leader". */
export function clubLevelTitle(level: number): string {
  let title = CLUB_LEVEL_TITLES[0]?.title ?? "Member";
  for (const band of CLUB_LEVEL_TITLES) {
    if (level >= band.minLevel) {
      title = band.title;
    }
  }
  return title;
}

export function getClubMilestones(clubType: ClubType): ClubMilestone[] {
  return CLUB_MILESTONES[clubType] ?? CLUB_MILESTONES.generic;
}
