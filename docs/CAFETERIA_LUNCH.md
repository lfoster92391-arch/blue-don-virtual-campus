# Cafeteria Lunch & Dietary Records — RETIRED

> **This system is no longer live.** Madonna runs menus, lunch orders, and
> cafeteria payments on **FuelTheDons**; the campus app links out instead of
> keeping its own. `/lunch` is a short page pointing at FuelTheDons, and
> `/lunch/selections`, `/lunch/kitchen`, `/admin/lunch-menu`, `/admin/dietary`,
> and `/admin/cafeteria` redirect to it. Every nav entry is gone.
>
> The Prisma tables (`LunchOrder`, `CafeteriaAccount`, `CafeteriaLedgerEntry`,
> dietary records, published menus) and their services remain in the repo —
> retiring the UX did not require a destructive migration, and the rows still
> answer a historical question. Dropping them is optional later work.
>
> See `docs/MADONNA_HUB.md` for what replaced it. **Everything below describes
> the retired system and is kept for reference only.**

Real school operations that sat outside the club-focus pivot: families ordered
lunch, and the office kept allergy records.

## Who can do what

| Role | Orders own lunch | Orders for linked students | Submits dietary forms | Accepts dietary forms | Kitchen counts |
| --- | --- | --- | --- | --- | --- |
| Parent | — | yes | yes | — | — |
| Teacher | yes | yes (if linked) | yes | — | — |
| Staff | yes | yes (if linked) | yes | yes | yes |
| Advisor | yes | yes (if linked) | yes | yes | yes |
| Counselor | yes | yes (if linked) | yes | yes | — |
| Coach | yes | yes (if linked) | yes | — | — |
| Admin | yes | yes (if linked) | yes | yes | yes |
| Student | yes | — | — | — | — |
| Sponsor / Alumni | — | — | — | — | — |

Parents never get a tray of their own — they order for children only. A teacher
who is also a Madonna parent sees their own lunch *and* each linked child on the
same board.

Permissions live in `src/config/roles.ts` as `lunch:order`, `lunch:manage`,
`dietary:submit`, and `dietary:manage`. The sidebar derives its role lists from
those permissions so nav cannot drift from the permission table.

## Routes

| Route | Nav label | Who sees it |
| --- | --- | --- |
| `/lunch` | Cafeteria Lunch | any role with `lunch:order` |
| `/lunch/selections` | Your Lunch Selections | any role with `lunch:order` |
| `/lunch/kitchen` | Kitchen Prep Sheet (under Staff & Admin) | any role with `lunch:manage` |
| `/admin/lunch-menu` | Lunch Menu Calendar (under Staff & Admin) | any role with `lunch:manage` |
| `/admin/dietary` | Dietary Forms (under Staff & Admin) | any role with `dietary:manage` |
| `/admin/cafeteria` | Cafeteria Accounts (under Staff & Admin) | any role with `cafeteria:manage` |
| `/parent` | Parent Portal | parents |
| `/parent/guide` | Parent Guide | parents and staff |

`/lunch`, `/parent`, and `/admin` are on the focused-mode allowlist in
`src/config/focused-clubs-allowlist.ts`. Before this work `/parent` was missing
from that list, so the entire Parent Portal silently redirected to `/home` —
that was the reason parents could not find lunch or anything else.

## Publishing the menu

Staff build the calendar at `/admin/lunch-menu`, three school weeks at a time.

1. **Edit a day.** Each day is prefilled from the rotating weekday menu, so a
   week is edited rather than typed from scratch. **Save day** writes a
   `LunchMenuDay` row and nothing else — saving never publishes.
2. **Check the week.** Saved days read *Draft*; untouched days read *Standard
   rotation*.
3. **Publish the week.** `publishedAt` is stamped and families see it
   immediately. With the notify box left ticked, every parent account with a
   linked student gets a Command Center message linking to `/lunch`.

**Pull this week back** clears `publishedAt`, and those days fall back to the
rotation. `LUNCH_MENUS` (`src/config/school-hub.ts`) is now the fallback, never
the source of truth: `resolveLunchMenus()` prefers a published row for the date
and drops back to the rotation otherwise, so the board is never blank and a
database outage degrades to the old behaviour. Per-day office notes ("Early
dismissal — cold lunch only") show on the ordering board and the prep sheet.

## Ordering rules

- Choices are `HOT`, `VEGETARIAN`, `PACKED`, `NONE`. Only the first two count as
  trays for the kitchen.
- The board offers the next 10 weekday service dates. Weekends are skipped.
- A day closes at 9:00 AM that morning (`LUNCH_ORDER_CUTOFF_HOUR`). Past days are
  always locked. The cutoff is enforced in the server action, not just the UI.
- `LunchOrder` is unique on `(dinerId, serviceDate)`, so changing an order
  updates the row rather than stacking duplicates. `orderedById` records who
  placed it, which is how the board shows "Ordered by …" when a parent overrides
  a student's own pick.

## Confirming an order

The board flashes **Saved** only on the button just tapped, and that flash does
not survive a page load. The standing read-back lives in the **Your selections**
card at the bottom of `/lunch` and, in full, at `/lunch/selections`: every saved
choice per diner with its dish, plus the open days nobody has answered.
`buildLunchSelectionSummary()` (`src/lib/lunch-selections.ts`) derives both from
the same `LunchBoard` the ordering grid renders, so they cannot drift apart.

## Kitchen quantities

`getLunchKitchenCounts()` answers "how many trays" and still backs the **Kitchen
counts** table on `/lunch`. `getLunchKitchenPlan()`
(`src/services/lunch-kitchen-service.ts`) answers the rest, on `/lunch/kitchen`:
counts labelled with the actual dish, serving lists by name, allergies going out
on the line, and family notes. Both are read-only and gated on `lunch:manage`.

Days are grouped into school weeks with per-week totals above the day cards, so
"how many hot lunches Monday through Friday" is one number rather than five.

### Weekend head counts

The prep sheet is a seven-day-a-week page. `listLunchServiceDates()` walks
forward from today, so on a Sunday the window already starts at Monday and the
counts for the coming week are live — weekend dates are skipped as *service*
days, never as *reporting* days.

Two things make that work in practice:

- Nothing is "today" on a weekend, so the sheet expands the next upcoming day
  instead. Otherwise Sunday prep opened onto a wall of collapsed cards.
- A banner names the situation — no service today, here is the week ahead — and
  repeats that an open day can still move until 9:00 AM that morning. The first
  week's heading reads "the week ahead" on those days.

`isServiceDayToday()` is what the page branches on. It exists to explain the
weekend, not to hide anything on it.

## Cafeteria balances

Money is tracked in `CafeteriaAccount` / `CafeteriaLedgerEntry` and moves only
when the office records an entry at `/admin/cafeteria` — the app takes no card
payments. Families bring cash or a check in an envelope with the student's name
on it, and Mrs. Dalfol credits it. Balances at or under $10.00 send an in-app
message to every linked parent. See `docs/PARENT_GUIDE.md` for the full process
and the notification rules.

## Dietary forms

Two tables on purpose:

- `DietaryRequest` — what a family submitted and who reviewed it.
- `StudentDietaryProfile` — the canonical record on the student account.

Accepting a request copies its allergens, restrictions, and notes onto the
profile inside one transaction, so a student is never left with an accepted form
that never reached their account. Declining leaves the profile untouched.
Submitting a new form supersedes any earlier pending one for that student, so
the office reviews one current ask per student.

The office accepts forms at `/admin/dietary`, individually or with
**Accept all & apply**. Accepted records then appear:

- on the lunch ordering board next to the student's name, and
- on the student profile under "Cafeteria & dietary".

Restrictions that rule out a meat entree (vegetarian, vegan, halal, kosher) mark
the Hot lunch button as a conflict and nudge toward the vegetarian option. It is
a warning, not a block — the office can still order what a family asks for.

Allergen and restriction vocabularies are fixed id lists in
`src/config/dietary.ts`; anything not in the catalog is dropped on write. Free
text goes in `notes`, capped at 500 characters.

## Follow-ups

- Balances exist, but no per-meal price does — charges are keyed in by the office
  rather than posted automatically from `LunchOrder`.
- The cutoff hour is evaluated in UTC, matching the rest of the campus date
  handling. Revisit if the school wants a true local-time cutoff.
