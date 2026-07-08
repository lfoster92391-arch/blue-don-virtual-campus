# My Madonna Journey

**Longitudinal Student Experience · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Students, parents, faculty, product, developers  

**Tagline:** *Every moment. Every memory. Every milestone.*

**Pillar:** Student Success + Digital Identity (see [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md))

**Companion documents:** [Blue Don ID](./BLUE_DON_ID.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

**My Madonna Journey** is the student's longitudinal home on Blue Don — not a gradebook, not a folder of PDFs. It is the **living story** of a student's time at Madonna from first day through graduation and into alumni life.

Every event attended, badge earned, reflection written, photo uploaded, and certification completed becomes a **milestone on a scrollable timeline** — organized by school year.

At the end of each year, Blue Don generates a **Year in Review** (like Spotify Wrapped). At graduation, it produces a **Madonna Journey video**. Every graduating class leaves a **Digital Time Capsule** that opens five years later.

> **Nothing is lost. Everything becomes legacy.**

**Consolidates:** Product Blueprint Modules 2 (Student Journey), 21 (My Journey), 22 (Blue Don Tree), and graduation narrative features.

**Route:** `/my-journey` (primary nav)

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **My Madonna Journey** | The full longitudinal experience (this document) |
| **Journey Timeline** | Year-by-year scrollable milestone feed |
| **Achievement** | Earned milestone — service, leadership, academics, technology |
| **My Story** | Semester reflection journal with media |
| **Year in Review** | Auto-generated annual recap (June) |
| **Journey Video** | Auto-generated graduation film |
| **Memory Vault** | Per-org yearly archive (IT Club, Football, Class of 2029) |
| **Personal Analytics** | Growth metrics — not grades |
| **Class Legacy** | What seniors leave behind for Madonna history |
| **Digital Time Capsule** | Class video to future students — opens 5 years later |

### Related (distinct) concepts

| Concept | Document | Purpose |
|---------|----------|---------|
| **Student Passport** | [Blue Don ID](./BLUE_DON_ID.md) | Stamp book of "firsts" on wallet pass |
| **Digital Passport** | My Journey + ID | Official exportable credential at graduation |
| **Blue Don Tree** | Rewards | Visual XP growth metaphor on Dashboard |

---

## Part II — Journey Timeline

> **Imagine opening your Journey and scrolling through your years at Madonna.**

```
My Madonna Journey (/my-journey)
│
├── Timeline                    ← primary view (year sections)
├── Achievements
├── My Story
├── Year in Review
├── Memory Vaults
├── Personal Analytics
├── Legacy (seniors)
└── Digital Passport            ← export (graduation)
```

### Timeline UI

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MY MADONNA JOURNEY
  Every moment. Every memory. Every milestone.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ▼ 2026 — Freshman Year
  ┌────────────────────────────────┐
  │ ✔ First Day at Madonna         │
  │ ✔ Joined IT Club               │
  │ ✔ Attended Homecoming          │
  │ ✔ First Service Project        │
  │ ✔ Earned First Badge           │
  │ ✔ First Football Game          │
  └────────────────────────────────┘

  ▼ 2027 — Sophomore Year
  ┌────────────────────────────────┐
  │ ✔ CompTIA A+                   │
  │ ✔ Chromebook Repair #1         │
  │ ✔ Broadcasting Football        │
  │ ✔ Student Council              │
  │ ✔ Career Fair                  │
  │ ✔ JDRCC Visit                  │
  │ ✔ Kindness Award               │
  └────────────────────────────────┘

  ▼ 2028 — Junior Year
  ...

  ▼ 2029 — Senior Year
  ┌────────────────────────────────┐
  │ ✔ Graduation                   │
  │ ✔ Accepted to College          │
  │ ✔ 84 Service Hours             │
  │ ✔ Digital Passport Complete    │
  └────────────────────────────────┘
```

### Milestone sources (automatic)

| Source | Timeline entry |
|--------|----------------|
| Event attendance | "Attended Homecoming" |
| Org join | "Joined IT Club" |
| Service hours | "First Service Project" |
| Badge earned | "Earned First Badge" |
| Certification | "CompTIA A+" |
| Leadership role | "IT Club Vice President" |
| Competition | "Robotics Competition" |
| Kindness post | "Kindness Award" |
| College acceptance | "Accepted to College" |
| Graduation | "Graduation" |

Students can **pin** favorite milestones. Tap any entry → detail, photos, related org/event.

---

## Part III — 🏅 Achievement System

> **Not just badges. Real milestones.**

Achievements are **categorized**, **progressive**, and **permanent**. Displayed in Journey and on Blue Don Pass back (summary count).

### Service ❤️

| Achievement | Threshold |
|-------------|-----------|
| First Service Hour | 1 hour |
| Service Starter | 10 hours |
| Service Champion | 25 hours |
| Service Leader | 50 hours |
| Service Legend | 100 hours |

### Leadership

| Achievement | Trigger |
|-------------|---------|
| Club Officer | `OrganizationMembership.orgRole` = OFFICER+ |
| Class Officer | Class org leadership position |
| Team Captain | Athletics team captain assignment |
| Peer Mentor | Mentor program enrollment |
| Student Council | Council membership |

### Academics

| Achievement | Trigger |
|-------------|---------|
| Honor Roll | FACTS grade sync (policy-gated) |
| High Honors | FACTS grade sync |
| Perfect Attendance | Attendance threshold per term |
| Academic Excellence | Advisor nomination or cert criteria |

### Technology

| Achievement | Trigger |
|-------------|---------|
| CompTIA | `StudentCertification` — CompTIA |
| Cisco | Cisco cert earned |
| Microsoft | Microsoft cert earned |
| Google | Google cert earned |
| Adobe | Adobe cert earned |
| OSHA | OSHA cert earned |

*Additional certs auto-map from Academy Engine certifications.*

### Achievement rules

| Rule | Detail |
|------|--------|
| **A1** | Achievements **never removed** — only earned |
| **A2** | Progressive tiers show progress (e.g., 42/50 service hours) |
| **A3** | Each unlock → timeline entry + optional XP + passport stamp |
| **A4** | Parents see summary; counselors see full list |
| **A5** | Achievements appear in Year in Review and graduation video |

---

## Part IV — 📖 My Story

> **Every semester, Blue Don asks: "Tell us about this semester."**

```
My Story (/my-journey/story)
│
├── Semester prompts (Fall / Spring per year)
├── Student uploads:
│   ├── Photos
│   ├── Videos
│   ├── Written thoughts
│   ├── Achievements highlighted
│   ├── Reflections
│   └── Favorite memories
└── Published semester chapters
```

### Semester prompt flow

```
Start of semester → optional goals prompt
End of semester   → "Tell us about this semester"
        │
        ▼
Student composes chapter (rich text + media)
        │
        ▼
Saved to Journey → feeds Year in Review + graduation video
```

**Privacy:** Private by default; student can share chapter with parents or advisor.

---

## Part V — 🎬 End-of-Year Recap

> **Every June — like Spotify Wrapped. Students will LOVE this.**

Blue Don auto-generates **Your Year in Review** from system data + My Story content.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  YOUR 2027 YEAR IN REVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  You attended          42 Events
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Earned             2,850 XP
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Completed           18 Service Hours
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Uploaded           184 Photos
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Earned               6 Certifications
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Joined               2 New Clubs

  ── Highlights ──
  🏆 Biggest Achievement     CompTIA A+
  👥 Most Active Club        IT Club
  ❤️ Most Meaningful Service  Food pantry project
  📺 Most Viewed Broadcast   Homecoming recap
  ⭐ Favorite Teacher        Mrs. Smith (student-selected)
  📸 Favorite Memory         [top photo from My Story]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [ Share ]  [ Download PDF ]
```

### Recap data sources

| Stat | Source |
|------|--------|
| Events attended | Event Hub + QR scans |
| XP earned | Rewards ledger (school year filter) |
| Service hours | Service Center |
| Photos uploaded | Media / My Story |
| Certifications | Academy Engine |
| Clubs joined | Org memberships |
| Highlights | AI-assisted ranking + student picks |

**Delivery:** In-app reveal (June 1), optional push, shareable link (privacy-gated).

---

## Part VI — 📹 Auto-Generated Journey Video

> **At graduation — "Lisa's Madonna Journey"**

Automatically compiled from timeline, My Story media, achievements, and Memory Vault highlights.

```
Lisa's Madonna Journey (video)
│
├── First Day (photos)
├── Freshman year highlights
├── Sophomore year highlights
├── Junior year highlights
├── Senior year highlights
├── Awards & certifications montage
├── Graduation ceremony
└── Closing card: Class of 2029
```

| Element | Detail |
|---------|--------|
| **Music** | School-licensed or royalty-free template |
| **Duration** | 3–5 minutes (configurable) |
| **Style** | Template per school brand |
| **Review** | Student previews before publish |
| **Share** | Parents, grandparents, social (opt-in) |
| **Storage** | Media Center + Digital Backpack |

**Pillar:** Intelligence (automation) + Student Success.

**Privacy:** Only student's own media + public school event media. No other students' faces without consent flags.

---

## Part VII — 📚 Memory Vault

> **Every organization gets one. Every year automatically archived.**

```
Memory Vaults (/my-journey/vaults)
│
├── IT Club
│   └── 2026 · 2027 · 2028 · 2029
├── Broadcasting
├── Football
├── Drama
├── Science Club
└── Class of 2029
```

### Per-org yearly archive

| Content auto-collected | Source |
|------------------------|--------|
| Event photos | Media Center org gallery |
| Announcements | Org broadcasts |
| Roster snapshot | Org membership that year |
| Achievements | Org-scoped milestones |
| Competition results | Events / athletics |

Students browse **their** vaults for orgs they belonged to. Alumni retain read access.

**Class org vault** includes senior message, time capsule, legacy content.

---

## Part VIII — 📈 Personal Analytics

> **Students learn about themselves — not grades. Growth.**

```
Personal Analytics (/my-journey/analytics)
│
├── 184 Hours Volunteering
├── 92 Events Attended
├── 48 Projects Completed
├── 16 Kindness Awards Inspired
├── 12 Certifications Earned
├── Clubs & orgs over time (chart)
├── XP growth curve
└── Career interest evolution
```

| Principle | Detail |
|-----------|--------|
| **No GPA on this screen** | Growth and involvement only |
| **Compare to self** | Year-over-year, not class rank |
| **Counselor view** | Full analytics for advising |
| **Parent view** | Summary cards (linked child) |

Feeds Future Center and Guidance Center conversations.

---

## Part IX — 🏆 Class Legacy

> **Seniors don't disappear — they become part of Madonna history.**

When a class graduates, their **Legacy** page is published:

```
Class of 2029 Legacy (/legacy/2029)
│
├── Class photos
├── Senior videos
├── Broadcast highlights
├── Achievement summary (aggregate)
├── Senior class message
├── Digital Time Capsule (sealed)
└── Notable graduates (opt-in spotlight)
```

Visible to current students as inspiration. Alumni return to view their class page.

---

## Part X — 💙 Digital Time Capsule

> **A feature no other school has.**

Every graduating class records a **video to future students**:

```
Class of 2029 Time Capsule
│
├── Advice to underclassmen
├── Predictions for 2034
├── Goals and dreams
├── Class inside jokes (appropriate)
└── Messages from officers & advisor
```

### The five-year loop

```
Graduation 2029
     │
     ▼
Time Capsule SEALED (not viewable until open date)
     │
     ▼
June 2034 — Blue Don notifies all Class of 2029 alumni:
     "Your Class of 2029 Time Capsule has been opened."
     │
     ▼
Alumni watch → compare hopes vs. reality
     │
     ▼
"I hoped to become a nurse" → now RN at local hospital
"I hoped to own a business" → returns as guest speaker
```

| Rule | Detail |
|------|--------|
| **TC1** | Sealed at graduation; open date = graduation + 5 years (configurable) |
| **TC2** | Only class members + alumni can contribute before seal |
| **TC3** | Advisor moderates content before seal |
| **TC4** | On open: push + email to alumni; public excerpt for current students |
| **TC5** | Alumni can update "where I am now" linked to capsule predictions |

**Closes the loop:** Journey → Alumni → Mentor → Guest speaker → Current student Journey.

---

## Part XI — Full Journey Structure

```
My Madonna Journey (/my-journey)
│
├── Timeline                    ← year-by-year milestones
├── About Me
├── My Story                    ← semester chapters
├── My Goals
├── My Interests
├── My Strengths
├── Reflection Journal
├── Achievements                ← categorized milestones
├── Resume
├── Portfolio                   ← links to portfolio module
├── Service Hours
├── Leadership
├── Certifications
├── Career Plan
├── Graduation Progress
├── Year in Review              ← annual recaps (archive)
├── Journey Video               ← graduation film
├── Memory Vaults               ← per-org archives
├── Personal Analytics
├── Legacy                      ← seniors: class contribution
└── Digital Passport            ← export credential
```

---

## Part XII — Data Model (Proposed)

```prisma
model JourneyMilestone {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  schoolYear  Int      @map("school_year")   // 2026 = 2025-26 school year
  title       String
  description String?
  category    String   // EVENT, SERVICE, LEADERSHIP, ACADEMIC, TECH, PERSONAL
  sourceType  String?  @map("source_type")
  sourceId    String?  @map("source_id")
  pinned      Boolean  @default(false)
  occurredAt  DateTime @map("occurred_at")
  createdAt   DateTime @default(now()) @map("created_at")
}

model JourneyAchievement {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  achievementKey String @map("achievement_key")  // service_10, comptia_a, ...
  earnedAt    DateTime @default(now()) @map("earned_at")
  metadata    Json?
  @@unique([userId, achievementKey])
}

model StoryChapter {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  schoolYear  Int      @map("school_year")
  term        String   // FALL, SPRING
  title       String?
  body        String
  mediaIds    String[] @map("media_ids")
  visibility  String   @default("PRIVATE")
  publishedAt DateTime? @map("published_at")
}

model YearInReview {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  schoolYear  Int      @map("school_year")
  stats       Json     // computed aggregates
  highlights  Json     // biggest achievement, favorite memory, etc.
  generatedAt DateTime @map("generated_at")
  @@unique([userId, schoolYear])
}

model MemoryVaultYear {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  schoolYear     Int      @map("school_year")
  snapshot       Json     // roster, stats, featured media ids
  archivedAt     DateTime @map("archived_at")
  @@unique([organizationId, schoolYear])
}

model ClassTimeCapsule {
  id           String   @id @default(cuid())
  organizationId String   @map("organization_id")  // Class of 2029 org
  cohortYear   Int      @map("cohort_year")
  status       String   // COLLECTING, SEALED, OPENED
  sealedAt     DateTime? @map("sealed_at")
  openAt       DateTime @map("open_at")
  mediaUrl     String?  @map("media_url")
  predictions  Json?    // [{ userId, hope, ... }]
}

model ClassLegacy {
  id           String   @id @default(cuid())
  organizationId String @map("organization_id")
  cohortYear   Int      @map("cohort_year")
  seniorMessage String? @map("senior_message")
  content      Json
  publishedAt  DateTime @map("published_at")
}
```

---

## Part XIII — Automation & Intelligence

| Job | Schedule | Output |
|-----|----------|--------|
| Milestone capture | Real-time on events | Timeline entries |
| Achievement check | Daily | New achievements |
| Memory vault archive | End of school year | Per-org yearly snapshot |
| Year in Review | June 1 | Personal recap |
| Journey video | 2 weeks before graduation | Graduation film |
| Time Capsule open | openAt date | Alumni notification |

AI assists (Constitution Article X boundaries):
- Highlight ranking for Year in Review  
- Story prompt suggestions  
- Video chapter ordering  
- **Never** fabricates events or achievements  

---

## Part XIV — Cross-Module Integration

| Module | Journey integration |
|--------|---------------------|
| Event Hub | Timeline: events attended |
| Service Center | Service achievements, analytics |
| Rewards | XP in recap; badges → achievements |
| Academies | Certifications → technology achievements |
| Organizations | Memory Vaults, leadership achievements |
| Community | Kindness awards |
| Future Center | Career plan, college acceptance milestone |
| Blue Don ID | Passport stamps, Digital Passport export |
| Media Center | Photos/video for story and recap |
| Broadcasts | "First Broadcast" milestone |
| Alumni Portal | Time Capsule open, legacy view |

---

## Part XV — Permissions & Privacy

| Data | Student | Parent | Counselor | Public |
|------|---------|--------|-----------|--------|
| Timeline | ✔ | Linked summary | ✔ | — |
| My Story | ✔ | If shared | If shared | — |
| Year in Review | ✔ | If shared | ✔ | — |
| Journey video | ✔ | ✔ | ✔ | Opt-in link |
| Time Capsule | Class members | — | Moderator | Excerpt after open |
| Personal analytics | ✔ | Summary | ✔ | — |
| GPA achievements | ✔ | ✔ | ✔ | — |

---

## Part XVI — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **17.1** | Journey shell + Timeline (manual + event hooks) |
| **17.2** | Achievement system (service + leadership first) |
| **18.0** | My Story semester chapters |
| **18.1** | Personal Analytics |
| **19.0** | Memory Vault yearly archive |
| **19.1** | Year in Review (June job) |
| **20.0** | Technology + academic achievements (cert sync) |
| **21.0** | Journey video generation |
| **21.1** | Class Legacy pages |
| **22.0** | Digital Time Capsule (collect → seal → open) |
| **22.1** | Alumni reunion + capsule notification loop |

---

## Part XVII — Design Checklist

1. **Emotional resonance** — Does this feel like *their* story?  
2. **Automatic capture** — Are milestones logged without manual entry?  
3. **Growth not grades** — Analytics celebrate involvement?  
4. **Nothing lost** — Does graduation preserve everything?  
5. **Alumni loop** — Does Time Capsule connect past and present students?  
6. **FERPA** — Are academic achievements appropriately gated?

---

*Madonna High School · Blue Don Virtual Campus*  
*My Madonna Journey — Every moment. Every memory. Every milestone.*
