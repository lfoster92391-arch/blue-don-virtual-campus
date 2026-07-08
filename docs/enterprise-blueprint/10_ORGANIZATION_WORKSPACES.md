# 10 — Organization Workspaces

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `06_RBAC_PERMISSIONS.md`, `09_EVENT_ENGINE.md`  
**Current implementation:** `Academy` + `AcademyMembership`; academy pages at `/academies/[slug]`

---

## Purpose

Define the **unified workspace model** for clubs, classes, teams, and academies — one template, one route pattern, membership-based tabs. Eliminates duplicate org page types (P3).

---

## Navigation Placement

| Surface | Route | Parent nav |
|---------|-------|------------|
| **Org index (clubs)** | `/student-life` | Student Life |
| **Org index (teams)** | `/athletics` | Athletics |
| **Org index (classes)** | `/school-hub/classes` | School Hub (staff) |
| **Workspace** | `/orgs/[slug]` | Contextual — entered from index or dashboard |
| **Academy (bridge)** | `/academies/[slug]` | Academies — redirects or renders same workspace template with `type=ACADEMY` |

**Org switcher:** Sticky header when inside `/orgs/*` — lists user's memberships (max 10 visible + search).

**Mobile:** Bottom nav hides; org sub-nav becomes horizontal scroll tabs. Back returns to parent index.

---

## Organization Types

| Type | `OrganizationType` | Created by | Roster source |
|------|---------------------|------------|---------------|
| Club | `CLUB` | admin, advisor, student petition | Self-join + approval |
| Class | `CLASS` | teacher, admin | FACTS roster sync |
| Team | `TEAM` | coach, admin | Coach + FACTS athletics |
| Academy | `ACADEMY` | admin (seeded) | Academy join workflow |
| Department | `DEPARTMENT` | admin | Staff assignment |

---

## Workspace Tab Catalog

Single template component: `OrganizationWorkspace` with config-driven tabs.

| Tab | Route suffix | Visible to | Data |
|-----|--------------|------------|------|
| **Dashboard** | `/` | all members | Metrics, announcements summary, upcoming events |
| **Announcements** | `/announcements` | all members | `OrgAnnouncement` |
| **Calendar** | `/calendar` | all members | Events via Event Engine (`ORG_PAGE` + `CAMPUS_CALENDAR`) |
| **Members** | `/members` | all members (roster); manage: lead/officer | `OrganizationMembership` |
| **Photos** | `/photos` | all members | `MediaAsset` album |
| **Docs** | `/docs` | all members | `OrgDocument` |
| **Events** | `/events` | all members | Event list + create (if permitted) |
| **Fundraisers** | `/fundraisers` | all members | `Fundraiser` campaigns |
| **Store** | `/store` | all members | `OrgStoreItem` (optional) |
| **Leadership** | `/leadership` | all members view; lead manages | Officers, elections |
| **Resources** | `/resources` | all members | Links, playbooks |
| **Learning** | `/learning` | **ACADEMY only** | Existing academy engine modules |
| **Labs** | `/labs` | **ACADEMY only** | Existing labs |
| **Simulators** | `/simulators` | **ACADEMY only** | Existing simulators |

**Rule:** Non-academy orgs hide Learning/Labs/Simulators. Academies show all tabs; learning tabs reuse Phase 13–15 routes internally.

### Tab visibility by org role

| Tab | member | moderator | officer | lead |
|-----|--------|-----------|---------|------|
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Announcements (read) | ✓ | ✓ | ✓ | ✓ |
| Announcements (write) | — | ✓ | ✓ | ✓ |
| Members (manage) | — | — | ✓ | ✓ |
| Leadership | view | view | manage | manage |
| Store (manage) | — | — | — | ✓ |

---

## Workspace Dashboard (per org)

| Widget | Source |
|--------|--------|
| Member count | `OrganizationMembership` ACTIVE |
| Next event | `Event` + `EventPublication` |
| Recent announcement | `OrgAnnouncement` |
| Fundraiser progress | `Fundraiser` |
| Academy progress (academy only) | `academy-engine-service` |
| Team record (team only) | `AthleticSeason` |

---

## Proposed Prisma Models

Extends `Organization` from `06_RBAC_PERMISSIONS.md`:

```prisma
model OrgAnnouncement {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  title          String
  body           String
  pinned         Boolean  @default(false)
  authorId       String   @map("author_id") @db.Uuid
  publishedAt    DateTime @map("published_at")
  @@index([organizationId, publishedAt])
  @@map("org_announcements")
}

model OrgDocument {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  title          String
  fileUrl        String   @map("file_url")
  uploadedById   String   @map("uploaded_by_id") @db.Uuid
  createdAt      DateTime @default(now()) @map("created_at")
  @@map("org_documents")
}

model Fundraiser {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  title          String
  goalCents      Int      @map("goal_cents")
  raisedCents    Int      @default(0) @map("raised_cents")
  status         FundraiserStatus
  eventId        String?  @map("event_id")
  @@map("fundraisers")
}

model OrgStoreItem {
  id             String   @id @default(cuid())
  organizationId String   @map("organization_id")
  name           String
  priceCoins     Int      @map("price_coins")
  inventory      Int?
  active         Boolean  @default(true)
  @@map("org_store_items")
}
```

**Academy bridge:** `Organization.academyId` → `Academy.id` one-to-one during migration; existing `/academies/[slug]` resolves org by slug.

---

## Permissions

See `06_RBAC_PERMISSIONS.md` org matrix. Summary:

| Action | Global | Org |
|--------|--------|-----|
| Create club | `student` (petition), `teacher`, `admin` | — |
| Approve club | `admin`, `advisor` | — |
| Manage class org | `teacher` as `lead` | `org:members:manage` |
| Manage team | `coach` | `lead` on team |
| Post announcement | — | `org:announcements:manage` |
| Upload media | — | `org:media:manage` |

---

## Mobile vs Desktop

| Concern | Desktop | Mobile |
|---------|---------|--------|
| Tab bar | Full horizontal tabs | Scrollable tabs, 4 visible |
| Members | Table with bulk actions | Card list |
| Photos | Masonry grid | 2-column grid |
| Events create | Modal | Full-screen flow |
| Academy learning | Side nav for modules | Existing mobile learning flow |
| Org switcher | Dropdown in shell header | Sheet from header |

---

## Scalability Notes

- Org list paginated (50/page) with type filters
- Announcements: cursor pagination, cache pinned on dashboard
- Media: S3/Supabase storage; CDN for thumbnails
- Full-text search on org name/slug (Phase 24)
- Soft-delete orgs: `status = ARCHIVED`; slugs reserved

---

## Mapping to Phase 0–15 Code

| As-built | Target |
|----------|--------|
| `Academy` model (14 seeded) | `Organization` type `ACADEMY` + bridge field |
| `AcademyMembership` | `OrganizationMembership` |
| `/academies/[slug]` page | Workspace template + Learning tabs |
| Academy events | `Event.academyId` → `organizationId` |
| Academy checklists | Scoped via `Checklist.academyId` |
| Academy leaderboards | Org dashboard widget |
| No clubs/teams | New org types Phase 17–19 |

**Migration:** Phase 17 seeds `Organization` for each `Academy`; Phase 18 enables clubs; Phase 19 athletics teams.

---

## Related Documents

- [06_RBAC_PERMISSIONS.md](./06_RBAC_PERMISSIONS.md)
- [09_EVENT_ENGINE.md](./09_EVENT_ENGINE.md)
- [12_REWARDS_GAMIFICATION.md](./12_REWARDS_GAMIFICATION.md)
