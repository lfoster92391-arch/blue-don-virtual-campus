# Blue Don Campus Challenges

**Monthly · Seasonal · School-Wide · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Students, faculty, families, student life staff, product, developers  

**Tagline:** *Every month, Madonna comes together — students check Blue Don because they don't want to miss what's next.*

**Pillar:** Student Life + Student Success

**Companion documents:** [Character & Legacy](./BLUE_DON_CHARACTER_AND_LEGACY.md) · [Campus Life](./BLUE_DON_CAMPUS_LIFE.md) · [Daily Discovery](./BLUE_DON_DAILY_DISCOVERY.md) · [Rewards](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [System Blueprint](./BLUE_DON_SYSTEM_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

**Blue Don Campus Challenges** rotate every month — kindness, spirit, gratitude, giving, goals, wellness, careers, earth, finish strong — plus summer adventures. Students compete as individuals, classes, clubs, and as one school.

**Mystery Challenge** drops every Monday. **Flash Challenges** appear without warning. **Monthly Champion Banners** crown heroes on the homepage. **Blue Don Seasons** organize the year into four themed arcs.

> *Not because they have to — because they don't want to miss what's happening.*

**Module 38** · **Routes:** `/challenges/campus`, `/challenges/mystery`, `/seasons`

**Distinct from:**
- **Daily Challenge** (Module 36) — one personal virtue mission per day  
- **Daily Discovery** (Module 37) — learn something new  
- **Quest Board** (Module 36) — evergreen tiered quests  

---

## Part I — Blue Don Seasons

> **The year isn't disconnected months — it's four seasons.**

```
Blue Don Seasons
│
├── 🍂 Fall of Service      (Sep–Nov)
│   Kindness · Spirit · Gratitude
│
├── ❄️ Winter of Growth     (Dec–Feb)
│   Giving · Goals · Healthy Habits
│
├── 🌱 Spring of Discovery  (Mar–May)
│   Careers · Earth · Finish Strong
│
└── ☀️ Summer of Adventure  (Jun–Aug)
    Reading · Community · Exploration
```

| Season | Visual theme | Badge set | Soundtrack (optional) |
|--------|--------------|-----------|------------------------|
| Fall of Service | Warm amber, leaves | Kindness, Spirit, Gratitude | Optional ambient |
| Winter of Growth | Cool blue, snow | Giving, Goals, Wellness | Optional ambient |
| Spring of Discovery | Green, bloom | Career, Earth, Finish | Optional ambient |
| Summer of Adventure | Bright sun, travel | Adventure, Family, Explore | Optional ambient |

Season wraps UI skin (subtle), season pass progress bar, and champion hall for the season.

---

## Part II — Monthly Challenge Calendar

### ❤️ September — Kindness Month

**Individual:** Perform 5 verified Random Acts of Kindness.

| Example acts |
|--------------|
| Help carry books |
| Sit with someone new at lunch |
| Write a thank-you note |
| Help a teacher |
| Welcome a new student |

**Rewards:** +250 XP · Kindness Badge

**Competitions:**
- **Class** — Which graduating class completes the most verified acts?
- **Club** — Which club performs the most community service?

### 💙 October — School Spirit Month

Earn spirit points for:
- Wearing school colors
- Attending games & pep rallies
- Decorating classrooms
- Spirit Week participation
- Supporting clubs

**Live leaderboard** — integrates [Campus Life](./BLUE_DON_CAMPUS_LIFE.md) Spirit Points.

### 🧡 November — Gratitude Month

| Challenge |
|-----------|
| Write five thank-you messages |
| Recognize a teacher |
| Recognize staff |
| Volunteer |
| Donate canned food |

**Parents can participate** — Community Challenge type.

### 🎄 December — Christmas Giving

| Activity |
|----------|
| Toy drive |
| Angel Tree |
| Christmas cards for nursing homes |
| Church service |
| Christmas concert |
| Broadcast Christmas program |

Links: Campus Ministry, Broadcasting Operations, Service Center.

### 💚 January — New Year Goals

Students update in My Journey:
- Goals · Career interests · Resume · About Me  
- Health goals · Academic goals  

**Reflection month** — not competitive; completion XP + Journey milestone.

### 💜 February — Healthy Habits

| Habit |
|-------|
| Drink water |
| Walk |
| Read 20 minutes |
| Reduce screen time |
| Mental wellness check-in |
| Acts of encouragement |

### 🌎 March — Career Discovery

Explore:
- 10 careers · 3 colleges · 2 trade schools  
- JDRCC · Military options  
- Attend one career event  

Integrates: [Opportunity Center](./BLUE_DON_OPPORTUNITY_CENTER.md), Future Center, What If?

### 🌸 April — Earth Month

| Activity |
|----------|
| Campus cleanup |
| Plant flowers |
| Recycling challenge |
| Beautification Club |
| Community cleanup |

### 🎓 May — Finish Strong

| Focus |
|-------|
| Turn in all assignments |
| Attend review sessions |
| Help classmates |
| Celebrate seniors |
| Teacher appreciation |

### ☀️ Summer (June–August)

The app doesn't stop.

| Summer challenges |
|-------------------|
| Read a book |
| Volunteer |
| Visit a museum |
| Tour a college |
| Shadow a career |
| Family activities |

---

## Part III — Challenge Types

| Type | Scope | Example |
|------|-------|---------|
| **Individual** | One student | 5 acts of kindness |
| **Class** | Graduating class | Class of 2029 vs 2028 |
| **Club** | Organization | IT Club vs NHS |
| **House** | House system (optional) | Gryffindor vs Hufflepuff |
| **School-wide** | Entire Madonna | "5,000 volunteer hours this year → principal reward" |
| **Classroom** | Teacher opt-in | Math homework week — doesn't interrupt instruction |
| **Community** | Families | Visit museum together, attend Mass |
| **Business** | Local partners | Visit library, JDRCC open house, local parade |

### Classroom Challenges (teacher opt-in)

| Subject | Example |
|---------|---------|
| Math | Complete all homework this week |
| English | Read 100 pages |
| Science | Participate in class discussions |
| Religion | Daily reflection |
| History | Daily trivia |

Students earn **classroom XP** — scoped to class org, not global leaderboard shame.

### Community Challenges (families)

- Visit local museum · Attend Mass together · Volunteer · Nursing home · Clean a park · Support local business

Parent Portal participation counts toward family badge.

### Business Challenges (local discovery)

- Public Library · JDRCC Open House · Brooke-Hancock Family Resource Network · Weirton Christmas Parade · College open house

Students discover their community — ties to Opportunity Center local ops.

---

## Part IV — ⚡ Flash Challenge

> **Blue Don randomly drops one — complete today.**

```
⚡ FLASH CHALLENGE
Hold the door open for three people.
Reward: +50 XP
Expires: Tonight at midnight
```

Push notification + Home OS banner. Unpredictable delight.

---

## Part V — 🎁 Mystery Challenge (Monday)

> **Every Monday — an envelope. Students open Blue Don because they're curious.**

```
🎁 MYSTERY CHALLENGE
        [ envelope ]
         Open?

           YES
```

**Could be:**
- Introduce yourself to someone you don't know  
- Thank a staff member today  
- Attend one event you've never attended before  

| Rule | Detail |
|------|--------|
| **MC1** | Revealed only on open — not spoiled in push text |
| **MC2** | New every Monday 7:00 AM |
| **MC3** | +75 XP typical · streak for 4 Mondays in a month |
| **MC4** | Contributes to monthly challenge progress where applicable |

**Addictive hook:** Monday morning ritual.

---

## Part VI — 🎖 Monthly Champion Banner

> **Not just leaderboards — crowned champions on the homepage all month.**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SEPTEMBER CHAMPIONS — KINDNESS MONTH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Most Active Student      Lisa Morris
🏆 Most Active Club         IT Club
🏆 Most Active Class        Class of 2029
🏆 Most Active Teacher      Mrs. Jones
🏆 Most Service Hours       Football Team
🏆 Kindness Champion        Sarah Chen
🏆 School Spirit Champion   (October)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Champions receive:
- Homepage banner (all month)  
- Hall of Legacy consideration  
- Special badge  
- Optional principal shout-out broadcast  

---

## Part VII — Verification & Fair Play

| Challenge type | Verification |
|----------------|--------------|
| Kindness acts | Peer confirm OR advisor spot-check OR honor + reflection |
| Spirit events | Blue Don ID QR check-in at game/pep rally |
| Service | Service Center supervisor approval |
| Classroom | Teacher marks complete in class roster |
| Community | Parent attestation + photo optional |
| Business visit | QR at partner location or geo check-in |

**Anti-gaming:** Rate limits, duplicate detection, audit on suspicious patterns.

---

## Part VIII — Navigation & Surfaces

```
/challenges
├── Daily          → Module 36 Daily Challenge
├── Campus         → Monthly + seasonal (this module)
├── Mystery        → Monday envelope
├── Flash          → Active flash (if any)
├── Leaderboards   → Class, club, spirit, season
└── Champions      → Hall of monthly winners

/seasons           → Current season theme + progress
```

**Home OS:**
```
🍂 Fall of Service — Kindness Month
❤️ 3/5 kindness acts complete
🎁 Mystery Challenge — OPEN?
⚡ Flash Challenge active!
```

---

## Part IX — Data Model (Proposed)

```prisma
enum ChallengeScope {
  INDIVIDUAL
  CLASS
  CLUB
  HOUSE
  SCHOOL
  CLASSROOM
  COMMUNITY
  BUSINESS
}

enum Season {
  FALL_OF_SERVICE
  WINTER_OF_GROWTH
  SPRING_OF_DISCOVERY
  SUMMER_OF_ADVENTURE
}

model CampusChallengeMonth {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  month       Int      // 1-12
  slug        String   // kindness-month, spirit-month
  title       String
  season      Season
  config      Json     // tasks, thresholds, competitions
  year        Int
  @@unique([schoolId, year, month])
}

model CampusChallengeTask {
  id          String   @id @default(cuid())
  monthId     String   @map("month_id")
  title       String
  scope       ChallengeScope
  xpReward    Int
  badgeKey    String?
  criteria    Json
}

model ChallengeParticipation {
  id          String   @id @default(cuid())
  taskId      String   @map("task_id")
  userId      String?  @map("user_id") @db.Uuid
  groupType   String?  @map("group_type")  // CLASS, CLUB, ...
  groupId     String?  @map("group_id")
  status      String   // IN_PROGRESS, COMPLETED, VERIFIED
  evidence    Json?
  completedAt DateTime?
}

model MysteryChallenge {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  weekStart   DateTime @map("week_start")
  prompt      String   // hidden until open
  xpReward    Int      @default(75)
}

model FlashChallenge {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  prompt      String
  xpReward    Int
  startsAt    DateTime
  expiresAt   DateTime
}

model MonthlyChampion {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  year        Int
  month       Int
  category    String   // ACTIVE_STUDENT, KINDNESS, ...
  winnerType  String   // USER, ORG, CLASS
  winnerId    String
  featuredUntil DateTime @map("featured_until")
}
```

---

## Part X — Engine Integration

| Engine | Hook |
|--------|------|
| **Rewards** | XP, badges, spirit points, season badges |
| **Journey** | Monthly milestones, champion archive |
| **Broadcast** | School-wide goal announcements, champion reveals |
| **Notification** | Monday mystery, flash drops, month start |
| **Identity** | QR verification at events |
| **Campus Life** | Spirit Month ↔ Spirit Points leaderboard |

**Cron:**
- `monthly-challenge-activate` — 1st of month  
- `mystery-challenge-publish` — Monday 7 AM  
- `monthly-champions-compute` — last day of month  
- `season-theme-rotate` — season boundaries  

---

## Part XI — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **19.0** | Season framework + monthly challenge shell |
| **19.1** | September Kindness Month (individual + class/club) |
| **19.2** | October Spirit + live leaderboard |
| **19.3** | Mystery Challenge (Monday) |
| **20.0** | Full monthly calendar (Nov–May) |
| **20.1** | Flash Challenges |
| **20.2** | Monthly Champion Banners |
| **20.3** | Classroom + Community challenge types |
| **21.0** | Summer challenges + Business challenges |
| **21.1** | Parent participation + House scope |

---

## Part XII — Design Checklist

1. **Fresh** — Does each month feel different?  
2. **Inclusive** — Non-athletes can win kindness/service champions?  
3. **Family** — Can parents join without student embarrassment?  
4. **Monday hook** — Is Mystery Challenge worth opening the app?  
5. **Seasons** — Does Fall/Winter/Spring/Summer tell a story?  
6. **No shame** — Classroom XP additive, not public failure?

---

*Madonna High School · Blue Don Virtual Campus*  
*Campus Challenges — Every month, Madonna comes together.*
