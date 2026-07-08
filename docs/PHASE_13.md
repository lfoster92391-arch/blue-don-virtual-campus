# Phase 13 — Madonna Education Network Academy Engine

**Status:** Complete  
**Goal:** One Academy Engine powering all 14 Madonna Education Network academies

## Context

Phase 12 delivered labs, simulators, and Impact Fund. Phase 13 implements the **Academy Engine** — a unified learning architecture where content changes per academy but the framework stays the same. Detailed simulators (Active Directory Lab, Chromebook Repair, etc.) are scaffolded as placeholders for future content passes.

## Architecture

```
Career Pathway Dashboard (/pathways)
        │
        ▼
   14 Academies (shared engine)
        │
   ┌────┴────┬──────────┬────────────┐
   ▼         ▼          ▼            ▼
Modules   Labs/Sims  Progress   Certifications
   │                    │
   ▼                    ▼
Learning Flow      Leaderboards
(10 steps)         + Level unlock
```

### Progression Levels (per academy)

Explorer → Foundation → Intermediate → Advanced → Professional → Collegiate → Industry Capstone

### Learning Flow (per module)

Learn → Watch → Guided Lab → Practice Lab → Challenge Lab → Troubleshooting Lab → Practical Exam → Certification → Portfolio Project → Capstone Mission

## Deliverables

- [x] Prisma models: `AcademyLevel`, `LearningModule`, `Lesson`, `Video`, `Assessment`, `Mission`, `Certification`, `StudentModuleProgress`, `StudentAcademyProgress`, `StudentCertification`, `LeaderboardEntry`, `AcademyPathwayMapping`, `ModuleLabLink`, `ModuleSimulatorLink`
- [x] Extended `Academy` with `icon`, `sortOrder`, pathway mappings
- [x] Migration `20250703180000_phase13_academy_engine`
- [x] Seed: 14 MEN academies with emoji icons, pathway mappings, 7 levels each
- [x] Sample modules/missions: IT, Robotics, Cricut (+ placeholder missions for Broadcast)
- [x] `/pathways` — Career Pathway Dashboard
- [x] `/academies/[slug]` — Engine tabs: Overview, Modules, Labs, Progress, Certifications
- [x] `/academies/[slug]/modules/[id]` — Module detail with full learning flow
- [x] `/academies/[slug]/missions/[id]` — Mission lab detail
- [x] `/admin/academy-engine/modules` — Admin module catalog
- [x] `/admin/academy-engine/certifications` — Admin certification catalog
- [x] Dashboard + Profile: Student Progress Profile widget
- [x] Sidebar: Pathways nav item
- [x] AI Coaching placeholder UI in module learning flow
- [x] `siteConfig.phase` updated to `13`

## Seeded Academies (14)

| Icon | Academy | Slug |
|------|---------|------|
| 🎥 | Broadcast Academy | `broadcast` |
| 💻 | IT Academy | `it` |
| ✂️ | Cricut & Makers Academy | `cricut-makers` |
| 🤖 | Robotics Academy | `robotics` |
| 🔒 | Cybersecurity Academy | `cybersecurity` |
| 🌐 | Networking Academy | `networking` |
| 🎨 | Graphic Design Academy | `graphic-design` |
| 📸 | Photography Academy | `photography` |
| 📱 | Social Media Academy | `social-media` |
| 📊 | Business & Marketing Academy | `business-marketing` |
| 🍽 | Nutrition Services Academy | `nutrition-services` |
| 🏀 | Athletics Operations Academy | `athletics-operations` |
| 🎭 | Theater Production Academy | `theater-production` |
| 🎓 | Student Leadership Academy | `student-leadership` |

## Routes

| Route | Access | Status |
|-------|--------|--------|
| `/pathways` | Authenticated campus users | **Fully interactive** — pathway cards, academy links, recommendations |
| `/academies` | Authenticated campus users | **Fully interactive** — 14 academies, join flow |
| `/academies/[slug]` | Authenticated campus users | **Fully interactive** — tabbed engine UI |
| `/academies/[slug]/modules/[id]` | Authenticated campus users | **Scaffolded** — learning flow UI; progress tracking structure ready |
| `/academies/[slug]/missions/[id]` | Authenticated campus users | **Scaffolded** — mission objectives; lab links where seeded |
| `/admin/academy-engine/modules` | Admin, Advisor | **Catalog view** — preview modules |
| `/admin/academy-engine/certifications` | Admin, Advisor | **Catalog view** |

## Scaffolded vs Fully Interactive

| Feature | Status |
|---------|--------|
| Academy listing & join | Fully interactive |
| Career pathway dashboard | Fully interactive |
| Module learning flow UI | Fully interactive (display) |
| Progress / level unlock logic | Scaffolded (structure + UI; auto-unlock not wired) |
| Knowledge checks / assessments | Scaffolded (JSON placeholder questions) |
| AI Coaching | Placeholder UI only |
| Detailed simulators (AD Lab, Chromebook Repair) | Placeholder descriptions + lab links |
| Leaderboards | Structure seeded; points not auto-awarded yet |
| Student progress persistence | Schema ready; write actions not in this pass |

## Setup

```bash
npm run db:migrate   # Apply Phase 13 migration
npm run db:seed      # Seed 14 academies + engine content
npm run build
vercel --prod --yes  # Deploy
```

## Next Phase

Add interactive assessment engine, progress write actions, AI coaching integration, and full simulator content per academy module.
