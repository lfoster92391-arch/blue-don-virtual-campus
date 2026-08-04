# Broadcast Control Studio

MHS Broadcasting's full-screen production console for Studio B. This is the
operator surface that eventually drives OBS, graphics, audio, and the
scoreboard. It lives outside the campus shell so it reads as broadcast
hardware, not a SaaS dashboard.

**Status: Phase 2 shipped — console shell and gating only.** Phases 3 and 4 are
proposed but **not approved**. Do not build the OBS bridge, graphics engine, or
Daktronics integration without sign-off.

## Route

| Route | Group | Access |
| --- | --- | --- |
| `/broadcast/studio` | `src/app/(studio)` | Campus access + `canManageCampusMedia` |

- The `(studio)` route group has its own dark layout (`src/app/(studio)/layout.tsx`)
  with no campus sidebar, header, or mobile nav — full-bleed `#050B14` chrome
  oriented at a 1920 × 1080 operator display.
- The page gate is `requireCampusAccess()` followed by `canManageCampusMedia()`,
  the same crew check the Control Room uses. Non-crew are redirected to
  `/organizations/broadcasting?tab=media`.
- `/broadcast` is on `FOCUSED_MODE_ALLOWED_PREFIXES`
  (`src/config/focused-clubs-allowlist.ts`) so focused clubs mode does not
  soft-wipe the console.

## What Phase 2 renders

Header, three console columns, and a transport bar:

| Region | Panel | Phase 2 behavior |
| --- | --- | --- |
| Header | Program / elapsed / wall clock / next air / operator | Live. Elapsed runs from the active stream's publish time; next air comes from `getBroadcastSchedule()` |
| Left | Scenes | Static Studio B scene list from `src/config/broadcast-studio.ts` |
| Left | System health + OBS stream target | Checks render "Not linked"; stream target is revealed on demand (see below) |
| Center | PROGRAM | Live embed when a stream is on air with a viewer URL, otherwise a black slate |
| Center | Sources / Audio | Static source tiles and fader positions |
| Right | Scoreboard | Static `--` slate, marked Phase 4 |
| Right | Graphics / Sponsors | Static preset and slot lists |
| Right | Run of show | Mirrors `DEFAULT_BROADCAST_SCRIPT_SLOTS` (the Daily Rundown template) |
| Footer | GO LIVE / START RECORD / END BROADCAST | GO LIVE and END BROADCAST are wired; START RECORD is present and disabled |

GO LIVE and END BROADCAST call the existing `startLiveBroadcastAction` /
`endLiveBroadcastAction`, so the console writes the same `CampusMediaItem`
record the Control Room does — one source of truth for "are we on air". No OBS
control is attached yet; operators still start and stop streaming in OBS.

Panels that are staged rather than functional carry a `Phase 3` or `Phase 4`
badge so operators are never guessing which buttons do something.

## Stream credentials

Stream keys are **not** serialized into client props anywhere.

- `src/config/broadcast-media.ts` splits two shapes:
  - `BlueDonLiveRtmpPublicConfig` — `hasSharedStreamKey`, hint text, OBS
    checklist, scene tips. Safe to pass server → client.
  - `BlueDonLiveStreamSecrets` — ingest URL and stream key. Server only.
- `CampusMediaItemView` (`src/services/media-service.ts`) no longer selects or
  returns `streamKey`, so `/media`, the org media panels, and the video library
  cannot leak it to the campus audience.
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

Phase 2 added **no Prisma models and no migration**. The console reads
`CampusMediaItem` (via `getActiveLiveStream`) and `BroadcastSchedule` (via
`getBroadcastSchedule`). Studio session / scene persistence is deferred to
Phase 3 so the shell can be reviewed without a schema change.

## Files

```
src/app/(studio)/layout.tsx                       dark console chrome
src/app/(studio)/broadcast/studio/page.tsx        crew gate + grid composition
src/components/studio/studio-frame.tsx            panel / tile / lamp primitives
src/components/studio/studio-header.tsx           clock, elapsed timer, operator
src/components/studio/studio-panels.tsx           the nine console panels
src/components/studio/studio-control-bar.tsx      transport (go live / record / end)
src/config/broadcast-studio.ts                    static scene/source/graphics scaffolding
src/components/media/stream-target-reveal.tsx     gated credential reveal
```

## Not in Phase 2 (awaiting approval)

- OBS WebSocket bridge / `studio-bridge` package
- Real scene switching, source tally, audio mixing
- Graphics and sponsor take/clear engine
- Daktronics scoreboard feed
- Full RBAC operator role UIs
- Realtime multi-operator sync
- Any simulated or fake video backend
