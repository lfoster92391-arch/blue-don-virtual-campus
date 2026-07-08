# 13 — Integrations

**Version:** 1.0 (approved batch)  
**Status:** Complete — documentation only  
**Depends on:** `06_RBAC_PERMISSIONS.md`, `09_EVENT_ENGINE.md`, `03_DEVELOPMENT_RULES.md`  
**Current implementation:** Supabase Auth, Google OAuth signup, Asset Pilot cross-link (`docs/ASSETPILOT_INTEGRATION.md`), Google Calendar stub in events UI

---

## Purpose

Architecture for **Google Classroom**, **Google Calendar**, **Google Workspace**, and **FACTS SIS** integrations — sync jobs, identity, conflict resolution, and admin monitoring. No implementation in this blueprint.

---

## Navigation Placement

| Surface | Route | Nav |
|---------|-------|-----|
| **Integrations admin** | `/admin/integrations` | Administration |
| **Connection status** | `/admin/integrations/health` | Admin dashboard widget |
| **User linked accounts** | `/settings/connections` | Settings (utility) |
| **FACTS sync log** | `/admin/integrations/facts` | Administration |

Students/parents see only **Settings → Connected accounts** (read-only status). No integration management in primary nav.

---

## Integration Topology

```
┌─────────────────────────────────────────────────────────────┐
│                  Blue Don Virtual Campus                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Auth (Supa) │  │ Prisma DB    │  │ Job Queue        │  │
│  └──────┬──────┘  └──────▲───────┘  └────────▲─────────┘  │
│         │                │                     │             │
│  ┌──────▼────────────────┴─────────────────────┴─────────┐  │
│  │           Integration Service Layer                    │  │
│  │  google-workspace │ google-classroom │ google-calendar │  │
│  │  facts-sis        │ asset-pilot      │                 │  │
│  └──────┬─────────────────┬─────────────────┬────────────┘  │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
   Google Workspace   Google Classroom   FACTS API
   (Directory/SSO)    (Coursework)       (SIS)
```

**Rules (I1–I4):** External sync via queued jobs; store external IDs on link tables; FACTS/Google read-only first; health at `/api/health` extended with integration probes.

---

## Shared Integration Models

```prisma
model ExternalAccount {
  id            String   @id @default(cuid())
  userId        String   @map("user_id") @db.Uuid
  provider      IntegrationProvider
  externalId    String   @map("external_id")
  accessToken   String?  @map("access_token") // encrypted
  refreshToken  String?  @map("refresh_token")
  tokenExpires  DateTime? @map("token_expires")
  scopes        String[] @default([])
  status        ConnectionStatus @default(ACTIVE)
  lastSyncAt    DateTime? @map("last_sync_at")
  @@unique([provider, externalId])
  @@unique([userId, provider])
  @@map("external_accounts")
}

model SyncJob {
  id          String   @id @default(cuid())
  provider    IntegrationProvider
  jobType     String   @map("job_type")
  status      JobStatus
  payload     Json?
  result      Json?
  startedAt   DateTime? @map("started_at")
  completedAt DateTime? @map("completed_at")
  error       String?
  @@index([provider, status])
  @@map("sync_jobs")
}

model ExternalEntityLink {
  id          String   @id @default(cuid())
  provider    IntegrationProvider
  entityType  String   @map("entity_type") // user, class, event, assignment
  localId     String   @map("local_id")
  externalId  String   @map("external_id")
  lastSynced  DateTime @map("last_synced")
  @@unique([provider, entityType, localId])
  @@map("external_entity_links")
}
```

---

## Google Workspace

### Use cases

| Feature | Priority | Direction |
|---------|----------|-----------|
| SSO (Google) | P0 — exists for signup | Inbound auth |
| Directory sync | P1 | Inbound — users, groups |
| Group → org mapping | P2 | `google_group_id` on `Organization` |
| Email display | P0 | Profile enrichment |

### Flow

1. Admin connects Workspace domain in `/admin/integrations/google`
2. Service account with domain-wide delegation (school IT)
3. Nightly `SyncJob`: `workspace-directory-sync`
4. Match users by email → create/update `User`, map role from group membership rules
5. New users → `PENDING` until admin approval (configurable)

### Role mapping (config)

| Google Group | Campus role |
|--------------|-------------|
| `staff@madonna.edu` | `teacher` |
| `coaches@madonna.edu` | `coach` |
| `students@madonna.edu` | `student` |
| `parents@madonna.edu` | `parent` |

Stored in `IntegrationConfig` json — not hardcoded.

---

## Google Classroom

### Use cases

| Feature | Priority | Direction |
|---------|----------|-----------|
| Course roster import | P1 | Inbound |
| Assignment sync | P1 | Inbound → `Assignment` |
| Coursework link | P2 | Display link only |
| Grade passback | P3 | Outbound (future, approval required) |

### Flow

1. Teacher connects Classroom or admin bulk-links courses
2. `Organization` type `CLASS` gets `externalEntityLink` to Classroom course
3. Job `classroom-roster-sync`: students → `OrganizationMembership` MEMBER
4. Job `classroom-assignment-sync`: creates/updates `Assignment` with `externalId`
5. Dashboard `assignments_due` widget shows Classroom-sourced items with badge

### Data mapping

| Classroom | Blue Don |
|-----------|----------|
| Course | `Organization` CLASS |
| Student | `User` + membership |
| CourseWork | `Assignment` |
| Due date | `Assignment.dueDate` |

**Conflict:** Classroom is source of truth for assignments; local edits create `syncConflict` flag for teacher resolution.

---

## Google Calendar

### Use cases

| Feature | Priority | Direction |
|---------|----------|-----------|
| Publish events to school calendar | P1 | Outbound |
| User calendar subscribe | P2 | Outbound (ICS) |
| Two-way personal sync | P3 | Bidirectional |

### Flow

1. Event published with `EventPublication` surface `GOOGLE_CALENDAR`
2. Job `google-calendar-push` creates/updates event via API
3. Store `googleCalendarEventId` on `Event`
4. Updates to `Event` re-queue push; deletes archive + remove from Google
5. **Stub today:** UI message in `events/[id]` — replace with connection status

### Calendar targets

| Calendar | Owner |
|----------|-------|
| School master | Admin service account |
| Org calendar | Team/club subcalendar |
| User personal | Opt-in from settings |

---

## FACTS SIS

### Use cases

| Feature | Priority | Direction |
|---------|----------|-----------|
| Student demographics | P0 | Inbound |
| Grade level / cohort | P0 | `StudentProfile` |
| Parent–student links | P0 | `ParentGuardian` |
| Class enrollments | P1 | `Organization` CLASS memberships |
| Grades (GPA) | P2 | `SisGrade` — Future Center, Journey AI opt-in |
| Attendance | P2 | Dashboard flags (counselor) |

### Flow

1. Admin configures FACTS API credentials (encrypted env)
2. Nightly `facts-full-sync` + hourly `facts-delta-sync`
3. Upsert `User` by `factsPersonId`
4. Sync `StudentProfile.gradeLevel`, `cohortYear`
5. Sync `ParentGuardian` with `verified=true`
6. Class enrollments → class org memberships
7. Conflict queue for email mismatches

### FACTS-specific models

```prisma
model SisEnrollment {
  id           String   @id @default(cuid())
  userId       String   @map("user_id") @db.Uuid
  factsPersonId String  @unique @map("facts_person_id")
  gradeLevel   Int?     @map("grade_level")
  schoolYear   String   @map("school_year")
  status       String
  lastSynced   DateTime @map("last_synced")
  @@map("sis_enrollments")
}

model SisGrade {
  id          String   @id @default(cuid())
  userId      String   @map("user_id") @db.Uuid
  courseName  String   @map("course_name")
  grade       String?
  term        String
  lastSynced  DateTime @map("last_synced")
  @@map("sis_grades")
}
```

**FERPA:** Grades never exposed to sponsors; parents only linked children; AI uses grades only if `aiRecommendationsEnabled` + school policy.

---

## Asset Pilot EDU

Cross-platform assets per `docs/ASSETPILOT_INTEGRATION.md`:

- Shared asset IDs for labs/media
- Role mapping alignment with Workspace sync
- Not a transactional SIS — reference links only

---

## Admin Monitoring

| Metric | Surface |
|--------|---------|
| Last successful sync per provider | `/admin/integrations/health` |
| Failed jobs (24h) | Admin dashboard `system_health` widget |
| Records created/updated | Job `result` json |
| Manual retry | Admin button → enqueue `SyncJob` |

Alerts: email admin on 3 consecutive failures.

---

## Permissions

| Action | Permission |
|--------|------------|
| Configure integrations | `integrations:manage` |
| View health | `integrations:view_health` |
| Connect personal Google | self-service (Calendar opt-in) |
| View sync logs | `admin:access` |
| Trigger manual sync | `integrations:manage` |

---

## Mobile vs Desktop

| Feature | Mobile | Desktop |
|---------|--------|---------|
| Settings connections | Simple status cards | Full OAuth connect flow |
| Admin health | Summary + alerts | Dashboard with charts |
| Conflict resolution | Single conflict view | Bulk resolution table |

---

## Scalability Notes

| Concern | Approach |
|---------|----------|
| Rate limits | Token bucket per provider; job spacing |
| Bulk import | Batch 500 records; checkpoint in `SyncJob.payload` |
| Token refresh | Proactive refresh 5 min before expiry |
| Idempotency | `externalEntityLink` unique constraints |
| Secrets | Vault/env encryption; never log tokens |
| Multi-tenant future | `schoolId` on all sync configs |

---

## Mapping to Phase 0–15 Code

| As-built | Integration path |
|----------|------------------|
| Supabase Auth + Google OAuth | Extend to Workspace SSO |
| `syncAuthProfileAction` | Enrich from directory sync |
| `Assignment` model | Classroom sync target |
| `Event` + calendar UI | Google Calendar push |
| Google Calendar stub | Replace with real status component |
| No FACTS models | Phase 21 |
| `assignRoleAction` | May receive role from group rules |
| Parent portal | FACTS verifies `ParentGuardian` |

**Phase alignment:** Phase 21 — FACTS + Workspace; Phase 23 — Classroom + Calendar.

---

## Related Documents

- [09_EVENT_ENGINE.md](./09_EVENT_ENGINE.md) — Calendar publication
- [06_RBAC_PERMISSIONS.md](./06_RBAC_PERMISSIONS.md) — role mapping
- [docs/ASSETPILOT_INTEGRATION.md](../ASSETPILOT_INTEGRATION.md)
- [05_ROADMAP.md](./05_ROADMAP.md) — Phases 21, 23
