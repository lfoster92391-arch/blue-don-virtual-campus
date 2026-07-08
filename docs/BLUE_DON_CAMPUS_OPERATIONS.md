# Campus Operations Center

**School Operations · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** Department heads, IT, administration, faculty, developers  

**Pillar:** School Operations (see [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md))

**Companion documents:** [Blue Don Requests](./BLUE_DON_REQUESTS.md) · [Broadcasts](./BLUE_DON_BROADCASTS.md) · [Blue Don ID](./BLUE_DON_ID.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Every Madonna department gets its own **workspace** — just like clubs, but with **tools tailored to its work**.

The Campus Operations Center is the staff-facing hub for running the school: IT, Broadcasting, Admissions, Campus Ministry, Library, Health Office, Facilities, Finance, Advancement, Athletics operations, and more.

Students interact with these departments through **Blue Don Requests** and **Blue Don ID** scans — not email chains and paper forms.

> **IT Operations is a flagship module** — the digital home for the IT Coordinator and IT Club assistants.

---

## Part I — Operations Model

### Department = Workspace

Same pattern as Student Life org workspaces:

```
Campus Operations (/operations)
│
├── Administration
├── Admissions
├── Guidance              ← links to Guidance Center (Module 31)
├── Athletics             ← ops (scheduling, ticketing) + team workspaces
├── Campus Ministry
├── Technology (IT)       ← flagship
├── Facilities
├── Library
├── Health Office (Nurse)
├── Finance
├── Advancement
└── Broadcasting          ← flagship
```

| Principle | Detail |
|-----------|--------|
| **OP1** | Each department has a **workspace shell** (tabs configurable per dept) |
| **OP2** | Staff see their department(s) based on role + assignment |
| **OP3** | Students/parents see **request interfaces** — not internal queues |
| **OP4** | IT tickets ≠ facilities tickets ≠ media requests (separate queues) |
| **OP5** | IT Club students assist on **approved tasks** with scoped permissions |

**Route:** `/operations` (staff hub) · `/operations/[dept-slug]` (department workspace)

---

## Part II — 🖥️ IT Operations (Flagship)

> **Digital home for the IT Coordinator.**

```
Technology (/operations/technology)
│
├── IT Operations Dashboard
├── Help Desk Tickets
├── Device Inventory
├── Chromebook Assignments
├── Loaner Tracking
├── Repair Queue
├── Warranty Tracking
├── Network Status
├── Classroom Technology
│   ├── Interactive Displays
│   └── Printers
├── Software Licenses
├── Asset Checkout
└── Knowledge Base
```

### IT Club integration

| Capability | IT Club permission |
|------------|-------------------|
| Triage L1 tickets | `it:assist_tickets` (advisor-approved) |
| Asset labeling / inventory | `it:assist_inventory` |
| Knowledge base articles (draft) | `it:assist_kb` |
| Repair bench (supervised) | `it:assist_repair` |

Students gain **real experience**; advisor approves task scope. XP optional via Rewards System.

### Distinction from Service Desk

| Surface | Audience | Purpose |
|---------|----------|---------|
| `/service-desk` | Staff (legacy route) | Evolves into IT Operations ticket queue |
| `/operations/technology` | IT staff + IT Club | Full IT ops center |
| Blue Don Request | Teachers, students | Submit IT support request |

**Status:** Partial — tickets (Phase 9), account admin. **Gap:** full IT Operations UI.

---

## Part III — 📺 Broadcasting Operations

> **Not just for students — production staff operations.**

```
Broadcasting (/operations/broadcasting)
│
├── Morning Announcements
├── Livestream Schedule
├── Camera Inventory
├── Production Calendar
├── Script Library
├── Replay Archive
├── Media Requests
├── School Photography
└── Event Coverage Requests
```

### Teacher media requests

```
Teacher submits Event Coverage Request (Blue Don Request)
        │
        ▼
Broadcasting staff reviews queue
        │
        ▼
Assigned to student crew / staff
        │
        ▼
Event covered → Media Center archive
```

Integrates: Broadcasting Academy, Media Center, Event Hub, Blue Don Broadcasts (morning show).

---

## Part IV — 🏫 Admissions

Future-facing — families eventually get their own portal.

```
Admissions (/operations/admissions)     [staff]
Admissions Portal (/admissions)         [public / future families]
│
├── Schedule Tours
├── Apply
├── Upload Documents
├── Shadow Days
├── Open House Registration
├── FAQ
└── Tuition Information
```

**Pillar:** School Operations + Community Engagement (external families).  
**Status:** Planned — post core campus. Public routes require separate auth model.

---

## Part V — 🙏 Campus Ministry

> **Madonna is a Catholic school — this deserves its own area.**

```
Campus Ministry (/ministry)
│
├── Mass Schedule
├── Prayer Requests
├── Retreats
├── Liturgical Calendar
├── Community Service
├── Mission Trips
├── Faith Resources
└── Volunteer Opportunities
```

**Pillar:** Student Life (student-facing) + School Operations (staff coordination).

Links to Service Center for volunteer hours. Reinforces school mission and identity.

**Route:** Primary nav under Student Life or dedicated Ministry destination (school config).

---

## Part VI — 📚 Library

### Student-facing

```
Library (/library)
│
├── Search Catalog
├── Reserve Books
├── Check Availability
├── Borrowing History
├── Recommended Reading
└── Digital Resources
```

### Staff-facing (`/operations/library`)

Catalog management, check-in/out scanners (Blue Don ID), overdue notices, acquisitions.

**Integration:** Blue Don ID QR for checkout. FACTS or library system API (future).

---

## Part VII — 🩺 Health Office

> **Privacy controls are essential.**

```
Health Office (/operations/health)
│
├── Medication Forms
├── Health Reminders
├── Immunization Notices
├── Appointment Requests
└── Athletic Physical Reminders
```

| Rule | Detail |
|------|--------|
| **HIPAA/FERPA** | Health data strictly role-gated |
| **Nurse + admin only** | Full health records |
| **Students** | Own forms and reminders only |
| **Parents** | Linked child health forms |
| **Teachers** | Athletic physical status flag only (yes/no) |
| **Never on Blue Don Pass QR** | Health data not in scan payload |

---

## Part VIII — 🛠️ Facilities

> **Separate from IT issues.**

```
Facilities (/operations/facilities)
│
├── Report Issue
├── My Requests
├── Work Order Queue (staff)
└── Room Setup Calendar
```

### Issue types

| Category | Examples |
|----------|----------|
| Furniture | Broken desk, chair |
| Electrical | Light out, outlet |
| HVAC | Temperature, ventilation |
| Plumbing | Water leak |
| Flooring | Damaged floor, carpet |
| Setup | Classroom arrangement, event setup |

Submitted via **Blue Don Request** → Facilities queue. Not mixed with IT tickets.

---

## Part IX — 📦 Equipment Reservations

> **Instead of emails.**

```
Equipment Reservations (/reservations)
│
├── Laptop Carts
├── Cameras
├── Microphones
├── Projectors
├── Gym Equipment
└── Meeting Rooms
```

| Field | Detail |
|-------|--------|
| Resource catalog | Admin-maintained |
| Calendar availability | Real-time conflict check |
| Approval | Department head (optional) |
| Checkout | Blue Don ID scan on pickup/return |
| Overdue | Auto-reminder broadcast |

Teachers reserve from teacher dashboard or Blue Don Request.

---

## Part X — 🚌 Transportation (Future)

```
Transportation (/operations/transportation)
│
├── Bus Route Changes
├── Field Trip Buses
├── Departure Times
└── Driver Assignments
```

Integrates: Event Hub (field trips), Blue Don Broadcasts (route change Critical alerts).

---

## Part XI — 🎫 Ticketing

All campus tickets through Blue Don — linked to Blue Don Wallet.

| Event type | Examples |
|------------|----------|
| Athletics | Football, basketball, volleyball |
| Performing arts | School plays, concerts |
| Social | Prom, homecoming |
| Milestone | Graduation |
| Academic | Guest speakers |

```
Issue tickets → Student Wallet → Gate scan (Blue Don ID QR) → Redeemed
```

**Status:** Schema proposed in [Blue Don ID](./BLUE_DON_ID.md) (`WalletTicket`).

---

## Part XII — 🎁 Fundraising Hub

> **Instead of every club using separate systems.**

```
Fundraising Hub (/fundraising)
│
├── Active Campaigns
├── Create Campaign (club/advisor)
├── Per-campaign:
│   ├── Goal
│   ├── Progress bar
│   ├── Team leaderboard
│   ├── Top sellers
│   ├── Online ordering (optional)
│   ├── Volunteer sign-ups
│   ├── Event dates
│   └── Revenue dashboard
└── Administration: school-wide fundraising picture
```

**Absorbs:** Impact Fund (student grants) as one campaign type.  
**Admin view:** Total raised across all campaigns — principal analytics feed.

---

## Part XIII — 📈 School Analytics

> **The principal's homepage — not spreadsheets. A live dashboard.**

```
School Analytics (/admin/analytics)
│
├── School Engagement          96%
├── Students in Clubs          87%
├── Volunteer Hours            4,812
├── Events This Month          48
├── Money Raised               $84,320
├── Industry Certifications    147
├── College Acceptances        91%
└── Acts of Kindness           612
```

| Principle | Detail |
|-----------|--------|
| **Real-time aggregates** | From Rewards, Service, Events, Fundraising, Journey |
| **Role-gated** | Principal, admin, advancement — not public |
| **Celebration-first** | Highlight progress, not shame |
| **Export** | PDF/CSV for board meetings |
| **Pillar** | Intelligence |

Also surfaces on **Administration** workspace home and Blue Don OS (admin persona).

---

## Part XIV — 🌍 Community Partner Portal

> **Something schools rarely do well.**

Approved external organizations log in to:

```
Partner Portal (/partners)
│
├── Post Internships
├── Offer Job Shadowing
├── Request Volunteers
├── Sponsor Clubs
├── Advertise Scholarships
├── Register as Guest Speakers
└── Host Career Workshops
```

### Approval workflow

```
Partner submits opportunity
        │
        ▼
School approval (Advancement / Guidance / Admin)
        │
        ▼
Published to Future Center + Community (scoped)
        │
        ▼
Students apply / RSVP through Blue Don
```

**Pillar:** Community Engagement.  
**Auth:** Partner role (`sponsor` extended) — separate from student accounts.

---

## Part XV — Department Workspace Template

Staff departments share a configurable tab shell:

| Tab | Purpose |
|-----|---------|
| **Home** | Dashboard, KPIs, quick actions |
| **Queue** | Open requests / tickets for this dept |
| **Calendar** | Dept schedule, reservations |
| **Resources** | Inventory, catalog, assets |
| **Team** | Staff roster, student assistants |
| **Reports** | Dept analytics |
| **Settings** | Dept config (head only) |

Each department enables relevant tabs — IT enables Inventory; Library enables Catalog; Facilities enables Work Orders.

---

## Part XVI — Navigation & Access

| User | Sees |
|------|------|
| **Student** | Ministry, Library, submit Requests — not internal queues |
| **Teacher** | Requests, reservations, coverage requests |
| **Staff / dept** | Their department workspace(s) |
| **Admin** | All operations + School Analytics |
| **IT Coordinator** | Technology workspace (full) |
| **Partner** | Partner Portal only |

### Administration nav expansion

```
Administration (/admin)
│
├── Users
├── Organizations
├── Campus Operations      ← dept hub
├── Events
├── Broadcasts
├── Requests (all queues)
├── Fundraising
├── Analytics
├── Partners
├── Permissions
├── School Settings
└── System Health
```

---

## Part XVII — Technical Architecture (Summary)

### Proposed models

```prisma
enum DepartmentSlug {
  ADMINISTRATION
  ADMISSIONS
  GUIDANCE
  ATHLETICS
  CAMPUS_MINISTRY
  TECHNOLOGY
  FACILITIES
  LIBRARY
  HEALTH
  FINANCE
  ADVANCEMENT
  BROADCASTING
}

model DepartmentWorkspace {
  id          String         @id @default(cuid())
  schoolId    String         @map("school_id")
  slug        DepartmentSlug
  name        String
  config      Json?          // enabled tabs, custom fields
}

model EquipmentResource {
  id          String   @id @default(cuid())
  departmentId String  @map("department_id")
  name        String
  category    String
  quantity    Int
  requiresApproval Boolean @default(false)
}

model EquipmentReservation {
  id          String   @id @default(cuid())
  resourceId  String   @map("resource_id")
  requesterId String   @map("requester_id") @db.Uuid
  startAt     DateTime @map("start_at")
  endAt       DateTime @map("end_at")
  status      String   // PENDING, APPROVED, CHECKED_OUT, RETURNED, CANCELLED
}

model FundraisingCampaign {
  id          String   @id @default(cuid())
  organizationId String? @map("organization_id")
  goal        Decimal
  raised      Decimal  @default(0)
  startAt     DateTime @map("start_at")
  endAt       DateTime @map("end_at")
  status      String
}

model PartnerOrganization {
  id          String   @id @default(cuid())
  name        String
  status      String   // PENDING, APPROVED, SUSPENDED
  contactUserId String? @map("contact_user_id") @db.Uuid
}

model PartnerOpportunity {
  id          String   @id @default(cuid())
  partnerId   String   @map("partner_id")
  type        String   // INTERNSHIP, SHADOW, SCHOLARSHIP, SPEAKER, ...
  status      String   // PENDING, APPROVED, PUBLISHED, CLOSED
  content     Json
}
```

Full request schema: [BLUE_DON_REQUESTS.md](./BLUE_DON_REQUESTS.md).

---

## Part XVIII — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **23.0** | Campus Operations shell + department routing |
| **23.1** | IT Operations (flagship) — tickets, inventory, Chromebooks |
| **23.2** | Facilities work orders (separate queue) |
| **23.3** | Equipment reservations |
| **23.4** | Broadcasting Operations |
| **23.5** | Fundraising Hub |
| **23.6** | School Analytics dashboard |
| **24.0** | Library student + staff surfaces |
| **24.1** | Campus Ministry module |
| **24.2** | Health Office (privacy-first) |
| **24.3** | Ticketing (Wallet integration) |
| **25.0** | Community Partner Portal |
| **25.1** | Admissions portal (public) |
| **25.2** | Transportation |

**Prerequisites:** Blue Don Requests (Module 33), Blue Don ID for checkout scans.

---

## Appendix — Module Index

| # | Module | Document |
|---|--------|----------|
| 32 | **Campus Operations Center** | This document |
| 33 | **Blue Don Requests** | [BLUE_DON_REQUESTS.md](./BLUE_DON_REQUESTS.md) |

Department workspaces are **subsystems of Module 32**.

---

*Madonna High School · Blue Don Virtual Campus*  
*Campus Operations — Every Department. One Platform.*
