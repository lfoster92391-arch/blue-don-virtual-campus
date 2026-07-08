# 08 — Student Journey

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `06_RBAC_PERMISSIONS.md`, `07_PERSONALIZED_DASHBOARD.md`, `11_FUTURE_CENTER.md`  
**Current implementation:** Portfolio (`PortfolioItem`), Pathways (`/pathways`), academy progress (read-only), AI placeholder in learning flow

---

## Purpose

Define the **longitudinal student journey** from 7th grade through alumni handoff: About Me profile, semester updates, milestones, and **AI recommendation inputs** (architecture only — no model implementation).

---

## Navigation Placement

| Surface | Route | Nav parent |
|---------|-------|------------|
| **About Me / Journey** | `/portfolio/journey` or `/journey` | Portfolio (primary) + AI Assistant (context) |
| **Milestone timeline** | `/journey/timeline` | Portfolio sub-nav |
| **Semester check-in** | `/journey/check-in` | Prompted from Dashboard `journey_next_step` widget |
| **Admin journey flags** | `/admin/journey` | Administration |

**Mobile:** Journey entry via Dashboard widget and Portfolio tab; semester check-in as modal flow.  
**Desktop:** Split view — About Me form left, timeline + recommendations right.

---

## Journey Lifecycle

```
Grade 7-8 (Explore) → Grade 9 (Onboard) → Grades 10-11 (Pathway) → Grade 12 (Launch) → Alumni (Connect)
         │                    │                      │                      │                │
    About Me v1          Academy join           Future Center link      Applications      Alumni profile
    Kindness/service     Portfolio start        Certifications          Scholarships      Mentorship
```

### Grade-band behaviors

| Band | Focus | Required touchpoints |
|------|-------|---------------------|
| 7–8 | Exploration, clubs, kindness | Annual About Me; club join nudge |
| 9 | Academy selection, habits | Fall semester check-in; academy commitment |
| 10–11 | Depth, Future Center | Semester check-in; internship interest capture |
| 12 | Applications, capstone | Monthly check-in Sep–Apr; graduation checklist |
| Alumni | Network, giving | Optional profile refresh; mentor opt-in |

---

## About Me Profile

### Field groups

#### Identity & learning (all grades)

| Field | Type | Required | Visibility |
|-------|------|----------|------------|
| `displayName` | string | yes | Public (campus) |
| `bio` | text (500) | no | Campus |
| `interests` | string[] (tags) | no | Self, advisors, AI |
| `strengths` | string[] | no | Self, advisors, AI |
| `growthAreas` | string[] | no | Self, advisors, counselor, AI |
| `learningStyle` | enum | no | Self, advisors, AI |
| `communicationPreference` | enum | no | Advisors |

`learningStyle` enum: `VISUAL`, `AUDITORY`, `HANDS_ON`, `READING`, `MIXED`

#### Goals (grade-gated)

| Field | Grades | Type |
|-------|--------|------|
| `shortTermGoals` | all | text[] |
| `academyGoals` | 9+ | text |
| `collegeInterest` | 10+ | boolean + text |
| `tradeInterest` | 10+ | boolean + text |
| `militaryInterest` | 10+ | boolean |
| `serviceHoursGoal` | all | number |

#### Values & service

| Field | Type |
|-------|------|
| `faithCommunityInvolvement` | optional text (school-appropriate) |
| `servicePassions` | string[] |
| `leadershipExperiences` | text |

#### Privacy controls

| Field | Type |
|-------|------|
| `aiRecommendationsEnabled` | boolean (default true) |
| `shareWithParents` | boolean (default true for minors) |
| `shareWithMentors` | boolean (default false) |

---

## Semester Updates

Structured check-in **2× per school year** (fall + spring); seniors add monthly during application season.

### Check-in schema (`JourneyCheckIn`)

| Field | Type | Notes |
|-------|------|-------|
| `semester` | enum | `FALL`, `SPRING` |
| `schoolYear` | string | e.g. `2026-2027` |
| `academicReflection` | text | Free response |
| `proudestMoment` | text | Feeds portfolio prompt |
| `challenges` | text | Counselor flag optional |
| `academyProgressRating` | 1–5 | |
| `wellbeingCheck` | enum | `GREAT`, `OK`, `NEED_SUPPORT` — triggers counselor notification on `NEED_SUPPORT`, not AI counseling |
| `updatedGoals` | json | Diff from About Me goals |
| `completedAt` | datetime | |

**UX:** 5–7 minute flow; save draft; advisor sees aggregate, not raw wellbeing text without counselor role.

---

## Journey Milestones

Auto-generated + manual entries on timeline.

| Milestone type | Source | Example |
|----------------|--------|---------|
| `ACADEMY_JOIN` | `AcademyMembership` | Joined Cybersecurity Academy |
| `CERTIFICATION` | `Certification` progress | CompTIA pathway module complete |
| `PORTFOLIO` | `PortfolioItem` published | Capstone project |
| `SERVICE` | `EventParticipant` hours | 50 service hours |
| `LEADERSHIP` | Org role | Club president |
| `AWARD` | Admin grant / badge | Blue Don Citizenship |
| `FUTURE` | Future Center | First college application submitted |
| `CUSTOM` | Advisor/student | Personal milestone |

---

## AI Recommendation Inputs (Architecture Only)

**No LLM implementation in this blueprint.** Defines data contract for Student Journey AI (see `17_AI_ARCHITECTURE.md`).

### Input signal bundle (`JourneyAiContext`)

| Signal | Source table/service | Weight |
|--------|---------------------|--------|
| About Me fields | `AboutMe` | High |
| Latest check-in | `JourneyCheckIn` | High |
| Academy memberships + progress | `AcademyMembership`, progress tables | High |
| Portfolio tags/types | `PortfolioItem` | Medium |
| Event participation | `EventParticipant` | Medium |
| Future Center interests | `CareerPlan` | High (10+) |
| Rewards badges | `UserBadge` | Low |
| Kindness actions | `KindnessAction` | Low |
| Grades (FERPA) | FACTS via `SisGrade` | Medium — opt-in display to AI |

### Output types (`JourneyRecommendation`)

| Type | Example | Surfaces |
|------|---------|----------|
| `ACADEMY` | "Try Networking Academy module X" | Dashboard widget, AI Assistant |
| `EVENT` | "Robotics club drive this week" | Dashboard, notifications |
| `FUTURE` | "Add ACT date to Future Center" | Future Center |
| `PORTFOLIO` | "Document your service project" | Portfolio |
| `SERVICE` | "15 hours to reach goal" | Journey timeline |
| `WELLBEING` | "Talk with Mrs. Smith" (human link only) | Check-in follow-up |

### Guardrails (AI1–AI6)

- Recommendations are **suggestions** with "Not now" / "Don't suggest again"
- No mental health diagnosis; `NEED_SUPPORT` routes to counselor workflow, not AI
- Students can disable AI via `aiRecommendationsEnabled`
- Audit log: `AiRecommendation` stores inputs hash + output + user feedback
- Parent visibility respects `shareWithParents`

### Processing model (future)

```
Event (check-in saved, portfolio published, etc.)
  → queue JourneyAiJob
  → build JourneyAiContext (read-only aggregators)
  → LLM / rules engine (Phase 23)
  → persist JourneyRecommendation
  → notify dashboard widget + optional push
```

---

## Proposed Prisma Models

```prisma
model AboutMe {
  id                        String   @id @default(cuid())
  userId                    String   @unique @map("user_id") @db.Uuid
  bio                       String?
  interests                 String[] @default([])
  strengths                 String[] @default([])
  growthAreas               String[] @default([]) @map("growth_areas")
  learningStyle             LearningStyle? @map("learning_style")
  shortTermGoals            Json?    @map("short_term_goals")
  academyGoals              String?  @map("academy_goals")
  collegeInterest           Boolean  @default(false) @map("college_interest")
  tradeInterest             Boolean  @default(false) @map("trade_interest")
  militaryInterest          Boolean  @default(false) @map("military_interest")
  serviceHoursGoal          Int?     @map("service_hours_goal")
  aiRecommendationsEnabled  Boolean  @default(true) @map("ai_recommendations_enabled")
  shareWithParents          Boolean  @default(true) @map("share_with_parents")
  shareWithMentors          Boolean  @default(false) @map("share_with_mentors")
  version                   Int      @default(1)
  updatedAt                 DateTime @updatedAt @map("updated_at")
  user                      User     @relation(...)
  @@map("about_me")
}

model JourneyCheckIn {
  id                    String   @id @default(cuid())
  userId                String   @map("user_id") @db.Uuid
  schoolYear            String   @map("school_year")
  semester              Semester
  academicReflection    String?  @map("academic_reflection")
  proudestMoment        String?  @map("proudest_moment")
  challenges            String?
  academyProgressRating Int?     @map("academy_progress_rating")
  wellbeingCheck        WellbeingCheck? @map("wellbeing_check")
  updatedGoals          Json?    @map("updated_goals")
  status                CheckInStatus @default(DRAFT)
  completedAt           DateTime? @map("completed_at")
  user                  User     @relation(...)
  @@unique([userId, schoolYear, semester])
  @@map("journey_check_ins")
}

model JourneyMilestone {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  type        MilestoneType
  title       String
  description String?
  occurredAt  DateTime @map("occurred_at")
  sourceType  String?  @map("source_type")
  sourceId    String?  @map("source_id")
  user        User     @relation(...)
  @@index([userId, occurredAt])
  @@map("journey_milestones")
}

model JourneyRecommendation {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  type        RecommendationType
  title       String
  body        String
  actionUrl   String?  @map("action_url")
  status      RecommendationStatus @default(ACTIVE)
  dismissedAt DateTime? @map("dismissed_at")
  createdAt   DateTime @default(now()) @map("created_at")
  @@index([userId, status])
  @@map("journey_recommendations")
}
```

---

## Permissions

| Action | Permission |
|--------|------------|
| Edit own About Me | `journey:edit_self` |
| Submit check-in | `journey:edit_self` |
| View own timeline | `journey:edit_self` |
| View student journey (summary) | `journey:view_students` |
| View student wellbeing detail | `counselor` role or `journey:view_students` + audit |
| Create manual milestone | `journey:view_students` (advisor+) |
| Trigger AI job | system / `ai:use` |

Parent sees summary fields only if `shareWithParents` is true.

---

## Mobile vs Desktop

| Feature | Mobile | Desktop |
|---------|--------|---------|
| About Me | Stepped wizard (one group per screen) | Single scrollable form |
| Check-in | Push notification → modal | Dashboard card → full page |
| Timeline | Vertical cards, infinite scroll | Timeline with year sidebar |
| AI recommendations | Bottom sheet | Inline panel on journey page |

---

## Scalability Notes

- Milestone generation via event-driven jobs (not synchronous on every page load)
- `JourneyAiContext` built from materialized view refreshed nightly + on-demand after check-in
- Archive journey data on alumni transition; retain 7 years per `18_SECURITY_PRIVACY.md`
- Full-text search on milestones for advisor queries (paginated)

---

## Mapping to Phase 0–15 Code

| As-built | Gap |
|----------|-----|
| `PortfolioItem` | Journey timeline should ingest portfolio events |
| `/pathways` | Links to academies; becomes Future Center feeder |
| `StudentProgressWidget` | Academy slice of journey; not full About Me |
| AI placeholder in `learning-flow.tsx` | Module-scoped only; journey AI is separate entry |
| No `StudentProfile` / grade | Required for grade-band UX (Phase 16) |
| `LeaderboardEntry` | Optional low-weight AI signal |

**Phase alignment:** Phase 18 (About Me + check-ins), Phase 23 (AI recommendations).

---

## Related Documents

- [07_PERSONALIZED_DASHBOARD.md](./07_PERSONALIZED_DASHBOARD.md)
- [11_FUTURE_CENTER.md](./11_FUTURE_CENTER.md)
- [17_AI_ARCHITECTURE.md](./17_AI_ARCHITECTURE.md)
