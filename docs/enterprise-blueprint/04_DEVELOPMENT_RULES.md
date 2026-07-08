# 04 — Development Rules

**Version:** 0.2  
**Scope:** Enterprise architect rules + alignment with MVP build rules  
**Enforcement:** Required before Phase 16+ code; PR review checklist  
**Supersedes:** `03_DEVELOPMENT_RULES.md` (legacy pointer)

---

## Rule Hierarchy

| Source | Authority |
|--------|-----------|
| Enterprise blueprint (this doc) | Strategic product & architecture gates |
| `docs/blueprint/09_BUILD_RULES.md` | MVP engineering constraints (referenced, external) |
| `docs/enterprise-blueprint/04_DEVELOPMENT_RULES.md` | **In-repo** merged rules for current work |
| Phase docs (`docs/PHASE_*.md`) | Delivered scope per phase — do not exceed without approval |

When rules conflict, **stakeholder-approved enterprise blueprint** wins for Phase 16+; locked MVP rules still apply to existing modules until migrated.

---

## Architect Rules (User Mandate — Locked)

Before implementing any feature, document and review:

| # | Rule | Requirement |
|---|------|-------------|
| A1 | **Placement** | Which of 27 modules; IA nav item; mobile vs desktop priority |
| A2 | **Database** | Models, relations, indexes, migration plan, seed strategy |
| A3 | **Permissions** | RBAC keys (14 roles), org scope, parent/student visibility |
| A4 | **Navigation** | Config entry in `navigation.ts`; no hardcoded duplicates |
| A5 | **Mobile / desktop** | Responsive layout, bottom nav impact, touch targets |
| A6 | **Scalability** | Pagination, caching, background jobs, integration rate limits |

**Gate:** No feature PR without a blueprint section or phase doc covering A1–A6.

---

## Product Rules (Locked)

| # | Rule |
|---|------|
| P1 | **Digital OS, not LMS** — Features serve whole-student journey, not only coursework |
| P2 | **Every Student, Every Opportunity, Every Journey** — Personalization and longitudinal data |
| P3 | **No duplicate pages** — One canonical route; use tabs/workspaces |
| P4 | **No hardcoded nav** — `src/config/navigation.ts` + role filters |
| P5 | **Role-based** — UI, API, and queries respect 14-role permissions (Module 27) |
| P6 | **Modular** — `src/features/<domain>/`, `src/services/<domain>-service.ts` |
| P7 | **Scalable** — Multi-org, multi-academy, growth to full school + alumni |
| P8 | **AI mentor, not counselor** — Recommendations; disclaimers; no clinical advice |
| P9 | **Event engine** — Create once, publish to calendar, feed, orgs, notifications |
| P10 | **Positive community** — Feed moderation; kindness-first; no anonymous posting |
| P11 | **Blueprint before code** — Enterprise sections approved before Phase 16 |
| P12 | **IA before UI** — Navigation restructure approved before visual redesign |

---

## MVP Build Rules (Reconstructed from `09_BUILD_RULES`)

The locked `09_BUILD_RULES.md` is not in the repository. Reconstructed from README, phase docs, and codebase. Import official text into `APPENDIX_A` when available.

| # | Rule | Evidence |
|---|------|----------|
| B1 | **Phase discipline** | One phase at a time; stop for approval |
| B2 | **Blueprint lock** | "Do not redesign architecture" (`docs/blueprint/README.md`) |
| B3 | **Config-driven nav** | `primaryNavigation` in `navigation.ts` |
| B4 | **No nav in components** | Sidebar imports `primaryNavigation` only |
| B5 | **Feature flags via `enabled`** | Nav items use `enabled: boolean` |
| B6 | **Archive, don't delete** | `archiveFlag` on events, forms, labs, etc. |
| B7 | **Server actions + services** | Business logic in `src/services/` |
| B8 | **Prisma as source of truth** | Schema + migrations per phase |
| B9 | **Role permissions as strings** | `ROLE_PERMISSIONS` map, `hasPermission()` |
| B10 | **Brand tokens** | `site.ts` brandColors; CSS variables |
| B11 | **Shell consistency** | `ShellPage`, shared dashboard cards |
| B12 | **Seed data for demos** | `prisma/seed*.ts` per academy phase |

---

## Code Organization

```
src/
  app/(campus)/          # Routes only — thin pages
  components/            # Shared UI; domain folders ok
  config/                # site, navigation, roles, env
  features/              # Domain modules (auth, etc.)
  lib/                   # Utilities, auth, prisma client
  services/              # Data access & business logic
  stores/                # Client state (shell, etc.)
  types/                 # Shared TypeScript types
prisma/
  schema.prisma
  migrations/
  seed*.ts
docs/
  enterprise-blueprint/  # This blueprint (00–05 core + 06–27 supplements)
  PHASE_*.md             # Implementation log
```

**Adding a domain (27-module aware):**

1. Identify module number(s) in [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md)
2. Blueprint section covering A1–A6
3. Prisma models + migration
4. Service layer
5. Routes under `(campus)` or `(campus)/admin`
6. Nav config + permission checks (Module 27)
7. Phase doc checklist

---

## Navigation Rules

| Rule | Detail |
|------|--------|
| N1 | Single `primaryNavigation` array (twelve enterprise destinations when approved) |
| N2 | New top-level items require IA approval ([03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md)) |
| N3 | Renames use redirects for one release minimum |
| N4 | Admin routes may stay `/admin` internally; label "Administration" in nav |
| N5 | Mobile: role-specific `mobileShortcuts` — not one global set for all users |
| N6 | Disabled items show tooltip "available in a later phase" |
| N7 | Utility routes (My Journey, Parent, Alumni, Calendar) in profile/header config |

**Current freeze:** Do not restructure nav until enterprise blueprint IA approval ([docs/REDESIGN.md](../REDESIGN.md)).

---

## Database Rules

| Rule | Detail |
|------|--------|
| D1 | Reference [07_DATABASE_SCHEMA.md](./07_DATABASE_SCHEMA.md) before models |
| D2 | Use `@map` for snake_case columns |
| D3 | Soft archive via `archiveFlag` where established |
| D4 | UUID for `User.id` (Supabase auth alignment) |
| D5 | Cascade deletes only where user-owned join data |
| D6 | No migration in blueprint-only PRs |
| D7 | Org-scoped tables include `organizationId` index |

---

## API & Integration Rules

| Rule | Detail |
|------|--------|
| I1 | External sync via queued jobs, not request path |
| I2 | Store external IDs on link tables (`ExternalAccount`) |
| I3 | FACTS / Google: read-only first, write with approval |
| I4 | Health check at `/api/health` for deploy verification |
| I5 | Google Classroom/Calendar: respect API quotas; cache aggressively |

---

## AI Rules (Module 12)

| Rule | Detail |
|------|--------|
| AI1 | Blue Don AI is a **mentor** — suggestions, resources, next steps |
| AI2 | **Not** a counselor — no mental health diagnosis or crisis handling in-bot |
| AI3 | Student Journey AI uses About Me + activity signals — user can edit/clear |
| AI4 | Log prompts/responses for audit (retention per `18_SECURITY_PRIVACY.md`) |
| AI5 | Human escalation links (advisor, counselor staff) always visible |
| AI6 | Placeholder UI must not imply live AI when stubbed |

---

## Community & Rewards Rules (Modules 13, 14, 16)

| Rule | Detail |
|------|--------|
| C1 | Community feed is **positive-only** — moderation queue required |
| C2 | No anonymous posting |
| C3 | Marketplace listings require approval before publish |
| C4 | Blue Don Coins are earned, not purchased with real money (school policy TBD) |
| C5 | Teacher reward grants are audited and capped |
| C6 | Anti-gaming: rate limits on XP/coin events |

---

## UI / Redesign Rules

| Rule | Detail |
|------|--------|
| U1 | UI redesign **deferred** until IA approval ([03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md)) |
| U2 | Visual redesign follows approved nav — not the reverse |
| U3 | Use brand tokens in `globals.css`; migrate hardcoded hex during redesign Phase 2 |
| U4 | New screens follow `ShellPage` + card patterns until design system updated |
| U5 | Wireframes in `05_SCREEN_INVENTORY.md` before polish passes |

---

## Testing & Quality

| Rule | Detail |
|------|--------|
| Q1 | `npm run lint`, typecheck, build pass before merge |
| Q2 | CI via GitHub Actions (Phase 0) |
| Q3 | Permission tests for new `ROLE_PERMISSIONS` keys |
| Q4 | Seed scripts idempotent (upsert pattern) |
| Q5 | Org-scoped access tests for workspace modules |

---

## Documentation Rules

| Rule | Detail |
|------|--------|
| DOC1 | Phase work logged in `docs/PHASE_N.md` |
| DOC2 | Enterprise features spec'd in `docs/enterprise-blueprint/` first |
| DOC3 | Update `siteConfig.phase` only when phase deliverables complete |
| DOC4 | Module changes update [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md) and [02_GAP_ANALYSIS.md](./02_GAP_ANALYSIS.md) |

---

## PR Checklist (Phase 16+)

- [ ] Module number(s) identified; blueprint section covers A1–A6
- [ ] No duplicate routes/pages (P3)
- [ ] Nav changes only via `navigation.ts` (P4)
- [ ] Permissions added to `roles.ts` for 14-role model (P5)
- [ ] Migration reviewed for scale (A6)
- [ ] Mobile layout checked (A5)
- [ ] AI features follow AI1–AI6
- [ ] Community/rewards follow C1–C6 if applicable
- [ ] No secrets committed

---

## Related Documents

- [00_EXECUTIVE_SUMMARY.md](./00_EXECUTIVE_SUMMARY.md)
- [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md)
- [03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md)
- [docs/REDESIGN.md](../REDESIGN.md)
