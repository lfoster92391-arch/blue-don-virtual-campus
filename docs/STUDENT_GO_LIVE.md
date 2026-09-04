# Student go-live

How a Madonna student crew member puts Blue Don Live on air. This is the
student-facing path. Advisors who need the full console want
[`BROADCAST_STUDIO.md`](./BROADCAST_STUDIO.md) instead.

The rule this page exists to enforce: **a student should never see an RTMP URL,
a stream key, a WebSocket port, or a bitrate before they see a Go Live button.**
Anything technical belongs under **Advanced · Advisor setup**.

## Where students go

| Surface | Route | Who |
| --- | --- | --- |
| **Phone studio (preferred)** | `/broadcast/phone` | Broadcasting crew (`canManageCampusMedia`). Turns this device's camera on. |
| Control Room | `/organizations/broadcasting?tab=media` | Same crew check — five-step panel |
| Watch Broadcasting hub | `/media` | Signed-in campus; Go live card is crew-only |
| Madonna Broadcast | `/madonna/broadcast` | Same crew check |
| Broadcast Control Studio | `/broadcast/studio` | Advisor / game-caller console (OBS) |
| **Watch Broadcasting LIVE** | `/watch` (alias `/live`) | **Public — no login** |

The Control Room, `/media`, and `/madonna/broadcast` still render
`LiveBroadcastPanel`. The phone studio is a full-screen camera page.

## From your phone

This is the path Lisa's crew should use at a game, in a hallway, or anywhere
Studio B is not.

1. Sign in on the phone (Safari on iPhone, Chrome on Android). Production is
   already HTTPS, which the camera API requires.
2. Open **Go Live from this phone** from Control Room, or go straight to
   `https://campus.assetpilotedu.com/broadcast/phone`.
3. Tap **Turn camera on**. Allow **Camera** and **Microphone** when the browser
   asks. Use the flip button for front vs rear.
4. Name today's show.
5. Tap the red **Go Live**. The camera stays on, the badge flips to **LIVE**,
   and short clips upload to campus storage.
6. Keep this page in the foreground until the show is over. Tap **End
   broadcast** when you are done.

Viewers (families, students, anyone with the link) watch at
`https://campus.assetpilotedu.com/watch` — **no campus login**.

### What the phone actually does

Browsers cannot speak RTMP. The phone records a few seconds at a time
(MediaRecorder), uploads each complete clip, and the public watch page plays
those clips in order. Studio B / OBS is unchanged and is not required for this
path.

### iPhone / Android caveats

- **HTTPS only** (production already is). `localhost` works for development.
- **iOS Safari** prefers MP4. Allow Camera + Microphone; if the preview is
  black, reload and tap **Turn camera on** again (getUserMedia needs a tap).
- **Autoplay:** viewers may need to tap **Tap to play LIVE** once. iOS often
  starts muted.
- **Keep the page open.** Switching apps or locking the phone pauses capture.
  iOS may still throttle a background tab.
- **Clips, not a TV-smooth stream.** There is a short join between each clip.
  For a polished Studio B show, use OBS on the desk machine.
- **Storage must be configured** (same Supabase bucket as video uploads). If it
  is not, the phone studio says so instead of faking LIVE.

## The five steps (Control Room)

The panel is a numbered list. Phone and Studio B are both offered.

1. **Open the camera** — **Go Live from this phone** (camera page) or **Open
   Broadcast Studio** (OBS console).
2. **Pick today's show** — text field plus presets (Morning Announcements, Blue
   Don News, Pep Rally, Game Night, Mass).
3. **Check your preview** — you should see the desk or the field, and the mic
   should not be muted. On a phone, Camera and Microphone are allowed.
4. **Go live** — phone path starts this device's camera; **Go Live with Studio
   B** queues OBS `StartStream` when the bridge is online, and errors clearly
   when it is not (it will not flip LIVE with no picture).
5. **End broadcast** — greyed out until the show is live. Ends the campus row
   and stops OBS when the bridge is up.

While a show is on air, steps 1–4 collapse so the only live control is **End
broadcast**.

### Status language

The badge reads **Offline**, **Preview**, or **LIVE** — no "PGM", no "PVW".
Preview means the clock is inside 15 minutes either side of the scheduled air
time, resolved on the server by `isWithinAirPreviewWindow()`.

## Studio B (OBS) still works

Advisors on the Studio B PC use `/broadcast/studio`. GO LIVE there still writes
the campus record **and** queues `OBS_START_STREAM` when the bridge is up. That
console is not required for a phone show.

## What moved behind Advanced

Collapsed by default inside the Go live panel, under **Advanced · Advisor
setup**:

- The stream target reveal (RTMP ingest URL and stream key) — crew-gated server
  action, never in page props.
- The first-time OBS checklist (`OBS_CHECKLIST`).
- Scene setup notes for camera, mic, and screen share (`OBS_SCENE_TIPS`).
- Broadcast description and the viewer embed URL, for YouTube / Vimeo simulcast.

## How we go live at Madonna

A short card next to the Go live panel carries the crew's house rules in school
language, sourced from `MADONNA_GO_LIVE_NOTES` in
`src/config/broadcast-media.ts`.

## Secrets

Unchanged:

- `BLUE_DON_LIVE_RTMP_URL` and `BLUE_DON_LIVE_STREAM_KEY` are read server-side
  only, by `getBlueDonLiveStreamSecrets()`.
- Phone uploads use the same signed Supabase URLs as campus video — the browser
  never receives a stream key.
- `STUDIO_BRIDGE_TOKEN` stays server-side.

## Files

| File | What it holds |
| --- | --- |
| `src/app/(studio)/broadcast/phone/page.tsx` | Phone studio route |
| `src/components/media/phone-live-studio.tsx` | Camera, Go Live, segment upload |
| `src/app/watch/page.tsx` | Public watch page (no login) |
| `src/app/api/watch/live/route.ts` | Public live payload (segments or embed) |
| `src/components/media/live-broadcast-panel.tsx` | Five-step panel |
| `src/config/phone-live.ts` | Public `/watch` and phone-live constants |
| `src/config/broadcast-media.ts` | Step copy, presets, house rules |

## How to verify

### Phone

1. Sign in as a Broadcasting officer (or run `scripts/grant-broadcast-ops.mjs`)
   on a phone at `https://campus.assetpilotedu.com/broadcast/phone`.
2. Tap **Turn camera on**, allow Camera and Microphone, confirm the preview.
3. Name the show. Tap **Go Live**. The badge is **LIVE**.
4. On a second device (no login), open `https://campus.assetpilotedu.com/watch`.
   Within a few seconds the show should play (tap to play on iPhone if asked).
5. Tap **End broadcast**. `/watch` returns to Offline.

### Studio B

1. Bridge + OBS online. From Control Room, **Go Live with Studio B**. OBS
   starts streaming. If the bridge is down, the panel shows a clear error and
   does **not** fake LIVE.
2. Advisor console `/broadcast/studio` GO LIVE still works as before.

### Public watch without login

1. Sign out (or a private window). Open `/watch` or `/live`.
2. You are not sent to `/login`. Offline is honest. On air, the player shows.
3. No stream keys, no Go Live, no crew controls.
