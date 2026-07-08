# Blue Don Virtual Campus — Enterprise Product Blueprint

**Document set:** Enterprise Blueprint v1.0 (approved priority batch)  
**Status:** Sections 00–03, 05–13 **approved for planning** — no feature code until per-phase kickoff  
**Institution:** Madonna High School  
**Philosophy:** Every Student, Every Opportunity, Every Journey  
**Current implementation phase:** 15 (Academy Content Pass complete)  
**Planning horizon:** Phases 16–25 (`05_ROADMAP.md`)

---

## Purpose

This folder is the **master enterprise product blueprint** for Blue Don Virtual Campus — a digital operating system for Madonna High School spanning 7th grade through graduation and alumni life. It supersedes ad-hoc phase docs for **strategic planning** while `docs/blueprint/` (01–10) remains the locked MVP engineering reference.

Read this index before writing code, restructuring navigation, or opening Prisma migrations for new domains.

---

## How to Use This Blueprint

| Audience | Start here |
|----------|------------|
| **Everyone** | [`docs/BLUE_DON_CONSTITUTION.md`](../BLUE_DON_CONSTITUTION.md) |
| Product / school leadership | `00_EXECUTIVE_SUMMARY.md`, `05_ROADMAP.md` |
| Architects & lead engineers | `01_INFORMATION_ARCHITECTURE.md`, `06_RBAC_PERMISSIONS.md`, `05_ROADMAP.md` |
| Designers | `07_PERSONALIZED_DASHBOARD.md`, `05_SCREEN_INVENTORY.md` |
| Backend / data | `06_RBAC_PERMISSIONS.md`, domain sections 08–13 |
| Integrations team | `13_INTEGRATIONS.md` |
| Security / compliance | `18_SECURITY_PRIVACY.md` |

**Approval gate:** Phase 16+ feature work follows approved blueprint sections. See `docs/REDESIGN.md` for UI/nav restructure timing (Phase 24).

---

## Blueprint Structure

### Part I — Vision & Strategy

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 00 | [00_EXECUTIVE_SUMMARY.md](./00_EXECUTIVE_SUMMARY.md) | **Draft v0.1** | Vision, pillars, scope, success metrics |
| 01 | [01_INFORMATION_ARCHITECTURE.md](./01_INFORMATION_ARCHITECTURE.md) | **Draft v0.1** | Nav taxonomy, routes, content hierarchy |
| 02 | [02_GAP_ANALYSIS.md](./02_GAP_ANALYSIS.md) | **Draft v0.1** | Phases 0–15 built vs enterprise vision |
| 03 | [03_DEVELOPMENT_RULES.md](./03_DEVELOPMENT_RULES.md) | **Draft v0.1** | Architect rules, build constraints |
| 05 | [05_ROADMAP.md](./05_ROADMAP.md) | **Complete v1.0** | Approved Phases 16–25 delivery plan |

### Part II — Approved Priority Batch (Access, Experience, Domains)

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 06 | [06_RBAC_PERMISSIONS.md](./06_RBAC_PERMISSIONS.md) | **Complete v1.0** | 14 roles, permission matrix, org access |
| 07 | [07_PERSONALIZED_DASHBOARD.md](./07_PERSONALIZED_DASHBOARD.md) | **Complete v1.0** | Widget specs, personas, data sources |
| 08 | [08_STUDENT_JOURNEY.md](./08_STUDENT_JOURNEY.md) | **Complete v1.0** | About Me, check-ins, AI inputs (arch only) |
| 09 | [09_EVENT_ENGINE.md](./09_EVENT_ENGINE.md) | **Complete v1.0** | Create once, publish everywhere |
| 10 | [10_ORGANIZATION_WORKSPACES.md](./10_ORGANIZATION_WORKSPACES.md) | **Complete v1.0** | Clubs, classes, teams, academies unified |
| 11 | [11_FUTURE_CENTER.md](./11_FUTURE_CENTER.md) | **Complete v1.0** | Career, college, trade, scholarships |
| 12 | [12_REWARDS_GAMIFICATION.md](./12_REWARDS_GAMIFICATION.md) | **Complete v1.0** | XP, Coins, badges, store, teacher grants |
| 13 | [13_INTEGRATIONS.md](./13_INTEGRATIONS.md) | **Complete v1.0** | Google Classroom/Calendar/Workspace, FACTS |

### Part III — Experience Design (Extended)

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 04 | [04_NAVIGATION_ROLE_MAPS.md](./04_NAVIGATION_ROLE_MAPS.md) | Planned | Role-personalized nav detail (Phase 24) |
| 05b | [05_SCREEN_INVENTORY.md](./05_SCREEN_INVENTORY.md) | Planned | Screen catalog, wireframe placeholders |
| 06b | [06_UI_SYSTEM.md](./06_UI_SYSTEM.md) | Planned | Design system, components, responsive rules |
| 07b | [07_DATABASE_SCHEMA.md](./07_DATABASE_SCHEMA.md) | Planned | Consolidated entity diagram |

> **Note:** Files `06_UI_SYSTEM`, `07_DATABASE_SCHEMA`, `08_RBAC_MATRIX`, etc. are legacy stub indices from v0.1 structure. Canonical specs for RBAC, dashboard, and domains are in **06–13** above.

### Part IV — Platform Domains (Remaining)

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 14 | [14_COMMUNITY_MEDIA.md](./14_COMMUNITY_MEDIA.md) | Planned | Feed, kindness, photos, video, yearbook |
| 15 | [15_ACADEMY_ENGINE.md](./15_ACADEMY_ENGINE.md) | Planned | MEN academies, learning flow extensions |

### Part V — Intelligence & Integrations (Extended)

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 16 | [16_INTEGRATIONS.md](./16_INTEGRATIONS.md) | Stub → see **13** | Pointer to canonical integrations doc |
| 17 | [17_AI_ARCHITECTURE.md](./17_AI_ARCHITECTURE.md) | Planned | Blue Don AI, Student Journey AI, guardrails |

### Part VI — Trust, Portals & Operations

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 18 | [18_SECURITY_PRIVACY.md](./18_SECURITY_PRIVACY.md) | Planned | FERPA, COPPA, data retention, audit |
| 19 | [19_PARENT_ALUMNI_PORTALS.md](./19_PARENT_ALUMNI_PORTALS.md) | Planned | Parent hub, alumni network, giving |
| 20 | [20_GOVERNANCE_COMPLIANCE.md](./20_GOVERNANCE_COMPLIANCE.md) | Planned | Forms, approvals, constitution |
| 21 | [21_SERVICE_CENTER.md](./21_SERVICE_CENTER.md) | Planned | IT desk, facilities, unified service |

### Part VII — Engineering & Delivery

| # | Document | Status | Topic |
|---|----------|--------|-------|
| 22 | [22_TECHNICAL_ARCHITECTURE.md](./22_TECHNICAL_ARCHITECTURE.md) | Planned | Stack, infra, caching, jobs, search |
| 23 | [23_MOBILE_PWA.md](./23_MOBILE_PWA.md) | Planned | Mobile nav, offline, install experience |
| 24 | [24_PERFORMANCE_SCALABILITY.md](./24_PERFORMANCE_SCALABILITY.md) | Planned | Load, multi-tenant, content CDN |
| 25 | [25_TESTING_QA.md](./25_TESTING_QA.md) | Planned | Test strategy, accessibility, UAT |
| 26 | [26_ANALYTICS_REPORTING.md](./26_ANALYTICS_REPORTING.md) | Planned | Dashboards, exports |
| 27 | [27_ROADMAP_PHASES_16_PLUS.md](./27_ROADMAP_PHASES_16_PLUS.md) | Stub → see **05** | Pointer to canonical roadmap |

### Appendices

| # | Document | Status | Topic |
|---|----------|--------|-------|
| A | [APPENDIX_A_LEGACY_BLUEPRINT_INDEX.md](./APPENDIX_A_LEGACY_BLUEPRINT_INDEX.md) | Planned | Map to `docs/blueprint/` 01–10 |
| B | [APPENDIX_B_ROUTE_CATALOG.md](./APPENDIX_B_ROUTE_CATALOG.md) | Planned | Full route inventory (as-built) |
| C | [APPENDIX_C_GLOSSARY.md](./APPENDIX_C_GLOSSARY.md) | Planned | Terms: MEN, Blue Don Coins, etc. |

---

## Relationship to Existing Docs

| Location | Role |
|----------|------|
| `docs/blueprint/README.md` | Locked MVP blueprint index (01–10) |
| `docs/PHASE_0.md` … `docs/PHASE_15.md` | Implementation changelog per phase |
| `docs/enterprise-blueprint/` | **This set** — enterprise OS vision and Phase 16+ planning |
| `docs/REDESIGN.md` | UI/nav redesign aligned to Phase 24 |

---

## Document Conventions

Each substantive section addresses:

1. **Placement** — IA / nav / mobile
2. **Database** — Proposed Prisma models
3. **Permissions** — RBAC and org-scoped rules
4. **Navigation** — Config-driven entries
5. **Mobile / desktop** — Layout and priority
6. **Scalability** — Pagination, caching, jobs
7. **Phase 0–15 mapping** — As-built code references

---

## Version History

| Version | Date | Notes |
|---------|------|-------|
| 0.1 | 2026-07-07 | Initial structure, sections 00–03 substantive |
| 1.0 | 2026-07-07 | **Approved batch:** 05 roadmap + 06–13 domain specs complete |
