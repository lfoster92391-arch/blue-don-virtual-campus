# Opportunity Center

**Proactive Discovery · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Students, faculty, counselors, partners, product, developers  

**Tagline:** *Don't wait for opportunities. Discover them.*

**Pillar:** Student Success + Intelligence (see [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md))

**Companion documents:** [Future Center](./BLUE_DON_DIGITAL_CAMPUS.md) · [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) · [Campus Life](./BLUE_DON_CAMPUS_LIFE.md) · [System Blueprint](./BLUE_DON_SYSTEM_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

The Opportunity Center is where Blue Don becomes **proactive** — not a list of links, but a living feed of everything a student **can do right now** at Madonna, sorted by AI for *who they are*.

> **Imagine every opportunity at Madonna in one place.**

Clubs need members. Service needs volunteers. Broadcasting needs camera operators. Scholarships have deadlines. Internships open. Guest speakers arrive. **Blue Don surfaces them** — before students knew to look.

The signature feature is **What If?** — students explore possible futures ("What if I became a nurse?") and instantly see a full Madonna roadmap: classes, clubs, service, certs, colleges, alumni, local employers.

**Module 35** · **Route:** `/opportunities` (primary nav — or merged with Future Center tab; see Part XIV)

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Opportunity** | Any actionable item — join, volunteer, attend, apply, shadow, learn |
| **Opportunity Feed** | AI-ranked personalized list — not random order |
| **Opportunity Score** | % of grade-appropriate opportunities explored |
| **Hidden Opportunity** | Grade-gated — visible but locked until eligible |
| **Surprise Opportunity** | New, time-limited — Monday morning discoveries |
| **Bucket List** | Student-saved "I want to do this" with reminders |
| **Opportunity Map** | Campus map with live opportunities per room |
| **Secret Achievement** | Unknown until earned — discovery delight |
| **Blue Don Connect** | Freshman mentor matching — senior, teacher, club, career |
| **What If?** | Career future explorer — full roadmap per hypothetical |

### vs. Future Center

| Future Center | Opportunity Center |
|---------------|-------------------|
| Long-term planning | **Right now** actions |
| Career quiz, colleges, FAFSA | Join club, volunteer today, apply by Friday |
| Counselor-driven | **Student-discovered** |
| What If? lives here as bridge | Feed + map + bucket list |

**Integration:** What If? results link to Future Center for depth; Opportunity Center for immediate next steps.

---

## Part II — Opportunity Feed

> **Students don't see a list. They see opportunities.**

```
/opportunities
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🔥 OPPORTUNITIES FOR YOU
  Recommended for Lisa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💻 IT Club needs 3 students
❤️ Library needs volunteers
🎥 Broadcasting needs camera operators
🏈 Football needs statisticians
🌸 Beautification Club — planting flowers
🎭 Drama needs stage crew
📚 Tutor elementary students
🎤 Guest Speaker: FBI Cybersecurity
💼 Summer Internship Available
🎓 Scholarship Deadline Friday
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Opportunity types

| Type | Source | Action |
|------|--------|--------|
| **Org need** | Club/team officer post | Join / RSVP |
| **Service** | Service Center | Sign up |
| **Event** | Event Hub | Attend / register |
| **Speaker** | Event Hub + Campus Life | Reserve seat |
| **Internship** | Partner Portal | Apply |
| **Scholarship** | Future Center | View deadline |
| **Workshop** | Academy / partner | Register |
| **Job shadow** | Partner Portal | Request |
| **Tutoring** | NHS / service org | Volunteer |

### AI ranking — "Recommended for Lisa"

```
⭐⭐⭐⭐⭐ CompTIA Networking Workshop
   Because you're in IT Academy.

⭐⭐⭐⭐⭐ Dan's Plumbing Job Shadow
   Because you enjoy hands-on work.

⭐⭐⭐⭐⭐ JDRCC Electronics Open House
   Because you've completed Circuit Academy.
```

| Signal | Weight |
|--------|--------|
| Academy enrollment | High |
| Career interests (Journey) | High |
| Past participation patterns | Medium |
| Grade level eligibility | Gate |
| Bucket list items | Boost |
| What If? explorations | Boost |
| Counselor flags (non-therapy) | Low |

**AI explains why** — Constitution Article X. Student can dismiss ("not interested") without penalty.

---

## Part III — Opportunity Score

> **Students naturally want to reach 100%.**

```
You've explored 82% of opportunities
available for your grade.
━━━━━━━━━━━━━━━━━━━━━━━━━━
[████████████████░░░░] 82%
```

| Rule | Detail |
|------|--------|
| **Grade-scoped** | Denominator = opportunities eligible for student's grade |
| **Explore = view detail or save to bucket list** | Not required to complete |
| **Complete = action taken** | Join, attend, apply — bonus XP |
| **Not punitive** | Encouraging, not shame-based |
| **Dashboard widget** | Visible on Home OS |

Feeds Journey Personal Analytics and counselor advising context.

---

## Part IV — Hidden Opportunities

> **Freshmen aren't overwhelmed. Juniors see what's coming.**

```
🔒 Internship — Available
   Unlocks Next Year (Junior+)
   
   Preview: Summer engineering placement with local manufacturer.
   [ Save to Bucket List ]
```

| Visibility | Who sees |
|------------|----------|
| **Open** | Eligible now — full detail + action |
| **Preview** | Below grade — teaser + bucket list save |
| **Hidden** | Staff-only until publish date |

Creates aspiration without overload.

---

## Part V — Surprise Opportunities

> **Monday morning — students would never have known.**

```
🎉 NEW!
NASA Virtual Engineer Guest Speaker
Limited Seats — Reserve Now
Posted 8:00 AM · Expires in 48 hours
```

| Rule | Detail |
|------|--------|
| **Push + Home OS card** | High visibility |
| **Time-limited** | Creates healthy urgency |
| **Limited seats** | First-come or lottery (configurable) |
| **Source** | Partner Portal, admin, teacher suggestion |

Triggers Broadcast (Important) + Notification Engine.

---

## Part VI — My Bucket List

> **Throughout high school — Blue Don reminds them.**

```
My Bucket List (/opportunities/bucket-list)
│
☐ Visit WVU
☐ Learn Welding
☐ Broadcast Football
☐ CompTIA A+
☐ Meet an FBI Agent
☐ Build a Robot
☐ Volunteer 100 Hours
```

| Feature | Detail |
|---------|--------|
| **Save from anywhere** | Feed, What If?, map, Future Center |
| **Reminders** | Semester check-in + when related opportunity appears |
| **Progress** | Auto-check when milestone achieved |
| **Journey link** | Bucket items → Goals in My Madonna Journey |
| **Graduation** | Unfinished items in Year in Review reflection |

---

## Part VII — Opportunity Map

> **Every room is alive.**

Extends [Campus Life](./BLUE_DON_CAMPUS_LIFE.md) campus map with **live opportunity pins**:

```
[Campus Map]
     Media Room ── Broadcasting Open Lab
     IT Lab ────── Networking Workshop 3:00 PM
     Gym ───────── Volleyball tryouts
     Library ───── NHS Meeting 2:30 PM
```

Tap room → opportunities at that location today + upcoming + photos.

**Data:** Event Hub (location field) + org postings + equipment reservations (public).

---

## Part VIII — Secret Achievements

> **Students don't know they exist — until they earn them.**

Extends [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) achievement system:

| Secret achievement | Trigger (hidden until earned) |
|--------------------|-------------------------------|
| 🏆 **Community Builder** | Help three different clubs |
| 🏆 **School Spirit** | Attend every Homecoming event (4 years) |
| 🏆 **Heart of Madonna** | Volunteer every month for a school year |
| 🏆 **Master Technician** | Repair 100 Chromebooks (IT ops) |
| 🏆 **Opportunity Explorer** | Opportunity Score 100% |
| 🏆 **What If Wanderer** | Explore 10 different What If? paths |

| Rule | Detail |
|------|--------|
| **Not listed** until earned | Surprise delight |
| **Celebration** | Journey timeline + optional Community post |
| **XP bonus** | Rewards Engine |

---

## Part IX — 💙 Blue Don Connect

> **Every freshman automatically matched — not forced, just guidance.**

```
Blue Don Connect (/opportunities/connect)
│
├── Senior Mentor        (one matched alumni/senior)
├── Teacher Mentor       (one faculty guide)
├── Club Recommendation  (one suggested org)
└── Career Recommendation (one pathway nudge)
```

### Matching signals

| Match | Based on |
|-------|----------|
| Senior mentor | Interests, academy, availability, opt-in alumni |
| Teacher mentor | Department, advisee load, student interests |
| Club | Career quiz, What If?, exploration gaps |
| Career | Future Center + academy pathway |

| Principle | Detail |
|-----------|--------|
| **Opt-in both sides** | Mentors accept match |
| **Swap once** | Student can request rematch (semester) |
| **Not forced** | Suggestions with easy dismiss |
| **One relationship** | Could change a student's entire experience |

**Launch:** Grade 9 onboarding flow + fall semester refresh.

---

## Part X — 🌟 What If? (Signature Feature)

> **"What if I became…" — experience possible futures.**

```
What If? (/opportunities/what-if)

"What if I became a nurse?"
```

### Instant roadmap

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT IF: REGISTERED NURSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ Classes to take at Madonna
✔ Clubs to join (Health Sciences, NHS)
✔ Service opportunities (hospital volunteer)
✔ Certifications (CPR, Health Sciences certs)
✔ Colleges (WVU, Wheeling, local programs)
✔ JDRCC programs
✔ Scholarships
✔ Average salary (BLS data, age-appropriate)
✔ Day in the life (video/article)
✔ Madonna alumni who became nurses
✔ Local hospitals hiring (partner data)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Save to Bucket List ]  [ Talk to Counselor ]  [ Start This Path ]
```

### Example paths

| Query | Roadmap differs |
|-------|-----------------|
| FBI Agent | Cybersecurity academy, law enforcement speakers, criminal justice electives |
| Pilot | JDRCC aviation, physics, ROTC option |
| Priest | Campus Ministry, theology resources, diocese connections |
| Business owner | Entrepreneurship club, Impact Fund, marketing academy |

### What If? principles

| # | Principle |
|---|-----------|
| W1 | **Experiential** — not search results; a story with steps |
| W2 | **Madonna-specific** — classes, clubs, alumni at *this* school |
| W3 | **Comparable** — save multiple What Ifs; compare side-by-side |
| W4 | **Actionable** — every section has "do this now" in Opportunity Feed |
| W5 | **Inclusive** | Trades, military, ministry, college — equal dignity |
| W6 | **AI-generated, human-reviewed** | Counselor can flag inaccurate roadmaps |
| W7 | **FERPA-safe** | No diagnosis; career exploration only |

**Aligns with mission:** *Choose Your Path. Build Your Future.*

---

## Part XI — Navigation & Surfaces

### Primary placement options

| Option | Nav |
|--------|-----|
| **A (recommended)** | `/opportunities` — primary nav item "Opportunities" |
| **B** | Tab inside Future Center: Future \| Opportunities \| What If? |
| **C** | Home OS card stack + deep link |

**Recommendation:** Option A for discoverability; Future Center links to What If? for planning continuity.

### Home OS integration

```
Good Morning, Lisa 👋
━━━━━━━━━━━━━━━━━━
🔥 3 Opportunities For You
⭐ Opportunity Score: 82%
🎉 NEW — NASA Guest Speaker
━━━━━━━━━━━━━━━━━━
```

---

## Part XII — Data Model (Proposed)

```prisma
enum OpportunityType {
  ORG_NEED
  SERVICE
  EVENT
  SPEAKER
  INTERNSHIP
  SCHOLARSHIP
  WORKSHOP
  JOB_SHADOW
  TUTORING
  SURPRISE
}

enum OpportunityStatus {
  DRAFT
  OPEN
  FILLED
  EXPIRED
  CANCELLED
}

model Opportunity {
  id              String            @id @default(cuid())
  schoolId        String            @map("school_id")
  type            OpportunityType
  title           String
  description     String
  status          OpportunityStatus @default(OPEN)
  gradeMin        Int?              @map("grade_min")
  gradeMax        Int?              @map("grade_max")
  unlockGrade     Int?              @map("unlock_grade")  // hidden until
  locationId      String?           @map("location_id")   // map pin
  organizationId  String?           @map("organization_id")
  eventId         String?           @map("event_id")
  partnerId       String?           @map("partner_id")
  seatsTotal      Int?
  seatsTaken      Int               @default(0)
  expiresAt       DateTime?         @map("expires_at")
  isSurprise      Boolean           @default(false)
  createdAt       DateTime          @default(now())
}

model OpportunityInteraction {
  id              String   @id @default(cuid())
  opportunityId   String   @map("opportunity_id")
  userId          String   @map("user_id") @db.Uuid
  action          String   // VIEWED, SAVED, DISMISSED, COMPLETED
  createdAt       DateTime @default(now())
  @@unique([opportunityId, userId, action])
}

model BucketListItem {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  title       String
  sourceType  String?  @map("source_type")  // WHAT_IF, MANUAL, OPPORTUNITY
  sourceId    String?  @map("source_id")
  completed   Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model WhatIfExploration {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  careerQuery String   @map("career_query")
  roadmap     Json     // generated snapshot
  createdAt   DateTime @default(now())
}

model SecretAchievement {
  id          String   @id @default(cuid())
  key         String   @unique  // community_builder, heart_of_madonna
  title       String
  description String?  // revealed only on earn
  rule        Json     // engine evaluation criteria
}

model MentorMatch {
  id          String   @id @default(cuid())
  studentId   String   @map("student_id") @db.Uuid
  mentorId    String   @map("mentor_id") @db.Uuid
  matchType   String   // SENIOR, TEACHER
  status      String   // PENDING, ACTIVE, COMPLETED
  schoolYear  Int      @map("school_year")
}
```

---

## Part XIII — Engine Integration

| Engine | Opportunity Center hook |
|--------|---------------------------|
| **Intelligence** | AI ranking, What If? generation |
| **Journey** | Bucket list → goals; completions → milestones |
| **Rewards** | Opportunity Score 100%; secret achievements |
| **Notification** | Surprise ops, bucket reminders, Connect matches |
| **Broadcast** | Surprise opportunity announcements |
| **Event** | Speaker events, workshops |

**Service:** `opportunity-service.ts` + `what-if-service.ts`  
**Ranking:** `recommendation-engine.ts` (shared with Future Center AI)

---

## Part XIV — Permissions

| Key | Who |
|-----|-----|
| `opportunities:view` | All students |
| `opportunities:create` | Staff, org officers, partners (approved) |
| `opportunities:manage` | Admin, advisors |
| `whatif:explore` | All students |
| `connect:mentor` | Opt-in seniors, alumni, teachers |
| `connect:manage` | Guidance counselors |

---

## Part XV — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **18.0** | Opportunity feed (manual posts, basic list) |
| **18.1** | AI ranking + "Recommended for you" |
| **18.2** | Bucket List |
| **18.3** | Opportunity Score |
| **19.0** | Hidden + Surprise opportunities |
| **19.1** | Opportunity Map (with Campus Life) |
| **19.2** | Secret achievements |
| **20.0** | **What If?** signature feature |
| **20.1** | Blue Don Connect (freshman matching) |
| **20.2** | Partner + internship opportunity types |

---

## Part XVI — Design Checklist

1. **Proactive** — Does the student see this before they thought to search?  
2. **Explainable** — Does AI say *why* it's recommended?  
3. **Grade-safe** — Are freshmen protected from overwhelm?  
4. **Actionable** — One tap to join, apply, or save?  
5. **Mission-aligned** — Does What If? honor every path (trade, ministry, college)?  
6. **Not grades** — Opportunity Score measures exploration, not GPA?

---

*Madonna High School · Blue Don Virtual Campus*  
*Opportunity Center — Don't wait for opportunities. Discover them.*
