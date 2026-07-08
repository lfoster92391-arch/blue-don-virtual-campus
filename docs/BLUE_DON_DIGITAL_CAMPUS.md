# Blue Don Digital Campus

**Document 5 of 5 — Foundational Documents**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for information architecture and Phase 17+ delivery  
**Audience:** Product owners, designers, faculty, school leadership, developers  

**Companion documents:** [Constitution](./BLUE_DON_CONSTITUTION.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Broadcasts](./BLUE_DON_BROADCASTS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Platform Identity

Blue Don is **not** a school app. It is the **digital twin of Madonna High School** — a living campus students enter every day.

| Positioning | Statement |
|-------------|-----------|
| **Primary** | **Blue Don — The Digital Campus Experience** |
| **Tagline** | **Where Every Student's Journey Begins** |
| **Mission echo** | *Choose Your Path. Build Your Future.* |

Blue Don is where students discover interests, join communities, build skills, prepare for careers, celebrate achievements, and document their entire journey from **7th grade through graduation and into alumni life**.

---

## Part I — Primary Navigation

Fourteen top-level destinations. This is the canonical campus map.

```
Blue Don Digital Campus
│
├── 🏠 Home                    ← Blue Don OS (live campus)
├── 👤 My Journey              ← Student personal operating system
├── 🏫 School Hub              ← Everything school-related
├── 👥 Student Life            ← Orgs, clubs, class pages
├── 💙 Campus Life             ← Culture, traditions, today at Madonna
├── 🎓 Academies               ← Madonna Education Network
├── 🏅 Athletics               ← Teams, scores, livestreams
├── ❤️ Service Center          ← Volunteer, hours, awards
├── 🎯 Future Center           ← Career, college, trades, scholarships
├── ✨ Opportunities           ← Discover, What If?, bucket list, Connect
├── 🌅 Discover                  ← Daily Discovery, Today I Learned
├── 🧭 Guidance Center         ← Counseling, planning, transcripts
├── 🛍 Blue Don Corner         ← Spirit wear, stores, marketplace
├── 📰 Community               ← Madonna's heartbeat
├── 📸 Media Center            ← Photos, video, yearbook
├── 🏆 Rewards                 ← XP, coins, badges, shop, arcade streaks
├── 🎮 Arcade                  ← Play. Learn. Earn. — brain games, Campus Quest
├── 🤖 Blue Don AI             ← Scoped campus assistant
├── 📣 Broadcasts              ← Blue Don Broadcasts (official comms)
├── 🎖 Leadership Center       ← Student leadership + comm permissions
├── 🪪 Blue Don ID             ← Wallet pass, QR identity
└── ⚙ Administration           ← Operations (staff only)
```

### Navigation rules

| Rule | Detail |
|------|--------|
| **N1** | Primary nav has **exactly 14** student-facing destinations (+ Administration for staff). |
| **N2** | Depth lives **inside** destinations — not in the sidebar. |
| **N3** | `src/config/navigation.ts` is the single source of truth when implemented. |
| **N4** | Mobile bottom nav shows **5** favorites; remainder in "More." |
| **N5** | My Journey is **primary nav** — not buried in profile menu. |

### Route map (proposed)

| Nav item | Route | Module(s) |
|----------|-------|-----------|
| Home | `/` or `/home` | Blue Don OS, Dashboard |
| My Journey | `/my-journey` | Modules 2, 11, 21, 23 |
| School Hub | `/hub` | Module 4 |
| Student Life | `/student-life` | Modules 5, 6, org workspaces |
| Campus Life | `/campus-life` | Module 34 — traditions, spirit, live, today |
| Academies | `/academies` | Module 7 |
| Athletics | `/athletics` | Module 8 |
| Service Center | `/service` | Module 9 |
| Future Center | `/future` | Module 10 |
| Opportunities | `/opportunities` | Module 35 |
| Discover | `/discover` | Module 37 — Daily Discovery, TIL |
| Blue Don Corner | `/corner` | Module 13 |
| Community | `/community` | Module 16 |
| Media Center | `/media` | Module 17 |
| Rewards | `/rewards` | Module 14 |
| Arcade | `/arcade` | Module 39 — Play. Learn. Earn. |
| Blue Don AI | `/ai` | Module 12 |
| Administration | `/admin` | Module 26 |

**Migration note:** Current Phase 16 nav (12 engineering modules) migrates to this structure in Phase 17. See Product Blueprint § Enterprise target navigation.

---

## Part II — 🏠 Home (Blue Don OS)

> **Students feel like they're entering a digital campus — not opening an app.**

The homepage is not a widget grid. It is a **live campus feed** — one scrollable screen where everything important appears in context, ordered by relevance and time.

### Blue Don OS layout

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Good Morning, Lisa 👋
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📢 Principal's Message
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📅 Today's Schedule
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 Campus Is Buzzing — 14 Events Today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ❤️ New Volunteer Opportunity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎤 Guest Speaker — Today's Auditorium
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🏈 Football Tonight
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  💻 IT Club Meeting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📚 2 Assignments Due
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎯 Daily Mission
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ⭐ Your Journey — 81% Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### OS card types

| Card | Source | Tap action |
|------|--------|------------|
| Greeting | User profile + time | — |
| Principal's Message | Blue Don Broadcasts (school) | School Hub / broadcast detail |
| Today's Schedule | FACTS + Classroom | Class detail |
| Campus Buzzing | Event Hub aggregate | Events list |
| Volunteer Opportunity | Service Center | Sign up |
| Guest Speaker | Event Hub | Event detail |
| Game / match | Athletics | Team page |
| Club meeting | Student Life org | Org workspace |
| Assignments due | Google Classroom | Assignment |
| Daily Mission | Rewards | Mission detail |
| Journey progress | My Journey | Journey home |

### OS principles

| # | Principle |
|---|-----------|
| OS1 | **One screen** — daily priorities without hunting. |
| OS2 | **Live, not static** — cards appear/disappear based on time, role, and relevance. |
| OS3 | **Tap through** — every card deep-links to its owning module (≤ 2 taps). |
| OS4 | **Calm urgency** — deadlines visible; no manufactured anxiety. |
| OS5 | **Role-aware** — teachers see approvals; parents see children; alumni see network. |

**Status:** Planned — replaces `/dashboard` widget grid in Phase 17.

---

## Part III — 👤 My Madonna Journey

> **Every moment. Every memory. Every milestone.**

> **Canonical spec:** [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md)

The student's personal operating system — scrollable timeline by school year.

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

| Section | Purpose | Feeds from |
|---------|---------|------------|
| **About Me** | Current identity snapshot | Onboarding, profile edits |
| **My Story** | Narrative bio (evolves yearly) | Student-authored |
| **My Goals** | Short- and long-term targets | Journey check-ins |
| **My Interests** | Hobbies, passions | Future Center quiz |
| **My Strengths** | Skills and talents | Assessments, teacher input |
| **Reflection Journal** | Semester reflections | Scheduled prompts |
| **Resume** | Auto-built professional summary | Portfolio, leadership, certs |
| **Portfolio** | Evidence of work | Portfolio module |
| **Achievements** | Milestones and honors | Events, academies, athletics |
| **Badges** | Earned recognition | Rewards System |
| **XP** | Experience points total | Rewards System |
| **Coins** | Spendable currency | Rewards System |
| **Service Hours** | Verified volunteer log | Service Center |
| **Leadership** | Offices held, roles served | Orgs, Student Council |
| **Certifications** | Academy credentials | Academy Engine |
| **Career Plan** | Future Center output | Career quiz, AI |
| **Graduation Progress** | Senior checklist | Forms, service, portfolio |
| **Digital Passport** | Exportable journey record | All of the above |

**Status:** Planned — Module 21; `StudentProfile` schema TBD.

---

## Part IV — 🏫 School Hub

> **Everything school-related.**

```
School Hub (/hub)
│
├── Announcements
├── Calendar
├── Lunch
├── Bell Schedule
├── Faculty Directory
├── Campus Map
├── Morning Announcements
├── Emergency Alerts
├── Forms
├── School News
├── Handbook
└── Resource Center
```

| Section | Owner | Notes |
|---------|-------|-------|
| Announcements | Admin, principal | Priority pin for urgent items; powered by **Blue Don Broadcasts** |
| Calendar | Event Hub | School-wide filter |
| Lunch | Admin / cafeteria | Daily menu |
| Bell Schedule | Admin | Period times, early dismissal |
| Faculty Directory | Admin | Role, department, contact (policy-gated) |
| Campus Map | Admin | Interactive or PDF |
| Morning Announcements | Broadcast Academy | Video/audio daily show |
| Emergency Alerts | Admin | Push + banner; **Critical** broadcasts only — see [Broadcasts](./BLUE_DON_BROADCASTS.md) |
| Forms | Forms module | Published forms catalog |
| School News | Admin / communications | Long-form articles |
| Handbook | Admin | Policies, code of conduct |
| Resource Center | Admin | Links, PDFs, how-to guides |

**Absorbs:** Knowledge Vault school articles, published forms catalog.  
**Status:** Planned — Module 4.

---

## Part V — 👥 Student Life

> **Clubs, classes, and campus culture.**

```
Student Life (/student-life)
│
├── My Organizations
│   ├── Clubs
│   ├── Class Pages
│   ├── Student Council
│   └── National Honor Society
├── Events
├── Competitions
├── Volunteer Opportunities
├── Leadership
└── Campus Feed
```

### My Organizations

Only organizations the student **belongs to** appear. Each org uses the **standard workspace template** (see UX Flow Part VI):

Home · Announcements · Calendar · Projects · Members · Leadership · Photos · Gallery · Fundraisers · Store · Documents · Resources

### Student Life surfaces

| Section | Purpose |
|---------|---------|
| **Events** | Cross-org event discovery and RSVP |
| **Competitions** | Academic, arts, STEM competitions |
| **Volunteer Opportunities** | Gateway to Service Center |
| **Leadership** | Officer roles, elections, applications |
| **Campus Feed** | Shortcut to Community (positive culture) |

**Status:** Partial — `Organization` model (Phase 16). Workspace UI Phase 17+.

---

## Part VI — 🎓 Academies

> **Madonna Education Network — career pathways from exploration to industry capstone.**

```
Academies (/academies)
│
├── IT Academy
├── Broadcasting Academy
├── Circuit Academy
├── Business Academy
├── Engineering Academy
├── Robotics
├── Photography
├── Graphic Design
├── Cybersecurity
└── Future Academies
```

### Inside every academy

```
Academy Workspace (/academies/[slug])
│
├── Lessons
├── Labs
├── Simulations
├── Projects
├── Practice Tests
├── Certifications
├── Resources
├── Portfolio
└── AI Tutor
```

| Section | Maps to |
|---------|---------|
| Lessons | `LearningModule`, `Lesson`, `Video` |
| Labs | `Lab` + lab sessions |
| Simulations | `Simulator` + runs |
| Projects | Capstone missions, portfolio items |
| Practice Tests | `Assessment` |
| Certifications | `Certification`, `StudentCertification` |
| Resources | Org resources tab |
| Portfolio | Student evidence linked to academy |
| AI Tutor | Blue Don AI (academy-scoped context) |

### Progression tiers

```
Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone
```

**Status:** **Built** — Academy Engine, 14 academies seeded. AI Tutor and full workspace tabs phased.

---

## Part VII — 🏅 Athletics

```
Athletics (/athletics)
│
├── Football
├── Basketball
├── Baseball
├── Volleyball
├── Track
├── Golf
├── Cheer
├── Cross Country
├── Schedules
├── Scores
├── Photos
├── Livestreams
├── Statistics
└── Team Stores
```

Each team is an **Organization** (type `TEAM`) with the standard workspace template plus athletics-specific tabs: Schedules, Scores, Stats, Livestreams, Team Store.

**Status:** Planned — Module 8.

---

## Part VIII — ❤️ Service Center

```
Service Center (/service)
│
├── Browse Opportunities
├── Sign Up
├── QR Check In
├── QR Check Out
├── Supervisor Approval
├── Hours
├── History
├── Certificates
└── Service Awards
```

### Service flow

```
Browse → Sign Up → Check In (QR) → Participate → Check Out → Supervisor Approves → Hours logged → Journey + XP updated
```

**Distinct from Service Desk** (`/service-desk`) — IT tickets and account management remain staff-facing. Service Center is **student volunteer operations**.

**Status:** Partial — Service Desk built. Volunteer QR and hours tracking planned.

---

## Part IX — 🎯 Future Center

> **One of the biggest modules — every recommendation leads to another opportunity.**

```
Future Center (/future)
│
├── Career Explorer
├── College Explorer
├── Trade Schools
├── JDRCC
├── Military
├── Scholarships
├── Internships
├── Recruiters
├── Resume Builder
├── Portfolio
├── Job Shadowing
├── Career Quiz
├── Career AI
├── Financial Aid
├── FAFSA
└── College Visits
```

| Section | Journey hook |
|---------|--------------|
| Career Quiz | Writes to My Interests, Career Plan |
| Career Explorer | Suggests academies, clubs, certs |
| Scholarships | Graduation Progress (Grade 12) |
| Resume Builder | Pulls from Journey resume |
| Career AI | Blue Don AI (Future Center scope) |

**Status:** Partial — `/pathways` exists. Full Future Center shell planned Phase 17+.

---

## Part X — 🛍 Blue Don Corner

```
Blue Don Corner (/corner)
│
├── Spirit Wear
├── Club Stores
├── Tickets
├── Fundraisers
├── School Supplies
├── Digital Downloads
├── Senior Store
└── Marketplace
```

Coins earned in Rewards System are **spent here**. Club stores link to org workspace Store tab.

**Status:** Planned — Module 13.

---

## Part XI — 📰 Community

> **Madonna's heartbeat — positive school culture only.**

```
Community (/community)
│
├── Announcements
├── Campus Feed
├── Acts of Kindness
├── Student Spotlight
├── Teacher Spotlight
├── Club News
├── Athletics
├── Broadcasting
├── Achievements
├── Birthdays
└── Upcoming Events
```

| Principle | Detail |
|-----------|--------|
| Positive-first | Achievements, service, culture — no negativity |
| Reactions only | Celebrate, support — no comment wars |
| Auto-populated | Event wins, certifications can auto-post (opt-in) |
| Moderated | Staff/officer approval configurable |

**Status:** Planned — Module 16.

---

## Part XII — 📸 Media Center

```
Media Center (/media)
│
├── Photos
├── Videos
├── Albums
├── Livestream Archive
├── Broadcast Archive
├── Digital Yearbook
├── Organization Galleries
└── Student Galleries
```

Event photos flow here after completion (Event Hub → Media). Broadcast Academy feeds Livestream and Broadcast Archive.

**Status:** Planned — Module 17.

---

## Part XIII — 🏆 Rewards

```
Rewards (/rewards)
│
├── XP
├── Coins
├── Badges
├── Levels
├── Missions
├── Leaderboards
├── Achievements
├── Teacher Rewards
└── Blue Don Shop
```

Blue Don Shop deep-links to Blue Don Corner. Daily Mission on Home OS pulls from Missions.

**Status:** Partial — `LeaderboardEntry` exists. Full ledger planned.

---

## Part XIV — 🤖 Blue Don AI

```
Blue Don AI (/ai)
│
├── Homework Help
├── Career Mentor
├── Study Planner
├── Resume Coach
├── College Guide
├── Scholarship Finder
├── Event Assistant
├── Service Recommender
├── Club Recommender
└── Academic Coach
```

### AI boundaries (Constitution Article X)

- Scoped to student profile and permitted data only.  
- No therapy, discipline, or health diagnosis.  
- Career AI feeds Future Center; academy AI Tutor is academy-scoped.  
- Parents and counselors see summaries — not raw chat logs (policy-gated).

**Status:** Planned — Module 12.

---

## Part XV — ⚙ Administration

Staff-only. Not visible to students.

```
Administration (/admin)
│
├── Users
├── Campus Operations      ← department workspaces (Module 32)
├── Blue Don Requests      ← unified request queues (Module 33)
├── Organizations
├── Events
├── Broadcast Management
├── Fundraising Hub
├── School Analytics
├── Partner Portal
├── Permissions
├── School Settings
├── AI Controls
└── System Health
```

| Section | Maps to |
|---------|---------|
| Users | Service Desk `/service-desk/users` |
| Campus Operations | `/operations` — IT, Facilities, Broadcasting, etc. |
| Requests | `/requests` — all campus ask queues |
| School Analytics | Principal dashboard — engagement, fundraising, certs |
| Partners | Community Partner Portal approvals |
| Permissions | RBAC + org roles |
| Approvals | Forms, events, impact fund |
| System Health | `/api/health`, integration status |

**Status:** Partial — `/admin`, Service Desk users, forms admin. Full ops center Phase 23+.

See [Campus Operations](./BLUE_DON_CAMPUS_OPERATIONS.md) · [Blue Don Requests](./BLUE_DON_REQUESTS.md).

---

## Part XVI — Cross-Module Data Flow

```
                    ┌─────────────┐
                    │  Blue Don   │
                    │     OS      │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │ School Hub │  │  Student   │  │  Academies │
    │            │  │   Life     │  │            │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                   ┌─────────────┐
                   │ Event Hub   │──► Calendar, Community, Media, XP
                   └──────┬──────┘
                          ▼
                   ┌─────────────┐
                   │ My Journey  │◄── Service, Rewards, Future, Portfolio
                   └─────────────┘
```

**One event. Many surfaces. One journey record.**

---

## Part XVII — Implementation Phases

| Phase | Deliverable | IA impact |
|-------|-------------|-----------|
| **17** | Navigation migration + Blue Don OS shell | 14-item nav; Home redesign |
| **17.1** | School Hub + My Journey MVP | Hub sections; Journey core tabs |
| **17.2** | Student Life org workspaces | Org template UI |
| **18** | Service Center + Rewards ledger | Volunteer QR; XP/coins |
| **18.1** | Future Center shell | Career quiz → recommendations |
| **19** | Community + Media | Feed; galleries |
| **19.1** | Athletics + Corner | Teams; marketplace |
| **20** | Blue Don AI | Scoped assistants |
| **21** | Admin consolidation | Full admin IA |

---

## Appendix — Current vs. Target Nav

| Current (Phase 16) | Target (Digital Campus) |
|--------------------|-------------------------|
| Dashboard | **Home** (Blue Don OS) |
| — | **My Journey** |
| — | **School Hub** |
| — | **Student Life** |
| Pathways + Academies | **Academies** |
| — | **Athletics** |
| Service Desk (mixed) | **Service Center** (+ staff Service Desk) |
| — | **Future Center** |
| — | **Blue Don Corner** |
| — | **Community** |
| — | **Media Center** |
| — | **Rewards** |
| — | **Blue Don AI** |
| Forms, Labs, Sims, Portfolio, Events, Impact Fund, Knowledge Vault | Absorbed into Hub, Academies, Journey, Admin |

Legacy routes remain reachable during migration via redirects.

---

*Madonna High School · Blue Don Virtual Campus*  
***The Digital Campus Experience***  
*Where Every Student's Journey Begins.*
