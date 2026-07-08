import type { StepFlowStep } from "./step-flow-lab";

export type ScaffoldLabDef = {
  title: string;
  description: string;
  steps: StepFlowStep[];
};

export const PHASE15_LAB_DEFS: Record<string, ScaffoldLabDef> = {
  "password-security-lab": {
    title: "Password Security Lab",
    description: "Audit Madonna accounts and enforce campus password policy.",
    steps: [
      { id: "policy", title: "Review password policy", instruction: "Read Madonna minimum requirements: 12 chars, mixed case, number, symbol.", taskLabel: "I documented the four policy requirements." },
      { id: "audit", title: "Audit test accounts", instruction: "Check 10 sample accounts against policy checklist.", taskLabel: "I flagged 3 accounts needing password reset." },
      { id: "mfa", title: "Recommend MFA", instruction: "Enable MFA recommendations for staff and student admin accounts.", taskLabel: "MFA rollout plan drafted for Madonna IT." },
    ],
  },
  "phishing-detection-lab": {
    title: "Phishing Detection Lab",
    description: "Analyze suspicious emails targeting Madonna staff and students.",
    steps: [
      { id: "headers", title: "Inspect email headers", instruction: "Check From, Reply-To, and SPF/DKIM for spoofing.", taskLabel: "I identified a mismatched Reply-To domain." },
      { id: "links", title: "Analyze links", instruction: "Hover over links without clicking — check for credential harvest URLs.", taskLabel: "I found a fake Madonna login page URL." },
      { id: "report", title: "Report phishing", instruction: "Forward to security@madonna.edu and submit IR ticket.", taskLabel: "Phishing report submitted per Madonna policy." },
    ],
  },
  "network-security-lab": {
    title: "Network Security Lab",
    description: "Review firewall rules and VLAN segmentation for Madonna campus.",
    steps: [
      { id: "firewall", title: "Review firewall rules", instruction: "Verify deny-by-default and allow rules for student VLAN.", taskLabel: "Firewall rules documented — no overly permissive entries." },
      { id: "vlan", title: "Check VLAN isolation", instruction: "Confirm guest VLAN 30 cannot reach staff VLAN 20.", taskLabel: "Inter-VLAN ACLs verified." },
      { id: "wifi", title: "Audit guest Wi-Fi", instruction: "Verify captive portal and bandwidth limits on Madonna-Guest SSID.", taskLabel: "Guest network isolated and rate-limited." },
    ],
  },
  "incident-response-lab": {
    title: "Incident Response Lab",
    description: "Follow Madonna's IR playbook for a simulated ransomware alert.",
    steps: [
      { id: "detect", title: "Detect and triage", instruction: "Review alert from Madonna SIEM — identify affected lab PC.", taskLabel: "Affected machine identified: Lab-B-PC-07." },
      { id: "contain", title: "Contain threat", instruction: "Disconnect from network and disable user account.", taskLabel: "Machine isolated; account disabled." },
      { id: "recover", title: "Recover and document", instruction: "Reimage from golden image and write post-incident report.", taskLabel: "PC restored; IR report filed with IT director." },
    ],
  },
  "security-audit-lab": {
    title: "Security Audit Lab",
    description: "Conduct a full security audit of a Madonna classroom lab.",
    steps: [
      { id: "scan", title: "Run vulnerability scan", instruction: "Scan all PCs in Building B lab for missing patches.", taskLabel: "Scan complete — 5 critical findings logged." },
      { id: "physical", title: "Physical security check", instruction: "Verify locked cabinets, cable management, and visitor log.", taskLabel: "Physical audit checklist completed." },
      { id: "report", title: "Remediation plan", instruction: "Prioritize findings and assign remediation timeline.", taskLabel: "Audit report with 30-day remediation plan submitted." },
    ],
  },
  "osi-model-lab": {
    title: "OSI Model Lab",
    description: "Map Madonna network traffic through all seven OSI layers.",
    steps: [
      { id: "layers", title: "Label layers 1–7", instruction: "Match Physical through Application to Madonna examples.", taskLabel: "Each layer mapped to campus network example." },
      { id: "encapsulate", title: "Trace encapsulation", instruction: "Follow HTTP request from student Chromebook to Madonna web server.", taskLabel: "Headers added at each layer documented." },
      { id: "troubleshoot", title: "Layer-based troubleshooting", instruction: "Classroom outage — which layer to check first?", taskLabel: "Started at Layer 1 (cable/link lights)." },
    ],
  },
  "subnetting-lab": {
    title: "Subnetting Lab",
    description: "Calculate subnets for Madonna classrooms and VLANs.",
    steps: [
      { id: "calculate", title: "Calculate subnets", instruction: "Divide 192.168.10.0/24 into four /26 classroom subnets.", taskLabel: "Four subnets with host ranges documented." },
      { id: "gateway", title: "Assign gateways", instruction: "Set .1 address as gateway for each subnet.", taskLabel: "Gateway addresses assigned per VLAN." },
      { id: "dhcp", title: "Configure DHCP scopes", instruction: "Define DHCP ranges excluding gateway and broadcast.", taskLabel: "DHCP scopes ready for Madonna router." },
    ],
  },
  "switch-config-lab": {
    title: "Switch Configuration Lab",
    description: "Configure a managed switch for Madonna Building A classrooms.",
    steps: [
      { id: "hostname", title: "Set hostname", instruction: "Name switch SW-BUILDING-A-01.", taskLabel: "Hostname configured." },
      { id: "ports", title: "Configure access ports", instruction: "Assign ports 1–12 to VLAN 10 (Students).", taskLabel: "Access ports set to VLAN 10." },
      { id: "trunk", title: "Configure trunk", instruction: "Set port 24 as trunk to core switch.", taskLabel: "Trunk port carrying VLANs 10, 20, 30." },
    ],
  },
  "vlan-lab": {
    title: "VLAN Lab",
    description: "Create and tag VLANs on Madonna core switch.",
    steps: [
      { id: "create", title: "Create VLANs", instruction: "Create VLAN 10 Students, 20 Staff, 30 Guest.", taskLabel: "Three VLANs created." },
      { id: "assign", title: "Assign ports", instruction: "Map classroom ports to VLAN 10, office to VLAN 20.", taskLabel: "Port assignments documented." },
      { id: "verify", title: "Verify routing", instruction: "Ping across VLANs through Madonna router.", taskLabel: "Inter-VLAN routing confirmed." },
    ],
  },
  "cable-testing-lab": {
    title: "Cable Testing Lab",
    description: "Terminate and certify Cat6 runs for Madonna IDF.",
    steps: [
      { id: "terminate", title: "Terminate cable", instruction: "Punch down both ends using T568B standard.", taskLabel: "Both ends terminated to spec." },
      { id: "test", title: "Certify cable", instruction: "Run cable certifier — check all 8 pairs.", taskLabel: "Cable passed Cat6 certification." },
      { id: "label", title: "Label and document", instruction: "Label both ends and update Madonna MDF diagram.", taskLabel: "Cable labeled PP-14 → SW-A-P12." },
    ],
  },
  "network-design-lab": {
    title: "Network Design Lab",
    description: "Design network topology for Madonna's new STEM wing.",
    steps: [
      { id: "survey", title: "Site survey", instruction: "Count classrooms, AP locations, and rack space.", taskLabel: "12 classrooms, 6 APs, 1 IDF rack planned." },
      { id: "diagram", title: "Create topology", instruction: "Draw logical and physical diagrams with uplinks.", taskLabel: "Topology diagram with redundancy paths." },
      { id: "spec", title: "Equipment spec", instruction: "List switches, APs, and fiber runs with part numbers.", taskLabel: "BOM submitted for Madonna IT review." },
    ],
  },
  "typography-lab": {
    title: "Typography Lab",
    description: "Pair fonts for Madonna yearbook spreads.",
    steps: [
      { id: "hierarchy", title: "Establish hierarchy", instruction: "Choose headline, subhead, and body fonts from Madonna brand guide.", taskLabel: "Three-level type hierarchy defined." },
      { id: "pair", title: "Pair fonts", instruction: "Combine serif headline with sans body for yearbook spread.", taskLabel: "Font pairing approved for readability." },
      { id: "kern", title: "Adjust kerning", instruction: "Fine-tune letter spacing on Madonna Athletics headline.", taskLabel: "Kerning adjusted for print output." },
    ],
  },
  "color-theory-lab": {
    title: "Color Theory Lab",
    description: "Build Madonna Blue & Gold color palettes.",
    steps: [
      { id: "primary", title: "Define primaries", instruction: "Set Madonna Blue #2F80ED and Gold #D4A017 as anchors.", taskLabel: "Primary palette locked." },
      { id: "scheme", title: "Build scheme", instruction: "Create complementary accents for event posters.", taskLabel: "5-color palette with hex codes documented." },
      { id: "contrast", title: "Check contrast", instruction: "Verify WCAG AA contrast for text on backgrounds.", taskLabel: "All combinations pass accessibility check." },
    ],
  },
  "layout-lab": {
    title: "Layout Lab",
    description: "Design grid-based layouts for Madonna event posters.",
    steps: [
      { id: "grid", title: "Set up grid", instruction: "Create 12-column grid for 18×24 poster.", taskLabel: "Grid and margins established." },
      { id: "hierarchy", title: "Place content", instruction: "Position headline, date, and Madonna logo per hierarchy.", taskLabel: "Content blocks aligned to grid." },
      { id: "export", title: "Export print PDF", instruction: "Export with bleed, crop marks, and CMYK profile.", taskLabel: "Print-ready PDF saved for Madonna print shop." },
    ],
  },
  "branding-lab": {
    title: "Branding Lab",
    description: "Extend Madonna Athletics brand to a club logo refresh.",
    steps: [
      { id: "research", title: "Brand research", instruction: "Review Madonna Athletics style guide and club history.", taskLabel: "Brand audit notes completed." },
      { id: "concepts", title: "Sketch concepts", instruction: "Create 3 logo concept sketches.", taskLabel: "Three concepts presented to client." },
      { id: "guide", title: "Style guide", instruction: "Document colors, fonts, and logo usage rules.", taskLabel: "One-page style guide delivered." },
    ],
  },
  "design-tools-lab": {
    title: "Design Tools Workflow Lab",
    description: "Sketch to vector to export for Madonna print and web.",
    steps: [
      { id: "sketch", title: "Sketch concept", instruction: "Rough layout on paper for Madonna event flyer.", taskLabel: "Approved sketch scanned." },
      { id: "vector", title: "Vectorize in Illustrator", instruction: "Build clean vector artwork with layers.", taskLabel: "Vector file with organized layers." },
      { id: "export", title: "Export assets", instruction: "Export PNG for web and PDF for Madonna print shop.", taskLabel: "Both formats delivered to client folder." },
    ],
  },
  "client-project-lab": {
    title: "Client Project Lab",
    description: "Deliver a complete brand package for a Madonna student organization.",
    steps: [
      { id: "brief", title: "Client brief", instruction: "Meet with Madonna Drama Club — define deliverables and deadline.", taskLabel: "Signed brief with scope and timeline." },
      { id: "deliver", title: "Produce assets", instruction: "Logo, poster, social templates, and program cover.", taskLabel: "All assets in client review folder." },
      { id: "present", title: "Client presentation", instruction: "Present final package and collect sign-off.", taskLabel: "Client approval received; files handed off." },
    ],
  },
  "exposure-triangle-lab": {
    title: "Exposure Triangle Lab",
    description: "Balance ISO, aperture, and shutter for Madonna gym lighting.",
    steps: [
      { id: "meter", title: "Meter the scene", instruction: "Use camera meter in Madonna gym — note low light.", taskLabel: "Baseline reading: 1/60, f/2.8, ISO 3200." },
      { id: "adjust", title: "Adjust settings", instruction: "Trade off ISO vs shutter for sharp action shots.", taskLabel: "Settled on 1/500, f/2.8, ISO 6400." },
      { id: "test", title: "Test exposures", instruction: "Shoot 5 test frames and review histogram.", taskLabel: "Exposure locked with no blown highlights." },
    ],
  },
  "composition-lab": {
    title: "Composition Lab",
    description: "Practice framing on Madonna campus photo walk.",
    steps: [
      { id: "thirds", title: "Rule of thirds", instruction: "Frame Madonna statue with subject on intersection.", taskLabel: "3 strong thirds compositions captured." },
      { id: "lines", title: "Leading lines", instruction: "Use walkway lines toward Madonna main entrance.", taskLabel: "2 leading line shots in portfolio folder." },
      { id: "critique", title: "Peer critique", instruction: "Share best 5 images with academy peer for feedback.", taskLabel: "Critique notes incorporated." },
    ],
  },
  "lighting-lab": {
    title: "Lighting Lab",
    description: "Portrait and event lighting for Madonna productions.",
    steps: [
      { id: "natural", title: "Natural light portrait", instruction: "Position subject near window — observe direction and quality.", taskLabel: "Window light portrait with soft shadows." },
      { id: "flash", title: "Speedlight setup", instruction: "Bounce flash off ceiling for Madonna yearbook headshots.", taskLabel: "Even fill with no harsh shadows." },
      { id: "gym", title: "Gym lighting", instruction: "Compensate for mixed color temperature in Madonna gym.", taskLabel: "White balance corrected in-camera." },
    ],
  },
  "editing-workflow-lab": {
    title: "Editing Workflow Lab",
    description: "Lightroom culling and grading for Madonna yearbook.",
    steps: [
      { id: "import", title: "Import and cull", instruction: "Import 100 RAW files — flag keepers with Picks.", taskLabel: "Culled to 20 keepers." },
      { id: "grade", title: "Color grade", instruction: "Apply consistent Madonna blue tone across selects.", taskLabel: "Batch preset applied and fine-tuned." },
      { id: "export", title: "Export deliverables", instruction: "Export web (2048px) and print (300dpi) versions.", taskLabel: "Files uploaded to yearbook shared drive." },
    ],
  },
  "event-photography-lab": {
    title: "Event Photography Lab",
    description: "Cover a Madonna varsity basketball game.",
    steps: [
      { id: "position", title: "Position for action", instruction: "Shoot from baseline and sideline — know the plays.", taskLabel: "Positioning plan for Q1–Q4 documented." },
      { id: "shoot", title: "Capture game", instruction: "Shoot action, reactions, and crowd — 200+ frames.", taskLabel: "250 frames captured on dual cards." },
      { id: "deliver", title: "Quick turnaround", instruction: "Deliver 10 edited selects to Madonna Athletics within 2 hours.", taskLabel: "Selects delivered to athletics@media.madonna.edu." },
    ],
  },
  "portfolio-lab": {
    title: "Portfolio Lab",
    description: "Curate 15 images for Madonna Photography Academy portfolio.",
    steps: [
      { id: "curate", title: "Curate selects", instruction: "Choose 15 best images across sports, events, and portraits.", taskLabel: "15 images with consistent quality." },
      { id: "sequence", title: "Sequence gallery", instruction: "Order images for narrative flow — opener, body, closer.", taskLabel: "Gallery sequence approved by instructor." },
      { id: "publish", title: "Publish portfolio", instruction: "Upload to Madonna portfolio site with captions.", taskLabel: "Live portfolio link shared." },
    ],
  },
  "platform-strategy-lab": {
    title: "Platform Strategy Lab",
    description: "Choose channels for Madonna Athletics vs. student clubs.",
    steps: [
      { id: "audience", title: "Map audiences", instruction: "Define who follows Madonna Athletics on each platform.", taskLabel: "Audience personas per platform documented." },
      { id: "channels", title: "Select channels", instruction: "Pick primary platforms for athletics vs. drama club.", taskLabel: "Channel strategy matrix completed." },
      { id: "tone", title: "Define tone", instruction: "Write voice guidelines — spirited for athletics, artistic for drama.", taskLabel: "Tone guide added to content calendar." },
    ],
  },
  "content-calendar-lab": {
    title: "Content Calendar Lab",
    description: "Build two-week calendar for Madonna Homecoming.",
    steps: [
      { id: "themes", title: "Plan themes", instruction: "Assign daily themes: spirit, alumni, game day, dance.", taskLabel: "14-day theme map created." },
      { id: "draft", title: "Draft posts", instruction: "Write captions and note required assets per day.", taskLabel: "14 post drafts in calendar tool." },
      { id: "schedule", title: "Schedule posts", instruction: "Queue posts for optimal Madonna audience times.", taskLabel: "All posts scheduled for review." },
    ],
  },
  "community-management-lab": {
    title: "Community Management Lab",
    description: "Respond to Madonna social comments and DMs.",
    steps: [
      { id: "positive", title: "Boost positive comments", instruction: "Reply warmly to 3 student spirit posts.", taskLabel: "Positive engagement replies posted." },
      { id: "negative", title: "Handle criticism", instruction: "Respond professionally to 2 negative comments.", taskLabel: "De-escalation responses documented." },
      { id: "escalate", title: "Escalate violations", instruction: "Flag 1 policy violation to Madonna admin.", taskLabel: "Violation escalated per social media policy." },
    ],
  },
  "school-campaign-lab": {
    title: "School Campaign Lab",
    description: "Plan Madonna academy enrollment campaign.",
    steps: [
      { id: "goal", title: "Set campaign goal", instruction: "Target 50 new academy sign-ups by Homecoming.", taskLabel: "SMART goal defined with KPIs." },
      { id: "assets", title: "Create assets", instruction: "Design graphics and write copy for 3 platforms.", taskLabel: "10 campaign assets in shared folder." },
      { id: "launch", title: "Launch and monitor", instruction: "Publish coordinated posts and track reach daily.", taskLabel: "Campaign live with daily metrics log." },
    ],
  },
  "food-safety-lab": {
    title: "Food Safety Lab",
    description: "HACCP and temperature logs for Madonna cafeteria.",
    steps: [
      { id: "temp", title: "Temperature check", instruction: "Log hot holding above 135°F and cold below 41°F.", taskLabel: "All stations within safe range." },
      { id: "sanitize", title: "Sanitizer test", instruction: "Test sanitizer concentration on prep surfaces.", taskLabel: "Sanitizer at correct PPM." },
      { id: "log", title: "Complete log", instruction: "Fill Madonna cafeteria daily safety log.", taskLabel: "Log signed and filed." },
    ],
  },
  "meal-planning-lab": {
    title: "Meal Planning Lab",
    description: "Design balanced weekly menu for Madonna cafeteria.",
    steps: [
      { id: "guidelines", title: "Review guidelines", instruction: "Check USDA school meal nutrition standards.", taskLabel: "Calorie and nutrient targets noted." },
      { id: "menu", title: "Draft menu", instruction: "Plan 5 lunch menus with protein, grain, vegetable, fruit.", taskLabel: "5-day menu meets guidelines." },
      { id: "allergens", title: "Label allergens", instruction: "Mark milk, wheat, soy, and nut items.", taskLabel: "Allergen labels on all menu items." },
    ],
  },
  "kitchen-operations-lab": {
    title: "Kitchen Operations Lab",
    description: "Line setup and service flow for Madonna lunch rush.",
    steps: [
      { id: "prep", title: "Morning prep", instruction: "Complete prep list by 10:30 AM for 11:00 service.", taskLabel: "All prep items ready on time." },
      { id: "line", title: "Open service line", instruction: "Staff stations — entree, sides, fruit, milk.", taskLabel: "Line staffed and stocked." },
      { id: "serve", title: "Serve lunch rush", instruction: "Serve 400 students within 45-minute window.", taskLabel: "Service completed with no stockouts." },
    ],
  },
  "catering-lab": {
    title: "Event Catering Lab",
    description: "Cater Madonna Honors Awards Banquet for 150 guests.",
    steps: [
      { id: "menu", title: "Plan banquet menu", instruction: "Select appetizer, entree, dessert with dietary options.", taskLabel: "Menu approved by Madonna events coordinator." },
      { id: "prep", title: "Batch prep", instruction: "Prep all items day-before with proper cooling.", taskLabel: "Prep complete; temps logged." },
      { id: "serve", title: "Execute service", instruction: "Buffet setup, service staff briefing, and breakdown.", taskLabel: "150 guests served; breakdown complete." },
    ],
  },
  "game-day-ops-lab": {
    title: "Game Day Operations Lab",
    description: "Pre-game checklist for Madonna home basketball.",
    steps: [
      { id: "gates", title: "Open gates", instruction: "Unlock entrances 90 minutes before tip-off.", taskLabel: "Gates open on schedule." },
      { id: "programs", title: "Distribute programs", instruction: "Staff program table and test card reader.", taskLabel: "Programs and concessions ready." },
      { id: "test", title: "Test systems", instruction: "Verify scoreboard, shot clock, and PA system.", taskLabel: "All systems operational." },
    ],
  },
  "equipment-management-lab": {
    title: "Equipment Management Lab",
    description: "Inventory and checkout for Madonna athletics gear.",
    steps: [
      { id: "inventory", title: "Inventory check", instruction: "Count basketballs, uniforms, and training equipment.", taskLabel: "Inventory spreadsheet updated." },
      { id: "checkout", title: "Process checkout", instruction: "Log player equipment checkout with condition notes.", taskLabel: "Checkout forms signed by 15 players." },
      { id: "maintain", title: "Maintenance log", instruction: "Flag items needing repair or replacement.", taskLabel: "3 items added to maintenance queue." },
    ],
  },
  "scorekeeping-lab": {
    title: "Scorekeeping Lab",
    description: "Operate scoreboard and track stats for Madonna basketball.",
    steps: [
      { id: "scoreboard", title: "Scoreboard setup", instruction: "Enter team names, colors, and period length.", taskLabel: "Scoreboard configured for varsity game." },
      { id: "stats", title: "Track live stats", instruction: "Record points, rebounds, assists per player.", taskLabel: "Stats sheet complete through Q2." },
      { id: "clock", title: "Manage game clock", instruction: "Start/stop clock on whistles; manage timeouts.", taskLabel: "Clock managed correctly for full half." },
    ],
  },
  "facility-setup-lab": {
    title: "Facility Setup Lab",
    description: "Court and bleacher setup for Madonna gym events.",
    steps: [
      { id: "court", title: "Court preparation", instruction: "Sweep court, set chairs for teams and officials.", taskLabel: "Court ready for warmups." },
      { id: "bleachers", title: "Bleacher safety", instruction: "Inspect bleachers, post capacity signs.", taskLabel: "Safety check passed." },
      { id: "ada", title: "ADA access", instruction: "Verify wheelchair seating and accessible routes.", taskLabel: "ADA compliance checklist complete." },
    ],
  },
  "tournament-lab": {
    title: "Tournament Operations Lab",
    description: "Run Madonna Invitational Basketball Tournament.",
    steps: [
      { id: "bracket", title: "Build bracket", instruction: "Seed 8 teams and publish bracket by Friday.", taskLabel: "Bracket live on Madonna Athletics site." },
      { id: "schedule", title: "Game schedule", instruction: "Assign court times across 2-day tournament.", taskLabel: "Schedule distributed to all coaches." },
      { id: "ops", title: "Day-of operations", instruction: "Coordinate refs, scorekeepers, and concessions.", taskLabel: "Tournament day run sheet executed." },
    ],
  },
  "stage-management-lab": {
    title: "Stage Management Lab",
    description: "Call scripts and blocking for Madonna spring musical.",
    steps: [
      { id: "script", title: "Prepare prompt script", instruction: "Mark all cues and blocking in Madonna musical script.", taskLabel: "Prompt script ready for rehearsal." },
      { id: "call", title: "Run a call", instruction: "Call 'Places' and cue scene transitions.", taskLabel: "Clean call for Act I Scene 3." },
      { id: "log", title: "Log changes", instruction: "Record blocking changes from director.", taskLabel: "Change log updated in show bible." },
    ],
  },
  "lighting-sound-lab": {
    title: "Lighting & Sound Lab",
    description: "Program cues for Madonna auditorium production.",
    steps: [
      { id: "hang", title: "Check hang", instruction: "Verify all lights and mics from plot.", taskLabel: "Hang matches lighting plot." },
      { id: "program", title: "Program cues", instruction: "Record 10 lighting cues on ETC board.", taskLabel: "10 cues saved and labeled." },
      { id: "sound", title: "Sound check", instruction: "Set levels for 6 wireless mics.", taskLabel: "All mics clear with no feedback." },
    ],
  },
  "set-design-lab": {
    title: "Set Design Lab",
    description: "Design and build sets for Madonna spring musical.",
    steps: [
      { id: "design", title: "Design flats", instruction: "Draw elevation for main street scene.", taskLabel: "Set drawings approved by director." },
      { id: "build", title: "Build flats", instruction: "Construct and prime 4 flats in Madonna shop.", taskLabel: "Flats built square and stable." },
      { id: "paint", title: "Paint scenery", instruction: "Apply base coat and detail painting.", taskLabel: "Scenery ready for load-in." },
    ],
  },
  "rehearsal-workflow-lab": {
    title: "Rehearsal Workflow Lab",
    description: "Schedule and run structured Madonna musical rehearsals.",
    steps: [
      { id: "schedule", title: "Build schedule", instruction: "Plan 4-week rehearsal calendar — music, blocking, tech.", taskLabel: "Rehearsal schedule posted to cast." },
      { id: "run", title: "Run rehearsal", instruction: "Start on time, manage breaks, end with notes.", taskLabel: "2-hour rehearsal completed on schedule." },
      { id: "notes", title: "Distribute notes", instruction: "Email cast notes within 24 hours.", taskLabel: "Rehearsal notes sent to full company." },
    ],
  },
  "theater-show-production-lab": {
    title: "Show Production Lab",
    description: "Full show run for Madonna spring musical opening night.",
    steps: [
      { id: "preshow", title: "Pre-show check", instruction: "Verify all departments 30 min before curtain.", taskLabel: "All departments at standby." },
      { id: "show", title: "Run the show", instruction: "Call all cues — lights, sound, fly, deck.", taskLabel: "Opening night completed without hold." },
      { id: "post", title: "Post-show report", instruction: "Document issues and celebrate wins with crew.", taskLabel: "Post-show report filed." },
    ],
  },
  "communication-lab": {
    title: "Communication Lab",
    description: "Write announcements and lead Madonna student council meetings.",
    steps: [
      { id: "announce", title: "Draft announcement", instruction: "Write PA announcement for Madonna pep rally.", taskLabel: "Announcement approved by advisor." },
      { id: "agenda", title: "Meeting agenda", instruction: "Prepare agenda with time limits per topic.", taskLabel: "Agenda sent 24 hours before meeting." },
      { id: "facilitate", title: "Facilitate meeting", instruction: "Run 30-minute council meeting — stay on time.", taskLabel: "Meeting adjourned with action items logged." },
    ],
  },
  "team-building-lab": {
    title: "Team Building Lab",
    description: "Facilitate activities for Madonna club officers.",
    steps: [
      { id: "plan", title: "Plan activities", instruction: "Select 3 icebreakers appropriate for 12 officers.", taskLabel: "Activity plan with timing." },
      { id: "facilitate", title: "Run session", instruction: "Lead 45-minute team-building session.", taskLabel: "Session completed with active participation." },
      { id: "debrief", title: "Debrief", instruction: "Collect feedback and identify team strengths.", taskLabel: "Feedback forms summarized." },
    ],
  },
  "event-planning-lab": {
    title: "Event Planning Lab",
    description: "Plan Madonna Homecoming pep rally.",
    steps: [
      { id: "budget", title: "Set budget", instruction: "Allocate funds for sound, decorations, and refreshments.", taskLabel: "Budget spreadsheet approved." },
      { id: "vendors", title: "Book vendors", instruction: "Confirm DJ, facilities, and security.", taskLabel: "All vendors contracted." },
      { id: "timeline", title: "Event timeline", instruction: "Build minute-by-minute run of show.", taskLabel: "Run of show shared with all stakeholders." },
    ],
  },
  "mentorship-lab": {
    title: "Mentorship Lab",
    description: "Pair mentors with Madonna freshmen.",
    steps: [
      { id: "survey", title: "Matching survey", instruction: "Distribute interest surveys to mentors and freshmen.", taskLabel: "20 surveys collected." },
      { id: "match", title: "Create pairs", instruction: "Match based on interests and schedules.", taskLabel: "10 mentor-freshman pairs created." },
      { id: "kickoff", title: "Kickoff meeting", instruction: "Host orientation for all pairs.", taskLabel: "Kickoff held; first sessions scheduled." },
    ],
  },
  "campus-initiative-lab": {
    title: "Campus Initiative Lab",
    description: "Design and pitch a Madonna campus improvement project.",
    steps: [
      { id: "research", title: "Gather feedback", instruction: "Survey 50 students on campus improvement priorities.", taskLabel: "Survey results analyzed — top 3 issues identified." },
      { id: "proposal", title: "Write proposal", instruction: "Draft proposal with budget, timeline, and impact.", taskLabel: "Proposal submitted to Madonna administration." },
      { id: "pilot", title: "Launch pilot", instruction: "Execute 2-week pilot and measure outcomes.", taskLabel: "Pilot metrics documented for capstone presentation." },
    ],
  },
};
