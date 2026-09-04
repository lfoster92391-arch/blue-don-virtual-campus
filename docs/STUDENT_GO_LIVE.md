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
| **Camera studio (preferred)** | `/broadcast/phone` | Broadcasting crew. Turns this device's camera on — phone or laptop. |
| Control Room | `/organizations/broadcasting?tab=media` | Same crew — **Open camera & Go Live** |
| Watch Broadcasting hub | `/media` | Signed-in campus; Go live card is crew-only |
| Madonna Broadcast | `/madonna/broadcast` | Same crew check |
| Broadcast Control Studio | `/broadcast/studio` | Advisor / game-caller console (OBS) |
| **Watch Broadcasting LIVE** | `/watch` (alias `/live`) | **Public — no login** |

The Control Room, `/media`, and `/madonna/broadcast` still render
`LiveBroadcastPanel`. The phone studio is a full-screen camera page.

## Tonight's path (no OBS)

Students go live from a **phone or laptop browser**. OBS is not required.

1. Sign in on the device (Safari on iPhone, Chrome on Android or a laptop).
   Production is HTTPS, which the camera needs.
2. Open **Open camera & Go Live** from Control Room, or go straight to
   `https://campus.assetpilotedu.com/broadcast/phone`.
3. Tap **Turn camera on**. Allow **Camera** and **Microphone**.
4. Name today's show. Tap the red **Go Live**.
5. Keep this page in the foreground. Tap **End broadcast** when done.

Viewers watch at `https://campus.assetpilotedu.com/watch` — **no login**.

Expect about **4–8 seconds of delay** (short clips uploading, not a TV-smooth
stream). That is enough for a game or announcements tonight.

### If it fails

- Camera black / permission denied → Settings → Safari/Chrome → Camera + Mic on
  for campus.assetpilotedu.com, then tap **Turn camera on** again.
- "Storage is not connected" → campus video uploads are not configured; tell an
  advisor. Do not use OBS as the student fallback tonight.
- Viewer page says Offline → the crew page is not LIVE, or clips have not
  uploaded yet. Wait ~10 seconds, then refresh `/watch`.
- Viewer must tap **Tap to play LIVE** once on iPhone.

OBS / Studio Bridge remains under **Advanced · Advisor setup** only.

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
