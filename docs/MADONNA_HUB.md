# Madonna Hub

The signed-in front door for Madonna students, staff, and families. `/madonna`
is not a menu of everything — it answers "what do I need right now?" and then
hands off to one of **five sections**. Every route requires campus login
(`requireCompleteProfile` inside the `(campus)` layout, which already runs
`requireCampusAccess`).

## Routes

| Route | Who | What |
|-------|-----|------|
| `/madonna` | Everyone signed in | Front door: greeting, date, weather, LIVE band, TODAY snapshot, What's Happening, five section tiles, lunch link |
| `/madonna/today` | Everyone | Today's announcement in full, bell schedule, next game + next broadcast, weather, today in Madonna history |
| `/madonna/sports` | Everyone | Scores, schedules, sport switcher, student coverage, submit forms, and the full recap video library |
| `/madonna/sports/reel` | Everyone | The crew-curated highlight reel, playlist-style |
| `/madonna/broadcast` | Everyone | Blue Don Live, today's announcement, next-air countdown, announcement archive, submit an announcement, control room (crew) |
| `/madonna/campus` | Everyone | Bell schedule, lunch on FuelTheDons, calendar, weather station, archive, history (+ parent portal/guide for parents) |
| `/madonna/participate` | Everyone | Submit an announcement, cover a game, join a club, ask the help desk |

### Legacy URLs

Nothing was deleted silently. The three old URLs redirect into their new homes:

| Old | New |
|-----|-----|
| `/madonna/announcements` | `/madonna/broadcast` |
| `/madonna/sports-recap` | `/madonna/sports` |
| `/madonna/highlight-reel` | `/madonna/sports/reel` |

`/madonna` is in `FOCUSED_MODE_ALLOWED_PREFIXES`, so every route above — new
and legacy — stays live under `FOCUSED_CLUBS_MODE`. One prefix covers all
children; adding a sixth section needs no allowlist change.

## The five sections are configuration, not markup

`src/config/madonna-hub.ts` holds `MADONNA_HUB_SECTIONS`: key, label, href,
icon, eyebrow, and **two** descriptions — one written for a student, one for a
parent. Three things read that array:

1. the hub tiles (`MadonnaSectionTiles`),
2. the section pills on every section page (`MadonnaSectionNav`),
3. the sidebar group (`madonnaHubGroup` in `src/config/navigation.ts`).

So the sidebar cannot drift from the pages, and renaming a section is a
one-line change. `describeMadonnaSection(section, role)` picks the student or
parent line.

## Progressive disclosure

The front door is deliberately ordered, not gridded:

1. **Header** — greeting, full date, a weather chip when the station has a
   reading, and a red "On air now" pill when Broadcasting is live.
2. **LIVE band** — `LiveNowPanel`, rendered *only* when something is actually on
   air. Offline, the hub says nothing rather than showing a dead player.
3. **TODAY snapshot** — where you are in the bell schedule plus the first few
   lines of today's announcement, with "Full day" and "Read it all" links.
4. **What's Happening** — next game (`getCurrentOrNextGame`, 14-day horizon) and
   next broadcast (`getBroadcastSchedule`), each with its own honest empty state.
5. **Section tiles** — Today at full width, then Sports / Broadcast / Campus /
   Participate in a 2×2. Tile meta strings (`3 videos on file`, `Live right now`)
   are omitted entirely when there is nothing true to say.
6. **Lunch** — one labelled external row (see below).

## Role-aware framing

Phase 2 keeps one hub and changes the words, rather than forking a parent app:

- Tile and section copy switch to the parent line for `role === "parent"`.
- The header subtitle, the Campus link list, and the Participate intro all read
  differently for a parent.
- Parents get Parent Portal / Parent Guide links on the hub and in Campus;
  students get Blue Don Pass instead.
- A deeper parent hub (multi-role accounts, per-child views) is later work.

## Lunch is not here

Madonna runs menus, lunch orders, and cafeteria payments on **FuelTheDons**. The
campus app keeps no menu calendar, order board, kitchen prep sheet, dietary
queue, or cafeteria ledger.

- `src/config/fuel-the-dons.ts` — URL (overridable with
  `NEXT_PUBLIC_FUEL_THE_DONS_URL`), name, host, and the standing blurb.
- `src/components/lunch/fuel-the-dons-link.tsx` — `FuelTheDonsRow` (the card)
  and `FuelTheDonsLink` (inline). Both open in a new tab, show the host, and are
  labelled as leaving the site.
- It appears on `/madonna`, `/madonna/today`, `/madonna/campus`, `/parent`,
  `/parent/guide`, `/hub`, the focused-mode home briefing, and `/lunch`.

### What was retired

| Route | Now |
|-------|-----|
| `/lunch` | Short "lunch is on FuelTheDons" page with the link |
| `/lunch/selections` | Redirects to `/lunch` |
| `/lunch/kitchen` | Redirects to `/lunch` |
| `/admin/lunch-menu` | Redirects to `/lunch` |
| `/admin/dietary` | Redirects to `/lunch` |
| `/admin/cafeteria` | Redirects to `/lunch` |

Sidebar entries for Cafeteria Lunch, Your Lunch Selections, Kitchen Prep Sheet,
Lunch Menu Calendar, Dietary Forms, and Cafeteria Accounts are gone from both
`focusedClubsNavigation` and `groupedNavigation`. The static weekday menu no
longer renders anywhere — `HubDigest` dropped its `lunch` field so nothing can
put that fixture back on screen by accident.

Deliberately **not** done: the Prisma tables (`LunchOrder`, `CafeteriaAccount`,
`CafeteriaLedgerEntry`, dietary records, published menus) and their services are
still in the repo. Retiring the UX does not need a destructive migration, and
keeping the rows means a lunch history question can still be answered. Dropping
them is optional later work.

## Sidebar

One collapsible **Madonna Hub** group replaces the five flat Madonna links that
used to sit in the sidebar:

```
Madonna Hub
  Hub  ·  Today  ·  Sports  ·  Broadcast  ·  Campus  ·  Participate
```

Focused mode renders it directly under Home; the full campus tree
(`groupedNavigation`) gets the same group as a top-level entry, and the Madonna
links were removed from **My Campus**.

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
  `isSportsTaggedMedia`) plays on Sports; anything else plays on Broadcast, and
  the other page links across rather than duplicating it.

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

## What lands in Sports

`/madonna/sports` wraps two existing systems rather than reimplementing either:

- `SportsAudienceSections` with `basePath="/madonna/sports"` — the same banner,
  sport switcher, schedule, student write-ups, and submit forms as `/sports`.
  The `?sport=` query string works identically.
- `listSportsRecapVideos()` in `src/services/media-service.ts` for the recap
  library. It unions three signals, because category tagging is not complete
  historically:
  1. `CampusMediaItem.category` in `SPORTS_HIGHLIGHTS` / `HIGHLIGHT_REEL`
  2. `CampusMediaItem.isHighlightReel = true`
  3. Any media item linked from a `SportsHighlight`

  plus published `SportsHighlight` rows that carry their own `videoUrl` and no
  linked upload, so sports-desk posts are not lost. Only published uploads and
  ended live streams are included; drafts and in-flight lives stay out.

Schedules and rosters are **read through services only**. The hub never touches
the sports seed or import scripts.

## Uploading game video (crew)

Anyone passing `canManageCampusMedia` (Broadcasting crew, Broadcast Academy,
advisors/admins) can upload.

1. Go to `/madonna/sports` → **Upload sports highlight**. Category is pre-set to
   Sports Highlights.
2. Choose an MP4/WebM/MOV up to 50 MB, **or** paste a hosted URL (unlisted
   YouTube is easiest for full game film).
3. Tick **Feature in Highlight Reel** to also put it in the reel.
4. **Publish to Sports.** Uploads are created with `status = PUBLISHED`, so they
   are visible immediately — there is no draft/approval step.

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
the box at upload or by pressing **Add to reel** on any card in the Sports
library (crew only — calls the existing `updateMediaCategoryAction`, preserving
the item's category).

`/madonna/sports/reel` plays them as a playlist: one large player plus an
up-next queue. Uploaded files auto-advance on `ended`; embedded YouTube/Vimeo
players cannot report completion from an iframe, so those advance on **Next**.

## Resilience

Every page wraps its data calls in a local `safe()` helper and renders empty
states rather than throwing, so a database hiccup degrades the hub instead of
500-ing it. `listSportsRecapVideos` / `listAnnouncementVideos` fall back to the
demo broadcast fixtures when the database is not configured. Nothing on the hub
invents a game, an announcement, an air time, or a video count — when there is
no data, the panel says so in plain words.
