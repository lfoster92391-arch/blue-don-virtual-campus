# Guidance & Counseling Center

**Student Support System · Foundational Document**  
**Blue Don Virtual Campus · Madonna High School**  
**Version:** 1.0  
**Status:** Approved for design (post–Blue Don ID)  
**Audience:** Counselors, faculty, administrators, product, developers  

**Companion documents:** [Blue Don ID](./BLUE_DON_ID.md) · [Digital Campus](./BLUE_DON_DIGITAL_CAMPUS.md) · [Product Blueprint](./BLUE_DON_PRODUCT_BLUEPRINT.md) · [User Experience Flow](./BLUE_DON_USER_EXPERIENCE_FLOW.md) · [Index](./FOUNDATIONAL_DOCUMENTS.md)

---

## Executive Summary

The Guidance & Counseling Center is **not a page for counselors** — it is a complete **student support system** that ties together Journey, Future Center, graduation readiness, and wellness resources through one identity (Blue Don ID).

> At this point, Blue Don is no longer just a digital campus — it is the **operating system for the entire Madonna experience**.

**Module 31** — builds after Blue Don ID (Module 30).

---

## Part I — Platform Identity

| Concept | Definition |
|---------|------------|
| **Guidance Center** | Student-facing hub for counseling, planning, and support |
| **Counselor Dashboard** | Staff workspace for caseload, appointments, flags |
| **Four-Year Plan** | Academic pathway builder tied to graduation requirements |
| **Wellness resources** | Curated links and tools — not AI therapy (Constitution Article X) |

### Route

`/guidance` (student) · `/guidance/counselor` (staff)

---

## Part II — Student Capabilities

```
Guidance & Counseling Center (/guidance)
│
├── Schedule Counselor Appointments
├── Request Transcripts
├── Track Graduation Requirements
├── Build Four-Year Academic Plan
├── Explore Scholarships & Financial Aid
├── Wellness & Academic Resources
├── College Admissions Connections
├── Set Personal & Academic Goals
└── Forms & Recommendation Requests
```

| Capability | Integrates with |
|------------|-----------------|
| **Schedule appointments** | Smart Calendar, counselor availability |
| **Request transcripts** | FACTS SIS, Digital Backpack |
| **Graduation requirements** | My Journey → Graduation Progress |
| **Four-year plan** | Future Center, academies, course catalog |
| **Scholarships & aid** | Future Center, FAFSA resources |
| **Wellness resources** | Knowledge Vault (curated), external links |
| **College admissions** | Recruiter visits, event RSVPs |
| **Goals** | My Journey → Goals |
| **Recommendation requests** | Forms module, teacher workflow |

---

## Part III — Counselor Capabilities

```
Counselor Dashboard (/guidance/counselor)
│
├── Caseload Roster
├── Appointment Calendar
├── Student Journey View (permitted fields)
├── Graduation Risk Flags
├── Referral Queue
├── Transcript Requests
├── Recommendation Letter Queue
├── Wellness Referral Flags (not diagnosis)
└── Reports & Compliance
```

### Counselor view principles

| Rule | Detail |
|------|--------|
| **GC1** | Counselors see **permitted educational records** only — FERPA |
| **GC2** | AI provides **flags and summaries** — not therapy (Article X) |
| **GC3** | Parents see **scoped summaries** for linked students |
| **GC4** | Students control **recommendation request** visibility to teachers |

---

## Part IV — Ties to Existing Modules

```
┌─────────────────────────────────────────────────────────┐
│           Guidance & Counseling Center                   │
└─────────────────────────┬───────────────────────────────┘
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌────────────┐   ┌──────────────┐
    │My Journey│   │Future      │   │Graduation    │
    │Goals     │   │Center      │   │Readiness     │
    │Progress  │   │Scholarships│   │Requirements  │
    └──────────┘   └────────────┘   └──────────────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                   ┌──────────────┐
                   │ Blue Don ID  │
                   │  Backpack    │
                   └──────────────┘
```

| Journey stage | Guidance touchpoint |
|---------------|---------------------|
| Grade 7–8 | Exploration, wellness intro |
| Grade 9 | Four-year plan start, academy alignment |
| Grade 10–11 | College/trade exploration, course planning |
| Grade 12 | Graduation checklist, transcripts, scholarships, recommendations |
| Alumni | Transcript requests, mentor connections |

---

## Part V — Appointment Flow

```
Student opens Guidance Center
        │
        ▼
Select counselor (or assigned counselor)
        │
        ▼
Pick available slot (Smart Calendar)
        │
        ▼
Confirm → Calendar invite + reminder broadcast
        │
        ▼
Day-of → Check in via Blue Don ID (optional)
        │
        ▼
Counselor notes (private) → Student sees summary only
```

---

## Part VI — Graduation Requirements Engine

```
Requirements (admin-configured per cohort)
├── Credits by subject
├── Service hours minimum
├── Academy pathway (optional)
├── Forms complete
└── Capstone / portfolio

Student view: Progress bars per requirement
Counselor view: At-risk flags when behind pace
```

Syncs with FACTS enrollments and grades (read-only). Manual overrides for transfer students.

---

## Part VII — Wellness Resources

**Not a mental health app.** Curated, school-approved resources:

- Academic stress tips  
- Study skills  
- Crisis hotline numbers (static, prominent)  
- Referral to school counselor CTA  
- Links to Knowledge Vault articles  

AI may **suggest** resources — never diagnose or counsel.

---

## Part VIII — Permissions

| Key | Who |
|-----|-----|
| `guidance:access` | Students |
| `guidance:counselor` | Counselors |
| `guidance:caseload` | Counselor — own students |
| `guidance:transcript_request` | Students, parents (linked) |
| `guidance:recommendation_request` | Students |
| `guidance:recommendation_write` | Teachers (invited) |
| `guidance:manage` | Admin — requirements config |

---

## Part IX — Implementation Phases

| Phase | Deliverable |
|-------|-------------|
| **22.1** | Guidance Center shell + appointment scheduling |
| **22.2** | Graduation requirements tracker |
| **22.3** | Four-year plan builder |
| **22.4** | Transcript request workflow (FACTS) |
| **22.5** | Recommendation request flow |
| **22.6** | Counselor dashboard + caseload |
| **22.7** | Scholarship/financial aid hub (Future Center link) |

**Prerequisite:** Blue Don ID + `StudentProfile` (Module 30).

---

## Part X — Design Checklist

1. **Support, not surveillance** — Counselor tools help students; they don't punish.  
2. **FERPA** — Every field classified and gated.  
3. **No AI therapy** — Resources and referrals only.  
4. **Journey-connected** — Goals and progress sync to My Journey.  
5. **One platform** — No third portal for transcripts or appointments.

---

*Madonna High School · Blue Don Virtual Campus*  
*Guidance & Counseling — Supporting Every Student's Path.*
