# Daily Discovery

**Learn Something New Every Day · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Students, faculty, Campus Ministry, product, developers  

**Tagline:** *Students open Blue Don because every day there's something new to learn — not just to check homework.*

**Pillar:** Student Success + Intelligence + Student Life (Faith)

**Companion documents:** [Character & Legacy](./BLUE_DON_CHARACTER_AND_LEGACY.md) · [Campus Ministry](./BLUE_DON_CAMPUS_LIFE.md) · [Opportunity Center](./BLUE_DON_OPPORTUNITY_CENTER.md) · [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) · [System Blueprint](./BLUE_DON_SYSTEM_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

**Daily Discovery** updates automatically every morning. Students scroll through bite-sized learning cards — saints, countries, careers, colleges, inventions, vocabulary, history, faith, good news, and money tips.

Completing cards earns small XP rewards. Everything flows into **Today I Learned** — a growing collection that becomes a learning timeline by graduation.

> *Education isn't confined to the classroom.*

**Module 37** · **Route:** `/discover` (primary nav or Home OS section)

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Daily Discovery** | Auto-updated daily learning feed |
| **Discovery Card** | One bite-sized topic with Learn More action |
| **Today I Learned (TIL)** | Personal collection of everything discovered |
| **Catholic Corner** | Faith content for Madonna's mission |
| **Mission of the Week** | Weekly kindness challenge (+100 XP) |
| **Money Minute** | Financial literacy tip |

### vs. Daily Challenge (Module 36)

| Daily Challenge | Daily Discovery |
|-----------------|-----------------|
| **Do** something (character action) | **Learn** something (curiosity) |
| Meet someone, help with tech | Saint of the Day, country fact |
| Virtue wheel growth | TIL collection growth |
| `/challenges` | `/discover` |

**Both appear on Home OS** — Challenge first (action), Discovery second (learn).

### vs. World Explorer (Module 36)

Weekly **World Explorer** deep-dives are absorbed into Daily Discovery's daily rotation. One card per category per day; weekly mission remains in Character & Legacy.

---

## Part II — Daily Discovery Feed

> **Every day Blue Don updates automatically.**

```
/discover
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌅 DAILY DISCOVERY
  Wednesday, July 8, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[scroll cards ↓]
```

### Card catalog

| Card | Icon | Content | XP |
|------|------|---------|-----|
| **Saint of the Day** | ✝️ | Saint, patrons, story, Learn More | +10 |
| **Did You Know?** | 🤔 | Fun fact (tech, science, history) | +10 |
| **Around the World** | 🌎 | Country — population, known for, fun fact | +10 |
| **Innovation Spotlight** | 💡 | Inventor + contributions | +10 |
| **College Spotlight** | 🎓 | College — distance, programs, virtual tour | +10 |
| **Trade Spotlight** | 🔨 | Career/trade — salary, JDRCC path, explore | +10 |
| **Company Spotlight** | 🏢 | Company — what they do, internships | +10 |
| **Word of the Day** | 📚 | Vocabulary + use-in-sentence challenge | +5 |
| **Brain Teaser** | 🧠 | Daily puzzle — reveal tomorrow | +15 |
| **This Day in History** | 📜 | Historical event on today's date | +10 |
| **Catholic Corner** | 💙 | Verse, prayer, feast, liturgical color, Gospel | +10 |
| **Good News** | 🌱 | Positive global story | +5 |
| **Career Fact** | 💼 | Industry stat → Explore Careers | +10 |
| **Money Minute** | 💵 | Financial literacy tip | +5 |

**Not every card every day** — rotate by day-of-week + school calendar. Catholic Corner daily at Madonna.

---

## Part III — Card Examples

### ✝️ Saint of the Day

```
St. Maximilian Kolbe

Patron of: Families · Journalists · Prisoners

Did You Know?
He volunteered to take another man's place in Auschwitz,
giving his life so another could live.

[ Learn More → ]     +10 XP
```

Links: Campus Ministry, Faith virtue (Character Journey).

### 🤔 Did You Know?

```
The first computer bug was actually a real moth
found inside a computer in 1947.

+10 XP for learning something new today.
```

### 🌎 Around the World — Japan

```
🇯🇵 Japan
Population: 123 million
Known for: Technology, Anime, Mount Fuji, Bullet Trains
Fun fact: Japan has over 6,800 islands.
```

### 🎓 College Spotlight — West Liberty University

```
Founded: 1837 · 18 minutes from Madonna
Programs: Education, Business, Nursing, Computer Science
[ Virtual Tour → ]
```

Links: Future Center, Opportunity Center, What If?

### 🔨 Trade Spotlight — Electrician

```
Average salary: $$$$
Education: Apprenticeship · JDRCC Pathway: Available
[ Explore → ]
```

### 🏢 Company Spotlight — NASA

```
Space exploration · Internships available
Fun fact: NASA developed memory foam.
```

### 📚 Word of the Day — Resilience

```
Definition: The ability to recover quickly from challenges.
Challenge: Use this word in a sentence today. (+5 XP)
```

### 🧠 Brain Teaser

```
I speak without a mouth... What am I?
[ Reveal Tomorrow ]     +15 XP if solved today
```

### 💙 Catholic Corner

```
Verse of the Day
Prayer of the Day
Saint of the Day (link)
Catholic Feast Days
Liturgical Color
Daily Reflection
Today's Gospel
```

Reinforces Madonna's Catholic mission naturally — not forced.

### 🌱 Good News

```
A teenager developed a low-cost water filter now helping
villages in Africa.
```

Positive-only — aligns with Community Feed principles.

### 💵 Money Minute

```
If you save $5/week starting at age 15, you'll have over
$13,000 by age 65 without increasing savings.
```

---

## Part IV — Mission of the Week

> **Every week — extends Character Daily Challenge**

```
🌍 Mission of the Week

Perform three Random Acts of Kindness.

Reward: +100 XP · Compassion + Leadership virtue
```

Surfaced at top of `/discover` on Mondays. Tracks via Daily Challenge / kindness posts / advisor confirm.

---

## Part V — ⭐ Today I Learned

> **Every student's growing collection of discoveries.**

```
Today I Learned (/discover/learned)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  By graduation you might have:
  500+ fun facts · 200 saints · 150 careers
  100 colleges/trades · 300 words · 250 history events
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Categories:
✝️ Saints learned about        (47)
🌎 Countries explored          (62)
💼 Careers discovered          (38)
🏛️ Colleges visited virtually  (24)
🔨 Trades explored             (19)
📖 Vocabulary                  (156)
🧠 Fun facts                   (203)
📚 Books recommended           (12)
💡 Inventions learned          (31)
📜 Historical events           (89)
```

### TIL rules

| Rule | Detail |
|------|--------|
| **Auto-track** | Opening card + tapping Learn More = logged |
| **No duplicate XP farm** | One XP award per card per day |
| **Journey link** | TIL counts in Personal Analytics + Year in Review |
| **Export** | Included in Digital Passport summary |
| **Share opt-in** | Student can share favorite TIL to Celebrations |

Becomes proof that **learning happened everywhere** — not only in class.

---

## Part VI — Home OS Integration

```
Good Morning, Lisa 👋
━━━━━━━━━━━━━━━━━━
Today's Challenge: Help someone with technology
━━━━━━━━━━━━━━━━━━
🌅 Daily Discovery — 6 new cards
   ✝️ St. Maximilian Kolbe · 🇯🇵 Japan · 💡 Tesla
   [ Open Discovery → ]
━━━━━━━━━━━━━━━━━━
```

**Hook:** Reason to open Blue Don daily beyond homework.

---

## Part VII — Content Management

| Role | Responsibility |
|------|----------------|
| **Admin** | Master calendar, approve custom cards |
| **Campus Ministry** | Catholic Corner, saints |
| **Guidance** | College/trade spotlights (local focus) |
| **Broadcasting** | Media for college tours, good news video |
| **AI assist** | Draft cards; human approve before publish |

### Content sources

| Card | Source |
|------|--------|
| Saint | Liturgical calendar API + curated |
| Country | Static dataset + rotation |
| College | Local + student interest weighted |
| Career/Trade | BLS + JDRCC catalog + What If? |
| History | On-this-day API |
| Good news | Curated RSS / manual |
| Catholic | USCCB daily readings, campus ministry |

**School-agnostic:** Tenant configures Catholic Corner on/off; local colleges per school.

---

## Part VIII — Data Model (Proposed)

```prisma
enum DiscoveryCardType {
  SAINT
  DID_YOU_KNOW
  COUNTRY
  INNOVATION
  COLLEGE
  TRADE
  COMPANY
  WORD
  BRAIN_TEASER
  HISTORY
  CATHOLIC_CORNER
  GOOD_NEWS
  CAREER_FACT
  MONEY_MINUTE
}

model DiscoveryCard {
  id          String            @id @default(cuid())
  schoolId    String            @map("school_id")
  type        DiscoveryCardType
  displayDate DateTime          @map("display_date") @db.Date
  title       String
  body        Json              // structured card fields
  xpReward    Int               @default(10) @map("xp_reward")
  deepLink    String?           @map("deep_link")
  active      Boolean           @default(true)
  @@unique([schoolId, type, displayDate])
}

model DiscoveryInteraction {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  cardId      String   @map("card_id")
  action      String   // VIEWED, LEARNED, COMPLETED_CHALLENGE
  xpAwarded   Int      @default(0) @map("xp_awarded")
  createdAt   DateTime @default(now())
  @@unique([userId, cardId, action])
}

model TodayILearnedEntry {
  id          String            @id @default(cuid())
  userId      String            @map("user_id") @db.Uuid
  category    DiscoveryCardType
  title       String
  cardId      String?           @map("card_id")
  learnedAt   DateTime          @default(now()) @map("learned_at")
}

model WeeklyMission {
  id          String   @id @default(cuid())
  schoolId    String   @map("school_id")
  weekStart   DateTime @map("week_start")
  prompt      String
  xpReward    Int      @default(100)
  virtueKeys  String[] @map("virtue_keys")
}
```

---

## Part IX — Engine Integration

| Engine | Hook |
|--------|------|
| **Rewards** | Card XP, Mission of the Week, brain teaser bonus |
| **Journey** | TIL timeline entries; Year in Review "facts learned" |
| **Intelligence** | Card rotation personalization (career interests) |
| **Notification** | Optional 7:15 AM "6 new discoveries" (after Daily Challenge) |

**Cron:** `discovery-cards-publish` — midnight generate/activate daily set.

---

## Part X — Navigation

| Placement | Route |
|-----------|-------|
| Primary nav | **Discover** `/discover` |
| TIL collection | `/discover/learned` |
| Catholic Corner detail | `/discover/faith` |
| Home OS | Card stack teaser |

---

## Part XI — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **18.0** | Discovery shell + 3 card types (Saint, Did You Know, Country) |
| **18.1** | TIL collection + XP awards |
| **18.2** | College + Trade + Career Fact cards |
| **18.3** | Catholic Corner full |
| **19.0** | Word, History, Brain Teaser, Money Minute |
| **19.1** | Good News + Company + Innovation |
| **19.2** | Mission of the Week |
| **19.3** | Home OS integration + push |
| **20.0** | Content admin UI + AI draft assist |

---

## Part XII — Design Checklist

1. **Curiosity** — Would a student open this without a grade attached?  
2. **Brief** — Each card < 30 seconds to read?  
3. **Faith** — Catholic Corner natural, not preachy?  
4. **Positive** — Good News only; no doom-scrolling?  
5. **Connected** — Learn More links to Opportunity/Future Center?  
6. **Tracked** — Does TIL prove growth by graduation?

---

*Madonna High School · Blue Don Virtual Campus*  
*Daily Discovery — Something new to learn, every single day.*
