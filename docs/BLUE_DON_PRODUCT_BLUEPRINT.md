# The Blue Don Product Blueprint

**Document 2 of 5 — Foundational Documents**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for planning and phased delivery  
**Audience:** Product owners, faculty, advisors, developers, and school leadership  

**Companion documents:** [Constitution](./BLUE_DON_CONSTITUTION.md) · [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Blue Don Virtual Campus is the **digital operating system** for Madonna High School — a unified platform for students, families, faculty, and community partners from **7th grade through alumni life**.

It is **not** an LMS, a link portal, or a social network. It connects academies, student life, career preparation, governance, service, and operations into one coherent journey.

> **Every Student, Every Opportunity, Every Journey**

### Platform at a glance

| Layer | What it includes |
|-------|------------------|
| **Personal** | Dashboard, Student Journey, My Journey, Blue Don Tree, Graduation Readiness |
| **School-wide** | School Hub, Smart Calendar, Event Hub |
| **Student life** | Clubs, Class Pages, Athletics |
| **Learning** | 14 MEN Academies, Broadcast/IT/Circuit Centers |
| **Future** | Future Center, Resume & Portfolio |
| **Community** | Blue Don Corner, Community Feed, Media Center, Rewards |
| **Support** | Service Center, Blue Don AI |
| **Governance** | Parent Portal, Alumni Portal, Administration, Permissions |

**27 modules** · **14 roles** · **12 primary navigation destinations** (enterprise target)

---

## Part I — Users & Roles

### Global campus roles (10)

One primary role per user, stored on `User.role`.

| Role | Label | Primary responsibility |
|------|-------|------------------------|
| `admin` | Administrator | School operations, integrations, compliance, user management |
| `advisor` | Advisor | Academy oversight, form approvals, student mentoring |
| `teacher` | Teacher | Instruction, class workspaces, assignments |
| `student` | Student | Learning, portfolio, student life, rewards |
| `parent` | Parent | Linked-student visibility, forms, events |
| `sponsor` | Sponsor | Partnership packets, limited fund/event visibility |
| `alumni` | Alumni | Network, mentorship, giving (post-graduation) |
| `staff` | Staff | Non-teaching operations (facilities, front office) |
| `coach` | Coach | Athletics workspaces, rosters, schedules |
| `counselor` | Counselor | Journey/Future Center context, referral flags (not AI therapy) |

### Organization membership roles (4)

Per-organization scope on `OrganizationMembership.orgRole`. A user may hold different org roles in different orgs.

| Role | Label | Typical orgs |
|------|-------|--------------|
| `lead` | Lead / President | Clubs, teams, academies |
| `officer` | Officer | Clubs, student government |
| `moderator` | Moderator | Clubs, community channels |
| `member` | Member | Clubs, classes, teams, academies |

**Rule:** Global role sets the ceiling; org role sets authority within that org. A `student` who is `officer` in Robotics Club can manage club announcements but cannot access `/admin`.

### Personas & grade bands

| Persona | Who | Dashboard emphasis |
|---------|-----|-------------------|
| Middle school explorer | Grades 7–8 | Clubs, kindness, exploration |
| Freshman onboarding | Grade 9 | Academy join, habits, forms |
| Upperclass pathway | Grades 10–11 | Certifications, Future Center, depth |
| Senior launch | Grade 12 | Graduation Readiness, applications, capstone |
| Parent hub | Parents | Forms, events, linked student progress |
| Teacher command | Teachers | Classes, assignments, approvals |
| Advisor oversight | Advisors | Academies, compliance, mentoring |
| Admin command | Administrators | Governance, integrations, health |

---

## Part II — The 27 Platform Modules

### Build status legend

| Status | Meaning |
|--------|---------|
| **Built** | Shipped in Phases 0–16 |
| **Partial** | Core exists; enterprise gaps remain |
| **Planned** | Documented; not yet implemented |

### Module index

| # | Module | Status | Primary route(s) |
|---|--------|--------|------------------|
| 1 | Personalized Dashboard | Partial | `/dashboard` |
| 2 | Student Journey | Planned | `/journey`, `/portfolio/journey` |
| 3 | Smart Calendar | Partial | `/calendar` |
| 4 | School Hub | Planned | `/hub` (proposed) |
| 5 | Student Life / Clubs | Partial | `/orgs/[slug]` (proposed) |
| 6 | Class Pages | Planned | Org type `CLASS` |
| 7 | Academies | Built | `/academies`, `/pathways` |
| 8 | Athletics | Planned | `/athletics` (proposed) |
| 9 | Service Center | Partial | `/service-desk` |
| 10 | Future Center | Partial | `/pathways`, `/future` (proposed) |
| 11 | Resume & Portfolio | Partial | `/portfolio` |
| 12 | Blue Don AI | Planned | `/ai-assistant` (proposed) |
| 13 | Blue Don Corner | Planned | `/corner` (proposed) |
| 14 | Rewards System | Partial | Dashboard widget; ledger planned |
| 15 | Event Hub | Partial | `/events` |
| 16 | Community Feed | Planned | Tab in Blue Don Corner |
| 17 | Media Center | Planned | `/media` (proposed) |
| 18 | Broadcasting Center | Partial | `/academies/broadcast` + ops tools |
| 19 | IT Center | Partial | `/academies/it` + Service Desk |
| 20 | Circuit Center | Partial | `/academies/cricut-makers` + maker ops |
| 21 | My Journey / Madonna Journey | Planned | `/my-journey` — [Journey doc](./BLUE_DON_MY_MADONNA_JOURNEY.md) |
| 22 | Blue Don Tree | Planned | Dashboard widget |
| 23 | Graduation Readiness | Planned | Senior dashboard / `/graduation` |
| 24 | Parent Portal | Partial | `/parent` |
| 25 | Alumni Portal | Planned | `/alumni` |
| 26 | Administration Center | Partial | `/admin` |
| 27 | Permissions System | Partial | RBAC in `roles.ts` + org model |
| 28 | Blue Don Broadcasts | Planned | `/broadcasts` — [Broadcasts doc](./BLUE_DON_BROADCASTS.md) |
| 29 | Student Leadership Center | Planned | `/leadership` — position-based comm permissions |
| 30 | Blue Don ID & Wallet | Planned | `/id`, `/wallet` — [ID doc](./BLUE_DON_ID.md) |
| 31 | Guidance & Counseling Center | Planned | `/guidance` — [Guidance doc](./BLUE_DON_GUIDANCE_CENTER.md) |
| 32 | Campus Operations Center | Planned | `/operations` — [Operations doc](./BLUE_DON_CAMPUS_OPERATIONS.md) |
| 33 | Blue Don Requests | Planned | `/requests` — [Requests doc](./BLUE_DON_REQUESTS.md) |
| 34 | Campus Life | Planned | `/campus-life` — [Campus Life doc](./BLUE_DON_CAMPUS_LIFE.md) |
| 35 | Opportunity Center | Planned | `/opportunities` — [Opportunity doc](./BLUE_DON_OPPORTUNITY_CENTER.md) |
| 36 | Character & Legacy | Planned | `/challenges`, `/character`, `/halls` — [Character doc](./BLUE_DON_CHARACTER_AND_LEGACY.md) |
| 37 | Daily Discovery | Planned | `/discover` — [Discovery doc](./BLUE_DON_DAILY_DISCOVERY.md) |
| 38 | Campus Challenges | Planned | `/challenges/campus` — [Campus Challenges doc](./BLUE_DON_CAMPUS_CHALLENGES.md) |
| 39 | Blue Don Arcade | Planned | `/arcade` — [Arcade doc](./BLUE_DON_ARCADE.md) |

---

### Module summaries

#### 1 — Personalized Dashboard
Role- and grade-aware home. Widgets: greeting, quick actions, metrics, assignments, calendar slice, events, notifications, portfolio, academy progress, admin health/compliance. **Built:** config-driven layouts (Phase 16). **Gap:** full enterprise widget set and user preferences.

#### 2 — Student Journey
Longitudinal profile from 7th grade: About Me, interests, goals, semester check-ins, milestone timeline. Feeds AI, Future Center, Rewards, Blue Don Tree. **Gap:** `StudentProfile` schema and UI.

#### 3 — Smart Calendar
Aggregates school events, academy sessions, club meetings, athletics, Google Classroom due dates, Google Calendar, personal reminders. Color-coded sources, conflict hints. **Built:** campus events (Phase 4). **Gap:** multi-source aggregation and Google sync.

#### 4 — School Hub
School-wide desk: announcements, bell schedule, lunch menu, campus map, directory, policies. Absorbs Knowledge Vault school articles and published forms catalog. **Gap:** hub shell and operational content types.

#### 5 — Student Life / Clubs
Club directory and **organization workspaces** (announcements, calendar, members, media, events, store, leadership). **Partial:** `Organization` model seeded (Phase 16). **Gap:** `/orgs/[slug]` workspace UI.

#### 6 — Class Pages
One workspace per graduating class (e.g., Class of 2030). Same template as clubs; senior content flows to Graduation Readiness; alumni handoff. **Gap:** class org provisioning and UI.

#### 7 — Academies (Madonna Education Network)
**14 career academies** with shared Academy Engine:

| Academy slug | Focus |
|--------------|-------|
| `broadcast` | Broadcast & media production |
| `it` | IT, help desk, enterprise support |
| `cybersecurity` | Security fundamentals |
| `robotics` | Robotics engineering |
| `software-development` | Software development |
| `business-marketing` | Business & digital marketing |
| `graphic-design` | Graphic design |
| `cricut-makers` | Makers & fabrication |
| `athletics-operations` | Sports management (instructional) |
| `service-leadership` | Service & leadership |
| `health-sciences` | Health sciences pathway |
| `education` | Education pathway |
| `hospitality` | Hospitality |
| `automotive` | Automotive technology |

**Engine features (built):** modules, lessons, videos, labs, simulators, missions, certifications, leaderboards, pathways dashboard. **Seven tiers:** Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone. **Learning flow:** Learn → Watch → Guided Lab → Practice → Challenge → Exam → Certification → Capstone.

#### 8 — Athletics
Team workspaces: roster, schedule, stats, media, parent notifications. Distinct from Athletics Operations *academy* (which teaches sports management). **Gap:** team org type and workspace UI.

#### 9 — Service Center
Unified help: IT tickets, facilities requests, **account management** (create users, reset passwords), volunteer hour tracking, QR check-in. **Built:** tickets (Phase 9), account admin at `/service-desk/users`. **Gap:** facilities, volunteer hours, QR.

#### 10 — Future Center
College, trade, military, scholarships, internships, resume builder, recruiter directory, Career AI (mentor-scoped). **Partial:** `/pathways` links academies to careers. **Gap:** application trackers, scholarship DB.

#### 11 — Resume & Portfolio
Evidence collection: projects, certifications, service, leadership. Tags, endorsements, PDF export, share links. **Built:** portfolio CRUD (Phase 8). **Gap:** resume builder, export, endorsements.

#### 12 — Blue Don AI
Campus mentor — next steps, resources, academy hints. **Not** counseling or crisis support. Modes: global assistant, journey AI, career AI, academy coaching. **Gap:** all AI implementation; placeholder in learning flow only.

#### 13 — Blue Don Corner
Campus marketplace: spirit wear, club merch, approved listings. Blue Don Coins payment. **Gap:** marketplace schema and UI.

#### 14 — Rewards System
XP, Blue Don Coins, badges, streaks, teacher grants, leaderboards. Anti-gaming rules. **Partial:** `LeaderboardEntry`, event impact points. **Gap:** XP ledger, coins, store, badges.

#### 15 — Event Hub
Create once, publish everywhere: calendar, org page, School Hub, feed, Google Calendar, parent alerts. RSVP, volunteers, recurrence. **Built:** event CRUD with academy scope. **Gap:** `EventPublication` cross-surface engine.

#### 16 — Community Feed
Positive-only social: shout-outs, celebrations, spotlights. No anonymity. Moderation queue. Lives in Blue Don Corner nav. **Gap:** feed models and UI.

#### 17 — Media Center
Photo/video library, albums, approval workflow, yearbook archive direction. **Gap:** media asset schema.

#### 18–20 — Academy Operations Centers
**Broadcast Center**, **IT Center**, **Circuit Center** — operational tools atop respective academies (studio booking, help desk queue, equipment checkout). **Partial:** academy learning content; **Gap:** operations UI.

#### 21 — My Madonna Journey
Year-by-year timeline, achievement system, My Story semesters, Year in Review, graduation video, Memory Vaults, personal analytics, class legacy, Digital Time Capsule. See [BLUE_DON_MY_MADONNA_JOURNEY.md](./BLUE_DON_MY_MADONNA_JOURNEY.md).

#### 22 — Blue Don Tree
Visual growth metaphor tied to XP and milestones. Dashboard + journey display. **Gap:** visual system.

#### 23 — Graduation Readiness
Senior command center: credit checklist, applications, senior events, capstone status, deficiency alerts. **Gap:** graduation-specific checklist engine.

#### 24 — Parent Portal
Multi-student linkage, forms, progress summaries, events, athletics, Future Center (scoped). **Partial:** `/parent` form status (Phase 5). **Gap:** multi-child, progress hub.

#### 25 — Alumni Portal
Profile, class cohort, reunions, mentorship, giving, job board. **Gap:** alumni role routes and schema.

#### 26 — Administration Center
Users, academies, forms, compliance, integrations health, reporting, moderation. **Built:** `/admin/*` governance hub. **Gap:** primary nav promotion, reporting (Phase 11), integrations admin UI.

#### 27 — Permissions System
14-role RBAC, org-scoped keys, parent–student linkage, server enforcement. **Partial:** global roles + org model (Phase 16). **Gap:** `ParentGuardian`, fine-grained grants, nav filtering v2.

#### 28 — Blue Don Broadcasts
Official campus communications — audience-targeted **broadcasts** (not generic announcements). Priority levels, advisor approval, campus ticker, event reminders, AI assistant. **Gap:** full system — see [BLUE_DON_BROADCASTS.md](./BLUE_DON_BROADCASTS.md).

#### 29 — Student Leadership Center
Class officers, club presidents, team captains, council roster. Positions unlock scoped broadcast permissions. **Gap:** `LeadershipPosition` schema and `/leadership` UI.

#### 30 — Blue Don ID & Wallet
`Blue Don ID <SIS MD ID>` — Apple Wallet meets student ID. One QR for attendance, events, service, equipment, cafeteria, library, store. Student Passport stamps, Digital Backpack, Blue Don Wallet. **Gap:** full system — see [BLUE_DON_ID.md](./BLUE_DON_ID.md).

#### 31 — Guidance & Counseling Center
Appointments, transcripts, graduation requirements, four-year plans, scholarships, wellness resources, recommendation requests. **Gap:** full system — see [BLUE_DON_GUIDANCE_CENTER.md](./BLUE_DON_GUIDANCE_CENTER.md). **Build after** Blue Don ID.

#### 32 — Campus Operations Center
Department workspaces (IT, Broadcasting, Facilities, Library, Ministry, Health, Admissions, etc.). IT Operations flagship. Fundraising Hub, School Analytics, Partner Portal, ticketing. **Gap:** full system — see [BLUE_DON_CAMPUS_OPERATIONS.md](./BLUE_DON_CAMPUS_OPERATIONS.md).

#### 33 — Blue Don Requests
Unified request system — every campus ask with status transparency (Submitted → In Review → Approved → Completed). Replaces email chains. **Gap:** full system — see [BLUE_DON_REQUESTS.md](./BLUE_DON_REQUESTS.md). **Prerequisite** for Operations queues.

#### 34 — Campus Life
School culture layer — Today at Madonna, tradition hubs, spirit points, Blue Don Live, campus map, celebrations. See [BLUE_DON_CAMPUS_LIFE.md](./BLUE_DON_CAMPUS_LIFE.md).

#### 35 — Opportunity Center
Proactive discovery — AI feed, What If?, bucket list, Blue Don Connect. See [BLUE_DON_OPPORTUNITY_CENTER.md](./BLUE_DON_OPPORTUNITY_CENTER.md).

#### 36 — Character & Legacy
Daily Challenge, Character Journey virtues, Quest Board, Hall of Legacy, etc. See [BLUE_DON_CHARACTER_AND_LEGACY.md](./BLUE_DON_CHARACTER_AND_LEGACY.md).

#### 37 — Daily Discovery
Daily learning cards, Catholic Corner, Today I Learned. See [BLUE_DON_DAILY_DISCOVERY.md](./BLUE_DON_DAILY_DISCOVERY.md).

#### 38 — Campus Challenges
Monthly seasons, Mystery Monday, Flash Challenges, champion banners. See [BLUE_DON_CAMPUS_CHALLENGES.md](./BLUE_DON_CAMPUS_CHALLENGES.md).

#### 39 — Blue Don Arcade
Play. Learn. Earn. — daily brain games (BlueDonle, Bible Wordle, IT/Circuit challenges), streaks, weekly tournaments, educational games (Adulting, FAFSA), escape rooms, prize wheel, **Campus Quest** QR scavenger hunt. Duolingo-style engagement. See [BLUE_DON_ARCADE.md](./BLUE_DON_ARCADE.md).

---

## Part III — Navigation & Information Architecture

> **Canonical deep IA:** [Blue Don Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) — 14 destinations, section trees, Blue Don OS.

### IA principles

1. **Fourteen primary destinations** — the digital twin of campus life, not engineering module names.  
2. **My Journey is primary nav** — the student's personal operating system, not a profile submenu.  
3. **Organizations are workspaces** — clubs, classes, teams, academies share a template.  
4. **Depth via context** — global nav stays shallow; section tabs provide second level.  
5. **Config-driven** — `src/config/navigation.ts` is the single source.  
6. **No orphan routes** — every route maps to nav, org tab, admin section, or utility.

### Current navigation (as-built, Phase 16)

| # | Label | Route |
|---|-------|-------|
| 1 | Dashboard | `/dashboard` |
| 2 | Pathways | `/pathways` |
| 3 | Academies | `/academies` |
| 4 | Calendar | `/calendar` |
| 5 | Forms | `/forms` |
| 6 | Labs | `/labs` |
| 7 | Simulators | `/simulators` |
| 8 | Portfolio | `/portfolio` |
| 9 | Events | `/events` |
| 10 | Service Desk | `/service-desk` |
| 11 | Impact Fund | `/impact-fund` |
| 12 | Knowledge Vault | `/knowledge` |

### Enterprise target navigation (Phase 17+)

| # | Label | Route | Modules absorbed |
|---|-------|-------|------------------|
| 1 | Home | `/home` | Blue Don OS, Dashboard, Blue Don Tree |
| 2 | My Journey | `/my-journey` | Student Journey, Portfolio, Graduation |
| 3 | School Hub | `/hub` | School Hub, Knowledge Vault (school), Forms catalog |
| 4 | Student Life | `/student-life` | Clubs, Class Pages, org workspaces |
| 5 | Academies | `/academies` | MEN, Broadcast/IT/Circuit Centers, Labs, Sims |
| 6 | Athletics | `/athletics` | Athletics teams |
| 7 | Service Center | `/service` | Volunteer, hours, QR check-in via **Blue Don ID** |
| 7b | Guidance Center | `/guidance` | Counseling, planning, transcripts (Module 31) |
| 8 | Future Center | `/future` | Career, college, trades, scholarships |
| 9 | Blue Don Corner | `/corner` | Marketplace, spirit wear, fundraisers |
| 10 | Community | `/community` | Campus Feed, spotlights, kindness |
| 11 | Media Center | `/media` | Photos, video, yearbook, archives |
| 12 | Rewards | `/rewards` | XP, coins, badges, shop |
| 13 | Blue Don AI | `/ai` | Scoped campus assistant |
| 14 | Administration | `/admin` | Admin Center, Service Desk (staff) |

**Utility navigation** (header): Smart Calendar, Parent Portal, Alumni Portal, Profile, Settings.

**Legacy routes** (`/forms`, `/labs`, `/events`, etc.) redirect during migration — see Digital Campus Appendix.

### Organization workspace template

Every org (club, class, team, academy) shares tabs:

| Tab | Purpose |
|-----|---------|
| Overview | Stats, welcome, quick links |
| Announcements | Officer posts |
| Calendar | Org events (feeds Event Hub) |
| Members | Roster, join requests |
| Media | Photos, videos |
| Events | Event list + create (permissioned) |
| Resources | Docs, links |
| Store | Fundraiser / merch (optional) |
| Leadership | Officer roster |
| Settings | Org config (lead only) |

---

## Part IV — Core Workflows

### WF-1 — Authentication & onboarding

```
Register/SSO → Email confirm → Onboarding (name) → Role assignment → Dashboard
Forgot password → Email link → /reset-password → New password → Dashboard
Admin create user → Service Desk → Immediate login (no email confirm required)
```

**Roles at registration:** Default `student`; invite links may specify role. **FACTS sync** (future): auto-provision with `PENDING` until verified.

### WF-2 — Forms & governance

```
Admin: Draft → Review → Approve → Publish → (use) → Complete → Archive
User: View published form → Sign (checkbox + typed name) → Submit
If approval_required: Advisor/Admin approves or rejects
Compliance: Track missing, unsigned, expired per active user
```

**Required form types:** Enrollment Packet, Student Agreement, Parent Agreement, Participation Commitment, Media Release, Technology Agreement, Event Registration, Volunteer, Sponsor Packet, Purchase Request, Travel Approval, Risk Acknowledgement, Equipment Checkout.

**Approval types:** Join Academy, Purchase, Sponsor, Event, Travel, Impact Fund, Capstone, Publishing.

### WF-3 — Academy enrollment

```
Student browses Academies → Opens pathway → Request to join
Advisor reviews pending membership → Approve/Reject
On approve: ACTIVE membership, academy progress initialized
Learning: Module → Lessons → Labs/Sims → Assessments → Certification → Capstone
```

### WF-4 — Events (Event Hub target)

```
Creator drafts event → Review (if required) → Schedule
Publish to surfaces: Calendar, org page, School Hub, feed, Google Calendar, notifications
Participants RSVP → Attendance tracked → Archive (no hard delete)
```

**Current:** Phase 4 event CRUD with academy scope and participants. **Target:** `EventPublication` multi-surface publish.

### WF-5 — Service Center

```
User opens ticket (category: technical, academic, facilities, account, other)
Staff triages → Assign → Resolve → Close
Admin: Account management — create user, reset password, change role
Future: Facilities work orders, volunteer QR check-in
```

### WF-6 — Portfolio & evidence

```
Student creates portfolio item (project, certification, service, leadership, achievement)
Draft → Published → Optional share link
Future: Teacher endorsement, resume auto-populate, Future Center applications
```

### WF-7 — Impact Fund (student grants)

```
Student proposes project → Submitted → Voting window → Approved/Rejected → Funded
Admin allocates funded amount
Academy-scoped proposals optional
```

### WF-8 — Student Journey (target)

```
Grade 7: About Me v1, club exploration
Grade 9: Academy commitment, portfolio start
Grades 10–11: Semester check-in, Future Center linkage
Grade 12: Monthly check-in, graduation checklist
Alumni: Profile refresh, mentor opt-in
```

### WF-9 — Integrations (user-visible)

```
Settings → Connected accounts → Google status
Dashboard: Classroom assignments badge on due widget
Calendar: Google events merged (color-coded)
Admin: Integration health dashboard
```

### WF-10 — Rewards (target)

```
Activity completes → XP awarded → Coins optional → Badge unlock
Teacher grant bonus → Audit log
Spend coins in Blue Don Corner
Leaderboard per academy / school
```

---

## Part V — Madonna Education Network (MEN)

### Pathway map

| Career pathway | Primary academies |
|----------------|-------------------|
| Broadcast & Media | Broadcast, Graphic Design |
| IT | IT, Cybersecurity |
| Software Development | Software Development, IT |
| Robotics Engineering | Robotics, Software Development |
| Digital Marketing | Business & Marketing |
| Graphic Design | Graphic Design, Broadcast |
| Business & Entrepreneurship | Business & Marketing, Service Leadership |

### Academy Engine progression

```
Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone
```

Each tier contains **learning modules** with lessons, videos, labs, simulators, assessments, and missions. **Certifications** validate competency. **Capstone missions** demonstrate industry readiness.

---

## Part VI — Build Discipline

### Phases completed (0–16)

| Phase | Name | Key deliverable |
|-------|------|-----------------|
| 0 | Project init | Repo, stack, health check |
| 1 | Core shell | Layout, nav, branding |
| 2 | Auth & roles | Supabase, 5 roles → 10 roles |
| 3 | Dashboard | Quick actions, widgets |
| 4 | Calendar & events | Events, participants |
| 5 | Forms & governance | Forms, approvals, compliance |
| 6 | Academy framework | Academies, memberships |
| 7 | Checklist engine | Event/academy checklists |
| 8 | Portfolio | Portfolio items |
| 9 | Service desk | Tickets |
| 10 | Knowledge vault | Articles |
| 12 | Labs, simulators, Impact Fund | Interactive content, proposals |
| 13–15 | Academy engine | Modules, content, MEN academies |
| 16 | RBAC & orgs | 14 roles, organizations, dashboard layouts |

### Enterprise phases (17+)

See `docs/enterprise-blueprint/05_ROADMAP.md` for full dependency graph. Highlights:

| Phase | Focus |
|-------|-------|
| 17 | Navigation IA migration, School Hub, Administration in nav |
| 18 | Event Hub + Smart Calendar + Google Calendar |
| 19 | Student Journey, My Journey, Blue Don Tree |
| 20 | Future Center, Graduation Readiness |
| 21 | Community Feed, Blue Don Corner, Rewards |
| 22 | Blue Don AI |
| 23 | Parent/Alumni portals, FACTS depth |
| 24 | UI redesign, mobile polish |
| 25 | Analytics, reporting |

**Rule:** One phase at a time. Stop for approval. Constitution alignment required.

---

## Part VII — Success Metrics (product)

| Metric | Target |
|--------|--------|
| Student onboarding | < 5 minutes to first academy browse |
| Form compliance | 100% published required forms trackable |
| Academy engagement | Module progress persisted per student |
| Service response | Ticket status visible to requester |
| Parent access | Linked student forms completable without student account |
| Mobile usage | PWA installable; core flows work on phone |
| Integration health | Google/FACTS sync status visible to admin |

---

## Appendix A — Route catalog (as-built)

| Route | Module |
|-------|--------|
| `/dashboard` | Dashboard |
| `/pathways` | Academies / Future |
| `/academies`, `/academies/[slug]` | Academies |
| `/calendar` | Smart Calendar |
| `/forms`, `/forms/[id]` | Forms |
| `/labs`, `/simulators` | Academy Engine |
| `/portfolio` | Portfolio |
| `/events` | Events |
| `/service-desk`, `/service-desk/users` | Service Center |
| `/impact-fund` | Impact Fund |
| `/knowledge` | Knowledge / School Hub (future) |
| `/parent` | Parent Portal |
| `/admin/*` | Administration |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth |

Full route catalog: `docs/enterprise-blueprint/APPENDIX_B_ROUTE_CATALOG.md`

---

## Appendix B — Deep-dive references

| Topic | Document |
|-------|----------|
| Module details (all 27) | `enterprise-blueprint/01_PLATFORM_MODULES.md` |
| Information architecture | `enterprise-blueprint/03_INFORMATION_ARCHITECTURE.md` |
| RBAC matrix | `enterprise-blueprint/06_RBAC_PERMISSIONS.md` |
| Student journey fields | `enterprise-blueprint/08_STUDENT_JOURNEY.md` |
| Event engine | `enterprise-blueprint/09_EVENT_ENGINE.md` |
| Organization workspaces | `enterprise-blueprint/09_ORGANIZATION_WORKSPACES.md` |
| Roadmap phases | `enterprise-blueprint/05_ROADMAP.md` |
| Gap analysis | `enterprise-blueprint/02_GAP_ANALYSIS.md` |

---

*Madonna High School · Blue Don Virtual Campus*  
*Choose Your Path. Build Your Future.*
