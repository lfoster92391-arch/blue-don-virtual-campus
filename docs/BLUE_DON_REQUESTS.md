# Blue Don Requests

**Unified Request System · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design and phased delivery  
**Audience:** All campus roles, developers  

**Pillar:** School Operations (cross-cuts all pillars for submission surfaces)

**Companion documents:** [Campus Operations](./BLUE_DON_CAMPUS_OPERATIONS.md) · [Strategic Pillars](./BLUE_DON_STRATEGIC_PILLARS.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

Instead of paper forms and scattered emails, **every request flows through one system**.

> **No more "Did anyone ever see my email?"**

Every request has a **type**, an **owner department**, a **status**, and an **audit trail**. Submitters track progress in one place. Staff triage from department queues in Campus Operations.

**Module 33** — foundational to Campus Operations Center (Module 32).

---

## Part I — Request Status Model

```
🟡 Submitted
🔵 In Review
🟢 Approved
🔴 Needs More Information
✅ Completed
```

### State machine

```
DRAFT → SUBMITTED → IN_REVIEW → APPROVED → COMPLETED
              │           │
              │           └──→ NEEDS_INFO → SUBMITTED (resubmit)
              │
              └──→ REJECTED (terminal, with reason)
```

| Status | UI color | Meaning |
|--------|----------|---------|
| **Submitted** | 🟡 Yellow | Received; awaiting triage |
| **In Review** | 🔵 Blue | Assigned; being worked |
| **Approved** | 🟢 Green | Approved; action in progress |
| **Needs More Information** | 🔴 Red | Returned to submitter |
| **Completed** | ✅ Green check | Done; closed |
| **Rejected** | Gray | Denied with reason (optional terminal) |

---

## Part II — Request Types by Role

### Students

| Request type | Routes to | Pillar |
|--------------|-------------|--------|
| Join a club | Student Life / org lead | Student Life |
| Request transcript | Guidance Center | Student Success |
| Schedule counselor | Guidance Center | Student Success |
| Volunteer sign-up | Service Center | Student Life |
| Reserve equipment | Campus Operations | School Operations |
| Media / coverage (student-led) | Broadcasting | School Operations |

### Teachers

| Request type | Routes to | Pillar |
|--------------|-------------|--------|
| IT support | Technology / IT Operations | School Operations |
| Reserve auditorium | Facilities / Events | School Operations |
| Event coverage | Broadcasting Operations | School Operations |
| Submit broadcast (draft) | Broadcasts approval queue | School Operations |
| Maintenance request | Facilities | School Operations |
| Equipment reservation | Equipment Reservations | School Operations |
| Hall pass (issue) | Classroom tool (not request — direct action) | Digital Identity |

### Advisors

| Request type | Routes to |
|--------------|-------------|
| Approve club members | Org workspace |
| Create / publish event | Event Hub |
| Verify service hours | Service Center |
| Submit fundraiser | Fundraising Hub |
| Approve student broadcast | Broadcasts |

### Administration

| Request type | Routes to |
|--------------|-------------|
| Approve broadcasts | Broadcasts |
| Review analytics | School Analytics |
| Manage permissions | Administration |
| Approve partner opportunities | Partner Portal |
| Oversee campus operations | Operations hub |

---

## Part III — Request Anatomy

```
Blue Don Request
├── id                    (human-readable: REQ-2026-0042)
├── type                  (IT_SUPPORT, MAINTENANCE, JOIN_CLUB, ...)
├── title
├── description
├── submitterId
├── departmentSlug        (routing)
├── status
├── priority              (LOW, NORMAL, HIGH, URGENT)
├── assignedToId          (optional)
├── relatedEntityType     (event, org, equipment, ...)
├── relatedEntityId
├── attachments[]
├── comments[]            (threaded; visible per policy)
├── statusHistory[]       (audit)
├── createdAt
├── updatedAt
└── completedAt
```

---

## Part IV — User Experience

### Submitter view (`/requests` or `/requests/mine`)

```
My Requests
├── 🟡 IT Support — Classroom projector flickering     In Review
├── ✅ Join Robotics Club                              Completed
├── 🟡 Reserve laptop cart — March 12                  Submitted
└── 🔴 Event coverage — Science Fair                   Needs More Information
         └── "Please specify time and location."
```

**Tap count:** 2 from Home (Requests widget → detail).

### Staff view (`/operations/[dept]/queue`)

Department-filtered queue with assign, comment, status change, link to related records.

### Notifications

Status changes trigger **Blue Don Broadcast** or in-app notification to submitter.

---

## Part V — Integration Map

| Existing system | Becomes |
|-----------------|---------|
| Service Desk tickets | `IT_SUPPORT` request type → IT Operations queue |
| Form submissions | Governance forms stay in Forms module; operational asks use Requests |
| Club join pending | `JOIN_CLUB` request on org membership |
| Impact Fund proposals | `FUNDRAISER` request type |
| Broadcast approval | `BROADCAST` request type |
| Equipment email chains | `EQUIPMENT_RESERVATION` request type |
| Facilities phone calls | `MAINTENANCE` request type |

**Rule:** If it's "I need something from the school," it's a Blue Don Request unless it's a governance form or academic assignment.

---

## Part VI — Permissions

| Key | Who |
|-----|-----|
| `requests:create` | All authenticated users (type-scoped) |
| `requests:view_own` | Submitter |
| `requests:view_dept` | Dept staff for their queue |
| `requests:assign` | Dept staff |
| `requests:resolve` | Dept staff |
| `requests:manage` | Admin — all queues |

Request **types** are permission-scoped: students cannot submit `MAINTENANCE` on behalf of others; teachers can.

---

## Part VII — Technical Schema

```prisma
enum RequestStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  NEEDS_INFO
  COMPLETED
  REJECTED
}

enum RequestType {
  IT_SUPPORT
  MAINTENANCE
  EQUIPMENT_RESERVATION
  EVENT_COVERAGE
  JOIN_CLUB
  TRANSCRIPT
  COUNSELOR_APPOINTMENT
  VOLUNTEER_SIGNUP
  FUNDRAISER
  BROADCAST_APPROVAL
  PARTNER_OPPORTUNITY
  MEDIA_REQUEST
  ROOM_RESERVATION
  CUSTOM
}

model CampusRequest {
  id              String        @id @default(cuid())
  displayId       String        @unique @map("display_id")  // REQ-2026-0042
  schoolId        String        @map("school_id")
  type            RequestType
  title           String
  description     String
  status          RequestStatus @default(DRAFT)
  priority        TicketPriority @default(MEDIUM)
  submitterId     String        @map("submitter_id") @db.Uuid
  departmentSlug  String        @map("department_slug")
  assigneeId      String?       @map("assignee_id") @db.Uuid
  relatedType     String?       @map("related_type")
  relatedId       String?       @map("related_id")
  rejectionNote   String?       @map("rejection_note")
  completedAt     DateTime?     @map("completed_at")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")
  comments        RequestComment[]
  statusLog       RequestStatusLog[]
}

model RequestComment {
  id          String   @id @default(cuid())
  requestId   String   @map("request_id")
  authorId    String   @map("author_id") @db.Uuid
  body        String
  internal    Boolean  @default(false)  // staff-only notes
  createdAt   DateTime @default(now()) @map("created_at")
}

model RequestStatusLog {
  id          String   @id @default(cuid())
  requestId   String   @map("request_id")
  fromStatus  RequestStatus? @map("from_status")
  toStatus    RequestStatus @map("to_status")
  changedById String   @map("changed_by_id") @db.Uuid
  note        String?
  createdAt   DateTime @default(now()) @map("created_at")
}
```

**Migration path:** Existing `Ticket` model maps to `CampusRequest` where `type = IT_SUPPORT`.

---

## Part VIII — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **23.0** | `CampusRequest` schema + `/requests/mine` |
| **23.1** | IT_SUPPORT type → IT Operations queue (replace raw tickets UI) |
| **23.2** | MAINTENANCE → Facilities queue |
| **23.3** | EQUIPMENT_RESERVATION + calendar |
| **23.4** | JOIN_CLUB, volunteer, transcript types |
| **23.5** | Status notifications + broadcasts |
| **23.6** | Admin all-queue view |

---

## Part IX — Design Checklist

1. **One front door** — Can the user find "My Requests" in ≤ 2 taps?  
2. **Clear status** — Is the submitter never left wondering?  
3. **Right queue** — IT ≠ Facilities ≠ Broadcasting?  
4. **Audit trail** — Every status change logged?  
5. **Pillar check** — Which pillar owns this request type?

---

*Madonna High School · Blue Don Virtual Campus*  
*Blue Don Requests — Transparency for every campus ask.*
