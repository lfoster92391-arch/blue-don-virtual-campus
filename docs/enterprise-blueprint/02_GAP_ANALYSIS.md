# 02 — Gap Analysis

**Version:** 0.2  
**Scope:** Map each of 27 platform modules to Phases 0–15 (built / partial / missing)  
**Inventory date:** 2026-07-07

---

## Executive Summary

| Status | Count | Modules |
|--------|-------|---------|
| **Built** | 0 | None fully complete at enterprise spec level |
| **Partial** | 15 | 1, 3, 7, 9, 10, 11, 14, 15, 17, 18, 19, 20, 24, 26, 27 |
| **Missing** | 12 | 2, 4, 5, 6, 8, 12, 13, 16, 21, 22, 23, 25 |

Phases 0–15 delivered a strong **MVP foundation** (auth, shell, academies, calendar, forms, portfolio, service desk, knowledge vault, labs, simulators, impact fund). The enterprise OS requires **organization workspaces**, **journey layer**, **community/rewards economy**, **Future Center**, **integrations**, and **14-role permissions** — largely absent today.

---

## Module-by-Module Gap Matrix

| # | Module | Phase 0–15 mapping | Status | Built assets | Enterprise gap |
|---|--------|---------------------|--------|--------------|----------------|
| 1 | **Personalized Dashboard** | Phase 3 | **Partial** | `/dashboard`, 7 widget shells, hero, quick actions, progress widget (Ph 13) | Role-specific layouts (student/teacher/parent/admin); live notifications |
| 2 | **Student Journey** | — | **Missing** | — | About Me profile, grade tracking, journey AI inputs, milestone schema |
| 3 | **Smart Calendar** | Phase 4 | **Partial** | `/calendar`, events CRUD, assignments, dashboard widget | Google Classroom/Calendar sync, multi-source aggregation, conflict detection |
| 4 | **School Hub** | Phase 10 (partial) | **Missing** | `/knowledge` articles | Hub shell, announcements, bell schedule, lunch, map, directory |
| 5 | **Student Life / Clubs** | — | **Missing** | — | Club directory, org workspace model, membership, officer tools |
| 6 | **Class Pages** | — | **Missing** | — | Graduating class workspaces, alumni handoff |
| 7 | **Academies** | Phases 6, 12–15 | **Partial** | 14 academies, Academy Engine, `/pathways`, modules/labs/sims/certs, leaderboards | Assessment persistence, progress writes, AI coaching, org workspace tabs |
| 8 | **Athletics** | Phase 14–15 (academy only) | **Missing** | Athletics Operations *academy* content | Team workspaces, rosters, games, stats, athletic media hub |
| 9 | **Service Center** | Phase 9 | **Partial** | `/service-desk`, tickets, comments | Facilities, volunteer hours, QR check-in/out, unified branding |
| 10 | **Future Center** | Phase 13 (pathways) | **Partial** | `/pathways` career dashboard → academies | College, trade, military, scholarships, resume, recruiters, internships |
| 11 | **Resume & Portfolio** | Phase 8 | **Partial** | `/portfolio`, CRUD, detail pages | Resume builder, export, endorsements, Future Center integration |
| 12 | **Blue Don AI** | Phase 13 (placeholder) | **Missing** | AI coaching placeholder in learning flow | Global AI assistant, journey/career modes, guardrails, logging |
| 13 | **Blue Don Corner** | — | **Missing** | — | Marketplace, listings, coins commerce, org stores |
| 14 | **Rewards System** | Phase 4, 13 | **Partial** | `Event.impactPoints`, `LeaderboardEntry` per academy | XP ledger, Blue Don Coins, badges, streaks, store, teacher rewards |
| 15 | **Event Hub** | Phase 4 | **Partial** | `Event`, participants, reminders, academy scope | Publish everywhere engine, cross-surface, RSVP/volunteer, templates |
| 16 | **Community Feed** | — | **Missing** | — | Positive feed, kindness, spotlights, moderation |
| 17 | **Media Center** | Phase 10 (partial) | **Partial** | `KnowledgeArticle` (text) | Photo/video library, albums, approval, yearbook |
| 18 | **Broadcasting Center** | Phases 12–15 | **Partial** | Broadcast academy modules/missions, labs scaffold | Operational center UI, studio booking, live stream |
| 19 | **IT Center** | Phases 9, 12–15 | **Partial** | Service Desk, IT academy, Help Desk interactive lab | IT-branded ops center, device tracking, student help desk queue |
| 20 | **Circuit Center** | Phases 12–15 | **Partial** | Cricut & Makers academy, labs scaffold | Maker space ops, equipment reservation, project gallery |
| 21 | **My Journey** | — | **Missing** | — | Timeline UI, journal, milestone cards |
| 22 | **Blue Don Tree** | — | **Missing** | — | Visual growth metaphor, branch domains, achievement visuals |
| 23 | **Graduation Readiness** | Phase 7 (checklists) | **Missing** | Generic checklists | Senior command center, credit/service/cert tracking, deficiency alerts |
| 24 | **Parent Portal** | Phase 5 | **Partial** | `/parent` forms summary | Multi-student, progress hub, athletics/events, Future Center view |
| 25 | **Alumni Portal** | — | **Missing** | — | Alumni role, profile, network, giving, mentorship |
| 26 | **Administration Center** | Phases 2, 5, 13 | **Partial** | `/admin/*` (academies, forms, compliance, engine) | Primary nav entry, reporting (Ph 11), org mgmt, integrations monitor |
| 27 | **Permissions System** | Phase 2 | **Partial** | 5 roles, permission strings in `roles.ts` | 14 roles, org-scoped perms, parent-student linkage, alumni/teacher |

---

## Cross-Reference: MVP Features → Modules

| MVP feature | Phase | Status | Enterprise module(s) |
|-------------|-------|--------|-------------------|
| Project init, CI, health | 0 | ✅ | 26 Administration |
| Campus shell, sidebar, mobile nav | 1 | ✅ | 1 Dashboard (shell) |
| Auth & 5 roles | 2 | ✅ | 27 Permissions |
| Dashboard widgets | 3 | ✅ | 1 Dashboard |
| Calendar, events, assignments | 4 | ✅ | 3 Smart Calendar, 15 Event Hub |
| Forms, governance, parent forms | 5 | ✅ | 24 Parent Portal, 26 Administration |
| Academy framework, membership | 6 | ✅ | 7 Academies |
| Checklists | 7 | ✅ | 15 Event Hub, 23 Graduation Readiness (partial) |
| Portfolio engine | 8 | ✅ | 11 Resume & Portfolio |
| Service desk / tickets | 9 | ✅ | 9 Service Center, 19 IT Center |
| Knowledge vault | 10 | ✅ | 4 School Hub, 17 Media Center (partial) |
| Reporting & admin | 11 | ❌ Not built | 26 Administration |
| Labs, simulators, Impact Fund | 12 | ✅ | 7 Academies, 18–20 Centers |
| Academy Engine (14 MEN) | 13 | ✅ | 7, 10 (pathways), 18–20 |
| Academy content 1–5 | 14 | ✅ | 7, 18 Broadcast |
| Academy content 6–14 | 15 | ✅ | 7, 8 (ops academy only), 19–20 |

---

## Top 10 Missing Capabilities (Priority)

Ranked by impact on enterprise OS positioning:

| Rank | Capability | Module(s) | Why critical |
|------|------------|-----------|--------------|
| 1 | **Organization workspace model** | 5, 6, 8, 7 | Foundation for clubs, classes, teams, athletics — no OS without orgs |
| 2 | **14-role permissions + org scope** | 27 | Every module depends on correct access control |
| 3 | **Future Center domain** | 10, 23 | Signature post-secondary value; pathways alone insufficient |
| 4 | **Rewards economy (XP, coins, badges)** | 14, 13, 22 | Motivation layer; differentiator from LMS |
| 5 | **Community feed (positive-only)** | 16 | School culture and engagement loop |
| 6 | **Student Journey + About Me** | 2, 21, 12 | Personalization engine for AI and dashboards |
| 7 | **Event publish-everywhere engine** | 15, 3 | Operational efficiency; reduces duplicate data entry |
| 8 | **Role-personalized dashboards** | 1 | First screen users see; must match enterprise promise |
| 9 | **Alumni portal + role** | 25 | "Every Journey" extends past graduation |
| 10 | **Google Classroom + FACTS integrations** | 3, 26 | Smart Calendar and admin depend on real school data |

**Honorable mentions:** Athletics team hub (8), Blue Don AI global (12), School Hub (4), Graduation Readiness (23), Blue Don Tree (22).

---

## Navigation Gap

### Vision (12 primary destinations)

Dashboard · School Hub · Student Life · Academies · Athletics · Service Center · Future Center · Blue Don Corner · Rewards · Portfolio · AI Assistant · Administration

### Built (12 items — different set)

Source: `src/config/navigation.ts`

Dashboard · Pathways · Academies · Calendar · Forms · Labs · Simulators · Portfolio · Events · Service Desk · Impact Fund · Knowledge Vault

| Vision item | Closest built | Gap |
|-------------|---------------|-----|
| School Hub | Knowledge + Forms | No hub shell, directory, bell schedule |
| Student Life | — | No club/org index |
| Athletics | Athletics Operations academy | No team module |
| Service Center | Service Desk | No volunteer QR, facilities |
| Future Center | Pathways | No college/trade/military/scholarships |
| Blue Don Corner | — | No feed or marketplace |
| Rewards | LeaderboardEntry | No coins, badges, store |
| AI Assistant | Learning flow placeholder | No global AI |
| Administration | `/admin/*` (not in sidebar) | Not in primary nav |

**Relocated when approved:** Calendar → Smart Calendar; Events → Event Hub; Forms → School Hub/Admin; Labs/Sims/Impact Fund → Academies; Pathways → Academies/Future Center; Knowledge Vault → School Hub/Media Center.

---

## Route Inventory (As-Built)

46 campus `page.tsx` routes under `src/app/(campus)/`:

**Core:** `/`, `/dashboard`, `/profile`, `/settings`, `/parent`  
**Learning:** `/pathways`, `/academies`, `/academies/[slug]`, modules, missions, `/labs`, `/simulators`  
**Operations:** `/calendar`, `/events`, `/forms`, `/checklists`, `/assignments`, `/service-desk`, `/impact-fund`, `/knowledge`  
**Portfolio:** `/portfolio`, `/portfolio/[id]`  
**Admin:** `/admin`, academies, forms, compliance, constitution, approvals, knowledge, labs, simulators, impact-fund, academy-engine

**Missing route families (vision):** `/school-hub`, `/student-life`, `/orgs/[slug]`, `/athletics`, `/future-center`, `/blue-don-corner`, `/rewards`, `/ai-assistant`, `/my-journey`, `/alumni`, media/yearbook, live stream

---

## Database Gap (Prisma)

**Source:** `prisma/schema.prisma` (~40 models, Phase 15)

### Implemented → module mapping

| Domain | Models | Module(s) |
|--------|--------|-----------|
| Identity | `School`, `User` (5 roles) | 27 |
| Academies | `Academy`, `AcademyMembership`, levels, engine models | 7, 18–20 |
| Events | `Event`, `EventParticipant`, `EventReminder`, `Assignment` | 3, 15 |
| Forms | `Form`, `FormSubmission` | 24, 26 |
| Checklists | `Checklist`, items, completions | 15, 23 |
| Portfolio | `PortfolioItem` | 11 |
| Service | `Ticket`, `TicketComment` | 9, 19 |
| Knowledge | `KnowledgeArticle` | 4, 17 |
| Labs/Sims | `Lab`, `LabSession`, `Simulator`, `SimulatorRun` | 7, 19, 20 |
| Impact Fund | `ImpactFundProposal`, `ImpactFundVote` | 7, 13 (partial) |
| Gamification (partial) | `LeaderboardEntry`, `Event.impactPoints` | 14 |

### Not in schema (proposed — document only)

| Domain | Proposed models | Module(s) |
|--------|-----------------|-----------|
| Organizations | `Organization`, `OrganizationMembership`, `OrganizationRole` | 5, 6, 8 |
| Student journey | `StudentProfile`, `AboutMe`, `JourneyMilestone` | 2, 21, 22 |
| Gamification | `XpLedger`, `CoinWallet`, `Badge`, `UserBadge`, `Redemption` | 14, 13 |
| Community | `FeedPost`, `KindnessAction`, `Spotlight`, `Reaction` | 16 |
| Marketplace | `MarketplaceListing`, `Transaction` | 13 |
| Media | `MediaAsset`, `Album`, `LiveStream`, `YearbookPage` | 17, 18 |
| Future Center | `CareerPlan`, `CollegeApplication`, `Scholarship`, `Internship` | 10, 23 |
| Athletics | `Team`, `TeamRoster`, `Game`, `AthleticStat` | 8 |
| Service volunteer | `VolunteerShift`, `ServiceHour`, `QrCheckIn` | 9 |
| Event engine v2 | `EventPublication`, `EventSurface` | 15 |
| AI | `AiConversation`, `AiRecommendation`, `JourneyInsight` | 12 |
| Integrations | `ExternalAccount`, `SyncJob`, `SisEnrollment` | 3, 26 |
| Alumni | `AlumniProfile`, `AlumniMentorship` | 25 |
| School hub | `BellSchedule`, `LunchMenu`, `Announcement` | 4 |

---

## Academy Engine Sub-Gaps (Module 7)

| Capability | Status |
|------------|--------|
| 14 academies with modules/missions/labs/sims | ✅ Seeded (Phase 14–15) |
| Interactive labs (AD, Help Desk) | ✅ Partial |
| Step-flow scaffold labs/simulators | ✅ Majority |
| Assessment engine | ❌ JSON placeholders |
| Progress write / persistence | ❌ Schema ready, not wired |
| AI coaching | ❌ Placeholder UI only |
| Level unlock logic | ❌ Display only |
| Org workspace tabs | ❌ |

---

## Integration Gap

| Integration | Module(s) | Status |
|-------------|-----------|--------|
| Supabase Auth | 27 | ✅ |
| Google OAuth (signup) | 27 | ✅ |
| Asset Pilot cross-link | 26 | ✅ Documented |
| Google Classroom | 3, 26 | ❌ |
| Google Calendar two-way | 3, 15 | ❌ Stub |
| FACTS SIS | 26, 3 | ❌ |
| Google Workspace directory | 27 | ❌ |

---

## Documentation Gap

| Item | Status |
|------|--------|
| `docs/blueprint/` 01–10 full text | ❌ Index only in repo |
| Enterprise blueprint 00–05 | ✅ v0.2 |
| Enterprise blueprint 06–21 | Planned stubs |
| `06_UI_SYSTEM.md` in repo | ❌ Referenced by REDESIGN.md |

---

## Recommended Priority Tiers (Post-Approval)

Aligned with [05_ROADMAP.md](./05_ROADMAP.md):

### Tier 1 — OS foundation

1. Permissions System (27) — 14 roles, org scope
2. Organization workspaces (5, 6, 8)
3. Role-personalized Dashboard (1)
4. Event Hub v2 (15)

### Tier 2 — Signature student experience

5. Student Journey + About Me (2)
6. Future Center MVP (10)
7. Rewards economy (14)
8. Community Feed (16)
9. Blue Don AI (12)

### Tier 3 — School operations & depth

10. School Hub (4)
11. Smart Calendar integrations (3)
12. Service Center expansion (9)
13. Athletics hub (8)
14. Parent Portal expansion (24)

### Tier 4 — Journey completion & alumni

15. My Journey + Blue Don Tree (21, 22)
16. Graduation Readiness (23)
17. Alumni Portal (25)
18. Administration + reporting (26, Phase 11)

### Tier 5 — Centers, commerce, media

19. Academy Centers UI (18–20)
20. Blue Don Corner marketplace (13)
21. Media Center (17)
22. Resume export (11)

---

## Related Documents

- [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md) — Module specifications
- [03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md) — Nav mapping
- [05_ROADMAP.md](./05_ROADMAP.md) — Phased delivery
- [07_DATABASE_SCHEMA.md](./07_DATABASE_SCHEMA.md) (planned)
