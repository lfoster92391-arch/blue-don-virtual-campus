import type { PrismaClient } from "../src/generated/prisma/client";

/**
 * Knowledge Vault starter articles.
 *
 * Per docs/CLEAN_SLATE.md, the knowledge base starter articles are STRUCTURAL
 * catalog / how-to documentation — the "menu" real users rely on — so they are
 * always seeded (even in a clean-slate launch). They are NOT gated behind
 * SEED_DEMO_CONTENT.
 *
 * Content is grounded in Madonna High School's public site
 * (https://weirtonmadonna.org): mission, Catholic identity, academics, honors,
 * service hours, athletics, admissions/tuition, and college/career planning.
 * Facts are paraphrased and summarized for the campus app.
 *
 * Articles are stored as lightweight Markdown; the Knowledge Vault detail page
 * renders headings, lists, bold text, and links.
 */

const IT_HELP_DESK_EMAIL = "help@weirtonmadonna.on.spiceworks.com";
const SCHOOL_PHONE = "304-723-0545";

type SeedArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
};

export const KNOWLEDGE_ARTICLES: SeedArticle[] = [
  {
    id: "kb-welcome",
    slug: "welcome-to-blue-don",
    title: "Welcome to Madonna High School",
    category: "Getting Started",
    tags: ["onboarding", "campus", "navigation", "featured"],
    content: `Welcome to **Madonna High School** — your student campus home. It brings school life together in one place so you can spend less time hunting for information and more time being a Blue Don.

Madonna's motto says it best: **"Followers of Christ… Leaders in the World."** This platform is built around that mission.

## What you can do here

- **Home** — your daily dashboard. Check announcements, upcoming events, and what needs your attention today.
- **School Hub** — the front door to school information, quick links, and campus resources.
- **Find Your Place** — discover clubs, teams, and academies that match your interests, then request to join.
- **Academies** — explore Madonna's academy pathways and the modules, missions, and certifications inside them.
- **Athletics** — follow the Blue Dons and Lady Dons and find out how to get involved.
- **Service Center** — track the service hours you need to graduate.
- **Future Center** — college and career planning, opportunities, and your College Passport.
- **Daily Discovery** — a fresh dose of campus life, prompts, and things worth checking out each day.
- **Forms Center** — sign and submit the agreements and permission forms school asks for.
- **Knowledge Vault** — the guide you're reading now: how-to articles for students, families, and staff.

## New here? Start with these

1. Complete your profile so the campus knows who you are.
2. Read **About Madonna High School** to learn our story and mission.
3. Visit **Find Your Place** and request to join a club or academy.
4. Check **Service Hours** so you know your requirement for the year.

Questions the Vault doesn't answer? Call the school office at ${SCHOOL_PHONE} or ask your advisor.`,
  },
  {
    id: "kb-about-madonna",
    slug: "about-madonna-high-school",
    title: "About Madonna High School",
    category: "About Madonna",
    tags: ["about", "mission", "history", "catholic", "featured"],
    content: `Madonna High School is a **Catholic school for grades 7 through 12** in Weirton, West Virginia. Financially supported chiefly by the Catholic faith community, Madonna welcomes students of all faiths.

## Mission

**Followers of Christ… Leaders in the World.** Developing and nurturing a Christian atmosphere and faith is our top priority. The primary purpose of Madonna High School is to proclaim Jesus Christ as Lord and Savior while preparing students for college and life.

## At a glance

- A Catholic, college-preparatory school for grades 7–12.
- Small classes and a family atmosphere — students often say it's "a big family in a small school."
- A member of the **National Catholic Education Association (NCEA)** and accredited by the **North Central Association / Cognia (AdvancED)**.
- Part of the **Diocese of Wheeling-Charleston** Catholic schools and the Mid-Atlantic Catholic Schools Consortium.
- Partner school with **St. Joseph the Worker School** and **St. Paul School** (Pre-K–6 Catholic education).

## Our story

Realizing a need for Catholic secondary education in Weirton, **Monsignor Daniel Patrick Murphy** began planning a high school in the early 1950s. With support from Weirton Steel, generous parishioners, and the Starvaggi family — who donated land — the dream became reality. Madonna High School was dedicated on **August 15, 1955**, staffed by the Sisters of Saint Joseph of Peace.

## The Blue Dons

Madonna's teams and students are the **Blue Dons** and **Lady Dons**. School spirit runs deep, from the Alma Mater to championship banners in the Bill Barrett Gymnasium.

## Contact

- Phone: ${SCHOOL_PHONE}
- Website: weirtonmadonna.org`,
  },
  {
    id: "kb-catholic-identity",
    slug: "catholic-identity-and-mass",
    title: "Faith at Madonna: Mass, Prayer & Catholic Identity",
    category: "Faith & Service",
    tags: ["faith", "mass", "catholic", "retreats", "featured"],
    content: `Faith is at the center of everything at Madonna. As a Catholic school, our first calling is to proclaim Jesus Christ and to help every student grow spiritually.

## Worship and prayer

- **Weekly liturgies (Mass)** are celebrated for the entire student body and faculty throughout the school year. Students help plan and prepare these liturgies with the religion department.
- **Daily communal prayer** is part of the school day.
- The **Sacrament of Reconciliation** is offered monthly.
- **School-wide prayer services, class retreats, and Adoration of the Blessed Sacrament** are hallmarks of Madonna's Catholic identity.

## Religion is for everyone

Religion is a course taken **every year** at Madonna, and respectful participation in religious services is expected of all students. The religion requirement is not waived for non-Catholic students — sharing the faith is central to a Catholic education.

## Retreats and service

Annual retreats and service hours are **required to graduate**. Retreats give students time to step back, reflect, and grow in community. (See the **Service Hours** article for exact requirements by grade.)

## Parish connections

Madonna students typically come from local parishes including St. Joseph the Worker, St. Paul, Sacred Heart of Mary, St. John the Evangelist, St. Anthony, and Immaculate Conception.

Questions about liturgy, retreats, or campus ministry can go to the Campus Ministry office.`,
  },
  {
    id: "kb-service-hours",
    slug: "service-hours-requirements",
    title: "Service Hours: Requirements & How to Log Them",
    category: "Faith & Service",
    tags: ["service", "service-hours", "graduation", "requirements"],
    content: `Service to others is a graduation requirement at Madonna and a living expression of our faith. Here's what you owe and how to record it.

## Hours required each year

- **Seniors and Juniors:** a minimum of **20 hours** of service each year, plus the school retreat.
- **Sophomores and Freshmen:** a minimum of **15 hours** each year, plus the school retreat.
- **7th and 8th graders:** a minimum of **10 hours** each year, plus the school retreat.

## Deadline

Annual service requirements must be completed by the **end of the third quarter** of each academic year. Don't wait until the last week — spread service across the year.

## How to get credit

A **written evaluation from the supervisor** of your service is required. It should list the experience and the time spent on each individual service activity. Submit the school's **Service Hours Form** with your supervisor's signature.

## Tips

- Choose service that genuinely helps others — parishes, community organizations, and school events all count.
- Keep your own running log so the totals are easy to confirm.
- Track your progress in the **Service Center** on Blue Don.

If you're unsure whether an activity qualifies, ask before you start so it counts.`,
  },
  {
    id: "kb-bell-schedule",
    slug: "the-school-day",
    title: "The School Day",
    category: "Campus Life",
    tags: ["campus-life", "daily", "attendance"],
    content: `Knowing the flow of the day helps you stay on time and prepared.

## During the day

- Arrive on time; tardies are recorded.
- Watch morning announcements and the **Home** page for changes.
- Special days (Mass, assemblies, early dismissals, exam days) are posted on weirtonmadonna.org and shared by the school office.

## Attendance and events

If you're **absent or tardy on the day of an athletic event or activity**, you generally can't participate unless administration grants permission. Early dismissals on event days also require administration approval. (See **Attendance, Grades & Activity Eligibility**.)

## Class supplies and calendar

The **Class Supply List** and the **School Event Calendar** are posted each year on the school website and in the campus **Calendar**. Check them at the start of each semester so you have what you need.`,
  },
  {
    id: "kb-dress-code",
    slug: "dress-code-and-uniforms",
    title: "Dress Code & Uniforms",
    category: "Campus Life",
    tags: ["dress-code", "uniforms", "campus-life", "policy"],
    content: `Madonna has a school uniform. Dressing the part is part of representing the Blue Dons well.

## Ordering uniforms

- Uniforms are ordered through **Schoolbelles**. Madonna's school code is **S1204**.
- This includes items such as uniform **skirts and sweaters**. Check the current uniform guidelines in the Student Handbook for the full list of approved items.

## Everyday expectations

- Wear the approved uniform neatly and completely.
- Keep grooming and accessories within the Handbook's guidelines.
- The full dress code — including what's allowed on out-of-uniform or dress-down days — is detailed in the **Student Handbook**, posted on the school website.

## Dances and formal events

For school dances, a **Formal Dress Student and Parent Agreement** must be completed. Formal dress submissions are sent to **Mrs. Brooks at gbrooks@weirtonmadonna.org** for approval before the event.

## Questions

When in doubt, check the Student Handbook first, then ask the office at ${SCHOOL_PHONE}. Following the dress code avoids last-minute problems on event days.`,
  },
  {
    id: "kb-attendance-eligibility",
    slug: "attendance-and-eligibility",
    title: "Attendance, Grades & Activity Eligibility",
    category: "Campus Life",
    tags: ["attendance", "eligibility", "grades", "athletics"],
    content: `Staying eligible for sports, clubs, and events depends on both your **attendance** and your **grades**.

## Academic eligibility (the 2.0 rule)

Madonna follows the West Virginia Secondary School Activities Commission (**WVSSAC**) standards:

- You must maintain a **2.0 GPA semester average** to participate in extracurricular activities the following semester.
- **Religion grades are included** in your GPA.
- If you fall below a 2.0, your eligibility can be **reinstated at mid-semester** if you've earned at least a 2.0 for the most recent grading period.

## Attendance on event days

- If you are **not present in school** on the day of an athletic event — or you're **tardy** — you cannot participate that day unless administration gives permission.
- **Early dismissals** on the day of an event also require administration approval.
- It's your responsibility to know special schedules and plan ahead.

## Why it matters

Eligibility rules protect your standing as a student first. Keep grades up, show up on time, and communicate early with teachers if you're struggling — tutoring is available at no cost through the **National Honor Society**.

Full rules are in the WVSSAC handbook and the Student Handbook.`,
  },
  {
    id: "kb-academics-honors",
    slug: "academics-overview-and-honors",
    title: "Academics & the Honors Program",
    category: "Academics",
    tags: ["academics", "honors", "courses", "grading", "featured"],
    content: `Madonna offers a **college-preparatory** curriculum balanced across theology, sciences, mathematics, languages, and the humanities, plus fine arts and selected business and vocational areas.

## College partnerships

Madonna partners with **West Virginia Northern Community College (WVNCC)** for dual-credit courses and the **John D. Rockefeller Career Center** for two-year, career-based programs (welding, graphic design, therapeutic services, and more). Many students earn college credit before graduation.

## Honors Program

Based on grades and faculty recommendation, students may take honors courses:

- Complete **14 honors courses** to graduate **With Honors**.
- Complete **19 honors courses** (no grade below a B) to graduate **With Distinguished Honors**.
- **With Honors** requires an overall GPA of **3.0+**; **Distinguished Honors** requires a **4.0+** overall.
- All college-level courses count as honors-level toward graduation with honors.
- Honors graduates wear a gold honor hood at Commencement.

## Grading scale

| Percentage | Grade | GPA | Honors | AP/College |
| --- | --- | --- | --- | --- |
| 90–100 | A | 4.0 | 4.5 | 5.0 |
| 80–89 | B | 3.0 | 3.5 | 4.0 |
| 70–79 | C | 2.0 | 2.5 | 3.0 |
| 60–69 | D | 1.0 | 1.5 | 2.0 |
| 0–59 | F | 0 | 0 | 0 |

There is no rounding up — an 89.99% is a B.

## Support

Free **tutoring** is provided by members of the National Honor Society. Progress reports go out mid-marking-period to flag struggling grades early. See the **Curriculum Guide** for full course details.`,
  },
  {
    id: "kb-graduation-requirements",
    slug: "graduation-requirements",
    title: "Graduation Requirements",
    category: "Academics",
    tags: ["graduation", "credits", "requirements", "academics"],
    content: `To earn a Madonna High School diploma, students complete **28 credits** across the areas below, along with the required retreats and service hours.

## Credits by subject

- **Language Arts** — 4 credits
- **Mathematics** — 4 credits (a math class is required every year)
- **Science** — 4 credits
- **Social Studies** — 4 credits
- **Theology / Service** — 4 credits
- **Foreign Language** — 2 credits
- **Physical Education** — 1 credit
- **Health** — 1 credit
- **Fine Arts** — 1 credit
- **Electives** — 3 credits

**Total: 28 credits**

## Important notes

- The **religion (theology) requirement cannot be waived**, including for non-Catholic students.
- **Service hours and annual retreats** are also required to graduate (see the **Service Hours** article).
- Male students who turn 18 must register with **Selective Service**.

## How grades are credited

- An 18-week course earns ½ unit; a 36-week course earns two half-units.
- You must pass **both semesters** of a 36-week course.
- Semester grades are weighted: 40% first quarter + 40% second quarter + 20% exam.

Check the **Curriculum Guide** and see College Guidance early to make sure you're on track.`,
  },
  {
    id: "kb-athletics",
    slug: "blue-dons-athletics",
    title: "Blue Dons & Lady Dons: Athletics, Tryouts & Eligibility",
    category: "Athletics",
    tags: ["athletics", "sports", "tryouts", "eligibility", "blue-dons", "featured"],
    content: `Madonna's teams compete as the **Blue Dons** and **Lady Dons**, members of the WVSSAC and OVAC with a long history of championships.

## Sports offered

Baseball, Boys & Girls Basketball, Cheering, Cross Country, Football, Girls Soccer, Golf, Softball, Tennis, Track & Field, Volleyball, and Wrestling — plus a full slate of **Jr. Dons** (junior high) teams.

## How to join / try out

1. Talk to the **Athletic Director** or the head coach for the sport you're interested in — tryout and practice dates are announced by season.
2. Complete a current **Sports Physical Form** before you can practice or try out.
3. Sign any required participation and athletics forms in the **Forms Center**.
4. Watch announcements and the Athletics page for season start dates.

## Eligibility

- Maintain a **2.0 GPA** semester average (religion grades count) to be eligible the following semester.
- Be **present and on time** on the day of an event to compete (see **Attendance, Grades & Activity Eligibility**).
- Meet all WVSSAC requirements.

## Where teams play

- Home volleyball, girls basketball, and wrestling: **Bill Barrett Gymnasium**.
- Boys basketball and Jr. Don volleyball: **Dube Dome** at St. Joseph the Worker, across the street.
- Baseball and softball practice at the indoor **MAC Building** practice facility.

## Athletic contacts

- **Athletic Director:** Mr. Jamie Lesho
- **Assistant Athletic Directors:** Ms. Marcy Grishkevich, Dr. Dave Bowden

Go Dons!`,
  },
  {
    id: "kb-clubs-activities",
    slug: "clubs-and-getting-involved",
    title: "Clubs, Drama & Getting Involved",
    category: "Campus Life",
    tags: ["clubs", "activities", "drama", "student-life"],
    content: `The fastest way to feel at home at Madonna is to get involved. There's a place for everyone.

## Find your place

Use **Find Your Place** on Blue Don to browse clubs, teams, and academies. When you find something that fits, request to join and sign the **Club Membership Commitment** — then an advisor reviews your request.

## Some of what students do

- **Madonna Drama** stages full productions (recently *Hadestown: Teen Edition*) — acting, tech theater, and stage crew.
- **National Honor Society** members provide free tutoring and lead service.
- **Student Council** and class officers plan events and represent the student body.
- **The Prefect System** recognizes seniors who take on extra responsibility (tours, tutoring, graduation help) — Prefects wear a blue cord at graduation.
- Yearbook, campus ministry teams, academy clubs, and more.

## The Prefect System

Seniors can apply to become Prefects. For recent classes, this includes at least **100 approved service hours** and taking at least **2 AP classes** with an A (or a score of 3+ on the AP exam). Service hours must be approved by administration to count.

## Ready to jump in?

Head to **Find Your Place**, pick something that interests you, and request to join. New clubs and activities appear as the school adds them.`,
  },
  {
    id: "kb-future-center",
    slug: "future-center-college-career",
    title: "Future Center: College & Career Planning",
    category: "Future Center",
    tags: ["college", "career", "future-center", "scholarships", "college-passport", "featured"],
    content: `The **Future Center** is where you plan life after Madonna — college, careers, scholarships, and real-world opportunities. It works hand-in-hand with the school's **College Guidance** office.

## What's inside

- **Career Pathways** — explore fields and the steps to get there.
- **College Passport** — organize your college search, applications, deadlines, and testing in one place.
- **Opportunities** — internships, programs, and experiences shared with Madonna students.

## College Guidance helps with

- Educational and career planning, and interpreting your strengths.
- Applying to colleges — the counselor mails transcripts, so notify them right away when you apply.
- ACT/SAT preparation and registration. Most Madonna students take the ACT (www.act.org); the SAT is at www.collegeboard.org.
- Scholarships and financial aid, including an annual **FAFSA workshop in October**.

## Testing timeline

Madonna administers the PSAT (freshmen–juniors), NWEA, PSAT/NMSQT (juniors, toward National Merit), and ACT/SAT School Day for juniors. Juniors and seniors who are college-bound should also test on national dates.

## Scholarships & aid

- Complete the **FAFSA** starting October 1 of senior year — it's required for the **WV PROMISE Scholarship** and state aid.
- Explore the **Hope Scholarship** and local/senior scholarships posted by the school.

## Get a head start

Dual-credit **WVNCC** classes and **Rockefeller Career Center** programs let you earn college credit and career training before you graduate. Talk to College Guidance early — the earlier you plan, the more options you have.`,
  },
  {
    id: "kb-it-support",
    slug: "submit-it-support-request",
    title: "Submit an IT Support Request",
    category: "IT & Technology",
    tags: ["it", "help-desk", "support", "devices", "spiceworks", "featured"],
    content: `Having a technology, device, network, or account problem? Here's how to get help fast.

## How to open a ticket

Email the **Weirton Madonna Help Desk** at **${IT_HELP_DESK_EMAIL}**. Your email automatically creates a support ticket that the systems administrators can track and resolve.

## Include as much detail as possible

A good ticket gets solved faster. Please include:

- **What you've already tried** / the steps you've taken
- **Device model and serial number** (if it's a device issue)
- A clear **description of the problem** — what happened, and what you expected
- Your **location** (room number or building area)
- **Urgency and impact** — is this blocking class or a whole classroom?
- **Screenshots or the exact error message**, if you have them

## What IT supports

Chromebooks and other school devices, Wi‑Fi and network access, printing, logins and account access, and campus software.

## Other requests

Facilities and other non-IT requests can be submitted through the **Service Desk** in Blue Don. For urgent, in-person help during the school day, check with the office at ${SCHOOL_PHONE}.

The more complete your ticket, the sooner it's fixed.`,
  },
  {
    id: "kb-device-care",
    slug: "device-care-and-technology-use",
    title: "Chromebook Care, Wi‑Fi & Technology Use",
    category: "IT & Technology",
    tags: ["chromebook", "wifi", "printing", "technology", "devices"],
    content: `Technology is part of learning at Madonna (the annual technology fee supports campus devices and network). Take care of your device and use it responsibly.

## Taking care of your device

- **Carry it closed** with two hands and store it in a protective sleeve when moving between classes.
- Keep food and drinks away from the keyboard.
- **Charge it every night** so you start the day at full battery.
- Don't leave it in a hot or cold car, and never stack heavy items on top of it.
- Report cracks, charging problems, or damage right away with an **IT ticket** (see **Submit an IT Support Request**).

## Wi‑Fi and logins

- Sign in with your **school account**. Keep your password private and never share it.
- If you can't connect to Wi‑Fi or sign in, submit an IT ticket with your device model and the exact error message.
- Log out of shared or lab computers when you finish.

## Printing

Use the designated campus printers with your school account. If a print job fails or a printer is out of service, open an IT ticket noting the room/printer.

## Responsible use

By signing the **Technology Agreement** (in the Forms Center), you agree to:

- Use campus technology for learning and school purposes.
- Protect your login credentials.
- Report security concerns to an advisor or IT.

Misuse can result in loss of technology privileges. When something breaks, don't try risky fixes — open a ticket at **${IT_HELP_DESK_EMAIL}**.`,
  },
  {
    id: "kb-admissions-tuition",
    slug: "admissions-and-tuition",
    title: "Admissions, Tuition & Financial Aid",
    category: "Admissions",
    tags: ["admissions", "tuition", "financial-aid", "enrollment"],
    content: `Madonna welcomes students of all faiths to a Catholic, college-preparatory education for grades 7–12. Here's how enrollment and tuition work.

## Plan a visit

The best way to experience Madonna is to visit. Call **${SCHOOL_PHONE}** or email **enrollment@weirtonmadonna.org** to schedule a tour and observe the atmosphere firsthand. Apply online through the school website.

## How students are admitted

Students are admitted based on grades, test scores, and recommendations from their previous school. Madonna does not discriminate on the basis of race, color, or national origin. The Diocese of Wheeling-Charleston sets admission-priority categories (currently enrolled students and their siblings first, then diocesan and parish families, then others as space allows).

## 2026–2027 tuition (reference)

- **High School:** $7,200/year (tuition $6,900 + $200 technology fee + $100 activities).
- **High School additional child:** $5,500/year.
- **Jr. High:** $6,300/year.
- **Jr. High additional child:** $5,500/year.

Always confirm current rates with the school office.

## Financial assistance

Financial aid is available to all eligible families — **over 70% of Madonna families receive tuition assistance**. To be considered:

- Apply for aid from the **Wheeling-Charleston Diocese** first (required for all applicants, Catholic or not).
- Complete all materials: application, letters of recommendation, and a 1040 tax form.
- Aid is based on financial need, family size, and the student's academic record.

Also explore the **Hope Scholarship** (hopescholarshipwv.gov). Aid recipients sign a tuition assistance agreement to maintain academic and conduct standards.`,
  },
  {
    id: "kb-forms-center",
    slug: "digital-forms-center",
    title: "Using the Digital Forms Center",
    category: "Getting Started",
    tags: ["forms", "forms-center", "agreements", "permissions"],
    content: `The **Forms Center** is where you complete the agreements and permission forms Madonna needs — no more lost paper slips.

## What lives here

Depending on your role, you may see forms such as:

- **Student Agreement** and **Parent Agreement** — participation standards for Blue Don students and families.
- **Technology Agreement** — responsible use of campus devices and accounts.
- **Media Release** — permission to use photos, video, and student work.
- **Club Membership Commitment** — required before joining a club or academy.
- **Event Registration, Volunteer, and Travel** forms — for campus activities and trips.
- **Student Profile Permission** — parents choose which profile fields are visible.

## How it works

1. Open the **Forms Center** from the menu.
2. Select the form you need. Read it carefully.
3. Complete the fields and sign digitally.
4. Submit. Forms that need approval are routed to the right advisor or parent automatically, and you can track their status.

## Parents and guardians

Some forms (like agreements and profile permissions) require a **parent/guardian signature**. Parents complete these from their own account so approvals are properly recorded.

If a form you expect isn't showing, check with your advisor or the office — some forms appear only at certain times or for certain roles.`,
  },
  {
    id: "kb-academies",
    slug: "academies-at-madonna",
    title: "Academies: What They Are & How to Join",
    category: "Getting Started",
    tags: ["academies", "pathways", "students", "join"],
    content: `**Academies** are Madonna's interest- and career-focused pathways on Blue Don. Each academy bundles clubs, modules, missions, and certifications so you can go deep in an area you care about — and build a portfolio while you're at it.

## Why join an academy

- Explore a field (business, technology, arts, service, and more) through hands-on modules and missions.
- Earn recognition and certifications you can show in your **Portfolio** and **Career Portfolio**.
- Connect with classmates and advisors who share your interests.
- Strengthen your **Future Center** plans with real experience.

## How to join

1. Go to **Academies** (or **Find Your Place**) in the menu and browse the pathways.
2. Open an academy to see its clubs, modules, and what membership involves.
3. Request to join and sign the **Club Membership Commitment** in the Forms Center.
4. An advisor reviews your request. Once approved, your academy content unlocks.

## Making progress

Inside an academy you'll find modules and missions to complete. As you finish them, your progress and any certifications are tracked on your profile and portfolio.

New to Blue Don? Start with **Find Your Place** to see everything you can join, then pick an academy that excites you.`,
  },
];

/**
 * Ensure there is a User to author knowledge articles.
 *
 * Prefers a real existing account (ADMIN, then staff-type roles, then any
 * user). Only when the database has no users at all — e.g. a brand-new
 * clean-slate install with no Supabase service key configured — does it create
 * a stable "Blue Don Campus" system account so the starter articles can always
 * be seeded. This system account has no Supabase auth counterpart, so it cannot
 * be used to sign in; it exists purely as the author of built-in guides.
 */
async function ensureKnowledgeAuthorId(prisma: PrismaClient): Promise<string> {
  const preferredRoles = ["ADMIN", "STAFF", "ADVISOR", "COUNSELOR", "TEACHER"] as const;

  for (const role of preferredRoles) {
    const existing = await prisma.user.findFirst({
      where: { role },
      select: { id: true },
    });
    if (existing) {
      return existing.id;
    }
  }

  const anyUser = await prisma.user.findFirst({ select: { id: true } });
  if (anyUser) {
    return anyUser.id;
  }

  const SYSTEM_AUTHOR_ID = "00000000-0000-4000-8000-000000000b0d";
  const systemUser = await prisma.user.upsert({
    where: { id: SYSTEM_AUTHOR_ID },
    update: {
      email: "campus@weirtonmadonna.org",
      displayName: "Blue Don Campus",
      firstName: "Blue Don",
      lastName: "Campus",
      role: "STAFF",
      status: "ACTIVE",
      schoolId: "madonna-high-school",
    },
    create: {
      id: SYSTEM_AUTHOR_ID,
      email: "campus@weirtonmadonna.org",
      displayName: "Blue Don Campus",
      firstName: "Blue Don",
      lastName: "Campus",
      role: "STAFF",
      status: "ACTIVE",
      schoolId: "madonna-high-school",
    },
    select: { id: true },
  });

  return systemUser.id;
}

/**
 * Seed the Knowledge Vault starter articles. Always runs (structural catalog),
 * regardless of SEED_DEMO_CONTENT / clean-slate mode.
 */
export async function seedKnowledgeArticles(prisma: PrismaClient): Promise<void> {
  const authorId = await ensureKnowledgeAuthorId(prisma);

  for (const article of KNOWLEDGE_ARTICLES) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
        status: "PUBLISHED",
      },
      create: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        content: article.content,
        category: article.category,
        tags: article.tags,
        status: "PUBLISHED",
        authorId,
      },
    });
  }

  console.log(
    `Seeded ${KNOWLEDGE_ARTICLES.length} published Knowledge Vault articles (grounded in weirtonmadonna.org).`,
  );
}
