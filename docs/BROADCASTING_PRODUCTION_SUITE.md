# Broadcasting Production Suite

Lisa — full Studio B production tools on top of Watch Broadcasting, Daily Rundown, OBS live, and Command Center.

## Where to go

| Surface | Route |
|---------|--------|
| Audience watch hub | `/media` |
| Madonna hub (2-button entry) | `/madonna` — see `docs/MADONNA_HUB.md` |
| Broadcasting club | `/organizations/broadcasting` |

### Audience tabs (`/organizations/broadcasting`)

| Tab | Query | What it does |
|-----|--------|--------------|
| Overview | (default) | Countdown, watch links, daily announcement |
| Watch | `?tab=media` | Live, highlight reel, on-demand categories |
| Book coverage | `?tab=book` | Request film / photo / live stream |
| Submit announcement | `?tab=announce` | Morning-announcement requests |
| Credits | `?tab=credits` | Production credit roll (view) |
| Join | `?tab=join` | Sign-up with Host / Camera / Editor tracks |

### Crew tabs (members + officers)

| Tab | Query | What it does |
|-----|--------|--------------|
| Daily Rundown | `?tab=script` | Morning show script (existing) |
| Control Room | `?tab=media` | Five-step **Go live** panel, upload (with categories), countdown set. OBS and stream keys sit under Advanced — see `docs/STUDENT_GO_LIVE.md` |
| Bookings | `?tab=bookings` | Accept / decline / complete coverage requests |
| Submissions | `?tab=submissions` | Approve announcement submissions |
| Equipment | `?tab=equipment` | Gear checklist check-in |
| Applications | `?tab=applications` | Review join applications |
| Credits | `?tab=credits` | Assign Host / Camera / Editor roles |
| Messages / Tasks / Calendar | existing | Command Center integration |

## Feature notes

1. **Countdown** — Crew sets next air time on Overview / Control Room / `/media`. Audience sees the live timer.
2. **On-demand categories** — Morning Announcements, Sports Highlights, Student Spotlight, Special Events (+ Highlight Reel). Set on upload or from the library categorize control.
3. **Highlight Reel** — Mark uploads as highlight reel; dedicated section on `/media` and Control Room, and a playlist-style reel at `/madonna/highlight-reel`. Crew curate it by ticking the box at upload or pressing **Add to reel** in Sports Recap — clips are never auto-detected from game film.
4. **Event booking** — Submits → Command Center message (`BROADCAST_BOOKING`) to Broadcasting crew → status pending / accepted / declined / completed.
5. **Announcement submissions** — Faculty/students submit → crew review → approve can publish today’s Daily Announcement; Command Center notify (`BROADCAST_ANNOUNCEMENT_SUBMISSION`).
6. **Credit roll** — Gallery by production role; officers add from club roster.
7. **Equipment checklist** — Default Studio B kit; crew check in/out; add custom gear.
8. **Join portal** — Track selection + review; accept adds ACTIVE membership and seeds a credit role.

## Permissions

| Who | Can |
|-----|-----|
| Any signed-in user | Countdown (view), watch, highlight reel, credits (view), book, submit announcement, join |
| ACTIVE Broadcasting member (`isBroadcastCrewMember`) | Fill today's Daily Rundown slot values |
| Broadcasting officers / advisors (`canManageCampusMedia`) | Set countdown, categorize, process bookings/submissions, equipment, applications, credit roll, daily prayer |
| Advisors / admins (`canManageAcademy`) | Daily Rundown template structure |

Watching is a signed-in campus check, not an email-domain check: students the
office provisioned on an outside address (no school mailbox yet) can watch
published video like anyone else. The `@weirtonmadonna.org` rule still applies
to self-service registration.

No XP on these surfaces.

## Command Center

Booking, announcement, and join events use `sendSystemStudentMessages` (same pattern as Cricut orders). Students see them on `/home` with **Check it out** deep links into the right Broadcasting tab.

## Migration

`prisma/migrations/20260804160000_broadcast_production_suite/`

Adds schedule, bookings, announcement submissions, crew credits, equipment items, join applications, media `category` / `is_highlight_reel`, and new `StudentMessageKind` values.
