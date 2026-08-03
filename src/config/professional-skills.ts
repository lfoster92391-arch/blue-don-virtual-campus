/**
 * W13 enhancement · Professional Skills — career-readiness tracks for the Future Center.
 */

export type ProfessionalSkillSlug =
  | "resume-writing"
  | "interview-ready"
  | "business-email"
  | "customer-service";

export type SkillResource = {
  id: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

export type ChecklistStep = {
  id: string;
  title: string;
  description: string;
};

export type SkillTemplate = {
  id: string;
  title: string;
  description: string;
  content: string;
};

export type PracticePrompt = {
  id: string;
  prompt: string;
  hint?: string;
};

export type ProfessionalSkillTrack = {
  slug: ProfessionalSkillSlug;
  title: string;
  description: string;
  icon: string;
  learningObjectives: string[];
  checklistSteps: ChecklistStep[];
  resources: SkillResource[];
  templates: SkillTemplate[];
  practicePrompts: PracticePrompt[];
  xpOpportunityLabel: string;
  aiTopic: string;
};

export const PROFESSIONAL_SKILL_SLUGS: ProfessionalSkillSlug[] = [
  "resume-writing",
  "interview-ready",
  "business-email",
  "customer-service",
];

export const PROFESSIONAL_SKILLS_WAVE_LABEL = "W19 · Professional Skills";

export const PROFESSIONAL_SKILL_TRACKS: ProfessionalSkillTrack[] = [
  {
    slug: "resume-writing",
    title: "Resume Writing",
    description:
      "Build a polished one-page resume with clear sections, strong action verbs, and measurable achievements.",
    icon: "📄",
    learningObjectives: [
      "Organize a resume into Education, Experience, Skills, and Activities sections",
      "Write bullet points with action verbs and quantifiable results",
      "Tailor a resume to a specific job, internship, or college program",
      "Format for ATS scanners and human reviewers",
    ],
    checklistSteps: [
      {
        id: "rw-1",
        title: "Choose a clean one-page format",
        description: "Use consistent fonts, margins, and section headings. Save as PDF.",
      },
      {
        id: "rw-2",
        title: "Draft your header and contact block",
        description: "Full name, phone, professional email, city/state, LinkedIn or portfolio link.",
      },
      {
        id: "rw-3",
        title: "Complete the Education section",
        description: "School, GPA (if 3.5+), expected graduation, honors, and relevant coursework.",
      },
      {
        id: "rw-4",
        title: "List Experience with impact bullets",
        description: "Jobs, internships, volunteer roles — start each bullet with a strong verb and a result.",
      },
      {
        id: "rw-5",
        title: "Add Skills and Activities",
        description: "Technical and soft skills; clubs, sports, service, and leadership roles.",
      },
      {
        id: "rw-6",
        title: "Proofread and get feedback",
        description: "Check spelling, alignment, and dates. Ask a counselor or mentor to review.",
      },
    ],
    resources: [
      {
        id: "rw-r1",
        title: "Career Portfolio",
        description: "Collect certifications, projects, and leadership evidence in one link.",
        href: "/career-portfolio",
      },
      {
        id: "rw-r2",
        title: "Portfolio items",
        description: "Add projects and achievements that belong on your resume.",
        href: "/portfolio",
      },
      {
        id: "rw-r3",
        title: "Future Center pathways",
        description: "Align resume content with your chosen career pathway.",
        href: "/pathways",
      },
    ],
    templates: [
      {
        id: "rw-t1",
        title: "Resume section outline",
        description: "Standard one-page structure for high school and early college applicants.",
        content: `HEADER
[Full Name] | [Phone] | [Email] | [City, State] | [LinkedIn or Portfolio URL]

EDUCATION
[School Name] — Expected Graduation [Month Year]
GPA: [X.XX] (include if 3.5+) | Honors: [List]
Relevant Coursework: [Course 1], [Course 2], [Course 3]

EXPERIENCE
[Role Title] | [Organization] | [Month Year – Month Year]
• [Action verb] + [what you did] + [result or metric]
• [Action verb] + [what you did] + [result or metric]

SKILLS
Technical: [Software, tools, languages]
Soft: [Communication, teamwork, problem-solving]

ACTIVITIES & LEADERSHIP
[Role] | [Club/Team/Organization] | [Year(s)]
• [Brief impact statement]`,
      },
      {
        id: "rw-t2",
        title: "Impact bullet formula",
        description: "Turn duties into achievements recruiters remember.",
        content: `Formula: [Strong verb] + [specific task] + [measurable outcome]

Examples:
• Organized weekly study sessions for 12 freshmen, raising class average quiz scores by 15%
• Managed social media for club account, growing followers from 80 to 340 in one semester
• Trained 4 new cashiers on POS system, reducing checkout errors during peak lunch rush`,
      },
      {
        id: "rw-t3",
        title: "Education block sample",
        description: "Madonna student example you can adapt.",
        content: `Madonna High School — Expected Graduation June 2027
GPA: 3.82 | National Honor Society
Relevant Coursework: AP Computer Science, Business Foundations, Public Speaking
Certifications: Google IT Support (in progress via Academy Engine)`,
      },
    ],
    practicePrompts: [
      {
        id: "rw-p1",
        prompt: "Write three experience bullets for a part-time job or volunteer role you have held.",
        hint: "Use different action verbs: Led, Coordinated, Improved, Supported.",
      },
      {
        id: "rw-p2",
        prompt: "List 8 skills that match a job posting you are interested in — mark which ones you can prove with examples.",
      },
      {
        id: "rw-p3",
        prompt: "Draft a 2-line summary statement for the top of your resume targeting one specific opportunity.",
      },
    ],
    xpOpportunityLabel: "Earn up to 50 XP — Resume Ready badge",
    aiTopic: "resume",
  },
  {
    slug: "interview-ready",
    title: "Interview Ready",
    description:
      "Prepare confident answers, practice the STAR method, and handle common interview questions with poise.",
    icon: "🎤",
    learningObjectives: [
      "Research an employer or program before the interview",
      "Answer behavioral questions using the STAR method",
      "Prepare thoughtful questions to ask the interviewer",
      "Practice professional body language and follow-up etiquette",
    ],
    checklistSteps: [
      {
        id: "ir-1",
        title: "Research the organization",
        description: "Mission, recent news, role requirements, and who will interview you.",
      },
      {
        id: "ir-2",
        title: "Prepare your introduction",
        description: "30-second pitch: who you are, what you are pursuing, and why you are a fit.",
      },
      {
        id: "ir-3",
        title: "Draft STAR stories",
        description: "Three stories covering leadership, challenge, and teamwork.",
      },
      {
        id: "ir-4",
        title: "Practice common questions aloud",
        description: "Record yourself or practice with a friend, counselor, or Blue Don AI.",
      },
      {
        id: "ir-5",
        title: "Plan your outfit and logistics",
        description: "Professional dress, arrive 10 minutes early, test virtual meeting links.",
      },
      {
        id: "ir-6",
        title: "Send a thank-you within 24 hours",
        description: "Brief email referencing something specific from the conversation.",
      },
    ],
    resources: [
      {
        id: "ir-r1",
        title: "Opportunity Center",
        description: "Find internships and programs that lead to interviews.",
        href: "/opportunities",
      },
      {
        id: "ir-r2",
        title: "Business Email track",
        description: "Write your post-interview thank-you note.",
        href: "/professional-skills/business-email",
      },
      {
        id: "ir-r3",
        title: "Guidance & Counseling",
        description: "Schedule a mock interview with your counselor.",
        href: "/pathways",
      },
    ],
    templates: [
      {
        id: "ir-t1",
        title: "STAR method framework",
        description: "Structure behavioral answers so interviewers hear clear evidence.",
        content: `S — Situation: Set the scene (where, when, context)
T — Task: What was your responsibility or goal?
A — Action: What specific steps did YOU take?
R — Result: What happened? Include numbers or outcomes when possible.

Example prompt: "Tell me about a time you showed leadership."
→ Situation: Freshman year, our club fundraiser was behind goal by $400.
→ Task: As treasurer, I needed to raise funds in two weeks.
→ Action: I pitched a car-wash partnership, coordinated 8 volunteers, and promoted on social media.
→ Result: We exceeded our goal by $150 and funded the spring trip.`,
      },
      {
        id: "ir-t2",
        title: "Common interview questions",
        description: "Prepare concise answers for these staples.",
        content: `1. Tell me about yourself.
2. Why are you interested in this role/program?
3. What is your greatest strength? Weakness?
4. Describe a challenge you overcame.
5. Tell me about a time you worked on a team.
6. Where do you see yourself in five years?
7. Why should we choose you?
8. Do you have questions for us?`,
      },
      {
        id: "ir-t3",
        title: "Questions to ask the interviewer",
        description: "Show curiosity and fit — pick 2–3 for each interview.",
        content: `• What does a typical day look like in this role?
• What skills matter most for success here in the first 90 days?
• How does the team collaborate on projects?
• What opportunities exist for growth or mentorship?
• What are the next steps in your hiring process?`,
      },
    ],
    practicePrompts: [
      {
        id: "ir-p1",
        prompt: "Write a STAR answer for: 'Tell me about a time you solved a problem under pressure.'",
        hint: "Keep each STAR section to 1–2 sentences when speaking aloud.",
      },
      {
        id: "ir-p2",
        prompt: "Record a 30-second 'Tell me about yourself' answer and time it.",
      },
      {
        id: "ir-p3",
        prompt: "Choose three questions from the list above and draft written answers under 90 words each.",
      },
    ],
    xpOpportunityLabel: "Earn up to 50 XP — Interview Ready badge",
    aiTopic: "interview",
  },
  {
    slug: "business-email",
    title: "Business Email",
    description:
      "Write clear, respectful emails for school, work, and professional outreach — from meeting requests to thank-you notes.",
    icon: "✉️",
    learningObjectives: [
      "Use professional subject lines and greetings",
      "Structure emails with purpose, context, and a clear call to action",
      "Adjust tone for teachers, employers, and peers",
      "Proofread for clarity, tone, and etiquette",
    ],
    checklistSteps: [
      {
        id: "be-1",
        title: "Use a professional email address",
        description: "First.last or school-issued address — avoid nicknames for formal outreach.",
      },
      {
        id: "be-2",
        title: "Write a specific subject line",
        description: "Include topic and your name when appropriate.",
      },
      {
        id: "be-3",
        title: "Open with a proper greeting",
        description: "Dear Mr./Ms. [Last Name] or Hello [Name] for known contacts.",
      },
      {
        id: "be-4",
        title: "State purpose in the first paragraph",
        description: "Why you are writing — do not bury the request.",
      },
      {
        id: "be-5",
        title: "Close with gratitude and next steps",
        description: "Thank them, suggest availability, and sign with your full name.",
      },
      {
        id: "be-6",
        title: "Proofread before sending",
        description: "Read aloud, check attachments, and verify recipient addresses.",
      },
    ],
    resources: [
      {
        id: "be-r1",
        title: "Forms center",
        description: "Official school forms when email is not the right channel.",
        href: "/forms",
      },
      {
        id: "be-r2",
        title: "Interview Ready track",
        description: "Pair interview prep with professional follow-up.",
        href: "/professional-skills/interview-ready",
      },
      {
        id: "be-r3",
        title: "Blue Don AI writing coach",
        description: "Get feedback on tone and structure before you send.",
        href: "/ai?topic=email",
      },
    ],
    templates: [
      {
        id: "be-t1",
        title: "Request a meeting",
        description: "Ask a teacher, mentor, or employer for a brief conversation.",
        content: `Subject: Meeting Request — [Your Name] — [Topic]

Dear [Mr./Ms. Last Name],

I hope you are doing well. I am writing to request a brief meeting to discuss [specific topic — internship, recommendation, project feedback].

I am available [Day, Time options] and can meet in person or via [platform]. The meeting would take approximately [15–20] minutes.

Thank you for your time and guidance.

Sincerely,
[Your Full Name]
[Grade/Program] | [Phone] | [Email]`,
      },
      {
        id: "be-t2",
        title: "Thank-you after interview or event",
        description: "Send within 24 hours of a conversation or campus visit.",
        content: `Subject: Thank You — [Event/Interview] — [Your Name]

Dear [Mr./Ms. Last Name],

Thank you for taking the time to [meet with me / speak at our event / interview me] on [date]. I especially appreciated learning about [specific detail from conversation].

Our discussion reinforced my interest in [role/program/opportunity]. I am excited about [next step they mentioned].

Please let me know if I can provide any additional information. I look forward to hearing from you.

Best regards,
[Your Full Name]`,
      },
      {
        id: "be-t3",
        title: "Professional inquiry",
        description: "Reach out about an internship, shadowing, or program opportunity.",
        content: `Subject: Inquiry — [Program/Opportunity Name] — [Your Name]

Dear [Mr./Ms. Last Name],

My name is [Your Name], a [grade]-grade student at Madonna High School with a strong interest in [field]. I am reaching out to learn more about [specific program or opportunity].

I have experience in [1–2 relevant skills or activities] and would welcome the chance to [shadow, intern, volunteer, learn more] this [semester/summer].

Could we schedule a short call or meeting at your convenience? I have attached my resume for reference.

Thank you for considering my request.

Respectfully,
[Your Full Name]
[Phone] | [Email]`,
      },
    ],
    practicePrompts: [
      {
        id: "be-p1",
        prompt: "Rewrite this subject line professionally: 'hey need help with stuff'",
        hint: "Include your name and the specific request.",
      },
      {
        id: "be-p2",
        prompt: "Draft a meeting request email to a teacher asking for a recommendation letter.",
      },
      {
        id: "be-p3",
        prompt: "Write a thank-you email after a job fair conversation — mention one detail from your chat.",
      },
    ],
    xpOpportunityLabel: "Earn up to 40 XP — Professional Communicator badge",
    aiTopic: "email",
  },
  {
    slug: "customer-service",
    title: "Customer Service",
    description:
      "Handle real-world service scenarios with empathy, clear communication, and problem-solving frameworks.",
    icon: "🤝",
    learningObjectives: [
      "Greet customers warmly and set a positive tone",
      "Listen actively and confirm understanding before responding",
      "Apply the HEARD framework to resolve complaints",
      "De-escalate difficult situations professionally",
    ],
    checklistSteps: [
      {
        id: "cs-1",
        title: "Learn the HEARD framework",
        description: "Hear, Empathize, Apologize, Resolve, Diagnose — your complaint playbook.",
      },
      {
        id: "cs-2",
        title: "Practice active listening",
        description: "Repeat back the issue, avoid interrupting, and note key details.",
      },
      {
        id: "cs-3",
        title: "Role-play three scenarios",
        description: "Angry customer, confused visitor, and rushed patron during peak hours.",
      },
      {
        id: "cs-4",
        title: "Know when to escalate",
        description: "Identify issues that need a manager, counselor, or supervisor.",
      },
      {
        id: "cs-5",
        title: "Follow up after resolution",
        description: "Confirm the customer is satisfied and document what happened.",
      },
      {
        id: "cs-6",
        title: "Reflect on your service shift",
        description: "What went well? What would you do differently next time?",
      },
    ],
    resources: [
      {
        id: "cs-r1",
        title: "Service Center",
        description: "Volunteer roles that build real customer-facing experience.",
        href: "/service",
      },
      {
        id: "cs-r2",
        title: "Blue Don Corner",
        description: "Spirit wear and campus store — practice retail service skills.",
        href: "/corner",
      },
      {
        id: "cs-r3",
        title: "Find Your Place",
        description: "Clubs and teams where hospitality and outreach matter.",
        href: "/find-your-place",
      },
    ],
    templates: [
      {
        id: "cs-t1",
        title: "HEARD response framework",
        description: "Step-by-step approach for complaints and frustrated customers.",
        content: `H — Hear: Let the customer explain fully without interrupting.
E — Empathize: "I understand how frustrating that must be."
A — Apologize: "I'm sorry this happened." (Not admitting fault — acknowledging feelings.)
R — Resolve: Offer a concrete solution or next step.
D — Diagnose: Note what caused the issue to prevent repeat problems.

Sample line: "I hear you — waiting 25 minutes is not acceptable. I'm sorry for the delay. Let me check your order right now and offer a [solution]."`,
      },
      {
        id: "cs-t2",
        title: "Scenario: Wrong order",
        description: "Food service or retail — customer received the wrong item.",
        content: `Customer: "This isn't what I ordered. I've been waiting forever!"

You: "Thank you for letting me know — I can see this isn't your order, and I'm sorry for the wait and the mistake. I'll get the correct item started right away and check on your original order time. Would you like to keep this item complimentary while you wait, or should I remove it from your bill?"

Follow-up: Confirm correct item delivered, thank them for patience, notify kitchen/team lead.`,
      },
      {
        id: "cs-t3",
        title: "Scenario: Upset parent at school event",
        description: "Campus volunteer or student ambassador situation.",
        content: `Parent: "Nobody told us the schedule changed. We drove an hour for nothing!"

You: "I completely understand — that would be frustrating after a long drive. I'm sorry the update didn't reach you. Let me find the current schedule and see what sessions are still open for your student. I'll also connect you with [staff contact] so this doesn't happen again."

Escalate: If emotions remain high or policy questions arise, get an adult staff member immediately.`,
      },
    ],
    practicePrompts: [
      {
        id: "cs-p1",
        prompt: "Write a HEARD response to a customer who says their online order never arrived.",
      },
      {
        id: "cs-p2",
        prompt: "List three phrases that show empathy without blaming the customer.",
        hint: "Avoid: 'That's not my department' or 'You should have...'",
      },
      {
        id: "cs-p3",
        prompt: "Role-play with a partner: one person is a rushed customer, the other practices calm acknowledgment.",
      },
    ],
    xpOpportunityLabel: "Earn up to 40 XP — Service Pro badge",
    aiTopic: "customer-service",
  },
];

export function getProfessionalSkillTrack(
  slug: string,
): ProfessionalSkillTrack | undefined {
  return PROFESSIONAL_SKILL_TRACKS.find((track) => track.slug === slug);
}

export function isProfessionalSkillSlug(slug: string): slug is ProfessionalSkillSlug {
  return PROFESSIONAL_SKILL_SLUGS.includes(slug as ProfessionalSkillSlug);
}
