# Broadcast Control Studio

MHS Broadcasting's full-screen production console for Studio B. This is the
operator surface that eventually drives OBS, graphics, audio, and the
scoreboard. It lives outside the campus shell so it reads as broadcast
hardware, not a SaaS dashboard.

**Status: Phase 4 shipped — the console reads campus data and writes the game
score.** The OBS bridge, graphics engine, and the Daktronics feed are **not
approved**. Do not build them without sign-off.

## Route

| Route | Group | Access |
| --- | --- | --- |
| `/broadcast/studio` | `src/app/(studio)` | Campus access + `canManageCampusMedia` |
| `/api/broadcast/studio/state` | `src/app/api` | Same crew check, same-origin console polling; `?gameId=` pins the game the operator picked |

- The `(studio)` route group has its own dark layout (`src/app/(studio)/layout.tsx`)
  with no campus sidebar, header, or mobile nav — full-bleed `#050B14` chrome
  oriented at a 1920 × 1080 operator display.
- The page gate is `requireCampusAccess()` followed by `canManageCampusMedia()`,
  the same crew check the Control Room uses. Non-crew are redirected to
  `/organizations/broadcasting?tab=media`.
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
| Left | Scenes | `src/config/broadcast-studio.ts` | Studio B scene names only — no tally, no switching |
| Left | Crew | `BroadcastCrewCredit` | Visible credit roll with production role labels; links to the club's credit roll when empty |
| Left | System health | env + `CampusMediaItem` | Only two rows can be measured today: **Campus stream record** (On air / Idle) and **RTMP ingest** (Key set / No key). OBS, encoder, scoreboard, and disk stay "Not linked" |
| Left | OBS stream target | `revealStreamCredentialsAction` | Crew-gated reveal, unchanged from Phase 2 |
| Center | PROGRAM | `CampusMediaItem.embedUrl` | Real viewer embed when the on-air row has one, black slate otherwise; footer credits the operator who started the stream |
| Center | Sources / Audio | static config | Tile and fader labels only |
| Right | Game control | `SportsGame` | **Read and write.** Game picker, away/home labels with opponent logos, scores with per-sport quick keys, and `SCHEDULED / LIVE / FINAL` status. Clock and period are console-only. Reads MANUAL MODE — no Daktronics |
| Right | Graphics / Sponsors | static config | Preset and slot names only |
| Right | Run of show | `BroadcastDailyScript` + `BroadcastScriptTemplate` | Today's rundown with the **filled values** rendered per slot, a `Filled / Needed / Open / Prayer / Fixed` chip per item, a `4/7 filled` count, and who saved it when. Links to the Daily Rundown to edit |
| Footer | GO LIVE / START RECORD / END BROADCAST | `startLiveBroadcastAction` / `endLiveBroadcastAction` | GO LIVE and END BROADCAST are wired; START RECORD is present and disabled |

GO LIVE and END BROADCAST write the same `CampusMediaItem` record the Control
Room does — one source of truth for "are we on air". No OBS control is attached
yet; operators still start and stop streaming in OBS.

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

## Data flow and refresh

- `getStudioConsoleSnapshot()` (`src/services/broadcast-studio-service.ts`)
  builds one serializable `StudioConsoleSnapshot` from six reads in parallel:
  `getActiveLiveStream()`, `getBroadcastSchedule()`, `listCrewCredits()`,
  `getCurrentOrNextGame()`, `listCoverableGames()`, and
  `getTodaysBroadcastScript()`.
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

Environment: `BLUE_DON_LIVE_RTMP_URL`, `BLUE_DON_LIVE_STREAM_KEY` (both
server-only, never `NEXT_PUBLIC_`).

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
Studio session, scene, and clock persistence still have no schema — scene state
waits on the OBS bridge, and the clock is deliberately session-local.

## Files

```
src/app/(studio)/layout.tsx                       dark console chrome
src/app/(studio)/broadcast/studio/page.tsx        crew gate + first snapshot
src/app/api/broadcast/studio/state/route.ts       crew-gated console polling read
src/services/broadcast-studio-service.ts          the StudioConsoleSnapshot
src/features/broadcast-studio/actions.ts          crew-gated score / status write
src/components/studio/studio-console.tsx          client shell + polling + grid
src/components/studio/studio-frame.tsx            panel / tile / air-lamp primitives
src/components/studio/studio-header.tsx           air state, clocks, event, sync lamp
src/components/studio/studio-panels.tsx           the console panels
src/components/studio/studio-game-control.tsx     game picker, score keys, status
src/components/studio/use-studio-game-clock.ts    session-local clock + period
src/components/studio/studio-time.ts              shared second ticker + formatters
src/components/studio/studio-control-bar.tsx      transport (go live / record / end)
src/config/broadcast-studio.ts                    scene/source/graphics scaffolding, score keys, poll + preview windows
src/components/media/stream-target-reveal.tsx     gated credential reveal
```

Supporting reads and writes added outside the studio tree, all in
`src/services/sports-highlights-service.ts`:

- `getCurrentOrNextGame()` — the in-progress game, else the next one inside a
  horizon.
- `listCoverableGames()` — the game picker's list, live games first.
- `setGameScore()` — the narrow score / status / result write.

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

## Not in Phase 4 (awaiting approval)

- OBS WebSocket bridge / `studio-bridge` package
- Real scene switching, source tally, audio mixing
- Graphics and sponsor take/clear engine, sponsor rotation storage
- Daktronics scoreboard feed (the console is manual entry only)
- Durable clock / period, or any scoreboard schema of its own
- Recording / encoder telemetry
- Full RBAC operator role UIs
- Realtime multi-operator sync
- Any simulated or fake video backend
