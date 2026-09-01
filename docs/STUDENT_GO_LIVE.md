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
| Control Room | `/organizations/broadcasting?tab=media` | Broadcasting officers and advisors (`canManageCampusMedia`) |
| Watch Broadcasting | `/media` | Anyone signed in; the Go live card only renders for crew |
| Madonna Broadcast | `/madonna/broadcast` | Same crew check |
| Broadcast Control Studio | `/broadcast/studio` | Same crew check, full production console |

All three campus surfaces render the same `LiveBroadcastPanel`, so the steps
below are identical wherever a student lands.

## The five steps

The panel is a numbered list, not a settings form. Each step carries the one
control it needs and nothing else.

1. **Open the studio** — big **Open Broadcast Studio** button. Copy tells the
   student OBS is already configured on the Studio B machine and they should
   not change its settings.
2. **Pick today's show** — one text field for the show name, plus one-tap
   presets (Morning Announcements, Blue Don News, Pep Rally, Game Night, Mass).
   Prefilled from the Next live countdown title when one is set.
3. **Check your preview** — three things a student can confirm by looking:
   camera on the desk, mic meter moving and not red, OBS saying `Streaming`.
4. **Go Live** — the red button. Writes the campus `CampusMediaItem` row, which
   is what flips every surface to **On air now**.
5. **End broadcast** — greyed out until the show is live, then it is the only
   active control on the panel. Ending saves the show to Past Broadcasts.

While a show is on air, steps 1–4 collapse to a completed state showing the
show name, the program preview, and who started it, so the only thing a student
can press by accident is **End broadcast**.

### Status language

The badge reads **Offline**, **Preview**, or **LIVE** — no "PGM", no "PVW".
Preview means the clock is inside 15 minutes either side of the scheduled air
time, resolved on the server by `isWithinAirPreviewWindow()` so the label never
flips during hydration.

## What moved behind Advanced

Collapsed by default inside the Go live panel, under **Advanced · Advisor
setup**:

- The stream target reveal (RTMP ingest URL and stream key), unchanged — still
  a crew-gated server action, still never in page props.
- The first-time OBS checklist (`OBS_CHECKLIST`).
- Scene setup notes for camera, mic, and screen share (`OBS_SCENE_TIPS`).
- Broadcast description and the viewer embed URL, which only matter when we
  simulcast to YouTube or Vimeo.

Collapsed as its own card at the bottom of the Control Room, under
**Advanced · Advisor setup**:

- The **Open Broadcast Studio** link with an explanation of what the console is
  for, plus pointers to `STUDIO_BRIDGE_SETUP.md` and `STUDIO_OVERLAY_SETUP.md`.

Nothing was deleted or gated more tightly. The Studio Bridge, the overlay, the
graphics and sponsor books, and the run of show all behave exactly as
[`BROADCAST_STUDIO.md`](./BROADCAST_STUDIO.md) describes.

## How we go live at Madonna

A short card next to the Go live panel carries the crew's house rules in school
language, sourced from `MADONNA_GO_LIVE_NOTES` in
`src/config/broadcast-media.ts`: who runs the show, when we air, who is
watching, and what to do when something breaks. It is deliberately not a
restatement of the five steps.

## Secrets

Unchanged, and the reason the reveal stayed behind a button rather than moving
to the page:

- `BLUE_DON_LIVE_RTMP_URL` and `BLUE_DON_LIVE_STREAM_KEY` are read server-side
  only, by `getBlueDonLiveStreamSecrets()`.
- `getBlueDonLiveRtmpPublicConfig()` is the only shape that crosses to the
  client, and it holds copy — steps, presets, checklists — never credentials.
- Credentials reach a browser only through `revealStreamCredentialsAction()`,
  which re-checks `canManageCampusMedia` on every call.
- The audience view of the panel never renders the Advanced disclosure at all.

## Files

| File | What it holds |
| --- | --- |
| `src/components/media/live-broadcast-panel.tsx` | The five-step panel, the status badge, and the Advanced disclosure |
| `src/components/media/how-we-go-live.tsx` | The "How we go live at Madonna" card |
| `src/config/broadcast-media.ts` | Step copy, show presets, preview checks, house rules, preview-window helper |
| `src/components/organizations/club-tab-panels.tsx` | Control Room order and the advisor console card |
| `src/components/media/media-hub-sections.tsx` | `/media` order |
| `src/app/(campus)/madonna/broadcast/page.tsx` | Madonna hub Go live card |

## How to verify

1. Sign in as a Broadcasting officer (or run `scripts/grant-broadcast-ops.mjs`
   for a student account) and open `/organizations/broadcasting?tab=media`.
2. The first card is **Go live** with five numbered steps. No RTMP URL, stream
   key, or OBS checklist is visible without opening a disclosure.
3. Tap a show preset — the show name field fills in.
4. Press **Go Live**. The badge flips to **LIVE**, steps 1–4 show green checks,
   and **End broadcast** becomes the only live control.
5. Press **End broadcast**. The show appears under Past Broadcasts.
6. Open **Advanced · Advisor setup** inside the panel and press **Reveal stream
   target** — the RTMP URL and key appear, as before.
7. Sign in as a student with no Broadcasting membership and open `/media`. The
   Go live card is absent; the Blue Don Live watch card reads **Offline** or
   **LIVE** and offers no controls.
