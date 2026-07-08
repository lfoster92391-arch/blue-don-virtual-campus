import type { PrismaClient } from "../src/generated/prisma/client";

import {
  seedAcademyBundle,
  type CertDef,
  type LabDef,
  type MissionDef,
  type ModuleDef,
  type SimDef,
} from "./seed-academy-content-shared";

// ─── Cybersecurity Academy ──────────────────────────────────────────────────

const CYBER_LABS: LabDef[] = [
  { id: "lab-password-security", slug: "password-security-lab", title: "Password Security Lab", description: "Audit Madonna student accounts for weak passwords and enforce campus password policy.", difficulty: "INTRODUCTORY", equipment: "Password policy checklist, Have I Been Pwned lookup" },
  { id: "lab-phishing-detection", slug: "phishing-detection-lab", title: "Phishing Detection Lab", description: "Analyze suspicious emails targeting Madonna staff and students — spot spoofed senders and malicious links.", difficulty: "INTRODUCTORY", equipment: "Sample phishing inbox (simulated)" },
  { id: "lab-network-security", slug: "network-security-lab", title: "Network Security Lab", description: "Review firewall rules, VLAN segmentation, and guest Wi-Fi isolation for the Madonna campus network.", difficulty: "INTERMEDIATE", equipment: "Firewall console (simulated), network diagram" },
  { id: "lab-incident-response", slug: "incident-response-lab", title: "Incident Response Lab", description: "Follow Madonna's IR playbook — contain, eradicate, recover, and document a simulated ransomware alert.", difficulty: "ADVANCED", equipment: "IR runbook, ticketing system" },
  { id: "lab-security-audit", slug: "security-audit-lab", title: "Security Audit Lab", description: "Conduct a full security audit of a Madonna classroom lab — checklist, findings report, and remediation plan.", difficulty: "ADVANCED", equipment: "Audit checklist, vulnerability scanner (simulated)" },
];

const CYBER_SIMS: SimDef[] = [
  { id: "sim-ethical-hacking", slug: "ethical-hacking-intro", title: "Ethical Hacking Intro Simulator", description: "Practice reconnaissance and vulnerability scanning in a controlled Madonna lab environment.", category: "STEM", sortOrder: 0 },
];

const CYBER_MODULES: ModuleDef[] = [
  { id: "module-cyber-explorer", slug: "cybersecurity-overview", title: "Cybersecurity Overview", description: "Discover defensive security careers, Madonna acceptable-use policy, and the CIA triad.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-cyber-orientation", title: "Welcome to Cybersecurity Academy" } },
  { id: "module-cyber-password", slug: "password-security-fundamentals", title: "Password Security Fundamentals", description: "Strong passwords, MFA, password managers, and Madonna account hygiene.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "password-security-lab", stepType: "GUIDED_LAB" }], assessment: { id: "assessment-cyber-password-kc", title: "Password Policy Knowledge Check", type: "KNOWLEDGE_CHECK" } },
  { id: "module-cyber-phishing", slug: "phishing-social-engineering", title: "Phishing & Social Engineering", description: "Recognize spear phishing, vishing, and pretexting attacks targeting Madonna users.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "phishing-detection-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-cyber-network", slug: "network-security-basics", title: "Network Security Basics", description: "Firewalls, VLANs, VPN, and securing Madonna's campus Wi-Fi and guest networks.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "network-security-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-cyber-ethical", slug: "ethical-hacking-intro", title: "Ethical Hacking Introduction", description: "Reconnaissance, scanning, and responsible disclosure within Madonna's authorized scope.", levelTier: "INTERMEDIATE", sortOrder: 4, simLinks: [{ simSlug: "ethical-hacking-intro", stepType: "PRACTICE_LAB" }] },
  { id: "module-cyber-incident", slug: "incident-response", title: "Incident Response", description: "NIST IR phases, Madonna escalation paths, and communication during breaches.", levelTier: "ADVANCED", sortOrder: 5, labLinks: [{ labSlug: "incident-response-lab", stepType: "CHALLENGE_LAB" }] },
  { id: "module-cyber-audit", slug: "security-audit-readiness", title: "Security Audit Readiness", description: "Prepare audit checklists, risk scoring, and remediation timelines for Madonna IT.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "security-audit-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-cyber-capstone", slug: "cyber-capstone-prep", title: "Cyber Capstone Prep", description: "Prepare for the Madonna campus security audit capstone mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Networking Academy ─────────────────────────────────────────────────────

const NET_LABS: LabDef[] = [
  { id: "lab-osi-model", slug: "osi-model-lab", title: "OSI Model Lab", description: "Map Madonna network traffic through all seven OSI layers with real campus examples.", difficulty: "INTRODUCTORY", equipment: "OSI reference chart, packet capture tool (simulated)" },
  { id: "lab-subnetting", slug: "subnetting-lab", title: "Subnetting Lab", description: "Calculate subnets for Madonna classrooms, staff VLAN, and guest network segments.", difficulty: "INTERMEDIATE", equipment: "Subnet calculator, IP addressing worksheet" },
  { id: "lab-switch-config", slug: "switch-config-lab", title: "Switch Configuration Lab", description: "Configure a 24-port managed switch for Madonna Building A classroom pods.", difficulty: "INTERMEDIATE", equipment: "Virtual switch CLI (simulated)" },
  { id: "lab-vlan", slug: "vlan-lab", title: "VLAN Lab", description: "Create and tag VLANs 10 (Students), 20 (Staff), and 30 (Guest) on Madonna core switch.", difficulty: "INTERMEDIATE", equipment: "Managed switch, patch panel diagram" },
  { id: "lab-cable-testing", slug: "cable-testing-lab", title: "Cable Testing Lab", description: "Terminate Cat6, test with cable certifier, and document Madonna MDF/IDF runs.", difficulty: "INTRODUCTORY", equipment: "Cable certifier, punch-down tool, Cat6 spool", safetyNotes: "Wear eye protection when cutting cable." },
  { id: "lab-network-design", slug: "network-design-lab", title: "Network Design Lab", description: "Design a network topology for Madonna's new STEM wing — switches, APs, and uplinks.", difficulty: "ADVANCED", equipment: "Network diagram tool, rack elevation template" },
];

const NET_SIMS: SimDef[] = [
  { id: "sim-router-config", slug: "router-config-simulator", title: "Router Configuration Simulator", description: "Configure default gateway, DHCP scope, and NAT for Madonna campus router.", category: "STEM", sortOrder: 0 },
  { id: "sim-net-troubleshoot", slug: "network-troubleshoot-simulator", title: "Network Troubleshoot Simulator", description: "Diagnose connectivity failures across Madonna classrooms using ping, traceroute, and show commands.", category: "STEM", sortOrder: 1 },
];

const NET_MODULES: ModuleDef[] = [
  { id: "module-net-explorer", slug: "networking-overview", title: "Networking Overview", description: "Explore networking careers and Madonna campus infrastructure layout.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-net-orientation", title: "Madonna Campus Network Tour" } },
  { id: "module-net-osi", slug: "osi-model-fundamentals", title: "OSI Model Fundamentals", description: "Seven layers, encapsulation, and how data moves across Madonna's LAN.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "osi-model-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-net-ip", slug: "ip-addressing-subnetting", title: "IP Addressing & Subnetting", description: "IPv4, CIDR notation, and subnet design for Madonna VLANs.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "subnetting-lab", stepType: "GUIDED_LAB" }], assessment: { id: "assessment-net-subnet-kc", title: "Subnetting Knowledge Check", type: "KNOWLEDGE_CHECK" } },
  { id: "module-net-switch", slug: "switch-configuration", title: "Switch Configuration", description: "Port settings, trunking, and PoE for Madonna access points.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "switch-config-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-net-vlan", slug: "vlan-segmentation", title: "VLAN Segmentation", description: "Isolate student, staff, and IoT traffic on Madonna switches.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "vlan-lab", stepType: "PRACTICE_LAB" }], simLinks: [{ simSlug: "router-config-simulator", stepType: "GUIDED_LAB" }] },
  { id: "module-net-cable", slug: "cable-termination-testing", title: "Cable Termination & Testing", description: "T568B wiring, punch-down, and certification for Madonna IDF runs.", levelTier: "INTERMEDIATE", sortOrder: 5, labLinks: [{ labSlug: "cable-testing-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-net-troubleshoot", slug: "network-troubleshooting", title: "Network Troubleshooting", description: "Systematic diagnosis of Madonna classroom connectivity issues.", levelTier: "ADVANCED", sortOrder: 6, simLinks: [{ simSlug: "network-troubleshoot-simulator", stepType: "CHALLENGE_LAB" }] },
  { id: "module-net-design", slug: "network-design", title: "Network Design", description: "Capacity planning, redundancy, and documentation for Madonna expansions.", levelTier: "PROFESSIONAL", sortOrder: 7, labLinks: [{ labSlug: "network-design-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-net-capstone", slug: "network-capstone-prep", title: "Network Capstone Prep", description: "Prepare for the Madonna STEM wing network design capstone.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 8 },
];

// ─── Graphic Design Academy ─────────────────────────────────────────────────

const GD_LABS: LabDef[] = [
  { id: "lab-typography", slug: "typography-lab", title: "Typography Lab", description: "Pair fonts for Madonna yearbook spreads — hierarchy, kerning, and readability.", difficulty: "INTRODUCTORY", equipment: "Adobe Illustrator or Canva Pro" },
  { id: "lab-color-theory", slug: "color-theory-lab", title: "Color Theory Lab", description: "Build Madonna Blue & Gold palettes with complementary and analogous schemes.", difficulty: "INTRODUCTORY", equipment: "Color wheel, swatch library" },
  { id: "lab-layout", slug: "layout-lab", title: "Layout Lab", description: "Design grid-based layouts for Madonna event posters and program booklets.", difficulty: "INTERMEDIATE", equipment: "InDesign or Figma" },
  { id: "lab-branding", slug: "branding-lab", title: "Branding Lab", description: "Extend Madonna Athletics brand guidelines to a club logo refresh.", difficulty: "INTERMEDIATE", equipment: "Brand style guide, vector tools" },
  { id: "lab-design-tools", slug: "design-tools-lab", title: "Design Tools Workflow Lab", description: "End-to-end workflow: sketch → vector → export for print and web.", difficulty: "INTERMEDIATE", equipment: "Illustrator, Photoshop, export presets" },
  { id: "lab-client-project", slug: "client-project-lab", title: "Client Project Lab", description: "Deliver a complete brand package for a Madonna student organization client.", difficulty: "ADVANCED", equipment: "Client brief template, presentation deck" },
];

const GD_SIMS: SimDef[] = [
  { id: "sim-adobe-workflow", slug: "adobe-workflow-simulator", title: "Adobe Workflow Simulator", description: "Walk through Madonna Athletics poster from concept to print-ready PDF.", category: "GENERAL", sortOrder: 0 },
];

const GD_MODULES: ModuleDef[] = [
  { id: "module-gd-explorer", slug: "graphic-design-overview", title: "Graphic Design Overview", description: "Visual communication careers and Madonna brand standards.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-gd-orientation", title: "Madonna Brand Identity Tour" } },
  { id: "module-gd-typography", slug: "typography-fundamentals", title: "Typography Fundamentals", description: "Type anatomy, font pairing, and readable body copy for Madonna publications.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "typography-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-gd-color", slug: "color-theory", title: "Color Theory", description: "Madonna Blue (#2F80ED), Gold accents, and accessible contrast ratios.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "color-theory-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-gd-layout", slug: "layout-composition", title: "Layout & Composition", description: "Grids, white space, and visual hierarchy for Madonna event materials.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "layout-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-gd-branding", slug: "branding-identity", title: "Branding & Identity", description: "Logo systems, style guides, and consistent Madonna Athletics visuals.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "branding-lab", stepType: "PRACTICE_LAB" }] },
  { id: "module-gd-tools", slug: "design-tools-workflow", title: "Design Tools Workflow", description: "Adobe Creative Cloud and export workflows for Madonna print shop.", levelTier: "ADVANCED", sortOrder: 5, labLinks: [{ labSlug: "design-tools-lab", stepType: "GUIDED_LAB" }], simLinks: [{ simSlug: "adobe-workflow-simulator", stepType: "PRACTICE_LAB" }] },
  { id: "module-gd-client", slug: "client-project-management", title: "Client Project Management", description: "Briefs, revisions, approvals, and delivery for Madonna club clients.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "client-project-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-gd-capstone", slug: "graphic-design-capstone-prep", title: "Graphic Design Capstone Prep", description: "Prepare portfolio and client project capstone for Madonna Homecoming campaign.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Photography Academy ────────────────────────────────────────────────────

const PHOTO_LABS: LabDef[] = [
  { id: "lab-exposure", slug: "exposure-triangle-lab", title: "Exposure Triangle Lab", description: "Balance ISO, aperture, and shutter speed for Madonna gymnasium lighting.", difficulty: "INTRODUCTORY", equipment: "DSLR or mirrorless camera, light meter" },
  { id: "lab-composition", slug: "composition-lab", title: "Composition Lab", description: "Rule of thirds, leading lines, and framing for Madonna campus photo walks.", difficulty: "INTRODUCTORY", equipment: "Camera, campus photo route map" },
  { id: "lab-lighting", slug: "lighting-lab", title: "Lighting Lab", description: "Natural and artificial lighting setups for Madonna portrait sessions.", difficulty: "INTERMEDIATE", equipment: "Reflector, speedlight, softbox" },
  { id: "lab-editing", slug: "editing-workflow-lab", title: "Editing Workflow Lab", description: "Lightroom culling, color grading, and export for Madonna yearbook submissions.", difficulty: "INTERMEDIATE", equipment: "Lightroom, calibrated monitor" },
  { id: "lab-event-photo", slug: "event-photography-lab", title: "Event Photography Lab", description: "Cover a Madonna basketball game — positioning, timing, and crowd shots.", difficulty: "ADVANCED", equipment: "Telephoto lens, monopod, media pass" },
  { id: "lab-portfolio", slug: "portfolio-lab", title: "Portfolio Lab", description: "Curate 15 best images into a Madonna Photography Academy portfolio site.", difficulty: "ADVANCED", equipment: "Portfolio template, web hosting" },
];

const PHOTO_SIMS: SimDef[] = [
  { id: "sim-camera-settings", slug: "camera-settings-simulator", title: "Camera Settings Simulator", description: "Adjust exposure settings for Madonna auditorium stage lighting scenarios.", category: "GENERAL", sortOrder: 0 },
];

const PHOTO_MODULES: ModuleDef[] = [
  { id: "module-photo-explorer", slug: "photography-overview", title: "Photography Overview", description: "Visual storytelling careers and Madonna media team opportunities.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-photo-orientation", title: "Madonna Media Team Intro" } },
  { id: "module-photo-exposure", slug: "exposure-triangle", title: "The Exposure Triangle", description: "ISO, aperture, shutter speed — master Madonna gym and outdoor light.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "exposure-triangle-lab", stepType: "GUIDED_LAB" }], simLinks: [{ simSlug: "camera-settings-simulator", stepType: "GUIDED_LAB" }] },
  { id: "module-photo-composition", slug: "composition-techniques", title: "Composition Techniques", description: "Framing Madonna athletes, architecture, and candid campus moments.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "composition-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-photo-lighting", slug: "lighting-techniques", title: "Lighting Techniques", description: "Portrait, event, and low-light strategies for Madonna productions.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "lighting-lab", stepType: "PRACTICE_LAB" }] },
  { id: "module-photo-editing", slug: "editing-workflow", title: "Editing Workflow", description: "RAW processing, batch edits, and Madonna yearbook submission standards.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "editing-workflow-lab", stepType: "GUIDED_LAB" }], assessment: { id: "assessment-photo-editing-kc", title: "Editing Standards Knowledge Check", type: "KNOWLEDGE_CHECK" } },
  { id: "module-photo-event", slug: "event-photography", title: "Event Photography", description: "Game day, theater, and graduation coverage for Madonna events.", levelTier: "ADVANCED", sortOrder: 5, labLinks: [{ labSlug: "event-photography-lab", stepType: "CHALLENGE_LAB" }] },
  { id: "module-photo-portfolio", slug: "portfolio-development", title: "Portfolio Development", description: "Curate, caption, and present a professional Madonna photography portfolio.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "portfolio-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-photo-capstone", slug: "photography-capstone-prep", title: "Photography Capstone Prep", description: "Prepare for the Madonna Homecoming portfolio capstone mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Social Media Academy ─────────────────────────────────────────────────────

const SM_LABS: LabDef[] = [
  { id: "lab-platform-strategy", slug: "platform-strategy-lab", title: "Platform Strategy Lab", description: "Choose channels and tone for Madonna Athletics vs. student club accounts.", difficulty: "INTRODUCTORY", equipment: "Platform analytics dashboards (simulated)" },
  { id: "lab-content-calendar", slug: "content-calendar-lab", title: "Content Calendar Lab", description: "Build a two-week content calendar for Madonna Homecoming week.", difficulty: "INTERMEDIATE", equipment: "Scheduling tool, content templates" },
  { id: "lab-community-mgmt", slug: "community-management-lab", title: "Community Management Lab", description: "Respond to comments, handle negative feedback, and boost Madonna school spirit.", difficulty: "INTERMEDIATE", equipment: "Social inbox simulator" },
  { id: "lab-school-campaign", slug: "school-campaign-lab", title: "School Campaign Lab", description: "Plan and execute a multi-platform Madonna academy enrollment campaign.", difficulty: "ADVANCED", equipment: "Campaign brief, asset library" },
];

const SM_SIMS: SimDef[] = [
  { id: "sim-social-analytics", slug: "social-analytics-simulator", title: "Social Analytics Simulator", description: "Analyze Madonna Athletics post performance and recommend content pivots.", category: "BUSINESS", sortOrder: 0 },
];

const SM_MODULES: ModuleDef[] = [
  { id: "module-sm-explorer", slug: "social-media-overview", title: "Social Media Overview", description: "Digital community careers and Madonna official account guidelines.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-sm-orientation", title: "Madonna Social Media Standards" } },
  { id: "module-sm-platform", slug: "platform-strategy", title: "Platform Strategy", description: "Instagram, TikTok, X, and YouTube — where Madonna audiences live.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "platform-strategy-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-sm-calendar", slug: "content-calendar-planning", title: "Content Calendar Planning", description: "Editorial calendars, posting cadence, and Madonna event tie-ins.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "content-calendar-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-sm-analytics", slug: "social-media-analytics", title: "Social Media Analytics", description: "Reach, engagement, CTR, and growth metrics for Madonna accounts.", levelTier: "INTERMEDIATE", sortOrder: 3, simLinks: [{ simSlug: "social-analytics-simulator", stepType: "PRACTICE_LAB" }] },
  { id: "module-sm-community", slug: "community-management", title: "Community Management", description: "Moderation, crisis response, and building Madonna school pride online.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "community-management-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-sm-content", slug: "content-creation", title: "Content Creation", description: "Short-form video, carousels, and stories for Madonna events.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-sm-campaign", slug: "school-campaign-execution", title: "School Campaign Execution", description: "Launch coordinated Madonna academy campaigns across all platforms.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "school-campaign-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-sm-capstone", slug: "social-media-capstone-prep", title: "Social Media Capstone Prep", description: "Prepare for the Madonna enrollment campaign capstone mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Nutrition Services Academy ─────────────────────────────────────────────

const NUTR_LABS: LabDef[] = [
  { id: "lab-food-safety", slug: "food-safety-lab", title: "Food Safety Lab", description: "HACCP principles, temperature logs, and Madonna cafeteria inspection prep.", difficulty: "INTRODUCTORY", equipment: "Thermometer, sanitizer test strips", safetyNotes: "Wash hands before handling food samples." },
  { id: "lab-meal-planning", slug: "meal-planning-lab", title: "Meal Planning Lab", description: "Design balanced weekly menus meeting Madonna district nutrition guidelines.", difficulty: "INTERMEDIATE", equipment: "USDA MyPlate chart, menu template" },
  { id: "lab-kitchen-ops", slug: "kitchen-operations-lab", title: "Kitchen Operations Lab", description: "Line setup, batch cooking, and service flow for Madonna lunch rush.", difficulty: "INTERMEDIATE", equipment: "Kitchen station map, timer" },
  { id: "lab-catering", slug: "catering-lab", title: "Event Catering Lab", description: "Plan and execute catering for a Madonna awards banquet — 150 guests.", difficulty: "ADVANCED", equipment: "Catering checklist, chafing dishes", safetyNotes: "Follow allergen labeling requirements." },
];

const NUTR_SIMS: SimDef[] = [
  { id: "sim-nutrition-label", slug: "nutrition-label-simulator", title: "Nutrition Label Simulator", description: "Read and create nutrition labels for Madonna cafeteria menu items.", category: "GENERAL", sortOrder: 0 },
];

const NUTR_MODULES: ModuleDef[] = [
  { id: "module-nutr-explorer", slug: "nutrition-services-overview", title: "Nutrition Services Overview", description: "Food service careers and Madonna cafeteria operations.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-nutr-orientation", title: "Madonna Cafeteria Tour" } },
  { id: "module-nutr-safety", slug: "food-safety-sanitation", title: "Food Safety & Sanitation", description: "ServSafe principles, cross-contamination, and Madonna health codes.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "food-safety-lab", stepType: "GUIDED_LAB" }], assessment: { id: "assessment-nutr-safety-kc", title: "Food Safety Knowledge Check", type: "KNOWLEDGE_CHECK" } },
  { id: "module-nutr-labels", slug: "nutrition-labels", title: "Nutrition Labels", description: "Calories, macros, allergens, and Madonna menu transparency.", levelTier: "FOUNDATION", sortOrder: 2, simLinks: [{ simSlug: "nutrition-label-simulator", stepType: "GUIDED_LAB" }] },
  { id: "module-nutr-meal", slug: "meal-planning", title: "Meal Planning", description: "Balanced menus, portion control, and Madonna student dietary needs.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "meal-planning-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-nutr-kitchen", slug: "kitchen-operations", title: "Kitchen Operations", description: "Prep lists, line efficiency, and Madonna 400-student lunch service.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "kitchen-operations-lab", stepType: "PRACTICE_LAB" }] },
  { id: "module-nutr-service", slug: "service-workflow", title: "Service Workflow", description: "POS systems, tray line management, and Madonna cafeteria customer service.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-nutr-catering", slug: "event-catering", title: "Event Catering", description: "Banquet planning, staffing, and execution for Madonna special events.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "catering-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-nutr-capstone", slug: "nutrition-capstone-prep", title: "Nutrition Capstone Prep", description: "Prepare for the Madonna awards banquet catering capstone.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Athletics Operations Academy ─────────────────────────────────────────────

const ATH_LABS: LabDef[] = [
  { id: "lab-game-day", slug: "game-day-ops-lab", title: "Game Day Operations Lab", description: "Pre-game checklist for Madonna home basketball — gates, programs, announcer script.", difficulty: "INTRODUCTORY", equipment: "Game day run sheet, walkie-talkies" },
  { id: "lab-equipment", slug: "equipment-management-lab", title: "Equipment Management Lab", description: "Inventory, checkout, and maintenance for Madonna athletics gear.", difficulty: "INTRODUCTORY", equipment: "Equipment room, inventory spreadsheet" },
  { id: "lab-scorekeeping", slug: "scorekeeping-lab", title: "Scorekeeping Lab", description: "Operate scoreboard, track stats, and manage game clock for Madonna basketball.", difficulty: "INTERMEDIATE", equipment: "Scoreboard console (simulated), stat sheet" },
  { id: "lab-facility", slug: "facility-setup-lab", title: "Facility Setup Lab", description: "Court setup, bleacher safety, and ADA access for Madonna gym events.", difficulty: "INTERMEDIATE", equipment: "Facility checklist, floor tape" },
  { id: "lab-tournament", slug: "tournament-lab", title: "Tournament Operations Lab", description: "Bracket management, scheduling, and logistics for Madonna invitational tournament.", difficulty: "ADVANCED", equipment: "Tournament bracket software, concession plan" },
];

const ATH_SIMS: SimDef[] = [
  { id: "sim-stats-tracker", slug: "stats-tracker-simulator", title: "Stats Tracker Simulator", description: "Record live basketball stats and generate Madonna game summary reports.", category: "GENERAL", sortOrder: 0 },
];

const ATH_MODULES: ModuleDef[] = [
  { id: "module-ath-explorer", slug: "athletics-operations-overview", title: "Athletics Operations Overview", description: "Sports management careers and Madonna Athletics department structure.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-ath-orientation", title: "Madonna Athletics Behind the Scenes" } },
  { id: "module-ath-gameday", slug: "game-day-operations", title: "Game Day Operations", description: "Pre-game, in-game, and post-game workflows for Madonna home events.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "game-day-ops-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-ath-equipment", slug: "equipment-management", title: "Equipment Management", description: "Checkout systems, uniform care, and Madonna gear room organization.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "equipment-management-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-ath-stats", slug: "stats-scorekeeping", title: "Stats & Scorekeeping", description: "Live stat tracking, scoreboard operation, and Madonna game reports.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "scorekeeping-lab", stepType: "GUIDED_LAB" }], simLinks: [{ simSlug: "stats-tracker-simulator", stepType: "PRACTICE_LAB" }] },
  { id: "module-ath-facility", slug: "facility-setup", title: "Facility Setup", description: "Gym configuration, safety checks, and crowd management for Madonna events.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "facility-setup-lab", stepType: "PRACTICE_LAB" }] },
  { id: "module-ath-media", slug: "game-day-media", title: "Game Day Media Coordination", description: "PA announcements, program ads, and Madonna Athletics social tie-ins.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-ath-tournament", slug: "tournament-operations", title: "Tournament Operations", description: "Multi-team scheduling, brackets, and Madonna invitational logistics.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "tournament-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-ath-capstone", slug: "athletics-capstone-prep", title: "Athletics Capstone Prep", description: "Prepare for the Madonna invitational tournament capstone mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Theater Production Academy ───────────────────────────────────────────────

const THEATER_LABS: LabDef[] = [
  { id: "lab-stage-mgmt", slug: "stage-management-lab", title: "Stage Management Lab", description: "Call scripts, blocking notes, and cue-to-cue rehearsal for Madonna spring musical.", difficulty: "INTRODUCTORY", equipment: "Prompt script, headset comms" },
  { id: "lab-lighting-sound", slug: "lighting-sound-lab", title: "Lighting & Sound Lab", description: "Program lighting cues and sound effects for Madonna auditorium production.", difficulty: "INTERMEDIATE", equipment: "Light board, sound console" },
  { id: "lab-set-design", slug: "set-design-lab", title: "Set Design Lab", description: "Design, build, and paint sets for Madonna's spring musical stage.", difficulty: "INTERMEDIATE", equipment: "Set drawings, power tools", safetyNotes: "Safety glasses required in shop." },
  { id: "lab-rehearsal", slug: "rehearsal-workflow-lab", title: "Rehearsal Workflow Lab", description: "Schedule and run structured rehearsals — music, blocking, tech.", difficulty: "INTERMEDIATE", equipment: "Rehearsal schedule template" },
  { id: "lab-theater-production", slug: "theater-show-production-lab", title: "Show Production Lab", description: "Full show run — cues, scene changes, and opening night for Madonna theater.", difficulty: "ADVANCED", equipment: "Show bible, run crew assignments" },
];

const THEATER_SIMS: SimDef[] = [
  { id: "sim-cue-sheet", slug: "cue-sheet-simulator", title: "Cue Sheet Simulator", description: "Build and execute lighting and sound cue sheets for Madonna productions.", category: "GENERAL", sortOrder: 0 },
];

const THEATER_MODULES: ModuleDef[] = [
  { id: "module-theater-explorer", slug: "theater-production-overview", title: "Theater Production Overview", description: "Live performance careers and Madonna Drama Club production calendar.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-theater-orientation", title: "Madonna Auditorium Tour" } },
  { id: "module-theater-stage", slug: "stage-management", title: "Stage Management", description: "Prompt books, blocking, and communication for Madonna shows.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "stage-management-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-theater-lighting", slug: "lighting-sound-design", title: "Lighting & Sound Design", description: "Cue programming, mic placement, and Madonna auditorium tech.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "lighting-sound-lab", stepType: "GUIDED_LAB" }], simLinks: [{ simSlug: "cue-sheet-simulator", stepType: "GUIDED_LAB" }] },
  { id: "module-theater-set", slug: "set-design-construction", title: "Set Design & Construction", description: "Scenic design, flats, platforms, and Madonna shop safety.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "set-design-lab", stepType: "PRACTICE_LAB" }] },
  { id: "module-theater-rehearsal", slug: "rehearsal-workflow", title: "Rehearsal Workflow", description: "Structured rehearsals from read-through to dress rehearsal.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "rehearsal-workflow-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-theater-costume", slug: "costume-props", title: "Costume & Props", description: "Wardrobe coordination, quick changes, and Madonna prop inventory.", levelTier: "ADVANCED", sortOrder: 5 },
  { id: "module-theater-show", slug: "show-production", title: "Show Production", description: "Opening night operations, run crew, and Madonna audience experience.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "theater-show-production-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-theater-capstone", slug: "theater-capstone-prep", title: "Theater Capstone Prep", description: "Prepare for the Madonna spring musical production capstone.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

// ─── Student Leadership Academy ─────────────────────────────────────────────

const LEAD_LABS: LabDef[] = [
  { id: "lab-communication", slug: "communication-lab", title: "Communication Lab", description: "Write Madonna student council announcements and lead effective meetings.", difficulty: "INTRODUCTORY", equipment: "Meeting agenda template, PA script" },
  { id: "lab-team-building", slug: "team-building-lab", title: "Team Building Lab", description: "Facilitate icebreakers and trust activities for Madonna club officers.", difficulty: "INTRODUCTORY", equipment: "Activity cards, feedback forms" },
  { id: "lab-event-planning", slug: "event-planning-lab", title: "Event Planning Lab", description: "Plan Madonna Homecoming pep rally — budget, vendors, timeline.", difficulty: "INTERMEDIATE", equipment: "Event planning checklist, budget spreadsheet" },
  { id: "lab-mentorship", slug: "mentorship-lab", title: "Mentorship Lab", description: "Pair upperclassmen mentors with Madonna freshmen transition program.", difficulty: "INTERMEDIATE", equipment: "Mentor matching form, session log" },
  { id: "lab-campus-initiative", slug: "campus-initiative-lab", title: "Campus Initiative Lab", description: "Design and pitch a student-led Madonna campus improvement project.", difficulty: "ADVANCED", equipment: "Proposal template, presentation deck" },
];

const LEAD_SIMS: SimDef[] = [
  { id: "sim-leadership-survey", slug: "leadership-survey-simulator", title: "Leadership Survey Simulator", description: "Gather student feedback and prioritize Madonna campus initiative ideas.", category: "BUSINESS", sortOrder: 0 },
];

const LEAD_MODULES: ModuleDef[] = [
  { id: "module-lead-explorer", slug: "student-leadership-overview", title: "Student Leadership Overview", description: "Governance careers and Madonna student council structure.", levelTier: "EXPLORER", sortOrder: 0, video: { id: "video-lead-orientation", title: "Madonna Student Government Intro" } },
  { id: "module-lead-communication", slug: "communication-skills", title: "Communication Skills", description: "Public speaking, active listening, and Madonna council messaging.", levelTier: "FOUNDATION", sortOrder: 1, labLinks: [{ labSlug: "communication-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-lead-team", slug: "team-building", title: "Team Building", description: "Collaboration, conflict resolution, and Madonna club officer dynamics.", levelTier: "FOUNDATION", sortOrder: 2, labLinks: [{ labSlug: "team-building-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-lead-events", slug: "event-planning", title: "Event Planning", description: "Budgets, timelines, vendors, and Madonna school event logistics.", levelTier: "INTERMEDIATE", sortOrder: 3, labLinks: [{ labSlug: "event-planning-lab", stepType: "GUIDED_LAB" }] },
  { id: "module-lead-mentorship", slug: "mentorship-programs", title: "Mentorship Programs", description: "Peer mentoring, freshman orientation, and Madonna transition support.", levelTier: "INTERMEDIATE", sortOrder: 4, labLinks: [{ labSlug: "mentorship-lab", stepType: "PRACTICE_LAB" }] },
  { id: "module-lead-governance", slug: "student-governance", title: "Student Governance", description: "Bylaws, voting procedures, and Madonna student council operations.", levelTier: "ADVANCED", sortOrder: 5, simLinks: [{ simSlug: "leadership-survey-simulator", stepType: "PRACTICE_LAB" }] },
  { id: "module-lead-initiative", slug: "campus-initiatives", title: "Campus Initiatives", description: "Proposal writing, stakeholder buy-in, and Madonna improvement projects.", levelTier: "PROFESSIONAL", sortOrder: 6, labLinks: [{ labSlug: "campus-initiative-lab", stepType: "PRACTICAL_EXAM" }] },
  { id: "module-lead-capstone", slug: "leadership-capstone-prep", title: "Leadership Capstone Prep", description: "Prepare for the Madonna campus initiative capstone mission.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 7 },
];

/** Batch 1 of 3 — Academies 6–8: Cybersecurity, Networking, Graphic Design */
export async function seedPhase15Batch1AcademyContent(prisma: PrismaClient) {
  await seedAcademyBundle(
    prisma,
    "academy-cybersecurity",
    CYBER_LABS,
    CYBER_SIMS,
    CYBER_MODULES,
    [
      { id: "mission-cyber-phishing", slug: "phishing-response-mission", title: "Phishing Response Mission", description: "Identify and report three phishing emails targeting Madonna staff inboxes.", levelTier: "FOUNDATION", objectives: ["Flag spoofed sender domains", "Document malicious links", "Submit IR ticket per Madonna policy"], labSlug: "phishing-detection-lab", sortOrder: 1 },
      { id: "mission-cyber-password", slug: "password-audit-mission", title: "Password Audit Mission", description: "Audit 10 Madonna test accounts and enforce password policy compliance.", levelTier: "INTERMEDIATE", objectives: ["Identify weak passwords", "Enable MFA recommendations", "Generate audit report"], labSlug: "password-security-lab", sortOrder: 2 },
      { id: "mission-cyber-incident", slug: "incident-response-mission", title: "Incident Response Mission", description: "Contain and document a simulated ransomware alert on a Madonna lab PC.", levelTier: "ADVANCED", objectives: ["Isolate affected machine", "Follow Madonna IR playbook", "Write post-incident report"], labSlug: "incident-response-lab", sortOrder: 3 },
      { id: "mission-cyber-capstone", slug: "security-audit-capstone", title: "Security Audit Capstone", description: "Complete a full security audit of Madonna Building B computer lab with remediation plan.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Run vulnerability scan", "Document 5+ findings", "Present remediation timeline to IT director"], labSlug: "security-audit-lab", sortOrder: 4 },
    ],
    [
      { id: "cert-cyber-foundation", slug: "cyber-foundation", title: "Cybersecurity Foundation Certificate", description: "Password security and phishing detection competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-cyber-analyst", slug: "cyber-analyst", title: "Cyber Analyst Certificate", description: "Network security and ethical hacking introduction.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-cyber-ir", slug: "cyber-incident-response", title: "Incident Response Certificate", description: "Madonna IR playbook execution.", levelTier: "ADVANCED", sortOrder: 2 },
      { id: "cert-cyber-capstone", slug: "cyber-industry-capstone", title: "Cyber Industry Capstone Certificate", description: "Security audit capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-networking",
    NET_LABS,
    NET_SIMS,
    NET_MODULES,
    [
      { id: "mission-net-subnet", slug: "subnet-calculation-mission", title: "Subnet Calculation Mission", description: "Design IP addressing for three new Madonna classrooms.", levelTier: "FOUNDATION", objectives: ["Calculate /26 subnets", "Assign gateway addresses", "Document DHCP scopes"], labSlug: "subnetting-lab", sortOrder: 1 },
      { id: "mission-net-vlan", slug: "vlan-setup-mission", title: "VLAN Setup Mission", description: "Configure VLANs 10, 20, and 30 on Madonna core switch.", levelTier: "INTERMEDIATE", objectives: ["Create VLANs", "Tag trunk ports", "Verify inter-VLAN routing"], labSlug: "vlan-lab", sortOrder: 2 },
      { id: "mission-net-troubleshoot", slug: "connectivity-troubleshoot-mission", title: "Connectivity Troubleshoot Mission", description: "Restore internet to Madonna Room 204 using systematic diagnosis.", levelTier: "ADVANCED", objectives: ["Identify failed component", "Verify cable cert", "Confirm end-to-end ping"], sortOrder: 3 },
      { id: "mission-net-capstone", slug: "network-design-capstone", title: "Network Design Capstone", description: "Design complete network topology for Madonna's new STEM wing.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Submit rack elevation diagram", "Specify switch and AP count", "Present design to IT Academy panel"], labSlug: "network-design-lab", sortOrder: 4 },
    ],
    [
      { id: "cert-net-foundation", slug: "networking-foundation", title: "Networking Foundation Certificate", description: "OSI model and subnetting competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-net-technician", slug: "network-technician", title: "Network Technician Certificate", description: "Switch, VLAN, and cable certification.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-net-professional", slug: "networking-professional", title: "Networking Professional Certificate", description: "Troubleshooting and design competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-net-capstone", slug: "networking-industry-capstone", title: "Networking Industry Capstone Certificate", description: "STEM wing network design completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-graphic-design",
    GD_LABS,
    GD_SIMS,
    GD_MODULES,
    [
      { id: "mission-gd-brand", slug: "brand-identity-mission", title: "Brand Identity Mission", description: "Refresh logo and color palette for Madonna Robotics Club.", levelTier: "FOUNDATION", objectives: ["Present 3 logo concepts", "Define color palette", "Create one-page style guide"], labSlug: "branding-lab", sortOrder: 1 },
      { id: "mission-gd-poster", slug: "poster-design-mission", title: "Poster Design Mission", description: "Design print-ready Homecoming poster for Madonna gym display.", levelTier: "INTERMEDIATE", objectives: ["Apply grid layout", "Use Madonna brand fonts", "Export 18×24 print PDF"], labSlug: "layout-lab", sortOrder: 2 },
      { id: "mission-gd-capstone", slug: "client-project-capstone", title: "Client Project Capstone", description: "Deliver full brand package for Madonna Drama Club spring musical.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Logo, poster, and social assets", "Client presentation and approval", "Hand off print-ready files"], labSlug: "client-project-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-gd-foundation", slug: "graphic-design-foundation", title: "Graphic Design Foundation Certificate", description: "Typography and color theory competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-gd-layout", slug: "layout-specialist", title: "Layout Specialist Certificate", description: "Grid-based layout and branding.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-gd-professional", slug: "graphic-design-professional", title: "Graphic Design Professional Certificate", description: "Client project delivery competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-gd-capstone", slug: "graphic-design-industry-capstone", title: "Graphic Design Industry Capstone Certificate", description: "Client project capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );
}

/** Batch 2 of 3 — Academies 9–11: Photography, Social Media, Nutrition Services */
export async function seedPhase15Batch2AcademyContent(prisma: PrismaClient) {
  await seedAcademyBundle(
    prisma,
    "academy-photography",
    PHOTO_LABS,
    PHOTO_SIMS,
    PHOTO_MODULES,
    [
      { id: "mission-photo-event", slug: "event-coverage-mission", title: "Event Coverage Mission", description: "Photograph Madonna varsity basketball game — 30 publishable images.", levelTier: "INTERMEDIATE", objectives: ["Capture action and crowd shots", "Maintain correct exposure in gym", "Deliver edited selects within 24 hours"], labSlug: "event-photography-lab", sortOrder: 1 },
      { id: "mission-photo-editing", slug: "editing-challenge-mission", title: "Editing Challenge Mission", description: "Cull and edit 50 raw images to Madonna yearbook standards.", levelTier: "ADVANCED", objectives: ["Cull to 15 keepers", "Consistent color grade", "Export web and print sizes"], labSlug: "editing-workflow-lab", sortOrder: 2 },
      { id: "mission-photo-capstone", slug: "portfolio-capstone", title: "Portfolio Capstone", description: "Build and present 15-image Madonna Homecoming portfolio.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Curate themed gallery", "Write artist statements", "Present to Photography Academy panel"], labSlug: "portfolio-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-photo-foundation", slug: "photography-foundation", title: "Photography Foundation Certificate", description: "Exposure and composition competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-photo-event", slug: "event-photographer", title: "Event Photographer Certificate", description: "Event coverage and editing workflow.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-photo-professional", slug: "photography-professional", title: "Photography Professional Certificate", description: "Portfolio development competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-photo-capstone", slug: "photography-industry-capstone", title: "Photography Industry Capstone Certificate", description: "Homecoming portfolio capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-social-media",
    SM_LABS,
    SM_SIMS,
    SM_MODULES,
    [
      { id: "mission-sm-week", slug: "week-content-mission", title: "Week of Content Mission", description: "Create and schedule 7 days of Madonna Athletics social posts.", levelTier: "FOUNDATION", objectives: ["Write 7 post captions", "Design 3 graphics", "Schedule all posts"], labSlug: "content-calendar-lab", sortOrder: 1 },
      { id: "mission-sm-engagement", slug: "engagement-response-mission", title: "Engagement Response Mission", description: "Respond to 10 simulated Madonna social comments and DMs.", levelTier: "INTERMEDIATE", objectives: ["Handle 3 negative comments professionally", "Boost 2 positive interactions", "Escalate 1 policy violation"], labSlug: "community-management-lab", sortOrder: 2 },
      { id: "mission-sm-capstone", slug: "school-campaign-capstone", title: "School Campaign Capstone", description: "Launch Madonna Academy enrollment campaign across Instagram, TikTok, and X.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Publish 10 coordinated posts", "Achieve 500+ combined reach", "Present analytics report"], labSlug: "school-campaign-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-sm-foundation", slug: "social-media-foundation", title: "Social Media Foundation Certificate", description: "Platform strategy and content calendar.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-sm-community", slug: "community-manager", title: "Community Manager Certificate", description: "Engagement and analytics competency.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-sm-professional", slug: "social-media-professional", title: "Social Media Professional Certificate", description: "Campaign execution competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-sm-capstone", slug: "social-media-industry-capstone", title: "Social Media Industry Capstone Certificate", description: "Enrollment campaign capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-nutrition-services",
    NUTR_LABS,
    NUTR_SIMS,
    NUTR_MODULES,
    [
      { id: "mission-nutr-lunch", slug: "lunch-service-mission", title: "Lunch Service Mission", description: "Run Madonna cafeteria lunch line for one service period.", levelTier: "INTERMEDIATE", objectives: ["Complete prep list on time", "Serve 400 students within window", "Log all temperature checks"], labSlug: "kitchen-operations-lab", sortOrder: 1 },
      { id: "mission-nutr-menu", slug: "menu-planning-mission", title: "Menu Planning Mission", description: "Design a balanced 5-day Madonna cafeteria menu meeting USDA guidelines.", levelTier: "INTERMEDIATE", objectives: ["Meet nutrition standards", "Include allergen labels", "Stay within budget"], labSlug: "meal-planning-lab", sortOrder: 2 },
      { id: "mission-nutr-capstone", slug: "event-catering-capstone", title: "Event Catering Capstone", description: "Cater Madonna Honors Awards Banquet for 150 guests.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Plan full menu and staffing", "Execute service flawlessly", "Pass health inspection checklist"], labSlug: "catering-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-nutr-safety", slug: "food-safety-foundation", title: "Food Safety Foundation Certificate", description: "ServSafe and sanitation competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-nutr-ops", slug: "kitchen-operations-specialist", title: "Kitchen Operations Specialist", description: "Meal planning and service workflow.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-nutr-professional", slug: "nutrition-services-professional", title: "Nutrition Services Professional Certificate", description: "Event catering competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-nutr-capstone", slug: "nutrition-industry-capstone", title: "Nutrition Industry Capstone Certificate", description: "Awards banquet catering capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );
}

/** Batch 3 of 3 — Academies 12–14: Athletics Operations, Theater Production, Student Leadership */
export async function seedPhase15Batch3AcademyContent(prisma: PrismaClient) {
  await seedAcademyBundle(
    prisma,
    "academy-athletics-operations",
    ATH_LABS,
    ATH_SIMS,
    ATH_MODULES,
    [
      { id: "mission-ath-gameday", slug: "game-day-setup-mission", title: "Game Day Setup Mission", description: "Execute full pre-game checklist for Madonna home basketball.", levelTier: "FOUNDATION", objectives: ["Open gates on time", "Distribute programs", "Test scoreboard and PA"], labSlug: "game-day-ops-lab", sortOrder: 1 },
      { id: "mission-ath-stats", slug: "stats-mission", title: "Stats Mission", description: "Track live stats for full Madonna varsity game and generate box score.", levelTier: "INTERMEDIATE", objectives: ["Record all player stats", "Operate game clock", "Publish summary within 1 hour"], labSlug: "scorekeeping-lab", sortOrder: 2 },
      { id: "mission-ath-capstone", slug: "tournament-capstone", title: "Tournament Capstone", description: "Run Madonna Invitational Basketball Tournament — 8 teams, 2 days.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Manage brackets and schedule", "Coordinate facilities and concessions", "Deliver tournament recap report"], labSlug: "tournament-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-ath-foundation", slug: "athletics-operations-foundation", title: "Athletics Operations Foundation Certificate", description: "Game day and equipment management.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-ath-stats", slug: "stats-scorekeeper", title: "Stats & Scorekeeper Certificate", description: "Live stat tracking competency.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-ath-professional", slug: "athletics-operations-professional", title: "Athletics Operations Professional Certificate", description: "Tournament operations competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-ath-capstone", slug: "athletics-industry-capstone", title: "Athletics Industry Capstone Certificate", description: "Invitational tournament capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-theater-production",
    THEATER_LABS,
    THEATER_SIMS,
    THEATER_MODULES,
    [
      { id: "mission-theater-rehearsal", slug: "rehearsal-run-mission", title: "Rehearsal Run Mission", description: "Stage-manage one full rehearsal of Madonna spring musical Act I.", levelTier: "INTERMEDIATE", objectives: ["Run call script on time", "Log blocking changes", "Coordinate cast and crew"], labSlug: "rehearsal-workflow-lab", sortOrder: 1 },
      { id: "mission-theater-tech", slug: "tech-rehearsal-mission", title: "Tech Rehearsal Mission", description: "Execute lighting and sound cues for Madonna musical tech rehearsal.", levelTier: "ADVANCED", objectives: ["Program 20+ lighting cues", "Test all mic channels", "Complete cue-to-cue run"], labSlug: "lighting-sound-lab", sortOrder: 2 },
      { id: "mission-theater-capstone", slug: "production-capstone", title: "Production Capstone", description: "Stage-manage opening night of Madonna spring musical.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Run flawless opening night", "Manage 3 scene changes under 30s", "Deliver post-show report"], labSlug: "theater-show-production-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-theater-foundation", slug: "theater-production-foundation", title: "Theater Production Foundation Certificate", description: "Stage management and lighting/sound basics.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-theater-tech", slug: "theater-tech-specialist", title: "Theater Tech Specialist Certificate", description: "Set design and rehearsal workflow.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-theater-professional", slug: "theater-production-professional", title: "Theater Production Professional Certificate", description: "Full show production competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-theater-capstone", slug: "theater-industry-capstone", title: "Theater Industry Capstone Certificate", description: "Spring musical production capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );

  await seedAcademyBundle(
    prisma,
    "academy-student-leadership",
    LEAD_LABS,
    LEAD_SIMS,
    LEAD_MODULES,
    [
      { id: "mission-lead-team", slug: "team-building-event-mission", title: "Team Building Event Mission", description: "Facilitate team-building session for Madonna student council officers.", levelTier: "FOUNDATION", objectives: ["Plan 3 activities", "Gather feedback forms", "Document officer strengths"], labSlug: "team-building-lab", sortOrder: 1 },
      { id: "mission-lead-mentor", slug: "mentorship-pairing-mission", title: "Mentorship Pairing Mission", description: "Match 10 upperclassmen mentors with Madonna freshmen.", levelTier: "INTERMEDIATE", objectives: ["Complete matching survey", "Host kickoff meeting", "Log first mentor sessions"], labSlug: "mentorship-lab", sortOrder: 2 },
      { id: "mission-lead-capstone", slug: "campus-initiative-capstone", title: "Campus Initiative Capstone", description: "Design, pitch, and launch a student-led Madonna campus improvement project.", levelTier: "INDUSTRY_CAPSTONE", objectives: ["Gather 50+ student survey responses", "Present proposal to administration", "Execute pilot phase with metrics"], labSlug: "campus-initiative-lab", sortOrder: 3 },
    ],
    [
      { id: "cert-lead-foundation", slug: "student-leadership-foundation", title: "Student Leadership Foundation Certificate", description: "Communication and team building competency.", levelTier: "FOUNDATION", sortOrder: 0 },
      { id: "cert-lead-events", slug: "event-planner", title: "Event Planner Certificate", description: "Event planning and mentorship programs.", levelTier: "INTERMEDIATE", sortOrder: 1 },
      { id: "cert-lead-professional", slug: "student-leadership-professional", title: "Student Leadership Professional Certificate", description: "Governance and campus initiative competency.", levelTier: "PROFESSIONAL", sortOrder: 2 },
      { id: "cert-lead-capstone", slug: "leadership-industry-capstone", title: "Leadership Industry Capstone Certificate", description: "Campus initiative capstone completion.", levelTier: "INDUSTRY_CAPSTONE", sortOrder: 3 },
    ],
  );
}

export async function seedPhase15AcademyContent(prisma: PrismaClient) {
  await seedPhase15Batch1AcademyContent(prisma);
  await seedPhase15Batch2AcademyContent(prisma);
  await seedPhase15Batch3AcademyContent(prisma);
}
