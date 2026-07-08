# The Blue Don User Experience Flow

**Document 4 of 5 — Foundational Documents**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Product owners, designers, faculty, advisors, developers, and school leadership  

**Companion documents:** [Constitution](./BLUE_DON_CONSTITUTION.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

The Product Blueprint defines **what** Blue Don does. The Technical Architecture defines **how** it is built. This document defines **how people move through it**.

Blue Don is not a collection of modules. It is a **journey** — from a student's first login in 7th grade through graduation, alumni life, and beyond. Every screen, tap, and notification should reinforce one idea:

> **Everything starts at the Dashboard. Nothing important should require more than 2–3 taps.**

Students do not chase grades. They chase **involvement**. Teachers do not post the same event five times. They create **once** and Blue Don distributes everywhere. Organizations do not clutter the sidebar — they live in **My Organizations**, each following the same template so students always know where to look.

This document is the canonical reference for **flows, navigation depth, and lifecycle transitions**. When designing a feature, ask: *Where does the user enter? How many taps to value? What updates automatically when they finish?*

---

## Part I — Design Rules

These rules govern every flow in this document. They extend Constitution Article VII (User Experience Principles).

| # | Rule | Meaning |
|---|------|---------|
| **R1** | **Dashboard is home base** | Login always lands on Today's Dashboard. Deep work happens elsewhere; return is one tap. |
| **R2** | **2–3 tap maximum** | Any daily task (see class, RSVP event, check assignment, open club) ≤ 3 taps from Dashboard. |
| **R3** | **My Journey is the longitudinal home** | The profile that grows from 7th grade to graduation lives in one place — not scattered across modules. |
| **R4** | **Organizations are workspaces, not nav items** | Clubs, teams, and classes appear in My Organizations — not as 40 sidebar links. |
| **R5** | **One template for every org** | Every club, class, and team uses the same tab structure. Learn once, use everywhere. |
| **R6** | **Create once, publish everywhere** | Events, announcements, and achievements fan out to calendars, dashboards, org pages, and feed automatically. |
| **R7** | **Involvement over grades** | XP, coins, badges, and journey updates reward participation — not just GPA. |
| **R8** | **Positive community only** | Feed surfaces school culture. No negativity, no drama. Moderation is built in. |
| **R9** | **Nothing is lost at graduation** | Portfolio, service hours, certifications, and journey timeline become the Graduate Profile and Alumni record. |
| **R10** | **School-agnostic architecture** | Madonna is tenant #1. The flows below work for any school on the Blue Don platform. |

---

## Part II — Daily Entry Flow

Every authenticated session begins the same way.

```
┌─────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   Login     │ ──► │  Good Morning, Lisa 👋 │ ──► │  Today's Dashboard  │
│  /login     │     │  (personalized greet)  │     │  /dashboard         │
└─────────────┘     └──────────────────────┘     └──────────┬──────────┘
                                                              │
                                                              ▼
                                                   Choose what you want
                                                   to do today.
```

### Step 1 — Login

| Path | Flow |
|------|------|
| Email + password | `/login` → authenticate → Dashboard |
| Google SSO | OAuth → `/auth/callback` → onboarding (if new) → Dashboard |
| Password recovery | `/forgot-password` → email → `/reset-password` → Dashboard |
| Admin-created account | Service Desk creates user → first login → onboarding → Dashboard |

**Tap count:** 1 (credentials) + 1 (submit) = **2 taps to Dashboard**.

### Step 2 — Personalized greeting

The Dashboard header greets the student by first name and time of day:

- *Good morning, Lisa* (before noon)  
- *Good afternoon, Lisa* (noon–5 PM)  
- *Good evening, Lisa* (after 5 PM)

The greeting is not decorative. It signals: **this is your campus, today**.

### Step 3 — Today's Dashboard

The Dashboard answers one question: *What should I do today?*

It is not an admin console. It is not a link farm. It is a **curated snapshot** of the student's day and next actions.

**Status:** Partial — `/dashboard` with role-based widgets exists. Personalized greeting and full widget set are Phase 17+ targets.

---

## Part III — The Dashboard (Blue Don OS)

> **Canonical spec:** [Digital Campus Part II](./BLUE_DON_DIGITAL_CAMPUS.md) — Blue Don OS live campus feed.

The Dashboard evolves from a widget grid into **Blue Don OS** — a live campus students enter, not an app they open. One scrollable screen: greeting, principal's message, schedule, buzzing campus, volunteer opportunities, events, assignments, daily mission, journey progress.

**Everything important is on one screen.** Every card deep-links to its owning module in ≤ 2 taps.

### Dashboard widgets (student) — legacy widget grid

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Good Morning, Lisa 👋

  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │ Today's Classes │  │ Assignments Due │  │    Calendar     │
  └─────────────────┘  └─────────────────┘  └─────────────────┘

  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
  │ Today's Events  │  │ My Organizations│  │   My Journey    │
  └─────────────────┘  └─────────────────┘  └─────────────────┘

  ┌─────────────────┐  ┌─────────────────┐
  │ Future Center   │  │  Blue Don Shop  │
  └─────────────────┘  └─────────────────┘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Dashboard widgets (student)

| Widget | Purpose | Tap to value | Source |
|--------|---------|--------------|--------|
| **Today's Classes** | Period schedule, room, teacher | 1 tap → class org or Classroom link | FACTS + Google Classroom |
| **Assignments Due** | Next 3–5 due items | 1 tap → assignment detail | Google Classroom sync |
| **Calendar** | Today's agenda | 1 tap → Smart Calendar | Event Hub + Google Calendar |
| **Today's Events** | RSVPs, check-in prompts | 1 tap → event detail / check-in | Event Hub |
| **My Organizations** | Clubs, teams, class pages (membership only) | 1 tap → org dashboard | Organization workspaces |
| **My Journey** | Progress snapshot, next milestone | 1 tap → My Journey | Student Journey module |
| **Future Center** | Career quiz CTA, recommendations | 1 tap → Future Center | Future Center + AI |
| **Blue Don Shop** | Spend coins, view rewards | 1 tap → Blue Don Corner | Rewards System |

### Quick actions (secondary row)

Role-specific shortcuts below widgets — e.g., *Submit form*, *Open Service Desk*, *View leaderboard*. Maximum **4** visible; remainder in "More."

### Tap discipline

| Task | Path | Taps |
|------|------|------|
| See today's schedule | Dashboard → Today's Classes | 1 |
| RSVP to event | Dashboard → Today's Events → RSVP | 2 |
| Open IT Club | Dashboard → My Organizations → IT Club | 2 |
| Check journey progress | Dashboard → My Journey | 1 |
| Take career quiz | Dashboard → Future Center → Quiz | 2 |

**Nothing else should require more than 2–3 taps** for daily student tasks (Rule R2).

### Dashboard by persona

| Persona | Landing emphasis |
|---------|------------------|
| **Student** | Classes, assignments, events, orgs, journey |
| **Teacher** | Today's classes, pending approvals, events to publish |
| **Parent** | Children summary, forms due, upcoming events |
| **Advisor** | Advisee flags, form approvals, journey check-ins |
| **Admin** | Operations snapshot, compliance, integration health |
| **Alumni** | Mentor requests, reunions, network (see Part XI) |

**Status:** Widget framework and persona layouts exist (`dashboard-layouts.ts`). Full widget data wiring is phased.

---

## Part IV — My Journey

> **This becomes the student's "home."**

> **Canonical spec:** [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) — timeline, achievements, Year in Review, time capsule, legacy.

My Journey is the **longitudinal identity** of a student — scrollable by year from first day through graduation.

```
My Journey (/my-journey)
│
├── About Me
├── My Story
├── My Goals
├── My Interests
├── My Strengths
├── Reflection Journal
├── Resume
├── Portfolio
├── Achievements
├── Badges
├── XP
├── Coins
├── Service Hours
├── Leadership
├── Certifications
├── Career Plan
├── Graduation Progress
└── Digital Passport
```

> **Full section definitions:** [Digital Campus Part III](./BLUE_DON_DIGITAL_CAMPUS.md)

### Lifecycle by grade

| Grade | Journey focus |
|-------|---------------|
| **7** | About Me v1, club exploration, first reflections |
| **8–9** | Strengths assessment, academy interest, portfolio start |
| **10–11** | Career interests, Future Center linkage, semester check-ins |
| **12** | Resume polish, graduation checklist, scholarship prep |
| **Alumni** | Profile refresh, mentor opt-in, career updates |

### Data flows into Journey

| Source | Updates Journey |
|--------|-----------------|
| Event attendance | Service hours, involvement timeline |
| Academy certification | Skills, portfolio evidence |
| Future Center quiz | Career interests, recommended pathways |
| XP / badges | Growth milestones, Blue Don Tree |
| Forms signed | Compliance milestones |
| Teacher endorsement | Portfolio items, leadership evidence |

### Navigation placement

My Journey lives in **utility navigation** (header / profile menu) — always reachable in 1 tap from any page. It is also a **Dashboard widget** for snapshot access.

**Status:** Planned — `/my-journey` route and `StudentProfile` schema are blueprint targets (Module 21).

---

## Part V — My Organizations

> **Instead of cluttering the sidebar.**

Students belong to many groups. The sidebar cannot list them all. **My Organizations** is a membership-filtered hub:

```
My Organizations
│
├── IT Club
├── Broadcasting
├── Football
├── Class of 2029
└── National Honor Society
```

**Only organizations the student belongs to appear.** No browsing 200 clubs in navigation.

### Entry points

| From | Taps |
|------|------|
| Dashboard widget | 1 → org list → 2 → org home |
| Student Life nav (Phase 17) | 1 → org list → 2 → org home |
| Search (future) | 1 → type → 2 → org home |

### Organization types (same template)

| Type | Examples |
|------|----------|
| **Club** | IT Club, NHS, Drama |
| **Class** | Class of 2029, Mrs. Smith's Algebra |
| **Team** | Football, Volleyball, Robotics |
| **Academy** | Broadcast Academy, IT Academy |
| **Department** | Campus Ministry, Fine Arts |

All types share the **Organization Workspace Template** (Part VI).

**Status:** `Organization` and `OrganizationMembership` models exist (Phase 16). Org workspace UI is Phase 16.2+ / 17.

---

## Part VI — Organization Workspace Template

> **Every club follows the same template. Students instantly know where everything is.**

```
┌─────────────────────────────────────────────────────────────────┐
│  IT Club                                          [Join] [⚙]   │
├─────────────────────────────────────────────────────────────────┤
│  Home │ Announcements │ Calendar │ Projects │ Members │ ...    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    (tab content area)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Standard tabs

| Tab | Purpose | Who can edit |
|-----|---------|--------------|
| **Home** | Welcome, stats, quick links, officer spotlight | Lead, officers |
| **Announcements** | Org news and updates | Lead, officers, moderators |
| **Calendar** | Org events (feeds Event Hub) | Lead, officers |
| **Projects** | Ongoing work, capstones, season goals | Members (permissioned) |
| **Members** | Roster, join requests, roles | Lead, officers |
| **Leadership** | Officer roster, elections, terms | Lead |
| **Photos** | Recent media highlights | Members (upload permissioned) |
| **Gallery** | Full photo/video archive | Moderators |
| **Fundraisers** | Active campaigns, Impact Fund links | Lead, officers |
| **Store** | Merch, tickets, spirit wear (optional) | Lead (if enabled) |
| **Documents** | Bylaws, permission slips, forms | Lead, officers |
| **Resources** | Links, files, how-to guides | Lead, officers |

### Why one template matters

A student who knows Broadcasting Club's layout **already knows** Football's layout. Faculty advisors onboard faster. Developers build **one org shell** with configurable tabs — not 40 custom pages.

### Tab visibility

Not every org needs every tab. Configuration:

- **Required:** Home, Announcements, Calendar, Members  
- **Optional (enable per org):** Projects, Fundraisers, Store, Gallery  
- **Permission-gated:** Leadership, Documents (officers+)

**Status:** Template defined in Product Blueprint § Organization workspace. UI shell is Phase 16.2+.

---

## Part VII — Event Flow

> **This is where Blue Don becomes powerful.**

A teacher creates **one event**. Blue Don handles the rest.

```
Create Event
     │
     ▼
Choose Audience          (school-wide · academy · org · grade · invite-only)
     │
     ▼
Publish
     │
     ▼
┌────────────────────────────────────────────────────────────────┐
│  Blue Don automatically:                                       │
│  ✔ Adds to calendars (campus + Google Calendar)               │
│  ✔ Sends notifications (email, push, dashboard)               │
│  ✔ Updates dashboards (Today's Events widget)                 │
│  ✔ Updates organization pages (org Calendar tab)              │
│  ✔ Awards XP after attendance (post check-in + approval)      │
│  ✔ Updates service hours (if service event)                   │
│  ✔ Adds photos afterward (Media Center → org Gallery)         │
│  ✔ Schedules reminder broadcasts (Blue Don Broadcasts)        │
│  ✔ Archives event (no hard delete; governance record)         │
└────────────────────────────────────────────────────────────────┘
```

**Nobody has to post the same event five times.**

### Event lifecycle

| Stage | Actor | Action |
|-------|-------|--------|
| **Draft** | Creator | Title, time, location, audience, description |
| **Review** | Advisor/Admin (if required) | Approve or return |
| **Scheduled** | System | Appears on creator's calendar |
| **Published** | System | Fan-out to all surfaces (see below) |
| **In progress** | Attendees | Check-in (QR or manual) |
| **Completed** | Advisor | Approve attendance → trigger rewards |
| **Archived** | System | Read-only; photos attached; XP logged |

### Publish surfaces (`EventPublication`)

| Surface | Audience sees |
|---------|---------------|
| Smart Calendar | All targeted users |
| Dashboard widget | Today's Events |
| Organization page | Org Calendar tab |
| School Hub | School-wide events board |
| Community Feed | Event recap post (after completion) |
| Google Calendar | Subscribed calendars |
| Notifications | Email + push (configurable) |

### Student event experience

```
Dashboard → Today's Events → Event detail → RSVP
                                          → Check in (day-of)
                                          → View photos (after)
```

**Tap count:** 2–3 for full cycle.

**Status:** Phase 4 event CRUD exists. Multi-surface publish, check-in, XP hook, and auto-archive are Event Hub targets (Phase 17+).

---

## Part VII-B — Blue Don Broadcasts Flow

> **Official campus communications — every message has an audience.**

> **Canonical spec:** [BLUE_DON_BROADCASTS.md](./BLUE_DON_BROADCASTS.md)

```
Student leader drafts broadcast
        │
        ▼
AI formats + suggests audience (optional)
        │
        ▼
Submit for approval (if school-wide or policy-required)
        │
        ├── Rejected → revise
        └── Approved
                │
                ▼
        Published → Campus Ticker + Home OS + Hub + Feed + Push
```

### Key rules

| Rule | Detail |
|------|--------|
| Not "announcements" | **Blue Don Broadcasts** — branded, domain-labeled |
| Position-based | Senior President broadcasts to seniors — not all seniors |
| No approval → no publish | School-wide student broadcasts require advisor sign-off |
| Four priorities | 🟢 Info · 🟡 Reminder · 🟠 Important · 🔴 Critical (staff only) |
| Event reminders | Scheduled as broadcasts — not separate emails |

**Status:** Planned — Modules 28–29.

---

## Part VII-C — Blue Don ID Flow

> **One code. One identity.**

> **Canonical spec:** [BLUE_DON_ID.md](./BLUE_DON_ID.md)

```
Student opens Blue Don Pass (/id)
        │
        ▼
Presents QR at scanner (event, class, service, store, gate)
        │
        ▼
Action recorded → Journey + Passport + Rewards updated
```

| Surface | Tap from Home |
|---------|---------------|
| Blue Don Pass | 1 (header / wallet) |
| Event check-in | 2 (pass → scan) |
| Hall pass | Teacher issues → student shows pass |

**Status:** Planned — Module 30. Builds after core campus modules.

---

## Part VIII — XP & Rewards Flow

> **Students don't chase grades. They chase involvement.**

```
Attend Event
     │
     ▼
Check In                    (QR scan or advisor manual)
     │
     ▼
Attend                      (participation recorded)
     │
     ▼
Advisor Approves            (optional for high-value XP)
     │
     ▼
Receive (automatic):
  ├── XP                      → Leaderboard, Blue Don Tree growth
  ├── Coins                   → Blue Don Shop spending
  ├── Badge                   → Profile + Journey milestone
  ├── Portfolio Update        → Evidence item (if applicable)
  └── Journey Update          → Timeline entry, service hours
```

### XP sources

| Activity | XP | Coins | Badge |
|----------|-----|-------|-------|
| Event attendance | ✔ | ✔ | Sometimes |
| Academy module complete | ✔ | ✔ | Tier badges |
| Certification earned | ✔ | ✔ | Certification badge |
| Service hours verified | ✔ | ✔ | Service milestones |
| Form signed on time | ✔ | — | Compliance streak |
| Teacher grant (bonus) | ✔ | ✔ | Custom |
| Acts of kindness (feed) | ✔ | ✔ | Kindness badge |

### Anti-gaming rules

- XP requires **verified activity** (check-in, teacher approval, system event).  
- Duplicate attendance same day → no double XP.  
- Teacher grants are **audited** and capped per term.  
- Leaderboards are **academy-scoped** or **school-scoped** — never public humiliation.

### Blue Don Tree

Visual metaphor for cumulative growth. XP feeds tree stage (seedling → sapling → oak). Displayed on Dashboard and My Journey.

**Status:** `LeaderboardEntry` exists. Full XP ledger, coins, badges, and shop are Rewards System targets (Phase 18+).

---

## Part IX — Future Center Flow

> **Every recommendation leads to another opportunity.**

```
Take Career Quiz
     │
     ▼
AI learns interests          (scoped to student profile; FERPA-safe)
     │
     ▼
Suggests Careers
     │
     ├──► Suggests Academies        → Academy enrollment flow
     ├──► Suggests Clubs            → My Organizations / join
     ├──► Suggests Certifications   → Academy Engine modules
     ├──► Suggests Colleges         → Application resources
     ├──► Suggests Trades           → Trade school pathways
     ├──► Suggests Scholarships     → Scholarship board
     └──► Suggests Internships      → Partner / alumni network
```

### Recommendation principles

| # | Principle |
|---|-----------|
| FC1 | Recommendations are **actionable** — every card has a next step (join, apply, explore). |
| FC2 | AI explains **why** — "Based on your interest in video production…" |
| FC3 | Students can **dismiss** or **save** recommendations; dismissals are not punitive. |
| FC4 | Parents see **scoped summary** for linked students — not full quiz responses. |
| FC5 | Counselors see **referral flags** — not AI therapy (Constitution Article X). |

### Journey integration

Quiz results write to **Career Interests** in My Journey. Academy and club suggestions appear on Dashboard. Scholarship matches surface in Graduation Progress (Grade 12).

**Status:** Partial — `/pathways` and academy engine exist. Full Future Center with AI recommendations is Phase 17+.

---

## Part X — Community Feed

> **Everything good happening at Madonna.**

```
Blue Don Corner → Community Feed
│
├── Acts of Kindness
├── Achievements
├── Sports
├── Broadcasting
├── Club News
├── Fundraisers
├── Service
├── Teacher Spotlight
└── Student Spotlight
```

### Feed principles

| # | Principle |
|---|-----------|
| CF1 | **Positive-first** — achievements, service, culture. No negativity. |
| CF2 | **No drama** — no comment wars; reactions only (like, celebrate, support). |
| CF3 | **Moderated** — teachers/officers can post; students submit for approval (configurable). |
| CF4 | **Auto-populated** — event completions, certifications, and game wins can auto-post (opt-in). |
| CF5 | **Kindness rewards** — Acts of Kindness posts can trigger XP (Rule R7). |

### Feed entry

| From | Taps |
|------|------|
| Dashboard quick link | 2 |
| Blue Don Corner nav | 1 |
| Post-event auto-notification | 1 (deep link) |

**Status:** Planned — Community Feed module (Blueprint Module 16).

---

## Part XI — Graduation Flow

> **The student doesn't just graduate. They unlock everything they've built.**

```
Graduation Trigger          (senior completes checklist · admin confers)
     │
     ▼
Graduate Profile
     │
     ├── Digital Passport       ← Verified record of Madonna journey
     ├── Resume                 ← Auto-generated from Journey
     ├── Portfolio              ← All published evidence
     ├── Scholarships           ← Awards and applications
     ├── Service Hours          ← Verified total
     ├── Certifications         ← Academy credentials
     ├── Leadership             ← Offices held, roles served
     └── Journey Timeline       ← 7th grade → commencement story
```

**Nothing is lost.**

### Graduation Readiness (Grade 12)

Senior Dashboard widget and `/graduation` route show:

- Checklist items (forms, fees, cap/gown, service hours minimum)  
- Scholarship application status  
- Final portfolio review  
- Commencement event details  

### Digital Passport

Exportable, shareable credential — PDF + optional verified link. Contains non-sensitive summary suitable for colleges and employers. Full records remain in Blue Don for the student.

**Powered by:** [Blue Don ID](./BLUE_DON_ID.md) — Student Passport stamps + Digital Backpack export.

**Status:** Planned — Graduation Readiness (Module 23), Graduate Profile schema TBD.

---

## Part XII — Alumni Flow

> **Blue Don never ends.**

When a student graduates, their role transitions to **alumni**. Navigation and Dashboard change — but their Journey record persists.

```
Role: ALUMNI
     │
     ▼
Navigation changes:
  ├── Mentor Students         → Matched with current students
  ├── Volunteer               → Campus and org opportunities
  ├── Donate                  → Giving campaigns
  ├── Career Updates          → Keep profile current for network
  ├── Reunions                → Class cohort events
  ├── Guest Speaker           → Offer expertise to academies
  ├── Hire Students           → Job/internship postings
  └── Networking              → Alumni directory (opt-in)
```

### Alumni Dashboard

Replaces student widgets with alumni-relevant surfaces:

| Widget | Purpose |
|--------|---------|
| Mentor matches | Students seeking guidance in your field |
| Upcoming reunions | Class of 20XX events |
| Give back | Active campaigns |
| Network | Suggested connections |
| Your legacy | Journey timeline (read-only) |

### Transition rules

| Rule | Detail |
|------|--------|
| AL1 | Alumni retain **read access** to their Journey, Portfolio, and certifications. |
| AL2 | Alumni **lose** student-only surfaces (assignments, class schedule). |
| AL3 | Alumni **opt in** to directory, mentorship, and networking — never auto-exposed. |
| AL4 | Class org (e.g., Class of 2029) **persists** as alumni cohort workspace. |

**Status:** Planned — Alumni Portal (Module 25), alumni role in RBAC exists.

---

## Part XIII — Platform Vision (Multi-School)

> **Right now it's branded for Madonna, but the architecture should be school-agnostic.**

```
Blue Don Platform
│
├── Madonna High School          ← Tenant 1 (current)
├── St. Paul School              ← Future tenant
├── Weir Middle School           ← Future tenant
├── Catholic Diocese Schools     ← Future org / diocese layer
└── Future Schools
```

### Per-school isolation

| Layer | Scoped per school |
|-------|-------------------|
| **Branding** | Logo, colors, mascot, domain |
| **Users** | Students, staff, parents — no cross-tenant leakage |
| **Organizations** | Clubs, teams, classes |
| **Calendars** | Events, schedules |
| **Dashboards** | Widgets, quick actions |
| **Content** | Feed, media, knowledge articles |
| **Integrations** | FACTS, Google Workspace per school credentials |

### Shared platform core

| Layer | Shared across tenants |
|-------|----------------------|
| **Application code** | Next.js, services, flows (this document) |
| **UX templates** | Dashboard, org workspace, journey structure |
| **Academy Engine** | Learning modules (school enables subsets) |
| **Rewards logic** | XP rules, badge definitions (school configures) |
| **AI guardrails** | Constitution Articles X–XI |

### Tenant model (technical)

```
Platform
  └── School (tenant)
        ├── brandConfig
        ├── users
        ├── organizations
        ├── events
        ├── integrations
        └── featureFlags
```

**Status:** Single-tenant (Madonna) today. `School` model exists in Prisma. Multi-tenant routing and branding are post-MVP architecture (see Technical Architecture Part XII).

---

## Part XIV — Flow Summary Map

```
                              ┌──────────────┐
                              │    Login     │
                              └──────┬───────┘
                                     │
                              ┌──────▼───────┐
                         ┌────│  Dashboard   │────┐
                         │    └──────────────┘    │
                    ┌────▼────┐            ┌─────▼─────┐
                    │My Journey│            │My Orgs   │
                    └────┬────┘            └─────┬─────┘
                         │                       │
                    ┌────▼────┐            ┌─────▼─────┐
                    │ Portfolio│            │Org Template│
                    │ Resume   │            │(all clubs) │
                    │ Service  │            └─────┬─────┘
                    └────┬────┘                      │
                         │                    ┌─────▼─────┐
                    ┌────▼────┐               │  Events   │──► XP / Journey
                    │Future   │               └───────────┘
                    │Center   │                      │
                    └────┬────┘               ┌─────▼─────┐
                         │                    │Community  │
                    ┌────▼────┐               │Feed       │
                    │Graduate │               └───────────┘
                    │Profile  │
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │ Alumni  │
                    └─────────┘
```

---

## Part XV — Implementation Status

| Flow | Route / module | Status |
|------|----------------|--------|
| Login → Dashboard | `/login` → `/dashboard` | **Built** |
| Personalized greeting | Dashboard header | Planned |
| Dashboard widgets | `/dashboard` | **Partial** |
| My Journey | `/my-journey` | Planned |
| My Organizations | Org list + workspace | **Partial** (schema built) |
| Org template tabs | `/orgs/[slug]/*` | Planned |
| Event create → publish | `/events` | **Partial** (CRUD, no fan-out) |
| Event check-in → XP | Event Hub + Rewards | Planned |
| Future Center quiz → recommend | `/future` | Planned |
| Community Feed | Blue Don Corner tab | Planned |
| Graduation → Graduate Profile | `/graduation` | Planned |
| Alumni transition | `/alumni` | Planned |
| Multi-tenant | `School` model | **Partial** (schema only) |

---

## Part XVI — Design Checklist (Before Building a Flow)

Before implementing any user-facing flow, confirm:

1. **Entry point** — Where does the user start? (Usually Dashboard.)  
2. **Tap count** — Is daily use ≤ 3 taps? (Rule R2.)  
3. **Exit / return** — Can they get back to Dashboard in 1 tap?  
4. **Auto-updates** — What else updates when they complete the action? (Rule R6.)  
5. **Journey hook** — Does this write to My Journey? (Rule R3.)  
6. **Org placement** — Does this belong in an org workspace, not global nav? (Rule R4.)  
7. **Role variants** — Do teacher/parent/alumni see a different surface?  
8. **Constitution** — Privacy, AI, and kindness rules satisfied?  
9. **Blueprint module** — Which module owns this? (A1 placement.)  
10. **Architecture** — Schema, permissions, and integrations defined? (A2–A3.)

---

## Appendix — Related Documents

| Topic | Document |
|-------|----------|
| Why we build | `BLUE_DON_CONSTITUTION.md` — Articles VI–VII |
| Module inventory | `BLUE_DON_PRODUCT_BLUEPRINT.md` — Parts III–IV |
| Event Hub technical | `enterprise-blueprint/` Event module |
| Org workspaces | `BLUE_DON_PRODUCT_BLUEPRINT.md` § Organization template |
| RBAC per flow | `BLUE_DON_TECHNICAL_ARCHITECTURE.md` Part V |
| Navigation migration | `BLUE_DON_PRODUCT_BLUEPRINT.md` § Enterprise target navigation |

---

*Madonna High School · Blue Don Virtual Campus*  
*Choose Your Path. Build Your Future.*
