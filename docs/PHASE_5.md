# Phase 5 — Forms & Governance

**Status:** Complete  
**Goal:** Operate program — programs can onboard

## Deliverables

- [x] Prisma models: `forms`, `form_submissions` with workflow and archive support
- [x] Migration `20250703120000_phase5_forms_governance`
- [x] Seed script: 13 required form templates (Student Agreement, Parent Agreement, Media Release published)
- [x] `/forms` — assigned and completed forms for campus users
- [x] `/forms/[id]` — view, sign (checkbox + typed name), and submit
- [x] `/admin` — governance center hub
- [x] `/admin/forms` — admin create/list/publish/archive forms
- [x] `/admin/approvals` — pending approval queue with approve/reject actions
- [x] `/admin/compliance` — missing, unsigned, pending, and expired tracking
- [x] `/admin/constitution` — governance charter shell
- [x] `/parent` — parent portal shell with form status
- [x] Server actions with `canManageForms`, `canApproveForms`, `canSubmitForms` checks
- [x] Role permissions extended for forms management and approval
- [x] Sidebar Forms navigation enabled
- [x] Dashboard quick actions for Forms, Governance, Parent Portal
- [x] `siteConfig.phase` updated to `5`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/forms` | Authenticated campus users | Role-filtered published forms |
| `/forms/[id]` | Authenticated campus users | Sign and submit |
| `/admin` | Admin, Advisor | Governance hub |
| `/admin/forms` | Admin | Create, workflow, archive |
| `/admin/forms/[id]` | Admin | Status transitions |
| `/admin/approvals` | Admin, Advisor | Approval queue |
| `/admin/compliance` | Admin, Advisor | Compliance dashboard |
| `/admin/constitution` | Admin, Advisor | Charter shell |
| `/parent` | Parent | Family form status |

## Database

- **forms** — title, type, version, status, approval_required, approval_type, archive_flag, optional JSON fields
- **form_submissions** — per-user signed/approved state, signature name, submitted_at, expires_at

Workflow: Draft → Review → Approve → Publish → Complete → Archive (no hard delete)

## Auth & Permissions

- **Admin:** `forms:manage`, `forms:approve`, `forms:submit`
- **Advisor:** `forms:approve`, `forms:submit`
- **Student:** `forms:submit`
- **Parent:** `forms:sign`, `forms:submit`, `parent:portal`

## Not Included (By Design)

- Full Impact Fund voting (Phase 12)
- Checklist engine (Phase 7)
- Full sponsor system (Phase 13)
- Simulations
- Third-party e-sign vendor integration

## Setup

```bash
npm run db:migrate   # Apply Phase 5 migration
npm run db:seed      # Seed form templates
npm run build        # Verify production build
```

## Success Criteria

- [x] Required form templates seeded
- [x] Students and parents can view and sign published forms
- [x] Admins can create, publish, and archive forms
- [x] Advisors can approve pending submissions
- [x] Compliance view tracks missing and unsigned forms
- [x] `npm run build` passes

## Next Phase

**Phase 6 — Academy Framework** (see `docs/PHASE_6.md`)
