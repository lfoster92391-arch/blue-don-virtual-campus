# Phase 12 — Labs, Simulators & Impact Fund

**Status:** Complete  
**Goal:** Post-MVP experiential learning and student-led funding (blueprint Phase 12+)

## Context

Per `docs/blueprint/README.md`, Labs, Simulators, and full Impact Fund voting are **post-MVP** (Phase 12+). Phase 10 (Knowledge Vault) completed the MVP core; this phase delivers the three remaining sidebar destinations that were previously disabled.

## Deliverables

- [x] Prisma models: `labs`, `lab_sessions`, `simulators`, `simulator_runs`, `impact_fund_proposals`, `impact_fund_votes`
- [x] Migration `20250703160000_phase12_labs_simulators_impact_fund`
- [x] Seed: sample labs and simulators when admin user exists
- [x] `/labs` — browse active labs
- [x] `/labs/[slug]` — lab detail, start/complete sessions
- [x] `/admin/labs` — create, activate, archive labs
- [x] `/simulators` — browse active simulators
- [x] `/simulators/[slug]` — launch simulator, log completion
- [x] `/admin/simulators` — create, activate, archive simulators
- [x] `/impact-fund` — fund summary and public proposals
- [x] `/impact-fund/new` — submit proposal
- [x] `/impact-fund/[id]` — proposal detail and voting
- [x] `/admin/impact-fund` — review, open voting, approve, fund
- [x] Services: `lab-service`, `simulator-service`, `impact-fund-service`
- [x] Server actions with role checks
- [x] Role permissions: `labs:*`, `simulators:*`, `impact_fund:*`
- [x] Sidebar navigation enabled for Labs, Simulators, Impact Fund
- [x] Governance hub links for all three admin areas
- [x] Dashboard quick actions updated
- [x] `siteConfig.phase` updated to `12`

## Routes

| Route | Access | Notes |
|-------|--------|-------|
| `/labs` | Authenticated campus users | Active labs catalog |
| `/labs/[slug]` | Authenticated campus users | Session tracking |
| `/admin/labs` | Admin, Advisor | Lab CRUD workflow |
| `/simulators` | Authenticated campus users | Active simulators |
| `/simulators/[slug]` | Authenticated campus users | Launch + log runs |
| `/admin/simulators` | Admin, Advisor | Simulator CRUD workflow |
| `/impact-fund` | All roles with `impact_fund:view` | Fund dashboard |
| `/impact-fund/new` | Student, Advisor, Admin | Submit proposal |
| `/impact-fund/[id]` | All with view; voters when open | Vote on proposals |
| `/admin/impact-fund` | Admin | Review and allocate |

## Auth & Permissions

- **Admin:** full manage + vote + propose on all three modules
- **Advisor:** manage labs/simulators; propose and vote on Impact Fund
- **Student:** use labs/simulators; propose and vote on Impact Fund
- **Parent:** view Impact Fund only
- **Sponsor:** view Impact Fund; vote on proposals

## Impact Fund Workflow

Submitted → Admin opens voting (7-day deadline) → Community votes → Admin approves/rejects → Mark funded

Fund balance is configured at $2,500 (`IMPACT_FUND_BALANCE_CENTS`); allocated amounts derive from funded proposals.

## Not Included (By Design)

- External simulator/lab iframe integrations (launch URLs are configurable placeholders)
- Weighted or quorum-based voting rules
- Sponsor contribution tracking (Phase 13)
- Phase 11 Reporting & Admin global search

## Setup

```bash
npm run db:migrate   # Apply Phase 12 migration
npm run db:seed      # Seed labs and simulators (requires admin user)
npm run build
```

## Next Phase

**Phase 11 — Reporting & Admin** (MVP milestone) or **Phase 13 — Sponsor System** per blueprint build order.
