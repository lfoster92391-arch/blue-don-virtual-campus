# 00 — Executive Summary

**Blue Don Virtual Campus — Enterprise Product Blueprint**  
**Version:** 0.2 (planning)  
**Institution:** Madonna High School  
**Status:** Documentation only — awaiting stakeholder approval before Phase 16 development

---

## One-Line Definition

Blue Don Virtual Campus is the **digital operating system** for Madonna High School — not an LMS, not a simple portal, but a unified platform that accompanies every student from **7th grade through graduation and into alumni life**, connecting academics, student life, career preparation, community, and school operations.

---

## Core Mission

Madonna High School students deserve a single place where school life makes sense — where their classes, clubs, teams, academies, service hours, career plans, and achievements connect into one coherent journey. Blue Don Virtual Campus exists to:

1. **Meet every student where they are** — grade level, interests, academy path, family role.
2. **Surface every opportunity** — academics, athletics, service, leadership, internships, scholarships, trades, and military pathways are discoverable, not buried.
3. **Honor every journey** — longitudinal records, visual growth, and AI mentorship evolve from 7th grade through alumni life.

---

## Philosophy (Locked)

> **Every Student, Every Opportunity, Every Journey**

| Pillar | Product meaning |
|--------|-----------------|
| **Every Student** | Role- and context-aware experiences: grade, academy, club, team, parent, teacher, admin. No one-size-fits-all dashboard. |
| **Every Opportunity** | Academies, athletics, service, leadership, internships, scholarships, and trades are **first-class destinations**, not sidebar afterthoughts. |
| **Every Journey** | Longitudinal data — portfolios, achievements, milestones, Blue Don Tree growth — persist and evolve; alumni remain connected. |

---

## Differentiation

### What Blue Don Virtual Campus is

| Attribute | Description |
|-----------|-------------|
| **Digital campus OS** | Whole-student platform spanning academics, life, career, community, and operations |
| **Journey-centric** | Starts in 7th grade; grows with the student through graduation and alumni |
| **Academy-powered** | Madonna Education Network (MEN) — 14 career academies with shared learning engine |
| **Organization-native** | Clubs, classes, teams, and academies share a workspace model |
| **Positive community** | Community feed is kindness-first; moderation by design |
| **Motivation layer** | XP, Blue Don Coins, badges, streaks, teacher rewards — earned, not gimmicky |
| **Mentor AI** | Blue Don AI guides and recommends; it does **not** replace counselors or clinicians |
| **Event engine** | Create once, publish everywhere — calendar, feed, org pages, notifications |
| **Partner ecosystem** | Integrates with Google Classroom, Calendar, Workspace, FACTS SIS, and Asset Pilot EDU |

### What Blue Don Virtual Campus is not

| Anti-pattern | Why we avoid it |
|--------------|-----------------|
| **LMS clone** | Courseware is one slice; student life, career, and community are equally important |
| **Static portal** | Not a link farm or PDF repository — interactive workspaces and journeys |
| **Social network** | Community feed is positive-only; no drama, no anonymous posting |
| **Counseling chatbot** | AI is a mentor for exploration and next steps, not mental health treatment |
| **Feature scatter** | Twelve primary nav destinations; depth via org context, not nav sprawl |

---

## Platform Scope — 27 Modules

The enterprise vision comprises **27 platform modules** documented in [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md):

| Layer | Modules |
|-------|---------|
| **Personal** | Dashboard, Student Journey, My Journey, Blue Don Tree, Graduation Readiness |
| **School-wide** | Smart Calendar, School Hub, Event Hub |
| **Student life** | Student Life/Clubs, Class Pages, Athletics |
| **Learning** | Academies, Broadcasting Center, IT Center, Circuit Center |
| **Future** | Future Center, Resume & Portfolio |
| **Community & economy** | Blue Don Corner, Community Feed, Media Center, Rewards System |
| **Support** | Service Center, Blue Don AI |
| **Governance** | Parent Portal, Alumni Portal, Administration Center, Permissions System |

---

## What We Are Building — Platform Layers

| Layer | Description |
|-------|-------------|
| **Personal layer** | Dashboards personalized by role (student by grade, parent, teacher, admin, club officer, athlete). |
| **Organization layer** | Workspaces for clubs, classes, teams, and academies — announcements, calendar, members, media, store, fundraisers. |
| **Journey layer** | Student Journey + My Journey timeline + Blue Don Tree visual growth; AI adapts from About Me profile. |
| **Future layer** | Future Center — career, college, trade, military, scholarships, resume, recruiters, internships. |
| **Community layer** | Positive feed, kindness actions, spotlights, media library, yearbook, live streams. |
| **Operations layer** | Service Center (IT, facilities, volunteer QR check-in), administration, forms/governance. |
| **Motivation layer** | Rewards — XP, Blue Don Coins, badges, streaks, leaderboards, campus marketplace, teacher rewards. |
| **Intelligence layer** | Blue Don AI — mentor (not counselor); journey, career, and academy coaching with guardrails. |

---

## Primary Navigation (Target State)

Enterprise vision consolidates today's feature-scattered nav into **twelve top-level destinations**:

1. **Dashboard** — Role-personalized home
2. **School Hub** — School-wide news, directory, bell schedule, lunch, map
3. **Student Life** — Clubs, class pages, activities, spirit
4. **Academies** — MEN career academies + Academy Engine
5. **Athletics** — Teams, schedules, stats, media
6. **Service Center** — IT, facilities, volunteer check-in (extends Service Desk)
7. **Future Center** — Post-secondary and career pathways
8. **Blue Don Corner** — Marketplace + positive community feed
9. **Rewards** — Gamification and campus economy
10. **Portfolio** — Evidence, projects, resume export
11. **AI Assistant** — Blue Don AI entry point
12. **Administration** — Staff operations (role-gated)

**Utility destinations (header/profile, not primary nav):** My Journey, Blue Don Tree, Parent Portal, Alumni Portal, Media Center, Graduation Readiness.

Navigation must remain **config-driven** (`src/config/navigation.ts`) — no hardcoded duplicate nav trees. See [03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md).

---

## Current State (Phase 15)

Phases 0–15 delivered a **strong MVP foundation**:

| Built | Phase |
|-------|-------|
| Auth, 5 roles (admin, advisor, student, parent, sponsor) | 2 |
| Campus shell (sidebar, mobile nav, dashboard) | 1, 3 |
| Calendar, events, assignments | 4 |
| Forms & governance (parent portal for agreements) | 5 |
| Academy Framework + **Academy Engine** (14 MEN academies, modules, labs, simulators, certifications) | 6, 13–15 |
| Checklists, portfolio, service desk, knowledge vault | 7–10 |
| Labs, simulators, Impact Fund | 12 |
| Rich academy content (all 14 academies) | 14–15 |

**What Phase 15 is not:** The full enterprise OS. Major vision domains — Future Center, Rewards economy, Organization workspaces, Community feed, Athletics hub, Event publish-everywhere engine, Smart Calendar integrations, alumni network, 14-role permissions, role-personalized dashboards — are **planned, not built**.

See [02_GAP_ANALYSIS.md](./02_GAP_ANALYSIS.md) for module-by-module status.

---

## Strategic Principles (Non-Negotiable)

| Principle | Implication |
|-----------|-------------|
| No duplicate pages | One canonical route per capability; reuse workspace templates. |
| No hardcoded navigation | All nav from config + role filters. |
| Role-based everything | UI, APIs, and data scoped by role and org membership. |
| Modular & scalable | Feature modules in `src/features/`; services per domain. |
| Architect before build | Placement, DB, permissions, nav, mobile, scale documented first (A1–A6). |
| AI as mentor | Recommendations only; no clinical/counseling claims; human escalation paths. |
| Event engine | Single event creation → calendar, feed, org pages, notifications. |
| Positive community | Feed moderation; kindness-first design. |
| Blueprint before code | Enterprise sections approved before Phase 16. |

---

## Future Integrations

| System | Purpose | Status |
|--------|---------|--------|
| **Google Classroom** | Assignments, rosters, coursework sync | Planned |
| **Google Calendar** | Two-way event sync | Stub in UI |
| **Google Workspace** | SSO, directory, groups | OAuth signup only |
| **FACTS SIS** | Enrollment, grades, attendance, demographics | Planned |
| **Asset Pilot EDU** | Cross-platform IT assets, partner ecosystem | Documented |

Integration architecture: [16_INTEGRATIONS.md](./16_INTEGRATIONS.md).

---

## Success Metrics (Enterprise)

| Category | Example KPIs |
|----------|--------------|
| Engagement | DAU/MAU by role, session depth, return visits |
| Journey | Portfolio completeness, academy progression, About Me adoption, Blue Don Tree growth |
| Future | Future Center plan adoption, scholarship applications, internship placements |
| Community | Kindness actions, spotlight nominations, media uploads |
| Service | Volunteer hours logged, ticket resolution time, QR check-in accuracy |
| Outcomes | Certification earn rate, graduation readiness score, alumni re-engagement |

---

## Approval & Next Steps

1. **Stakeholders review** [00](./00_EXECUTIVE_SUMMARY.md)–[05](./05_ROADMAP.md) and the 27-module catalog in [01](./01_PLATFORM_MODULES.md).
2. **Approve or revise** target information architecture ([03](./03_INFORMATION_ARCHITECTURE.md)) before nav restructure.
3. **Prioritize** Phase 16+ delivery per [05_ROADMAP.md](./05_ROADMAP.md).
4. **Defer UI redesign** until IA approval ([docs/REDESIGN.md](../REDESIGN.md)).

No Prisma migrations, routes, or nav changes ship until this gate passes.

### Recommended first sections for stakeholder approval

1. **01_PLATFORM_MODULES.md** — Confirm all 27 modules match school vision
2. **03_INFORMATION_ARCHITECTURE.md** — Approve twelve-destination nav and current→target mapping
3. **02_GAP_ANALYSIS.md** — Validate built vs missing assessment
4. **05_ROADMAP.md** — Agree phased build order and dependencies
5. **08_RBAC_MATRIX.md** (next to write) — Confirm 14 roles and permission model

---

## Related Documents

- [01_PLATFORM_MODULES.md](./01_PLATFORM_MODULES.md) — All 27 modules
- [02_GAP_ANALYSIS.md](./02_GAP_ANALYSIS.md) — Built vs missing
- [03_INFORMATION_ARCHITECTURE.md](./03_INFORMATION_ARCHITECTURE.md) — Nav mapping current → target
- [04_DEVELOPMENT_RULES.md](./04_DEVELOPMENT_RULES.md) — Engineering constraints
- [05_ROADMAP.md](./05_ROADMAP.md) — Phased delivery
- [Master Index](./README.md)
