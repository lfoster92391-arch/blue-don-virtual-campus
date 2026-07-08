# The Blue Don Constitution

**Document 1 of 5 — Foundational Documents**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Ratified for development and operations  
**Audience:** Developers, teachers, advisors, administrators, and future campus leaders  

**Companion documents:** [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Technical Architecture](./BLUE_DON_TECHNICAL_ARCHITECTURE.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Preamble

This Constitution is the **north star** for Blue Don Virtual Campus. It is not a feature spec, a sprint plan, or a line of code. It is the shared agreement about **why we build**, **who we serve**, and **how we behave** when making product and technical decisions.

Every person who designs, teaches through, administers, or extends this platform should read this document before contributing. When trade-offs arise, **this Constitution wins** over convenience, trends, or individual preference—unless stakeholders formally amend it.

> **Choose Your Path. Build Your Future.**

---

## Article I — Why Blue Don Exists

Madonna High School students live in a world of fragmented tools: a gradebook here, a club signup there, a scholarship PDF in email, a career quiz forgotten by spring. Families chase information across portals. Teachers duplicate work. Opportunities hide in hallway conversations.

**Blue Don Virtual Campus exists to end that fragmentation.**

We are building a **digital operating system for the whole student**—not an LMS clone, not a link farm, not a social network. Blue Don accompanies a student from **middle school exploration through graduation and into alumni life**, connecting:

- Academies and career pathways  
- Classes, clubs, teams, and events  
- Service, leadership, and portfolio evidence  
- Forms, governance, and family participation  
- Future planning, certifications, and community  

Blue Don makes school life **coherent, discoverable, and accountable**—so every student can see what is possible and take the next step with confidence.

---

## Article II — Mission

**To help every Madonna High School student choose their path and build their future** through personalized academy programs, accountable participation, and a campus community that connects learning to real opportunity.

We fulfill this mission by:

1. **Meeting every student where they are** — grade, role, academy, family context.  
2. **Surfacing every opportunity** — academics, athletics, service, leadership, trades, college, and career paths are first-class, not buried.  
3. **Honoring every journey** — progress, achievements, and growth persist over years; alumni remain connected.

---

## Article III — Vision

**Blue Don is The Digital Campus Experience** — not a school app.  
**Where Every Student's Journey Begins.**

By 2030, Blue Don Virtual Campus is the **trusted home** for Madonna school life:

- A **7th grader** discovers clubs and kindness projects on a dashboard built for explorers.  
- A **9th grader** joins an academy, signs agreements with family, and begins a portfolio.  
- An **11th grader** connects labs, certifications, and Future Center planning in one place.  
- A **senior** launches applications and capstone work with evidence already organized.  
- An **alumnus** mentors, gives back, and stays tied to the community they helped build.  

Teachers spend less time chasing systems and more time guiding students. Administrators operate programs with clear governance, compliance, and records. Developers extend one platform instead of reinventing silos.

---

## Article IV — Core Values

| Value | What it means on Blue Don |
|-------|---------------------------|
| **Integrity** | We tell the truth in product copy, data handling, and AI responses. We do not fake progress or scores. |
| **Dignity** | Every user—especially minors—is treated with respect. No shame-based UX. No public failure states. |
| **Belonging** | Clubs, teams, academies, and campus-wide spaces are designed so students can find their people. |
| **Excellence** | We ship polished, reliable experiences—not demos dressed as production. |
| **Accountability** | Forms, approvals, attendance, and records exist so programs can operate safely and fairly. |
| **Service** | Campus life includes giving back; service hours and leadership are tracked and celebrated. |
| **Growth** | Learning is iterative; portfolios, certifications, and journeys show improvement over time. |
| **Stewardship** | We protect student data, school reputation, and public trust as fiercely as we protect uptime. |

---

## Article V — Product Philosophy

### V.1 — Digital campus OS, not LMS

Coursework is **one slice** of school life. Student life, career preparation, community, and operations are equally important. Features that only serve gradebooks without serving the whole journey do not belong on Blue Don.

### V.2 — Every Student, Every Opportunity, Every Journey

| Pillar | Product obligation |
|--------|-------------------|
| **Every Student** | Role- and context-aware experiences. No one-size-fits-all dashboard. |
| **Every Opportunity** | Academies, athletics, service, internships, and scholarships are destinations—not sidebar afterthoughts. |
| **Every Journey** | Longitudinal records evolve from year to year; alumni remain in the story. |

### V.2b — Play with purpose

Students choose TikTok, games, and social apps freely. Blue Don earns daily opens through **fun that teaches** — arcade puzzles, streaks, and campus quests that reinforce faith, careers, and community. Engagement serves growth; it is not manipulation. See [Blue Don Arcade](./BLUE_DON_ARCADE.md).

### V.3 — What we are not

| Anti-pattern | Why we reject it |
|--------------|------------------|
| LMS clone | Reduces students to assignments only |
| Static portal | PDF graveyards and dead links |
| Social network | Drama, anonymity, and comparison culture |
| Mindless games | Arcade must teach — not empty scrolling |
| Counseling chatbot | Clinical mental health is out of scope |
| Feature scatter | Twelve primary destinations; depth via workspaces, not nav sprawl |

### V.4 — Create once, publish everywhere

Events, announcements, broadcasts, and opportunities should flow to **calendar, org pages, feed, ticker, and notifications** from a single source of truth—the Event Engine and Broadcast Engine principles.

### V.5 — Archive, never erase

Governance records, submissions, and program history use **archive flags**, not hard deletes. Compliance and trust depend on retained records.

### V.6 — Blueprint before code

Enterprise features require approved documentation (module placement, data model, permissions, navigation) **before** implementation. Phase discipline applies: one phase at a time, stop for review.

---

## Article VI — Student-First Philosophy

**The student is the primary user.** Parents, teachers, and administrators are essential—but the platform succeeds when students can act, grow, and belong without friction.

### VI.1 — Defaults favor the learner

- Onboarding is short, clear, and respectful of minors.  
- Dashboards prioritize **what to do next**, not administrative chrome.  
- Grade-band experiences differ: middle school explorers ≠ senior launch mode.  

### VI.2 — Agency with guardrails

Students choose pathways, join academies, propose Impact Fund projects, and build portfolios. **Guardrails**—forms, approvals, moderation, and permissions—exist so agency does not become chaos.

### VI.3 — Evidence over vanity metrics

Portfolios, certifications, service hours, and lab completions matter more than arbitrary streaks. Gamification (XP, coins, badges) must **reward real participation**, never replace it.

### VI.4 — No student left invisible

Compliance views track missing forms and unsigned agreements so **no student falls through the cracks** because a paper form was lost.

### VI.5 — Family as partner, not proxy

Parents see what they need—agreements, progress summaries, events—without owning the student account. Parent portals support the family; they do not replace student voice.

---

## Article VII — User Experience Principles

1. **Clarity over cleverness** — Labels say what they mean. "Service Desk" not "Ticket subsystem."  
2. **One primary action per screen** — Every page answers: *What should I do here?*  
3. **Progressive disclosure** — Simple first; advanced options when needed.  
4. **Consistent shell** — `ShellPage`, dashboard cards, and campus navigation feel like one product.  
5. **Forgiving flows** — Errors explain what happened and what to do next. Password reset, form rejection, and failed joins must be recoverable.  
6. **Role-aware, not role-blind** — Students, parents, teachers, and admins see different surfaces by design.  
7. **Mobile-ready** — Bottom nav, touch targets, and PWA install matter; many families use phones first.  
8. **Calm urgency** — Deadlines and compliance use clear status colors; we do not manufacture anxiety.  
9. **Kindness in community** — Feed and media surfaces are positive-first; moderation is built in, not bolted on.  
10. **Respect time** — No unnecessary steps, no duplicate data entry across modules.

---

## Article VIII — Design Standards

Blue Don visual identity reflects **Madonna High School pride** and **professional readiness**.

### VIII.1 — Brand palette (locked)

| Token | Hex | Use |
|-------|-----|-----|
| Blue Don Navy | `#0A2342` | Primary brand, sidebar, headings |
| Silver | `#C6CCD6` | Secondary text on dark surfaces |
| Gold | `#C9A227` / `#D4A017` | Achievement, warnings, emphasis |
| Success | `#2E8B57` | Completion, approval, positive status |
| Info | `#2F80ED` | Links, focus, interactive accents |
| Danger | `#C62828` | Errors, destructive actions |

Configuration lives in `src/config/site.ts` (`brandColors`, `brandAssets`).

### VIII.2 — Typography & layout

- **Font:** Inter (system sans fallback).  
- **Max content width:** 1440px campus content area.  
- **Cards:** Rounded-xl borders, subtle hover on interactive rows.  
- **Dark mode:** Supported; navy/silver tokens adapt via CSS variables.

### VIII.3 — Components

- **UI library:** shadcn/ui + Base UI primitives.  
- **Patterns:** `ShellPage`, `DashboardCard`, campus sidebar/header.  
- **Icons:** Lucide React; consistent 16–20px in lists, 24px in headers.  
- **No orphan styles** — Use Tailwind utilities and shared tokens; avoid one-off hex in new code.

### VIII.4 — Logo usage

- **Campus identity:** Madonna shield emblem (application icon, sidebar, PWA).  
- **Academy identity:** Program-specific marks (e.g., Broadcast Academy logo) appear **on academy pages only**, not as the global app icon.

### VIII.5 — Content voice

- Professional, encouraging, plain language.  
- Institution name: **Madonna High School**. Product name: **Blue Don Virtual Campus** (short: **Blue Don**).  
- Tagline: **Choose Your Path. Build Your Future.**

---

## Article IX — Accessibility Standards

Blue Don targets **WCAG 2.1 Level AA** as the minimum bar for new and migrated surfaces.

### IX.1 — Requirements

- Semantic HTML landmarks (`header`, `main`, `nav`, `aside`).  
- Visible focus states on all interactive elements.  
- Color is never the only indicator of state (pair with text/icons).  
- Form fields have associated `<label>` elements.  
- Images have meaningful `alt` text; decorative images use empty alt.  
- Touch targets ≥ 44×44px on mobile where feasible.  
- Support keyboard navigation for core flows (login, forms, tickets).  

### IX.2 — Testing

- Manual keyboard pass before shipping major UI.  
- Automated linting where available; axe checks on critical paths in CI (roadmap).  
- Screen reader spot-checks on auth, dashboard, and form signing flows.

### IX.3 — Inclusive design

- Grade-band language readable by middle schoolers and parents.  
- Avoid idioms that exclude ESL families.  
- Respect `prefers-reduced-motion` for animations (roadmap enforcement).

---

## Article X — AI Principles

**Blue Don AI is a mentor, not a counselor, not a parent, and not an authority.**

### X.1 — Purpose

AI on Blue Don helps students:

- Explore career pathways and academy options  
- Understand next steps on their journey  
- Get unstuck on learning modules (hints, not answers)  
- Discover events, opportunities, and campus resources  

### X.2 — Hard boundaries

| AI must NOT | Reason |
|-------------|--------|
| Provide mental health diagnosis or treatment | Requires licensed professionals |
| Replace counselors or clergy | Human relationships are sacred |
| Fabricate grades, awards, or records | Integrity |
| Bypass permissions or expose private data | Privacy and FERPA |
| Post to community feed without human review | Safety of minors |
| Make binding commitments (enrollment, purchases) | Governance requires human approval |

### X.3 — Transparency

- AI-generated content is labeled where shown.  
- Users can dismiss recommendations.  
- Prompts and logs are retained per privacy policy—not indefinitely by default.  
- Opt-out paths for AI features where legally and practically required.

### X.4 — Human in the loop

Advisors, teachers, and administrators **approve** academy joins, purchases, travel, publishing, and Impact Fund allocations. AI may recommend; humans decide.

---

## Article XI — Privacy Principles

Blue Don handles **student and family data** as a sacred trust.

### XI.1 — Legal alignment

- **FERPA** — Educational records protected; share only with legitimate educational interest.  
- **COPPA** — Extra care for users under 13; parental involvement where required.  
- **State student privacy laws** — Apply Michigan and applicable federal guidance.  

### XI.2 — Data classification

| Class | Examples | Handling |
|-------|----------|----------|
| Directory | Name, grade, academy membership | Campus-visible per role |
| Academic | Assignments, progress, certifications | Student + authorized staff |
| Governance | Signed forms, approvals | Student + admin/advisor |
| Sensitive | Health-adjacent notes, discipline | Restricted; never in AI training |
| Authentication | Passwords, tokens | Hashed; never logged in plain text |

### XI.3 — Practices

- **Least privilege** — RBAC and org-scoped permissions on every action.  
- **Server-side secrets** — Service role keys never in client bundles.  
- **No sale of student data** — Ever.  
- **Retention** — Archive for compliance; define deletion schedules for AI logs and drafts.  
- **Breach response** — Notify institution leadership; document incident timeline.

### XI.4 — Family visibility

Parents see linked student summaries appropriate to their role. Students retain agency over portfolio narrative where policy allows. No "surveillance dashboard" for families.

---

## Article XII — Technical Architecture

Blue Don is built for **reliability, clarity, and incremental growth**.

### XII.1 — Stack (locked for MVP → enterprise)

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Auth | Supabase Auth (email/password, OAuth) |
| Database | PostgreSQL via Prisma ORM |
| Hosting | Vercel |
| PWA | Service worker, manifest, install prompt |

### XII.2 — Architecture patterns

```
src/app/          → Thin routes; fetch and render only
src/services/     → Business logic and data access
src/features/     → Server actions per domain
src/config/       → Navigation, roles, site, env
src/components/   → Shared UI; domain folders allowed
prisma/           → Schema, migrations, seeds
docs/             → Blueprint, phases, this Constitution
```

- **Server actions** with permission checks (`hasPermission`, `requireCompleteProfile`).  
- **No business logic in page components** beyond composition.  
- **Prisma** is the data source of truth; migrations per phase.  
- **Config-driven navigation** — `src/config/navigation.ts`; no hardcoded nav in components.

### XII.3 — Integrations (roadmap)

Google Classroom, Google Calendar, FACTS SIS, Asset Pilot EDU, and partner sites connect through documented adapters—never ad-hoc scraping.

### XII.4 — Environments

- `.env` / Vercel secrets for keys; never commit credentials.  
- `SUPABASE_SERVICE_ROLE_KEY` server-only for admin account operations.  
- Production URL allowlisted in Supabase for auth redirects.

---

## Article XIII — Development Standards

### XIII.1 — Phase discipline

1. Read the locked blueprint and relevant `docs/PHASE_*.md`.  
2. Build **one phase** at a time.  
3. Stop for stakeholder approval before the next phase.  
4. Do not exceed phase scope without documented approval.

### XIII.2 — Before every feature (A1–A6 gate)

| # | Question |
|---|----------|
| A1 | Which module? Which nav item? Mobile priority? |
| A2 | What Prisma models, indexes, and migration? |
| A3 | What RBAC keys and org scope? |
| A4 | What `navigation.ts` entry? |
| A5 | Responsive layout and touch targets? |
| A6 | Pagination, caching, rate limits? |

### XIII.3 — Code quality

- TypeScript strict; `npm run build` must pass before merge.  
- Match existing patterns—do not introduce new abstractions for one-off cases.  
- Minimal diff; no unrelated refactors in feature PRs.  
- Comments only for non-obvious business rules.  
- Tests where behavior is complex or regression-prone—not for trivial getters.

### XIII.4 — Git and review

- Conventional, descriptive commit messages focused on *why*.  
- PR description: summary + test plan.  
- No force-push to `main`.  
- Security-sensitive changes require explicit review.

### XIII.5 — Seeds and demos

- `prisma/seed*.ts` provides realistic Madonna academies, forms, and orgs for local dev.  
- Demo data never uses real student PII.

---

## Article XIV — Governance & Operations

### XIV.1 — Forms workflow

```
Draft → Review → Approve → Publish → Complete → Archive
```

Required agreements (enrollment, student/parent, media release, etc.) gate program participation. **No hard delete** of published forms or submissions.

### XIV.2 — Approval types

Join Academy · Purchase · Sponsor · Event · Travel · Impact Fund · Capstone · Publishing

Advisors and administrators review signed submissions. Students and families complete; staff approves.

### XIV.3 — Roles

Fourteen campus roles (Admin, Advisor, Teacher, Student, Parent, Sponsor, Alumni, Staff, Coach, Counselor, …) plus organization roles (Lead, Officer, Moderator, Member). Permissions are **string keys** checked server-side—never UI-only.

### XIV.4 — Service Desk

Technology, academic, facilities, and account support flow through Service Desk tickets. **Account creation and password reset** for students and staff are admin operations under Service Desk → Account management.

---

## Article XV — Amendment Process

1. **Proposal** — Any stakeholder may propose an amendment in writing.  
2. **Review** — Madonna leadership + lead architect review impact on students, privacy, and blueprint.  
3. **Ratification** — Document version bumped; `docs/BLUE_DON_CONSTITUTION.md` updated.  
4. **Communication** — Developers and faculty notified; in-app Constitution page updated when applicable.  

Emergency security or legal patches may be applied immediately with retrospective documentation within 7 days.

---

## Article XVI — Signatures & Adoption

This Constitution **v1.0** is adopted as the governing charter for Blue Don Virtual Campus development and operations at Madonna High School.

| Role | Responsibility |
|------|----------------|
| **Institution leadership** | Mission alignment, policy, FERPA authority |
| **Lead architect / product owner** | Blueprint fidelity, phase gates |
| **Developers** | Implementation per Articles XII–XIII |
| **Teachers & advisors** | Student-first feedback, workflow validation |
| **Administrators** | Governance, compliance, account stewardship |

---

## Article XVII — Strategic Pillars

Blue Don is organized around **six strategic pillars**. Every feature must belong to at least one:

1. **Student Success** — Academics, growth, portfolios, career readiness  
2. **Student Life** — Clubs, athletics, service, events, class pages  
3. **School Operations** — IT, facilities, admissions, communications, administration  
4. **Community Engagement** — Parents, alumni, business partners, recruiters  
5. **Digital Identity** — Student ID, wallet, passport, rewards, journey  
6. **Intelligence** — AI mentor, analytics, recommendations, automation  

Before adding a feature, ask: **Which pillar does this belong to?** If none fit, it does not belong in Blue Don.

Full framework: [BLUE_DON_STRATEGIC_PILLARS.md](./BLUE_DON_STRATEGIC_PILLARS.md).

---

## Quick Reference Card

| Question | Answer |
|----------|--------|
| Why do we exist? | End fragmentation; whole-student digital OS |
| Who comes first? | The student |
| What are we not? | LMS, social network, therapy bot |
| How do we ship? | One phase at a time; blueprint before code |
| How do we look? | Navy, silver, gold; ShellPage; shadcn |
| How do we treat data? | FERPA, least privilege, archive not delete |
| How do we use AI? | Mentor and guide; human approves commitments |
| Where is the code map? | `src/services/`, `src/config/`, `prisma/` |
| Where is the roadmap? | `docs/enterprise-blueprint/05_ROADMAP.md` |
| Which pillar? | `docs/BLUE_DON_STRATEGIC_PILLARS.md` |
| Where is this doc? | `docs/BLUE_DON_CONSTITUTION.md` |

---

*Madonna High School · Blue Don Virtual Campus*  
*Choose Your Path. Build Your Future.*
