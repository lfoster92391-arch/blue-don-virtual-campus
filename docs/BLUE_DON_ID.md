# Blue Don ID

**Student Identity & Wallet · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Product owners, faculty, IT, developers, school leadership  

**Companion documents:** [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Broadcasts](./BLUE_DON_BROADCASTS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Every Madonna student has **one identity** on Blue Don:

```
Blue Don ID <SIS MD ID>
Example: Blue Don ID 29014
```

Think **Apple Wallet meets Student ID** — a digital card students carry everywhere, backed by one QR code that powers attendance, events, service, equipment, cafeteria, library, athletics, store purchases, and more.

Blue Don ID is not a feature. It is the **identity layer** that connects every module — the reason Blue Don becomes the operating system for the entire Madonna experience.

> **One code. One identity.**

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Blue Don ID** | Canonical student identifier — synced from FACTS SIS (`sisStudentId`) |
| **Blue Don Pass** | The digital card UI (front + back) — like a wallet pass |
| **Blue Don QR** | Rotating secure token encoded in the card — scanned for all campus actions |
| **Student Passport** | Milestone stamp book — accomplishments over the Madonna journey |
| **Digital Backpack** | Student document vault — forms, slips, certs, portfolio, transcript |
| **Blue Don Wallet** | Umbrella holding ID, coins, tickets, passes, certificates, lunch balance |

### Tagline

**The one thing students always have with them.**

---

## Part II — Blue Don Pass (Card UI)

Accessible from header/profile, Home OS, and mobile home screen (PWA). Full-screen card with flip animation.

### Front

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
         [Madonna Shield]

         Lisa Morris
         Class of 2029

    Student ID: 29014
    Level 18  ★★★★☆
    Blue Don Member

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Current XP          5,420
    Blue Don Coins        830
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

            [ QR CODE ]

         Scan for campus
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

| Element | Source |
|---------|--------|
| Name, photo | User profile + FACTS |
| Class of | `StudentProfile.cohortYear` |
| Student ID | FACTS `sisStudentId` |
| Level | Rewards System (XP tiers) |
| Star rating | Journey engagement metric (optional) |
| Blue Don Member | Active campus status |
| XP / Coins | Rewards ledger |
| QR Code | Secure rotating token (see Part IV) |

### Back

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    EMERGENCY CONTACTS
    Mom · Dad · Guardian

    HOUSE          Gryffindor (example)
    ORGANIZATIONS  IT Club, Football, NHS
    SERVICE HOURS  42 verified
    CERTIFICATIONS Broadcast I, IT Foundations
    ACADEMIES      Broadcasting, IT
    FAVORITE CAREER Video Production
    GRADUATION     81% complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Back-of-card data is **read-only** on the pass; detail editing happens in My Journey. Emergency contacts sync from FACTS (parent/guardian linkage).

**Route:** `/id` or `/wallet/id`  
**Status:** Planned — Module 30.

---

## Part III — One QR Code. Everything.

A single QR on the Blue Don Pass resolves to a **signed, time-limited token** tied to the student's Blue Don ID. Scanners (staff apps, kiosk, event check-in) validate the token and record the action.

### Scan actions

| Action | Scanner | Result |
|--------|---------|--------|
| Check into school | Main entrance kiosk | Attendance log |
| Check into event | Event staff / self-serve | `EventParticipant` attendance |
| Check into club meeting | Club officer | Org attendance + optional XP |
| Check into football game | Gate staff | Athletics attendance / ticket validated |
| Check into service project | Supervisor | Service check-in start |
| Check out of service | Supervisor | Service hours pending approval |
| Check out equipment | Academy / org staff | Equipment loan record |
| Borrow library book | Library scanner | SIS/library integration |
| Purchase spirit wear | Store POS | Coin/card payment + receipt |
| Redeem rewards | Staff kiosk | Coin deduction + redemption log |
| Attend guest speaker | Auditorium scanner | Attendance + XP |
| Verify attendance | Teacher class scanner | Period attendance complete |
| Digital hall pass | Teacher / admin verifier | Pass validated in transit |
| Cafeteria purchase | Cafeteria POS | Meal balance updated |
| Prom / graduation ticket | Event gate | Ticket validated |

### Scan flow

```
Student presents Blue Don Pass (QR)
        │
        ▼
Scanner reads token → validates signature + expiry
        │
        ▼
Scanner context (event ID, equipment ID, class period, etc.)
        │
        ▼
Action recorded → XP / hours / ledger updated automatically
        │
        ▼
Confirmation shown to student + staff
```

**No separate cards. No duplicate codes. No paper sign-in sheets.**

---

## Part IV — QR Security

| Rule | Detail |
|------|--------|
| **Q1** | Tokens are **signed** (HMAC/JWT) — not raw student IDs in QR |
| **Q2** | Tokens **rotate** every 60–120 seconds on screen (screenshot-resistant) |
| **Q3** | Offline scanners validate signature with cached public key |
| **Q4** | Each scan logs: `studentId`, `scannerId`, `actionType`, `contextId`, `timestamp` |
| **Q5** | Rate limiting prevents replay attacks |
| **Q6** | Lost device → admin can **revoke** active tokens instantly |

### NFC (future)

Same token payload over NFC tap — no QR camera required.

```
Tap → Attendance recorded
Tap → Library book checked out
Tap → Hoodie purchased
Tap → Football game entry
```

**Phase:** Post-MVP hardware integration (cafeteria POS, library, gate readers).

---

## Part V — Digital Hall Pass

Teachers create a time-bound pass; student shows Blue Don Pass for verification in hallways.

```
DIGITAL HALL PASS
━━━━━━━━━━━━━━━━━━
Student:   Lisa Morris
Destination: Library
Issued by:  Mr. Johnson
Time:       10:35 AM
Expires:    10:45 AM
Status:     ACTIVE
━━━━━━━━━━━━━━━━━━
        [ QR CODE ]
```

| Rule | Detail |
|------|--------|
| Teacher issues from class roster | `hallpass:create` |
| Pass expires automatically | Default 10 minutes (configurable) |
| Admin / security can scan | Verify student is authorized in hall |
| Audit log | Who issued, when, destination |

**Route:** `/id/hall-pass` (student view); teacher issues from class tools.

---

## Part VI — Equipment Checkout

Academies and clubs tie equipment loans to Blue Don ID.

### Example — Broadcasting

```
Checked Out
├── Camera Kit #7
├── Return: Friday 3:00 PM
└── Scanned by: Broadcasting Director
```

### Example — IT Club

```
Checked Out
├── Chromebook CB-204
├── Network Tester NT-12
└── Return: End of semester
```

| Field | Detail |
|-------|--------|
| Item catalog | Per org / academy (`EquipmentItem`) |
| Checkout | Staff scans student QR + selects item |
| Return | Scan again → closes loan |
| Overdue | Broadcast reminder to student + advisor |
| Journey | Leadership / responsibility milestone |

**Integrates:** Broadcasting Academy, IT Academy, org workspaces.

---

## Part VII — Domain Integrations

### Cafeteria

Blue Don ID replaces a separate lunch card.

```
Scan → Lunch purchased → Meal balance updated → Rewards eligible (optional)
```

FACTS or cafeteria POS integration. Balance shown on Wallet tab.

### Library

```
Scan → Book checked out → Done
```

Library system API or manual staff scan. Loan history in Digital Backpack.

### Attendance

```
Teacher opens class roster → Students scan → Attendance complete
```

Alternative: teacher bulk-mark with optional spot-check QR scan. FACTS sync (read-only first).

### Athletics

```
Football ticket → QR on Blue Don Pass → Gate scan → Done
```

Digital ticket lives in Blue Don Wallet. No paper ticket.

### Prom & graduation

```
Digital Ticket → QR → Done
```

Ticket issued to eligible students; scanned at entry. Linked to event in Event Hub.

### School store (Blue Don Corner)

```
Spirit wear purchase → Blue Don Coins + Student ID scan → Done
```

Coin balance deducted; receipt in Digital Backpack.

---

## Part VIII — Student Passport

> **Every accomplishment stamps the passport. Like traveling through Madonna.**

Companion to the full [My Madonna Journey](./BLUE_DON_MY_MADONNA_JOURNEY.md) timeline — quick stamp book on Blue Don Pass.

Visual stamp book in My Journey — gamified milestone collection.

```
STUDENT PASSPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━
✔ First Day at Madonna
✔ First Club Joined
✔ First Service Hour
✔ First Certification Earned
✔ First Leadership Role
✔ First Blue Don Broadcast
✔ First Competition
✔ First Academy Module Complete
✔ First Athletic Event
✔ First Kindness Post
✔ Graduation
━━━━━━━━━━━━━━━━━━━━━━━━━━
```

| Rule | Detail |
|------|--------|
| Stamps are **earned automatically** from system events |
| Stamps are **permanent** — never removed |
| Passport exports with **Digital Passport** at graduation |
| New stamps can be defined per school (tenant config) |
| Shareable preview (optional, privacy-gated) |

**Distinct from Digital Passport** (Part IX) — Passport is the **visual stamp book**; Digital Passport is the **official exportable credential**.

---

## Part IX — Digital Backpack

> **Every student has one. No papers.**

```
Digital Backpack (/backpack)
│
├── Assignments        ← Google Classroom sync
├── Forms              ← Signed governance forms
├── Permission Slips   ← Event / trip forms
├── Documents          ← School-issued PDFs
├── Schedules          ← Class schedule export
├── Notes              ← Student personal notes (optional)
├── Certificates       ← Academy certs, awards
├── Photos             ← Linked from Media / Portfolio
├── Resume             ← From My Journey
├── Portfolio          ← Evidence items
└── Transcript         ← FACTS (when permitted, grade-gated)
```

| Principle | Detail |
|-----------|--------|
| **Single vault** | Students find any document in one place |
| **Auto-populated** | Forms, certs, tickets flow in automatically |
| **FERPA-gated** | Transcript and sensitive docs require permission |
| **Parent view** | Linked parents see permitted items for their children |

**Route:** `/backpack` — utility nav + My Journey link.

---

## Part X — Blue Don Wallet

Umbrella surface for everything a student carries digitally.

```
Blue Don Wallet (/wallet)
│
├── 🪪 Student ID          ← Blue Don Pass (front/back)
├── 🪙 Coins               ← Balance + spend history
├── 🎟 Tickets             ← Athletics, prom, graduation, events
├── 🏆 Rewards             ← Badges, redemptions
├── 📜 Certificates        ← Quick access
├── 🍽 Lunch               ← Meal balance
├── 📚 Library             ← Active loans
├── 🅿️ Parking Pass        ← Future
├── 🏈 Athletic Pass       ← Season pass (future)
└── 🎓 Event Tickets       ← All upcoming scanned events
```

**Mobile-first.** PWA add-to-homescreen → Wallet is one tap away.

Apple Wallet / Google Wallet export (future) — pass file for lock screen ID.

---

## Part XI — Data Model (Proposed)

```prisma
model StudentProfile {
  id              String   @id @default(cuid())
  userId          String   @unique @map("user_id") @db.Uuid
  sisStudentId    String?  @unique @map("sis_student_id")  // FACTS MD ID: 29014
  gradeLevel      Int?     @map("grade_level")
  cohortYear      Int?     @map("cohort_year")             // Class of 2029
  house           String?
  favoriteCareer  String?  @map("favorite_career")
  graduationPct   Int?     @default(0) @map("graduation_pct")
  mealBalance     Decimal? @map("meal_balance")
  user            User     @relation(...)
}

model QrScanLog {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  actionType  String   @map("action_type")  // ATTENDANCE, EVENT, SERVICE, EQUIPMENT, ...
  contextId   String?  @map("context_id")
  scannerId   String?  @map("scanner_id") @db.Uuid
  scannedAt   DateTime @default(now()) @map("scanned_at")
  metadata    Json?
}

model HallPass {
  id            String   @id @default(cuid())
  studentId     String   @map("student_id") @db.Uuid
  issuedById    String   @map("issued_by_id") @db.Uuid
  destination   String
  issuedAt      DateTime @map("issued_at")
  expiresAt     DateTime @map("expires_at")
  status        String   @default("ACTIVE")
}

model EquipmentLoan {
  id          String   @id @default(cuid())
  itemId      String   @map("item_id")
  studentId   String   @map("student_id") @db.Uuid
  checkedOutAt DateTime @map("checked_out_at")
  dueAt       DateTime @map("due_at")
  returnedAt  DateTime? @map("returned_at")
  scannedById String?  @map("scanned_by_id") @db.Uuid
}

model PassportStamp {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  stampKey    String   @map("stamp_key")  // first_club, first_cert, ...
  earnedAt    DateTime @default(now()) @map("earned_at")
  @@unique([userId, stampKey])
}

model WalletTicket {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  eventId     String?  @map("event_id")
  ticketType  String   @map("ticket_type")  // ATHLETICS, PROM, GRADUATION, EVENT
  qrToken     String   @map("qr_token")
  redeemedAt  DateTime? @map("redeemed_at")
  status      String   @default("ACTIVE")
}
```

### Blue Don ID display format

```
Display:  Blue Don ID 29014
Internal: userId (UUID) + sisStudentId (FACTS)
QR:       signed token referencing userId (never expose SIS ID in QR payload alone)
```

---

## Part XII — Permissions

| Key | Who |
|-----|-----|
| `id:view_own` | All students — own pass |
| `id:scan` | Teachers, staff, coaches, scanners |
| `hallpass:create` | Teachers |
| `hallpass:verify` | Teachers, admin, security |
| `equipment:checkout` | Org leads, academy staff |
| `equipment:manage` | Admin, academy admin |
| `wallet:view_own` | All students |
| `transcript:view_own` | Student (grade/policy gated) |
| `transcript:view_linked` | Parent (linked child) |

---

## Part XIII — Privacy & FERPA

| Data on pass | Visibility |
|--------------|------------|
| Name, photo, ID | Student + staff scanners |
| XP, coins | Student (back of card optional hide) |
| Emergency contacts | Student + authorized staff only |
| Transcript | Student + parent + counselor — not on QR scan |
| QR token | Reveals only validated action context — not full profile |

Scans are **audited**. Students can view their own scan history in Wallet.

---

## Part XIV — Cross-Module Integration

```
                    ┌──────────────┐
                    │  Blue Don ID │
                    │  (QR Token)  │
                    └──────┬───────┘
       ┌──────────┬────────┼────────┬──────────┐
       ▼          ▼        ▼        ▼          ▼
  Event Hub  Service   Rewards  Equipment  Attendance
             Center              Checkout   (FACTS)
       │          │        │        │          │
       └──────────┴────────┴────────┴──────────┘
                          ▼
                   ┌──────────────┐
                   │  My Journey  │
                   │  Passport    │
                   │  Backpack    │
                   └──────────────┘
```

| Module | ID integration |
|--------|----------------|
| **My Journey** | Back of card, passport stamps, graduation % |
| **Rewards** | XP, coins, level on card front |
| **Event Hub** | Event check-in, digital tickets |
| **Service Center** | QR check-in/out for hours |
| **Blue Don Corner** | Coin purchases at store |
| **Academies** | Equipment checkout, cert display |
| **Broadcasts** | "First Broadcast" passport stamp |
| **Future Center** | Favorite career on card back |
| **Graduation** | Digital ticket, Digital Passport export |

---

## Part XV — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **20.0** | `StudentProfile` + Blue Don Pass UI (static card) |
| **20.1** | QR token generation + scan API |
| **20.2** | Event check-in via QR (Event Hub) |
| **20.3** | Service Center QR check-in/out |
| **20.4** | Digital Hall Pass |
| **20.5** | Equipment checkout |
| **20.6** | Blue Don Wallet shell + tickets |
| **20.7** | Student Passport stamps |
| **20.8** | Digital Backpack |
| **21.0** | Cafeteria + library integrations |
| **21.1** | NFC pilot |
| **22.0** | Apple/Google Wallet pass export |

---

## Part XVI — Design Checklist

1. **One identity** — Does this action use Blue Don ID, not a separate card?  
2. **One QR** — Can staff scan the same pass, or is a new code required?  
3. **Auto-update** — Does completion write to Journey, Passport, or Backpack?  
4. **Security** — Signed, rotating token? Audit log?  
5. **FERPA** — Is sensitive data hidden from scan payload?  
6. **Student-first** — Is the pass beautiful, fast, and always one tap away?

---

*Madonna High School · Blue Don Virtual Campus*  
*Blue Don ID — One Code. One Identity.*
