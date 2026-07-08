# Phase 16 — Permissions & Organization Foundation

**Status:** Complete  
**Goal:** Enterprise RBAC foundation (14-role model) and config-driven personalized dashboard framework

## Context

Enterprise blueprint batch approved. Phase 16 unlocks the organization layer and extends the campus role model without restructuring navigation (Phase 17) or building org workspace routes (Phase 16.2+).

Blueprint references:
- [06_RBAC_PERMISSIONS.md](./enterprise-blueprint/06_RBAC_PERMISSIONS.md)
- [07_PERSONALIZED_DASHBOARD.md](./enterprise-blueprint/07_PERSONALIZED_DASHBOARD.md)
- [05_ROADMAP.md](./enterprise-blueprint/05_ROADMAP.md) — Phase 16 scope

## Deliverables

### RBAC foundation
- [x] Extended `UserRole` enum: `TEACHER`, `ALUMNI`, `STAFF`, `COACH`, `COUNSELOR` (additive migration)
- [x] `Organization` + `OrganizationMembership` Prisma models (minimal — future org workspaces)
- [x] `GLOBAL_ROLE_PERMISSIONS` + `ORG_ROLE_PERMISSIONS` in `src/config/roles.ts`
- [x] `hasOrgPermission()` in `src/lib/auth/permissions.ts`
- [x] `src/services/org-service.ts` — list memberships, ensure org, slug lookup
- [x] Role assignment admin form supports all 10 global campus roles
- [x] Existing 5 roles retain prior permissions; new keys are additive

### Dashboard framework
- [x] `src/config/dashboard-layouts.ts` — persona resolution, layout templates, widget registry
- [x] `src/services/dashboard-service.ts` — parallel data fetch per visible widgets
- [x] `src/components/dashboard/dashboard-widget-renderer.tsx` — registry-driven rendering
- [x] Refactored `dashboard-content.tsx` — config-driven layout; all Phase 0–15 widgets preserved
- [x] Role-specific visibility: student (grade bands), teacher, parent, admin at minimum
- [x] Admin placeholder widgets (system health, compliance, enrollment, moderation)

### Data & docs
- [x] Migration `20250707100000_phase16_rbac_orgs`
- [x] `prisma/seed-phase16.ts` — demo club, team, and academy bridge organizations
- [x] `siteConfig.phase` → `16`

## Schema changes

| Model / enum | Change |
|--------------|--------|
| `UserRole` | Added `TEACHER`, `ALUMNI`, `STAFF`, `COACH`, `COUNSELOR` |
| `OrganizationType` | New: `CLUB`, `CLASS`, `TEAM`, `ACADEMY`, `DEPARTMENT` |
| `OrgMembershipRole` | New: `LEAD`, `OFFICER`, `MODERATOR`, `MEMBER` |
| `OrgVisibility` | New: `SCHOOL`, `MEMBERS_ONLY`, `PRIVATE` |
| `MembershipStatus` | New: `PENDING`, `ACTIVE`, `INACTIVE`, `REJECTED` |
| `Organization` | New table — slug, name, type, optional `academyId` bridge |
| `OrganizationMembership` | New table — user ↔ org with `orgRole` + status |
| `User` | Added `organizationMemberships` relation |

**Deferred to later phases:** `ParentGuardian`, `PermissionGrant`, `StudentProfile`, `/orgs/[slug]` routes, nav IA migration.

## New files

| File | Purpose |
|------|---------|
| `src/config/dashboard-layouts.ts` | Personas, layouts, widget visibility |
| `src/lib/auth/permissions.ts` | `hasOrgPermission()`, require helpers |
| `src/services/dashboard-service.ts` | Dashboard view model aggregation |
| `src/services/org-service.ts` | Organization queries |
| `src/components/dashboard/dashboard-widget-renderer.tsx` | Widget ID → component map |
| `src/components/dashboard/dashboard-admin-widgets.tsx` | Admin dashboard placeholders |
| `prisma/seed-phase16.ts` | Demo organizations |
| `prisma/migrations/20250707100000_phase16_rbac_orgs/` | Schema migration |

## Dashboard personas supported

| Persona | Resolution | Layout template |
|---------|------------|-----------------|
| `student_middle` | student + grade 7–8 | `student_explorer` |
| `student_freshman` | student + grade 9 | `student_onboarding` |
| `student_upper` | student + grade 10–11 (default) | `student_pathway` |
| `student_senior` | student + grade 12 | `student_graduation` |
| `parent` | parent role | `parent_hub` |
| `teacher` | teacher role | `teacher_command` |
| `advisor` | advisor role | `advisor_oversight` |
| `admin` | admin role | `admin_command` |
| `staff`, `coach`, `counselor`, `alumni`, `sponsor` | respective roles | `campus_default` or `teacher_command` (coach) |

Grade resolution uses an optional `DashboardContext.gradeLevel` stub until `StudentProfile` ships in Phase 19.

## Widget visibility (minimum roles)

| Widget | student | teacher | parent | admin |
|--------|---------|---------|--------|-------|
| hero_greeting | ✓ | ✓ | ✓ | ✓ |
| quick_actions | ✓ | ✓ | ✓ | ✓ |
| metrics_strip | ✓ | ✓ | ✓ | ✓ |
| assignments_due | ✓ | ✓ | — | — |
| calendar_week | ✓ | ✓ | ✓ | ✓ |
| events_upcoming | ✓ | ✓ | ✓ | ✓ |
| notifications | ✓ | ✓ | ✓ | ✓ |
| portfolio_summary | ✓ | — | ✓ | — |
| academy_progress | ✓ | — | — | — |
| admin_* widgets | — | — | — | ✓ |

## Out of scope (Phase 17+)

- Navigation IA migration (`navigation.ts` v2)
- School Hub, org workspace routes (`/orgs/[slug]`)
- `ParentGuardian` verification flows
- User widget collapse/reorder preferences
- Live notification service (stub remains)

## Verification

```bash
npm run build
npx prisma migrate deploy
npm run db:seed
vercel --prod --yes
```
