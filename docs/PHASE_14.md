# Phase 14 — Academy Content Pass (First 5 Academies)

**Status:** Complete  
**Goal:** Full modules, missions, labs, simulators, and certifications for the first five Madonna Education Network academies

## Context

Phase 13 delivered the Academy Engine framework with placeholder content. Phase 14 fills in rich learning content for:

1. **IT Academy** (`it`)
2. **Broadcast Academy** (`broadcast`)
3. **Robotics Academy** (`robotics`)
4. **Business & Marketing Academy** (`business-marketing`)
5. **Cricut & Makers Academy** (`cricut-makers`)

Academies 6–14 remain at Phase 13 placeholder level for a future pass.

## Deliverables

- [x] `prisma/seed-academy-content-phase14.ts` — data-driven seed for modules, lessons, videos, assessments, labs, simulators, missions, certifications
- [x] Interactive lab UI: Active Directory Lab, Help Desk Lab (AI scoring placeholder)
- [x] Step-flow scaffold labs/simulators for remaining IT, Broadcast, Robotics, Business, Cricut labs
- [x] Lab registry (`src/components/labs/interactive/lab-registry.tsx`)
- [x] Simulator registry (`src/components/simulators/interactive/simulator-registry.tsx`)
- [x] Lab/simulator detail pages embed interactive content when registered
- [x] Internal launch URLs (`/labs/{slug}`, `/simulators/{slug}`)
- [x] `siteConfig.phase` updated to `14`

## Academy Summary

| Academy | Modules | Missions | Labs | Simulators | Interactive | Scaffolded |
|---------|---------|----------|------|------------|-------------|------------|
| IT | 8 | 3 | 5 | 1 | AD Lab, Help Desk Lab | Chromebook, Google Workspace, Network Rack |
| Broadcast | 8 | 3 | 1 | 0 | Broadcast Studio | — |
| Robotics | 9 | 6 | 3 | 4 | — | All simulators + wiring/arena labs |
| Business & Marketing | 9 | 7 | 1 | 2 | — | Campaign Studio, Analytics simulators |
| Cricut & Makers | 9 | 2 | 5 | 1 | — | Design Space sim + all specialty labs |

## Interactive vs Scaffolded

| Feature | Status |
|---------|--------|
| Active Directory Lab | **Interactive** — 4-step AD workflow (users, passwords, domain join, GPO) |
| Help Desk Lab | **Interactive** — ticket triage + AI scoring placeholder |
| Step-flow labs (Chromebook, Network, Google, Broadcast, Cricut) | **Scaffolded** — step-by-step checklists |
| Robotics/Business simulators | **Scaffolded** — step-flow simulators |
| Assessments | **Scaffolded** — JSON placeholder questions |
| Progress write actions | **Scaffolded** — schema ready, not wired |
| AI Coaching | **Placeholder UI** |

## Setup

```bash
npm run db:seed      # Re-seed with Phase 14 content (upserts)
npm run build
vercel --prod --yes
```

No new Prisma migration required — content-only seed extension.

## Next Phase

Full content for academies 6–14 (Cybersecurity, Networking, Graphic Design, etc.), assessment engine, progress persistence, and AI coaching integration.
