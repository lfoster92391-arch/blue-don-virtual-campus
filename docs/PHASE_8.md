# Phase 8 — Portfolio Engine

**Status:** Complete  
**Goal:** Students showcase projects, certifications, and service evidence

## Deliverables

- [x] Prisma model: `portfolio_items` with type, status, evidence URL, points
- [x] `/portfolio` — list, summary metrics, create form
- [x] `/portfolio/[id]` — detail and publish action
- [x] Server actions: create item, publish item
- [x] Service: `portfolio-service` with summary stats
- [x] Dashboard portfolio widget wired to live data
- [x] Sidebar Portfolio navigation enabled
- [x] Role permission: `portfolio:edit` (students)
- [x] `siteConfig.phase` updated to `8`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/portfolio` | Students (edit), others view own | CRUD for own items |
| `/portfolio/[id]` | Owner | Draft → Published workflow |

## Not Included (By Design)

- Public portfolio sharing URLs
- Capstone scoring rubric
- File upload storage (evidence URL only)

## Next Phase

**Phase 9 — Service Desk** (see `docs/PHASE_9.md`)
