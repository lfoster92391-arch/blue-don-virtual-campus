# 03 — Information Architecture

**Version:** 0.2  
**Scope:** Proposed main navigation vs current sidebar; route hierarchy; role placement for 27 modules  
**Supersedes:** `01_INFORMATION_ARCHITECTURE.md` (legacy pointer)

---

## IA Principles

1. **Twelve primary destinations** — Users should not hunt; top nav reflects life at Madonna, not internal module names.
2. **Organizations are workspaces** — Clubs, classes, teams, and academies share a workspace pattern.
3. **Depth via context** — Global nav stays shallow; org/academy context provides second-level nav.
4. **Utility vs primary** — Journey, tree, parent/alumni portals live in header/profile, not sidebar clutter.
5. **Config-driven** — `src/config/navigation.ts` is the single source; role filters at runtime.
6. **No orphan routes** — Every route maps to a nav item, org tab, admin section, or explicit utility.

---

## Current Sidebar (As-Built, Phase 15)

Source: `src/config/navigation.ts` — 12 items, feature-module names.

| # | Label | Route | Mobile bottom nav |
|---|-------|-------|-------------------|
| 1 | Dashboard | `/dashboard` | ✅ |
| 2 | Pathways | `/pathways` | ✅ |
| 3 | Academies | `/academies` | ✅ |
| 4 | Calendar | `/calendar` | ✅ |
| 5 | Forms | `/forms` | — |
| 6 | Labs | `/labs` | — |
| 7 | Simulators | `/simulators` | — |
| 8 | Portfolio | `/portfolio` | — |
| 9 | Events | `/events` | — |
| 10 | Service Desk | `/service-desk` | — |
| 11 | Impact Fund | `/impact-fund` | — |
| 12 | Knowledge Vault | `/knowledge` | — |

**Mobile bottom nav today:** Dashboard, Pathways, Academies, Calendar (4) + hamburger for remainder.

**Routes not in primary nav:**

| Route | Purpose | Target home |
|-------|---------|-------------|
| `/checklists` | Event/academy checklists | Administration / org workspace |
| `/assignments` | Assignment list | Dashboard widget + Smart Calendar |
| `/parent` | Parent form portal | Parent utility |
| `/admin/*` | Staff administration | Administration |
| `/academies/[slug]/modules/*` | Learning flow | Academies (in-context) |
| `/labs/[slug]`, `/simulators/[slug]` | Interactive content | Academies → Labs/Sims tabs |
| `/settings`, `/profile` | User utilities | Header |

---

## Proposed Primary Navigation (Enterprise Target)

Twelve destinations mapped to 27 modules:

| # | Label | Modules served | Primary audiences |
|---|-------|----------------|-------------------|
| 1 | **Dashboard** | 1 Personalized Dashboard, 22 Blue Don Tree (widget), 23 Graduation Readiness (senior) | All |
| 2 | **School Hub** | 4 School Hub, 17 Media Center (school-wide) | All |
| 3 | **Student Life** | 5 Clubs, 6 Class Pages | Students, staff |
| 4 | **Academies** | 7 Academies, 18 Broadcast, 19 IT, 20 Circuit Centers | Students, advisors |
| 5 | **Athletics** | 8 Athletics | Students, parents, coaches |
| 6 | **Service Center** | 9 Service Center | All |
| 7 | **Future Center** | 10 Future Center, 23 Graduation Readiness | Students, parents |
| 8 | **Blue Don Corner** | 13 Marketplace, 16 Community Feed | All |
| 9 | **Rewards** | 14 Rewards System | Students |
| 10 | **Portfolio** | 11 Resume & Portfolio | Students, parents |
| 11 | **AI Assistant** | 12 Blue Don AI | Students (primary) |
| 12 | **Administration** | 26 Administration Center | Admin, principal, staff |

### Utility navigation (header / profile menu — not sidebar)

| Label | Module | Route (proposed) |
|-------|--------|------------------|
| My Journey | 21 | `/my-journey` |
| Blue Don Tree | 22 | `/my-journey/tree` or dashboard deep-link |
| Smart Calendar | 3 | `/calendar` (full view; widget on dashboard) |
| Parent Portal | 24 | `/parent` |
| Alumni Portal | 25 | `/alumni` |
| Profile / Settings | — | `/profile`, `/settings` |

**Rationale:** Smart Calendar is high-frequency but aggregates into Dashboard widget; full calendar is one tap from dashboard or utility. Journey and Tree are personal narrative — profile-adjacent, not competing with twelve primaries.

---

## Side-by-Side: Current vs Proposed

```
CURRENT (feature modules)          PROPOSED (life at Madonna)
─────────────────────────          ────────────────────────────
Dashboard                    →     Dashboard
Pathways                     →     (absorbed: Academies + Future Center)
Academies                    →     Academies
Calendar                     →     (utility: Smart Calendar + Dashboard widget)
Forms                        →     School Hub + Administration
Labs                         →     Academies (in-context tabs)
Simulators                   →     Academies (in-context tabs)
Portfolio                    →     Portfolio
Events                       →     Event Hub (cross-cutting) + Calendar
Service Desk                 →     Service Center
Impact Fund                  →     Academies (tab) + Blue Don Corner
Knowledge Vault              →     School Hub + Media Center
—                            →     Student Life (NEW)
—                            →     Athletics (NEW)
—                            →     Future Center (NEW)
—                            →     Blue Don Corner (NEW)
—                            →     Rewards (NEW)
—                            →     AI Assistant (NEW)
—                            →     Administration (promoted to nav)
```

---

## Consolidation Map (Current → Target)

| Target destination | Absorbs (current routes) | New capability (modules) |
|--------------------|--------------------------|--------------------------|
| **Dashboard** | `/dashboard`, `/pathways` (summary), `/assignments` (widget), calendar widget | Role layouts (1), tree widget (22), senior readiness (23) |
| **School Hub** | `/knowledge`, `/forms` (published catalog) | Announcements, bell schedule, lunch, map, directory (4) |
| **Student Life** | — | Clubs (5), class pages (6), org index |
| **Academies** | `/academies`, `/pathways`, `/labs`, `/simulators`, `/impact-fund`, academy checklists | Centers 18–20, engine tabs, Impact Fund |
| **Athletics** | — | Team workspaces (8) |
| **Service Center** | `/service-desk` | Volunteer QR, facilities (9) |
| **Future Center** | `/pathways` (career framing) | College, trade, military, scholarships (10) |
| **Blue Don Corner** | — | Marketplace (13) + feed (16) |
| **Rewards** | Leaderboard (academy-scoped) | XP, coins, badges, streaks (14) |
| **Portfolio** | `/portfolio` | Resume builder (11) |
| **AI Assistant** | Learning flow AI placeholder | Global Blue Don AI (12) |
| **Administration** | `/admin/*`, forms admin, `/checklists` | Reporting, org mgmt, integrations (26) |

### Redirect plan (one release minimum)

| Old route | New route | Notes |
|-----------|-----------|-------|
| `/service-desk` | `/service-center` | Alias redirect |
| `/pathways` | `/academies` or `/future-center/pathways` | TBD after stakeholder approval |
| `/knowledge` | `/school-hub/knowledge` | Alias redirect |
| `/events` | stays; also surfaced via calendar + feed | Event Hub publishes, route remains |

---

## Route Hierarchy (Target)

```
/dashboard                              # Module 1 — role templates
/school-hub                             # Module 4
  /school-hub/announcements
  /school-hub/directory
  /school-hub/bell-schedule
  /school-hub/lunch
  /school-hub/map
  /school-hub/knowledge                 # legacy Knowledge Vault
/student-life                           # Module 5 index
  /orgs/[slug]                          # Modules 5, 6, 8 — shared workspace
    /dashboard | /announcements | /calendar | /members | /media | ...
/academies                              # Module 7
  /academies/[slug]                     # Engine + workspace tabs
  /academies/[slug]/centers             # Modules 18–20 where applicable
/athletics                              # Module 8
  /athletics/teams/[slug]
/service-center                         # Module 9
/future-center                          # Module 10
  /future-center/college | /trade | /military | /scholarships | ...
/blue-don-corner                        # Modules 13, 16
  /blue-don-corner/feed
  /blue-don-corner/marketplace
/rewards                                # Module 14
/portfolio                              # Module 11
/ai-assistant                           # Module 12
/calendar                               # Module 3 — utility (linked from dashboard)
/my-journey                             # Module 21
  /my-journey/tree                      # Module 22
/parent                                 # Module 24
/alumni                                 # Module 25
/administration                         # Module 26 (alias /admin)
```

---

## Organization Workspace Template (Shared)

Modules 5, 6, 7, 8 use one template at `/orgs/[slug]` or academy/team-specific paths:

| Tab | Content |
|-----|---------|
| Dashboard | Org home, metrics |
| Announcements | Org news |
| Calendar | Org events (→ Event Hub) |
| Members | Roster, roles |
| Photos / Gallery | Media (→ Media Center) |
| Docs | Files, resources |
| Events | Create/manage |
| Fundraisers | Campaigns, Impact Fund |
| Store | Org merchandise (→ Blue Don Corner) |
| Leadership | Officers, permissions |
| Resources | Links, playbooks |
| Learning | Academies only — modules, labs, progress |

---

## Role-Personalized Dashboards (Module 1)

| Persona | Dashboard emphasis | Primary nav shortcuts (mobile) |
|---------|-------------------|-------------------------------|
| 7th–8th grade | Exploration, clubs, kindness, academy intro | Dashboard, Student Life, Academies, AI |
| Freshman | Academy onboarding, schedule, service intro | Dashboard, Academies, Calendar, Student Life |
| Sophomore–Junior | Academy progress, Future Center, portfolio | Dashboard, Academies, Future Center, Portfolio |
| Senior | Graduation readiness, applications, capstone | Dashboard, Future Center, Portfolio, Calendar |
| Parent | Forms, student summary, events, athletics | Dashboard, Parent Portal, Calendar, School Hub |
| Teacher | Classes, approvals, student flags | Dashboard, Administration, Academies, Calendar |
| Coach | Team schedule, roster, media | Dashboard, Athletics, Calendar, Student Life |
| Admin | Compliance, integrations, health | Dashboard, Administration, School Hub, Service Center |

**Current:** Single layout — role affects data queries, not template.

---

## Blue Don Corner IA (Modules 13 + 16)

Single nav destination with two tabs:

| Tab | Module | Content |
|-----|--------|---------|
| **Community** | 16 Community Feed | Kindness, spotlights, celebrations, good news |
| **Marketplace** | 13 Blue Don Corner | Listings, org stores, coin purchases |

Shared moderation queue in Administration.

---

## Mobile vs Desktop

| Concern | Current | Target |
|---------|---------|--------|
| Bottom nav items | 4 fixed (Dashboard, Pathways, Academies, Calendar) | 5 role-specific + "More" drawer |
| Sidebar | 12 flat items | 12 enterprise labels; optional grouping (Learn / Life / Plan) |
| Org context | None | Sticky org switcher in workspace |
| AI | Hidden in module flow | Nav item or FAB |
| Calendar | Primary nav item | Dashboard widget + utility link |
| Parent/Alumni | Not in nav | Profile menu entries |

### Proposed mobile bottom nav (default student)

1. Dashboard  
2. Academies  
3. Student Life  
4. Calendar  
5. More → full drawer (School Hub, Athletics, Service, Future, Corner, Rewards, Portfolio, AI)

---

## Content Types & Canonical Homes

| Content type | Canonical owner | Also surfaces on |
|--------------|-----------------|------------------|
| Event | Event Hub (15) | Smart Calendar (3), org page, feed (16), notifications |
| Announcement | School Hub (4) or org | Dashboard (1), feed (16) |
| Learning module | Academies (7) | Dashboard progress, Future Center (10) |
| Portfolio item | Portfolio (11) | Academies, Future Center resume |
| Ticket | Service Center (9) | Dashboard quick action |
| Form | School Hub (4) / Admin (26) | Parent Portal (24) |
| Media | Media Center (17) | Org gallery, feed, athletics |
| Reward transaction | Rewards (14) | Dashboard, Blue Don Tree (22) |
| Marketplace listing | Blue Don Corner (13) | Org store tab |

---

## Implementation Notes (When Approved)

1. Add `navigationGroups` to config: `primary`, `utility`, `admin`, `mobileShortcuts`.
2. Introduce `getNavigationForRole(role, gradeLevel, context)`.
3. Redirects for renamed paths — maintain aliases one release.
4. Do **not** duplicate Labs/Simulators at top level once under Academies.
5. UI redesign ([docs/REDESIGN.md](../REDESIGN.md)) follows **this IA** — visual pass only after IA sign-off.

---

## Related Documents

- [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md) — Module specs
- [02_GAP_ANALYSIS.md](./02_GAP_ANALYSIS.md) — Built vs missing
- [04_NAVIGATION_ROLE_MAPS.md](./04_NAVIGATION_ROLE_MAPS.md) (planned) — Per-role visibility matrix
- [docs/REDESIGN.md](../REDESIGN.md) — Visual redesign gated on IA approval
