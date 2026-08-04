# Broadcast Control Studio

MHS Broadcasting's full-screen production console for Studio B. This is the
operator surface that eventually drives OBS, graphics, audio, and the
scoreboard. It lives outside the campus shell so it reads as broadcast
hardware, not a SaaS dashboard.

**Status: Phase 6 shipped — the console reads campus data, writes the game
score, drives OBS through the Studio Bridge, and takes graphics to an OBS
Browser Source overlay.** Sponsor rotation, the Daktronics feed, real audio
metering, and source tally are **not approved**. Do not build them without
sign-off.

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
| Center | Graphics | `StudioGraphic` + `SportsGame` + `SportsPlayer` | **Read and write.** Eight graphic kinds with editable copy, Preview / Take live / Remove, PVW and PGM monitors rendering the real overlay components, the Browser Source URL, and an overlay-attached lamp |
| Center | Sources / Audio | static config | Tile and fader labels only |
| Right | Game control | `SportsGame` | **Read and write.** Game picker, away/home labels with opponent logos, scores with per-sport quick keys, and `SCHEDULED / LIVE / FINAL` status. Clock and period are console-only. Reads MANUAL MODE — no Daktronics |
| Right | Run of show | `BroadcastDailyScript` + `BroadcastScriptTemplate` | Today's rundown with the **filled values** rendered per slot, a `Filled / Needed / Open / Prayer / Fixed` chip per item, a `4/7 filled` count, and who saved it when. Links to the Daily Rundown to edit |
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
rundown yet" instead of showing invented timings. Segment times are deliberately
absent because no schema stores them.

Game control reads **MANUAL MODE**, never "scoreboard connected". Nothing is
linked to the Daktronics board — a person is typing the score — and the System
Health scoreboard row still reads "Not linked".

Phase 5 extends the rule to OBS. "Connected" is derived from **how recently the
agent reported**, never from a stored flag, so an agent that dies mid-show reads
DISCONNECTED and drags the OBS and encoder rows down with it. The audio faders
are still config, not measurement, and the panel now says so.

Phase 6 extends it again to the overlay: "attached" means a Browser Source
actually asked for the state inside the last 25 seconds, and the graphics panel
says a sponsor is one billboard rather than implying a rotation exists.

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
| Sponsor | Lower | Typed. One billboard — **no rotation, no impression counts** |
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

## Data flow and refresh

- `getStudioConsoleSnapshot()` (`src/services/broadcast-studio-service.ts`)
  builds one serializable `StudioConsoleSnapshot` from seven reads in parallel:
  `getActiveLiveStream()`, `getBroadcastSchedule()`, `listCrewCredits()`,
  `getCurrentOrNextGame()`, `listCoverableGames()`,
  `getStudioBridgeSnapshot()`, and `getTodaysBroadcastScript()`.
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
- Control Room tab (`/organizations/broadcasting?tab=media`) → **Open Broadcast Studio** card
- Watch Broadcasting (`/media`) → Go Live card header → **Broadcast Studio**

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

Enums: `StudioGraphicKind` (the eight kinds) and `StudioGraphicState`
(`PREVIEW / LIVE / CLEARED`).

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
src/features/broadcast-studio/actions.ts          score write, command queue, graphics, go live / end
src/components/studio/studio-console.tsx          client shell + polling + grid
src/components/studio/studio-frame.tsx            panel / tile / air-lamp primitives
src/components/studio/studio-header.tsx           air state, clocks, event, sync lamp
src/components/studio/studio-panels.tsx           the console panels (scenes, health, …)
src/components/studio/studio-game-control.tsx     game picker, score keys, status
src/components/studio/studio-graphics-panel.tsx   kind picker, copy fields, PVW/PGM, overlay URL
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
   the eight kinds and shows the overlay URL with **Copy overlay URL**. With no
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

## Not in Phase 6 (awaiting approval)

- Sponsor rotation, scheduling, or impression counts (one billboard exists)
- Interactive run of show — the rundown is still read-only in the console
- Source tally, per-source visibility toggles, real audio meters and mixing
- Daktronics scoreboard feed (the console is manual entry only)
- Durable clock / period, or any scoreboard schema of its own
- Graphic themes, per-club skins, or an image / logo uploader for graphics
- Recording disk space telemetry
- Full RBAC operator role UIs
- Realtime multi-operator sync (the console polls every 5 s, the overlay 1 s)
- Any simulated or fake video backend
