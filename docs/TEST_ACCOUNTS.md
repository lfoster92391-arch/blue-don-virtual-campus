# Test accounts (local / demo)

**Project root:** `D:\Projects\blue-don-virtual-campus` — run scripts and `npm run dev` from that folder, not from any copy under `C:\Users\...`.

Use these accounts to explore Blue Don Virtual Campus without a real `@weirtonmadonna.org` Google Workspace address.

**Important:** The school-email bypass is disabled in production unless you explicitly set `ALLOW_AUTH_TEST_BYPASS=true`. Do not enable that on the live campus.

## Demo student

| Field | Value |
| --- | --- |
| Email | `demo.student@bluedon.test` |
| Password | `DemoStudent123!` |
| Name | Alex Martinez |
| Role | Student (ACTIVE, profile complete) |

### Environment

Add to **`.env.local`** (local overrides win over `.env`; copy from `.env.example` if needed).
Restart `npm run dev` after changing these — Next.js only reads env vars at startup:

```env
NODE_ENV=development
AUTH_TEST_BYPASS_EMAILS=demo.student@bluedon.test,demo.teacher@bluedon.test
NEXT_PUBLIC_AUTH_TEST_BYPASS_EMAILS=demo.student@bluedon.test,demo.teacher@bluedon.test
```

`NEXT_PUBLIC_AUTH_TEST_BYPASS_EMAILS` mirrors the server list so the register form can validate bypass emails in the browser during local development.

Optional: set `ALLOW_AUTH_TEST_BYPASS=true` on a non-production demo host if `NODE_ENV` is not `development`.

### Why login can fail with "Invalid login credentials"

The `/login` page calls Supabase `signInWithPassword` directly. That specific error
means **no Supabase auth user** exists for the email/password — it is an auth error,
not a database/profile error. Creating the Supabase auth user requires
`SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → `service_role` key). A Prisma
`users` row alone is not enough to sign in.

### Sign up or sign in

**Option A — One command (recommended)**

This creates or resets the demo Supabase auth user with `email_confirm: true` and the
known password, and reconciles the campus profile so its id matches the auth user:

```bash
node scripts/create-demo-student.mjs
```

Requirements: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (and optionally
`DATABASE_URL` for the profile reconcile). The script is idempotent — safe to re-run.
It reads env from `.env` and `.env.local`. After it prints "Done", run
`npm run db:seed` once (blank-slate student by default), then sign in at [http://localhost:3000/login](http://localhost:3000/login).

**Option B — Seed only**

1. Configure Supabase and `DATABASE_URL` in `.env` (the `service_role` key is required
   for the demo auth user).
2. Run migrations and seed:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

   When `SUPABASE_SERVICE_ROLE_KEY` is set, seed now always creates **or resets** the
   Supabase auth user (password + email confirmation) and reconciles the campus
   profile id. If the service role key is missing, seed logs a clear warning and skips
   the demo auth user.

3. Open [http://localhost:3000/login](http://localhost:3000/login) and sign in with the credentials above.

**Option C — Self-register**

1. Ensure bypass env vars are set and `npm run dev` is running.
2. Open [http://localhost:3000/register](http://localhost:3000/register) (student is the default role).
3. Register with `demo.student@bluedon.test` and any password (minimum 8 characters), or use `DemoStudent123!` to match seed.
4. Complete onboarding (first/last name) if prompted.
5. Run `npm run db:seed` to attach organization and academy memberships if they are missing.

### What you will see

After sign-in, Alex Martinez lands on the student dashboard with a **blank slate** by default — no pre-loaded club or academy memberships so you can walk through the real join flow. Shared campus catalog (orgs, forms, academies) is still seeded.

Optional: set `SEED_DEMO_STUDENT_MEMBERSHIPS=1` before `npm run db:seed` to pre-load IT Club, Student Council, NHS, and IT Academy instead.

## Testing club join (student + teacher)

Use IT Club as the demo path. The org page links to the IT Academy (`academy-it`, slug `it`).

### Student (`demo.student@bluedon.test`)

1. Sign in at [http://localhost:3000/login](http://localhost:3000/login).
2. Open **Find Your Place** — [http://localhost:3000/find-your-place](http://localhost:3000/find-your-place) — or go directly to IT Club — [http://localhost:3000/organizations/it-club](http://localhost:3000/organizations/it-club).
3. Scroll to **Join IT Club** and click **Request to join**. Sign the Club Membership Commitment.
4. Track status in these places:
   - **Home** — [http://localhost:3000/home](http://localhost:3000/home) → **Digital Forms Center** widget → **Club requests** (Waiting for parent / Advisor review / Approved / Declined).
   - **IT Club org page** — status banner with pipeline: Requested → Parent → Advisor → Active.
   - **IT Academy** — [http://localhost:3000/academies/it](http://localhost:3000/academies/it) — same banner; join button shows **Pending approval** or **Member**.
   - **Academies list** — [http://localhost:3000/academies](http://localhost:3000/academies) — pending count and per-card status.
   - **Find Your Place** cards show **Pending** / **Member** badges after you apply.

If the student has a linked parent, the parent must approve in **Forms Center** before the advisor can activate membership.

### Teacher / advisor (`demo.teacher@bluedon.test`)

Demo Teacher is IT Club **LEAD** (`org-it-club`). Teachers do **not** use the admin Governance Center; they review from the org or academy page.

1. Sign in as demo teacher.
2. After a student submits a join request, check:
   - **Home** — [http://localhost:3000/home](http://localhost:3000/home) → **Club join requests** alert (when pending requests exist).
   - **IT Club org page** — [http://localhost:3000/organizations/it-club](http://localhost:3000/organizations/it-club) → **Pending join requests** section with student name, commitment signature, parent approval status, **Approve** / **Reject**.
   - **IT Academy** — [http://localhost:3000/academies/it](http://localhost:3000/academies/it) → same pending queue for advisors.
3. Approve only after parent approval (if required). Rejected students see **Declined** and can **Request again**.

**Admins / advisors** with `academy:manage` can also use the global queue: [http://localhost:3000/admin/academies](http://localhost:3000/admin/academies) (Governance Center → Academy memberships).

### What you will see (rich seed only)

When `SEED_DEMO_STUDENT_MEMBERSHIPS=1`, Alex Martinez also has:

- **Organizations:** IT Club, High School Student Council, National Honor Society (NHS)
- **Academy:** IT Academy (`academy-it`) — active membership
- **School:** Madonna High School
- Full student navigation: home, academies, forms, portfolio, organizations, and related campus modules seeded by `npm run db:seed`

## Demo teacher

| Field | Value |
| --- | --- |
| Email | `demo.teacher@bluedon.test` |
| Password | `BlueDons123!` |
| Name | Demo Teacher |
| Role | Teacher (ACTIVE, profile complete) |

Uses the same bypass env vars as the demo student (see **Environment** above). The Supabase auth user must exist before sign-in — create it in the Supabase dashboard or let `npm run db:seed` reconcile it when `SUPABASE_SERVICE_ROLE_KEY` is set.

### Sign in

1. Ensure bypass env vars are in **`.env.local`** and restart `npm run dev`.
2. Run `npm run db:seed` (with `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) to attach the campus profile and IT Club advisor membership.
3. Open [http://localhost:3000/login](http://localhost:3000/login) and sign in with the credentials above.

**Self-register:** Open [http://localhost:3000/register](http://localhost:3000/register), choose **Teacher**, and register with `demo.teacher@bluedon.test`. Then run `npm run db:seed` to set the IT Club advisor role.

### What you will see

After sign-in, Demo Teacher lands on the **Teacher command** dashboard with:

- **School:** Madonna High School
- **IT Club advisor:** `LEAD` membership on IT Club (`org-it-club`) — pending join requests on the org/academy page, club wishlists, equipment inventory, and org leadership tools
- **Class wishlists:** Profile menu → **Class wishlists** (`/teacher/wishlists`) lists IT Club as a manageable target
- **Club join requests:** Home dashboard alert when students are waiting; review on `/organizations/it-club` or `/academies/it`
- **All clubs directory:** Primary nav → **Clubs & Organizations** (`/find-your-place`) — browse every campus club with search and category filters; open any club preview (advisor, meetings, skills, projects) to co-browse with students. Join actions are hidden for faculty.
- **Teacher navigation:** events, forms, labs, simulators, knowledge vault, journey/student views, and other faculty campus modules (no Administration or Success Analytics — those require advisor/admin/counselor roles)

## Leadership admin accounts (production)

Real `@weirtonmadonna.org` accounts for principal and backup IT leadership. Both use a **single `admin` role** plus optional `parent_student_links` and org memberships for teacher/advisor tools.

| Account | Email | Purpose |
| --- | --- | --- |
| Primary principal | `jheckathorn@weirtonmadonna.org` | Principal Command Center, governance, teacher tools, optional parent view |
| Backup admin | `lisamorris@weirtonmadonna.org` | Same leadership/teacher access when the principal is unavailable |

### Account model (one login, multiple capabilities)

Blue Don stores **one role per user** (`User.role`). Combined principal + teacher + parent is modeled as:

| Capability | How it works |
| --- | --- |
| **Principal** | `role = admin` → Governance Center (`/admin`), Principal Command Center (`/admin/leadership` via `canViewLeadershipAnalytics()`) |
| **Teacher / advisor** | Same `admin` role plus optional `organization_memberships` with `org_role = LEAD` (e.g. IT Club). Admins also get class wishlists, club directory, and club join-request alerts. |
| **Parent** | Not a separate role. Add rows in `parent_student_links` linking the admin user to a student. Users with linked students can open `/parent` and sign parent agreements even when `role ≠ parent`. |

### Provision both accounts (recommended)

Requires `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DATABASE_URL` in `.env` / `.env.local`. Passwords are **never** stored in the repo.

```bash
# Set passwords before running (or omit to generate one-time passwords printed to stdout)
export PRINCIPAL_PASSWORD='your-secure-password'
export BACKUP_ADMIN_PASSWORD='your-secure-password'

# Optional: link principal to a child for parent portal testing
export PRINCIPAL_STUDENT_EMAIL='student@weirtonmadonna.org'

# Optional: attach club advisor LEAD for teacher workflows
export LEADERSHIP_ORG_SLUG='it-club'

node scripts/create-principal.mjs
```

The script is idempotent — safe to re-run. It creates or resets both Supabase auth users with `email_confirm: true`, upserts Prisma `users` rows as `ADMIN` / `ACTIVE`, and optionally links students or org memberships.

### Provision a single account

```bash
PRINCIPAL_PASSWORD='your-secure-password' \
  node scripts/create-principal.mjs --email=jheckathorn@weirtonmadonna.org

BACKUP_ADMIN_PASSWORD='your-secure-password' \
  node scripts/create-principal.mjs --email=lisamorris@weirtonmadonna.org
```

### Reset Lisa or principal password (PowerShell)

"Invalid login credentials" on `/login` means Supabase Auth rejected the email/password
pair (wrong password, user missing, or rarely an unconfirmed email that still surfaces
that message). It is **not** a mobile cookie / LAN redirect problem.

From `D:\Projects\blue-don-virtual-campus` (requires `NEXT_PUBLIC_SUPABASE_URL` +
`SUPABASE_SERVICE_ROLE_KEY` in `.env` / `.env.local`):

```powershell
cd D:\Projects\blue-don-virtual-campus

# Lisa (backup admin) — sets a known password + email_confirm=true
node scripts/create-principal.mjs --email=lisamorris@weirtonmadonna.org --password="YourSecurePass123!"

# Principal
node scripts/create-principal.mjs --email=jheckathorn@weirtonmadonna.org --password="YourSecurePass123!"

# Or via env vars (same effect)
$env:BACKUP_ADMIN_PASSWORD = "YourSecurePass123!"
node scripts/create-principal.mjs --email=lisamorris@weirtonmadonna.org

$env:PRINCIPAL_PASSWORD = "YourSecurePass123!"
node scripts/create-principal.mjs --email=jheckathorn@weirtonmadonna.org
```

Sign in at `/login` with that email and the password you just set. Re-run anytime to
reset. Alternative: Supabase Dashboard → Authentication → Users → select user →
**Send password recovery** or set password / confirm email.

### Phone / LAN access (dev)

1. Bind the dev server to all interfaces: `npm run dev:lan` (or `npx next dev --hostname 0.0.0.0`).
2. On the phone (same Wi‑Fi), open `http://<your-PC-LAN-IP>:3000/login` (find the IP with `ipconfig`).
3. For Google OAuth only: add `http://<LAN-IP>:3000/**` and `http://localhost:3000/**` under Supabase → Authentication → URL Configuration → Redirect URLs. Email/password does not need redirect allow-list entries.
4. Use a school email (`@weirtonmadonna.org`) for staff/admin, or demo accounts from this doc. Domain gating runs **after** a successful password check — it cannot produce "Invalid login credentials".

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PRINCIPAL_EMAIL` | `jheckathorn@weirtonmadonna.org` | Primary principal email |
| `BACKUP_ADMIN_EMAIL` | `lisamorris@weirtonmadonna.org` | Backup leadership email |
| `PRINCIPAL_PASSWORD` | *(generated if omitted)* | Supabase password for principal |
| `BACKUP_ADMIN_PASSWORD` | *(generated if omitted)* | Supabase password for backup admin |
| `PRINCIPAL_FIRST_NAME` / `PRINCIPAL_LAST_NAME` | James / Heckathorn | Display name for principal |
| `BACKUP_ADMIN_FIRST_NAME` / `BACKUP_ADMIN_LAST_NAME` | Lisa / Morris | Display name for backup admin |
| `PRINCIPAL_STUDENT_EMAIL` | — | Link principal to a student (parent portal) |
| `BACKUP_ADMIN_STUDENT_EMAIL` | — | Optional parent link for backup admin |
| `LEADERSHIP_ORG_SLUG` | — | Org slug for advisor `LEAD` membership (e.g. `it-club`) |
| `PROVISION_EMAIL` | — | Provision only this email (alternative to `--email=`) |
| `--password=` (CLI) | — | Password for a single `--email=` run (overrides env for that account) |

### What each account can access after sign-in

- **Principal Command Center** — [http://localhost:3000/admin/leadership](http://localhost:3000/admin/leadership)
- **Governance Center** — [http://localhost:3000/admin](http://localhost:3000/admin)
- **Teacher tools** — class wishlists (`/teacher/wishlists`), club directory (`/find-your-place`), club join requests (when org `LEAD` is set)
- **Parent portal** — [http://localhost:3000/parent](http://localhost:3000/parent) (only when `parent_student_links` exist for that user)

### Gating notes (code)

Staff with `parent_student_links` can use the parent portal without `role = parent`. Leadership analytics require `admin` (or advisor/counselor/staff). Teacher club tools for admins use org membership plus expanded faculty club lookup roles.

## Adding more bypass emails

Comma-separate additional addresses in both env vars (in `.env.local`, then restart dev):

```env
AUTH_TEST_BYPASS_EMAILS=demo.student@bluedon.test,demo.teacher@bluedon.test,lisa.student.test@gmail.com
NEXT_PUBLIC_AUTH_TEST_BYPASS_EMAILS=demo.student@bluedon.test,demo.teacher@bluedon.test,lisa.student.test@gmail.com
```

Restart the dev server after changing env vars.
