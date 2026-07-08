# Phase 7 — Checklist Engine

**Status:** Complete  
**Goal:** Operational checklists for events and campus activities

## Deliverables

- [x] Prisma models: `checklists`, `checklist_items`, `checklist_item_completions`
- [x] `/checklists` — active checklists with progress
- [x] `/checklists/[id]` — item completion with required flags
- [x] Event detail page — live checklist section with create/toggle
- [x] Server actions: toggle item, create event checklist template
- [x] Service: `checklist-service`
- [x] Role permissions: `checklists:manage`, `checklists:complete`
- [x] Profile quick actions — Complete Checklist link
- [x] `siteConfig.phase` updated to `7`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/checklists` | Authenticated campus users | Active checklists |
| `/checklists/[id]` | Authenticated campus users | Complete items |
| Event `/events/[id]` | Admin/Advisor create | Attach operations checklist |

## Not Included (By Design)

- Portfolio engine (Phase 8)
- Checklist templates library UI
- Automated checklist assignment rules

## Next Phase

**Phase 8 — Portfolio Engine** (see `docs/PHASE_8.md`)
