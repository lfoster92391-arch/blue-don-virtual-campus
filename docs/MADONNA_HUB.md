# Madonna Hub

A signed-in landing surface for Madonna students and staff with two clear entry
buttons: **Madonna Announcements** and **Madonna Sports Recap**. Every route
requires campus login (`requireCompleteProfile` inside the `(campus)` layout,
which already runs `requireCampusAccess`).

## Routes

| Route | Who | What |
|-------|-----|------|
| `/madonna` | Students + staff | Hub. LIVE-now band, two large CTAs, quick links |
| `/madonna/announcements` | Students + staff | Live stream, today's announcement, countdown, announcement archive, submit form |
| `/madonna/sports-recap` | Students + staff | Every sports / recap video, newest first |
| `/madonna/highlight-reel` | Students + staff | Crew-curated reel, playlist-style |

`/madonna` is in `FOCUSED_MODE_ALLOWED_PREFIXES`, so all four routes stay live
under `FOCUSED_CLUBS_MODE`. Nav entries exist in both `focusedClubsNavigation`
and `groupedNavigation` (My Campus), plus buttons from `/media`.

## LIVE now

`LiveNowPanel` (`src/components/media/live-now-panel.tsx`) reads the existing
`getActiveLiveStream()` — a `CampusMediaItem` with `type = LIVE_STREAM` and
`status = LIVE`. There is no separate live state to maintain.

- **On air** — red "LIVE NOW" band with the broadcast title and the embed
  playing inline. If the crew has not pasted a public player URL, the panel says
  so instead of showing a dead frame.
- **Offline** — a plain "Offline" card with the next scheduled air time from
  `getBroadcastSchedule()`. It never renders a fake LIVE state.
- **Routing** — a stream tagged `SPORTS_HIGHLIGHTS` / `HIGHLIGHT_REEL` (see
  `isSportsTaggedMedia`) plays on Sports Recap; anything else plays on
  Announcements, and the other page links across rather than duplicating it.

Going live is unchanged: Control Room / `/broadcast/studio` → **Go Live**.

## Watch later / review

`VideoGrid` splits every library into three tabs:

1. **Recent (30d)** — anything published in the last 30 days
2. **Full archive** — everything, newest first
3. **Watch later** — the viewer's saved list

Saving uses the bookmark button on each card. The list is stored per user in
`localStorage` (`blue-don:watch-later:<userId>`) via
`src/components/media/use-watch-later.ts` — no migration, and it keeps working
when the database is unreachable. The trade-off is that saves are per browser.
Moving it server-side later only means swapping the hook for server actions; the
grid API does not change.

## What lands in Sports Recap

`listSportsRecapVideos()` in `src/services/media-service.ts` unions three
signals, because category tagging is not complete historically:

1. `CampusMediaItem.category` in `SPORTS_HIGHLIGHTS` / `HIGHLIGHT_REEL`
2. `CampusMediaItem.isHighlightReel = true`
3. Any media item linked from a `SportsHighlight`

plus published `SportsHighlight` rows that carry their own `videoUrl` and no
linked upload, so sports-desk posts are not lost. Only published uploads and
ended live streams are included; drafts and in-flight lives stay out.

## Uploading game video (crew)

Anyone passing `canManageCampusMedia` (Broadcasting crew, Broadcast Academy,
advisors/admins) can upload.

1. Go to `/madonna/sports-recap` → **Upload sports highlight**. Category is
   pre-set to Sports Highlights.
2. Choose an MP4/WebM/MOV up to 50 MB, **or** paste a hosted URL (unlisted
   YouTube is easiest for full game film).
3. Tick **Feature in Highlight Reel** to also put it in the reel.
4. **Publish to Sports Recap.** Uploads are created with `status = PUBLISHED`,
   so they are visible immediately — there is no draft/approval step.

Equivalent paths: `/media` → Upload Video, Control Room
(`/organizations/broadcasting?tab=media`), and the sports desk
(`?tab=sports-desk`) for clips attached to a game.

### How the file actually gets there

Video **never passes through our server**, and this is not an optimization —
it is the only way the feature can work in production:

| Layer | Limit |
|-------|-------|
| Next.js Server Action body | 1 MB by default; raised to 4 MB in `next.config.ts` for the image forms |
| Vercel function request body | 4.5 MB, enforced by the platform, not configurable |
| Supabase project file size | 50 MB on the current plan — the real ceiling |

So the browser does a three-step dance:

1. `createVideoUploadTicketAction` authorizes the producer, validates
   name/size/type, makes sure the `campus-media` bucket exists, and returns a
   **signed Supabase upload URL**.
2. The form `PUT`s the file straight to Supabase over XHR, with a progress bar.
3. `uploadCampusVideoAction` receives only the storage **path**, re-verifies
   that the object exists under `videos/<that user's id>/`, and resolves the
   public URL server-side. A tampered form cannot point a media item at
   somebody else's object.

Raising the 50 MB cap means raising it in Supabase (project storage settings)
**and** in `CAMPUS_MEDIA_MAX_BYTES` (`src/config/campus-video.ts`); the bucket
limit cannot exceed the project limit, and bumping only the constant just moves
the failure to the upload itself.

MIME types from file pickers are unreliable — an iPhone `.MOV` can arrive with
no type at all — so `resolveCampusVideoContentType` falls back to the file
extension before rejecting anything.

## Highlight reel

The reel is **crew-curated, not auto-generated**. Nothing scans game film for
plays. A clip is in the reel when `isHighlightReel = true`, set either by ticking
the box at upload or by pressing **Add to reel** on any card in the Sports Recap
library (crew only — calls the existing `updateMediaCategoryAction`, preserving
the item's category).

`/madonna/highlight-reel` plays them as a playlist: one large player plus an
up-next queue. Uploaded files auto-advance on `ended`; embedded YouTube/Vimeo
players cannot report completion from an iframe, so those advance on **Next**.

## Resilience

Every page wraps its data calls in a local `safe()` helper and renders empty
states rather than throwing, so a database hiccup degrades the hub instead of
500-ing it. `listSportsRecapVideos` / `listAnnouncementVideos` fall back to the
demo broadcast fixtures when the database is not configured.
