# Broadcast Control Studio

MHS Broadcasting's full-screen production console for Studio B. This is the
operator surface that eventually drives OBS, graphics, audio, and the
scoreboard. It lives outside the campus shell so it reads as broadcast
hardware, not a SaaS dashboard.

**Status: Phase 7 shipped — the console reads campus data, writes the game
score, drives OBS through the Studio Bridge, takes graphics to an OBS Browser
Source overlay, drives today's rundown, and runs a sponsor book.** The
Daktronics feed, real audio metering, source tally, and broadcaster role UIs
are **not approved**. Do not build them without sign-off.

## Route

| Route | Group | Access |
| --- | --- | --- |
| `/broadcast/studio` | `src/app/(studio)` | Campus access + `canManageCampusMedia` |
| `/broadcast/overlay/[sessionKey]` | `src/app/(overlay)` | **Public by necessity** — an OBS Browser Source cannot log in. Guarded by the session key alone; see [Graphics and the overlay](#graphics-and-the-overlay-phase-6) |
| `/api/broadcast/studio/state` | `src/app/api` | Same crew check, same-origin console polling; `?gameId=` pins the game the operator picked |
| `/api/broadcast/overlay/[sessionKey]` | `src/app/api` | Public, same key. What the overlay polls; `404` for any key that is not a live overlay |
| `/api/studio/bridge/commands` | `src/app/api` | **Agent only.** Bearer `STUDIO_BRIDGE_TOKEN`; claims queued commands |
| `/api/studio/bridge/state` | `src/app/api` | **Agent only.** Bearer `STUDIO_BRIDGE_TOKEN`; posts OBS telemetry and command results |

- The `(studio)` route group has its own dark layout (`src/app/(studio)/layout.tsx`)
  with no campus sidebar, header, or mobile nav — full-bleed `#050B14` chrome
  oriented at a 1920 × 1080 operator display.
- The page gate is `requireCampusAccess()` followed by `canManageCampusMedia()`,
  the same crew check the Control Room uses. Non-crew are redirected to
  `/organizations/broadcasting?tab=media`.
- The `(overlay)` route group (`src/app/(overlay)/layout.tsx`) has no chrome at
  all: `overlay.css` forces a transparent `html` / `body`, hides the cursor, and
  suppresses the PWA install prompt, so OBS composites the graphics straight
  over the program feed. `/broadcast/overlay/` is on `PUBLIC_ROUTES` in
  `src/lib/supabase/middleware.ts` — without that, OBS would render the login
  page on air.
- `/broadcast` is on `FOCUSED_MODE_ALLOWED_PREFIXES`
  (`src/config/focused-clubs-allowlist.ts`) so focused clubs mode does not
  soft-wipe the console.

## What each panel shows

Every "live" cell below traces to a row that already exists in the campus
database. Panels with no data source stay explicitly staged and carry a phase
badge, so an operator never has to guess which readouts are real.

| Region | Panel | Source | Behavior |
| --- | --- | --- | --- |
| Header | On-air lamp | `CampusMediaItem` + `BroadcastSchedule` | **LIVE** when a `LIVE_STREAM` row has status `LIVE`; **PREVIEW** inside ±`STUDIO_PREVIEW_WINDOW_MINUTES` (15) of the scheduled air time; otherwise **OFF AIR** |
| Header | Program / elapsed / clock | `CampusMediaItem` | Program title from the on-air row; elapsed counts from `publishedAt` (falls back to `createdAt`); wall clock ticks client-side |
| Header | Next air | `BroadcastSchedule.nextAirAt` | Live countdown plus the campus-local air time |
| Header | Event | live stream → `SportsGame` → schedule title | "What are we covering" — the on-air title if live, else a current/next game, else the scheduled show title |
| Header | Sync lamp | poll result | "Synced 3s ago", or "Sync stalled" when a read fails |
| Left | Scenes | `StudioBridge` telemetry | **Read and write.** Real OBS scene names with PGM / PVW state, per-scene Preview and Take Live keys, and a separate transition key. Falls back to the configured names, disabled, when the bridge is down |
| Left | Crew | `BroadcastCrewCredit` | Visible credit roll with production role labels; links to the club's credit roll when empty |
| Left | System health | env + `CampusMediaItem` + `StudioBridge` | **Campus stream record** (On air / Idle), **RTMP ingest** (Key set / No key), **Studio bridge** (Connected / Disconnected / Never paired / Not set up), **OBS WebSocket** (Connected / No OBS), **Encoder** (measured kbps + dropped frames while streaming). Scoreboard and disk stay "Not linked" |
| Left | OBS stream target | `revealStreamCredentialsAction` | Crew-gated reveal, unchanged from Phase 2 |
| Center | PROGRAM | `CampusMediaItem.embedUrl` | Real viewer embed when the on-air row has one, black slate otherwise; footer credits the operator who started the stream |
| Center | Graphics | `StudioGraphic` + `SportsGame` + `SportsPlayer` + `StudioSponsor` | **Read and write.** Nine graphic kinds with editable copy, Preview / Take live / Remove, PVW and PGM monitors rendering the real overlay components, the Browser Source URL, and an overlay-attached lamp |
| Center | Sponsors | `StudioSponsor` (+ `Partner`) | **Read and write.** The sponsor book with Preview / Take live / Remove per row against the strap or the full billboard, a Next key, console-side auto-advance, and add / edit / remove including adopting a campus partner |
| Center | Sources / Audio | static config | Tile and fader labels only |
| Right | Game control | `SportsGame` | **Read and write.** Game picker, away/home labels with opponent logos, scores with per-sport quick keys, and `SCHEDULED / LIVE / FINAL` status. Clock and period are console-only. Reads MANUAL MODE — no Daktronics |
| Right | Run of show | `BroadcastDailyScript` + `BroadcastScriptTemplate` + `StudioRunOfShow` | **Read and write.** Today's rundown with the **filled values** rendered per slot, driven with Back / Advance / jump, a per-item `Pending / Ready / On air / Done / Skipped` state, and a segment timer |
| Footer | GO LIVE / START RECORD / END BROADCAST | `startStudioBroadcastAction` / `endStudioBroadcastAction` / command queue | GO LIVE and END BROADCAST write the campus record **and** queue OBS start / stop when the bridge is up. START RECORD toggles the OBS recording and is disabled without the bridge |

GO LIVE and END BROADCAST write the same `CampusMediaItem` record the Control
Room does — one source of truth for "are we on air" — and separately ask OBS to
start or stop streaming. The two outcomes are reported on separate lines, so an
operator is never told OBS was touched when it was not.

## Game control (Phase 4)

The score an operator types in Studio B is the score the campus sees, because
both are the same `SportsGame` row. There is no console-side scoreboard table.

| Control | Writes | Notes |
| --- | --- | --- |
| Game picker | nothing | Chooses which game the console is pointed at: live games first, then kickoffs from the last 6 hours through the next 36 |
| Score quick keys | `SportsGame.teamScore` / `opponentScore` | Per sport: football `+1 +2 +3 +6`, basketball and wrestling `+1 +2 +3`, everything else `+1`. Every side also gets `−1` and `0` for corrections |
| Status | `SportsGame.status` (+ `result`) | `SCHEDULED / LIVE / FINAL` only. Postponed and canceled stay with the Sports Desk because those are schedule decisions, not in-broadcast ones |
| Clock / period | **nothing** | Session-local (see below) |

- `SportsGame` stores scores campus-relative (`teamScore` is the Blue Dons).
  The console shows home and away, so `StudioScoreboardState.campusIsHome`
  records the mapping and the panel converts a home/away tap to the right column
  before saving.
- Setting a game `FINAL` with both scores in derives `result` (win / loss / tie)
  through the same helper `upsertGame` uses, so a console final and a Sports Desk
  final produce identical rows.
- `setGameScore()` (`src/services/sports-highlights-service.ts`) touches only
  score, status, and result. It deliberately does **not** reuse `upsertGame`,
  which needs the whole schedule form (sport, kickoff, opponent, site) and would
  let the console overwrite scheduling fields it never displays.
- Permission is `canManageSportsDesk`, which is `canManageCampusMedia` — the same
  crew check that gates the page and the polling endpoint. It is re-checked
  inside the service on every write.
- Writes are single-operator by design: last write wins, and a second console
  sees the new score on its next poll (~5 s).
- Score edits still work from the Sports Desk. Both surfaces revalidate
  `/sports`, `/media`, `/organizations/broadcasting`, `/home`, and the studio.

### Clock and period are session-local

No campus table stores a game clock, and Phase 1 recommended against adding one.
So `useStudioGameClock` (`src/components/studio/use-studio-game-clock.ts`) keeps
period and clock in `sessionStorage`, keyed per game: it survives a refresh,
follows the operator when they switch games in the picker, and is gone when the
tab closes. Nothing about it reaches the database, and the panel labels it
"Clock · console only" so nobody mistakes it for published state. **Phase 4 added
no Prisma columns.**

### Honesty rule

The console never claims a status it cannot measure. There is no fake telemetry:
health rows without a data source read "Not linked", game control reads `--` for
a score nobody has entered, and the run of show says "no one has saved today's
rundown yet" instead of showing invented timings. Planned segment durations are
deliberately absent because no schema stores them.

Game control reads **MANUAL MODE**, never "scoreboard connected". Nothing is
linked to the Daktronics board — a person is typing the score — and the System
Health scoreboard row still reads "Not linked".

Phase 5 extends the rule to OBS. "Connected" is derived from **how recently the
agent reported**, never from a stored flag, so an agent that dies mid-show reads
DISCONNECTED and drags the OBS and encoder rows down with it. The audio faders
are still config, not measurement, and the panel now says so.

Phase 6 extends it again to the overlay: "attached" means a Browser Source
actually asked for the state inside the last 25 seconds.

Phase 7 keeps it in two more places. The run of show reports where the crew
actually is — an item is "on air" because somebody pressed it, and the segment
timer counts from that press, turning amber past 15 minutes rather than
implying a long segment was intended. And sponsor auto-advance is labelled as
running **from this console tab**, because nothing on the campus schedules a
rotation; close the tab and it stops, which the panel says out loud.

## Studio Bridge (Phase 5)

The campus runs on Vercel and cannot dial the Studio B PC through the school's
NAT, and opening a port for it would be the wrong answer at a school. So control
is inverted: the console **writes a command row**, and a small agent on the OBS
machine polls for it, runs it, and posts telemetry back.

```
Studio console  ──writes StudioCommand──►  Campus (Vercel + Postgres)
                                                  ▲          │
                                          posts   │          │  polls every 3 s
                                       telemetry  │          ▼
                                          Studio Bridge agent ──► OBS (localhost)
```

Advisor install: **[STUDIO_BRIDGE_SETUP.md](./STUDIO_BRIDGE_SETUP.md)**.

### What that buys and what it costs

- Control lands within about one poll — three seconds or less. Good enough for
  scene changes and transport, which is exactly why Phase 5 does not attempt a
  hardware-feel video switcher.
- Commands are **never queued into the void**. If the agent is not fresh, the
  service refuses the write and the console says why. A scene taken four minutes
  late is worse than a scene not taken, so a queued command that goes unclaimed
  for `STUDIO_COMMAND_TTL_MS` (45 s) becomes `EXPIRED`, and a claimed command the
  agent never reports on becomes `FAILED`.
- Nothing is fire-and-forget. Every command carries who pressed it and ends in
  `DONE`, `FAILED`, or `EXPIRED`, and the newest failure is shown in the Scenes
  panel.

### The whitelist

Seven command kinds, and nothing else can exist: `StudioCommandKind` is a
Postgres enum, so the database cannot hold an arbitrary OBS request, and the
agent's `COMMAND_HANDLERS` map whitelists the same seven again before touching
OBS. Payloads never become request bodies — each handler picks its own OBS call
and its own arguments.

| Kind | OBS request | Guard |
| --- | --- | --- |
| `SET_PROGRAM_SCENE` | `SetCurrentProgramScene` | Scene must be in the list OBS just reported |
| `SET_PREVIEW_SCENE` | `SetCurrentPreviewScene` | Same, plus Studio Mode on |
| `TRIGGER_TRANSITION` | `TriggerStudioModeTransition` | Studio Mode on |
| `OBS_START_STREAM` | `StartStream` | Transport gate (below); no-op if already streaming |
| `OBS_STOP_STREAM` | `StopStream` | Transport gate; no-op if not streaming |
| `OBS_START_RECORD` | `StartRecord` | No-op if already recording |
| `OBS_STOP_RECORD` | `StopRecord` | No-op if not recording |

Scene names are checked against live telemetry twice — once server-side in
`queueStudioCommand`, once again in the agent — so a stale console cannot push a
name OBS does not have.

### Token

`STUDIO_BRIDGE_TOKEN` is a server-only shared secret, minimum 24 characters. It
never reaches a browser: the console queues commands through a server action, so
only the server and the agent ever hold it.

- **Constant-time compare.** Both sides are SHA-256'd first, so the comparison
  runs over two fixed-length digests — `timingSafeEqual` cannot throw on a
  length mismatch, and the real token's length does not leak through timing.
- **Hashed at rest.** Only the digest is stored, on `StudioBridge.tokenHash`, so
  a rotation is visible in the database without the database ever holding the
  secret.
- Below 24 characters the value is treated as unset and both agent routes answer
  `503 Studio bridge is not configured`.

### Who can do what

Everything in the studio already needs `canManageCampusMedia`. Phase 5 narrows
the two destructive transport commands — `OBS_START_STREAM` and
`OBS_STOP_STREAM` — to people accountable for the broadcast:
campus admins and advisors, Broadcasting officers, or anyone credited
`PRODUCER` / `FLOOR_DIRECTOR` on the roll (`canRunStudioTransport`). A plain
Broadcast Academy member still runs the console and switches scenes but cannot
pull the stream down. The gate is enforced in `queueStudioCommand`, not only in
the action.

### With the bridge up vs down

| Control | Bridge up | Bridge down |
| --- | --- | --- |
| Scene Preview / Take Live / transition | Queues the command; OBS follows within ~3 s | Disabled; panel shows the configured names greyed and says to switch in OBS |
| START / STOP RECORD | Toggles the OBS recording, labelled with the record timecode | Disabled with a reason on hover |
| GO LIVE | Writes the campus record **and** queues `OBS_START_STREAM` | Writes the campus record; console says to start OBS by hand |
| END BROADCAST | Ends the campus record **and** queues `OBS_STOP_STREAM` | Ends the campus record; console says to stop OBS by hand |
| System health · bridge / OBS / encoder | Real telemetry, including measured kbps and dropped frames | DISCONNECTED / Not linked |
| Game control, run of show, crew, countdown | Unaffected — none of it goes through OBS | Unaffected |

The campus `CampusMediaItem` record is deliberately independent of OBS. "Are we
on air" is a campus fact the whole site reads; whether the encoder is pushing
bytes is a Studio B fact. Phase 5 keeps them separate and reports them
separately.

### What the agent may say

The telemetry schema is narrow on purpose: scene names, program / preview,
Studio Mode, streaming and recording flags with timecodes, and encoder counters.
No file paths, no stream key, no OBS password. Bitrate is **derived** from the
`outputBytes` delta between polls rather than invented, and is null until two
samples exist.

## Graphics and the overlay (Phase 6)

Graphics do not go through the bridge. OBS renders them itself, from a **Browser
Source** pointed at a page on the campus site, and the console changes what that
page shows by writing a row.

```
Studio console  ──writes StudioGraphic──►  Campus (Vercel + Postgres)
   (crew-gated)                                        │
                                                       │  polls every 1 s
                                                       ▼
                                    /broadcast/overlay/<sessionKey>  ──► OBS Browser Source
                                          (public, key-guarded)
```

Setup for the Studio B PC: **[STUDIO_OVERLAY_SETUP.md](./STUDIO_OVERLAY_SETUP.md)**.

Two reasons it is a pull rather than a bridge command: a Browser Source is
already a browser, so it can fetch on its own; and rendering has to survive the
agent being down. If the bridge dies mid-show the operator loses scene control
but keeps their lower thirds.

### The URL is the credential

An OBS Browser Source cannot log in — there is no place to type a password and
no session to carry. So the overlay is unauthenticated, and the protection is
that the URL is unguessable: `StudioOverlay.sessionKey` is
`STUDIO_OVERLAY_KEY_BYTES` (24) of `randomBytes`, base64url, 32 characters.

- The key is rendered **once**, into the crew-gated console page. It is
  deliberately **not** in `StudioConsoleSnapshot`, which is re-polled every five
  seconds and easy to leave open on a shared screen.
- **Rotate** in the Graphics panel issues a new key and orphans the old URL
  instantly. That is the recovery if a URL is ever shared or a laptop walks off;
  the cost is re-pasting the URL into OBS.
- The page and the API both send `noindex, nofollow` and `Cache-Control:
  no-store`, and an unknown key gets a flat `404` rather than a hint.
- Nothing on the overlay is more sensitive than what `/sports` already publishes:
  roster names, numbers, positions, and scores. No stream key, no OBS password,
  no bridge token, and no student data the Sports Desk has not already posted.

### What is on air is one row per region

The frame is divided into three regions, and **one graphic per region can be
live**. Taking a player ID replaces the lower third rather than stacking on it,
and a full-screen card can never land underneath a name strap. `saveStudioGraphic`
clears the outgoing sibling and writes the new graphic in a single transaction.

| Kind | Region | Fills from |
| --- | --- | --- |
| Lower third | Lower | Typed: name, title / role, secondary line |
| Player ID | Lower | `SportsPlayer` picker for the selected game, then editable |
| Announcement | Lower | Typed: headline, second line, tag |
| Sponsor strap | Lower | `StudioSponsor` picked from the book, or typed for a one-off |
| Sponsor billboard | Full | Same, full frame with the logo — the break card |
| Score bug | Bug | `SportsGame` + the console clock / period |
| Starting lineup | Full | `SportsPlayer` roster, hand-picked into up to 12 rows |
| Game announcement | Full | `SportsGame` matchup, site, kickoff |
| Final score | Full | `SportsGame` final |

`STUDIO_GRAPHIC_DEFS` is keyed by the Prisma `StudioGraphicKind` enum, so adding
a kind to the schema without teaching the console what it looks like is a type
error rather than a blank graphic on air.

### Preview, Take live, Remove

| Key | Does | Visible on air |
| --- | --- | --- |
| **Preview** | Saves the copy as `PREVIEW` and renders it in the PVW monitor | No |
| **Take live** | `PREVIEW → LIVE`, clearing whatever shared the region | Yes, within ~1 s |
| **Update on air** | Replaces **Preview** while a graphic is live: rewrites the copy in place without blanking the screen | Yes, in place |
| **Remove** | `LIVE → CLEARED`. The copy is kept, so it can be re-taken as typed | Pulled within ~1 s |
| **Clear all** | Every live graphic off in one write. Cued copy is untouched | All pulled |

Both console monitors render the **same components** the overlay does, at the
same aspect, so PVW is what actually goes out — not an approximation of it.

### The score is never copied

Score, lineup, final, and game-announcement cards store a `gameId`, not a score.
`getStudioOverlayPayload` resolves `SportsGame` on every poll, so the bug on
screen and the score on `/sports` are the same number by construction: correcting
a score in Game control fixes the graphic on air one second later, and there is
no second scoreboard to disagree with.

The clock is the exception, because no campus table stores one — it stays
session-local (see above). The console pushes an **anchor** instead: seconds
remaining, running or stopped, and the instant it was read. The overlay counts
down from that anchor itself, so a running clock costs one write when it starts
and one when it stops, not one per second.

### Overlay attached, or not

The honesty rule extends to the Browser Source. Every overlay read stamps
`lastSeenAt` (throttled to `STUDIO_OVERLAY_HEARTBEAT_INTERVAL_MS`, 8 s), and the
console calls the overlay attached only if that stamp is inside
`STUDIO_OVERLAY_ONLINE_WINDOW_MS` (25 s). Close the Browser Source and the panel
says so within half a minute. It is derived from a real request, never from a
stored flag — so an operator can tell "nothing is cued" apart from "OBS is not
looking at us."

## Run of show (Phase 7)

The rundown was readable in Phase 3. Phase 7 makes it operable without moving
where the words live: the script is still the Daily Rundown's
`BroadcastDailyScript`, and the console stores **only the crew's position in
it**. Items are referenced by slot key, so there is no second copy of the show
to fall out of sync, and a slot deleted from the template simply stops being
referenced.

### The five states

| State | Means | Set by |
| --- | --- | --- |
| **Pending** | Nobody has touched it. Still shows the Phase 3 `Filled / Needed / Open / Prayer / Fixed` chip | default |
| **Ready** | Prepped ahead of air | the row's check key |
| **On air** | The item being read right now. Exactly one, ever — it is the row's `currentKey`, not a per-item flag | Advance, Start, or tapping the item |
| **Done** | Advanced past | Advance |
| **Skipped** | Not being read tonight. Advance walks over it | the row's skip key |

### The keys

| Key | Does |
| --- | --- |
| **Start show** | Puts the first non-skipped item up and stamps the show start |
| **Advance** | Marks the current item **Done** and moves to the next non-skipped one. Advancing off the end ends the show |
| **Back** | Returns to the previous item and **un-completes** it; the item being left drops back to pending, because nothing after that point has happened yet |
| **Tap an item** | Jumps straight to it without disturbing anything else — and un-skips it, since picking it is saying it is being read |
| **Check** | Toggles Ready |
| **Skip** | Toggles Skipped. Skipping what is on air advances |
| **Reset** | Clears today's progress. **The script is untouched** |

The filled script line stays visible under every item whatever its state, and
the item on air shows its line in full rather than truncated — the panel is
what the operator is reading from, so hiding the words to save space would
defeat it.

### The segment timer

`itemStartedAt` is stamped whenever the current item changes, and the panel
counts up from it in `m:ss`. Past `STUDIO_SEGMENT_LONG_SECONDS` (15 minutes)
the chip turns amber, because a rundown item up for a quarter of an hour is a
forgotten advance rather than a long segment. Nothing writes per second: the
timestamp is one column and the browser does the counting.

### Shared, soft-failing, crew-gated

Progress is one row per studio per day, so a second console sees the same
position within a poll (~5 s) — this is shared state, not a per-browser view,
which is the point when the producer and the director are on different
machines. It is still last-write-wins; real multi-operator sync is Phase 8+.
Ordering is resolved **server-side** from today's script on every press, so a
console left open across a template edit cannot advance into a slot that no
longer exists. Permission is `canManageCampusMedia`, re-checked inside the
service. If the write fails the console says so and the script is unaffected.

## Sponsors (Phase 7)

Phase 6 had one hand-typed sponsor strap. Phase 7 gives the club a **book**: a
list of sponsors with logos, rotation order, and a billboard duration, and two
places to put one on air.

### The card is never a copy

A sponsor graphic stores a `sponsorId`, exactly as a score bug stores a
`gameId`. `StudioSponsor` is resolved on every overlay poll, so fixing a
misspelled sponsor name or swapping a logo in the book fixes what is on air
within a second, and there is no second list of businesses to disagree with.

### Adapter, not a second directory

The campus already keeps `Partner` — approved local businesses with names and
logos. A sponsor can **adopt** one (`StudioSponsor.partnerId`), which fills the
name and logo from that row instead of retyping them. What `StudioSponsor` adds
is the part a directory has no business holding: rotation order, how long a
billboard sits, and whether the sponsor is in tonight's book. A sponsor with no
partner is fine — not every advertiser is in the directory.

### Controls

| Key | Does |
| --- | --- |
| **Strap / Billboard** | Which region the keys act on: the lower strap during the show, or the full-frame break card |
| **Preview** | Cues that sponsor into the chosen region. Nothing changes on air |
| **Take live** | Puts it on the overlay within ~1 s and stamps `lastLiveAt` |
| **Remove** | Pulls that region |
| **Next sponsor** | Takes the next **active** sponsor in book order, wrapping at the end |
| **Auto** | Advances on the current sponsor's duration — **from this console tab only** (see the honesty rule) |
| **Add / edit / remove** | Maintains the book. Removing a sponsor that is on air is refused; take it off first |

Region rules are Phase 6's, unchanged: the strap shares the lower third with
lower thirds and player IDs, and the billboard shares the full frame with
lineups and final scores, so a take replaces rather than stacks.

### What is deliberately absent

No impression counts, no per-spot reporting, no scheduling by daypart.
`lastLiveAt` exists so an operator can see which sponsor has waited longest;
it is a timestamp, not analytics. The sponsor book is capped at
`STUDIO_SPONSOR_MAX` (40) — a season's sponsors, not an ad server.

Logo URLs are stored only if they parse as absolute `http(s)` URLs, because an
unauthenticated page renders them. They are `<img>` rather than `next/image`,
the same call the opponent logos make: allowlisting every local business's host
in `next.config` is not workable.

## Data flow and refresh

- `getStudioConsoleSnapshot()` (`src/services/broadcast-studio-service.ts`)
  builds one serializable `StudioConsoleSnapshot` from eight reads in parallel:
  `getActiveLiveStream()`, `getBroadcastSchedule()`, `listCrewCredits()`,
  `getCurrentOrNextGame()`, `listCoverableGames()`,
  `getStudioBridgeSnapshot()`, `getStudioGraphicsState()`, and
  `listStudioSponsors()` — then `getTodaysBroadcastScript()` and, once its slot
  keys are known, `getStudioRunProgress()`.
- `getStudioConsoleSnapshot({ gameId })` pins the readout to the game the
  operator picked; without it the console falls back to the automatic choice (an
  in-progress game, else the next one inside 36 hours). While a game is pinned
  the polled snapshot always wins over the server-rendered one, since it is the
  only read carrying the pin.
- Every read is soft-fail: each service already routes through `withDatabase`,
  and the snapshot wraps each promise in its own `catch` so one missing table
  degrades a single panel instead of blanking the console.
- The server page renders the first snapshot. `StudioConsole`
  (`src/components/studio/studio-console.tsx`) then polls
  `/api/broadcast/studio/state` every `STUDIO_POLL_INTERVAL_MS` (5 s) so on-air
  state, the countdown, the rundown, and the score follow the database without
  a page reload. Polling pauses while the tab is hidden and reads immediately on
  return.
- The newer of the server snapshot and the polled snapshot wins, so a route
  revalidation after GO LIVE is never overwritten by an in-flight older read.
- A score write and the poll race each other, so the console holds the saved
  score (returned by the action) until a read that started **after** the write
  lands. A tap never appears to bounce back to the old number.
- Clock, elapsed timer, and countdown tick locally once per second from one
  shared ticker (`src/components/studio/studio-time.ts`), so the console feels
  instant without polling every second.
- No realtime stack, no websockets, no new dependency.

## Stream credentials

Stream keys are **not** serialized into client props anywhere.

- `src/config/broadcast-media.ts` splits two shapes:
  - `BlueDonLiveRtmpPublicConfig` — `hasSharedStreamKey`, hint text, OBS
    checklist, scene tips. Safe to pass server → client.
  - `BlueDonLiveStreamSecrets` — ingest URL and stream key. Server only.
- `CampusMediaItemView` (`src/services/media-service.ts`) does not select or
  return `streamKey`, so `/media`, the org media panels, and the video library
  cannot leak it to the campus audience.
- `StudioConsoleSnapshot` carries no credentials either — the console polls it
  every few seconds, so it only holds display state.
- Crew fetch credentials on demand through `revealStreamCredentialsAction()`,
  which re-checks `canManageCampusMedia` server-side and returns the live
  session key when a stream is on air, otherwise the shared school key.
- UI entry point is `StreamTargetReveal`
  (`src/components/media/stream-target-reveal.tsx`), used by both the campus
  Control Room panel and the studio System Health panel.

Environment: `BLUE_DON_LIVE_RTMP_URL`, `BLUE_DON_LIVE_STREAM_KEY`, and
`STUDIO_BRIDGE_TOKEN` (all server-only, never `NEXT_PUBLIC_`).

The bridge does not change this. `StudioConsoleSnapshot.bridge` carries scene
names and counters only, the agent never reads OBS's stream key, and
`STUDIO_BRIDGE_TOKEN` stays server-side because commands are queued through a
server action rather than a browser fetch.

## Entry points

- Sidebar → Broadcasting → **Broadcast Studio**
- Broadcasting org page header → **Broadcast Studio** (crew only)
- Control Room tab (`/organizations/broadcasting?tab=media`) → **Go live** panel, step 1 → **Open Broadcast Studio**
- Control Room tab → **Advanced · Advisor setup** card (collapsed) → **Open Broadcast Studio**
- Watch Broadcasting LIVE (`/watch`, public, no login)
- Watch Broadcasting hub (`/media`) and `/madonna/broadcast` → **Go live** panel, step 1
- Phone studio (`/broadcast/phone`) — in-app camera, no OBS required

## Students do not start here

The console is the advisor / game-caller surface. A student running Morning
Announcements works the five-step **Go live** panel on the campus surfaces
instead, and never sees an RTMP URL or stream key unless they open
**Advanced · Advisor setup**. That path is documented in
[`STUDENT_GO_LIVE.md`](./STUDENT_GO_LIVE.md); nothing on this page changed to
make it possible.

## Data model

Phases 2, 3, and 4 added **no Prisma models and no migration**. The console
reads `CampusMediaItem`, `BroadcastSchedule`, `BroadcastDailyScript`,
`BroadcastScriptTemplate`, `BroadcastCrewCredit`, and `SportsGame`, and writes
two of them: `CampusMediaItem` (on air) and `SportsGame` (score / status).

Phase 5 adds the first studio-owned tables, in
`prisma/migrations/20260804200000_studio_bridge`:

| Model | Table | Holds |
| --- | --- | --- |
| `StudioBridge` | `studio_bridges` | One row per OBS machine, keyed `studio-b`. Newest telemetry snapshot, `lastSeenAt`, and the token digest. No secrets |
| `StudioSession` | `studio_sessions` | One row per agent run (`runId`), so "was the bridge up for the game?" is answerable. A new run closes the previous open one |
| `StudioCommand` | `studio_commands` | The queue. Kind, narrow payload, status, who asked, TTL, and the error when it failed |

Enums: `StudioCommandKind` (the seven whitelisted actions) and
`StudioCommandStatus` (`QUEUED / CLAIMED / DONE / FAILED / EXPIRED`).

Phase 6 adds two more, in `prisma/migrations/20260805120000_studio_graphics`:

| Model | Table | Holds |
| --- | --- | --- |
| `StudioOverlay` | `studio_overlays` | One row per Browser Source surface, keyed `studio-b`. The session key and `lastSeenAt`. Rotating the URL is an update to this row |
| `StudioGraphic` | `studio_graphics` | One row per overlay **per kind** — `@@unique([overlayId, kind])`. State, the typed copy as JSON, optional `gameId` / `playerId`, and who last touched it |

Enums: `StudioGraphicKind` (the graphic kinds) and `StudioGraphicState`
(`PREVIEW / LIVE / CLEARED`).

Phase 7 adds two more, in
`prisma/migrations/20260805190000_studio_run_of_show_and_sponsors`:

| Model | Table | Holds |
| --- | --- | --- |
| `StudioSponsor` | `studio_sponsors` | The sponsor book: name, tagline, logo URL, optional `partnerId`, billboard duration, rotation priority, active flag, and `lastLiveAt` |
| `StudioRunOfShow` | `studio_run_of_show` | One row per studio per day (`@@unique([key, showDate])`). The slot key on air, a `slotKey → READY / COMPLETED / SKIPPED` map, and the show / item timestamps |

The same migration adds `SPONSOR_FULL` to `StudioGraphicKind` and
`StudioGraphic.sponsor_id`.

`itemStates` is JSON rather than a table of rows because it is a handful of
keys keyed to a script that already exists — a `studio_run_of_show_items` table
would be one row per slot per day for a value that is only ever read as a whole
map. It is filtered on read against today's slot keys and sanitized to the
three stored states on write, the same discipline `fields` gets on
`StudioGraphic`. `CURRENT` is deliberately **not** one of them: it is the
`currentKey` column, so two items cannot both claim to be on air.

Still no schema for segment *durations* — the run of show stores when an item
was taken, not how long it was supposed to run. Planned timings are a rundown
feature, and no one has asked for them.

One row per kind, upserted, rather than an append-only take log: an operator
retypes and re-takes the same lower third all night, and a log would grow by the
minute while answering a question nobody asked. Removing a graphic sets
`CLEARED` and keeps the copy, so it can be re-taken exactly as typed.

The JSON `fields` column is narrow and sanitized on write — four text lines
capped at `STUDIO_GRAPHIC_TEXT_MAX` (120), up to `STUDIO_LINEUP_MAX_ENTRIES`
(12) lineup rows, and the clock anchor. Anything else a caller sends is dropped
rather than stored, because the overlay that renders it is public.

Still no schema for the game clock or period — that stays session-local by
design (see above). Phase 6 pushes an anchor into the graphic when a score bug
is on air, but nothing persists a ticking clock.

## Files

```
src/app/(studio)/layout.tsx                       dark console chrome
src/app/(studio)/broadcast/studio/page.tsx        crew gate + first snapshot + overlay URL
src/app/(overlay)/layout.tsx                      no-chrome wrapper for the Browser Source
src/app/(overlay)/overlay.css                     transparent page, no cursor, no install prompt
src/app/(overlay)/broadcast/overlay/[sessionKey]/page.tsx   the OBS Browser Source page
src/app/api/broadcast/studio/state/route.ts       crew-gated console polling read
src/app/api/broadcast/overlay/[sessionKey]/route.ts         public overlay poll (no-store, 404 on bad key)
src/app/api/studio/bridge/commands/route.ts       agent: claim queued commands (+ heartbeat)
src/app/api/studio/bridge/state/route.ts          agent: post telemetry + command results
src/services/broadcast-studio-service.ts          the StudioConsoleSnapshot + the overlay payload
src/services/studio-bridge-service.ts             token auth, queue, telemetry, transport gate
src/services/studio-graphics-service.ts           cue / take / clear, session key, overlay heartbeat
src/services/studio-run-of-show-service.ts        rundown progress: advance / back / jump / ready / skip
src/services/studio-sponsors-service.ts           the sponsor book, partner adapter, rotation order
src/features/broadcast-studio/actions.ts          score, commands, graphics, run of show, sponsors, go live / end
src/components/studio/studio-console.tsx          client shell + polling + grid
src/components/studio/studio-frame.tsx            panel / tile / air-lamp primitives
src/components/studio/studio-header.tsx           air state, clocks, event, sync lamp
src/components/studio/studio-panels.tsx           the console panels (scenes, health, …)
src/components/studio/studio-game-control.tsx     game picker, score keys, status
src/components/studio/studio-graphics-panel.tsx   kind picker, copy fields, PVW/PGM, overlay URL
src/components/studio/studio-run-of-show.tsx      the driven rundown: transport, item states, segment timer
src/components/studio/studio-sponsor-panel.tsx    the sponsor book, take keys, rotation, add / edit
src/components/broadcast-overlay/overlay-client.tsx         1 s poll loop for the Browser Source
src/components/broadcast-overlay/overlay-stage.tsx          the graphics themselves (shared with PVW/PGM)
src/components/studio/use-studio-command.ts       queues one OBS command, tracks in-flight
src/components/studio/use-studio-game-clock.ts    session-local clock + period
src/components/studio/studio-time.ts              shared second ticker + formatters
src/components/studio/studio-control-bar.tsx      transport (go live / record / end)
src/config/broadcast-studio.ts                    scene/source scaffolding, graphic kinds + regions, score keys, poll windows
src/components/media/stream-target-reveal.tsx     gated credential reveal
```

The agent is a **separate package**, not part of the Next build and not
installed by it:

```
studio-bridge/index.js            the agent: OBS connect, whitelist, poll loop, telemetry
studio-bridge/package.json        obs-websocket-js v5 + dotenv, Node 20+
studio-bridge/.env.example        OBS_WEBSOCKET_URL / _PASSWORD, STUDIO_API_URL, STUDIO_BRIDGE_TOKEN
studio-bridge/start-bridge.bat    double-click start for the Studio B PC
studio-bridge/README.md           pointer to the setup guide
```

Supporting reads and writes added outside the studio tree, all in
`src/services/sports-highlights-service.ts`:

- `getCurrentOrNextGame()` — the in-progress game, else the next one inside a
  horizon.
- `listCoverableGames()` — the game picker's list, live games first.
- `setGameScore()` — the narrow score / status / result write.
- `listPlayers({ sportId })` — the roster behind the player ID and lineup cards,
  the same published list the game page uses.

## How to verify Phase 3

1. Open `/broadcast/studio` as Broadcasting crew.
2. **Run of show** — fill a couple of slots in
   `/organizations/broadcasting?tab=script`, save, return to the studio. The
   filled lines, the `n/m filled` count, and "saved just now · your name" appear
   within ~5 s.
3. **Countdown / event** — set a next air time on the Control Room countdown.
   The header shows the countdown and the campus-local air time; inside 15
   minutes of it the lamp reads **PREVIEW**.
4. **On air** — press GO LIVE with a viewer embed URL. Lamp turns **LIVE**, the
   elapsed timer starts, the PROGRAM tile plays the embed, and System Health's
   campus stream record flips to "On air". END BROADCAST reverses all of it. A
   second browser watching the same console follows within ~5 s without a
   reload.
5. **Crew** — add a production credit in the Broadcasting credit roll; it lists
   in the Crew panel.
6. Confirm nothing reads "connected" that is not: OBS bridge, encoder,
   scoreboard feed, and recording disk must all still say "Not linked".

## How to verify Phase 4

1. Put a game on the schedule for tonight in
   `/organizations/broadcasting?tab=sports-desk` (any sport; pick an opponent
   school that has a logo to see the mark).
2. Open `/broadcast/studio`. **Game control** shows that game, both team labels,
   and `MANUAL MODE`.
3. Press **In progress**. The status chip lights, and the header event line and
   `/sports` both show the game live.
4. Tap the score keys. The number moves immediately, and a second browser on
   `/sports` (or the game page) shows the same score within ~5 s — same row, no
   second scoreboard. Football offers `+6`, basketball `+3`, other sports `+1`.
5. Fix a mistake with `−1`, and clear a side with `0`.
6. Press **Final**. `/sports` shows the result (win / loss / tie) derived from
   the two scores, exactly as a Sports Desk final would.
7. Start the clock and set a period. Refresh the console — clock and period are
   still there (session storage). Open the console in a different browser: that
   one has its own clock, because the clock is never saved to the game.
8. Add a second game inside the next 36 hours and use the picker to switch. The
   console follows immediately; scores stay attached to their own game.
9. Confirm the honesty rules: the panel says `MANUAL MODE` (never "scoreboard
   connected"), System Health still reads "Not linked" for the scoreboard feed,
   and a non-crew account cannot reach `/broadcast/studio` at all.

## How to verify Phase 5

Install the agent first — [STUDIO_BRIDGE_SETUP.md](./STUDIO_BRIDGE_SETUP.md).

1. **Before starting the bridge**, open `/broadcast/studio`. Scenes shows the
   configured names greyed out, every OBS button is disabled, System Health
   reads *Studio bridge — Not set up* or *Never paired*, and START RECORD is
   disabled with a reason on hover.
2. Start the bridge on the Studio B PC. Within ~5 s the Scenes panel switches to
   your **real OBS scene names**, and System Health reads *Studio bridge —
   Connected* and *OBS WebSocket — Connected* with the OBS version.
3. Press **LIVE** on another scene. OBS cuts within about three seconds and the
   red PGM outline follows.
4. Turn on **Studio Mode** in OBS. The PVW keys light up; preview a scene, then
   press **Take … to air**. Program follows preview, and the outlines swap.
5. Press **START RECORD**. OBS starts recording and the button becomes *Stop
   record* with the running timecode. Press it again to stop.
6. Press **GO LIVE**. Two lines appear: the campus record went on air, and *OBS
   start stream sent to the studio bridge*. OBS starts streaming, and the
   Encoder row shows a measured bitrate and dropped-frame count.
7. **Kill the bridge window mid-stream.** Within ~20 s the console reads *Bridge
   disconnected · last seen …*, every OBS control greys out, and the OBS and
   encoder rows drop to Not linked. The campus on-air record is untouched — the
   stream is still up, and END BROADCAST still ends the campus record.
8. With the bridge still down, press **GO LIVE** again. The campus record goes
   live and the console says *OBS was not touched — The studio bridge is
   offline…* rather than implying the encoder started.
9. **Permissions.** As a Broadcast Academy member with no officer role and no
   Producer / Floor Director credit, scene keys work but GO LIVE reports that
   OBS stream control is limited. As an advisor or officer, it queues.
10. Confirm nothing leaks: the browser network tab never carries
    `STUDIO_BRIDGE_TOKEN`, the OBS password, or a stream key, and
    `/api/studio/bridge/commands` without a Bearer token answers `401`.

## How to verify Phase 6

Add the Browser Source first — [STUDIO_OVERLAY_SETUP.md](./STUDIO_OVERLAY_SETUP.md).
You can do the whole check in a browser tab on the overlay URL if OBS is not to
hand; the URL is a normal web page, just a transparent one.

1. Open `/broadcast/studio` as Broadcasting crew. The **Graphics** panel lists
   the graphic kinds and shows the overlay URL with **Copy overlay URL**. With no
   Browser Source open it reads that nothing is attached.
2. Open the overlay URL in a second tab. Within ~25 s the panel says the overlay
   is attached.
3. Pick **Lower third**, type a name, a role, and a secondary line, and press
   **Preview**. It appears in the **PVW** monitor and **nothing changes on the
   overlay** — that is the whole point of the distinction.
4. Press **Take live**. It animates in on the overlay within about a second and
   moves to the **PGM** monitor.
5. Fix a typo in the name and press **Update on air**. The copy changes in place;
   the graphic never blanks.
6. Pick a game in **Game control**, then take the **Score bug**. Tap a score key.
   The number on the overlay follows within a second, because the bug reads the
   game row rather than a copy. Start the console clock — the overlay counts
   down on its own, and stopping it re-anchors.
7. With the score bug still up, take a **Lower third**. Both stay — different
   regions. Now take a **Player ID**: it replaces the lower third, and the score
   bug is untouched.
8. Press **Remove**, then re-take the same kind. Your copy is still there.
9. Press **Clear all**. Everything leaves the overlay; the copy survives.
10. Confirm the guards: `/broadcast/overlay/` with a made-up key answers `404`,
    the overlay page has no login redirect and no campus chrome, and its network
    tab carries no stream key, bridge token, or session cookie. Press **Rotate**
    and reload the old URL — it is now a `404`, and OBS needs the new one.

## How to verify Phase 7

Run `npx prisma migrate deploy` first — Phase 7 is the first studio phase since
Phase 6 to add tables.

### Run of show

1. Fill a couple of slots in `/organizations/broadcasting?tab=script` and save,
   then open `/broadcast/studio` as Broadcasting crew. **Run of show** lists
   today's items with their filled lines, all **Pending**.
2. Press **Start show**. Item 1 goes **On air**, the header shows `1/9`, and a
   segment timer starts counting in `m:ss`.
3. Press **Advance**. Item 1 reads **Done**, item 2 goes on air, and the timer
   restarts. The line for the item on air is shown in full, not truncated.
4. Press **Back**. Item 1 is on air again and is **no longer Done**; item 2 is
   back to pending — going back means that part of the show has not happened.
5. Tap item 6 directly. It goes on air with nothing else disturbed, which is
   the out-of-order case (a guest arrives late) working as intended.
6. Press **Skip** on item 7, then **Advance** from item 6: the rundown walks
   over 7 to 8. Tap item 7 anyway — picking it un-skips it.
7. Open the console in a second browser. Within ~5 s it shows the same
   position, because progress is one shared row, not per-browser state.
8. Leave an item up for 15 minutes: the segment chip turns amber.
9. Press **Reset**, confirm, and check
   `/organizations/broadcasting?tab=script` — the script is exactly as it was.
   Only the progress cleared.

### Sponsors

10. In **Sponsors**, press **Add sponsor**, type a name and a logo URL, and add
    it to the book. Then press **Adopt a campus partner** on a second one: the
    name and logo fill from an approved `Partner` row, and a partner already in
    the book is greyed out in the picker.
11. With **Strap** selected, press **Preview** on a sponsor — it appears in the
    Graphics PVW monitor and nothing changes on the overlay. Press **Take
    live**: the strap appears on the overlay in about a second, with the logo.
12. Switch to **Billboard** and take a different sponsor. The full-frame card
    appears; the strap is untouched, because they are different regions. Take a
    **Lineup**: it replaces the billboard (same region) and leaves the strap.
13. Edit the live sponsor's name and save. The card on air changes within a
    second — it holds the row, not a copy.
14. Press **Next sponsor**. The next active sponsor in book order takes the
    region, wrapping at the end. Tick **Auto** and watch it advance on the
    sponsor's own duration; close the tab and confirm the rotation stops, which
    is what the panel says it will do.
15. Set a sponsor to **not** in tonight's rotation. Next and Auto skip it, and
    it can still be taken by hand.
16. Try removing a sponsor that is on air: it is refused with a reason. Remove
    it from the overlay first, then the delete goes through.
17. Confirm the guards: a non-crew account still cannot reach
    `/broadcast/studio`, and the overlay's network tab carries sponsor names,
    taglines, and logo URLs only — the same marketing copy on screen.

## Not in Phase 7 (awaiting approval)

- Full RBAC broadcaster role UIs (Phase 8)
- Realtime multi-operator sync — progress is shared but last-write-wins, and
  the console still polls every 5 s
- Sponsor impression counts, per-spot reporting, or daypart scheduling
- Server-side sponsor rotation (auto-advance runs in the console tab)
- Planned segment durations or an over/under against a target time
- Source tally, per-source visibility toggles, real audio meters and mixing
- Daktronics scoreboard feed (the console is manual entry only)
- Durable clock / period, or any scoreboard schema of its own
- Graphic themes, per-club skins, or an image uploader (sponsor logos are URLs)
- Recording disk space telemetry
- Any simulated or fake video backend
