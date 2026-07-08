# 01 — Platform Modules

**Version:** 0.2  
**Scope:** All 27 platform modules — purpose, primary users, key features  
**Status:** Documentation only — awaiting approval

---

## Module Index

| # | Module | Gap status (Phase 15) |
|---|--------|----------------------|
| 1 | [Personalized Dashboard](#1-personalized-dashboard) | Partial |
| 2 | [Student Journey](#2-student-journey) | Missing |
| 3 | [Smart Calendar](#3-smart-calendar) | Partial |
| 4 | [School Hub](#4-school-hub) | Missing |
| 5 | [Student Life / Clubs](#5-student-life--clubs) | Missing |
| 6 | [Class Pages](#6-class-pages) | Missing |
| 7 | [Academies](#7-academies) | Built (engine); partial (workspace) |
| 8 | [Athletics](#8-athletics) | Missing |
| 9 | [Service Center](#9-service-center) | Partial |
| 10 | [Future Center](#10-future-center) | Partial |
| 11 | [Resume & Portfolio](#11-resume--portfolio) | Partial |
| 12 | [Blue Don AI](#12-blue-don-ai) | Missing |
| 13 | [Blue Don Corner](#13-blue-don-corner) | Missing |
| 14 | [Rewards System](#14-rewards-system) | Partial |
| 15 | [Event Hub](#15-event-hub) | Partial |
| 16 | [Community Feed](#16-community-feed) | Missing |
| 17 | [Media Center](#17-media-center) | Partial |
| 18 | [Broadcasting Center](#18-broadcasting-center) | Partial |
| 19 | [IT Center](#19-it-center) | Partial |
| 20 | [Circuit Center](#20-circuit-center) | Partial |
| 21 | [My Journey](#21-my-journey) | Missing |
| 22 | [Blue Don Tree](#22-blue-don-tree) | Missing |
| 23 | [Graduation Readiness](#23-graduation-readiness) | Missing |
| 24 | [Parent Portal](#24-parent-portal) | Partial |
| 25 | [Alumni Portal](#25-alumni-portal) | Missing |
| 26 | [Administration Center](#26-administration-center) | Partial |
| 27 | [Permissions System](#27-permissions-system) | Partial |

---

## 1. Personalized Dashboard

**Purpose:** Role-specific home screen that surfaces what matters most today for each user type.

**Primary users:** Student (by grade), teacher, parent, admin, club officer, athlete, advisor.

**Key features:**

- **Student dashboards** differentiated by grade band (7th–8th exploration, freshman onboarding, sophomore–junior progression, senior graduation focus)
- **Teacher dashboard** — classes, pending approvals, student flags, academy oversight
- **Parent dashboard** — linked students, forms due, events, athletics, progress summaries
- **Admin dashboard** — compliance, system health, integration status, reporting shortcuts
- Widgets: Smart Calendar slice, assignments, events, notifications, portfolio summary, rewards streak, journey milestone, quick actions
- Configurable widget priority per role (not one layout for all)
- Absorbs today's `/dashboard` with role-aware templates

**Cross-reference:** Phase 3 dashboard shells; Phase 13 student progress widget. Gap: role-specific layouts.

---

## 2. Student Journey

**Purpose:** Longitudinal student profile starting in **7th grade** that powers personalization across the platform.

**Primary users:** Students (owner), parents (view), advisors, teachers (context).

**Key features:**

- **About Me** profile — interests, goals, learning style, strengths, career curiosity
- Grade-level progression tracking (7th → graduation)
- Journey milestones (first club, first service hour, academy enrollment, certification, internship)
- **AI adapts** recommendations from About Me + activity signals (Student Journey AI)
- Feeds Future Center, Academies, Rewards, and Blue Don Tree
- Privacy controls — student edits own profile; parent visibility configurable

**Cross-reference:** No schema today. Placeholder progress in academy engine only.

---

## 3. Smart Calendar

**Purpose:** Unified calendar aggregating every time-based commitment in a student's life.

**Primary users:** All campus roles; students primary.

**Key features:**

- Aggregates: **Google Classroom** due dates, **Google Calendar** events, school bell schedule, academy sessions, club meetings, athletics practices/games, service shifts, personal reminders
- Color-coded sources (school, class, club, team, academy, personal)
- Week/month/agenda views; mobile-optimized
- Conflict detection (double-booked practice vs. lab session)
- Two-way sync with Google Calendar (planned)
- Dashboard widget + full `/calendar` experience (extends Phase 4)

**Cross-reference:** Phase 4 calendar/events built; Google sync stub only.

---

## 4. School Hub

**Purpose:** School-wide information desk — everything about Madonna High School in one place.

**Primary users:** All roles; especially new families and visitors.

**Key features:**

- **Announcements** — school-wide news, principal messages, emergency alerts
- **Bell schedule** — daily periods, early dismissal, exam schedules
- **Lunch menu** — daily/weekly menu
- **Campus map** — buildings, rooms, key locations
- **Directory** — staff, departments (role-gated detail)
- **Policies & resources** — handbook, dress code, technology policy
- Absorbs **Knowledge Vault** school-wide articles (Phase 10)
- Published **Forms** catalog for families (Phase 5)

**Cross-reference:** `/knowledge` articles exist; no hub shell, directory, bell schedule, or map.

---

## 5. Student Life / Clubs

**Purpose:** Discovery and workspace home for every student organization.

**Primary users:** Students, club advisors, club officers.

**Key features:**

- Club directory with search, categories (academic, service, spirit, faith, special interest)
- **Workspace per organization** — shared template: dashboard, announcements, calendar, members, photos, docs, events, fundraisers, store, leadership, resources
- Officer tools — post announcements, manage roster, schedule events
- Membership requests and approvals
- Ties to Rewards (club participation XP) and Event Hub

**Cross-reference:** Organization workspace model planned in `09_ORGANIZATION_WORKSPACES.md`. No club schema or routes.

---

## 6. Class Pages

**Purpose:** Graduating class workspaces that build class identity and continuity.

**Primary users:** Students (by graduation year), class officers, advisors.

**Key features:**

- One workspace per graduating class (e.g., Class of 2030)
- Class announcements, events, photos, fundraisers
- Senior-specific content flows into Graduation Readiness
- Alumni handoff — class page becomes alumni cohort anchor
- Same workspace template as clubs (org type = `class`)

**Cross-reference:** No class org type today. Extends org workspace model.

---

## 7. Academies

**Purpose:** Madonna Education Network (MEN) career academies — the learning and certification engine of the campus.

**Primary users:** Students, advisors, academy leads, teachers.

**Key features:**

- **14 MEN academies** including IT, Broadcast, Circuit (Cricut & Makers), Robotics, Cybersecurity, and more
- Shared **Academy Engine** — modules, lessons, videos, labs, simulators, missions, certifications, leaderboards
- Seven progression levels: Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone
- Learning flow: Learn → Watch → Labs → Exams → Certification → Portfolio Project → Capstone Mission
- **Pathways dashboard** linking career exploration to academy enrollment
- Academy workspace tabs (extend org model): overview, modules, labs, progress, certifications, members
- Impact Fund proposals scoped to academy community (Phase 12)
- Future academies added via admin without engine rewrite

**Cross-reference:** **Built** — Phases 6, 13–15. Gaps: assessment persistence, progress writes, AI coaching (placeholder), org workspace tabs.

---

## 8. Athletics

**Purpose:** Team-centric hub for Madonna athletics — not just an academy, but a living team workspace.

**Primary users:** Athletes, coaches, parents, athletic director, fans.

**Key features:**

- Team workspaces (varsity, JV, middle school) — roster, schedule, stats, announcements, media
- Game schedules, scores, standings
- Practice calendar (feeds Smart Calendar)
- Athletic media gallery (photos, highlight reels)
- Parent notifications for game times and transportation
- Coach tools — roster management, stat entry, announcements
- Distinct from Athletics Operations *academy* (which teaches sports management skills)

**Cross-reference:** Athletics Operations academy exists (Phase 14–15). No team workspace module.

---

## 9. Service Center

**Purpose:** Unified help and service hub — IT, facilities, volunteer tracking, and account support.

**Primary users:** All roles; IT staff, facilities, volunteer coordinators (operators).

**Key features:**

- **IT tickets** — extends Phase 9 Service Desk (`/service-desk`)
- **Facilities requests** — maintenance, room setup, equipment
- **Account/access issues** — password, device, permissions
- **Volunteer service tracking** — log hours, opportunities, supervisor approval
- **QR check-in/check-out** — at service events for accurate hour logging
- Knowledge base deflection (links to School Hub / Knowledge Vault)
- SLA visibility, routing, status tracking
- Dashboard quick-action widget

**Cross-reference:** Phase 9 tickets built. No facilities, volunteer hours, or QR check-in.

---

## 10. Future Center

**Purpose:** Post-secondary and career preparation hub — where students plan life after Madonna.

**Primary users:** Students (especially upperclassmen), parents, counselors, career advisors.

**Key features:**

- **Career exploration** — pathways, interest matching, industry profiles
- **College planning** — search, applications tracker, essay workspace, visit scheduler
- **Trade schools & apprenticeships** — programs, applications, employer partners
- **Military pathways** — ASVAB prep, recruiter connections, ROTC info
- **Scholarships** — database, eligibility matching, application tracking
- **Resume builder** — fed by Portfolio (Module 11)
- **Recruiter connections** — school-approved employer and college rep directory
- **Internships board** — postings, applications, hour tracking
- **Career AI** — mentor-scoped recommendations (not counseling)
- Absorbs `/pathways` career framing over time

**Cross-reference:** `/pathways` dashboard links 14 academies (Phase 13). No college/trade/military/scholarship domains.

---

## 11. Resume & Portfolio

**Purpose:** Evidence collection and professional presentation — projects, credentials, and exportable resume.

**Primary users:** Students (owner), parents (view), teachers/advisors (review), recruiters (shared view, future).

**Key features:**

- Portfolio items — projects, certifications, service hours, work samples, reflections
- Tags by academy, skill, and Future Center pathway
- **Resume builder** — auto-populate from portfolio, certifications, service, athletics
- PDF/export for college and job applications
- Teacher/advisor endorsement or review workflow
- Links to academy capstone missions and Future Center applications
- Public share link (student-controlled, optional)

**Cross-reference:** Phase 8 portfolio CRUD built. No resume builder, endorsements, or export.

---

## 12. Blue Don AI

**Purpose:** Campus-wide AI mentor that guides students — **not** a counselor or clinician.

**Primary users:** Students (primary); teachers/advisors (context tools, future).

**Key features:**

- Global AI Assistant nav entry (`/ai-assistant`)
- **Mentor persona** — suggests next steps, resources, opportunities, academy paths
- Context-aware: About Me, journey stage, academy progress, Future Center goals
- **Guardrails** — no mental health diagnosis, no crisis handling in-bot; human escalation links always visible
- Academy coaching in learning flow (replaces Phase 13 placeholder)
- Student Journey AI and Career AI as scoped modes
- Conversation history, opt-out, audit logging
- Clear labeling when AI is stubbed vs. live

**Cross-reference:** Placeholder UI in `learning-flow.tsx` only. No global AI.

---

## 13. Blue Don Corner

**Purpose:** Campus marketplace and student-to-student commerce within school rules.

**Primary users:** Students (buy/sell), teachers (approve listings), admin (moderate).

**Key features:**

- Marketplace listings — school supplies, spirit wear, club merchandise, approved services
- Org store integration (club fundraisers, athletics gear)
- Blue Don Coins payment option (ties to Rewards System)
- Listing approval workflow
- Transaction history and ratings (positive-only reviews)
- Distinct from Community Feed (Module 16) — commerce vs. social

**Cross-reference:** No marketplace. Impact Fund is proposals/voting, not commerce.

---

## 14. Rewards System

**Purpose:** Motivation layer — earned recognition through XP, coins, badges, and streaks.

**Primary users:** Students (earn/spend); teachers (grant rewards); admin (configure).

**Key features:**

- **XP ledger** — activities, events, academy progress, service hours, kindness actions
- **Blue Don Coins** — earnable currency; spend in Blue Don Corner marketplace
- **Badges & achievements** — academy certs, service milestones, streaks, special honors
- **Streaks** — daily engagement, service, learning consistency
- **Leaderboards** — school, academy, org (extends Phase 13 `LeaderboardEntry`)
- **Teacher rewards** — staff can grant bonus XP/coins for exceptional effort
- Anti-gaming rules — caps, audit, fairness across grade levels
- Dashboard widget showing streak and recent earnings

**Cross-reference:** `LeaderboardEntry` and `Event.impactPoints` exist. No XP, coins, badges, store, or teacher grants.

---

## 15. Event Hub

**Purpose:** Create an event once; publish everywhere it needs to appear.

**Primary users:** Event creators (staff, club officers, coaches, admin).

**Key features:**

- Authoring workflow: draft → review → scheduled → live → archived
- **Publication surfaces:** Smart Calendar, org workspace, School Hub, Community Feed, dashboard notifications, Google Calendar, parent alerts
- RSVP, volunteer signup, fundraiser attachment
- Recurrence and event templates (game night, club meeting, spirit week)
- Permissions by org and role
- QR check-in linkage for service events (Module 9)

**Cross-reference:** Phase 4 events CRUD with academy scope. No cross-surface publish engine.

---

## 16. Community Feed

**Purpose:** Positive-only social layer — celebrate, encourage, and spotlight the Madonna community.

**Primary users:** All roles (post/react within permissions); moderators (admin).

**Key features:**

- **Positive-only design** — kindness actions, shout-outs, celebrations, good news
- No anonymous posting; no drama threads
- Reactions, comments (moderated), spotlights, student/teacher of the week
- Org and academy cross-posts from Event Hub
- Moderation queue, report flow, auto-flagging
- Lives inside **Blue Don Corner** nav destination (social tab vs. marketplace tab)

**Cross-reference:** No feed models or routes. Knowledge Vault is articles, not social.

---

## 17. Media Center

**Purpose:** School media library — photos, videos, albums, and published content archive.

**Primary users:** Media staff, teachers, club officers (upload); all roles (browse within permissions).

**Key features:**

- Photo and video upload, albums, tagging (event, org, person)
- Approval workflow for published media
- Integration with org galleries and athletics media
- Digital yearbook archive (future)
- Search and filter by date, org, event
- Absorbs and extends Knowledge Vault media patterns

**Cross-reference:** Knowledge articles exist. No media asset library.

---

## 18. Broadcasting Center

**Purpose:** Operational home for Broadcast Academy — studio, productions, live streams, and media workflows.

**Primary users:** Broadcast academy students, media teachers, IT support.

**Key features:**

- Maps to **Broadcast Academy** (`broadcast` slug) in Academy Engine
- Production schedule, equipment checkout, studio booking
- Live stream publishing (ties to Media Center and Community Feed)
- Show archive, episode catalog, crew assignments
- Academy learning modules + operational tools in one workspace
- Future: integration with school announcement displays

**Cross-reference:** Broadcast academy content seeded (Phase 14–15). No operational center UI.

---

## 19. IT Center

**Purpose:** Operational home for IT Academy — help desk operations, device management, and student IT service.

**Primary users:** IT academy students, IT staff, teachers, all students (request help).

**Key features:**

- Maps to **IT Academy** (`it` slug) in Academy Engine
- Student-run help desk queue (extends Service Center tickets)
- Device loaner tracking, Chromebook repair workflow
- Active Directory lab integration (Phase 12 interactive lab)
- Knowledge base contributions from IT students
- Academy learning + live operations combined

**Cross-reference:** IT academy + Help Desk lab built. Service Desk is generic, not IT Center-branded.

---

## 20. Circuit Center

**Purpose:** Operational home for Circuit/Makers programs — Cricut, electronics, fabrication, and maker space.

**Primary users:** Cricut & Makers academy students, shop teachers, club makers.

**Key features:**

- Maps to **Cricut & Makers Academy** (`cricut-makers` slug) and related maker pathways
- Equipment reservation, material inventory, project gallery
- Circuit project submissions and showcases
- Ties to Impact Fund for maker proposals
- Academy learning + maker space operations

**Cross-reference:** Cricut academy seeded. No maker space operations UI.

---

## 21. My Journey

**Purpose:** Personal timeline of the student's entire Madonna experience — the narrative view of growth.

**Primary users:** Students (owner); parents and advisors (view, permissions).

**Key features:**

- Chronological timeline — enrollments, certifications, service, athletics, events, milestones
- Filterable by domain (academics, service, life, career)
- Journal entries and reflections (student-authored)
- Shareable milestone cards
- Feeds Blue Don Tree visualizations
- Utility nav entry from profile/dashboard (not primary sidebar)

**Cross-reference:** No timeline UI. Portfolio items are list, not timeline.

---

## 22. Blue Don Tree

**Purpose:** Visual growth metaphor — a living representation of the student's development over years.

**Primary users:** Students (primary); parents (view).

**Key features:**

- Tree graphic grows with XP, certifications, service hours, milestones
- Branches represent domains: academics, service, athletics, leadership, faith, career
- Seasonal and achievement-based visual rewards (blossoms, fruit, nest badges)
- Tied to Rewards System and Student Journey milestones
- Gentle motivation for 7th graders; deeper symbolism for seniors
- Displayed on dashboard and My Journey

**Cross-reference:** No visual growth system. Concept only.

---

## 23. Graduation Readiness

**Purpose:** Senior-year command center for everything required to graduate and launch.

**Primary users:** Seniors, parents, counselors, admin.

**Key features:**

- Graduation requirements checklist (credits, service hours, certifications, forms)
- College/application status tracker (links Future Center)
- Senior events calendar (graduation rehearsal, prom, awards)
- Capstone and portfolio completion status
- Deficiency alerts for students and advisors
- Dashboard prominence for senior role template
- Handoff to Alumni Portal post-graduation

**Cross-reference:** Checklists exist (Phase 7) but not graduation-specific. No senior command center.

---

## 24. Parent Portal

**Purpose:** Family hub for everything parents need across one or more enrolled students.

**Primary users:** Parents, guardians.

**Key features:**

- Multi-student linkage (siblings)
- Forms — sign, submit, track status (extends Phase 5 `/parent`)
- Student progress summaries (academies, service, attendance overview)
- Events and athletics schedules for linked students
- Future Center visibility (parent-approved scope)
- School Hub announcements and calendar
- Communication preferences and notifications

**Cross-reference:** Phase 5 parent forms summary at `/parent`. No multi-student or progress hub.

---

## 25. Alumni Portal

**Purpose:** Keep graduates connected to Madonna — network, events, giving, mentorship.

**Primary users:** Alumni, advancement office, admin.

**Key features:**

- Alumni profile — class year, current career, location
- Class cohort pages (handoff from Class Pages)
- Events — reunions, homecoming, networking
- Mentorship matching with current students
- Giving and fundraising campaigns
- Media/yearbook archive access
- Career network and job board (alumni-to-student)

**Cross-reference:** No alumni role, routes, or schema.

---

## 26. Administration Center

**Purpose:** Staff operations hub — configuration, compliance, reporting, integrations, org management.

**Primary users:** Admin, principal, registrar, IT admin, advisors (scoped).

**Key features:**

- User and role management (extends Phase 2)
- Academy engine admin (Phase 13 `/admin/academy-engine`)
- Forms, compliance, constitution, approvals (Phase 5 `/admin/*`)
- Org management — clubs, classes, teams provisioning
- Integration monitoring (Google, FACTS)
- Reporting and analytics (Phase 11 — not yet implemented)
- System health, audit logs, moderation queue
- Primary nav label "Administration" (internal routes may stay `/admin`)

**Cross-reference:** `/admin/*` routes exist but not in primary sidebar. Phase 11 reporting not built.

---

## 27. Permissions System

**Purpose:** Role-based access control governing every module, org, and data surface.

**Primary users:** System (enforcement); admin (configuration).

**Key features — 14 roles (proposed, stakeholder validation required):**

| # | Role | Scope |
|---|------|-------|
| 1 | **Student** | Own data, org member, academy participant |
| 2 | **Teacher** | Classes, assignments, student view (scoped) |
| 3 | **Parent** | Linked student data, forms, events |
| 4 | **Advisor** | Academy oversight, student advisement (existing) |
| 5 | **Administrator** | Full platform admin (existing `admin`) |
| 6 | **Principal** | School-wide view, announcements, compliance |
| 7 | **Counselor** | Student guidance records, Future Center, graduation (staff — not AI) |
| 8 | **Coach** | Team roster, athletics workspace |
| 9 | **Athletic Director** | All athletics, coaches, schedules |
| 10 | **Club Advisor** | Org workspace admin for assigned clubs |
| 11 | **Academy Lead** | Academy content, members, certifications |
| 12 | **Alumni** | Alumni portal, mentorship, limited student contact |
| 13 | **Sponsor** | Community partner, events, Impact Fund (existing) |
| 14 | **Moderator** | Community feed, media approval, marketplace listings |

- Permission strings per module action (view, create, edit, delete, approve, publish)
- Org-scoped roles (officer, member, coach, moderator) layered on global roles
- Parent–student linkage with FERPA-aware visibility
- API enforcement via `hasPermission()` and service-layer checks
- Extends today's 5 roles in `src/config/roles.ts`

**Cross-reference:** 5 roles built. No org-scoped permissions, alumni, teacher, or 14-role matrix.

---

## Module Dependencies (Summary)

```
Permissions (27) ──► all modules
Student Journey (2) ──► Dashboard (1), AI (12), Future Center (10), Blue Don Tree (22)
Organization Workspaces ──► Student Life (5), Class Pages (6), Athletics (8), Academies (7)
Event Hub (15) ──► Smart Calendar (3), Community Feed (16), all org workspaces
Portfolio (11) ──► Future Center (10), Graduation Readiness (23)
Rewards (14) ──► Blue Don Corner (13), Blue Don Tree (22), teacher grants
Academy Engine ──► Centers (18–20), Labs, Simulators (Phase 12)
Integrations ──► Smart Calendar (3), Administration (26)
```

---

## Related Documents

- [02_GAP_ANALYSIS.md](./02_GAP_ANALYSIS.md) — Phase 0–15 mapping per module
- [03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md) — Nav placement
- [05_ROADMAP.md](./05_ROADMAP.md) — Build order
- [08_RBAC_MATRIX.md](./08_RBAC_MATRIX.md) — Full permission matrix (planned)
