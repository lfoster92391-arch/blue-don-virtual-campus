# 07 — Personalized Dashboard

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `01_INFORMATION_ARCHITECTURE.md`, `06_RBAC_PERMISSIONS.md`  
**Current implementation:** `src/app/(campus)/dashboard/page.tsx`, `src/components/dashboard/*`, `src/lib/dashboard/data.ts`

---

## Purpose

Specify **role- and context-personalized dashboards** replacing the single layout in Phase 3. Defines widget catalog, data sources, personalization rules, layout grids, and migration from as-built widgets.

---

## Navigation Placement

| Item | Value |
|------|-------|
| **Primary nav label** | Dashboard |
| **Route** | `/dashboard` (unchanged) |
| **Mobile** | `mobile: true` — first bottom-nav slot for all roles |
| **Icon** | `Home` (unchanged) |
| **Deep links** | `/dashboard?widget=assignments`, `/dashboard/org/[slug]` (future org-scoped mini-dashboard) |

Dashboard is **destination #1** in enterprise IA. Other modules surface summary widgets here; users should not need to visit 12 nav items for daily tasks.

---

## Architecture Overview

```
getDashboardLayout(user) → DashboardLayoutTemplate
  ├── persona: derived from role + grade + org memberships
  ├── widgets: ordered WidgetConfig[]
  └── data: parallel fetch via dashboard-service (aggregates domain services)

DashboardContent → renders widget grid from config (not hardcoded JSX)
```

**Phase 16 deliverable:** `src/config/dashboard-layouts.ts` + `src/services/dashboard-service.ts` refactor. Until then, `dashboard-content.tsx` remains the fallback single layout.

---

## Persona Resolution

Persona = f(global role, grade level, active org context, season flags).

| Persona key | Resolution rule | Layout template |
|-------------|-----------------|-----------------|
| `student_middle` | `student` + grade 7–8 | `student_explorer` |
| `student_freshman` | `student` + grade 9 | `student_onboarding` |
| `student_upper` | `student` + grade 10–11 | `student_pathway` |
| `student_senior` | `student` + grade 12 | `student_graduation` |
| `parent` | `parent` | `parent_hub` |
| `teacher` | `teacher` or `advisor` (teaching) | `teacher_command` |
| `advisor` | `advisor` (non-class focus) | `advisor_oversight` |
| `club_officer` | any role + `officer`/`lead` on ≥1 club | inject `org_officer_strip` widget |
| `athlete` | `student` + `member` on ≥1 `TEAM` org | `athlete_schedule` overlay |
| `coach` | `coach` | `coach_roster` |
| `staff` | `staff` | `staff_operations` |
| `admin` | `admin` | `admin_command` |
| `alumni` | `alumni` | `alumni_connect` |
| `sponsor` | `sponsor` | `sponsor_lite` |

**Grade source:** `StudentProfile.gradeLevel` (proposed) → FACTS sync. Fallback: cohort year until sync live.

**Precedence:** Admin layout wins for `admin` role. Club/athlete overlays **add** widgets, never remove safety/compliance widgets (forms, announcements).

---

## Widget Catalog

### Shared widgets (multiple personas)

| Widget ID | Label | Data source (service) | Roles |
|-----------|-------|----------------------|-------|
| `hero_greeting` | Welcome banner | `User`, `StudentProfile`, time-of-day | All |
| `quick_actions` | Shortcut buttons | `src/config/quick-actions.ts` (new) | All |
| `metrics_strip` | 4-up stat cards | `dashboard-service.getMetrics()` | All (metrics vary) |
| `calendar_week` | 7-day calendar strip | `event-service.getCalendarEntries()` | All |
| `notifications` | Alert list | `notification-service` (Phase 22) | All |
| `school_announcements` | School Hub highlights | `announcement-service` | All |
| `kindness_prompt` | Blue Don kindness nudge | `kindness-service` | student, teacher |

### Student widgets

| Widget ID | Label | Data source | Grades |
|-----------|-------|-------------|--------|
| `assignments_due` | Assignments | `assignment-service.listAssignmentsForUser()` | 9–12 |
| `academy_progress` | MEN progress | `academy-engine-service.getStudentProgressProfile()` | All |
| `events_upcoming` | My events | `event-service.listEvents({ userId })` | All |
| `portfolio_summary` | Portfolio snapshot | `portfolio-service.getPortfolioSummary()` | 9–12 |
| `rewards_balance` | XP + Coins | `rewards-service.getWallet()` | All |
| `journey_next_step` | Journey AI hint (stub) | `journey-service.getRecommendations()` | All |
| `future_center_teaser` | Pathway suggestion | `future-service.getSuggestedPath()` | 10–12 |
| `club_memberships` | My clubs | `org-service.listMemberships()` | All |
| `forms_pending` | Forms to complete | `form-service.listPendingForUser()` | All |

### Teacher / advisor widgets

| Widget ID | Label | Data source | Roles |
|-----------|-------|-------------|-------|
| `class_roster_flags` | Students needing attention | `journey-service.getFlags()` + assignments overdue | teacher, advisor |
| `approvals_queue` | Pending approvals | `form-service`, `academy-service` memberships | teacher, advisor |
| `academy_oversight` | Academy metrics | `academy-engine-service` aggregate | advisor |
| `org_officer_strip` | Clubs I lead | `org-service.listLedOrgs()` | officer overlay |
| `service_tickets_assigned` | My assigned tickets | `ticket-service` | staff, advisor |

### Parent widgets

| Widget ID | Label | Data source |
|-----------|-------|-------------|
| `student_selector` | Linked students | `parent-service.listLinkedStudents()` |
| `student_progress_summary` | Academies + portfolio (linked) | `portfolio-service`, `academy-engine-service` (scoped) |
| `forms_to_sign` | Parent agreements | `form-service.listForParent()` |
| `athletics_schedule` | Team events (linked athlete) | `event-service` filtered by team |
| `future_center_parent` | College prep checklist (read) | `future-service.getParentView()` |

### Admin widgets

| Widget ID | Label | Data source |
|-----------|-------|-------------|
| `system_health` | Integrations + jobs | `integration-service.getHealth()` |
| `compliance_summary` | Forms, agreements status | `compliance-service` |
| `enrollment_snapshot` | Active users by role | `user-service.getCounts()` |
| `moderation_queue` | Feed/media flags | `feed-service.getModerationQueue()` |

### Alumni / sponsor widgets

| Widget ID | Label | Data source |
|-----------|-------|-------------|
| `alumni_network` | Mentorship matches | `alumni-service` |
| `giving_campaign` | Active campaigns | `giving-service` |
| `sponsor_events` | Sponsored events | `event-service` sponsor filter |

---

## Layout Templates (Desktop)

### `student_pathway` (grades 10–11) — default upperclass

```
┌─────────────────────────────────────────────────────────┐
│ hero_greeting                                           │
├─────────────────────────────────────────────────────────┤
│ quick_actions                                           │
├──────────────┬──────────────┬──────────────┬────────────┤
│ metrics_strip (4 cards)                                 │
├──────────────────────────┬──────────────────────────────┤
│ assignments_due          │ calendar_week              │
├──────────────────────────┼──────────────────────────────┤
│ academy_progress         │ events_upcoming              │
├──────────────────────────┼──────────────────────────────┤
│ journey_next_step        │ future_center_teaser         │
├──────────────────────────┴──────────────────────────────┤
│ portfolio_summary                                       │
└─────────────────────────────────────────────────────────┘
```

### `parent_hub`

```
hero_greeting → student_selector → forms_to_sign (priority) → student_progress_summary
→ athletics_schedule → calendar_week → school_announcements
```

### `teacher_command`

```
hero_greeting → approvals_queue → class_roster_flags → calendar_week
→ assignments_due (classes) → service_tickets_assigned → org_officer_strip (if any)
```

### `admin_command`

```
hero_greeting → system_health → compliance_summary → enrollment_snapshot
→ moderation_queue → metrics_strip (school-wide)
```

---

## Personalization Rules

| Rule ID | Rule |
|---------|------|
| D1 | Widget order is config-driven per template; users may **collapse** widgets (Phase 18), not reorder in v1 |
| D2 | Empty widgets hide automatically (no "0 assignments" hero cards) |
| D3 | `notifications` uses real data when `notification-service` ships; until then show "Coming soon" not mock data in production |
| D4 | Journey AI widget shows disclaimer + link to human counselor (AI1–AI6) |
| D5 | Parent sees **only** linked students; multi-child accounts get `student_selector` |
| D6 | Sponsor never sees individual student PII — only aggregate impact / sponsored events |
| D7 | Admin widgets require `admin:access`; hide entirely (not disabled) for others |
| D8 | Seasonal pins: graduation checklist auto-surfaces Mar–Jun for grade 12 |
| D9 | Academy widget deep-links to `/academies/[slug]` for primary enrolled academy |
| D10 | Quick actions are persona-specific max 6 buttons |

### Quick actions by persona (examples)

| Persona | Actions |
|---------|---------|
| Student | Join Club, Log Service Hours, Open Portfolio, AI Assistant, Submit Ticket, View Rewards |
| Parent | Sign Form, View Calendar, Contact Advisor, Athletics Schedule |
| Teacher | Create Assignment, Approve Forms, Post Announcement, Service Ticket |
| Admin | User Management, Integration Health, Publish Announcement, Reports |

---

## Mobile vs Desktop

| Concern | Desktop | Mobile |
|---------|---------|--------|
| Grid | 2-column widget grid (`lg:grid-cols-2`) | Single column stack |
| Metrics | 4-across strip | 2×2 grid, swipeable |
| Calendar | Week strip | Today + next 3 days; link to `/calendar` |
| Quick actions | Horizontal chip row | Scrollable row below hero |
| Org officer strip | Side card | Collapsible accordion |
| Admin widgets | Full grid | Priority order: health → compliance → rest in "More" |
| Bottom nav | Unchanged | Dashboard always slot 1 |

**Performance:** Mobile fetches **above-the-fold** widgets first (hero, quick_actions, metrics); lazy-load lower widgets via Suspense boundaries.

---

## Proposed Prisma Models

```prisma
model StudentProfile {
  id           String   @id @default(cuid())
  userId       String   @unique @map("user_id") @db.Uuid
  gradeLevel   Int?     @map("grade_level") // 7-12
  cohortYear   Int?     @map("cohort_year")
  homeroomOrgId String? @map("homeroom_org_id")
  user         User     @relation(...)
  @@map("student_profiles")
}

model DashboardPreference {
  id              String   @id @default(cuid())
  userId          String   @unique @map("user_id") @db.Uuid
  collapsedWidgets Json    @default("[]") @map("collapsed_widgets")
  pinnedWidgets    Json    @default("[]") @map("pinned_widgets")
  updatedAt       DateTime @updatedAt @map("updated_at")
  @@map("dashboard_preferences")
}
```

---

## Permissions

| Action | Permission |
|--------|------------|
| View own dashboard | `campus:access` |
| View linked student widgets | `parent:view_student` + `ParentGuardian.verified` |
| View class roster flags | `journey:view_students` scoped to class org |
| View admin widgets | `admin:access` |
| View integration health | `integrations:view_health` |

Widget-level checks run in `dashboard-service`; pages call `getDashboardLayout(user)` which filters widgets before fetch.

---

## Scalability Notes

| Concern | Approach |
|---------|----------|
| N+1 queries | `dashboard-service` batches domain calls; single `Promise.all` per layout |
| Cache | Redis cache for school announcements (60s), user metrics (30s) |
| Personalization at scale | Precompute persona on login; store in session claim |
| Embed | `/embed/dashboard` (exists) uses same service with `showVersionBanner: false` |
| FACTS latency | Grade/cohort from local `StudentProfile`; sync nightly |

---

## Mapping to Phase 0–15 Code

| As-built | File | Target |
|----------|------|--------|
| Single layout | `dashboard-content.tsx` | Refactor to config-driven renderer |
| Hero | `dashboard-hero.tsx` | `hero_greeting` widget |
| Metrics | `dashboard-metrics.tsx` + `data.ts` `getDashboardMetrics` | `metrics_strip`; extend per persona |
| Assignments | `dashboard-assignments.tsx` | `assignments_due` |
| Calendar | `dashboard-calendar.tsx` | `calendar_week` |
| Events | `dashboard-events.tsx` | `events_upcoming` |
| Notifications | `dashboard-notifications.tsx` + `mock-data.ts` | Replace mock with `notification-service` |
| Portfolio | `dashboard-portfolio-summary.tsx` | `portfolio_summary` |
| Academy progress | `student-progress-widget.tsx` | `academy_progress` |
| Quick actions | `dashboard-quick-actions.tsx` | Move to `quick-actions.ts` config |
| Role in hero | `user.role` display only | Full persona resolution |

**Phase alignment:** Phase 16 (layout framework), Phase 17 (parent/student split), Phase 18 (user widget preferences).

---

## Related Documents

- [06_RBAC_PERMISSIONS.md](./06_RBAC_PERMISSIONS.md)
- [08_STUDENT_JOURNEY.md](./08_STUDENT_JOURNEY.md) — journey widget inputs
- [05_ROADMAP.md](./05_ROADMAP.md) — Phase 16–17
