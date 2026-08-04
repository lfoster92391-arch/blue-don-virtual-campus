# Student Command Center

Lisa — how `/home` works as each student’s hub, plus advisor messages, meetings, and My Tasks.

## Where students see it

**Route:** `/home` (Command Center)

Sections (top → bottom):

1. **Messages & advisor requests** — unread first; “View later” list underneath
2. **Club meetings** — own club(s) only + mandatory all-hands
3. **My Tasks** — assigned work with status + past-due callouts
4. **Today at Madonna** briefing (weather, schedule, announcements, discovery) — unchanged professional briefing

## Advisor / officer → student messages

### Who can send

| Role | Can message club members | Invoice/receipt requests |
|------|--------------------------|--------------------------|
| Admin / Advisor | Yes (any focus club) | Yes |
| President / VP | Yes (their club) | Yes |
| **Secretary** | Yes (their club) | **Yes — primary** |
| Member | No | No |

### Where to compose

- **Admin:** `/admin/students` → Message students
- **Club officers:** `/organizations/{slug}?tab=messages`
  - Advisor request form
  - Invoice/receipt request form (Secretary+)
  - Pending receipt-request status list

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
