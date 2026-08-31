/**
 * Madonna's 2026 fall schedules, transcribed from the two printed schedules
 * Lisa handed over: the "2026 Madonna Football Schedule" graphic and the
 * "MADONNA VOLLEYBALL 2026 SCHEDULE" sheet.
 *
 * The printed sheets are the source of truth. Where a sheet's weekday label
 * disagrees with its date, the date wins and the row carries a `sourceNote`.
 *
 * Kickoff times are Eastern wall-clock as printed — the importer converts them
 * to UTC, so DST changes (the November games are EST, the rest EDT) are handled
 * for us rather than baked in here.
 */

export type ScheduleSchoolSeed = {
  slug: string;
  name: string;
  shortName: string;
  /** Sports to link a team for, so the school is pickable on the Sports desk. */
  sports: Array<"football" | "volleyball">;
};

/**
 * Schools on the 2026 sheets that the opponent-directory import never covered.
 *
 * Mascot, city, and state are left blank on purpose — the same call
 * `opponent-schools-data.ts` makes. Guessing them puts wrong details on the
 * scoreboard; Lisa can fill them in from the Sports desk, along with a logo.
 */
export const SCHEDULE_SCHOOLS: ScheduleSchoolSeed[] = [
  {
    slug: "east-hardy",
    name: "East Hardy High School",
    shortName: "East Hardy",
    sports: ["football"],
  },
  {
    slug: "conotton-valley",
    name: "Conotton Valley High School",
    shortName: "Conotton Valley",
    sports: ["football"],
  },
  {
    slug: "clay-battelle",
    name: "Clay Battelle High School",
    shortName: "Clay Battelle",
    sports: ["football", "volleyball"],
  },
  {
    slug: "tucker-county",
    name: "Tucker County High School",
    shortName: "Tucker County",
    sports: ["football"],
  },
  {
    slug: "weir",
    name: "Weir High School",
    shortName: "Weir",
    sports: ["volleyball"],
  },
  {
    slug: "parkersburg-catholic",
    name: "Parkersburg Catholic High School",
    shortName: "Parkersburg Catholic",
    sports: ["volleyball"],
  },
  {
    slug: "wirt-county",
    name: "Wirt County High School",
    shortName: "Wirt County",
    sports: ["volleyball"],
  },
  // The next four only appear as the third team in a tri-match or quad. They get
  // directory entries anyway so Lisa can schedule them head-to-head later.
  {
    slug: "fairmont-senior",
    name: "Fairmont Senior High School",
    shortName: "Fairmont Sr",
    sports: ["volleyball"],
  },
  {
    slug: "john-marshall",
    name: "John Marshall High School",
    shortName: "John Marshall",
    sports: ["volleyball"],
  },
  {
    slug: "fort-frye",
    name: "Fort Frye High School",
    shortName: "Fort Frye",
    sports: ["volleyball"],
  },
  {
    slug: "ritchie-county",
    name: "Ritchie County High School",
    shortName: "Ritchie County",
    sports: ["volleyball"],
  },
];

export type ScheduleRow = {
  /** Calendar date as printed, `YYYY-MM-DD`. Doubles as the upsert key. */
  date: string;
  /** Eastern wall-clock kickoff, `HH:MM` (24h). Null when the sheet says TBD. */
  time: string | null;
  site: "HOME" | "AWAY" | "NEUTRAL";
  /**
   * Directory slug of the opponent. Null for tournaments the sheet lists
   * without a single opponent.
   */
  opponentSlug: string | null;
  /**
   * Shown when there is no opponent school, and kept alongside one for
   * postseason rows so "OVAC Championship" still reads on the scoreboard.
   */
  opponentLabel?: string;
  /**
   * Attach the school but not a per-sport team — for the `ssac-regionals` event
   * mark, which deliberately has no teams.
   */
  useSchoolOnly?: boolean;
  /** Short public tag rendered after the date on `/sports`. */
  venue?: string;
  /** Crew-only detail on the game page. */
  broadcastNote?: string;
  /** Recorded when the printed sheet contradicts itself. */
  sourceNote?: string;
};

/**
 * Football — 10 games. October 9 is a BYE on the sheet and is intentionally
 * absent: a bye with no opponent would sit in the upcoming list and in the
 * broadcast "next game" picker as if it were playable.
 */
export const FOOTBALL_2026: ScheduleRow[] = [
  {
    date: "2026-08-28",
    time: "19:00",
    site: "AWAY",
    opponentSlug: "east-hardy",
  },
  {
    date: "2026-09-04",
    time: "19:00",
    site: "HOME",
    opponentSlug: "van-high-school",
  },
  {
    date: "2026-09-11",
    time: "18:00",
    site: "AWAY",
    opponentSlug: "southern-high-school",
    broadcastNote: "Printed as Southern Garrett. 6:00 kickoff, an hour earlier than the rest of the season.",
  },
  {
    date: "2026-09-18",
    time: "19:00",
    site: "AWAY",
    opponentSlug: "conotton-valley",
  },
  {
    date: "2026-09-24",
    time: "19:00",
    site: "HOME",
    opponentSlug: "matthews-mustangs",
    venue: "Oak Glen · Madonna home game",
    broadcastNote: "Thursday game. Listed home but played at Oak Glen.",
  },
  {
    date: "2026-10-02",
    time: "19:00",
    site: "HOME",
    opponentSlug: "calhoun-high-school",
    venue: "Homecoming",
    broadcastNote: "Homecoming.",
  },
  {
    date: "2026-10-16",
    time: "19:00",
    site: "AWAY",
    opponentSlug: "david-anderson-high-school",
    broadcastNote: "Printed as Lisbon.",
  },
  {
    date: "2026-10-23",
    time: "19:00",
    site: "HOME",
    opponentSlug: "leetonia",
  },
  {
    date: "2026-10-29",
    time: "19:00",
    site: "HOME",
    opponentSlug: "clay-battelle",
    broadcastNote: "Thursday game.",
  },
  {
    date: "2026-11-06",
    time: "19:00",
    site: "AWAY",
    opponentSlug: "tucker-county",
  },
];

/**
 * Volleyball — 23 rows, including the quads, tri-matches, and the postseason
 * placeholders. Multi-team dates stay one row each, matching the sheet: the
 * extra school is named in the venue tag and the crew note.
 */
export const VOLLEYBALL_2026: ScheduleRow[] = [
  {
    date: "2026-08-20",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "clay-battelle",
    venue: "Clay Battelle · tri-match w/ Fairmont Sr",
    broadcastNote: "Tri-match at Clay Battelle with Fairmont Sr.",
  },
  {
    date: "2026-08-22",
    time: "09:00",
    site: "NEUTRAL",
    opponentSlug: null,
    opponentLabel: "Country Roads Classic",
    venue: "Oak Glen · Country Roads Classic",
    broadcastNote: "All-day tournament at Oak Glen. Bracket sets the opponents.",
  },
  {
    date: "2026-08-25",
    time: "18:00",
    site: "HOME",
    opponentSlug: "steubenville-catholic-central",
  },
  {
    date: "2026-08-27",
    time: "18:00",
    site: "HOME",
    opponentSlug: "valley-wetzel",
  },
  {
    date: "2026-09-01",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "brooke",
    venue: "Brooke · quad w/ Linsly & John Marshall",
    broadcastNote: "Quad at Brooke with Linsly and John Marshall.",
  },
  {
    date: "2026-09-03",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "trinity-christian",
    venue: "Trinity · tri-match w/ Notre Dame",
    broadcastNote: "Tri-match at Trinity with Clarksburg Notre Dame.",
  },
  {
    date: "2026-09-08",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "toronto",
  },
  {
    date: "2026-09-10",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "parkersburg-catholic",
    venue: "Parkersburg Catholic · tri-match w/ Fort Frye",
    broadcastNote: "Tri-match at Parkersburg Catholic with Fort Frye.",
  },
  {
    date: "2026-09-15",
    time: "18:00",
    site: "AWAY",
    opponentSlug: "steubenville-catholic-central",
  },
  {
    date: "2026-09-17",
    time: "18:00",
    site: "AWAY",
    opponentSlug: "magnolia",
    venue: "Magnolia · tri-match w/ St. Mary's",
    broadcastNote: "Tri-match at Magnolia with St. Mary's.",
  },
  {
    date: "2026-09-23",
    time: "18:00",
    site: "AWAY",
    opponentSlug: "valley-wetzel",
    sourceNote: "Sheet labels this Thursday, but 9/23/2026 is a Wednesday — date kept as printed.",
  },
  {
    date: "2026-09-24",
    time: "17:30",
    site: "HOME",
    opponentSlug: "trinity-christian",
    venue: "Tri-match w/ Ritchie County",
    broadcastNote: "Home tri-match with Ritchie County.",
  },
  {
    date: "2026-09-26",
    time: "10:00",
    site: "AWAY",
    opponentSlug: "wirt-county",
    venue: "Wirt County quad",
    broadcastNote: "Saturday quad hosted by Wirt County.",
  },
  {
    date: "2026-09-29",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "weir",
    venue: "Weir · tri-match w/ Oak Glen",
    broadcastNote: "Tri-match at Weir with Oak Glen.",
  },
  {
    date: "2026-10-01",
    time: "17:30",
    site: "HOME",
    opponentSlug: "toronto",
  },
  {
    date: "2026-10-05",
    time: "17:30",
    site: "HOME",
    opponentSlug: "weir",
    venue: "City Championship",
    broadcastNote: "City Championship against Weir.",
  },
  {
    date: "2026-10-06",
    time: "17:30",
    site: "HOME",
    opponentSlug: "cameron",
  },
  {
    date: "2026-10-13",
    time: null,
    site: "NEUTRAL",
    opponentSlug: null,
    opponentLabel: "OVAC Semifinal",
    venue: "OVAC Semifinal · time TBD",
    broadcastNote: "Time and opponent set by the OVAC bracket.",
    sourceNote: "Sheet labels this Wednesday, but 10/13/2026 is a Tuesday — date kept as printed.",
  },
  {
    date: "2026-10-17",
    time: null,
    site: "NEUTRAL",
    opponentSlug: null,
    opponentLabel: "OVAC Championship",
    venue: "OVAC Championship · time TBD",
    broadcastNote: "Time and opponent set by the OVAC bracket.",
  },
  {
    date: "2026-10-19",
    time: "17:30",
    site: "HOME",
    opponentSlug: "clay-battelle",
    venue: "Tri-match w/ Parkersburg Catholic",
    broadcastNote: "Home tri-match with Parkersburg Catholic.",
  },
  {
    date: "2026-10-20",
    time: "17:30",
    site: "AWAY",
    opponentSlug: "cameron",
  },
  {
    date: "2026-10-26",
    time: null,
    site: "NEUTRAL",
    opponentSlug: "ssac-regionals",
    opponentLabel: "WVSSAC Regionals",
    useSchoolOnly: true,
    venue: "WVSSAC Regionals · Oct 26–Nov 5 · time TBD",
    broadcastNote:
      "Regional window runs Oct 26 through Nov 5. Placed on the opening day until the WVSSAC sets the date.",
  },
  {
    date: "2026-11-10",
    time: null,
    site: "NEUTRAL",
    opponentSlug: "ssac-regionals",
    opponentLabel: "WVSSAC State Tournament",
    useSchoolOnly: true,
    venue: "WVSSAC State Tournament · Nov 10–12 · time TBD",
    broadcastNote:
      "State tournament runs Nov 10 through Nov 12. Placed on the opening day until the WVSSAC sets the date.",
  },
];

export const SCHEDULES: Array<{ sportSlug: string; label: string; rows: ScheduleRow[] }> = [
  { sportSlug: "football", label: "Football", rows: FOOTBALL_2026 },
  { sportSlug: "volleyball", label: "Volleyball", rows: VOLLEYBALL_2026 },
];
