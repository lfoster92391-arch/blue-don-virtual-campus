# Blue Don System Blueprint

**Unified Technical Foundation · Build Reference**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved — primary build reference for implementation  
**Audience:** Developers, architects, Cursor AI, technical leads  

**Purpose:** Turn vision into a **buildable product**. This document is how every module connects — schema, engines, permissions, integrations, and automation — in one place.

**Companion documents:** [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) (stack & deployment) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) (features) · [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Blue Don is a **modular monolith**: one Next.js application, one PostgreSQL database, one service layer — with **six core engines** that every feature plugs into:

| Engine | Responsibility |
|--------|----------------|
| **Event Engine** | Create once → publish everywhere |
| **Broadcast Engine** | Audience-targeted communications + ticker + push |
| **Notification Engine** | In-app, email, push — triggered by all engines |
| **Rewards Engine** | XP, coins, badges, spirit points |
| **Journey Engine** | Milestones, achievements, recaps, passport |
| **Identity Engine** | Blue Don ID, QR scans, wallet, tickets |

**Rule:** New features **emit events** to engines; they do not reimplement fan-out, ledger, or notification logic.

---

## Part I — System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PRESENTATION LAYER                                 │
│  Blue Don OS · Campus Life · My Journey · Academies · Operations · Admin    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         SERVER ACTIONS + API ROUTES                          │
│  Auth middleware · Permission guards · Input validation · revalidatePath    │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                            SERVICE LAYER                                     │
│  src/services/* — one service per domain; engines as shared modules         │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│ CORE ENGINES  │         │  PRISMA / PG    │         │  INTEGRATIONS   │
│ event         │         │  (Supabase)     │         │  Google         │
│ broadcast     │         │                 │         │  FACTS          │
│ notification  │         │                 │         │  Storage        │
│ rewards       │         │                 │         │  (media)        │
│ journey       │         │                 │         │                 │
│ identity      │         │                 │         │                 │
└───────────────┘         └─────────────────┘         └─────────────────┘
                                    │
┌───────────────────────────────────▼─────────────────────────────────────────┐
│                         BACKGROUND JOBS (Vercel Cron)                        │
│  sync · reminders · recaps · vault archive · time capsule open                │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Part II — Module Registry

All modules with primary route, pillar, engine dependencies, and build status.

| # | Module | Route | Pillar | Engines | Status |
|---|--------|-------|--------|---------|--------|
| 1 | Blue Don OS (Home) | `/home` | Intelligence | Event, Broadcast, Journey | Partial |
| 2 | Student Journey | `/my-journey` | Success + Identity | Journey, Rewards | Planned |
| 3 | Smart Calendar | `/calendar` | Success | Event | Partial |
| 4 | School Hub | `/hub` | Operations | Broadcast | Planned |
| 5 | Student Life | `/student-life` | Life | Event, Journey | Partial |
| 6 | Class Pages | org `CLASS` | Life | Journey | Planned |
| 7 | Academies | `/academies` | Success | Journey, Rewards | Built |
| 8 | Athletics | `/athletics` | Life | Event, Identity | Planned |
| 9 | Service Center | `/service` | Life | Identity, Journey, Rewards | Partial |
| 10 | Future Center | `/future` | Success | Journey, Intelligence | Partial |
| 11 | Portfolio | `/portfolio` | Success | Journey | Partial |
| 12 | Blue Don AI | `/ai` | Intelligence | All (read) | Planned |
| 13 | Blue Don Corner | `/corner` | Life | Rewards, Identity | Planned |
| 14 | Rewards | `/rewards` | Identity | Rewards | Partial |
| 15 | Event Hub | `/events` | Life + Ops | Event, Broadcast, Rewards | Partial |
| 16 | Community Feed | `/community` | Life | Broadcast, Journey | Planned |
| 17 | Media Center | `/media` | Life | Journey | Planned |
| 18–20 | Academy Ops Centers | `/operations/*` | Operations | Request | Partial |
| 21 | My Madonna Journey | `/my-journey` | Success | Journey | Planned |
| 22 | Blue Don Tree | widget | Identity | Rewards | Planned |
| 23 | Graduation Readiness | `/graduation` | Success | Journey | Planned |
| 24 | Parent Portal | `/parent` | Community | Notification | Partial |
| 25 | Alumni Portal | `/alumni` | Community | Journey, Notification | Planned |
| 26 | Administration | `/admin` | Operations | All | Partial |
| 27 | Permissions | config | Operations | — | Partial |
| 28 | Blue Don Broadcasts | `/broadcasts` | Operations | Broadcast, Notification | Planned |
| 29 | Leadership Center | `/leadership` | Life | Broadcast | Planned |
| 30 | Blue Don ID & Wallet | `/id`, `/wallet` | Identity | Identity, Rewards | Planned |
| 31 | Guidance Center | `/guidance` | Success | Journey, Request | Planned |
| 32 | Campus Operations | `/operations` | Operations | Request | Planned |
| 33 | Blue Don Requests | `/requests` | Operations | Notification | Planned |
| **34** | **Campus Life** | `/campus-life` | Life | Event, Rewards, Broadcast | Planned |
| **35** | **Opportunity Center** | `/opportunities` | Success + Intelligence | Journey, AI, Notification | Planned |
| **36** | **Character & Legacy** | `/challenges`, `/halls` | Success + Life | Rewards, Journey | Planned |
| **37** | **Daily Discovery** | `/discover` | Success + Intelligence | Rewards, Journey, TIL | Planned |
| **38** | **Campus Challenges** | `/challenges/campus` | Student Life | Rewards, Campus Life | Planned |
| **39** | **Blue Don Arcade** | `/arcade` | Student Life + Intelligence | Rewards, Identity (Quest QR) | Planned |

---

## Part III — Module Connection Graph

```
                         ┌─────────────┐
                         │  Blue Don   │
                         │     OS      │
                         └──────┬──────┘
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
         ┌────────────┐   ┌────────────┐   ┌────────────┐
         │ Campus Life│   │ My Journey │   │  Academies │
         └─────┬──────┘   └─────┬──────┘   └─────┬──────┘
               │                │                │
               └────────┬───────┴───────┬────────┘
                        ▼               ▼
                 ┌────────────┐  ┌────────────┐
                 │ EVENT      │  │ REWARDS    │
                 │ ENGINE     │  │ ENGINE     │
                 └─────┬──────┘  └─────┬──────┘
                       │               │
         ┌─────────────┼───────────────┼─────────────┐
         ▼             ▼               ▼             ▼
  ┌────────────┐ ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ BROADCAST  │ │ JOURNEY  │  │ IDENTITY │  │ REQUEST  │
  │ ENGINE     │ │ ENGINE   │  │ ENGINE   │  │ ENGINE   │
  └─────┬──────┘ └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             ▼
                    ┌─────────────────┐
                    │ NOTIFICATION    │
                    │ ENGINE          │
                    └─────────────────┘
```

### Integration matrix (selected)

| From → To | Event | Broadcast | Rewards | Journey | Identity | Notification |
|-----------|-------|-----------|---------|---------|----------|--------------|
| Event check-in | — | reminder | XP | milestone | QR scan | push |
| Broadcast publish | calendar | — | — | — | — | push/ticker |
| Service complete | — | — | XP + spirit | hours + achievement | QR | notify |
| Cert earned | — | celebration | XP + badge | milestone + achievement | passport stamp | optional |
| Request status change | — | — | — | — | — | notify submitter |
| Tradition participation | spirit pts | — | XP | milestone | QR | — |

---

## Part IV — Database Schema

### IV.1 — Schema domains

| Domain | As-built (Prisma) | Planned |
|--------|-------------------|---------|
| **Tenant** | `School` | `School.brandConfig`, feature flags |
| **Identity** | `User` | `StudentProfile`, `ParentGuardian` |
| **Organizations** | `Organization`, `OrganizationMembership` | `LeadershipPosition`, `LeadershipAssignment` |
| **Academies** | `Academy`, `LearningModule`, `Lesson`, `Video`, `Lab`, `Simulator`, `Assessment`, `Mission`, `Certification`, `Student*Progress`, `LeaderboardEntry` | — |
| **Events** | `Event`, `EventParticipant`, `EventReminder`, `Assignment` | `EventPublication`, `WalletTicket` |
| **Governance** | `Form`, `FormSubmission` | — |
| **Operations** | `Ticket`, `TicketComment` | `CampusRequest`, `DepartmentWorkspace`, `EquipmentReservation` |
| **Content** | `KnowledgeArticle`, `PortfolioItem`, `Checklist*` | `KnowledgeArticle` → School Hub |
| **Impact** | `ImpactFundProposal`, `ImpactFundVote` | → Fundraising Hub |
| **Communications** | — | `Broadcast`, `BroadcastAudience`, `BroadcastPublication` |
| **Rewards** | `LeaderboardEntry` | `XpLedger`, `CoinWallet`, `CoinTransaction`, `Badge`, `UserBadge`, `SpiritPointsLedger` |
| **Journey** | — | `JourneyMilestone`, `JourneyAchievement`, `StoryChapter`, `YearInReview`, `MemoryVaultYear`, `ClassTimeCapsule`, `ClassLegacy`, `PassportStamp` |
| **Identity/QR** | — | `QrScanLog`, `HallPass`, `EquipmentLoan` |
| **Campus Life** | — | `TraditionHub`, `CampusPoll`, `PhotoOfTheDay`, `CommunityEvent` |
| **Media** | — | `MediaAsset`, `MediaAlbum` |
| **Integrations** | — | `ExternalAccount`, `SyncJob`, `ExternalEntityLink` |
| **AI** | — | `AiConversation`, `AiMessage` |
| **Partners** | — | `PartnerOrganization`, `PartnerOpportunity` |

**Source of truth:** `prisma/schema.prisma` — extend via migrations only.

### IV.2 — Core entity relationships

```
School
  ├── User (1:N)
  ├── Organization (1:N)
  ├── Academy (1:N)
  └── Event (1:N)

User
  ├── OrganizationMembership (N:M → Organization)
  ├── AcademyMembership (N:M → Academy)
  ├── EventParticipant (N:M → Event)
  ├── FormSubmission (1:N)
  ├── StudentProfile (1:1)
  ├── JourneyMilestone (1:N)
  ├── XpLedger (1:N)
  └── QrScanLog (1:N)

Organization
  ├── OrganizationMembership (1:N)
  ├── Event (scoped)
  ├── TraditionHub (class orgs)
  └── SpiritPointsLedger (group)

Event
  ├── EventParticipant (1:N)
  ├── EventPublication (1:N) [planned]
  ├── Broadcast (reminder link) [planned]
  └── WalletTicket (1:N) [planned]
```

### IV.3 — Unified planned migration waves

| Wave | Migration name | Models added |
|------|----------------|--------------|
| W1 | `phase17_nav_journey` | `StudentProfile`, `JourneyMilestone` |
| W2 | `phase17_broadcasts` | `Broadcast*`, `Leadership*` |
| W3 | `phase18_rewards` | `XpLedger`, `CoinWallet`, `CoinTransaction`, `Badge`, `UserBadge` |
| W4 | `phase18_requests` | `CampusRequest`, `RequestComment`, `RequestStatusLog` |
| W5 | `phase19_identity` | `QrScanLog`, `HallPass`, `EquipmentLoan`, `PassportStamp`, `WalletTicket` |
| W7 | `phase19_campus_life` | `TraditionHub`, `SpiritPointsLedger`, `CampusPoll`, `PhotoOfTheDay` |
| W7b | `phase19_opportunities` | `Opportunity`, `OpportunityInteraction`, `BucketListItem`, `WhatIfExploration`, `MentorMatch` |
| W7 | `phase20_journey_full` | `JourneyAchievement`, `StoryChapter`, `YearInReview`, `MemoryVaultYear` |
| W8 | `phase20_media` | `MediaAsset`, `MediaAlbum` |
| W9 | `phase21_operations` | `DepartmentWorkspace`, `EquipmentResource`, `EquipmentReservation` |
| W10 | `phase21_integrations` | `ExternalAccount`, `SyncJob`, `ExternalEntityLink` |
| W11 | `phase22_legacy` | `ClassTimeCapsule`, `ClassLegacy`, `Partner*` |
| W12 | `phase22_guidance` | `CounselorAppointment`, `GraduationRequirement` |

---

## Part V — Permission Model

### V.1 — Layers

```
1. Global role (User.role)           → hasPermission(role, key)
2. Org membership (orgRole)        → hasOrgPermission(userId, orgId, key)
3. Leadership position (assignment)  → hasLeadershipPermission(userId, position, key)
4. Resource scope (audience, dept)   → canAccessResource(userId, resource)
```

### V.2 — Permission key catalog

**Global namespaces:** `campus`, `admin`, `users`, `events`, `forms`, `academy`, `org`, `checklists`, `portfolio`, `knowledge`, `tickets`, `labs`, `simulators`, `impact_fund`, `journey`, `future`, `rewards`, `feed`, `athletics`, `integrations`, `parent`, `alumni`, `ai`, `broadcasts`, `leadership`, `id`, `guidance`, `requests`, `operations`, `campus_life`

**Critical keys by engine:**

| Engine | Keys |
|--------|------|
| Event | `events:create`, `events:publish`, `events:manage`, `events:participate` |
| Broadcast | `broadcasts:create`, `broadcasts:approve`, `broadcasts:publish_critical` |
| Rewards | `rewards:grant`, `rewards:view` |
| Identity | `id:view_own`, `id:scan`, `hallpass:create` |
| Journey | `journey:view_own`, `journey:view_linked` (parent/counselor) |
| Request | `requests:create`, `requests:view_dept`, `requests:resolve` |
| Campus Life | `campus_life:poll_create`, `campus_life:photo_submit`, `spirit:award` |

**Enforcement:** Server actions → services → engine (defense in depth). Never UI-only.

**Source:** `src/config/roles.ts` — extend with new keys per wave.

---

## Part VI — Core Engines

### VI.1 — Event Engine

**Service:** `src/services/engines/event-engine.ts`

```
createEvent(draft) → review? → schedule → publish(surfaces[])
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
              Calendar                  Campus Life Today            Broadcast reminder
              Org page                  Journey milestone            Notification
              Google Calendar           Rewards (on attendance)      Media assignment
```

**Models:** `Event`, `EventParticipant`, `EventPublication` (planned)

**Hooks:**
- `onEventPublished(event)` → fan-out surfaces
- `onAttendanceRecorded(eventId, userId)` → Rewards + Journey + Spirit

### VI.2 — Broadcast Engine

**Service:** `src/services/engines/broadcast-engine.ts`

```
createBroadcast → approve? → publish → [ticker, home_os, hub, community, push, org]
```

**Models:** `Broadcast`, `BroadcastAudience`, `BroadcastPublication`

**Audience resolution:** `audienceKey` → user ID set at publish time (snapshot).

### VI.3 — Notification Engine

**Service:** `src/services/engines/notification-engine.ts`

| Channel | Provider | Use |
|---------|----------|-----|
| In-app | `Notification` table | All users |
| Push | Web Push / future FCM | Important, Critical |
| Email | Supabase / Resend | Digests, password, parents |
| Ticker | Campus UI component | Broadcast headlines |

```
notify({ userIds, type, title, body, deepLink, priority })
```

**Triggered by:** Event reminders, broadcast publish, request status, time capsule open, year in review ready.

**Models:** `Notification`, `NotificationPreference` (planned)

### VI.4 — Rewards Engine

**Service:** `src/services/engines/rewards-engine.ts`

```
awardXp({ userId, amount, reason, sourceType, sourceId })
awardCoins({ userId, amount, reason })  // optional per rule
awardBadge({ userId, badgeKey })
awardSpirit({ groupType, groupId, points, reason })
```

**Rules engine:** `src/config/rewards-rules.ts` — anti-gaming caps, duplicate prevention.

**Models:** `XpLedger`, `CoinWallet`, `CoinTransaction`, `Badge`, `UserBadge`, `SpiritPointsLedger`

| Action | XP | Coins | Spirit |
|--------|-----|-------|--------|
| Event attendance | ✔ | optional | ✔ (if school-wide) |
| Service hour approved | ✔ | ✔ | — |
| Module complete | ✔ | ✔ | — |
| Spirit Week participation | ✔ | — | ✔ (class) |
| Kindness post approved | ✔ | ✔ | — |

### VI.5 — Journey Engine

**Service:** `src/services/engines/journey-engine.ts`

```
recordMilestone({ userId, title, category, sourceType, sourceId })
checkAchievements(userId)      // progressive thresholds
generateYearInReview(userId, schoolYear)  // cron June
sealTimeCapsule(cohortYear)
```

**Subscribers:** All engines call Journey on meaningful student actions.

### VI.6 — Identity Engine

**Service:** `src/services/engines/identity-engine.ts`

```
generateQrToken(userId) → rotating signed JWT
processScan({ token, scannerId, actionType, contextId })
issueTicket({ userId, eventId, type })
issueHallPass({ studentId, teacherId, destination, expiresAt })
```

**Models:** `QrScanLog`, `HallPass`, `WalletTicket`, `EquipmentLoan`

---

## Part VII — Google & FACTS Integration

### VII.1 — Google Classroom

| Direction | Data | Blue Don model |
|-----------|------|----------------|
| Inbound | Courses, rosters | `Organization` (CLASS), memberships |
| Inbound | Assignments, due dates | `Assignment` |
| Display | Deep links | Dashboard / Today digest |

**Job:** `google-classroom-sync` (hourly)  
**Link table:** `ExternalEntityLink` (`entityType: assignment`)

### VII.2 — Google Calendar

| Direction | Data | Blue Don model |
|-----------|------|----------------|
| Outbound | Published events | `Event` + `googleCalendarEventId` |
| Outbound | ICS feed | Public subscribe URL |
| Inbound (P3) | Personal events | User calendar merge |

**Job:** `google-calendar-push` on `onEventPublished`

### VII.3 — FACTS SIS

| Direction | Data | Blue Don model |
|-----------|------|----------------|
| Inbound | Student demographics | `User`, `StudentProfile` |
| Inbound | Grade level, cohort | `StudentProfile` |
| Inbound | Parent links | `ParentGuardian` |
| Inbound | Grades (opt-in) | `SisGrade` |
| Inbound | Attendance | Attendance flags |

**Job:** `facts-full-sync` (nightly), `facts-delta-sync` (hourly)  
**Rule:** FACTS is source of truth for demographics; conflict queue for email mismatches.

---

## Part VIII — Media Storage & Moderation

### Storage

| Asset type | Store | Path pattern |
|------------|-------|--------------|
| User uploads | Supabase Storage | `{schoolId}/users/{userId}/` |
| Org media | Supabase Storage | `{schoolId}/orgs/{orgId}/` |
| Photo of the Day | Supabase Storage | `{schoolId}/campus/potd/` |
| Journey video | Supabase Storage | `{schoolId}/journey/{userId}/` |
| Broadcast archive | Supabase Storage | `{schoolId}/broadcast/` |

**Models:** `MediaAsset` (id, url, mime, ownerId, orgId, moderationStatus), `MediaAlbum`

### Moderation pipeline

```
Upload → PENDING → [auto scan optional] → APPROVED / REJECTED
                → advisor queue for student public content
```

**Rules:** No public student faces without `mediaConsent` flag. Broadcasting advisor approves Photo of the Day.

---

## Part IX — API & Automation Surface

### IX.1 — Route categories

| Category | Pattern | Auth |
|----------|---------|------|
| Pages | `src/app/(campus)/**` | Session + profile |
| Server actions | `src/features/**/actions.ts` | Session + permission |
| Health | `GET /api/health` | Public |
| Auth | `/auth/callback`, `/auth/signout` | Public / session |
| Webhooks | `/api/webhooks/*` | Service key |
| Cron | `/api/cron/*` | `CRON_SECRET` |
| Scan API | `POST /api/scan` | Scanner role + token validation |

### IX.2 — Cron jobs

| Job | Schedule | Engine |
|-----|----------|--------|
| `classroom-sync` | Hourly | Integration |
| `facts-delta-sync` | Hourly | Integration |
| `facts-full-sync` | Daily 2 AM | Integration |
| `event-reminders` | Every 15 min | Event + Broadcast |
| `broadcast-expire` | Hourly | Broadcast |
| `year-in-review` | June 1 | Journey |
| `memory-vault-archive` | Year-end | Journey |
| `time-capsule-open` | On date | Journey + Notification |
| `spirit-week-reset` | Configurable | Rewards |

### IX.3 — Service layer map

| Service | Calls engines |
|---------|---------------|
| `event-service` | Event, Notification, Journey, Rewards |
| `broadcast-service` | Broadcast, Notification |
| `campus-life-service` | Event, Rewards (spirit), Journey |
| `form-service` | Notification, Journey |
| `ticket-service` | → migrates to `request-service` |
| `user-service` | Identity |
| `dashboard-service` | All (read aggregates) |
| `integration-service` | External sync |

**New code pattern:**

```typescript
// services/engines/event-engine.ts
export async function publishEvent(eventId: string, surfaces: PublishSurface[]) {
  const event = await prisma.event.update({ ... });
  await fanOutPublications(event, surfaces);
  await notificationEngine.notifyEventPublished(event);
  return event;
}
```

---

## Part X — Implementation Waves

Recommended build order — each wave exits with working integration tests.

| Wave | Focus | Exit criteria |
|------|-------|---------------|
| **W0** | ✅ Phases 0–16 | Auth, academies, forms, tickets, orgs |
| **W1** | Navigation + Blue Don OS shell | 14-item nav, Today digest (read-only) |
| **W2** | Event Engine v2 | `EventPublication`, fan-out, reminders |
| **W3** | Broadcast Engine | Audiences, approval, ticker |
| **W4** | Journey Engine v1 | Timeline, milestones from events |
| **W5** | Rewards Engine v1 | XP ledger, badges |
| **W6** | Request Engine | `CampusRequest`, IT + Facilities queues |
| **W7** | Campus Life v1 | Today, traditions shell, spirit points |
| **W8** | Identity Engine | Blue Don Pass, QR check-in |
| **W9** | Campus Operations | IT Operations flagship |
| **W10** | Integrations | Classroom + Calendar read sync |
| **W11** | Journey v2 | Year in Review, achievements |
| **W12** | Media + Live | Storage, Photo of Day, Blue Don Live |
| **W13** | Guidance + Partners | Counseling, partner portal |
| **W14** | FACTS sync | StudentProfile, parents |
| **W15** | Journey v3 | Time capsule, graduation video |

---

## Part XI — Cursor / Developer Quick Start

When implementing any feature:

1. Read [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md) — which pillar?  
2. Read module doc in `docs/BLUE_DON_*.md`  
3. Check this document — which **engine** owns the side effects?  
4. Add schema in **next migration wave** — don't skip migrations  
5. Extend `roles.ts` permission keys  
6. Implement in `services/` — call engines, don't duplicate  
7. Server action with permission guard  
8. `revalidatePath` for affected routes  

**Never:**
- Put business logic in page components  
- Create a second notification system  
- Hard-delete governance or journey records  
- Expose service role key to client  

---

## Appendix A — Document Index

| Topic | Document |
|-------|----------|
| Stack & deploy | `BLUE_DON_TECHNICAL_ARCHITECTURE.md` |
| Features & modules | `BLUE_DON_PRODUCT_BLUEPRINT.md` |
| UX flows | `BLUE_DON_USER_EXPERIENCE_FLOW.md` |
| Navigation IA | `BLUE_DON_DIGITAL_CAMPUS.md` |
| Campus Life | `BLUE_DON_CAMPUS_LIFE.md` |
| Opportunities | `BLUE_DON_OPPORTUNITY_CENTER.md` |
| Character & Legacy | `BLUE_DON_CHARACTER_AND_LEGACY.md` |
| Daily Discovery | `BLUE_DON_DAILY_DISCOVERY.md` |
| Campus Challenges | `BLUE_DON_CAMPUS_CHALLENGES.md` |
| Blue Don Arcade | `BLUE_DON_ARCADE.md` |
| Journey | `BLUE_DON_MY_MADONNA_JOURNEY.md` |
| Broadcasts | `BLUE_DON_BROADCASTS.md` |
| Identity | `BLUE_DON_ID.md` |
| Operations | `BLUE_DON_CAMPUS_OPERATIONS.md` |
| Requests | `BLUE_DON_REQUESTS.md` |
| Pillars | `BLUE_DON_STRATEGIC_PILLARS.md` |
| Prisma (as-built) | `prisma/schema.prisma` |

---

*Madonna High School · Blue Don Virtual Campus*  
*System Blueprint — Vision to buildable product.*
