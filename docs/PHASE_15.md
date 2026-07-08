# Phase 15 — Academy Content Pass (Academies 6–14)

**Status:** Complete  
**Goal:** Full modules, missions, labs, simulators, and certifications for the remaining nine Madonna Education Network academies

## Context

Phase 14 delivered rich content for academies 1–5. Phase 15 completes the MEN catalog with full learning content for:

6. **Cybersecurity Academy** (`cybersecurity`)
7. **Networking Academy** (`networking`)
8. **Graphic Design Academy** (`graphic-design`)
9. **Photography Academy** (`photography`)
10. **Social Media Academy** (`social-media`)
11. **Nutrition Services Academy** (`nutrition-services`)
12. **Athletics Operations Academy** (`athletics-operations`)
13. **Theater Production Academy** (`theater-production`)
14. **Student Leadership Academy** (`student-leadership`)

All 14 academies now have Phase 14/15-level content.

## Deliverables

- [x] `prisma/seed-academy-content-shared.ts` — shared seed helpers extracted from Phase 14
- [x] `prisma/seed-academy-content-phase15.ts` — data-driven seed for academies 6–14
- [x] Wired into `prisma/seed-academy-engine.ts`
- [x] `src/components/labs/interactive/phase15-lab-defs.ts` — StepFlowLab scaffolds for 41 new labs
- [x] `src/components/labs/interactive/lab-registry.tsx` — Phase 15 lab registration
- [x] `src/components/simulators/interactive/simulator-registry.tsx` — 10 new simulator scaffolds
- [x] `siteConfig.phase` updated to `15`

## Academy Summary

| Academy | Modules | Missions | Labs | Simulators | Interactive | Scaffolded |
|---------|---------|----------|------|------------|-------------|------------|
| Cybersecurity | 8 | 4 | 5 | 1 | — | All labs + ethical hacking sim |
| Networking | 9 | 4 | 6 | 2 | — | All labs + router/troubleshoot sims |
| Graphic Design | 8 | 3 | 6 | 1 | — | All labs + Adobe workflow sim |
| Photography | 8 | 3 | 6 | 1 | — | All labs + camera settings sim |
| Social Media | 8 | 3 | 4 | 1 | — | All labs + social analytics sim |
| Nutrition Services | 8 | 3 | 4 | 1 | — | All labs + nutrition label sim |
| Athletics Operations | 8 | 3 | 5 | 1 | — | All labs + stats tracker sim |
| Theater Production | 8 | 3 | 5 | 1 | — | All labs + cue sheet sim |
| Student Leadership | 8 | 3 | 5 | 1 | — | All labs + leadership survey sim |

## Per-Academy Detail

### Cybersecurity (`cybersecurity`)
- **Modules (8):** Overview → Password Security → Phishing → Network Security → Ethical Hacking → Incident Response → Audit Readiness → Capstone Prep
- **Missions (4):** Phishing Response, Password Audit, Incident Response, Security Audit Capstone
- **Labs (5):** Password Security, Phishing Detection, Network Security, Incident Response, Security Audit — all **scaffolded** StepFlowLab
- **Simulators (1):** Ethical Hacking Intro — **scaffolded**

### Networking (`networking`)
- **Modules (9):** Overview → OSI Model → IP/Subnetting → Switch Config → VLANs → Cable Testing → Troubleshooting → Network Design → Capstone Prep
- **Missions (4):** Subnet Calculation, VLAN Setup, Connectivity Troubleshoot, Network Design Capstone
- **Labs (6):** OSI Model, Subnetting, Switch Config, VLAN, Cable Testing, Network Design — all **scaffolded**
- **Simulators (2):** Router Config, Network Troubleshoot — **scaffolded**

### Graphic Design (`graphic-design`)
- **Modules (8):** Overview → Typography → Color Theory → Layout → Branding → Design Tools → Client Project → Capstone Prep
- **Missions (3):** Brand Identity, Poster Design, Client Project Capstone
- **Labs (6):** Typography, Color Theory, Layout, Branding, Design Tools, Client Project — all **scaffolded**
- **Simulators (1):** Adobe Workflow — **scaffolded**

### Photography (`photography`)
- **Modules (8):** Overview → Exposure Triangle → Composition → Lighting → Editing → Event Photography → Portfolio → Capstone Prep
- **Missions (3):** Event Coverage, Editing Challenge, Portfolio Capstone
- **Labs (6):** Exposure Triangle, Composition, Lighting, Editing Workflow, Event Photography, Portfolio — all **scaffolded**
- **Simulators (1):** Camera Settings — **scaffolded**

### Social Media (`social-media`)
- **Modules (8):** Overview → Platform Strategy → Content Calendar → Analytics → Community Management → Content Creation → Campaign Execution → Capstone Prep
- **Missions (3):** Week of Content, Engagement Response, School Campaign Capstone
- **Labs (4):** Platform Strategy, Content Calendar, Community Management, School Campaign — all **scaffolded**
- **Simulators (1):** Social Analytics — **scaffolded**

### Nutrition Services (`nutrition-services`)
- **Modules (8):** Overview → Food Safety → Nutrition Labels → Meal Planning → Kitchen Operations → Service Workflow → Event Catering → Capstone Prep
- **Missions (3):** Lunch Service, Menu Planning, Event Catering Capstone
- **Labs (4):** Food Safety, Meal Planning, Kitchen Operations, Catering — all **scaffolded**
- **Simulators (1):** Nutrition Label — **scaffolded**

### Athletics Operations (`athletics-operations`)
- **Modules (8):** Overview → Game Day Ops → Equipment Management → Stats/Scorekeeping → Facility Setup → Game Day Media → Tournament Ops → Capstone Prep
- **Missions (3):** Game Day Setup, Stats Mission, Tournament Capstone
- **Labs (5):** Game Day Ops, Equipment Management, Scorekeeping, Facility Setup, Tournament — all **scaffolded**
- **Simulators (1):** Stats Tracker — **scaffolded**

### Theater Production (`theater-production`)
- **Modules (8):** Overview → Stage Management → Lighting/Sound → Set Design → Rehearsal Workflow → Costume/Props → Show Production → Capstone Prep
- **Missions (3):** Rehearsal Run, Tech Rehearsal, Production Capstone
- **Labs (5):** Stage Management, Lighting/Sound, Set Design, Rehearsal Workflow, Production — all **scaffolded**
- **Simulators (1):** Cue Sheet — **scaffolded**

### Student Leadership (`student-leadership`)
- **Modules (8):** Overview → Communication → Team Building → Event Planning → Mentorship → Student Governance → Campus Initiatives → Capstone Prep
- **Missions (3):** Team Building Event, Mentorship Pairing, Campus Initiative Capstone
- **Labs (5):** Communication, Team Building, Event Planning, Mentorship, Campus Initiative — all **scaffolded**
- **Simulators (1):** Leadership Survey — **scaffolded**

## Interactive vs Scaffolded

| Feature | Status |
|---------|--------|
| Phase 15 labs (41 total) | **Scaffolded** — StepFlowLab checklists with Madonna-themed steps |
| Phase 15 simulators (10 total) | **Scaffolded** — StepFlowLab simulators |
| Assessments | **Scaffolded** — JSON placeholder questions |
| Progress write actions | **Scaffolded** — schema ready, not wired |
| AI Coaching | **Placeholder UI** |

## Setup

```bash
npm run db:seed      # Re-seed with Phase 15 content (upserts)
npm run build
vercel --prod --yes
```

No new Prisma migration required — content-only seed extension.

## Next Phase

Assessment engine, progress persistence, AI coaching integration, and deeper interactive labs for high-traffic academies.
