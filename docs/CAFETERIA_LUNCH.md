# Cafeteria Lunch & Dietary Records

Real school operations that sit outside the club-focus pivot: families order
lunch, and the office keeps allergy records. Both stay reachable in
`FOCUSED_CLUBS_MODE`.

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
| `/admin/dietary` | Dietary Forms (under Staff & Admin) | any role with `dietary:manage` |
| `/parent` | Parent Portal | parents |

`/lunch`, `/parent`, and `/admin` are on the focused-mode allowlist in
`src/config/focused-clubs-allowlist.ts`. Before this work `/parent` was missing
from that list, so the entire Parent Portal silently redirected to `/home` —
that was the reason parents could not find lunch or anything else.

## Ordering rules

- Menus rotate by weekday in `LUNCH_MENUS` (`src/config/school-hub.ts`). Only the
  per-diner decision is persisted; the menu itself is still config.
- Choices are `HOT`, `VEGETARIAN`, `PACKED`, `NONE`. Only the first two count as
  trays for the kitchen.
- The board offers the next 10 weekday service dates. Weekends are skipped.
- A day closes at 9:00 AM that morning (`LUNCH_ORDER_CUTOFF_HOUR`). Past days are
  always locked. The cutoff is enforced in the server action, not just the UI.
- `LunchOrder` is unique on `(dinerId, serviceDate)`, so changing an order
  updates the row rather than stacking duplicates. `orderedById` records who
  placed it, which is how the board shows "Ordered by …" when a parent overrides
  a student's own pick.

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

- Menus are still code-managed. An admin menu editor (or a cafeteria feed) would
  replace `LUNCH_MENUS`.
- No billing or per-meal charge is modeled.
- The cutoff hour is evaluated in UTC, matching the rest of the campus date
  handling. Revisit if the school wants a true local-time cutoff.
