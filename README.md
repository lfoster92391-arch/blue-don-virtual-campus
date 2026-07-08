# Blue Don Virtual Campus

**Choose Your Path. Build Your Future.**

Madonna High School · Student Experience Platform

## Foundational Documents

**Read before you build:** [Foundational Documents](docs/FOUNDATIONAL_DOCUMENTS.md) — the charter that governs all work:

1. [Constitution](docs/BLUE_DON_CONSTITUTION.md) — mission, values, philosophy, design principles  
2. [Product Blueprint](docs/BLUE_DON_PRODUCT_BLUEPRINT.md) — features, workflows, roles, navigation  
3. [Technical Architecture](docs/BLUE_DON_TECHNICAL_ARCHITECTURE.md) — stack, deployment, security  
3b. [System Blueprint](docs/BLUE_DON_SYSTEM_BLUEPRINT.md) — **start here to build** — schema, engines, integrations  
4. [User Experience Flow](docs/BLUE_DON_USER_EXPERIENCE_FLOW.md) — how students move through the platform  
5. [Digital Campus](docs/BLUE_DON_DIGITAL_CAMPUS.md) — full IA, Blue Don OS, platform positioning  
6. [Blue Don Broadcasts](docs/BLUE_DON_BROADCASTS.md) — campus communications, audiences, Leadership Center  
7. [Blue Don ID](docs/BLUE_DON_ID.md) — student wallet, QR identity, passport, backpack  
8. [Guidance Center](docs/BLUE_DON_GUIDANCE_CENTER.md) — counseling, planning, transcripts  
9. [Campus Operations](docs/BLUE_DON_CAMPUS_OPERATIONS.md) — department workspaces, IT ops, analytics  
10. [Blue Don Requests](docs/BLUE_DON_REQUESTS.md) — unified request system  
11. [Strategic Pillars](docs/BLUE_DON_STRATEGIC_PILLARS.md) — six pillars feature filter  
12. [My Madonna Journey](docs/BLUE_DON_MY_MADONNA_JOURNEY.md) — timeline, achievements, recaps, time capsule  
13. [Campus Life](docs/BLUE_DON_CAMPUS_LIFE.md) — school culture, traditions, spirit, today at Madonna  
14. [Opportunity Center](docs/BLUE_DON_OPPORTUNITY_CENTER.md) — discover opportunities, What If?, Blue Don Connect  
15. [Character & Legacy](docs/BLUE_DON_CHARACTER_AND_LEGACY.md) — daily challenges, virtues, Hall of Legacy  
16. [Daily Discovery](docs/BLUE_DON_DAILY_DISCOVERY.md) — learn something new every day, Today I Learned  
17. [Campus Challenges](docs/BLUE_DON_CAMPUS_CHALLENGES.md) — monthly seasons, mystery Monday, champions  
18. [Blue Don Arcade](docs/BLUE_DON_ARCADE.md) — play, learn, earn, Campus Quest

## Status

| Item | Value |
|------|-------|
| Phase | 16 — RBAC & Organizations |
| Blueprint | Sections 01–10 locked (v1.0) |
| Stack | Next.js · TypeScript · Tailwind · shadcn/ui · Supabase · Prisma · Vercel |

## Quick Start

```bash
cd D:\Projects\blue-don-virtual-campus
cp .env.example .env
npm run db:generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)

## Project Structure

```
src/
  app/          # Next.js App Router
  components/   # Shared UI components
  config/       # Environment and site configuration
  features/     # Feature modules (Phase 1+)
  hooks/        # React hooks
  lib/          # Utilities, clients, health checks
  services/     # Business services
  types/        # Shared TypeScript types
prisma/         # Database schema and migrations
docs/           # Project documentation
```

## Build Order

Development follows the locked build order in `docs/blueprint/10_BUILD_ORDER.md`.

| Phase | Name | Status |
|-------|------|--------|
| 1 | Core Shell | Complete |
| 2 | Authentication & Roles | Complete |
| 3 | Campus Dashboard | Complete |
| 4 | Calendar & Events | Complete |
| 5 | Forms & Governance | Complete |
| 6 | Academy Framework | Complete |
| 7 | Checklist Engine | Complete |
| 8 | Portfolio Engine | Complete |
| 9 | Service Desk | Complete |
| 10 | Knowledge Vault | **Current** |
| 11 | Reporting & Admin | Pending |

**Rule:** Build one phase at a time. Stop after each phase for review and approval.

## Environment Setup

1. Copy `.env.example` to `.env`
2. Create a [Supabase](https://supabase.com) project
3. Set `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Run `npm run db:generate`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |

## Deployment

Deploy to [Vercel](https://vercel.com). See `docs/DEPLOYMENT.md`.

## Documentation

- `docs/PHASE_0.md` — Phase 0 deliverables
- `docs/PHASE_5.md` — Phase 5 deliverables
- `docs/BRANCH_STRATEGY.md` — Git workflow
- `docs/DEPLOYMENT.md` — Deployment guide
- `docs/ASSETPILOT_INTEGRATION.md` — Asset Pilot EDU connection (custom domain, links, SSO, embed)
- `docs/blueprint/` — Locked blueprint index

## License

Proprietary — Madonna High School
