# 09 — Event Engine

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `06_RBAC_PERMISSIONS.md`, `10_ORGANIZATION_WORKSPACES.md`  
**Current implementation:** `prisma/schema.prisma` `Event`, `EventParticipant`, `EventReminder`; `src/app/(campus)/events/*`, `src/services/event-service.ts`

---

## Purpose

Specify **create once, publish everywhere** event authoring: extended event model, publication surfaces, workflow, and migration from academy-scoped events (Phase 4).

---

## Navigation Placement

| Surface | Route | Nav |
|---------|-------|-----|
| **Global events list** | `/events` | Absorbed into Calendar + org workspaces (target); interim keep `/events` |
| **Calendar** | `/calendar` | Dashboard widget + primary nav until IA migration |
| **Create event** | `/events/new`, `/orgs/[slug]/events/new` | Quick action + org workspace Events tab |
| **Event detail** | `/events/[id]` | Deep link from all surfaces |
| **Admin templates** | `/admin/events/templates` | Administration |

**Mobile:** Create event from org workspace FAB; calendar remains bottom-nav item during transition.  
**Desktop:** Multi-column publish target picker on create/edit form.

---

## Core Concept: Event vs Publication

Today `Event` is both the canonical record **and** the only publication surface (academy-scoped list + calendar).

**Target model:**

```
Event (canonical record, one source of truth)
  └── EventPublication[] (where/when/how it appears)
        ├── CAMPUS_CALENDAR
        ├── ORG_PAGE
        ├── SCHOOL_HUB
        ├── BLUE_DON_FEED
        ├── DASHBOARD_HIGHLIGHT
        ├── NOTIFICATION
        └── GOOGLE_CALENDAR (external)
```

One authoring action creates/updates `Event` and selected `EventPublication` rows. Consumers query publications, not raw events.

---

## Event Model Extensions vs Current Schema

### Current `Event` (Phase 4)

| Field | Notes |
|-------|-------|
| `academyId` | **Required** — limits cross-org events |
| `title`, `startDate`, `endDate`, `location`, `description` | Core |
| `status` | `DRAFT`, `SCHEDULED`, etc. |
| `impactPoints` | Used by rewards (future) |
| `archiveFlag` | Soft delete |
| `createdById` | Creator |

Relations: `EventParticipant`, `EventReminder`, `Assignment`, `Checklist`, `PortfolioItem`

### Proposed extensions

| Field / model | Purpose |
|---------------|---------|
| `organizationId` | Optional; primary org (club, team, class). `academyId` retained for migration |
| `schoolWide` | Boolean; publishes to School Hub |
| `eventType` | `GENERAL`, `GAME`, `FUNDRAISER`, `SERVICE`, `MEETING`, `PERFORMANCE`, `DEADLINE` |
| `visibility` | `PUBLIC`, `CAMPUS`, `ORG_MEMBERS`, `INVITE_ONLY` |
| `coverImageUrl` | Feed / org page |
| `recurrenceRule` | iCal RRULE string |
| `parentEventId` | Recurrence series |
| `fundraiserId` | Link to fundraiser campaign |
| `maxAttendees` | RSVP cap |
| `rsvpRequired` | Boolean |
| `googleCalendarEventId` | External sync |
| `publishedAt` | First publish timestamp |
| `EventPublication` | Surface targets (see below) |
| `EventAttachment` | Docs, flyers |
| `EventVolunteerSlot` | Volunteer shifts |

### `EventPublication` model

```prisma
enum EventSurface {
  CAMPUS_CALENDAR
  ORG_PAGE
  SCHOOL_HUB
  BLUE_DON_FEED
  DASHBOARD_HIGHLIGHT
  PUSH_NOTIFICATION
  EMAIL_DIGEST
  GOOGLE_CALENDAR
}

model EventPublication {
  id          String       @id @default(cuid())
  eventId     String       @map("event_id")
  surface     EventSurface
  status      PublishStatus @default(PENDING) // PENDING, LIVE, REMOVED
  scheduledAt DateTime?    @map("scheduled_at")
  publishedAt DateTime?    @map("published_at")
  config      Json?        // surface-specific: feed excerpt, notification audience
  event       Event        @relation(...)
  @@unique([eventId, surface])
  @@map("event_publications")
}
```

---

## Authoring Workflow

```
DRAFT → REVIEW (optional, org lead) → SCHEDULED → LIVE → COMPLETED
                  ↓                      ↓
              CANCELLED              publications activated at scheduledAt
```

| Step | Actor | Rules |
|------|-------|-------|
| Create draft | `events:manage` or org `org:events:manage` | Default visibility `CAMPUS` |
| Select surfaces | Author | Each surface may have scheduled publish time |
| Review | Org `lead` for club events; `admin` for school-wide | Configurable per org type |
| Publish | System job at `scheduledAt` or immediate | Creates `EventPublication` LIVE rows |
| Sync Google | Integration job | Phase 21; uses `GOOGLE_CALENDAR` publication |
| Complete | Auto after `endDate` + buffer | Archive; rewards XP if configured |

---

## Publication Surface Behavior

| Surface | Consumer | Content shown |
|---------|----------|---------------|
| `CAMPUS_CALENDAR` | `/calendar`, dashboard `calendar_week` | Full event |
| `ORG_PAGE` | `/orgs/[slug]/events` | Org-branded card |
| `SCHOOL_HUB` | `/school-hub/announcements` | School-wide banner |
| `BLUE_DON_FEED` | Blue Don Corner | Short post + image + RSVP link |
| `DASHBOARD_HIGHLIGHT` | Role-filtered dashboard card | Pin for 48h |
| `PUSH_NOTIFICATION` | Notification service | Title + time + link |
| `EMAIL_DIGEST` | Weekly parent/staff digest | Summarized |
| `GOOGLE_CALENDAR` | Google Calendar API | Two-way per `13_INTEGRATIONS.md` |

**Rule:** Unpublishing removes `EventPublication` (status `REMOVED`); canonical `Event` remains for audit unless `archiveFlag`.

---

## RSVP, Participants, Volunteers

Existing `EventParticipant` extended:

| `ParticipantRole` | Add | Use |
|-------------------|-----|-----|
| Existing | ORGANIZER, VOLUNTEER, ATTENDEE, SPEAKER | Keep |
| New | PLAYER | Athletics roster games |
| New | CHAPERONE | Trips |

`EventVolunteerSlot`: slot title, capacity, linked participants.

**Attendance → rewards:** On `ATTENDED`, queue `rewards-service` for XP/coins (see `12_REWARDS_GAMIFICATION.md`).

---

## Permissions

| Action | Permission |
|--------|------------|
| Create event (school-wide) | `events:manage` + `admin` or `staff` |
| Create event (org) | `org:events:manage` on that org |
| Publish to `SCHOOL_HUB` | `events:publish` + approval workflow |
| Publish to `BLUE_DON_FEED` | `feed:post` or org officer |
| View `INVITE_ONLY` | Participant or organizer |
| Manage fundraisers attach | `org:events:manage` + fundraiser owner |

---

## Mobile vs Desktop

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Create form | Step wizard: basics → surfaces → RSVP | Single page with sidebar preview |
| Surface picker | Checkbox list with icons | Matrix with schedule per surface |
| Calendar view | Agenda list default | Month grid default |
| RSVP | One-tap + add to device calendar | RSVP + reminder preferences |
| Publish preview | Card previews swipeable | Multi-panel live preview |

---

## Scalability Notes

| Concern | Approach |
|---------|----------|
| Publication fan-out | Async job per surface (`publish-event-job`) |
| Calendar queries | Index `(startDate, schoolWide, organizationId)`; materialized month cache |
| Feed spam | Rate limit: 3 feed publications/user/day without moderator |
| Recurrence | Expand instances lazily for calendar; store RRULE on parent |
| Google sync | Queue with exponential backoff; conflict resolution last-write-wins with audit |
| Notifications | Batch digest vs immediate per `config` |

---

## Mapping to Phase 0–15 Code

| As-built | File / model | Migration |
|----------|--------------|-----------|
| `Event.academyId` required | `schema.prisma` | Make optional; add `organizationId`; backfill academy orgs |
| Event CRUD | `event-service.ts`, `events/actions` | Add publication writes |
| Calendar | `event-service.getCalendarEntries` | Query via `EventPublication` LIVE on `CAMPUS_CALENDAR` |
| Event detail page | `events/[id]/page.tsx` | Show publication badges |
| Google stub | UI message only | Wire in Phase 21 |
| `impactPoints` | `Event.impactPoints` | Map to rewards on attendance |
| Checklists on events | `Checklist.eventId` | Unchanged |
| Assignments on events | `Assignment.eventId` | Unchanged |

**Data migration script (Phase 17):** For each existing `Event`, create `EventPublication` rows for `CAMPUS_CALENDAR` + `ORG_PAGE` (academy) as LIVE.

---

## Related Documents

- [10_ORGANIZATION_WORKSPACES.md](./10_ORGANIZATION_WORKSPACES.md)
- [12_REWARDS_GAMIFICATION.md](./12_REWARDS_GAMIFICATION.md)
- [13_INTEGRATIONS.md](./13_INTEGRATIONS.md) — Google Calendar
- [05_ROADMAP.md](./05_ROADMAP.md) — Phase 17
