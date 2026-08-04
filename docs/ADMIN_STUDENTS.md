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
| `/organizations/it-club?tab=documents` | IT Club bylaws, constitution, and group documents |
| `/organizations/cricut-club?tab=projects` | Cricut projects |
| `/organizations/cricut-club?tab=checklists` | Cricut checklists (standalone or project-linked) |

## Create a student

1. Open **Admin → Students control center** (`/admin/students`).
2. Fill **Create student**: first/last name, `@weirtonmadonna.org` email, temporary password.
3. Optionally pick a **club** (IT / Broadcasting / Cricut) and **role** (President / Vice President / Secretary / Member).
4. Submit — they can sign in immediately with that password.

Requires `SUPABASE_SERVICE_ROLE_KEY` for auth account creation.

## Assign club + role

On each student row (or after create):

- Choose club + role → **Add to …** / **Update role**
- **Remove** clears ACTIVE membership (sets INACTIVE)

Roles (same labels on every focus club):

| Role | Finances | Documents (IT) | Projects / checklists (Cricut) |
|------|----------|----------------|--------------------------------|
| **President** | View + manage | Edit | Manage |
| **Vice President** | View + manage | Edit | Manage |
| **Secretary** | View + manage | Edit | Manage |
| **Member** | Hidden | View only | View projects; can complete checklist items |
| **Admin** (campus) | Always | Always | Always |

Membership drives **nav scoping**: a Broadcasting-only student sees Home + Broadcasting tools — not IT or Cricut.

## Preview what they see

1. On `/admin/students`, click **Preview** on a student row — or use **Preview by club** (no student needed).
2. A yellow banner appears: **Previewing as [Name] — Exit preview**.
3. Cookies: `bd_preview_as` (student) or `bd_preview_club` (club-only). Both are httpOnly, path `/`, 4-hour max age, `secure` in production.
4. Nav and soft-blocks match that student’s (or club’s) memberships only. Visiting another focus club redirects to their club or `/home`.
5. Your admin login is unchanged. Click **Exit preview** (banner) to clear cookies and return here.

Inactive students cannot be previewed; a stale cookie is cleared automatically.

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
- Finances nav/tab hidden for **Member** role
