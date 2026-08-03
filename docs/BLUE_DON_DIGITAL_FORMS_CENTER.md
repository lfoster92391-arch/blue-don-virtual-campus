# Blue Don Digital Forms Center

**Madonna High School · Blue Don Virtual Campus**  
**Version:** 1.0 (foundational spec)  
**Status:** Documentation + config registry — implementation phased  
**Extends:** Phase 5 Forms & Governance, [`PHASE_5.md`](./PHASE_5.md), [`enterprise-blueprint/20_GOVERNANCE_COMPLIANCE.md`](./enterprise-blueprint/20_GOVERNANCE_COMPLIANCE.md)

---

## Purpose

The **Digital Forms Center** is Madonna High School’s official SIS-style agreement and forms hub inside Blue Don. It is **not** a social network feature. Every workflow that collects information or enables participation must respect:

- **Madonna handbook policies** — administration retains final authority.
- **Student privacy** — no personal information released without appropriate consent.
- **Technology use** — acceptable use extends diocesan and school AUP.
- **Parent acknowledgment** — where minors are involved, parents approve before activation.

Blue Don extends handbook compliance into digital workflows with typed signatures, audit trails, and role-appropriate portals.

**Config registry:** `src/config/digital-agreements.ts`  
**Existing implementation:** `Form` / `FormSubmission` models, `/forms`, `/parent`, `/admin/compliance`

---

## Philosophy

| Principle | Implementation |
|-----------|----------------|
| SIS, not social | Agreements gate program access; feeds and profiles respect consent flags |
| Admin final authority | Advisors approve memberships; admins publish forms and export audits |
| Consent before release | Media release and profile permissions are granular, parent-controlled |
| Permanent audit | Submissions are archived, never hard-deleted (Phase 5 policy) |
| Annual refresh | School-year scoped agreements expire and prompt re-sign |

Blue Don is the **digital extension of Madonna governance**, not a replacement for handbook, discipline, or diocesan policy.

---

## The 13 Required Digital Agreements

Each agreement is registered in `DIGITAL_AGREEMENTS` with `id`, `title`, `frequency`, `signerRoles`, and `approvalChain`.

### 1. Parent & Student Portal Agreement

| Field | Value |
|-------|-------|
| **Purpose** | Annual acknowledgment of portal use, handbook policies, and family participation |
| **Who signs** | Student + parent/guardian (per linked child) |
| **Frequency** | Annual (school year) |
| **Approval chain** | Student sign → parent approve → recorded |
| **Form mapping** | `form-parent-agreement` (PUBLISHED) + `form-student-agreement` (PUBLISHED) |
| **Status** | Partial — both forms exist; composite “portal gate” and parent-on-behalf-of-student not wired |

### 2. Acceptable Use Agreement

| Field | Value |
|-------|-------|
| **Purpose** | Technology, accounts, devices, and lab resources — extends handbook AUP |
| **Who signs** | Student + parent |
| **Frequency** | Annual |
| **Approval chain** | Student sign → parent approve → recorded |
| **Form mapping** | `form-technology-agreement` (`TECHNOLOGY_AGREEMENT`, DRAFT) |
| **Status** | Partial — template seeded, not published |

### 3. Parent Media Release

| Field | Value |
|-------|-------|
| **Purpose** | Granular opt-in for use of student name, image, likeness, and work |
| **Who signs** | Parent only |
| **Frequency** | Annual |
| **Approval chain** | Parent sign → recorded |
| **Form mapping** | `form-media-release` (`MEDIA_RELEASE`, PUBLISHED) |
| **Status** | Partial — binary release today; granular categories planned |

**Granular categories** (parent opts in per channel):

| Category ID | Label |
|-------------|-------|
| `website` | School website |
| `blue_don` | Blue Don Virtual Campus |
| `livestreams` | Livestreams |
| `facebook` | Facebook |
| `instagram` | Instagram |
| `youtube` | YouTube |
| `local_news` | Local news |
| `yearbook` | Yearbook |
| `printed` | Printed materials |
| `promotional` | Promotional / marketing |

Stored in `FormSubmission.responseData` as `{ mediaRelease: { website: true, instagram: false, ... } }` when UI ships. Downstream features (yearbook module, broadcasts, public profiles) **must check** these flags before displaying student media.

### 4. Student Profile Permission

| Field | Value |
|-------|-------|
| **Purpose** | Parent controls which profile fields are visible on Blue Don |
| **Who signs** | Parent only |
| **Frequency** | Annual |
| **Approval chain** | Parent sign → recorded |
| **Form mapping** | New form (planned) — `FormType.CUSTOM` |
| **Status** | Planned |

**Granular fields** (parent enables per field):

`photo`, `name`, `grade`, `class_of`, `awards`, `clubs`, `athletics`, `service`, `honor_roll`

Profile rendering and directory search respect these flags. Default: **private/minimal** until parent completes the form.

### 5. Club Participation Agreement

| Field | Value |
|-------|-------|
| **Purpose** | Student requests club join; parent approves; advisor activates membership |
| **Who signs** | Student (commitment) + parent (approval) |
| **Frequency** | Per club / academy |
| **Approval chain** | Student sign → **parent approve** → advisor approve → ACTIVE |
| **Form mapping** | `form-club-membership-commitment` (`PARTICIPATION_COMMITMENT`, PUBLISHED) |
| **Status** | Partial — see [Club join workflow](#club-join-workflow) below |

### 6. Athletics Participation Agreement

| Field | Value |
|-------|-------|
| **Purpose** | Team comms, schedule, travel, fundraising, and athletics media |
| **Who signs** | Student + parent |
| **Frequency** | Per team / season |
| **Approval chain** | Student sign → parent approve → coach/advisor approve → recorded |
| **Form mapping** | New form (planned) — may extend `PARTICIPATION_COMMITMENT` |
| **Status** | Planned |

### 7. Service Hours Agreement

| Field | Value |
|-------|-------|
| **Purpose** | Rules for logging, verification, and portfolio use of service hours |
| **Who signs** | Student + parent |
| **Frequency** | Annual |
| **Approval chain** | Student sign → parent approve → recorded |
| **Form mapping** | New form (planned) |
| **Status** | Planned |

### 8. Blue Don Rewards Agreement

| Field | Value |
|-------|-------|
| **Purpose** | XP has no cash value; gamification is educational |
| **Who signs** | Student + parent |
| **Frequency** | Annual |
| **Approval chain** | Student sign → parent approve → recorded |
| **Form mapping** | New form (planned) |
| **Status** | Planned |

### 9. Messaging Consent

| Field | Value |
|-------|-------|
| **Purpose** | Per-category consent for school communications channels |
| **Who signs** | Parent |
| **Frequency** | Annual |
| **Approval chain** | Parent sign → recorded |
| **Form mapping** | New form (planned); integrates with [Blue Don Broadcasts](./BLUE_DON_BROADCASTS.md) |
| **Status** | Planned |

**Message types × channels** (parent selects one channel per row):

| Type | Options |
|------|---------|
| Announcements | email / text / push / none |
| Club | email / text / push / none |
| Teacher | email / text / push / none |
| Events | email / text / push / none |
| Assignments | email / text / push / none |

### 10. AI Assistant Disclosure

| Field | Value |
|-------|-------|
| **Purpose** | Discloses AI features, data handling, and limitations per Constitution |
| **Who signs** | Student + parent |
| **Frequency** | Annual |
| **Approval chain** | Student sign → parent approve → recorded |
| **Form mapping** | New form (planned) |
| **Status** | Planned |

### 11. Student Marketplace Agreement (future)

| Field | Value |
|-------|-------|
| **Purpose** | Consent for student marketplace listings; school moderation |
| **Who signs** | Student + parent + admin review |
| **Frequency** | One-time (per marketplace enablement) |
| **Approval chain** | Student sign → parent approve → admin approve |
| **Form mapping** | Future |
| **Status** | Future — do not implement until marketplace module exists |

### 12. Event Registration

| Field | Value |
|-------|-------|
| **Purpose** | Per-event registration with emergency, medical, transportation, permission |
| **Who signs** | Student initiates; parent signs when required |
| **Frequency** | Per event |
| **Approval chain** | Student/parent sign → recorded; optional advisor approval for high-risk events |
| **Form mapping** | `form-event-registration` (`EVENT_REGISTRATION`, DRAFT) |
| **Status** | Partial — template only; rich fields + QR check-in planned |

**Planned fields:** emergency contact, medical notes, transportation mode, permission checkbox, signature, event QR for check-in.

### 13. Digital Signature System

| Field | Value |
|-------|-------|
| **Purpose** | Cross-cutting audit standard for all agreements above |
| **Who signs** | All signers per agreement |
| **Frequency** | Every signature event |
| **Approval chain** | Auto-recorded with audit metadata |
| **Form mapping** | Not a standalone form — metadata on every `FormSubmission` |
| **Status** | Partial — typed name + checkbox today |

---

## Portal UX Specification

### Parent Dashboard (`/parent` → Digital Forms Center)

**Today (Phase 5):** Summary cards (required / completed / outstanding), list of parent-visible published forms, link to `/forms`.

**Target experience:**

| Section | Content |
|---------|---------|
| **Action required** | Pending parent signatures and child-linked approvals (club requests, event registration) |
| **Per-child tabs** | When `ParentGuardian` linkage exists — filter by student |
| **Agreements** | All 13 agreements with status chips: Complete / Outstanding / Expired / Waiting on student |
| **Club requests** | Child requested club → Approve / Decline with timestamp |
| **Events** | Upcoming events needing registration or signature |
| **Progress** | Read-only student progress summary (post-linkage) |

Parents complete **their** agreements and **approve on behalf of** linked students where policy requires.

### Student Dashboard (`/dashboard` or dedicated Forms widget)

| Section | Content |
|---------|---------|
| **My agreements** | Student-signed forms: complete, outstanding, expired |
| **Waiting on parent** | Club join, event registration, media — status “Pending parent approval” |
| **Advisor queue** | Club membership “Pending advisor approval” after parent approves |
| **Quick actions** | Link to `/forms` for signing |

Students see **status transparency** without accessing parent-only consent details.

### Admin Dashboard (`/admin` governance hub)

| Section | Content |
|---------|---------|
| **Completion rates** | % complete per agreement type, per grade, per academy |
| **Pending counts** | By form type: missing, unsigned, pending approval, expired |
| **Compliance** | Existing `/admin/compliance` table — extend with agreement-type grouping |
| **Form library** | `/admin/forms` — create, publish, archive templates |
| **Approvals** | `/admin/approvals` — advisor/admin queue |
| **Audit export** | CSV/PDF of signatures with full audit fields (future) |

---

## Digital Signature Audit Requirements

Every signature event must eventually capture:

| Field | Source | Phase 5 | Target |
|-------|--------|---------|--------|
| Signer display name | User profile | — | ✓ |
| Typed signature | `FormSubmission.signatureName` | ✓ | ✓ |
| Signer role | `User.role` | — | ✓ |
| Student context | `contextKey` / `responseData.studentId` | Partial (`contextKey` for clubs) | ✓ |
| Parent name (when signing for child) | Parent user + linkage | — | ✓ |
| Date / timestamp | `FormSubmission.submittedAt` | ✓ | ✓ |
| IP address | Request header at submit | — | ✓ |
| School year | Derived from `submittedAt` | — | ✓ |
| Form version | `Form.version` | ✓ | ✓ |
| Agreement registry ID | `digital-agreements` id | Config only | ✓ |

**Policy:** Submissions are **never hard-deleted**. Archiving a form does not remove submission records. Re-signing creates a new submission row or updates with version history (TBD in Phase 17+).

**Current gap:** IP, school year, parent-on-behalf-of-student, and immutable audit log table are not yet persisted.

---

## Club Join Workflow

### What exists today

The **Club Membership Commitment** flow is implemented and cross-referenced with academies:

```
Student clicks "Request to join" on academy page
    → Sheet shows club-specific commitment text (buildClubMembershipCommitmentContent)
    → Student types signature + agrees
    → submitClubMembershipCommitment() → FormSubmission (contextKey: academy:{id})
    → requestAcademyMembership() → AcademyMembership status PENDING
    → Advisor reviews → ACTIVE or REJECTED
```

**Key files:**

| File | Role |
|------|------|
| `src/config/club-commitment.ts` | Form ID, context key, commitment text builder |
| `src/config/digital-agreements.ts` | Registry entry `club-participation` |
| `src/components/academies/academy-join-button.tsx` | Student UI |
| `src/features/academies/actions.ts` | `joinAcademyWithCommitmentAction` |
| `src/services/form-service.ts` | `submitClubMembershipCommitment`, `hasClubMembershipCommitment` |
| `src/services/academy-service.ts` | Membership review; commitment signature on roster |

Club commitment forms are **excluded** from the generic `/forms` list (`CLUB_MEMBERSHIP_COMMITMENT_FORM_ID`) because they are per-academy via `contextKey`.

### How Club Participation Agreement (#5) extends this

| Step | Today | Target (Digital Forms Center) |
|------|-------|-------------------------------|
| 1. Student requests join | ✓ | ✓ |
| 2. Student signs commitment | ✓ | ✓ |
| 3. Parent notified | ✗ | Push/email to linked parent |
| 4. Parent approve / decline | ✗ | Parent portal action; decline cancels request |
| 5. Advisor notified | Implicit (pending queue) | Explicit notification after parent approval |
| 6. Advisor approve → ACTIVE | ✓ | ✓ — only after parent approval |
| 7. Audit trail | Partial | Full digital signature metadata |

**Implementation note:** Parent step requires `ParentGuardian` (or equivalent) student linkage — planned in auth/RBAC Phase 17+, not duplicated here. Domain gating (`weirtonmadonna.org` / Google Workspace sync) is a separate auth workstream; forms assume authenticated parent accounts linked to students.

---

## Media Release Granular Permissions Model

```
Parent completes Media Release form
    → responseData.mediaRelease: Record<MediaReleaseCategoryId, boolean>
    → FormSubmission tied to student via contextKey or studentId in responseData

Feature checks before display:
    → Yearbook export: yearbook === true
    → Blue Don public profile photo: blue_don && studentProfile.photo
    → Instagram cross-post: instagram === true
    → Default: deny if no submission or category false
```

Admin retains override for **school-owned** event photography (e.g., crowd shots) per handbook; student-identifiable use always requires parent opt-in.

---

## Future Digital Forms Library

Beyond the 13 required agreements, the Forms Center becomes Madonna’s **single library** for:

| Category | Examples | `FormType` |
|----------|----------|------------|
| Handbook | Handbook acknowledgment, dress code | `CUSTOM`, `RISK_ACKNOWLEDGEMENT` |
| Field trips | Off-campus permission, travel | `TRAVEL_APPROVAL`, `EVENT_REGISTRATION` |
| Clubs / athletics | Registration, officer forms | `PARTICIPATION_COMMITMENT` |
| Service | Hour verification, supervisor sign-off | `CUSTOM`, `VOLUNTEER_FORM` |
| Graduation | Cap & gown, senior forms | `CUSTOM` |
| Operations | Purchase request, equipment checkout | `PURCHASE_REQUEST`, `EQUIPMENT_CHECKOUT` |
| Sponsors | Sponsor packet | `SPONSOR_PACKET` |

All library forms share: workflow (Draft → Publish → Archive), role visibility, signature audit, and compliance reporting.

**Seeded templates (Phase 5):** 14 `Form` rows in `prisma/seed.ts` including club commitment; most remain DRAFT until content is approved.

---

## Data Model Mapping

### What maps to existing `Form` / `FormSubmission`

| Capability | Supported today |
|------------|-----------------|
| Form templates with type, version, status | ✓ `Form` |
| Per-user submissions | ✓ `FormSubmission` |
| Typed signature | ✓ `signatureName`, `signed` |
| Per-context submissions (per club) | ✓ `contextKey` unique constraint |
| Structured answers | ✓ `responseData` JSON |
| Advisor approval | ✓ `approved`, `approvedById`, `approvedAt` |
| Annual expiry | ✓ `expiresAt` (auto +1 year on submit) |
| Role-filtered form lists | ✓ `PARENT_FORM_TYPES`, `STUDENT_EXCLUDED_FORM_TYPES` |
| Compliance dashboard | ✓ `getComplianceIssues()` |

### What needs new tables or columns (recommended phases)

| Need | Approach |
|------|----------|
| Agreement registry ID on form | `Form.agreementId` string nullable, or config map only (current) |
| Parent-on-behalf-of-student | `FormSubmission.subjectUserId` (student) vs `userId` (signer) |
| Parent approval queue | `FormSubmission.parentApproved`, `parentApprovedAt`, `parentApprovedById` |
| Full audit | `FormSubmissionAudit` or JSON `auditMeta: { ip, userAgent, schoolYear }` |
| Parent–student linkage | `ParentGuardian` model (see Product Blueprint gap) |
| Media / profile permissions cache | Denormalized `StudentConsentProfile` for fast reads |
| Event registration instances | `contextKey: event:{eventId}` pattern (same as clubs) |

**Config-only first pass:** `src/config/digital-agreements.ts` avoids a migration until agreement IDs stabilize.

---

## Auth & Parent Approval Integration

Forms fit into the broader Madonna auth picture:

| Workstream | Relationship to Forms Center |
|------------|------------------------------|
| **Google Workspace / `weirtonmadonna.org` domain** | Parent and student accounts provisioned via directory sync; forms assign by role + linkage |
| **ParentGuardian linkage** | Required before parent can approve club joins or sign media release *for* a child |
| **RBAC** | `parent:portal`, `forms:sign`, `forms:submit`, `forms:approve` already in `src/config/roles.ts` |
| **Domain gating** | In progress elsewhere — do not duplicate; forms consume authenticated session only |

Until linkage ships, parents sign **account-level** agreements (e.g., Parent Agreement). Student-specific approvals show a placeholder in `/parent` (noted on the parent portal page).

---

## Gap Analysis vs Current Forms System

| Area | Current state | Gap |
|------|---------------|-----|
| Agreement registry | `digital-agreements.ts` | Wire UI labels and compliance grouping |
| 13 agreements | 3 published + 1 club partial | 9 agreements need forms + UX |
| Granular media release | Binary checkbox form | Category toggles in UI + enforcement |
| Student profile permissions | None | New form + profile gating |
| Club parent approval | Student → advisor only | Parent approve/decline step |
| Athletics agreement | None | Per-team form + coach workflow |
| Messaging consent | None | Form + Broadcasts integration |
| AI disclosure | None | Form before AI features unlock |
| Event registration | DRAFT template | Rich fields, QR, per-event contextKey |
| Digital signature audit | Name + timestamp | IP, school year, parent-on-behalf |
| Parent multi-child | Single-user parent portal | Per-child filtering |
| Admin completion rates | Compliance issues list | Aggregates by agreement type / grade |

---

## Recommended Implementation Phases

### Phase A — Registry & compliance alignment (current)

- [x] `docs/BLUE_DON_DIGITAL_FORMS_CENTER.md` (this document)
- [x] `src/config/digital-agreements.ts`
- [ ] Group `/admin/compliance` by `DigitalAgreementId`
- [ ] Publish Acceptable Use + Technology Agreement when handbook text ready

### Phase B — Parent–student linkage + parent approval

- [ ] `ParentGuardian` model and parent portal per-child views
- [ ] Club join: parent approve/decline between student sign and advisor review
- [ ] `FormSubmission.subjectUserId` for signing on behalf of student

### Phase C — Granular consent forms

- [ ] Media release category UI → `responseData`
- [ ] Student profile permission form → profile field gating
- [ ] Messaging consent → Broadcasts channel enforcement

### Phase D — Signature audit hardening

- [ ] Persist IP, school year, form version on submit
- [ ] Admin audit export
- [ ] Optional `FormSubmissionAudit` immutable log

### Phase E — Event & athletics expansion

- [ ] Event registration with `contextKey: event:{id}`, QR check-in
- [ ] Athletics participation per organization/team
- [ ] Service hours and Rewards agreements

### Phase F — Forms library growth

- [ ] Handbook ack, field trips, graduation forms in admin library
- [ ] AI Assistant Disclosure gates AI module access
- [ ] Student Marketplace agreement when module ships

---

## Related Documents

| Document | Relevance |
|----------|-----------|
| [`BLUE_DON_CONSTITUTION.md`](./BLUE_DON_CONSTITUTION.md) | Privacy, governance, no hard delete |
| [`BLUE_DON_PRODUCT_BLUEPRINT.md`](./BLUE_DON_PRODUCT_BLUEPRINT.md) | Parent portal gaps, module map |
| [`PHASE_5.md`](./PHASE_5.md) | Shipped forms infrastructure |
| [`enterprise-blueprint/19_PARENT_ALUMNI_PORTALS.md`](./enterprise-blueprint/19_PARENT_ALUMNI_PORTALS.md) | Parent portal roadmap |
| [`enterprise-blueprint/20_GOVERNANCE_COMPLIANCE.md`](./enterprise-blueprint/20_GOVERNANCE_COMPLIANCE.md) | Compliance extensions |
| [`BLUE_DON_BROADCASTS.md`](./BLUE_DON_BROADCASTS.md) | Messaging consent integration |

---

*Administration at Madonna High School retains final authority over all policies, approvals, and participation decisions documented here.*
