# 11 — Future Center

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `08_STUDENT_JOURNEY.md`, `06_RBAC_PERMISSIONS.md`  
**Current implementation:** `/pathways` — Career Pathway Dashboard linking 14 MEN academies

---

## Purpose

Specify the **Future Center** — post-secondary and career hub for college, trade, military, scholarships, resume, recruiters, internships, and Career AI (architecture reference only).

---

## Navigation Placement

| Surface | Route | Nav |
|---------|-------|-----|
| **Future Center home** | `/future-center` | Primary nav #7 |
| **College** | `/future-center/college` | Sub-nav |
| **Trade & apprenticeships** | `/future-center/trade` | Sub-nav |
| **Military** | `/future-center/military` | Sub-nav |
| **Scholarships** | `/future-center/scholarships` | Sub-nav |
| **Resume** | `/future-center/resume` | Sub-nav |
| **Internships** | `/future-center/internships` | Sub-nav |
| **Recruiters** | `/future-center/recruiters` | Sub-nav |
| **Career AI** | `/future-center/ai` or global AI with context | AI Assistant tab |

**Pathways migration:** `/pathways` → redirect to `/future-center/pathways` (academy career map) or `/academies` with banner.

**Mobile:** Sub-nav as horizontal chips; resume editor simplified single-column.  
**Desktop:** Left sub-nav + content panel; resume split preview.

---

## Module Breakdown

### 1. Pathways & Academies Map

| Feature | Description |
|---------|-------------|
| Career pathway tiles | 14 MEN academies with progress overlay |
| Skills alignment | Portfolio + certification tags → pathway fit score |
| Explore mode | Grades 7–9: browse without commitment |

**Data:** `Academy`, `AcademyPathwayMapping`, `CareerPathway` enum, progress tables  
**Maps from:** `/pathways` page, `pathways` components

---

### 2. College Planning

| Feature | Description |
|---------|-------------|
| College list | Target schools with reach/match/safety |
| Application tracker | Deadlines, status, essay checklist |
| Test scores | SAT/ACT (manual or FACTS) |
| FAFSA checklist | Milestone template for seniors |
| Counselor share | Opt-in visibility for `counselor` role |

**Data:** `CollegeApplication`, `CollegeTarget`, `TestScore`

---

### 3. Trade & Apprenticeships

| Feature | Description |
|---------|-------------|
| Program directory | Trade schools, local apprenticeships |
| Interest profile | From About Me `tradeInterest` |
| Application log | Status tracking |
| Academy linkage | Skilled Trades, Automotive, etc. |

**Data:** `TradeProgram`, `ApprenticeshipApplication`

---

### 4. Military Pathways

| Feature | Description |
|---------|-------------|
| Branch explorer | ASVAB info, ROTC, service academies |
| Interest capture | `militaryInterest` from About Me |
| Recruiter visit events | Event Engine type `MEETING` |
| Disclaimer | School counselor referral for commitments |

**Data:** `MilitaryInterestProfile`, links to events

---

### 5. Scholarships

| Feature | Description |
|---------|-------------|
| School scholarship catalog | Admin-managed |
| External scholarship feed | Curated links (no scraping without license) |
| Application tracker | Deadlines, submitted, awarded |
| Match hints | Rule-based (GPA, academy, service hours) — AI in Phase 23 |

**Data:** `Scholarship`, `ScholarshipApplication`

---

### 6. Resume Builder

| Feature | Description |
|---------|-------------|
| Auto-import | Portfolio items, certifications, service hours, leadership |
| Sections | Education, experience, skills, awards |
| Templates | PDF export (school-branded) |
| Versions | Save multiple (college vs job) |

**Data:** `ResumeDocument` (json sections), sources from `PortfolioItem`, `JourneyMilestone`

---

### 7. Internships & Opportunities

| Feature | Description |
|---------|-------------|
| Job board | Admin/partner postings |
| Student applications | Cover letter + portfolio link |
| Employer contacts | Recruiter org type or sponsor linkage |
| Academy credit | Optional checklist tie-in |

**Data:** `InternshipPosting`, `InternshipApplication`

---

### 8. Recruiter Connections

| Feature | Description |
|---------|-------------|
| Recruiter directory | Verified sponsors/recruiters |
| Visit scheduling | Event Engine integration |
| Student opt-in | Share resume with recruiter |

**Data:** `RecruiterProfile`, `RecruiterConnection`

---

### 9. Career AI (Architecture Only)

| Input | Source |
|-------|--------|
| About Me goals | `AboutMe` |
| Academy progress | Engine progress |
| Future Center activity | Applications, interests |
| Journey recommendations | `JourneyRecommendation` |

| Output | Guardrail |
|--------|-----------|
| Pathway suggestions | Mentor tone; cite resources |
| Scholarship reminders | No guarantee language |
| Resume tips | Based on portfolio facts only |
| **Not allowed** | Admission promises, clinical guidance |

Processing: shared AI layer (`17_AI_ARCHITECTURE.md`); `future:explore` permission required.

---

## Proposed Prisma Models

```prisma
model CareerPlan {
  id              String   @id @default(cuid())
  userId          String   @unique @map("user_id") @db.Uuid
  primaryPathway  CareerPathway? @map("primary_pathway")
  collegeBound    Boolean  @default(false) @map("college_bound")
  tradeBound      Boolean  @default(false) @map("trade_bound")
  militaryBound     Boolean  @default(false) @map("military_bound")
  updatedAt       DateTime @updatedAt @map("updated_at")
  @@map("career_plans")
}

model CollegeTarget {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  name        String
  tier        CollegeTier // REACH, MATCH, SAFETY
  applicationDeadline DateTime? @map("application_deadline")
  @@map("college_targets")
}

model CollegeApplication {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  collegeName String   @map("college_name")
  status      ApplicationStatus
  submittedAt DateTime? @map("submitted_at")
  @@map("college_applications")
}

model Scholarship {
  id          String   @id @default(cuid())
  title       String
  description String?
  amountCents Int?     @map("amount_cents")
  deadline    DateTime?
  eligibility Json?
  active      Boolean  @default(true)
  @@map("scholarships")
}

model ScholarshipApplication {
  id            String   @id @default(cuid())
  userId        String   @map("user_id") @db.Uuid
  scholarshipId String   @map("scholarship_id")
  status        ApplicationStatus
  @@map("scholarship_applications")
}

model InternshipPosting {
  id          String   @id @default(cuid())
  title       String
  employer    String
  description String
  closesAt    DateTime? @map("closes_at")
  active      Boolean  @default(true)
  @@map("internship_postings")
}

model ResumeDocument {
  id        String   @id @default(cuid())
  userId    String   @map("user_id") @db.Uuid
  title     String
  sections  Json
  version   Int      @default(1)
  updatedAt DateTime @updatedAt @map("updated_at")
  @@map("resume_documents")
}
```

---

## Permissions

| Action | Permission |
|--------|------------|
| Explore Future Center | `future:explore` |
| Edit own plans/applications | `future:explore` (student) |
| Parent read-only view | `parent:view_student` + student share |
| Counselor view applications | `counselor` + `journey:view_students` |
| Manage scholarship catalog | `future:manage_programs` (admin) |
| Post internships | `admin` or verified `sponsor` |

---

## Mobile vs Desktop

| Module | Mobile | Desktop |
|--------|--------|---------|
| Pathways map | Vertical cards | Grid with filters |
| Application trackers | Swipe status cards | Kanban columns |
| Resume | Section accordion | Live PDF preview pane |
| Scholarships | Filter sheet | Faceted sidebar |
| Career AI | Chat bottom sheet | Side panel |

---

## Scalability Notes

- Scholarship catalog cached; admin CMS workflow
- Application trackers indexed by `(userId, status)`
- Resume PDF generation via background job (Puppeteer / external API)
- Internship board pagination; expire via cron
- FACTS grade import read-only; no write-back

---

## Mapping to Phase 0–15 Code

| As-built | Future Center mapping |
|----------|----------------------|
| `/pathways` | Pathways module — redirect target |
| `AcademyPathwayMapping` | Pathway fit scoring |
| `CareerPathway` enum | Shared taxonomy |
| `PortfolioItem` | Resume + application evidence |
| `Certification` | Skills module |
| No college/scholarship models | New in Phase 20 |
| AI coaching placeholder | Separate from Career AI module |

**Phase alignment:** Phase 20 — Future Center MVP (college, scholarships, resume); Phase 21 — internships + recruiters.

---

## Related Documents

- [08_STUDENT_JOURNEY.md](./08_STUDENT_JOURNEY.md)
- [07_PERSONALIZED_DASHBOARD.md](./07_PERSONALIZED_DASHBOARD.md) — `future_center_teaser` widget
- [17_AI_ARCHITECTURE.md](./17_AI_ARCHITECTURE.md)
