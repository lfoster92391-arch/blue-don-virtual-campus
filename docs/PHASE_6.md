# Phase 6 — Academy Framework

**Status:** Complete  
**Goal:** Students join academy pathways and manage assignments

## Deliverables

- [x] Prisma model: `academy_memberships` with PENDING/ACTIVE/INACTIVE/REJECTED workflow
- [x] Migration `20250703140000_phases_6_10_mvp_systems` (Phase 6 tables)
- [x] `/academies` — browse all academies with membership status
- [x] `/academies/[slug]` — academy detail with events and stats
- [x] `/assignments` — user assignment list with start/submit actions
- [x] `/admin/academies` — advisor/admin membership approval queue
- [x] Server actions: join academy, approve/reject membership, claim/update assignments
- [x] Services: `academy-service`, extended `assignment-service`
- [x] Role permissions: `academy:join`, `academy:manage`
- [x] Sidebar Academies navigation enabled
- [x] Dashboard quick actions and assignments widget link to `/assignments`
- [x] `siteConfig.phase` updated to `6`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/academies` | Authenticated campus users | All five academy pathways |
| `/academies/[slug]` | Authenticated campus users | Detail + join request |
| `/assignments` | Authenticated campus users | Event/academy assignments |
| `/admin/academies` | Admin, Advisor | Pending join approvals |

## Not Included (By Design)

- Checklist engine (Phase 7)
- Full academy curriculum management
- Automated JOIN_ACADEMY form linkage (manual approval queue)

## Next Phase

**Phase 7 — Checklist Engine** (see `docs/PHASE_7.md`)
