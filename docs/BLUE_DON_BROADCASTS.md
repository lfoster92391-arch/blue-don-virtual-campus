# Blue Don Broadcasts

**Campus Communications System · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Product owners, faculty, student leadership, developers  

**Companion documents:** [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Blue Don Broadcasts is the **official communication system** for Madonna High School — not a generic announcement tool, not email blasts, not unrestricted class-wide posting.

Every message is a **broadcast**. Every broadcast has an **audience**. Every audience requires **permission**. School-wide and high-reach broadcasts require **advisor approval** before they go live.

> **Don't call them announcements. Call them Blue Don Broadcasts.**

This ties directly into the Broadcasting Academy, reinforces campus brand identity, and teaches student leaders real-world communications skills: clear writing, correct targeting, and responsible approval workflows — the same patterns used in colleges, businesses, and media organizations.

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Blue Don Broadcast** | Any official campus message — school, grade, org, athletics, service, academic |
| **Audience** | One or more targeted groups who receive the broadcast |
| **Broadcaster** | A user with permission to create broadcasts for specific audiences |
| **Approver** | Advisor, admin, or designated staff who must approve before publish (when required) |
| **Campus Ticker** | Live scrolling headline bar — ESPN-style — across the top of Blue Don |
| **Leadership Center** | Roster of student leaders whose positions unlock broadcast permissions |

### Broadcast branding by domain

Every message becomes a broadcast with a domain label:

| Label | Example audience |
|-------|------------------|
| 📢 **School Broadcast** | Entire school |
| 🎓 **Senior Broadcast** | Grade 12 |
| 🏈 **Athletics Broadcast** | Team, athletics families |
| 💻 **IT Broadcast** | IT Club members |
| ❤️ **Service Broadcast** | Service volunteers |
| 🎭 **Drama Broadcast** | Drama club |
| 📚 **Academic Broadcast** | Class, department, grade |

Communications feel like part of the **campus experience** — not another notification system.

---

## Part II — Audience Types

Every broadcast targets **one or many audiences**. Recipients only see broadcasts aimed at audiences they belong to.

### School-wide audiences

| Audience | Icon | Who receives |
|----------|------|--------------|
| Entire School | 📢 | All campus-authenticated users |
| Parents | 👨‍👩‍👧 | Linked parent accounts |
| Faculty | 👩‍🏫 | Teachers, advisors, counselors |
| Administration | 👨‍💼 | Admin, staff with admin access |

### Grade-level audiences

| Audience | Icon | Who receives |
|----------|------|--------------|
| Seniors | 👨‍🎓 | Grade 12 students |
| Juniors | 👩‍🎓 | Grade 11 students |
| Sophomores | 👧 | Grade 10 students |
| Freshmen | 👦 | Grade 9 students |

*Middle school grades (7–8) follow the same pattern when enrolled.*

### Organization audiences

| Audience | Icon | Who receives |
|----------|------|--------------|
| Athletics (all) | 🏈 | All athletics org members + coaches |
| Specific team | 🏈 | e.g., Football — team members + families (configurable) |
| Club | 💻 | e.g., IT Club — active members only |
| Academy | 🎥 | e.g., Broadcasting Academy members |
| Class | 🎓 | e.g., Class of 2029 — class org members |
| NHS | ⭐ | National Honor Society members |

### Composite targeting

One broadcast can target **multiple audiences**:

```
Senior Class Meeting
Audiences: [ Seniors, Student Council Officers ]
```

```
Football Game Tonight
Audiences: [ Football, Cheer, Band, Broadcasting, Athletics Parents ]
```

**No spam.** Users never receive broadcasts outside their audiences.

---

## Part III — Student Leadership Center

> **A new module — leadership positions unlock communication tools appropriate to their role.**

Instead of giving every senior unrestricted broadcast access, Blue Don grants permissions to **named leadership positions**.

```
Student Leadership Center (/leadership)
│
├── Student Council
├── Class Officers
│   ├── President
│   ├── Vice President
│   └── Secretary
├── Club Presidents
├── NHS Officers
├── Team Captains
├── Peer Mentors
└── Broadcast Permissions (per position)
```

### Leadership roster

| Position type | Example | Typical broadcast scope |
|---------------|---------|-------------------------|
| **Class President** | Senior Class President | Senior class audience |
| **Class Vice President** | Senior VP | Senior class (co-broadcaster) |
| **Class Secretary** | Senior Secretary | Senior class (co-broadcaster) |
| **Class Advisor** | Mrs. Smith | Approve senior class broadcasts |
| **Club President** | IT Club President | IT Club members only |
| **Club Director** | Broadcasting Director | Broadcasting org only |
| **Team Captain** | Football Captain | Football team (+ configured groups) |
| **Student Council** | Council officers | School-wide (with approval) |
| **NHS Officers** | NHS President | NHS members |

### Permission principle

| Rule | Detail |
|------|--------|
| **LP1** | Permissions attach to **positions**, not grade levels. |
| **LP2** | A student holds a position for a **term** (semester / school year). |
| **LP3** | When term ends, broadcast permissions **revoke automatically**. |
| **LP4** | Advisors are **approvers**, not broadcasters (unless also staff). |
| **LP5** | One student may hold multiple positions — permissions **union**. |

**Status:** Planned — Module 28 (Leadership Center). Schema: `LeadershipPosition`, `LeadershipAssignment`.

---

## Part IV — Who Can Broadcast

### School-wide emergency (Critical priority only)

Only designated staff can send **Critical** broadcasts to Entire School with instant push:

| Role | Can send Critical |
|------|-------------------|
| Principal | ✔ |
| Assistant Principal | ✔ |
| Main Office | ✔ |
| Athletic Director | ✔ (athletics-related Critical) |
| IT Administrator | ✔ (system/safety Critical) |

```
🚨 Early Dismissal — Weather Delay — Bus Change — Safety Notification
→ Instant push notification to all targeted audiences
```

### School-wide non-emergency

| Broadcaster | Approval required |
|-------------|-------------------|
| Principal / Admin | Optional (self-publish) |
| Student Council officers | **Yes** — faculty advisor |
| Teachers | Department or school (policy-gated) |

### Grade / class broadcasts

| Broadcaster | Audience | Approval |
|-------------|----------|----------|
| Senior Class President | Seniors | **Class Advisor** (Mrs. Smith) |
| Senior VP / Secretary | Seniors | **Class Advisor** |
| Junior Class President | Juniors | Class Advisor |
| Class Advisor | Their class | Self-publish |

### Club / team broadcasts

| Broadcaster | Audience | Approval |
|-------------|----------|----------|
| Club President | Club members only | Club advisor (optional by org config) |
| Broadcasting Director | Broadcasting org | Academy advisor |
| Football Coach | Football + configured groups | Self-publish (coach role) |
| Team Captain | Team members | Coach approval (configurable) |

**Example — Senior Class:**

```
📢 SENIOR CLASS BROADCAST

Senior Class Meeting
Today · 2:45 PM · Auditorium
Attendance Required

Posted by:    Senior Class President
Approved by:  Mrs. Smith (Senior Class Advisor)

→ Appears only to seniors.
```

**Example — IT Club:**

```
💻 IT BROADCAST

Hackathon signup closes Friday.
→ Appears only to IT Club members.
→ Posted by: IT Club President.
```

---

## Part V — Approval Workflow

> **For broadcasts that reach the entire school — or any audience configured as approval-required:**

```
Student creates broadcast (DRAFT)
        │
        ▼
Select audience(s) + priority level
        │
        ▼
Submit for approval (PENDING)
        │
        ├── Advisor rejects → Returned with feedback (never published)
        │
        └── Advisor approves (APPROVED)
                │
                ▼
        Published (LIVE)
                │
                ▼
        Fan-out to surfaces (see Part IX)
```

### Approval rules

| Rule | Detail |
|------|--------|
| **AW1** | No advisor approval → **never goes live** (for approval-required audiences). |
| **AW2** | Approver must hold `broadcasts:approve` for that audience scope. |
| **AW3** | Rejection requires **feedback note** to the student broadcaster. |
| **AW4** | Edits after approval → returns to **PENDING** unless minor (typo fix — admin config). |
| **AW5** | Critical school-wide broadcasts → **staff only**; no student approval path. |
| **AW6** | Audit log: who created, who approved, when published, audience snapshot. |

### Workflow states

```
DRAFT → PENDING → APPROVED → PUBLISHED → ARCHIVED
              ↘ REJECTED → DRAFT (revise and resubmit)
```

---

## Part VI — Priority Levels

Students instantly recognize urgency by color and behavior.

| Level | Color | Label | Behavior | Example |
|-------|-------|-------|----------|---------|
| **1** | 🟢 Green | **Information** | In-app + ticker | "Meeting moved to Room 205." |
| **2** | 🟡 Yellow | **Reminder** | In-app + ticker | "Fundraiser ends tomorrow." |
| **3** | 🟠 Orange | **Important** | In-app + ticker + optional push | "Senior meeting today." |
| **4** | 🔴 Red | **Critical** | In-app + ticker + **instant push** + banner override | "School dismissed early." |

### Priority constraints

| Constraint | Detail |
|------------|--------|
| Students cannot set **Critical** | Staff / emergency roles only |
| **Critical** overrides quiet hours | Push always delivers |
| Ticker shows **Important+** by default | Green items in feed only (configurable) |
| Blue Don OS home card | Shows highest-priority active broadcast |

---

## Part VII — Event Reminders

Event reminders are **broadcasts**, not separate emails.

```
⏰ REMINDER — Athletics Broadcast

Football Game — Tonight · 7 PM
Wear Blue! Go Dons!
```

### Auto-audience from Event Hub

When an event publishes, reminder broadcasts can target:

| Source | Auto-included audiences |
|--------|-------------------------|
| Event participants | Registered attendees |
| Host org | e.g., Football team |
| Related orgs | Cheer, Band, Broadcasting (configured per event) |
| Parents | Linked parents of participants (opt-in) |

**Flow:**

```
Teacher creates event (Event Hub)
        │
        ▼
Event published → schedules reminder broadcast(s)
        │
        ▼
T-24h / T-2h reminders sent as 🟡 Reminder broadcasts
        │
        ▼
Day-of reminder with check-in link (optional)
```

Replaces fragmented email chains. One event → one reminder pipeline.

---

## Part VIII — Campus Ticker

> **Something that looks really professional — like ESPN or a news channel.**

A persistent scrolling headline bar across the top of Blue Don:

```
📢 TODAY — Senior Meeting • Football Tonight • Guest Speaker • IT Club Tomorrow • Blood Drive Friday
```

### Ticker rules

| Rule | Detail |
|------|--------|
| **T1** | Shows **published** broadcasts marked `showOnTicker: true` |
| **T2** | Ordered by priority (Critical first) then recency |
| **T3** | Max ~8 items visible in rotation; older items drop off |
| **T4** | Tap any item → full broadcast detail |
| **T5** | Critical broadcasts **pin** until expired or dismissed by admin |
| **T6** | Visible on **all authenticated pages** (below header) |

**Status:** Planned — UI component + `showOnTicker` flag on broadcast model.

---

## Part IX — Publish Surfaces (Fan-Out)

When a broadcast publishes, it appears on every relevant surface:

| Surface | What shows |
|---------|------------|
| **Campus Ticker** | Headline text (if flagged) |
| **Blue Don OS (Home)** | Priority card for Important+ |
| **School Hub** | Announcements feed |
| **Community** | Campus Feed entry (positive culture) |
| **Org workspace** | Announcements tab (if org-scoped) |
| **My Journey** | Timeline entry (if student-targeted) |
| **Push notification** | Important + Critical |
| **Email digest** | Optional daily rollup (parents) |

**One broadcast. Many surfaces. No duplicate posting.**

---

## Part X — AI Broadcast Assistant

Student leaders type informally; Blue Don formats professionally **before** submission for approval.

### Student input

```
"Need everyone to remember tomorrow's fundraiser"
```

### AI output (draft)

```
📢 SENIOR CLASS BROADCAST

Reminder: Class Fundraiser Tomorrow
Please bring your order forms to the cafeteria during lunch.
Questions? See your class officers.

Suggested audience: Seniors
Suggested priority: 🟡 Reminder
```

### AI assistant capabilities

| Capability | Detail |
|------------|--------|
| Format professionally | Title, body, call-to-action |
| Check spelling & grammar | Before submit |
| Suggest audience | Based on content + author's permissions |
| Suggest priority | Never suggests Critical for students |
| Flag policy issues | Inappropriate content → block submit |

### AI boundaries (Constitution Article X)

- AI **drafts** only — student reviews and submits.  
- AI does **not** auto-publish.  
- Advisor approval still required for gated audiences.  
- No AI-generated Critical/emergency messages.

**Permission key:** `ai:broadcast_assist` (student leaders with broadcast create permission).

---

## Part XI — Educational Outcomes

Blue Don Broadcasts is intentionally a **learning system**, not just infrastructure.

| Skill | How students learn it |
|-------|----------------------|
| **Clear writing** | AI assistant + advisor feedback on rejections |
| **Audience targeting** | Must select correct audience; wrong target = rejected |
| **Approval discipline** | School-wide never goes live without advisor sign-off |
| **Professional tone** | Broadcast branding and templates |
| **Media literacy** | Broadcasting Academy ties to real campus comms |
| **Leadership responsibility** | Position-based permissions with term limits |

> *Very similar to how communications teams operate in colleges and businesses.*

---

## Part XII — Navigation Placement

| Surface | Route | Access |
|---------|-------|--------|
| **View broadcasts** | `/broadcasts` | All users (filtered by audience) |
| **Create broadcast** | `/broadcasts/new` | Users with `broadcasts:create` |
| **Approve queue** | `/broadcasts/approvals` | Users with `broadcasts:approve` |
| **Leadership Center** | `/leadership` | Officers, advisors, admin |
| **Admin: Broadcast mgmt** | `/admin/broadcasts` | Admin, emergency roles |
| **Ticker** | Global component | All authenticated pages |

### Digital Campus integration

| Module | Relationship |
|--------|--------------|
| **Home (Blue Don OS)** | Principal's message card, priority broadcasts |
| **School Hub** | Announcements archive |
| **Student Life** | Org-scoped broadcasts in org Announcements tab |
| **Community** | Feed entries from published broadcasts |
| **Administration** | Broadcast Management, emergency controls |
| **Broadcasting Academy** | Curriculum ties to real campus broadcasts |

---

## Part XIII — Permissions Model

### Global permission keys (new)

| Key | Who |
|-----|-----|
| `broadcasts:view` | All campus users (audience-filtered) |
| `broadcasts:create` | Leadership positions (scoped by assignment) |
| `broadcasts:approve` | Advisors, designated staff |
| `broadcasts:publish_critical` | Principal, AP, office, IT admin, AD |
| `broadcasts:manage` | Admin — all broadcasts, ticker override |
| `broadcasts:ticker` | Admin — pin/unpin ticker items |
| `leadership:manage` | Admin, advisors — assign positions |
| `ai:broadcast_assist` | Users with `broadcasts:create` |

### Position-scoped create permissions

| Position assignment | `broadcasts:create` scope |
|---------------------|-------------------------|
| Senior Class President | `audience:grade:12` |
| IT Club President | `audience:org:it-club` |
| Football Captain | `audience:org:football` |
| Student Council President | `audience:school` (requires approval) |
| Principal | `audience:*` + `publish_critical` |

Permissions stored on `LeadershipAssignment` — not inferred from grade alone.

---

## Part XIV — Technical Architecture

### Proposed schema

```prisma
enum BroadcastPriority {
  INFORMATION   // green
  REMINDER      // yellow
  IMPORTANT     // orange
  CRITICAL      // red
}

enum BroadcastStatus {
  DRAFT
  PENDING
  APPROVED
  PUBLISHED
  REJECTED
  ARCHIVED
}

enum BroadcastDomain {
  SCHOOL
  GRADE
  ATHLETICS
  CLUB
  ACADEMY
  SERVICE
  ACADEMIC
  CLASS
  CUSTOM
}

model Broadcast {
  id              String            @id @default(cuid())
  schoolId        String            @map("school_id")
  title           String
  body            String
  domain          BroadcastDomain
  priority        BroadcastPriority @default(INFORMATION)
  status          BroadcastStatus   @default(DRAFT)
  showOnTicker    Boolean           @default(false) @map("show_on_ticker")
  pushSent        Boolean           @default(false) @map("push_sent")
  authorId        String            @map("author_id") @db.Uuid
  approverId      String?           @map("approver_id") @db.Uuid
  approvedAt      DateTime?         @map("approved_at")
  publishedAt     DateTime?         @map("published_at")
  expiresAt       DateTime?         @map("expires_at")
  rejectionNote   String?           @map("rejection_note")
  eventId         String?           @map("event_id")   // optional Event Hub link
  archiveFlag     Boolean           @default(false) @map("archive_flag")
  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")
  audiences       BroadcastAudience[]
  publications    BroadcastPublication[]
}

model BroadcastAudience {
  id          String   @id @default(cuid())
  broadcastId String   @map("broadcast_id")
  audienceKey String   @map("audience_key")  // e.g. grade:12, org:it-club, school:all
  broadcast   Broadcast @relation(...)
  @@unique([broadcastId, audienceKey])
}

model BroadcastPublication {
  id          String   @id @default(cuid())
  broadcastId String   @map("broadcast_id")
  surface     String   // TICKER, HOME_OS, SCHOOL_HUB, COMMUNITY, PUSH, EMAIL
  publishedAt DateTime @map("published_at")
}

model LeadershipPosition {
  id              String   @id @default(cuid())
  schoolId        String   @map("school_id")
  slug            String   // senior-class-president
  title           String   // Senior Class President
  organizationId  String?  @map("organization_id")
  broadcastScopes String[] @map("broadcast_scopes")  // audience keys
  requiresApproval Boolean @default(true) @map("requires_approval")
  approverPositionId String? @map("approver_position_id")
}

model LeadershipAssignment {
  id          String   @id @default(cuid())
  positionId  String   @map("position_id")
  userId      String   @map("user_id") @db.Uuid
  termStart   DateTime @map("term_start")
  termEnd     DateTime @map("term_end")
  status      MembershipStatus @default(ACTIVE)
}
```

### Audience resolution

At publish time, resolve `audienceKey` → user IDs:

| Key pattern | Resolution |
|-------------|------------|
| `school:all` | All active campus users |
| `grade:12` | Students with `gradeLevel = 12` |
| `org:it-club` | `OrganizationMembership` where org slug = `it-club` |
| `role:parent` | Users with role `PARENT` linked to targeted students |
| `role:faculty` | `TEACHER`, `ADVISOR`, `COUNSELOR`, `COACH` |

Store resolved snapshot on publish for audit (who was targeted).

### Services

| Service | Responsibility |
|---------|----------------|
| `broadcast-service` | CRUD, workflow, audience resolution, fan-out |
| `leadership-service` | Positions, assignments, permission checks |
| `ticker-service` | Active ticker items, pin/unpin |
| `notification-service` | Push, email digest (future) |

---

## Part XV — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **17.3** | `Broadcast` schema + draft/create UI |
| **17.4** | Approval workflow + advisor queue |
| **18.0** | Audience resolution + publish fan-out |
| **18.1** | Campus Ticker component |
| **18.2** | Leadership Center + position permissions |
| **18.3** | Event reminder broadcasts (Event Hub integration) |
| **19.0** | Push notifications (Important + Critical) |
| **19.1** | AI Broadcast Assistant |
| **19.2** | Broadcasting Academy curriculum tie-in |

---

## Part XVI — Design Checklist

Before shipping any broadcast feature:

1. **Audience** — Who receives it? Who must *not* receive it?  
2. **Permission** — Which position or role can create?  
3. **Approval** — Required? Who approves?  
4. **Priority** — Correct level? Critical restricted to staff?  
5. **Surfaces** — Ticker? Home OS? Push?  
6. **Audit** — Author, approver, timestamp logged?  
7. **Education** — Does this teach responsible communication?  
8. **Brand** — Is it a Blue Don Broadcast, not a generic alert?

---

## Appendix — Module Index

| # | Module | This document |
|---|--------|---------------|
| 28 | **Blue Don Broadcasts** | Campus communications system (this doc) |
| 29 | **Student Leadership Center** | Position roster + broadcast permissions |

Replaces generic "announcements" in School Hub, org workspaces, and Community with the unified Broadcast engine.

---

*Madonna High School · Blue Don Virtual Campus*  
*📣 Blue Don Broadcasts — Where Every Message Reaches the Right Audience.*
