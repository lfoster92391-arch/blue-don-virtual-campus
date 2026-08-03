# Clean Slate Mode

Blue Don Virtual Campus launches as a **blank real instance**. Every role —
student, parent, staff, teacher, admin — starts empty. When the school adds
clubs, XP, forms, partners, events, spotlights, and impact, that content is
genuinely *theirs*. No fake demo data is presented as if it were real.

This document explains what stays, what starts empty, how to toggle the mode,
and how to load a fully populated demo on demand.

---

## The two kinds of seed data

**1. Structural / catalog data the app NEEDS to function — always kept.**
This is the "menu" real users pick from. Deleting it breaks the app.

- Organizations catalog (clubs, teams, classes to join)
- Academies + academy engine content (modules, missions, certifications)
- Forms / agreement definitions
- Waves, navigation, org profiles, category metadata
- School record (Madonna High School), knowledge base starter articles,
  simulator catalog
- School traditions calendar + school history timeline (descriptive catalog)

**2. Fake activity / associations that should NOT preload — gated.**
These are things real users create over time.

- Demo memberships, XP, club progress, badges, service hours
- Sample announcement feed, seeded community-impact numbers
- Demo community & business partners, the mentor network, scholarship board
- Spotlights (student/staff), thank-you wall, campus polls, alumni map,
  legacy pages, hall of fame, faculty directory, time capsules, archives
- IT Club equipment inventory
- The rich "Alex Martinez" demo persona (memberships, seeded legacy)

---

## The flag

Clean slate is controlled by one environment variable:

```bash
BLUE_DON_CLEAN_SLATE=true   # (default) blank real launch — empty states
BLUE_DON_CLEAN_SLATE=false  # show sample/demo content instead
```

- **Unset / `1` / `true` / `yes` / `on` → clean slate ON** (the real-launch default).
- **`0` / `false` / `no` / `off` → clean slate OFF** (sample content for demos).

Implementation: `src/config/app-mode.ts` exports `CLEAN_SLATE` plus helpers
`sampleList()`, `sampleOrNull()`, and `sampleValue()`. Services and config
modules use these so that, in clean slate mode, they return real DB data only
with graceful empty states instead of config fake data.

---

## Features switched to empty states

When clean slate is on, these render empty / zeroed instead of fake content:

| Feature | Clean slate behavior |
| --- | --- |
| Campus feed (home) | "No announcements yet" empty state |
| Community Impact dashboard | Every stat shows `0`, "No data yet" |
| Mentor Network directory + detail | Empty ("apply to mentor"); details 404 |
| Business Partners directory + detail | Empty ("apply as a partner"); details 404 |
| Community Partners directory | Empty ("check back after partners approved") |
| Scholarships board + detail | Empty board; detail pages 404 |
| Graduate Legacy (demo persona) | No seeded Alex Martinez page |
| Student / Staff Spotlight | "No spotlight yet" empty state |
| Thank-you wall, campus polls, alumni map | Empty arrays → existing empty states |
| Hall of Fame, faculty directory | Empty arrays → existing empty states |
| Legacy projects, archives, time capsules | Empty arrays → existing empty states |
| Today panel (home) | `+0 XP`, no fake fundraiser/birthdays/challenge |
| XP / rewards, service hours, passports | Driven by real per-user data → `0` |
| Success analytics / admin dashboards | Real DB counts (`0`), never fake numbers |

Kept as-is (structural / descriptive): organizations, academies, forms,
traditions calendar, school history, "Why Madonna" marketing copy, category
metadata, and Impact-Before-Diploma example idea templates.

Demo **login accounts still work** (`demo.student@bluedon.test`,
`demo.teacher@bluedon.test`) but start with **no** memberships, leadership, or XP.

---

## Seeding

`npm run db:seed` now seeds **structural catalog only** — a clean slate launch.
The demo login accounts are created but blank.

```bash
npm run db:seed          # clean slate: catalog only, blank demo accounts
```

### Load the rich demo (populated walkthrough)

When you want a fully populated instance for a demo or walkthrough:

```bash
npm run db:seed:demo     # catalog + partners, mentors, equipment,
                         # demo teacher IT Club advisor role, and the rich
                         # "Alex Martinez" student persona
```

Under the hood this sets `SEED_DEMO_CONTENT=1` (and
`SEED_DEMO_STUDENT_MEMBERSHIPS=1`) before running the standard seed, so the same
seed code powers both modes.

> Tip: to also make the *app* render the config sample content (feed, impact
> numbers, spotlights, etc.), additionally set `BLUE_DON_CLEAN_SLATE=false`.

### Reset back to a clean slate

To wipe all data (including any accumulated activity) and reseed only the
structural catalog:

```bash
npm run db:reset:clean   # prisma migrate reset --force --skip-seed && npm run db:seed
```

This drops and recreates the database from migrations, then runs the clean-slate
seed. Demo login accounts are recreated blank.

---

## Environment variable reference

| Variable | Default | Effect |
| --- | --- | --- |
| `BLUE_DON_CLEAN_SLATE` | `true` | App shows empty states instead of config sample data |
| `SEED_DEMO_CONTENT` | unset | Seed partners, mentors, equipment, demo memberships/leadership |
| `SEED_DEMO_STUDENT_MEMBERSHIPS` | unset | Seed only the rich demo student persona |

---

## For developers: adding new features

When a feature would otherwise render seeded/sample content as if it were real:

1. Import from `@/config/app-mode`.
2. Gate the sample data:
   - Arrays: `return sampleList(SAMPLE_ARRAY);`
   - Single object: `return sampleOrNull(SAMPLE_OBJECT);`
   - Scalars/counts: `sampleValue(seededCount, 0)`
3. Make sure the consuming component renders a friendly empty state
   ("None yet — add the first", "No data yet", etc.).
4. If it seeds DB rows, gate the seed behind `SEED_DEMO_CONTENT` in
   `prisma/seed.ts` so a clean-slate `db:seed` stays blank.
