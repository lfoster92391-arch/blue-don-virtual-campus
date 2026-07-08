# The Blue Don Technical Architecture

**Document 3 of 5 — Foundational Documents**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for development and operations  
**Audience:** Developers, architects, IT administrators, security reviewers  

**Companion documents:** [Constitution](./BLUE_DON_CONSTITUTION.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Blue Don Virtual Campus is a **Next.js full-stack web application** deployed on **Vercel**, with **PostgreSQL** (Supabase) as the system of record, **Supabase Auth** for identity, and **Prisma** as the ORM. Business logic lives in **server actions** and **service modules**; the UI is **React + Tailwind + shadcn/ui**.

External systems — **Google Workspace**, **Google Classroom**, **Google Calendar**, and **FACTS SIS** — connect through a planned **integration service layer** with queued sync jobs. **Role-based access control** enforces permissions on every server mutation.

> **Build reference:** [Blue Don System Blueprint](./BLUE_DON_SYSTEM_BLUEPRINT.md) — unified schema, six core engines, module connections, migration waves, and automation catalog.

---

## Part I — System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                        │
│   Browser (PWA)  ·  Mobile web  ·  Asset Pilot EDU embed (partner)    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼─────────────────────────────────────────┐
│                    VERCEL (Next.js 16 App Router)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ App Routes  │  │ Server       │  │ API Routes   │  │ Middleware  │ │
│  │ (RSC/SSR)   │  │ Actions      │  │ /api/health  │  │ Auth session│ │
│  └──────┬──────┘  └──────┬───────┘  └──────────────┘  └─────────────┘ │
│         │                │                                              │
│  ┌──────▼────────────────▼──────────────────────────────────────────┐  │
│  │              Service Layer (src/services/)                        │  │
│  └──────┬───────────────────────────────────────────────────────────┘  │
└─────────┼──────────────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┬─────────────┬──────────────────┬────────────────────┐
    ▼           ▼             ▼                  ▼                    ▼
┌────────┐ ┌─────────┐ ┌───────────┐ ┌─────────────────┐ ┌──────────────┐
│Supabase│ │ Supabase│ │ Google    │ │ FACTS SIS API   │ │ Asset Pilot  │
│Postgres│ │ Auth    │ │ APIs      │ │                 │ │ EDU (partner)│
│(Prisma)│ │         │ │ Class/Cal │ │                 │ │              │
└────────┘ └─────────┘ └───────────┘ └─────────────────┘ └──────────────┘
```

---

## Part II — Technology Stack

| Layer | Technology | Version / notes |
|-------|------------|-----------------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | Strict mode |
| UI | React | 19.x |
| Styling | Tailwind CSS | v4 |
| Components | shadcn/ui + Base UI | Accessible primitives |
| ORM | Prisma | 7.x, PostgreSQL adapter |
| Database | PostgreSQL | Supabase-hosted |
| Auth | Supabase Auth | Email/password, Google OAuth |
| Hosting | Vercel | Preview + production |
| PWA | Web manifest + service worker | Install prompt |
| Icons | sharp (build) | PWA icon generation |
| CI | GitHub Actions | Lint, typecheck, build |

### Environment variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | Server | Postgres connection (Prisma) |
| `DATABASE_POOLER_URL` | Server | Optional PgBouncer URL (Vercel) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Public auth key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Admin auth API (password reset, user create) |
| `NEXT_PUBLIC_APP_URL` | Client + server | Canonical origin (auth redirects, PWA) |
| `NEXT_PUBLIC_PARTNER_SITE_URL` | Client | Asset Pilot EDU partner link |
| `ASSETPILOT_SITE_URL` | Server | Partner fallback |
| `SUPABASE_POOLER_REGION` | Server | Pooler region hint |
| `VERCEL_URL` | Server | Auto-set; fallback app URL |

**Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `DATABASE_URL` to the client bundle.

---

## Part III — Application Architecture

### Folder structure

```
src/
  app/
    (auth)/              # Login, register, onboarding, password reset
    (campus)/            # Authenticated campus routes
    auth/                # Callback, signout route handlers
    api/                 # Health and future webhooks
    layout.tsx           # Root layout, metadata, PWA icons
  components/
    auth/                # Login, register, password forms
    brand/               # BrandLogo
    dashboard/           # Widgets, quick actions
    forms/               # Form fill, admin form UI
    layout/              # Shell, sidebar, header
    service-desk/        # Ticket and account UI
    ui/                  # shadcn primitives
  config/
    site.ts              # Brand, phase, URLs
    navigation.ts        # Primary nav (single source)
    roles.ts             # RBAC permission maps
    dashboard-layouts.ts # Persona widget registry
    env.ts               # Validated environment
  features/
    auth/                # Auth server actions
    forms/               # Form server actions
    admin/               # User management actions
  lib/
    auth/                # Session, permissions, mappers
    supabase/            # Client, server, admin, middleware
    prisma.ts            # Database client proxy
  services/              # Business logic (one per domain)
  types/                 # Shared TypeScript types
prisma/
  schema.prisma          # Data model
  migrations/            # Versioned SQL migrations
  seed*.ts               # Demo and academy seed data
docs/
  FOUNDATIONAL_DOCUMENTS.md
  BLUE_DON_CONSTITUTION.md
  BLUE_DON_PRODUCT_BLUEPRINT.md
  BLUE_DON_TECHNICAL_ARCHITECTURE.md
```

### Request flow (authenticated page)

```
1. Middleware (updateSession) — refresh Supabase session cookie
2. Route layout — requireCompleteProfile() if campus route
3. Page (Server Component) — call service layer
4. Service — Prisma queries, permission checks
5. Render — ShellPage + client components as needed
6. Mutation — Server Action → permission check → service → revalidatePath
```

### Server actions pattern

```typescript
// features/<domain>/actions.ts
"use server";

export async function someAction(prevState, formData) {
  const user = await requireCompleteProfile();
  if (!hasPermission(user.role, "domain:action")) {
    return { error: "..." };
  }
  const result = await someService(input);
  revalidatePath("/relevant-route");
  return { success: "..." };
}
```

**Rules:**
- Every mutation checks permissions server-side.
- Business logic in `services/`, not in actions or page components.
- Return `{ error?, success? }` for form actions; use `redirect()` only when appropriate.

### API routes (current & planned)

| Route | Method | Purpose | Status |
|-------|--------|---------|--------|
| `/api/health` | GET | App + DB health probe | Built |
| `/auth/callback` | GET | OAuth / magic link / recovery exchange | Built |
| `/auth/signout` | POST | Session termination | Built |
| `/api/integrations/webhooks/google` | POST | Push notifications (future) | Planned |
| `/api/integrations/webhooks/facts` | POST | FACTS delta (future) | Planned |
| `/api/cron/sync-*` | POST | Vercel cron sync jobs (future) | Planned |

**Default:** Prefer server actions for campus mutations. Reserve API routes for webhooks, health, and third-party callbacks.

---

## Part IV — Authentication & Sessions

### Providers

| Method | Flow |
|--------|------|
| Email + password | `signInWithPassword` → session cookie |
| Google OAuth | `signInWithOAuth` → `/auth/callback` → session |
| Admin-created account | Service role `createUser` + `email_confirm: true` |
| Password reset | `resetPasswordForEmail` → callback → `/reset-password` → `updateUser` |

### Session management

- **@supabase/ssr** cookie adapter in middleware and server client.
- `requireUser()` — authenticated or redirect `/login`.
- `requireCompleteProfile()` — onboarded or redirect `/onboarding`.
- Campus user profile synced to Prisma `User` via `ensureUserProfile()` on callback.

### Auth routes (public)

`/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/callback`, `/auth/signout`

### Admin auth operations

| Operation | API | Permission |
|-----------|-----|------------|
| Create user | `supabase.auth.admin.createUser` | `users:manage` |
| Reset password | `supabase.auth.admin.updateUserById` | `users:manage` |
| Assign role | Prisma `User.role` update | `users:manage` |

Uses `src/lib/supabase/admin.ts` (service role client).

---

## Part V — Permissions & Authorization

### Two-layer model

| Layer | Storage | Scope |
|-------|---------|-------|
| **Global campus role** | `User.role` | Platform-wide permissions |
| **Org membership role** | `OrganizationMembership.orgRole` | Per-organization permissions |

### Permission check functions

| Function | Use |
|----------|-----|
| `hasPermission(role, key)` | Global RBAC |
| `hasOrgPermission(userId, orgId, key)` | Org-scoped RBAC |
| `canAccessAdmin(role)` | `admin:access` |
| `canManageUsers(role)` | `users:manage` |
| `canManageForms(role)` | `forms:manage` |
| `canApproveForms(role)` | `forms:approve` |
| `requireCompleteProfile()` | Auth gate for actions |

### Permission key namespaces

**Global domains:** `campus`, `admin`, `users`, `events`, `forms`, `academy`, `org`, `checklists`, `portfolio`, `knowledge`, `tickets`, `labs`, `simulators`, `impact_fund`, `journey`, `future`, `rewards`, `feed`, `athletics`, `integrations`, `parent`, `alumni`, `ai`, `broadcasts`, `leadership`

**Org domains:** `org:announcements`, `org:events`, `org:members`, `org:media`, `org:feed`, `org:store`, `org:resources`, `org:view`

**Broadcasts:** See [BLUE_DON_BROADCASTS.md](./BLUE_DON_BROADCASTS.md) — `broadcasts:create`, `broadcasts:approve`, `broadcasts:publish_critical`, position-scoped audience keys.

Full matrix: `docs/enterprise-blueprint/06_RBAC_PERMISSIONS.md` and `src/config/roles.ts`.

### Enforcement points

1. Server actions (primary)  
2. Page-level redirects (`redirect("/dashboard")`)  
3. Service layer guards (defense in depth)  
4. Future: API route middleware for webhooks with service keys  

**Never** rely on UI-only hiding of buttons.

---

## Part VI — Database Architecture

### Source of truth

`prisma/schema.prisma` — all schema changes via `prisma migrate dev` (local) and `prisma migrate deploy` (production).

### Domain groups (as-built)

| Domain | Key models | Phase |
|--------|------------|-------|
| **Identity** | `User`, `School` | 2 |
| **Academies** | `Academy`, `AcademyMembership`, `AcademyLevel`, `LearningModule`, `Lesson`, `Video`, `Assessment`, `Mission`, `Certification`, `Lab`, `Simulator`, `StudentModuleProgress`, `StudentAcademyProgress`, `StudentCertification`, `LeaderboardEntry` | 6, 13–15 |
| **Organizations** | `Organization`, `OrganizationMembership` | 16 |
| **Events** | `Event`, `EventParticipant`, `EventReminder`, `Assignment` | 4 |
| **Forms** | `Form`, `FormSubmission` | 5 |
| **Checklists** | `Checklist`, `ChecklistItem`, `ChecklistItemCompletion` | 7 |
| **Portfolio** | `PortfolioItem` | 8 |
| **Service** | `Ticket`, `TicketComment` | 9 |
| **Knowledge** | `KnowledgeArticle` | 10 |
| **Impact Fund** | `ImpactFundProposal`, `ImpactFundVote` | 12 |
| **Pathways** | `AcademyPathwayMapping` | 13 |

### Enumerations (workflow states)

| Enum | Values |
|------|--------|
| `UserRole` | ADMIN, ADVISOR, TEACHER, STUDENT, PARENT, SPONSOR, ALUMNI, STAFF, COACH, COUNSELOR |
| `FormStatus` | DRAFT, REVIEW, APPROVED, PUBLISHED, COMPLETE, ARCHIVED |
| `FormType` | 13 required types + CUSTOM |
| `ApprovalType` | JOIN_ACADEMY, PURCHASE, SPONSOR, EVENT, TRAVEL, IMPACT_FUND, CAPSTONE, PUBLISHING |
| `EventStatus` | DRAFT, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED |
| `AcademyLevelTier` | EXPLORER → INDUSTRY_CAPSTONE (7 tiers) |
| `OrganizationType` | CLUB, CLASS, TEAM, ACADEMY, DEPARTMENT |
| `OrgMembershipRole` | LEAD, OFFICER, MODERATOR, MEMBER |

### Cross-cutting patterns

| Pattern | Implementation |
|---------|----------------|
| Archive (no delete) | `archiveFlag` on Form, Event, Lab, Simulator, Checklist, ImpactFundProposal |
| Soft workflow | Status enums; transitions via server actions |
| JSON flexibility | `formFields`, `responseData`, `questions` (assessments) |
| UUID users | `User.id` matches Supabase Auth UUID |
| Timestamps | `createdAt`, `updatedAt` on all major models |

### Planned schema extensions

| Domain | Proposed models | Depends on |
|--------|-----------------|------------|
| Integrations | `ExternalAccount`, `SyncJob`, `ExternalEntityLink` | Phase 18+ |
| SIS | `SisEnrollment`, `SisGrade`, `ParentGuardian`, `StudentProfile` | FACTS sync |
| Identity | `StudentProfile`, `QrScanLog`, `HallPass`, `EquipmentLoan`, `PassportStamp`, `WalletTicket` | Blue Don ID |
| Operations | `CampusRequest`, `DepartmentWorkspace`, `EquipmentReservation`, `FundraisingCampaign`, `PartnerOpportunity` | Campus Operations |
| Journey | `JourneyMilestone`, `JourneyAchievement`, `StoryChapter`, `YearInReview`, `MemoryVaultYear`, `ClassTimeCapsule`, `ClassLegacy` | My Madonna Journey |
| Events v2 | `EventPublication` | Event Hub |
| Rewards | `XpLedger`, `CoinTransaction`, `Badge`, `UserBadge` | Rewards System |
| Community | `FeedPost`, `FeedReaction`, `FeedReport` | Community Feed |
| Media | `MediaAsset`, `MediaAlbum` | Media Center |
| AI | `AiConversation`, `AiMessage` | Blue Don AI |

### Indexing strategy

- Foreign keys indexed (`userId`, `academyId`, `eventId`, etc.).
- Status and `archiveFlag` indexed for list filters.
- Unique constraints on natural keys (`slug`, `formId+userId`, `academyId+slug`).
- Future: composite indexes for feed/calendar queries at scale.

### Migrations

| Migration | Phase |
|-----------|-------|
| `20250622000000_phase2_auth` | Users, schools |
| `20250703000000_phase4_calendar_events` | Events |
| `20250703120000_phase5_forms_governance` | Forms |
| `20250703140000_phases_6_10_mvp_systems` | Academies, checklists, portfolio, tickets, knowledge |
| `20250703160000_phase12_labs_simulators_impact_fund` | Labs, simulators, impact fund |
| `20250703180000_phase13_academy_engine` | Learning engine |
| `20250707100000_phase16_rbac_orgs` | Extended roles, organizations |

---

## Part VII — Service Layer

| Service | Responsibility |
|---------|----------------|
| `user-service` | Profile CRUD, onboarding, role assign, list users, create campus user |
| `form-service` | Forms list, submit, approve, compliance |
| `event-service` | Events, participants, reminders |
| `academy-service` | Memberships, academy list |
| `academy-engine-service` | Modules, progress, certifications, detail |
| `ticket-service` | Service desk tickets |
| `portfolio-service` | Portfolio items |
| `checklist-service` | Checklists and completions |
| `knowledge-service` | Articles |
| `impact-fund-service` | Proposals and votes |
| `dashboard-service` | Dashboard view model aggregation |
| `org-service` | Organization memberships (Phase 16) |
| `lab-service` / `simulator-service` | Lab sessions, simulator runs |

**Convention:** `list*`, `get*`, `create*`, `update*` naming; return `null` or `[]` when DB unavailable (graceful degradation in dev).

---

## Part VIII — Integrations

### Integration principles

| # | Rule |
|---|------|
| I1 | External sync via **queued jobs**, not synchronous request blocking |
| I2 | Store **external IDs** on link tables (`ExternalEntityLink`) |
| I3 | **Read-only first** for FACTS and Classroom; outbound writes require approval |
| I4 | Health probes exposed at `/api/health` and `/admin/integrations/health` |
| I5 | Tokens **encrypted at rest**; never log secrets |
| I6 | **FACTS is source of truth** for demographics; Google for assignments |

### Integration topology

```
Integration Service Layer (planned: src/services/integration-service.ts)
├── google-workspace/     # Directory, SSO, group → role mapping
├── google-classroom/     # Courses, rosters, assignments
├── google-calendar/      # Event publish, ICS subscribe
├── facts-sis/            # Students, parents, grades, enrollments
└── asset-pilot/          # Partner cross-link (built)
```

### Google Workspace

| Feature | Priority | Direction |
|---------|----------|-----------|
| Google OAuth signup | P0 | **Built** |
| Directory sync | P1 | Inbound — users, groups |
| Group → org mapping | P2 | `google_group_id` on Organization |
| Profile enrichment | P0 | Email, avatar from Google |

**Flow:** Admin connects domain → service account with domain-wide delegation → nightly `workspace-directory-sync` job → match by email → upsert `User` → role from configurable group mapping.

### Google Classroom

| Feature | Priority | Direction |
|---------|----------|-----------|
| Course roster import | P1 | Inbound |
| Assignment sync | P1 | Inbound → `Assignment` |
| Coursework deep link | P2 | Display only |
| Grade passback | P3 | Outbound (approval required) |

**Mapping:**

| Classroom | Blue Don |
|-----------|----------|
| Course | `Organization` (type CLASS) |
| Student | `User` + `OrganizationMembership` |
| CourseWork | `Assignment` |
| Due date | `Assignment.dueDate` |

**Conflict policy:** Classroom is source of truth for assignments; local edits flag `syncConflict` for teacher resolution.

### Google Calendar

| Feature | Priority | Direction |
|---------|----------|-----------|
| Publish campus events | P1 | Outbound |
| ICS subscribe | P2 | Outbound |
| Personal two-way sync | P3 | Bidirectional |

**Flow:** Event published with `EventPublication` surface `GOOGLE_CALENDAR` → job `google-calendar-push` → store `googleCalendarEventId` on `Event`. Updates re-queue; archive removes from Google.

**Stub today:** UI message on event detail — replace with connection status.

### FACTS SIS

| Feature | Priority | Direction |
|---------|----------|-----------|
| Student demographics | P0 | Inbound |
| Grade level / cohort | P0 | `StudentProfile` |
| Parent–student links | P0 | `ParentGuardian` |
| Class enrollments | P1 | Class org memberships |
| Grades (GPA) | P2 | `SisGrade` — Future Center opt-in |
| Attendance | P2 | Counselor dashboard flags |

**Flow:**

1. Admin configures FACTS API credentials (encrypted env).
2. Nightly `facts-full-sync` + hourly `facts-delta-sync`.
3. Upsert `User` by `factsPersonId`.
4. Sync `StudentProfile.gradeLevel`, `cohortYear`.
5. Sync `ParentGuardian` with `verified=true`.
6. Class enrollments → class org memberships.
7. Conflict queue for email mismatches.

**FERPA:** Grades never exposed to sponsors; parents only linked children; AI uses grades only if `aiRecommendationsEnabled` + school policy.

### Asset Pilot EDU (partner)

**Built:** Cross-link configuration, partner back link, embed dashboard route, shared branding integration.

See `docs/ASSETPILOT_INTEGRATION.md`.

### Planned integration models

```prisma
model ExternalAccount {
  id            String   @id @default(cuid())
  userId        String   @db.Uuid
  provider      IntegrationProvider  // GOOGLE, FACTS
  externalId    String
  accessToken   String?  // encrypted
  refreshToken  String?
  tokenExpires  DateTime?
  scopes        String[]
  status        ConnectionStatus
  lastSyncAt    DateTime?
  @@unique([userId, provider])
}

model SyncJob {
  id          String   @id @default(cuid())
  provider    IntegrationProvider
  jobType     String
  status      JobStatus
  payload     Json?
  result      Json?
  error       String?
  startedAt   DateTime?
  completedAt DateTime?
}

model ExternalEntityLink {
  id          String   @id @default(cuid())
  provider    IntegrationProvider
  entityType  String   // user, class, event, assignment
  localId     String
  externalId  String
  lastSynced  DateTime
  @@unique([provider, entityType, localId])
}
```

---

## Part IX — Deployment & Operations

### Environments

| Environment | Branch | URL |
|-------------|--------|-----|
| Local | — | `http://localhost:3000` |
| Preview | PR branches | `*.vercel.app` |
| Production | `main` | `https://campus.assetpilotedu.com` |

### Deployment pipeline

```
git push → GitHub → Vercel build
  ├── node scripts/generate-pwa-icons.mjs
  ├── prisma generate
  └── next build
→ Preview URL (PR) or Production (main, approval gate)
```

### Production checklist

1. Set all env vars in Vercel (see Part II).  
2. `SUPABASE_SERVICE_ROLE_KEY` for account management.  
3. Supabase Auth URL Configuration:
   - Site URL: production domain
   - Redirect URLs: `https://campus.assetpilotedu.com/**`, preview URLs
4. Run `prisma migrate deploy` against production DB.  
5. Run `npm run db:seed` for demo data (non-prod) or selective seed in prod.  
6. Verify `GET /api/health`.  
7. Test auth: login, password reset, admin user create.

### Database operations

| Command | Use |
|---------|-----|
| `npm run db:generate` | Regenerate Prisma client after schema change |
| `npm run db:migrate` | Create + apply migration (local dev) |
| `prisma migrate deploy` | Apply pending migrations (CI/production) |
| `npm run db:seed` | Seed Madonna academies, forms, orgs |
| `npm run db:push` | Prototype only — prefer migrations for shared envs |

### PWA

- Manifest: `/manifest.webmanifest`
- Icons generated at build from `public/icons/source-logo.png`
- Service worker for offline shell (see `docs/PWA.md`)
- Install prompt component on dashboard

### Monitoring (roadmap)

| Signal | Tool |
|--------|------|
| Uptime | Vercel + `/api/health` |
| Errors | Sentry (Phase 11+) |
| Analytics | PostHog (Phase 11+) |
| Integration sync | `SyncJob` table + admin dashboard |

---

## Part X — Security & Privacy

### Threat model summary

| Threat | Mitigation |
|--------|------------|
| Unauthorized data access | RBAC on every action; org scope |
| Session hijack | HttpOnly cookies, Supabase session refresh |
| Service role leak | Server-only import; never in client bundle |
| CSRF | Next.js server actions + SameSite cookies |
| XSS | React escaping; sanitize rich text (future) |
| Student data exposure | FERPA classification; parent linkage verified |
| AI prompt injection | Guardrails, scoped context, audit logs |
| Integration token theft | Encrypted storage; rotate on compromise |

### Data classification

| Class | Examples | Default access |
|-------|----------|----------------|
| Public | School announcements, published events | Campus-authenticated |
| Directory | Name, grade, academy | Role-filtered |
| Academic | Assignments, progress | Student + authorized staff |
| Governance | Signed forms | Student + admin/advisor |
| Sensitive | Discipline, health-adjacent | Restricted roles only |

### Compliance alignment

- **FERPA** — Educational records; no sale of data; audit exports (roadmap).  
- **COPPA** — Parental consent for under-13 where applicable.  
- **Constitution Article XI** — Privacy principles govern all new features.

---

## Part XI — Performance & Scalability

### Current patterns

- Server Components for data-fetching pages (reduce client JS).
- Prisma connection pooling via PgBouncer on Vercel (`DATABASE_POOLER_URL`).
- `max: 1` pool size per serverless instance (Prisma adapter).
- Parallel `Promise.all` in dashboard-service for widget data.

### Future patterns

| Concern | Approach |
|---------|----------|
| Large lists | Cursor pagination, `take`/`skip` |
| Calendar aggregation | Materialized view or cache table |
| Feed | Fan-out on write vs. read (TBD at scale) |
| Media | Object storage (Supabase Storage or S3) |
| Search | Postgres full-text or dedicated search service |
| Background jobs | Vercel Cron or queue worker for sync jobs |

---

## Part XII — Development Standards

### Pre-implementation gate (A1–A6)

Document before coding:

1. **Placement** — Module, nav item, mobile priority  
2. **Database** — Models, migration, seed  
3. **Permissions** — RBAC keys, org scope  
4. **Navigation** — `navigation.ts` entry  
5. **Responsive** — Layout, touch targets  
6. **Scalability** — Pagination, caching  

### Quality gates

| Gate | Command |
|------|---------|
| Type safety | `npm run typecheck` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Migration | `prisma migrate dev` (local) |

### Code conventions

- Match existing patterns in surrounding files.  
- Minimal diff; no drive-by refactors.  
- Server actions return `{ error?, success? }` for forms.  
- Use `ShellPage`, `DashboardCard`, brand tokens.  
- Archive flag instead of hard delete for governance records.

---

## Appendix A — Health check

`GET /api/health` returns:

- Application status  
- Database connectivity (when configured)  
- Supabase configuration flag  
- Phase / version metadata  

Used by deployment verification and future uptime monitoring.

---

## Appendix B — Deep-dive references

| Topic | Document |
|-------|----------|
| Integrations detail | `enterprise-blueprint/13_INTEGRATIONS.md` |
| RBAC matrix | `enterprise-blueprint/06_RBAC_PERMISSIONS.md` |
| Database gap analysis | `enterprise-blueprint/02_GAP_ANALYSIS.md` |
| Deployment | `docs/DEPLOYMENT.md` |
| PWA | `docs/PWA.md` |
| Asset Pilot partner | `docs/ASSETPILOT_INTEGRATION.md` |
| Prisma schema | `prisma/schema.prisma` |
| Development rules | `enterprise-blueprint/04_DEVELOPMENT_RULES.md` |

---

*Madonna High School · Blue Don Virtual Campus*  
*Choose Your Path. Build Your Future.*
