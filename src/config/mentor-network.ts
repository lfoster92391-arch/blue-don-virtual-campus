/**
 * Mentor Network — school-approved connections between students and mentors.
 */

import type { MentorCategory } from "@/generated/prisma/client";

export type MentorCategoryFilter = MentorCategory | "all";

export const MENTOR_CATEGORY_ORDER: MentorCategoryFilter[] = [
  "all",
  "TEACHER",
  "ALUMNI",
  "BUSINESS",
  "COLLEGE_STUDENT",
  "INDUSTRY",
];

export const MENTOR_CATEGORY_LABELS: Record<MentorCategoryFilter, string> = {
  all: "All mentors",
  TEACHER: "Teachers",
  ALUMNI: "Alumni",
  BUSINESS: "Local Businesses",
  COLLEGE_STUDENT: "College Students",
  INDUSTRY: "Industry Professionals",
};

export const MENTOR_CATEGORY_DESCRIPTIONS: Record<MentorCategory, string> = {
  TEACHER: "Madonna faculty who guide students in academics, faith, and career exploration.",
  ALUMNI: "Blue Don graduates who return to mentor the next generation.",
  BUSINESS: "Local employers and entrepreneurs connected to the Ohio Valley.",
  COLLEGE_STUDENT: "Recent graduates navigating college — close in age and experience.",
  INDUSTRY: "Professionals in healthcare, trades, technology, and more.",
};

export const MENTOR_APPROVAL_COPY = {
  profilePending:
    "Your mentor profile has been submitted. An administrator will review it before it appears in the Mentor Network.",
  profileApproved:
    "Your profile is school-approved and visible to Madonna students in the Mentor Network.",
  connectionPending:
    "Your mentorship request was sent. Campus staff will review it and connect you when approved.",
  connectionApproved:
    "Your mentorship connection was approved. Check your email for next steps from campus staff.",
  connectionDeclined:
    "This mentorship request was not approved. You may explore other mentors in the network.",
  adminProfileIntro:
    "Approve mentor profiles before they appear to students. Only school-vetted mentors are listed.",
  adminConnectionIntro:
    "Review student mentorship requests. Staff approves connections to ensure safe, appropriate matches.",
  schoolApprovedBadge: "School Approved",
  browseIntro:
    "Every mentor in this directory has been reviewed and approved by Madonna staff.",
};

export type MentorSeed = {
  id: string;
  name: string;
  email: string;
  category: MentorCategory;
  title: string;
  organization: string;
  bio: string;
  expertiseTags: string[];
  photoUrl?: string;
  status: "PENDING" | "APPROVED";
};

export const MENTOR_SEEDS: MentorSeed[] = [
  {
    id: "mentor-james-patterson",
    name: "Mr. James Patterson",
    email: "jpatterson@madonnahs.org",
    category: "TEACHER",
    title: "Engineering & Robotics Instructor",
    organization: "Madonna High School",
    bio: "Leads the Engineering Academy and FTC robotics team. Passionate about helping students discover hands-on STEM careers in manufacturing and automation.",
    expertiseTags: ["Engineering", "Robotics", "STEM", "Manufacturing"],
    status: "APPROVED",
  },
  {
    id: "mentor-elena-vasquez",
    name: "Mrs. Elena Vasquez",
    email: "evasquez@madonnahs.org",
    category: "TEACHER",
    title: "English & Journalism Teacher",
    organization: "Madonna High School",
    bio: "Advises the school newspaper and creative writing club. Helps students build communication skills for college essays, internships, and professional writing.",
    expertiseTags: ["Writing", "Journalism", "College Essays", "Communications"],
    status: "APPROVED",
  },
  {
    id: "mentor-chris-benedetti",
    name: "Chris Benedetti",
    email: "cbenedetti@example.com",
    category: "ALUMNI",
    title: "Journeyman Plumber",
    organization: "Dan's Plumbing",
    bio: "Class of 2019. Started as a summer intern at Dan's Plumbing during senior year and completed a registered apprenticeship. Happy to talk trade careers and licensing.",
    expertiseTags: ["Plumbing", "Trades", "Apprenticeship", "HVAC"],
    status: "APPROVED",
  },
  {
    id: "mentor-emily-carter",
    name: "Emily Carter, RN",
    email: "ecarter@example.com",
    category: "ALUMNI",
    title: "Registered Nurse",
    organization: "Hancock Regional Medical Center",
    bio: "Class of 2018. Studied nursing at WVU and returned to serve the Weirton community. Mentors students interested in healthcare pathways.",
    expertiseTags: ["Nursing", "Healthcare", "College Planning", "Clinical Careers"],
    status: "APPROVED",
  },
  {
    id: "mentor-dan-marovich",
    name: "Dan Marovich",
    email: "dan@dansplumbing.example.com",
    category: "BUSINESS",
    title: "Owner & Master Plumber",
    organization: "Dan's Plumbing",
    bio: "Family-owned business serving the Northern Panhandle since 1987. Offers internships, job shadowing, and apprenticeship pathways for motivated students.",
    expertiseTags: ["Small Business", "Trades", "Entrepreneurship", "Hiring"],
    status: "APPROVED",
  },
  {
    id: "mentor-megan-foster",
    name: "Megan Foster",
    email: "megan@valleycreative.example.com",
    category: "BUSINESS",
    title: "Creative Director",
    organization: "Valley Creative Agency",
    bio: "Runs a digital marketing studio in Steubenville. Mentors students interested in graphic design, social media, and building a creative portfolio.",
    expertiseTags: ["Marketing", "Design", "Freelancing", "Portfolio"],
    status: "APPROVED",
  },
  {
    id: "mentor-jordan-ellis",
    name: "Jordan Ellis",
    email: "jellis@mail.wvu.edu",
    category: "COLLEGE_STUDENT",
    title: "Business Administration Sophomore",
    organization: "West Virginia University",
    bio: "Madonna Class of 2022. First-generation college student studying finance at WVU. Can share advice on applications, scholarships, and campus life.",
    expertiseTags: ["College Life", "Finance", "Scholarships", "First-Gen"],
    status: "APPROVED",
  },
  {
    id: "mentor-patricia-nguyen",
    name: "Dr. Patricia Nguyen",
    email: "pnguyen@hancockregional.example.com",
    category: "INDUSTRY",
    title: "Chief of Staff",
    organization: "Hancock Regional Medical Center",
    bio: "Physician leader at the region's largest hospital. Partners with Madonna's Health Sciences Academy on shadow days and career panels.",
    expertiseTags: ["Healthcare Leadership", "Medicine", "Hospital Careers", "Networking"],
    status: "APPROVED",
  },
  {
    id: "mentor-robert-haines",
    name: "Robert Haines",
    email: "rhaines@tristatemfg.example.com",
    category: "INDUSTRY",
    title: "Plant Manager",
    organization: "Tri-State Manufacturing Co.",
    bio: "Oversees precision CNC machining and fabrication along the Ohio River. Advocates for skilled trades and modern manufacturing careers.",
    expertiseTags: ["Manufacturing", "CNC", "Operations", "Skilled Trades"],
    status: "APPROVED",
  },
];
