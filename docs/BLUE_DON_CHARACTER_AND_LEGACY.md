# Character, Challenges & Legacy

**Virtue Development · Daily Missions · Permanent Memory · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Students, faculty, counselors, alumni, product, developers  

**Pillar:** Student Success + Student Life + Digital Identity

**Companion documents:** [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) · [Opportunity Center](./BLUE_DON_OPPORTUNITY_CENTER.md) · [Guidance Center](./BLUE_DON_GUIDANCE_CENTER.md) · [Rewards](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [System Blueprint](./BLUE_DON_SYSTEM_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Blue Don measures success not by one path — but by **character, impact, and journey**.

This module adds:

- **Daily Challenge** — personalized life missions at 7:00 AM (not homework)  
- **Character Journey** — ten virtues that grow through real activities  
- **Quest Board** — video-game-style progression  
- **World Explorer** + **Hidden Career Paths** — weekly discovery  
- **My Mentor** + **Teacher Recommendations** — who's in your corner  
- **Blue Don Legacy** — private teacher notes in graduation archive  
- **Senior Exit Interview** — voice, not paperwork  
- **Hall of Legacy** — permanent digital halls for every kind of excellence  

> **Success at Madonna isn't measured by one path. It's measured by the impact you make on others and the journey you take.**

**Module 36** · Routes: `/challenges` (daily), `/character`, `/quests`, `/legacy`, `/halls`  
**Campus Challenges (Module 38):** `/challenges/campus`, `/seasons` — monthly & seasonal school-wide

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Daily Challenge** | One personalized virtue mission per day — 7:00 AM |
| **Character Journey** | Ten-virtue growth wheel — unique profile by graduation |
| **Quest Board** | Tiered challenges (Easy → Legendary) |
| **World Explorer** | Weekly featured themes (daily cards → Daily Discovery) |
| **Hidden Career Paths** | "I like art" → careers you never heard of |
| **Blue Don Legacy** | Private teacher notes → graduation archive |
| **Senior Exit Interview** | Reflective prompts → class legacy |
| **Hall of Legacy** | Permanent induction halls — not just valedictorians |

### Distinction from homework

| Schoolwork | Character & Legacy |
|------------|-------------------|
| Assignments (Classroom) | Daily Challenge — **life** |
| Grades | Virtue growth — **character** |
| Homework check | Daily Discovery — **curiosity** |
| GPA achievements | Hall of Legacy — **impact** |

---

## Part II — Daily Challenge

> **Every day at 7:00 AM — a personalized mission. Not homework. Life.**

```
Today's Challenge                    +25 XP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Meet one new person today.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Mark Complete ]  [ Reflect (optional) ]
```

### Examples by profile

| Profile | Challenge | XP | Virtue |
|---------|-----------|-----|--------|
| Freshman | Meet one new person today | +25 | Compassion |
| IT student | Help someone with technology | +50 | Service + Innovation |
| Broadcasting | Take one photo that tells a story | +40 | Creativity + Communication |
| Athlete | Encourage a teammate | +30 | Compassion + Leadership |
| Student Council | Welcome three new students | +50 | Leadership + Service |

### Rules

| Rule | Detail |
|------|--------|
| **DC1** | Delivered 7:00 AM local — push optional |
| **DC2** | Personalized by grade, academy, org roles, Character Journey gaps |
| **DC3** | Honor system + optional reflection (not proctored) |
| **DC4** | Streak bonus — 7-day, 30-day (Rewards Engine) |
| **DC5** | Skip without penalty — but breaks streak |
| **DC6** | Contributes to **virtue wheel** on complete |

**Not assignments.** Building character.

**Surfaces:** Home OS card, `/challenges`, push notification.

---

## Part III — 💙 Character Journey

> **Instead of just earning XP — students develop virtues.**

### The ten virtues (Madonna wheel)

```
                    Faith ✝️
                       │
    Perseverance 🏔 ───┼─── Service ❤️
                       │
  Responsibility 📚 ───┼─── Leadership ⭐
                       │
    Innovation 💡 ─────┼──── Integrity 🛡
                       │
  Communication 🎤 ───┼─── Compassion 🤝
                       │
                  Creativity 🎨
```

| Virtue | Grows from |
|--------|------------|
| **Service** ❤️ | Volunteer hours, service challenges, kindness |
| **Leadership** ⭐ | Officer roles, council, mentoring, captain |
| **Integrity** 🛡 | On-time forms, honest reflections, commitments kept |
| **Compassion** 🤝 | Daily challenges, kindness posts, welcoming others |
| **Creativity** 🎨 | Portfolio, broadcasting, arts, design certs |
| **Communication** 🎤 | Broadcasts, presentations, morning show, debates |
| **Innovation** 💡 | Labs, robotics, Impact Fund, IT repairs |
| **Faith** ✝️ | Campus Ministry, retreats, Mass attendance, service |
| **Perseverance** 🏔 | Difficult certifications, multi-year goals, athletics |
| **Responsibility** 📚 | Equipment checkout returns, attendance, deadlines met |

### Character profile

Each student has a **unique radar/spoke chart** by graduation — not compared for ranking.

```
Lisa Morris — Class of 2029
Strongest: Service, Innovation, Perseverance
Growing: Leadership, Communication
```

Activities auto-contribute via Rewards + Journey engines. Teachers can award virtue bumps (audited, capped).

**Route:** `/character` · Widget on My Journey.

---

## Part IV — Blue Don Quest Board

> **Think video game — students love progress.**

```
Quest Board (/quests)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AVAILABLE QUESTS

⭐⭐ Easy        Attend a club meeting
⭐⭐ Medium      Volunteer 2 hours
⭐⭐⭐ Hard       Complete CompTIA Core 1
⭐⭐⭐⭐ Epic      Become Club President
⭐⭐⭐⭐⭐ Legendary Graduate with 100 Service Hours
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IN PROGRESS (2)  ·  COMPLETED (14)
```

| Tier | XP multiplier | Examples |
|------|---------------|----------|
| ⭐⭐ Easy | 1× | First club meeting, first broadcast |
| ⭐⭐ Medium | 1.5× | 2 service hours, attend career fair |
| ⭐⭐⭐ Hard | 2× | Certification, competition entry |
| ⭐⭐⭐⭐ Epic | 3× | Club president, capstone mission |
| ⭐⭐⭐⭐⭐ Legendary | 5× | 100 service hours, graduate with distinction |

Quests link to Opportunity Feed items. Completion → XP + coins + virtue + Journey milestone.

**Distinct from Daily Challenge:** Quests are multi-step/longer; Daily is one kind act today.

---

## Part V — 🌍 World Explorer

> **Weekly deep-dives** — daily card rotation lives in [Daily Discovery](./BLUE_DON_DAILY_DISCOVERY.md); World Explorer provides featured weekly themes.

```
World Explorer (/discover/world)
Week of March 12, 2027
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Career      Medical Illustrator
🎓 College     West Virginia University
🌍 Country     Japan
🏢 Company     NASA
💡 Invention   3D Printing
✝️ Saint       St. Joseph of Cupertino
🚀 Entrepreneur Sara Blakely
❤️ Organization Habitat for Humanity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

One card per category per week — curated by staff + AI assist. Tap → short article + Opportunity links + What If? bridge.

**Pillar:** Intelligence + Student Success.

---

## Part VI — Hidden Career Paths

> **"I like art" → careers you've never heard of.**

```
I like: art

Did you know?
├── Medical Illustration
├── Courtroom Sketch Artist
├── Theme Park Designer
├── UX Designer
├── Architectural Visualization
└── Automotive Designer

[ Explore with What If? ]  [ Save to Bucket List ]
```

**Integration:** [Opportunity Center](./BLUE_DON_OPPORTUNITY_CENTER.md) What If? engine + interest tags from Journey.

Triggered from: Future Center, Opportunity feed, World Explorer, AI chat.

---

## Part VII — My Mentor

> **Every student knows who is in their corner.**

```
My Mentors (/mentors)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👩‍🏫 Mrs. Smith — Guidance Counselor
👨‍🏫 Mr. Johnson — IT Academy Advisor
🏈 Coach Davis — Football
✝️ Fr. Michael — Campus Minister
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Request meeting ]  [ Send thank-you ]
```

| Mentor type | Examples |
|-------------|----------|
| Guidance Counselor | Assigned |
| Teacher | Student-chosen |
| Coach | Athletics |
| Club Advisor | Org lead |
| Campus Minister | Ministry |
| Principal | Opt-in program |

**Extends:** Blue Don Connect (freshman auto-match) → student adds mentors over time.

---

## Part VIII — Teacher Recommendations

> **Students don't hunt teachers down — everything tracked in Blue Don.**

```
Recommendations (/guidance/recommendations)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Teacher          Purpose           Deadline   Status
Mrs. Jones       Common App        Mar 15     ✅ Completed
Mr. Lee          Scholarship       Apr 1      🔵 In Progress
Coach Davis      Athletic          Mar 20     🟡 Submitted
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Request New Recommendation ]
```

**Workflow:** Student requests → Teacher accepts → Draft → Submit → Student notified.

**Canonical detail:** [Guidance Center](./BLUE_DON_GUIDANCE_CENTER.md) Part VIII — this module surfaces student UX.

---

## Part IX — 💙 Blue Don Legacy (Teacher Notes)

> **Private notes that become part of graduation archive.**

```
Mrs. Jones writes (private):
"Lisa was one of the kindest students I ever taught."
        │
        ▼
Stored in Lisa's graduation archive — NOT public feed
        │
        ▼
Lisa reads at graduation · Parents permitted · Alumni forever
```

| Rule | Detail |
|------|--------|
| **Private** | Never on Community Feed |
| **Teacher-initiated** | Optional — not required |
| **Student consent** | Can hide specific notes (policy) |
| **Archive** | Digital Backpack + Journey + Hall consideration |
| **FERPA** | Educational record — appropriate access only |

---

## Part X — Senior Exit Interview

> **Instead of paperwork — voice and legacy.**

```
Senior Exit Interview (Grade 12 spring)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• What did Madonna mean to you?
• What advice would you give freshmen?
• What are you proud of?
• What are your dreams now?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ Written ]  [ Video (optional) ]
```

Becomes part of:
- Class Legacy page  
- Time Capsule contribution  
- Hall of Legacy nomination packet (optional)  
- Journey graduation chapter  

---

## Part XI — 🏛️ Hall of Legacy

> **Blue Don's signature permanence — every kind of excellence remembered.**

Not just valedictorians and star athletes. The student who volunteered 150 hours. The Chromebook repair master. The kindness that changed a class.

### The halls

```
Hall of Legacy (/halls)
│
├── Service Hall           — 100+ service hours
├── Leadership Hall        — Outstanding leaders
├── Innovation Hall        — Inventors and creators
├── Technology Hall        — IT achievements
├── Broadcasting Hall      — Best productions
├── Athletics Hall         — School records
├── Faith & Service Hall   — Madonna mission exemplars
└── Alumni Hall            — Graduates making a difference
```

### Inductee profile

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HALL OF LEGACY — SERVICE HALL
  Lisa Morris · Class of 2029
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Their story
  Photos & achievements
  Advice to future students
  Where life took them after Madonna
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Induction process

```
Nomination (advisor, admin, self with endorsement)
        │
        ▼
Review committee (faculty)
        │
        ▼
Induction ceremony (spring / graduation)
        │
        ▼
Permanent profile in Hall — alumni can update "where life took me"
```

| Principle | Detail |
|-----------|--------|
| **HL1** | Multiple paths to induction — not GPA-only |
| **HL2** | Alumni Hall — graduates nominated years later |
| **HL3** | Inspires underclassmen — browse halls for role models |
| **HL4** | Replaces trophy case as **living** memory |
| **HL5** | School-agnostic — each tenant configures halls |

> *The quiet volunteer, the Chromebook hero, the JDRCC electrician — all deserve to be remembered.*

---

## Part XII — Navigation

| Surface | Route |
|---------|-------|
| Daily Challenge | `/challenges` + Home OS |
| Character Journey | `/character` |
| Quest Board | `/quests` |
| World Explorer | `/discover/world` |
| Hidden Careers | `/discover/careers` |
| My Mentors | `/mentors` |
| Recommendations | `/guidance/recommendations` |
| Legacy notes (student view) | `/my-journey/legacy` |
| Exit Interview | `/graduation/exit-interview` |
| Hall of Legacy | `/halls` |

**Home OS morning stack:**
```
Good Morning, Lisa 👋
Today's Challenge: Help someone with technology (+50 XP)
Character: Service ████████░░ 78%
🔥 2 Quests available
```

---

## Part XIII — Data Model (Proposed)

```prisma
enum Virtue {
  SERVICE
  LEADERSHIP
  INTEGRITY
  COMPASSION
  CREATIVITY
  COMMUNICATION
  INNOVATION
  FAITH
  PERSEVERANCE
  RESPONSIBILITY
}

model DailyChallenge {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  challengeDate DateTime @map("challenge_date") @db.Date
  prompt      String
  virtues     Virtue[]
  xpReward    Int      @map("xp_reward")
  completedAt DateTime? @map("completed_at")
  reflection  String?
  @@unique([userId, challengeDate])
}

model CharacterProfile {
  id          String   @id @default(cuid())
  userId      String   @unique @map("user_id") @db.Uuid
  virtues     Json     // { SERVICE: 78, LEADERSHIP: 45, ... }
  updatedAt   DateTime @updatedAt
}

model Quest {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  slug        String
  title       String
  tier        Int      // 2-5 stars
  xpReward    Int
  virtueRewards Virtue[]
  criteria    Json     // engine rules
  active      Boolean  @default(true)
}

model QuestProgress {
  id          String   @id @default(cuid())
  questId     String   @map("quest_id")
  userId      String   @map("user_id") @db.Uuid
  status      String   // AVAILABLE, IN_PROGRESS, COMPLETED
  completedAt DateTime?
  @@unique([questId, userId])
}

model WorldExplorerWeek {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  weekStart   DateTime @map("week_start")
  cards       Json     // career, college, country, ...
}

model LegacyNote {
  id          String   @id @default(cuid())
  studentId   String   @map("student_id") @db.Uuid
  authorId    String   @map("author_id") @db.Uuid
  body        String
  visibleToStudent Boolean @default(true) @map("visible_to_student")
  createdAt   DateTime @default(now())
}

model ExitInterview {
  id          String   @id @default(cuid())
  userId      String   @unique @map("user_id") @db.Uuid
  responses   Json
  videoUrl    String?  @map("video_url")
  submittedAt DateTime @map("submitted_at")
}

model HallOfLegacy {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  slug        String   // service, leadership, technology, ...
  name        String
  description String
}

model HallInductee {
  id          String   @id @default(cuid())
  hallId      String   @map("hall_id")
  userId      String   @map("user_id") @db.Uuid
  cohortYear  Int      @map("cohort_year")
  story       String
  mediaIds    String[] @map("media_ids")
  advice      String?
  whereNow    String?  @map("where_now")  // alumni updates
  inductedAt  DateTime @map("inducted_at")
}
```

---

## Part XIV — Engine Integration

| Engine | Hook |
|--------|------|
| **Rewards** | Daily Challenge XP, quest tiers, streaks |
| **Journey** | Virtue profile, exit interview, legacy archive |
| **Notification** | 7 AM challenge, quest complete, hall induction |
| **Intelligence** | Challenge personalization, World Explorer curation, hidden careers |

**Cron:** `daily-challenge-generate` — 6:55 AM per timezone batch.

---

## Part XV — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **19.0** | Daily Challenge + Home OS card |
| **19.1** | Character Journey virtue wheel |
| **19.2** | Quest Board (tier 1–3) |
| **20.0** | World Explorer weekly |
| **20.1** | Hidden Career Paths |
| **20.2** | My Mentor (extend Connect) |
| **21.0** | Legacy Notes + Exit Interview |
| **21.1** | Teacher Recommendations UX (with Guidance) |
| **22.0** | Hall of Legacy — profiles + induction |
| **22.1** | Alumni Hall updates + Epic/Legendary quests |

---

## Part XVI — Design Checklist

1. **Character, not compliance** — Challenges feel like growth, not chores?  
2. **Many paths** — Can non-academic excellence reach a Hall?  
3. **Private legacy** — Teacher notes never leak to feed?  
4. **Dignity** — Virtue chart celebrates, doesn't rank students?  
5. **Mission** — Faith hall honors Madonna's Catholic identity respectfully?

---

*Madonna High School · Blue Don Virtual Campus*  
*Success isn't one path — it's the impact you make and the journey you take.*
