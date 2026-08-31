# Sports Highlights

Lisa — the Broadcasting sports desk. Scoreboard banner, sport switcher, opponent
school directory (with logo uploads), highlights, student write-ups, and player
stats. No XP on these surfaces.

## Where to go

| Surface | Route | Who |
|---------|-------|-----|
| Public Sports page | `/sports` | Any signed-in campus user |
| Game detail | `/sports/games/<id>` | Any signed-in campus user |
| Broadcasting Sports tab | `/organizations/broadcasting?tab=sports` | Audience + crew |
| Broadcasting Sports desk | `/organizations/broadcasting?tab=sports-desk` | Crew / officers / admins |
| Watch hub entry point | `/media` → **Sports Highlights** card | Any signed-in campus user |

Sidebar: **Blue Don Sports** (top level) and **Broadcasting → Sports desk**.

## The four things Lisa does

### 1. Import the schools we play (with her own images)

**Sports desk → Opponent directory → Add school.**

Each school takes a logo **upload** (PNG, JPG, WEBP, SVG, up to 4 MB), name,
short name, mascot, city/state, color, and notes. Uploads go to the existing
Supabase campus-media bucket under `sports-schools/…` — the same storage the
video library, Cricut shop, and invoices already use. If storage is not
configured the form falls back to pasting an image URL.

Students never upload or hunt for opponent logos.

#### Bulk import

The 2026 opponent set was loaded from a ZIP of logo art rather than added one at
a time. Two scripts handle it, and both are safe to re-run:

| Step | Command | What it does |
|------|---------|--------------|
| Prepare art | `npm run sports:opponent-logos -- <source-dir>` | Reads the raw slide exports, crops the school-name caption off the bottom, squares each mark, and writes `public/images/sports/opponents/<slug>.png` |
| Import | `npm run sports:import-opponents` | Uploads those marks to `campus-media/sports-schools/schools/import/` and upserts `OpponentSchool` + `OpponentSportTeam` |

School identity, short names, and mascots live in
`scripts/opponent-schools-data.ts` — edit that file to fix a name or add a
school, then re-run the import.

The import never clobbers Lisa's own edits: an existing logo, mascot, or note is
left alone, and matching is by `slug`, so a second run creates nothing new. Pass
`--force` to deliberately re-point logos and metadata back to the manifest, or
`--dry-run` to preview.

Every imported school is linked to football, volleyball, boys/girls basketball,
baseball, and softball, because the source art carried no sport information and
a missing link blocks scheduling. Remove any team that doesn't apply with the
**×** on its chip.

The import also creates the public `campus-media` bucket if the Supabase project
doesn't have one yet — without it every upload fails with "Bucket not found".

### 2. Give each school a team name per sport

**Sports desk → Opponent directory → Link a school to a sport.**

One school can play us in several sports, and the program name is often
different from the school name. Each link stores *their sports name* — for
example school "Indian Creek High School" + sport "Football" → team name
"Indian Creek Football" — plus an optional team-specific logo. When no team
logo is set, the school logo is used.

A school with no sport links shows an amber warning on its card: students
won't see it in a picker until at least one sport is linked.

You can also link the first sport straight from the **Add school** form.

### 3. Post games

**Sports desk → Schedule & scores.** Pick the sport, then **click the opponent**
from the linked-team cards (logo + team name). Set date/time, home/away, venue,
level, status, and scores. Win/loss/tie is derived automatically when a game is
marked Final with both scores.

A one-off opponent text field is still there for invitationals and meets that
aren't a single school.

#### Bulk import from a printed schedule

A whole season off a printed sheet goes in with one script instead of 30 trips
through the form:

| Command | What it does |
|---------|--------------|
| `npm run sports:import-schedule -- --dry-run` | Prints every row it would create, update, or leave alone |
| `npm run sports:import-schedule` | Writes the games |

The 2026 football and volleyball sheets are transcribed in
`scripts/madonna-2026-schedule-data.ts` — dates, Eastern kickoff times,
home/away, and the opponent's directory slug. Edit that file and re-run to fix a
row or add next season.

Times are written as Eastern wall-clock and converted to UTC by the script, so
the November games land on EST and the rest on EDT without anyone doing the
arithmetic. A row whose sheet says TBD is stored at midnight — an obvious
placeholder rather than a plausible tip-off — and its venue tag says "time TBD".

Games are keyed on **sport + Eastern calendar date**, not the exact timestamp,
so a second run fixes a kickoff that went in at the wrong time instead of
scheduling the game twice. A re-run rewrites the schedule facts (kickoff, site,
opponent) but leaves anything Lisa typed — venue, crew note, headline, scores —
alone unless you pass `--force`. Games already marked final, postponed, or
canceled only ever get blanks filled in, so a played game keeps its result, and
dates the sheet doesn't list are never touched.

Opponents missing from the directory are created without a logo, mascot, city,
or state, for the same reason the opponent manifest leaves them blank: a guess
puts wrong details on the scoreboard. The script lists what it created so Lisa
can add logos from the Sports desk.

Byes are deliberately skipped. A bye with no opponent would sit in the upcoming
list and in the broadcast "next game" picker as though it were playable.

### 4. Review what students send in

**Sports desk → Highlight queue** and **Student write-ups.** Publish, feature,
archive, or decline. Crew posts publish immediately; student submissions land as
pending and notify the Broadcasting roster on Command Center
(`SPORTS_COVERAGE`). Authors get a Command Center message when their item is
published or declined.

## What students see and do

- **Banner** across the top of `/sports`: last night's (or most recent) result
  on the left, the next few upcoming games on the right, both clickable.
- **Sport switcher** under the banner — All sports, or one sport at a time.
  Everything below re-renders for that sport.
- **Write about a game**: toggle Recap or Preview, then **click the game** from
  a grid of opponent cards showing the uploaded logo and team name. Recap shows
  completed games; Preview shows upcoming ones. No typing a school name.
- **Send in a highlight**: sport, type (clip / photo / story / reel /
  interview), optional game, title, description, thumbnail upload or image URL,
  video link, and credit.
- **Game detail** (`/sports/games/<id>`): scoreboard header, highlights for that
  game, the player stat table, published write-ups, and both fill-out forms
  pre-pointed at that game.

## Player stats

Rosters live on the Sports desk (name, jersey, position, grade, photo). Stat
lines are per player per game and use a **sport-specific stat sheet** from
`src/config/sports-highlights.ts` — football has passing/rushing/receiving
yards and tackles, volleyball has kills/digs/aces, basketball has
points/rebounds/assists, and so on. Unknown sports get a generic sheet. Stats
render as a table on the game detail page and the Sports desk.

To change or add a stat sheet, edit `SPORT_STAT_FIELDS`.

## Sport list

Seeded on first load (football, volleyball, cross country, soccer, boys/girls
basketball, wrestling, cheer, baseball, softball, track & field, golf). Add,
rename, hide, or reorder from **Sports desk → Sport list**, or re-run
`npm run db:seed:sports`.

## Permissions

| Who | Can |
|-----|-----|
| Any signed-in user | View `/sports`, game pages, highlights, schedule, stats; submit recaps, previews, and highlights |
| Broadcasting crew (`canManageCampusMedia`) | Everything above plus the Sports desk: import schools, upload logos, link sports, post games and scores, publish/feature highlights, approve write-ups, manage rosters and stats |

Same permission check as the rest of the Broadcasting production suite, so
advisors and admins have access automatically.

## Resilience

Every read goes through `withDatabase` and returns an empty list on failure, so
`/sports` and the Broadcasting tabs still render if the tables are missing
mid-deploy or the database connection drops. The banner degrades to an
empty-state card, and the pickers explain what to add next.

## Data model

`prisma/migrations/20260804180000_sports_highlights/`

| Model | Purpose |
|-------|---------|
| `Sport` | Configurable sport list for the switcher |
| `OpponentSchool` | Opponent directory — name, mascot, location, uploaded logo |
| `OpponentSportTeam` | School × sport, with their sports name and optional team logo |
| `SportsGame` | Schedule, scores, result, featured flag, stream link, crew note |
| `SportsHighlight` | Clips, photos, stories, reels; pending/published/archived |
| `SportsGameReport` | Student recaps and previews with review workflow |
| `SportsPlayer` | Roster entries, optionally linked to a campus user |
| `SportsPlayerStat` | One stat line per player per game (`stats` JSON) |

Also adds `SPORTS_COVERAGE` to `StudentMessageKind` for Command Center pings.

## Code map

| Layer | File |
|-------|------|
| Config, stat sheets, labels | `src/config/sports-highlights.ts` |
| Queries and mutations | `src/services/sports-highlights-service.ts` |
| Server actions | `src/features/sports-highlights/actions.ts` |
| Banner / switcher / grid | `src/components/sports/` |
| Student forms | `src/components/sports/sports-student-forms.tsx` |
| Crew desk | `src/components/sports/sports-desk-panels.tsx` |
| Page composition | `src/components/sports/sports-sections.tsx` |
