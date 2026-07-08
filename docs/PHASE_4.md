# Phase 4 — Calendar & Events

**Status:** Complete — awaiting approval  
**Goal:** Campus coordination — events drive activity

## Deliverables

- [x] Prisma models: `academies`, `events`, `event_participants`, `assignments`, `event_reminders`
- [x] Migration `20250703000000_phase4_calendar_events` with default academy seed data
- [x] Seed script (`npm run db:seed`) for Madonna High School + academies
- [x] `/calendar` — Month, Week, Day, Agenda, and Academy filter views
- [x] `/events` — Cross-academy event list
- [x] `/events/new` — Event creation for admin and advisor roles
- [x] `/events/[id]` — Overview, Assignments, Participants, plus shell sections for Budget, Checklist, Sponsors, Reflection, Archive
- [x] Server actions: `createEvent`, `joinEvent`, `leaveEvent`, `createAssignment`
- [x] Services: `event-service`, `assignment-service` with server-side auth checks
- [x] Role permissions: `events:manage`, `events:participate`
- [x] Participation with automatic reminder scheduling (1 day before event end)
- [x] Dashboard widgets wired to real upcoming events, assignments, and calendar entries
- [x] Sidebar Calendar and Events navigation enabled
- [x] `siteConfig.phase` updated to `4`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/calendar` | All authenticated users | Multi-view campus calendar |
| `/events` | All authenticated users | Cross-academy visibility |
| `/events/new` | Admin, Advisor | Create campus/academy events |
| `/events/[id]` | All authenticated users | Join/leave, view assignments |

## Database

New tables follow `05_DATABASE_BLUEPRINT.md`:

- **academies** — Technology, Broadcast, Creative Studio, Business, Service
- **events** — Scheduled campus activities with academy, dates, location, impact points
- **event_participants** — Registration, role, attendance, reflection fields
- **assignments** — Linked to events and academies with due dates and points
- **event_reminders** — Per-user reminders on participation

Calendar entries are **derived** from events and assignments (no separate `calendar_events` table).

## Auth & Permissions

- Uses existing `requireCompleteProfile` / `requireUser`
- Admin and advisor: `events:manage` (create events and assignments)
- All campus roles: `events:participate` (view and join events)
- Prisma + server-side checks (RLS deferred to Supabase later)

## Dashboard Integration

- **Metrics** — Live counts for due-this-week assignments and upcoming events
- **Calendar widget** — Week strip with today’s entries from database
- **Events widget** — Next upcoming events with links to detail pages
- **Assignments widget** — User and open campus assignments from events

## Not Included (By Design)

- Forms & Governance (Phase 5)
- Checklist engine (Phase 7)
- Simulations
- Google Calendar two-way sync (stubbed as future in UI)
- Budget, sponsor, and reflection workflows (shell sections only)
- Live notification delivery

## Setup

```bash
npm run db:migrate   # Apply Phase 4 migration
npm run db:seed      # Ensure academies + Madonna school
npm run build        # Verify production build
```

## Success Criteria

- [x] Events can be created by authorized roles
- [x] Students can view and join events across academies
- [x] Assignments link to events and surface on dashboard/calendar
- [x] Calendar and Events nav routes are live
- [x] Dashboard shows real data when database is configured
- [x] `npm run build` passes

## Next Phase

**Phase 5 — Forms & Governance**

**Stop after Phase 5 and wait for approval.**
