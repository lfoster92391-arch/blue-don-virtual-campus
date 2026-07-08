# Campus Life

**School Culture & Living Campus · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Students, faculty, student life staff, product, developers  

**Tagline:** *This is everything happening around Madonna that isn't a class.*

**Pillar:** Student Life (see [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md))

**Companion documents:** [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) · [Broadcasts](./BLUE_DON_BROADCASTS.md) · [System Blueprint](./BLUE_DON_SYSTEM_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Campus Life is the module that makes Blue Don feel like a **real campus** — not a collection of tools. It is the **culture layer**: what's happening today, school traditions, celebrations, spirit competition, live broadcasts, and the pulse of Madonna.

> **Not just events. The culture of the school.**

Campus Life powers the **"TODAY AT MADONNA"** block on Blue Don OS Home and gives every tradition — Homecoming, Spirit Week, Prom, Graduation — a permanent home that **remembers** year after year.

**Module 34** · **Route:** `/campus-life` (primary nav)

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Campus Life** | Culture hub — today, traditions, celebrations, spirit |
| **Today at Madonna** | Daily digest on Home OS — events, weather, lunch, meetings |
| **Tradition Hub** | Persistent pages for Homecoming, Spirit Week, Prom, Graduation |
| **Spirit Points** | **Group** competition points — separate from individual XP |
| **Blue Don Live** | School live channel — announcements, sports, Mass, graduation |
| **Student Voice** | Moderated polls — themes, charities, merchandise |
| **Photo of the Day** | Broadcasting-owned daily hero image on Home |
| **Ask Around Campus** | AI answers using live school data |

### Distinction from other modules

| Module | Campus Life | Elsewhere |
|--------|-------------|-----------|
| Events | Culture + tradition context | Event Hub = create/publish engine |
| Community Feed | Celebrations surface | Feed = social posts |
| Student Life | Org workspaces | Campus Life = school-wide culture |
| Rewards | Spirit Points (groups) | XP/Coins = individuals |

---

## Part II — What's Happening Today?

> **Every morning is different.**

Powers the **Blue Don OS** daily card stack:

```
Good Morning, Lisa 👋
━━━━━━━━━━━━━━━━━━━━━━━━━━
TODAY AT MADONNA

🏈 Football vs. Central        7:00 PM
🎤 Guest Speaker — Cybersec    10:30 AM
❤️ Service — Library Setup    2 hours
🎭 Drama Practice              3:15 PM
📢 Senior Meeting              2:45 PM
🍕 Pizza Lunch Today
🌦 74° Sunny
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

| Data source | Card |
|-------------|------|
| Event Hub | Games, meetings, practices, speakers |
| Service Center | Volunteer opportunities |
| School Hub | Lunch menu |
| Weather API | Local forecast |
| Broadcasts | Priority announcements |
| Campus Life | Photo of the Day banner |

**Aggregation service:** `campus-life-service.getTodayDigest(userId)` — role and grade filtered.

---

## Part III — 🎉 School Traditions

> **Instead of events disappearing — Blue Don remembers them.**

Each major tradition is a **persistent Tradition Hub** — archived year over year.

### Homecoming

```
/campus-life/homecoming
│
├── Countdown
├── Schedule
├── Court (nominees, voting)
├── Photos & Videos (by year)
├── Spirit Points leaderboard
├── King & Queen
└── Past Winners (archive)
```

### Spirit Week

```
/campus-life/spirit-week
│
├── Daily themes (Mon–Fri)
│   ├── Monday — Pajama Day
│   ├── Tuesday — Twin Day
│   ├── Wednesday — Class Colors
│   ├── Thursday — Throwback
│   └── Friday — Blue & Gold
├── Participation check-in (Blue Don ID / self-report)
├── XP for participating
└── Spirit Points for class/org
```

### Prom

```
/campus-life/prom
│
├── Buy Tickets (Wallet)
├── Vote Court
├── Photo Gallery
├── Dinner Menu
├── Seating (post-assignment)
├── Countdown
├── After Prom
└── Memories (archive)
```

### Graduation Headquarters

```
/campus-life/graduation
│
├── Countdown
├── Senior Checklist (links Journey)
├── Caps & Gowns
├── Practice Schedule
├── Tickets (Wallet)
├── Photos
├── Live Stream (Blue Don Live)
├── Digital Program
└── Graduate Profiles
```

**Not one page** — a full headquarters for the graduating class.

---

## Part IV — 🎂 Birthday Center

```
/campus-life/birthdays
│
├── Today's Birthdays
│   ├── Students (opt-in)
│   ├── Teachers
│   └── Staff
└── Send celebration (positive reaction only)
```

| Privacy rule | Detail |
|--------------|--------|
| **Opt-in** | Students choose birthday visibility |
| **No age** | Display name only unless student shares |
| **Celebrations** | Feed into Celebrations hub — no DMs |

---

## Part V — 🥳 Celebrations

> **Everything positive.**

```
/campus-life/celebrations
│
├── Congratulations
├── Birthdays
├── Work Anniversaries
├── Teacher Appreciation
├── Student Awards
├── New Club Officers
├── National Recognition
├── Scholarships
└── Accepted Colleges
```

Auto-populated from Journey milestones, broadcasts, Community rules. Moderated positive-only (Constitution Article VII).

---

## Part VI — 🌎 Community Calendar

> **Not just Madonna — the wider community.**

```
/campus-life/community
│
├── Church festivals
├── Parish events
├── Local volunteer opportunities
├── Career fairs
├── Community cleanups
├── Food drives
└── Blood drives
```

External events with `source: COMMUNITY`. Optional RSVP. Links to Service Center volunteer sign-up.

---

## Part VII — 💡 Suggest an Event

Students shape campus life:

```
"I'd like to organize a Coding Night."
        │
        ▼
Submit → Blue Don Request (SUGGEST_EVENT)
        │
        ▼
Advisor reviews → Administration approves
        │
        ▼
Event created in Event Hub → appears in Campus Life
```

---

## Part VIII — 📷 Campus Photo of the Day

Large hero banner on **Home OS** — changes daily.

| Rule | Detail |
|------|--------|
| **Owner** | Broadcasting Academy students |
| **Workflow** | Upload → advisor approve → publish |
| **Credit** | Photographer name on banner |
| **Portfolio** | Auto-adds to student photographer portfolio |
| **Archive** | Memory Vault + Media Center |

Gives Broadcasting students **ownership of the platform's visual identity**.

---

## Part IX — 🗳 Student Voice

Safe, moderated polls:

| Poll type | Examples |
|-----------|----------|
| Spirit Week theme vote | Pajama vs. Decades day |
| Homecoming music | Song choices |
| Guest speaker suggestions | Shortlist vote |
| Charity selection | Service project beneficiary |
| Merchandise | Blue Don Corner designs |

```
Admin creates poll → Students vote → Transparent results → Optional broadcast of outcome
```

**Not a debate forum** — structured choices only. Administration controls available polls.

---

## Part X — 🏅 Spirit Points

> **Separate from XP. Rewards groups, not just individuals.**

> **October School Spirit Month:** [Campus Challenges](./BLUE_DON_CAMPUS_CHALLENGES.md) drives seasonal spirit competitions and live leaderboards.

| Group type | Examples |
|------------|----------|
| Class | Class of 2029 |
| Club | IT Club, NHS, Broadcasting |
| Team | Football |

```
Spirit Standings
🥇 Class of 2027     12,450
🥈 Class of 2028     11,890
🥉 Class of 2029     10,340
   Class of 2030      9,870
```

### Spirit vs. XP

| | **Spirit Points** | **XP** |
|---|-------------------|--------|
| **Unit** | Group (class, club, team) | Individual |
| **Earned** | Homecoming, Spirit Week, school-wide events | Personal attendance, modules, service |
| **Leaderboard** | Class standings, org standings | Individual / academy |
| **Spend** | Bragging rights, tradition perks | Coins, shop |

Points earned through **verified participation** at tradition events (QR check-in, advisor confirm).

---

## Part XI — 📺 Blue Don Live

School live channel — embedded on Home and `/campus-life/live`:

| Stream type | Examples |
|-------------|----------|
| Morning Announcements | Daily show |
| Athletics | Football, basketball |
| Pep rallies | Homecoming |
| Graduation | Commencement |
| School Mass | Campus Ministry |
| Guest speakers | Auditorium |
| Talent shows & concerts | Fine arts |
| Special announcements | Principal |

Integrates: Broadcasting Operations, Media Center replay archive.

---

## Part XII — 📍 Campus Map

Interactive map — tap building or room:

| Info shown | Source |
|------------|--------|
| What's happening today | Event Hub (location filter) |
| Upcoming events | Calendar |
| Available spaces | Equipment Reservations |
| Photos | Media Center |
| Accessibility | School Hub static data |

**Ask Around Campus** (AI) uses map + schedule data:

```
"Where's the Robotics meeting?"     → Room 204, 3:15 PM
"What time does Mass start?"        → Chapel, 9:00 AM
"When is lunch?"                    → Cafeteria, 11:30–12:30
"Who's speaking today?"             → Guest speaker card
"Where is Room 204?"                → Map pin + directions
```

**AI scope:** Campus Life + School Hub + Event Hub — no grades, no health data (Constitution Article X).

---

## Part XIII — Navigation & Integration

```
Campus Life (/campus-life)
│
├── Today                     ← daily digest (also on Home OS)
├── Traditions
│   ├── Homecoming
│   ├── Spirit Week
│   ├── Prom
│   └── Graduation HQ
├── Birthdays
├── Celebrations
├── Community Calendar
├── Suggest an Event
├── Spirit Standings
├── Blue Don Live
├── Campus Map
└── Student Voice (active polls)
```

| Feeds from | Feeds to |
|------------|----------|
| Event Hub | Today, traditions, map |
| Broadcasts | Announcements, live alerts |
| Journey | Celebrations, milestones |
| Rewards | XP (individual) + Spirit (group) |
| Blue Don ID | Check-in at spirit events |
| Media Center | Photo of the Day, galleries |
| Blue Don AI | Ask Around Campus |

---

## Part XIV — Data Model (Proposed)

```prisma
model TraditionHub {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  slug        String   // homecoming, spirit-week, prom, graduation
  schoolYear  Int      @map("school_year")
  config      Json     // themes, court, countdown date
  archiveFlag Boolean  @default(false)
  @@unique([schoolId, slug, schoolYear])
}

model SpiritPointsLedger {
  id          String   @id @default(cuid())
  groupType   String   @map("group_type")  // CLASS, ORG, TEAM
  groupId     String   @map("group_id")
  points      Int
  reason      String
  eventId     String?  @map("event_id")
  schoolYear  Int      @map("school_year")
  createdAt   DateTime @default(now())
}

model CampusPoll {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  title       String
  options     Json
  status      String   // DRAFT, OPEN, CLOSED
  resultsPublic Boolean @default(true)
  opensAt     DateTime
  closesAt    DateTime
}

model PhotoOfTheDay {
  id          String   @id @default(cuid())
  mediaId     String   @map("media_id")
  photographerId String @map("photographer_id") @db.Uuid
  displayDate DateTime @unique @map("display_date")
  approvedById String? @map("approved_by_id") @db.Uuid
}

model CommunityEvent {
  id          String   @id @default(cuid())
  title       String
  location    String?
  startsAt    DateTime
  source      String   @default("COMMUNITY")
  externalUrl String?  @map("external_url")
}
```

---

## Part XV — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **17.5** | Campus Life shell + Today digest |
| **18.0** | Photo of the Day + Celebrations feed |
| **18.1** | Spirit Points ledger |
| **18.2** | Student Voice polls |
| **19.0** | Tradition Hub — Homecoming + Spirit Week |
| **19.1** | Prom + Graduation HQ |
| **19.2** | Blue Don Live embed |
| **20.0** | Campus Map + Ask Around Campus AI |
| **20.1** | Community Calendar + Suggest Event |
| **20.2** | Birthday Center |

---

*Madonna High School · Blue Don Virtual Campus*  
*Campus Life — The culture of the school.*
