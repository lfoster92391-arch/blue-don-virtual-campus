# Student Command Center

Lisa — how `/home` works as each student’s hub, plus advisor messages, meetings, and My Tasks.

## Where students see it

**Route:** `/home` (Command Center)

Sections (top → bottom):

1. **Club operations (live)** — what IT / Broadcasting / Cricut are doing right now
2. **Messages & advisor requests** — unread first; “View later” list underneath
3. **Club meetings** — own club(s) only + mandatory all-hands
4. **My Tasks** — assigned work with status + past-due callouts
5. **Today at Madonna** briefing (weather, schedule, announcements, discovery) — unchanged professional briefing

## Club operations — the live ops pulse

The top panel of `/home` is the “inside the command center” board: one card per
focus club answering **what are they doing right now**.

**Code:** `src/services/club-ops-pulse-service.ts` → `src/components/home/club-ops-pulse.tsx`

### Who sees which clubs

| Viewer | Sees |
|--------|------|
| Student / parent | Only focus clubs they are an **ACTIVE** member of |
| Admin, advisor, teacher, coach, counselor, staff | **All three** clubs (“Monitoring” badge) |
| Nobody in a focus club, no monitor role | Panel does not render |

Money detail (ledger balance, pending invoice queue) is **officer or admin only**
— President / VP / Secretary of that club, or a faculty monitor role. Everyone
else still sees fundraiser goal bars.

### What each card monitors

| Club | Verb | Live data |
|------|------|-----------|
| **IT Club** | Building | Club projects in progress / planning (titles), tasks in progress, open help-desk tickets (`TECHNICAL`), pending invoices + ledger balance (officers), meetings today |
| **Broadcasting** | Prepping to broadcast | Today’s rundown fill (`broadcast_daily_scripts` values vs template `STUDENT_FILL` slots), next air time (`broadcast_schedules`), announcement submissions pending, coverage bookings pending + next accepted booking, studio equipment checklist, join applications |
| **Cricut Club** | Making | Orders by status (Order sent · In production · Ready for pickup · Completed), what is on the cut table right now (most recently touched in-production order + line items), design submissions pending / in production, active listings |

Every card also carries the shared ops set: next meeting, past-due tasks,
active fundraisers, and goal bars.

### Goals

Goal bars are derived, not a new table:

- **Fundraisers** — `club_fundraisers.goal_cents` vs deposits tagged to that
  fundraiser in `club_ledger_entries`
- **Assigned work completed** — completed vs completed + open `club_student_tasks`
- **Today’s rundown ready** (Broadcasting) — filled vs total student-fill slots
- **Studio gear checked** (Broadcasting) — `broadcast_equipment_items.is_checked`
- **Production queue cleared** (Cricut) — completed orders vs completed + open pipeline

### Resilience

No new schema — everything reads existing tables. Each club section is wrapped
in its own soft-fail, so a broken query degrades that one card to a quiet state
instead of blanking `/home`.

## Advisor / officer → student messages

### Who can send

| Role | Can message club members | Invoice/receipt requests |
|------|--------------------------|--------------------------|
| Admin / Advisor | Yes (any focus club) | Yes |
| President / VP | Yes (their club) | Yes |
| **Secretary** | Yes (their club) | **Yes — primary** |
| Member | No | No |

### Where to compose

- **Whole group, one screen:** `/messages/clubs` → Message clubs (see below)
- **Admin:** `/admin/students` → Message students
- **Club officers:** `/organizations/{slug}?tab=messages`
  - Advisor request form
  - Invoice/receipt request form (Secretary+)
  - Pending receipt-request status list

### Message clubs — group audiences

**Route:** `/messages/clubs`

One compose form for whole-group announcements. Pick an audience, write a title
and body, optionally attach a link, send. Recipients read it in the same
**Messages & advisor requests** panel on `/home` — there is no second inbox.

| Audience | Goes to |
|----------|---------|
| IT Club | Every ACTIVE IT Club member |
| Broadcasting | Every ACTIVE Broadcasting member |
| Cricut Club | Every ACTIVE Cricut Club member |
| **Everyone in Groups** | All three rosters, **deduplicated** — someone in two clubs gets one message, not two |

Permissions reuse `canSendClubMessages`, so admins, advisors, and academy
managers see all four audiences; a club officer (President / VP / Secretary)
sees only the club they hold office in. Nobody else gets an audience, and the
page says so instead of erroring.

"Everyone in Groups" only appears when the sender can reach **two or more**
clubs. Each club is sent as its own batch so every message keeps its
`organizationId` and shows the club it came from.

**Code:** `src/config/club-audiences.ts` → `src/services/club-audience-message-service.ts`
→ `sendClubAudienceMessageAction` → `sendStudentMessages`. No new table, no
second messaging stack.

**Nav:** Staff & Admin → Message clubs. Officers reach it from the
Madonna Hub → Participate → "Message your club" card, which only renders when
the viewer actually has an audience.

### Action button types

| `actionType` | Student sees | Behavior |
|--------------|--------------|----------|
| `link` | Check it out | Navigates to `href` |
| `view_later` | View Later | Status → `VIEW_LATER` (still on Command Center) |
| `add_to_calendar` | Add to calendar | Downloads `.ics` from message calendar fields |
| `upload_receipt` | Upload receipt | Deep-links to club Invoices tab |
| `custom` | Custom label | Navigates to `href` if present |

Statuses: `UNREAD` → `VIEW_LATER` → `DONE` / `DISMISSED`

### Secretary invoice / receipt requests

1. Secretary opens club **Messages** tab → **Request invoice / receipt**
2. Picks members or whole club; title e.g. “Your Secretary requested an invoice/receipt for [expense]”
3. Student sees it on Command Center with **[ Upload receipt ] [ View Later ]**
4. Upload receipt goes to existing Club Invoice flow (`?tab=invoices`)
5. Secretary sees pending request statuses on the same Messages tab

**Finance split:** Secretary still **views** club financials. Only President / VP / Admin **approve** invoices (`org:finances:manage` removed from Secretary).

## Meetings visibility

| Meeting type | Who sees it |
|--------------|-------------|
| Regular club meeting (IT / Broadcast / Cricut) | Members of **that club only** |
| **Mandatory all-hands** (`mandatoryAllClubs`) | **Every** focus-club member |
| Creating mandatory all-hands | **IT** President/VP or Admin only |
| Creating regular meetings | President / VP / Admin (Secretary: view only) |

Data: `ClubCalendarEvent.mandatoryAllClubs`

## My Tasks

| Field | Notes |
|-------|-------|
| Status | `NOT_STARTED` · `IN_PROGRESS` · `SUBMITTED` · `COMPLETED` |
| Assign | President / VP / Admin only |
| Update status | Assignee (or President/VP/Admin) |
| Surface | Command Center + club **My Tasks** tab |

Past-due = `dueAt` in the past and status not Submitted/Completed.

## Migrations

`prisma/migrations/20260804120000_command_center_messages_tasks_meetings`

Tables: `student_messages`, `club_student_tasks`; column `club_calendar_events.mandatory_all_clubs`.

### Broadcasting production suite messages

Kinds added in `20260804160000_broadcast_production_suite`:

| Kind | Trigger | Deep link |
|------|---------|-----------|
| `BROADCAST_BOOKING` | Club/team coverage request | `?tab=bookings` |
| `BROADCAST_ANNOUNCEMENT_SUBMISSION` | Morning announcement submit | `?tab=submissions` |
| `BROADCAST_JOIN_APPLICATION` | Join portal application | `?tab=applications` |

See `docs/BROADCASTING_PRODUCTION_SUITE.md`.
