# Broadcast Control Studio

MHS Broadcasting's full-screen production console for Studio B. This is the
operator surface that eventually drives OBS, graphics, audio, and the
scoreboard. It lives outside the campus shell so it reads as broadcast
hardware, not a SaaS dashboard.

**Status: Phase 3 shipped — read-only console bound to real campus data.** The
OBS bridge, graphics engine, scoreboard write controls, and Daktronics feed are
**not approved**. Do not build them without sign-off.

## Route

| Route | Group | Access |
| --- | --- | --- |
| `/broadcast/studio` | `src/app/(studio)` | Campus access + `canManageCampusMedia` |
| `/api/broadcast/studio/state` | `src/app/api` | Same crew check, same-origin console polling |

- The `(studio)` route group has its own dark layout (`src/app/(studio)/layout.tsx`)
  with no campus sidebar, header, or mobile nav — full-bleed `#050B14` chrome
  oriented at a 1920 × 1080 operator display.
- The page gate is `requireCampusAccess()` followed by `canManageCampusMedia()`,
  the same crew check the Control Room uses. Non-crew are redirected to
  `/organizations/broadcasting?tab=media`.
- `/broadcast` is on `FOCUSED_MODE_ALLOWED_PREFIXES`
  (`src/config/focused-clubs-allowlist.ts`) so focused clubs mode does not
  soft-wipe the console.

## What each panel shows (Phase 3)

Every "live" cell below traces to a row that already exists in the campus
database. Panels with no data source stay explicitly staged and carry a
`Phase 4` badge, so an operator never has to guess which readouts are real.

| Region | Panel | Source | Behavior |
| --- | --- | --- | --- |
| Header | On-air lamp | `CampusMediaItem` + `BroadcastSchedule` | **LIVE** when a `LIVE_STREAM` row has status `LIVE`; **PREVIEW** inside ±`STUDIO_PREVIEW_WINDOW_MINUTES` (15) of the scheduled air time; otherwise **OFF AIR** |
| Header | Program / elapsed / clock | `CampusMediaItem` | Program title from the on-air row; elapsed counts from `publishedAt` (falls back to `createdAt`); wall clock ticks client-side |
| Header | Next air | `BroadcastSchedule.nextAirAt` | Live countdown plus the campus-local air time |
| Header | Event | live stream → `SportsGame` → schedule title | "What are we covering" — the on-air title if live, else a current/next game, else the scheduled show title |
| Header | Sync lamp | poll result | "Synced 3s ago", or "Sync stalled" when a read fails |
| Left | Scenes | `src/config/broadcast-studio.ts` | Studio B scene names only — no tally, no switching (Phase 4) |
| Left | Crew | `BroadcastCrewCredit` | Visible credit roll with production role labels; links to the club's credit roll when empty |
| Left | System health | env + `CampusMediaItem` | Only two rows can be measured today: **Campus stream record** (On air / Idle) and **RTMP ingest** (Key set / No key). OBS, encoder, scoreboard, and disk stay "Not linked" |
| Left | OBS stream target | `revealStreamCredentialsAction` | Crew-gated reveal, unchanged from Phase 2 |
| Center | PROGRAM | `CampusMediaItem.embedUrl` | Real viewer embed when the on-air row has one, black slate otherwise; footer credits the operator who started the stream |
| Center | Sources / Audio | static config | Tile and fader labels only (Phase 4) |
| Right | Scoreboard | `SportsGame` | **Display only.** Away/home labels and scores from the in-progress game, else the next game inside 36 hours; shows sport, status, level, site, venue, kickoff. No entry controls, no Daktronics |
| Right | Graphics / Sponsors | static config | Preset and slot names only (Phase 4) |
| Right | Run of show | `BroadcastDailyScript` + `BroadcastScriptTemplate` | Today's rundown with the **filled values** rendered per slot, a `Filled / Needed / Open / Prayer / Fixed` chip per item, a `4/7 filled` count, and who saved it when. Links to the Daily Rundown to edit |
| Footer | GO LIVE / START RECORD / END BROADCAST | `startLiveBroadcastAction` / `endLiveBroadcastAction` | GO LIVE and END BROADCAST are wired; START RECORD is present and disabled |

GO LIVE and END BROADCAST write the same `CampusMediaItem` record the Control
Room does — one source of truth for "are we on air". No OBS control is attached
yet; operators still start and stop streaming in OBS.

### Honesty rule

The console never claims a status it cannot measure. There is no fake telemetry:
health rows without a data source read "Not linked", the scoreboard reads `--`
when no game exists, and the run of show says "no one has saved today's rundown
yet" instead of showing invented timings. Segment times are deliberately absent
because no schema stores them.

## Data flow and refresh

- `getStudioConsoleSnapshot()` (`src/services/broadcast-studio-service.ts`)
  builds one serializable `StudioConsoleSnapshot` from five reads in parallel:
  `getActiveLiveStream()`, `getBroadcastSchedule()`, `listCrewCredits()`,
  `getCurrentOrNextGame()`, and `getTodaysBroadcastScript()`.
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

Phases 2 and 3 added **no Prisma models and no migration**. The console is a
reader: `CampusMediaItem`, `BroadcastSchedule`, `BroadcastDailyScript`,
`BroadcastScriptTemplate`, `BroadcastCrewCredit`, and `SportsGame`. Studio
session / scene persistence still has no schema, because nothing writes scene
state until the OBS bridge exists.

## Files

```
src/app/(studio)/layout.tsx                       dark console chrome
src/app/(studio)/broadcast/studio/page.tsx        crew gate + first snapshot
src/app/api/broadcast/studio/state/route.ts       crew-gated console polling read
src/services/broadcast-studio-service.ts          the StudioConsoleSnapshot
src/components/studio/studio-console.tsx          client shell + polling + grid
src/components/studio/studio-frame.tsx            panel / tile / air-lamp primitives
src/components/studio/studio-header.tsx           air state, clocks, event, sync lamp
src/components/studio/studio-panels.tsx           the console panels
src/components/studio/studio-time.ts              shared second ticker + formatters
src/components/studio/studio-control-bar.tsx      transport (go live / record / end)
src/config/broadcast-studio.ts                    scene/source/graphics scaffolding, poll + preview windows
src/components/media/stream-target-reveal.tsx     gated credential reveal
```

Supporting read added outside the studio tree:
`getCurrentOrNextGame()` in `src/services/sports-highlights-service.ts` — the
in-progress game, else the next one inside a horizon.

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
6. **Scoreboard** — set a `SportsGame` to `LIVE` with scores on the Sports Desk;
   the panel shows the real teams and score, marked "Display only".
7. Confirm nothing reads "connected" that is not: OBS bridge, encoder,
   scoreboard feed, and recording disk must all still say "Not linked".

## Not in Phase 3 (awaiting approval)

- OBS WebSocket bridge / `studio-bridge` package
- Real scene switching, source tally, audio mixing
- Graphics and sponsor take/clear engine, sponsor rotation storage
- Scoreboard write controls and the Daktronics feed
- Recording / encoder telemetry
- Full RBAC operator role UIs
- Realtime multi-operator sync
- Any simulated or fake video backend
