import type { PrismaClient } from "../src/generated/prisma/client";

import {
  seedAcademyBundle,
  type CertDef,
  type LabDef,
  type MissionDef,
  type ModuleDef,
  type SimDef,
} from "./seed-academy-content-shared";

// ─── IT Academy ─────────────────────────────────────────────────────────────

const IT_LABS: LabDef[] = [
  {
    id: "lab-active-directory",
    slug: "active-directory-basics",
    title: "Active Directory Lab",
    description: "Interactive simulator — create users, reset passwords, join domain, and apply Group Policy.",
    difficulty: "INTERMEDIATE",
    equipment: "Virtual AD sandbox",
  },
  {
    id: "lab-chromebook-repair",
    slug: "chromebook-repair-lab",
    title: "Chromebook Repair Lab",
    description: "Virtual repair steps — diagnose power, hard reset, recovery mode, and ticket documentation.",
    difficulty: "INTRODUCTORY",
    equipment: "Loaner Chromebooks, USB recovery drive",
  },
  {
    id: "lab-google-workspace",
    slug: "google-workspace-lab",
    title: "Google Workspace Lab",
    description: "Practice user provisioning, group assignment, and shared drive access.",
    difficulty: "INTRODUCTORY",
    equipment: "Google Admin Console (simulated)",
  },
  {
    id: "lab-network-rack",
    slug: "network-rack-lab",
    title: "Network Rack Lab",
    description: "Interactive rack — install switch, router, firewall, AP, cable, and troubleshoot connectivity.",
    difficulty: "INTERMEDIATE",
    equipment: "Virtual rack, patch cables, PoE switch",
  },
  {
    id: "lab-help-desk",
    slug: "help-desk-lab",
    title: "Help Desk Lab",
    description: "Interactive ticket workflow with category, priority triage, and AI scoring placeholder.",
    difficulty: "INTRODUCTORY",
    equipment: "Service desk portal (simulated)",
  },
];

const IT_SIMS: SimDef[] = [
  {
    id: "sim-network-rack",
    slug: "network-rack-simulator",
    title: "Network Rack Simulator",
    description: "Place devices in rack units, patch cables, configure VLANs, and test connectivity.",
    category: "STEM",
    sortOrder: 1,
  },
];

const IT_MODULES: ModuleDef[] = [
  {
    id: "module-it-explorer",
    slug: "it-academy-orientation",
    title: "IT Academy Orientation",
    description: "Discover IT career pathways, help desk culture, and campus technology standards.",
    levelTier: "EXPLORER",
    sortOrder: 0,
    video: { id: "video-it-orientation", title: "Welcome to IT Academy" },
  },
  {
    id: "module-it-chromebook",
    slug: "chromebook-support-fundamentals",
    title: "Chromebook Support Fundamentals",
    description: "Help desk workflows, device diagnostics, and user support best practices.",
    levelTier: "FOUNDATION",
    sortOrder: 1,
    video: { id: "video-it-chromebook-intro", title: "Chromebook Repair Overview" },
    assessment: { id: "assessment-it-chromebook-kc", title: "Chromebook Knowledge Check", type: "KNOWLEDGE_CHECK" },
    labLinks: [
      { labSlug: "chromebook-repair-lab", stepType: "GUIDED_LAB" },
      { labSlug: "active-directory-basics", stepType: "PRACTICE_LAB" },
    ],
  },
  {
    id: "module-it-google",
    slug: "google-workspace-essentials",
    title: "Google Workspace Essentials",
    description: "Admin Console basics, user lifecycle, groups, and shared drives.",
    levelTier: "FOUNDATION",
    sortOrder: 2,
    labLinks: [{ labSlug: "google-workspace-lab", stepType: "GUIDED_LAB" }],
  },
  {
    id: "module-it-ad",
    slug: "active-directory-administration",
    title: "Active Directory Administration",
    description: "Manage users, OUs, passwords, domain join, and Group Policy.",
    levelTier: "INTERMEDIATE",
    sortOrder: 3,
    labLinks: [{ labSlug: "active-directory-basics", stepType: "GUIDED_LAB" }],
  },
  {
    id: "module-it-network",
    slug: "network-infrastructure-basics",
    title: "Network Infrastructure Basics",
    description: "Switches, routers, firewalls, APs, VLANs, and cabling fundamentals.",
    levelTier: "INTERMEDIATE",
    sortOrder: 4,
    labLinks: [{ labSlug: "network-rack-lab", stepType: "GUIDED_LAB" }],
    simLinks: [{ simSlug: "network-rack-simulator", stepType: "PRACTICE_LAB" }],
  },
  {
    id: "module-it-helpdesk",
    slug: "help-desk-operations",
    title: "Help Desk Operations",
    description: "Ticket triage, SLA awareness, escalation paths, and customer communication.",
    levelTier: "ADVANCED",
    sortOrder: 5,
    labLinks: [{ labSlug: "help-desk-lab", stepType: "GUIDED_LAB" }],
    assessment: { id: "assessment-it-helpdesk-exam", title: "Help Desk Practical Exam", type: "PRACTICAL_EXAM" },
  },
  {
    id: "module-it-enterprise",
    slug: "enterprise-device-management",
    title: "Enterprise Device Management",
    description: "MDM policies, asset tracking, imaging, and fleet deployment.",
    levelTier: "PROFESSIONAL",
    sortOrder: 6,
  },
  {
    id: "module-it-capstone-mod",
    slug: "it-capstone-readiness",
    title: "IT Capstone Readiness",
    description: "Prepare for the Enterprise Support Mission and professional certification.",
    levelTier: "INDUSTRY_CAPSTONE",
    sortOrder: 7,
  },
];

// ─── Broadcast Academy ──────────────────────────────────────────────────────

const BROADCAST_LABS: LabDef[] = [
  {
    id: "lab-broadcast-studio",
    slug: "broadcast-studio",
    title: "Broadcast Studio Lab",
    description: "Practice live production, audio mixing, camera operation, and on-air workflows.",
    difficulty: "INTRODUCTORY",
    equipment: "Cameras, audio board, lighting kit, switcher",
    safetyNotes: "Secure cables and check tripod stability before recording.",
  },
];

const BROADCAST_MODULES: ModuleDef[] = [
  { id: "module-bc-explorer", slug: "broadcast-overview", title: "Broadcast Overview", description: "Introduction to live production roles and studio safety.", levelTier: "EXPLORER", sortOrder: 0 },
  { id: "module-bc-camera", slug: "camera-operation", title: "Camera Operation", description: "Framing, focus, white balance, and shot composition.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "broadcast-studio", stepType: "GUIDED_LAB" }] },
  { id: "module-bc-audio", slug: "audio-basics", title: "Audio Basics", description: "Microphones, levels, monitoring, and board patching.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "broadcast-studio", stepType: "PRACTICE_LAB" }] },
  { id: "module-bc-lighting", slug: "lighting-for-video", title: "Lighting for Video", description: "Three-point lighting, color temperature, and set design.", levelTier: "INTERMEDIATE", sortOrder: 3 },
  { id: "module-bc-streaming", slug: "streaming-setup", title: "Streaming Setup", description: "Encoder config, bitrate, platforms, and stream health monitoring.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "broadcast-studio", stepType: "CHALLENGE_LAB" }] },
  { id: "module-bc-workflow", slug: "production-workflow", title: "Production Workflow", description: "Pre-production, rehearsal, live execution, and post-production.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-bc-live", slug: "live-segment-production", title: "Live Segment Production", description: "Multi-camera switching, lower-thirds, and live direction.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "broadcast-studio", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-bc-capstone", slug: "broadcast-capstone-prep", title: "Broadcast Capstone Prep", description: "Prepare portfolio reel and capstone broadcast mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Robotics Academy ───────────────────────────────────────────────────────

const ROBOTICS_LABS: LabDef[] = [
  {
    id: "lab-robotics-prototyping",
    slug: "robotics-prototyping",
    title: "Robotics Prototyping Lab",
    description: "Build and test robot chassis, sensors, and control systems.",
    difficulty: "INTERMEDIATE",
    equipment: "Arduino kits, 3D printer, soldering stations",
    safetyNotes: "Eye protection required when soldering.",
  },
  {
    id: "lab-wiring-panel",
    slug: "wiring-panel-lab",
    title: "Wiring Panel Lab",
    description: "Practice motor controllers, sensor wiring, and power distribution.",
    difficulty: "INTERMEDIATE",
    equipment: "Breadboards, wire kit, multimeter",
  },
  {
    id: "lab-competition-arena",
    slug: "competition-arena-lab",
    title: "Competition Arena Lab",
    description: "Test autonomous and tele-op routines on a competition field.",
    difficulty: "ADVANCED",
    equipment: "Competition field, game elements",
  },
];

const ROBOTICS_SIMS: SimDef[] = [
  { id: "sim-circuit-builder", slug: "circuit-builder", title: "Circuit Builder Simulator", description: "Design and test virtual sensor circuits.", category: "STEM", sortOrder: 0 },
  { id: "sim-robot-build", slug: "robot-build-simulator", title: "Robot Build Simulator", description: "Assemble chassis and drive train virtually.", category: "STEM", sortOrder: 1 },
  { id: "sim-gear-ratio", slug: "gear-ratio-simulator", title: "Gear Ratio Simulator", description: "Calculate and configure drive train ratios.", category: "STEM", sortOrder: 2 },
  { id: "sim-robot-id", slug: "robot-identification", title: "Robot Identification Simulator", description: "Identify robot subsystems and components.", category: "STEM", sortOrder: 3 },
];

const ROBOTICS_MODULES: ModuleDef[] = [
  { id: "module-robo-explorer", slug: "robotics-explorer", title: "Robotics Explorer", description: "Discover robotics careers, safety, and competition pathways.", levelTier: "EXPLORER", sortOrder: 0 },
  { id: "module-robo-fundamentals", slug: "robot-fundamentals", title: "Robot Fundamentals", description: "Mechanisms, power, control systems, and engineering notebook.", levelTier: "FOUNDATION", sortOrder: 1, simLinks: [{ simSlug: "robot-identification", stepType: "GUIDED_LAB" }] },
  { id: "module-robo-mechanical", slug: "mechanical-systems", title: "Mechanical Systems", description: "Chassis design, gear trains, and structural integrity.", levelTier: "FOUNDATION", sortOrder: 2, simLinks: [{ simSlug: "robot-build-simulator", stepType: "GUIDED_LAB" }, { simSlug: "gear-ratio-simulator", stepType: "PRACTICE_LAB" }] },
  { id: "module-robo-electrical", slug: "electrical-wiring", title: "Electrical & Wiring", description: "Motor controllers, power distribution, and sensor wiring.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "wiring-panel-lab", stepType: "GUIDED_LAB" }], simLinks: [{ simSlug: "circuit-builder", stepType: "GUIDED_LAB" }] },
  { id: "module-robo-sensors", slug: "sensor-integration", title: "Sensor Integration & Control", description: "Wire sensors, read data, and program autonomous behaviors.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "robotics-prototyping", stepType: "PRACTICE_LAB" }] },
  { id: "module-robo-programming", slug: "programming-robots", title: "Programming Robots", description: "Autonomous routines, PID tuning, and state machines.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-robo-competition", slug: "competition-robotics", title: "Competition Robotics", description: "Game strategy, alliance coordination, and match execution.", levelTier: "ADVANCED", sortOrder: 6, labLinks: [{ labSlug: "competition-arena-lab", stepType: "CHALLENGE_LAB" }] },
  { id: "module-robo-ai", slug: "ai-robotics", title: "AI Robotics", description: "Computer vision, ML inference, and adaptive behaviors.", levelTier: "PROFESSIONAL", sortOrder: 7 },
  { id: "module-robo-capstone", slug: "robotics-industry-capstone", title: "Industry Capstone Prep", description: "Prepare for autonomous navigation and industry portfolio.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 8 },
];

// ─── Business & Marketing Academy ───────────────────────────────────────────

const BUSINESS_LABS: LabDef[] = [
  {
    id: "lab-campaign-studio",
    slug: "campaign-studio-lab",
    title: "Campaign Studio Lab",
    description: "Plan and execute multi-channel marketing campaigns.",
    difficulty: "INTERMEDIATE",
    equipment: "Design tools, social schedulers, analytics dashboards",
  },
];

const BUSINESS_SIMS: SimDef[] = [
  { id: "sim-campaign-studio", slug: "campaign-studio", title: "Campaign Studio Simulator", description: "Plan campaigns from brief to asset checklist.", category: "BUSINESS", sortOrder: 0 },
  { id: "sim-analytics", slug: "analytics-dashboard", title: "Analytics Dashboard Simulator", description: "Review metrics and optimize campaign performance.", category: "BUSINESS", sortOrder: 1 },
];

const BUSINESS_MODULES: ModuleDef[] = [
  { id: "module-bm-explorer", slug: "business-marketing-overview", title: "Business & Marketing Overview", description: "Entrepreneurship, brand building, and campaign fundamentals.", levelTier: "EXPLORER", sortOrder: 0 },
  { id: "module-bm-brand", slug: "brand-identity", title: "Brand Identity", description: "Mission, values, voice, and visual identity systems.", levelTier: "FOUNDATION", sortOrder: 1 },
  { id: "module-bm-logo", slug: "logo-design", title: "Logo Design", description: "Sketch, vectorize, and present logo concepts.", levelTier: "FOUNDATION", sortOrder: 2, simLinks: [{ simSlug: "campaign-studio", stepType: "GUIDED_LAB" }] },
  { id: "module-bm-campaign", slug: "campaign-planning", title: "Campaign Planning", description: "Audience research, messaging, channels, and KPIs.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "campaign-studio-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-bm-social", slug: "social-media-marketing", title: "Social Media Marketing", description: "Content calendars, platform strategy, and engagement.", levelTier: "INTERMEDIATE", sortOrder: 4 },
  { id: "module-bm-video", slug: "video-marketing", title: "Video Marketing", description: "Storyboards, short-form video, and ad creative.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-bm-web", slug: "website-analytics", title: "Website & Analytics", description: "Landing pages, conversion tracking, and reporting.", levelTier: "ADVANCED", sortOrder: 6, simLinks: [{ simSlug: "analytics-dashboard", stepType: "PRACTICE_LAB" }] },
  { id: "module-bm-workflow", slug: "marketing-department-workflow", title: "Marketing Department Workflow", description: "Briefs, approvals, asset handoffs, and launch checklists.", levelTier: "PROFESSIONAL", sortOrder: 7 },
  { id: "module-bm-capstone", slug: "full-campaign-capstone", title: "Full Campaign Capstone", description: "Execute a complete campaign across all channels.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 8 },
];

// ─── Cricut & Makers Academy ────────────────────────────────────────────────

const CRICUT_LABS: LabDef[] = [
  {
    id: "lab-cricut-studio",
    slug: "cricut-maker-studio",
    title: "Cricut Maker Studio Lab",
    description: "Material selection, blade settings, and weeding techniques.",
    difficulty: "INTRODUCTORY",
    equipment: "Cricut Maker, heat press, vinyl and cardstock",
  },
  { id: "lab-material", slug: "material-lab", title: "Material Lab", description: "Compare vinyl, HTV, cardstock, and specialty materials.", difficulty: "INTRODUCTORY", equipment: "Material samples, LightGrip mat" },
  { id: "lab-blade", slug: "blade-lab", title: "Blade Lab", description: "Inspect, test, and tune blade pressure settings.", difficulty: "INTERMEDIATE", equipment: "Fine-Point and Deep-Cut blades" },
  { id: "lab-heat-press", slug: "heat-press-lab", title: "Heat Press Lab", description: "Temperature, time, and pressure for HTV application.", difficulty: "INTERMEDIATE", equipment: "Heat press, Teflon sheets, HTV" },
  { id: "lab-production", slug: "production-lab", title: "Production Lab", description: "Batch workflow for high-volume orders like senior shirts.", difficulty: "ADVANCED", equipment: "Multiple mats, production queue" },
];

const CRICUT_SIMS: SimDef[] = [
  { id: "sim-cricut-ds", slug: "cricut-design-space", title: "Cricut Design Space Simulator", description: "Canvas setup, design import, and cut preparation.", category: "GENERAL", sortOrder: 0 },
];

const CRICUT_MODULES: ModuleDef[] = [
  { id: "module-cricut-explorer", slug: "maker-space-orientation", title: "Maker Space Orientation", description: "Safety, tools, and Cricut ecosystem overview.", levelTier: "EXPLORER", sortOrder: 0 },
  { id: "module-cricut-design", slug: "design-to-cut-workflow", title: "Design-to-Cut Workflow", description: "Vector design, material prep, and production workflow.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "cricut-maker-studio", stepType: "GUIDED_LAB" }], simLinks: [{ simSlug: "cricut-design-space", stepType: "GUIDED_LAB" }] },
  { id: "module-cricut-vinyl", slug: "vinyl-htv-basics", title: "Vinyl & HTV Basics", description: "Material types, weeding, and application techniques.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "material-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-cricut-ds", slug: "design-space-mastery", title: "Cricut Design Space Mastery", description: "Advanced tools, layers, offsets, and print-then-cut.", levelTier: "INTERMEDIATE", sortOrder: 3, simLinks: [{ simSlug: "cricut-design-space", stepType: "PRACTICE_LAB" }] },
  { id: "module-cricut-weeding", slug: "weeding-assembly", title: "Weeding & Assembly", description: "Precision weeding, layering, and transfer tape.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "cricut-maker-studio", stepType: "PRACTICE_LAB" }] },
  { id: "module-cricut-blade", slug: "blade-material-lab-module", title: "Blade & Material Lab", description: "Blade selection, pressure tuning, and test cuts.", levelTier: "ADVANCED", sortOrder: 5, labLinks: [{ labSlug: "blade-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-cricut-heat", slug: "heat-press-module", title: "Heat Press Lab Module", description: "HTV application on apparel with quality checks.", levelTier: "ADVANCED", sortOrder: 6, labLinks: [{ labSlug: "heat-press-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-cricut-production", slug: "production-workflow", title: "Production Workflow", description: "Batching, QC, packaging, and client delivery.", levelTier: "PROFESSIONAL", sortOrder: 7, labLinks: [{ labSlug: "production-lab", stepType: "CHALLENGE_LAB" }] },
  { id: "module-cricut-capstone", slug: "senior-shirts-capstone-prep", title: "Senior Shirts Capstone Prep", description: "Prepare for the 25 senior shirts production mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 8 },
];

export async function seedPhase14AcademyContent(prisma: PrismaClient) {
  await seedAcademyBundle(
    prisma,
    "academy-it",
    IT_LABS,
    IT_SIMS,
    IT_MODULES,
    [
      {
        id: "mission-it-helpdesk-triage",
        slug: "help-desk-triage-mission",
        title: "Help Desk Triage Mission",
        description: "Resolve a queue of mixed support tickets within SLA targets.",
        levelTier: "ADVANCED",
        objectives: ["Triage 5 tickets with correct priority", "Document resolutions", "Achieve 80+ AI score average"],
        labSlug: "help-desk-lab",
        sortOrder: 1,
      },
      {
        id: "mission-it-network",
        slug: "network-troubleshoot-mission",
        title: "Network Troubleshoot Mission",
        description: "Restore connectivity in a classroom by tracing rack-to-desk cabling.",
        levelTier: "INTERMEDIATE",
        objectives: ["Identify failed patch cable", "Verify VLAN assignment", "Confirm DHCP lease"],
        labSlug: "network-rack-lab",
        sortOrder: 2,
      },
      {
        id: "mission-it-capstone",
        slug: "enterprise-support-mission",
        title: "Enterprise Support Mission",
        description: "Resolve a multi-ticket help desk scenario across AD, networking, and device repair.",
        levelTier: "INDUSTRY_CAPSTONE",
        objectives: ["Triage three simulated support tickets", "Configure a new user in Active Directory", "Document resolution in the service desk"],
        labSlug: "help-desk-lab",
        sortOrder: 3,
      },
    ],
    [
      { id: "cert-it-help-desk", slug: "it-help-desk-foundation", title: "IT Help Desk Foundation Certificate", description: "Chromebook support and help desk fundamentals.", levelTier: "FOUNDATION", sortOrder: 0, requirements: "Complete Chromebook module and pass knowledge check." },
      { id: "cert-it-google", slug: "it-google-workspace", title: "Google Workspace Admin Certificate", description: "User provisioning and group management.", levelTier: "FOUNDATION", sortOrder: 1 },
      { id: "cert-it-network", slug: "it-network-technician", title: "Network Technician Certificate", description: "Rack cabling and VLAN troubleshooting.", levelTier: "INTERMEDIATE", sortOrder: 2 },
      { id: "cert-it-professional", slug: "it-professional", title: "IT Professional Certificate", description: "Enterprise device management competency.", levelTier: "PROFESSIONAL", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-broadcast",
    BROADCAST_LABS,
    [],
    BROADCAST_MODULES,
    [
      {
        id: "mission-bc-segment",
        slug: "produce-a-segment",
        title: "Produce a Segment Mission",
        description: "Write, rehearse, and record a 3-minute campus news segment.",
        levelTier: "INTERMEDIATE",
        objectives: ["Write script with B-roll notes", "Record clean audio", "Export edited segment"],
        labSlug: "broadcast-studio",
        sortOrder: 1,
      },
      {
        id: "mission-bc-stream",
        slug: "live-stream-setup",
        title: "Live Stream Setup Mission",
        description: "Configure encoder, test stream health, and go live for 5 minutes.",
        levelTier: "ADVANCED",
        objectives: ["Configure RTMP endpoint", "Run test stream", "Monitor chat and bitrate"],
        labSlug: "broadcast-studio",
        sortOrder: 2,
      },
      {
        id: "mission-broadcast-capstone",
        slug: "live-broadcast-mission",
        title: "Live Broadcast Mission",
        description: "Produce a live campus event broadcast with multi-camera switching.",
        levelTier: "PROFESSIONAL",
        objectives: ["Set up cameras and audio board", "Run a 10-minute live segment", "Export recording to portfolio"],
        labSlug: "broadcast-studio",
        sortOrder: 3,
      },
    ],
    [
      { id: "cert-bc-foundation", slug: "broadcast-production-foundation", title: "Broadcast Production Foundation", description: "Camera, audio, and studio safety.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-bc-pro", slug: "broadcast-professional", title: "Broadcast Professional Certificate", description: "Live segment and streaming competency.", levelTier: "PROFESSIONAL", sortOrder: 1 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-robotics",
    ROBOTICS_LABS,
    ROBOTICS_SIMS,
    ROBOTICS_MODULES,
    [
      { id: "mission-robo-id", slug: "robot-identification-mission", title: "Robot Identification Mission", description: "Label all subsystems on a competition robot.", levelTier: "FOUNDATION", objectives: ["Identify drive train", "Label intake mechanism", "Map control ports"], sortOrder: 1 },
      { id: "mission-robo-build", slug: "build-simulator-mission", title: "Build Simulator Mission", description: "Complete virtual chassis and drive train assembly.", levelTier: "FOUNDATION", objectives: ["Assemble chassis", "Mount motors", "Verify wheel spin"], sortOrder: 2 },
      { id: "mission-robo-gear", slug: "gear-ratio-mission", title: "Gear Ratio Mission", description: "Configure drive train for target speed.", levelTier: "INTERMEDIATE", objectives: ["Calculate ratio", "Select gear combo", "Hit speed target"], sortOrder: 3 },
      { id: "mission-robo-wiring", slug: "wiring-panel-mission", title: "Wiring Panel Mission", description: "Wire motor controllers and sensors on practice panel.", levelTier: "INTERMEDIATE", objectives: ["Wire motor controller", "Connect sensors", "Pass continuity test"], labSlug: "wiring-panel-lab", sortOrder: 4 },
      { id: "mission-robo-arena", slug: "competition-arena-mission", title: "Competition Arena Mission", description: "Score points in a simulated match using autonomous + tele-op.", levelTier: "ADVANCED", objectives: ["Run autonomous routine", "Tele-op scoring", "Document strategy"], labSlug: "competition-arena-lab", sortOrder: 5 },
      { id: "mission-robotics-capstone", slug: "autonomous-navigation-mission", title: "Autonomous Navigation Mission", description: "Program a robot to navigate an obstacle course using integrated sensors.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Calibrate distance and line sensors", "Implement obstacle avoidance logic", "Complete the course within time limit"], labSlug: "competition-arena-lab", sortOrder: 6 },
    ],
    [
      { id: "cert-robotics-tech", slug: "robotics-technician", title: "Robotics Technician Certificate", description: "Sensor integration and control competency.", levelTier: "INTERMEDIATE", sortOrder: 0 },
      { id: "cert-robo-competition", slug: "robotics-competition", title: "Competition Robotics Certificate", description: "Arena strategy and match execution.", levelTier: "ADVANCED", sortOrder: 1 },
      { id: "cert-robo-industry", slug: "robotics-industry-capstone", title: "Robotics Industry Capstone Certificate", description: "Autonomous navigation and portfolio.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 2 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-business-marketing",
    BUSINESS_LABS,
    BUSINESS_SIMS,
    BUSINESS_MODULES,
    [
      { id: "mission-bm-logo", slug: "logo-design-mission", title: "Logo Design Mission", description: "Create and present three logo concepts for a campus club.", levelTier: "FOUNDATION", objectives: ["Sketch 3 concepts", "Vectorize chosen logo", "Present brand rationale"], sortOrder: 1 },
      { id: "mission-bm-flyer", slug: "flyer-campaign-mission", title: "Flyer Campaign Mission", description: "Design and print event flyers with consistent branding.", levelTier: "INTERMEDIATE", objectives: ["Design print-ready flyer", "Apply brand colors", "Distribute to target audience"], sortOrder: 2 },
      { id: "mission-bm-social", slug: "social-post-mission", title: "Social Post Mission", description: "Create a week of social content for an academy event.", levelTier: "INTERMEDIATE", objectives: ["Write 5 posts", "Schedule publish times", "Track engagement"], sortOrder: 3 },
      { id: "mission-bm-video", slug: "video-campaign-mission", title: "Video Campaign Mission", description: "Produce a 60-second promotional video.", levelTier: "ADVANCED", objectives: ["Write script", "Shoot B-roll", "Edit and publish"], sortOrder: 4 },
      { id: "mission-bm-website", slug: "website-launch-mission", title: "Website Launch Mission", description: "Build a landing page and connect analytics.", levelTier: "ADVANCED", objectives: ["Publish landing page", "Add conversion tracking", "Verify mobile layout"], sortOrder: 5 },
      { id: "mission-bm-analytics", slug: "analytics-review-mission", title: "Analytics Review Mission", description: "Analyze campaign performance and recommend optimizations.", levelTier: "PROFESSIONAL", objectives: ["Review 30-day metrics", "Identify top channel", "Present recommendations"], sortOrder: 6 },
      { id: "mission-bm-capstone", slug: "full-campaign-capstone-mission", title: "Full Campaign Capstone Mission", description: "Execute logo, flyer, social, video, web, and analytics for one client.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Deliver all 5 asset types", "Launch coordinated campaign", "Present analytics report"], sortOrder: 7 },
    ],
    [
      { id: "cert-bm-foundation", slug: "marketing-foundation", title: "Marketing Foundation Certificate", description: "Brand identity and logo design.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-bm-campaign", slug: "campaign-specialist", title: "Campaign Specialist Certificate", description: "Multi-channel campaign execution.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-bm-pro", slug: "marketing-professional", title: "Marketing Professional Certificate", description: "Department workflow and analytics.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-bm-capstone", slug: "marketing-industry-capstone", title: "Marketing Industry Capstone Certificate", description: "Full campaign delivery.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-cricut-makers",
    CRICUT_LABS,
    CRICUT_SIMS,
    CRICUT_MODULES,
    [
      { id: "mission-cricut-capstone", slug: "campus-signage-mission", title: "Campus Signage Mission", description: "Design and produce branded signage for a campus event.", levelTier: "PROFESSIONAL", objectives: ["Create event branding", "Produce vinyl signage", "Install and photograph for portfolio"], labSlug: "cricut-maker-studio", sortOrder: 1 },
      {
        id: "mission-cricut-shirts",
        slug: "senior-shirts-order-mission",
        title: "Senior Shirts Order Mission",
        description: "Fulfill a 25-shirt HTV order with batch production and QC.",
        levelTier: "INDUSTRY_CAPSTONE",
        objectives: ["Batch 25 designs on mats", "Cut and weed all transfers", "Heat press and QC every shirt", "Package for delivery"],
        labSlug: "production-lab",
        sortOrder: 2,
      },
    ],
    [
      { id: "cert-cricut-maker", slug: "maker-foundation", title: "Maker Foundation Certificate", description: "Design-to-cut workflow competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-cricut-production", slug: "cricut-production-specialist", title: "Cricut Production Specialist", description: "Batch production and QC.", levelTier: "PROFESSIONAL", sortOrder: 1 },
      { id: "cert-cricut-industry", slug: "maker-industry-capstone", title: "Maker Industry Capstone Certificate", description: "Senior shirts order mission completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 2 },
    ],
  );
}
