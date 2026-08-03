# Admin Students Control Center

How Lisa (admin) runs student accounts, club assignment, preview, and analytics.

## Routes

| Route | Purpose |
|-------|---------|
| `/admin/students` | **Students control center** — create, assign club/role, preview, reset password, activate/disable |
| `/admin` | Governance hub (Students + Principal Dashboard cards) |
| `/admin/leadership` | Principal Dashboard — club funds, invoices, memberships, school pulse |
| `/service-desk/users` | All campus accounts (broader than students) |
| `/organizations/it-club?tab=finances` | IT Finances — approve pending invoices across focus clubs |

## Create a student

1. Open **Admin → Students control center** (`/admin/students`).
2. Fill **Create student**: first/last name, `@weirtonmadonna.org` email, temporary password.
3. Optionally pick a **club** (IT / Broadcasting / Cricut) and **role** (club-specific labels map to Lead / Officer / Moderator / Member).
4. Submit — they can sign in immediately with that password.

Requires `SUPABASE_SERVICE_ROLE_KEY` for auth account creation.

## Assign club + role

On each student row (or after create):

- Choose club + role → **Add to …** / **Update role**
- **Remove** clears ACTIVE membership (sets INACTIVE)

Roles available (org roles + display labels):

| Org role | IT | Broadcasting | Cricut |
|----------|----|--------------|--------|
| Lead | IT Lead | Producer | Cricut Lead |
| Officer | IT Officer | Host | Seller / Officer |
| Moderator | IT Moderator | Camera / Editor | Shop Moderator |
| Member | IT Member | Crew | Cricut Member |

Membership drives **nav scoping**: a Broadcasting-only student sees Home + Broadcasting tools — not IT or Cricut.

## Preview what they see

- **Preview** on a student row — sets an httpOnly cookie (`bd_preview_as`), scopes nav/soft-blocks to that student’s memberships, shows a yellow **Exit preview** banner.
- **Preview by club** — cookie `bd_preview_club` simulates membership in one club only.
- Does **not** permanently impersonate; admin identity stays signed in. Exit clears cookies and returns to `/admin/students`.

## Reset password / activate / disable

- Per-student **Reset password** (Supabase admin API).
- **Activate** / **Disable** toggles `User.status` (ACTIVE / INACTIVE).

## Analytics

Principal Dashboard (`/admin/leadership`) shows:

- Club fund balances (IT / Broadcasting / Cricut)
- Membership counts
- Pending invoices (deep-link to IT Finances for approval)
- Recent ledger activity
- Broadcast media / live status

## Membership-scoped nav (students)

When `BLUE_DON_FOCUSED_CLUBS` is on (default):

- Primary nav = **Home** + clubs with **ACTIVE** `OrganizationMembership`
- Soft-block: visiting another club URL redirects to their club or `/home` (not a 404)
- Admins/advisors/staff/teachers/coaches/counselors still see all clubs (unless in preview)
