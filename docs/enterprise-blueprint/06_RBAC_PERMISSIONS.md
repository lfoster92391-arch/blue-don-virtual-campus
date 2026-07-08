# 06 — RBAC & Permissions

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `01_INFORMATION_ARCHITECTURE.md`, `03_DEVELOPMENT_RULES.md`  
**Current implementation:** `src/config/roles.ts`, `prisma/schema.prisma` (`UserRole` enum)

---

## Purpose

Define the **14-role access model** for Blue Don Virtual Campus: global campus roles, organization membership roles, permission keys, membership-based access for clubs/academies/athletics, and the migration path from today's 5-role MVP.

---

## Navigation Placement

RBAC is not a user-facing nav destination. It governs:

| Surface | RBAC effect |
|---------|-------------|
| **Primary nav** (`src/config/navigation.ts`) | Items filtered by `getNavigationForRole()` (Phase 16) |
| **Dashboard** | Widget visibility per role + grade context |
| **Organization workspaces** | Tab visibility per org membership role |
| **Administration** | `/admin/*` gated by `admin:access` and domain keys |
| **Parent portal** | `/parent` gated by `parent:portal` + student linkage |
| **Mobile** | Same rules; fewer nav items, no permission bypass |

Utility routes (`/profile`, `/settings`) remain available to all authenticated campus roles.

---

## The 14 Roles

### Layer 1 — Global campus roles (10)

Stored on `User.role` (Prisma `UserRole` enum). One primary role per user; admins may hold secondary **capabilities** via permission grants without changing primary role.

| # | Role key | Label | Description |
|---|----------|-------|-------------|
| 1 | `admin` | Administrator | Full school operations, integrations, compliance |
| 2 | `advisor` | Advisor | Academy oversight, approvals, student mentoring |
| 3 | `teacher` | Teacher | Class instruction, assignments, org workspaces for classes |
| 4 | `student` | Student | Learning, portfolio, student life, rewards |
| 5 | `parent` | Parent | Linked-student visibility, forms, events |
| 6 | `sponsor` | Sponsor | Sponsorship packets, limited event/fund visibility |
| 7 | `alumni` | Alumni | Alumni network, mentorship, giving (post-graduation) |
| 8 | `staff` | Staff | Non-teaching operations (facilities, front office) |
| 9 | `coach` | Coach | Athletics workspaces, rosters, game events |
| 10 | `counselor` | Counselor | Journey/Future Center read access, referral flags (not AI) |

### Layer 2 — Organization membership roles (4)

Stored on `OrganizationMembership.orgRole` (and mirrored on `AcademyMembership` during migration). A user may hold **different org roles in different orgs** simultaneously.

| # | Role key | Label | Typical org types |
|---|----------|-------|-------------------|
| 11 | `lead` | Lead / President | Clubs, teams, academies |
| 12 | `officer` | Officer | Clubs, student government |
| 13 | `moderator` | Moderator | Clubs, Blue Don Corner org channels |
| 14 | `member` | Member | Clubs, classes, teams, academies |

**Rule:** Global role sets the ceiling; org role sets scope within that org. Example: a `student` with `officer` in Robotics Club can manage club announcements but cannot access `/admin`.

---

## Permission Key Namespace

Permissions are colon-delimited strings in `ROLE_PERMISSIONS` (global) and `ORG_ROLE_PERMISSIONS` (membership). New keys require blueprint + test coverage.

### Global permission keys (existing + proposed)

| Domain | Keys |
|--------|------|
| Core | `campus:access`, `admin:access`, `users:manage`, `reports:view` |
| Events | `events:manage`, `events:participate`, `events:publish` |
| Forms | `forms:manage`, `forms:approve`, `forms:submit`, `forms:sign` |
| Academies | `academy:join`, `academy:manage` |
| Organizations | `org:create`, `org:manage`, `org:moderate`, `org:view` |
| Checklists | `checklists:manage`, `checklists:complete` |
| Portfolio | `portfolio:edit`, `portfolio:view_linked` |
| Knowledge | `knowledge:manage`, `knowledge:view` |
| Service | `tickets:create`, `tickets:manage` |
| Labs / Sims | `labs:use`, `labs:manage`, `simulators:use`, `simulators:manage` |
| Impact Fund | `impact_fund:view`, `impact_fund:propose`, `impact_fund:vote`, `impact_fund:manage` |
| Journey | `journey:edit_self`, `journey:view_students`, `journey:recommend` |
| Future Center | `future:explore`, `future:manage_programs` |
| Rewards | `rewards:earn`, `rewards:grant`, `rewards:manage_store` |
| Community | `feed:post`, `feed:moderate`, `media:upload` |
| Athletics | `athletics:view`, `athletics:manage_team` |
| Integrations | `integrations:manage`, `integrations:view_health` |
| Parent | `parent:portal`, `parent:view_student` |
| Alumni | `alumni:portal`, `alumni:mentor` |
| AI | `ai:use`, `ai:audit` |

### Organization-scoped permission keys

Evaluated as `hasOrgPermission(userId, orgId, permission)`:

| Key | lead | officer | moderator | member |
|-----|------|---------|-----------|--------|
| `org:announcements:manage` | ✓ | ✓ | — | — |
| `org:events:manage` | ✓ | ✓ | — | — |
| `org:members:manage` | ✓ | ✓ | — | — |
| `org:media:manage` | ✓ | ✓ | ✓ | — |
| `org:feed:moderate` | ✓ | ✓ | ✓ | — |
| `org:store:manage` | ✓ | — | — | — |
| `org:resources:edit` | ✓ | ✓ | — | — |
| `org:view` | ✓ | ✓ | ✓ | ✓ |

---

## Global Role × Permission Matrix

Legend: **Y** = granted, **—** = denied, **L** = linked-data only (parent/counselor), **O** = org role required for write

| Permission | admin | advisor | teacher | student | parent | sponsor | alumni | staff | coach | counselor |
|------------|-------|---------|---------|---------|--------|---------|--------|-------|-------|-----------|
| `admin:access` | Y | — | — | — | — | — | — | — | — | — |
| `users:manage` | Y | — | — | — | — | — | — | — | — | — |
| `reports:view` | Y | Y | Y | — | — | — | — | Y | — | Y |
| `events:manage` | Y | Y | Y | O | — | — | — | Y | O | — |
| `events:participate` | Y | Y | Y | Y | Y | Y | Y | Y | Y | — |
| `events:publish` | Y | Y | Y | O | — | — | — | — | O | — |
| `forms:manage` | Y | — | — | — | — | — | — | — | — | — |
| `forms:approve` | Y | Y | — | — | — | — | — | — | — | — |
| `forms:submit` | Y | Y | Y | Y | Y | Y | — | Y | — | — |
| `forms:sign` | — | — | — | — | Y | — | — | — | — | — |
| `academy:join` | — | — | — | Y | — | — | — | — | — | — |
| `academy:manage` | Y | Y | — | — | — | — | — | — | — | — |
| `org:create` | Y | Y | Y | — | — | — | — | Y | Y | — |
| `org:manage` | Y | Y | Y | O | — | — | — | Y | O | — |
| `checklists:manage` | Y | Y | Y | — | — | — | — | — | O | — |
| `checklists:complete` | Y | Y | Y | Y | — | — | — | Y | Y | — |
| `portfolio:edit` | — | — | — | Y | — | — | Y | — | — | — |
| `portfolio:view_linked` | Y | Y | Y | — | L | — | — | — | — | L |
| `knowledge:manage` | Y | — | — | — | — | — | — | Y | — | — |
| `knowledge:view` | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| `tickets:create` | Y | Y | Y | Y | Y | — | — | Y | Y | — |
| `tickets:manage` | Y | Y | — | — | — | — | — | Y | — | — |
| `labs:use` / `simulators:use` | Y | Y | Y | Y | — | — | — | — | — | — |
| `labs:manage` / `simulators:manage` | Y | Y | — | — | — | — | — | — | — | — |
| `impact_fund:*` | manage | propose/vote/view | view | propose/vote/view | view | view/vote | — | view | view | — |
| `journey:edit_self` | — | — | — | Y | — | — | Y | — | — | — |
| `journey:view_students` | Y | Y | Y | — | L | — | — | — | — | Y |
| `future:explore` | — | Y | Y | Y | L | — | Y | — | — | Y |
| `rewards:earn` | — | — | — | Y | — | — | — | — | — | — |
| `rewards:grant` | Y | Y | Y | — | — | — | — | — | Y | — |
| `rewards:manage_store` | Y | — | — | — | — | — | — | — | — | — |
| `feed:post` | Y | Y | Y | Y | — | — | Y | Y | Y | — |
| `feed:moderate` | Y | Y | — | — | — | — | — | Y | — | — |
| `athletics:manage_team` | Y | — | — | — | — | — | — | — | Y | — |
| `athletics:view` | Y | Y | Y | Y | Y | Y | Y | Y | Y | Y |
| `integrations:manage` | Y | — | — | — | — | — | — | — | — | — |
| `parent:portal` | — | — | — | — | Y | — | — | — | — | — |
| `alumni:portal` | — | — | — | — | — | — | Y | — | — | — |
| `ai:use` | Y | Y | Y | Y | — | — | Y | — | — | — |

---

## Membership-Based Access

### Academies (Phase 0–15 as-built)

| Access | Rule |
|--------|------|
| View academy catalog | All `campus:access` |
| Join academy | `academy:join` + `AcademyMembership` workflow (PENDING → ACTIVE) |
| Manage academy content | `academy:manage` **or** global admin/advisor |
| Academy events | Scoped to `Event.academyId`; participants via `EventParticipant` |
| Leaderboard | `LeaderboardEntry` per academy; visible to members |

**Migration:** `Academy` becomes an `Organization` with `type = ACADEMY`. `AcademyMembership` maps to `OrganizationMembership` with `orgRole` default `member`; advisors get `lead` on assigned academies.

### Clubs & classes (Phase 17+)

| Access | Rule |
|--------|------|
| Discover clubs | `student`, `teacher`, `staff` via Student Life index |
| Join club | Request → `member`; officers approve if `approvalRequired` |
| Class roster | `teacher` with `lead` on class org; students auto-`member` via FACTS sync |
| Club officer tools | `officer` or `lead` on that org |

### Athletics (Phase 19+)

| Access | Rule |
|--------|------|
| Team workspace | `coach` global + `lead` on team org |
| Roster | Coaches manage; players are `member`; parents see linked athlete's team calendar (read) |
| Game events | Published via Event Engine with `organizationId` = team |

### Parent–student linkage

```
ParentGuardian
  parentUserId → User (role: parent)
  studentUserId → User (role: student)
  relationship: MOTHER | FATHER | GUARDIAN | OTHER
  verified: boolean (FACTS or admin confirmation)
```

Parents receive `portfolio:view_linked`, `journey:view_students` (summary fields only), `future:explore` (read-only on linked student), and form signing — never full admin or other students' data.

---

## Mapping to Current Supabase / Prisma Roles

### Today (Phase 15)

| Prisma `UserRole` | `roles.ts` key | Count |
|-------------------|----------------|-------|
| `ADMIN` | `admin` | 1 |
| `ADVISOR` | `advisor` | 1 |
| `STUDENT` | `student` | 1 |
| `PARENT` | `parent` | 1 |
| `SPONSOR` | `sponsor` | 1 |

Supabase Auth stores role in `user_metadata.role` (synced via `syncAuthProfileAction`). Permission checks use `src/config/roles.ts` only — **no RLS policies per domain yet**.

### Target migration

| Step | Action |
|------|--------|
| 1 | Extend `UserRole` enum: `TEACHER`, `ALUMNI`, `STAFF`, `COACH`, `COUNSELOR` |
| 2 | Add `Organization`, `OrganizationMembership`, `ParentGuardian` models |
| 3 | Split `ROLE_PERMISSIONS` into `GLOBAL_ROLE_PERMISSIONS` + `ORG_ROLE_PERMISSIONS` |
| 4 | Add `hasOrgPermission()` in `src/lib/auth/permissions.ts` |
| 5 | Map `advisor` ≈ `teacher` for existing users until FACTS roster sync distinguishes them |
| 6 | Alumni: on graduation batch job, offer role transition `student` → `alumni` |

**Backward compatibility:** Existing 5 roles keep current permissions until Phase 16 RBAC PR. New keys are additive; `hasPermission()` remains the global check.

---

## Proposed Prisma Models

```prisma
enum UserRole {
  ADMIN
  ADVISOR
  TEACHER
  STUDENT
  PARENT
  SPONSOR
  ALUMNI
  STAFF
  COACH
  COUNSELOR
}

enum OrganizationType {
  CLUB
  CLASS
  TEAM
  ACADEMY
  DEPARTMENT
}

enum OrgMembershipRole {
  LEAD
  OFFICER
  MODERATOR
  MEMBER
}

model Organization {
  id          String             @id @default(cuid())
  slug        String             @unique
  name        String
  type        OrganizationType
  description String?
  academyId   String?            @unique @map("academy_id") // bridge during migration
  visibility  OrgVisibility      @default(SCHOOL)
  createdAt   DateTime           @default(now()) @map("created_at")
  updatedAt   DateTime           @updatedAt @map("updated_at")
  memberships OrganizationMembership[]
  events      Event[]
  @@map("organizations")
}

model OrganizationMembership {
  id             String            @id @default(cuid())
  organizationId String            @map("organization_id")
  userId         String            @map("user_id") @db.Uuid
  orgRole        OrgMembershipRole @default(MEMBER) @map("org_role")
  status         MembershipStatus  @default(ACTIVE)
  joinedAt       DateTime?         @map("joined_at")
  organization   Organization      @relation(...)
  user           User              @relation(...)
  @@unique([organizationId, userId])
  @@map("organization_memberships")
}

model ParentGuardian {
  id            String   @id @default(cuid())
  parentUserId  String   @map("parent_user_id") @db.Uuid
  studentUserId String   @map("student_user_id") @db.Uuid
  relationship  String
  verified      Boolean  @default(false)
  @@unique([parentUserId, studentUserId])
  @@map("parent_guardians")
}

model PermissionGrant {
  id         String   @id @default(cuid())
  userId     String   @map("user_id") @db.Uuid
  permission String
  scopeType  String?  @map("scope_type") // org | academy | global
  scopeId    String?  @map("scope_id")
  grantedBy  String?  @map("granted_by") @db.Uuid
  expiresAt  DateTime? @map("expires_at")
  @@map("permission_grants")
}
```

---

## API Enforcement Pattern

```
Request → requireSession() → load User.role
        → hasPermission(role, key) for global routes
        → hasOrgPermission(userId, orgId, key) for /orgs/[slug]/*
        → ParentGuardian check for linked student reads
        → Service layer filters queries by scope (never trust client)
```

Server actions today (`assignRoleAction`, academy actions) use `canAccessAdmin` / `canManageAcademy`. Phase 16 introduces `requirePermission()` and `requireOrgPermission()` wrappers.

---

## Mobile vs Desktop

| Concern | Behavior |
|---------|----------|
| Permission denial | Same 403 / redirect on mobile; no elevated mobile access |
| Org admin tabs | Full tab bar desktop; mobile uses overflow "More" for officer tools |
| Parent portal | Mobile-first form signing |
| Coach roster | Desktop bulk edit; mobile view + attendance quick actions |

---

## Scalability Notes

| Concern | Approach |
|---------|----------|
| Permission lookup | Cache `ROLE_PERMISSIONS` in memory; cache user org memberships in Redis/session (TTL 5 min) |
| Large rosters | Paginate `OrganizationMembership`; FACTS sync in background |
| Audit | Log role changes, `PermissionGrant`, org role promotions to `AuditLog` (Phase 24) |
| Multi-school future | `schoolId` on `Organization`; permissions scoped by `User.schoolId` |

---

## Mapping to Phase 0–15 Code

| As-built | Location | Enterprise change |
|----------|----------|-------------------|
| 5 roles | `prisma/schema.prisma` `UserRole`, `src/config/roles.ts` | Extend enum + permission map (Phase 16) |
| Role assignment | `src/features/auth/actions.ts` `assignRoleAction` | Admin UI adds new roles; validation against enum |
| Academy join | `src/features/academies/actions.ts` | Adds `OrganizationMembership` parallel write |
| Event manage | `canManageEvents(user.role)` | + `hasOrgPermission` for org events |
| Parent forms | `/parent`, `parent:portal` | + `ParentGuardian` verification |
| Admin routes | `canAccessAdmin` | Unchanged gate; sub-routes gain domain keys |

---

## Related Documents

- [07_PERSONALIZED_DASHBOARD.md](./07_PERSONALIZED_DASHBOARD.md) — widget visibility per role
- [10_ORGANIZATION_WORKSPACES.md](./10_ORGANIZATION_WORKSPACES.md) — org tabs and membership UX
- [05_ROADMAP.md](./05_ROADMAP.md) — Phase 16 RBAC foundation
