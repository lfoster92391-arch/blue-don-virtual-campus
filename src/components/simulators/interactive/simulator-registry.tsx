import type { ComponentType } from "react";

import { StepFlowLab, type StepFlowStep } from "@/components/labs/interactive/step-flow-lab";

function makeSim(title: string, description: string, steps: StepFlowStep[]) {
  return function Sim() {
    return <StepFlowLab title={title} description={description} steps={steps} />;
  };
}

export const INTERACTIVE_SIMULATORS: Record<string, ComponentType> = {
  "network-rack-simulator": makeSim(
    "Network Rack Simulator",
    "Place and cable switch, router, firewall, and access point in a virtual rack.",
    [
      { id: "1", title: "Rack layout", instruction: "Assign U positions for each device.", taskLabel: "Devices placed in correct rack units." },
      { id: "2", title: "Patch cabling", instruction: "Connect devices with correct cable types.", taskLabel: "All uplinks and PoE runs connected." },
      { id: "3", title: "VLAN config", instruction: "Tag student and staff VLANs on switch ports.", taskLabel: "VLANs 10 and 20 configured on access ports." },
      { id: "4", title: "Connectivity test", instruction: "Ping gateway from test workstation.", taskLabel: "End-to-end connectivity verified." },
    ],
  ),
  "cricut-design-space": makeSim(
    "Cricut Design Space Simulator",
    "Walk through canvas setup, design import, and cut preparation.",
    [
      { id: "1", title: "New project", instruction: "Create canvas sized for target material.", taskLabel: "Canvas set to 11.5 × 11.5 in." },
      { id: "2", title: "Import design", instruction: "Upload SVG or use text tool for name decal.", taskLabel: "Design placed and sized correctly." },
      { id: "3", title: "Attach & prepare", instruction: "Attach layers and mirror for HTV if needed.", taskLabel: "Design ready to Make with correct settings." },
    ],
  ),
  "robot-build-simulator": makeSim(
    "Robot Build Simulator",
    "Assemble a competition robot chassis and mount drive train.",
    [
      { id: "1", title: "Chassis assembly", instruction: "Bolt frame rails and cross members.", taskLabel: "Chassis square and rigid." },
      { id: "2", title: "Motor mount", instruction: "Install drive motors with correct gear ratio.", taskLabel: "Motors mounted with 36:1 reduction." },
      { id: "3", title: "Wheel attach", instruction: "Install omni or traction wheels.", taskLabel: "All wheels spin freely." },
    ],
  ),
  "gear-ratio-simulator": makeSim(
    "Gear Ratio Simulator",
    "Calculate and configure drive train gear ratios for speed vs torque.",
    [
      { id: "1", title: "Calculate ratio", instruction: "Given 12T pinion and 36T gear, find ratio.", taskLabel: "Ratio = 3:1 reduction calculated." },
      { id: "2", title: "Predict speed", instruction: "Estimate wheel RPM at motor 6000 RPM.", taskLabel: "Output RPM computed correctly." },
      { id: "3", title: "Apply config", instruction: "Select gear combo for 15 in/s target.", taskLabel: "Gear configuration meets speed target." },
    ],
  ),
  "robot-identification": makeSim(
    "Robot Identification Simulator",
    "Identify robot subsystems: drive, intake, lift, and control board.",
    [
      { id: "1", title: "Drive train", instruction: "Label motors, gears, and wheels.", taskLabel: "Drive subsystem correctly identified." },
      { id: "2", title: "Intake", instruction: "Identify roller, belt, or claw mechanism.", taskLabel: "Intake type and motor labeled." },
      { id: "3", title: "Control", instruction: "Locate brain/RC and sensor ports.", taskLabel: "Control system mapped." },
    ],
  ),
  "campaign-studio": makeSim(
    "Campaign Studio Simulator",
    "Plan a multi-channel marketing campaign from brief to launch.",
    [
      { id: "1", title: "Campaign brief", instruction: "Define audience, goal, and KPIs.", taskLabel: "Brief completed with SMART goals." },
      { id: "2", title: "Asset checklist", instruction: "List logo, flyer, social, video, web assets.", taskLabel: "All five asset types planned." },
      { id: "3", title: "Timeline", instruction: "Schedule publish dates across channels.", taskLabel: "Campaign calendar drafted." },
    ],
  ),
  "analytics-dashboard": makeSim(
    "Analytics Dashboard Simulator",
    "Review campaign metrics and recommend optimizations.",
    [
      { id: "1", title: "Review impressions", instruction: "Compare reach across social channels.", taskLabel: "Top channel identified." },
      { id: "2", title: "Conversion rate", instruction: "Calculate CTR and landing page conversions.", taskLabel: "Conversion funnel analyzed." },
      { id: "3", title: "Recommendations", instruction: "Suggest budget reallocation.", taskLabel: "Data-driven recommendation documented." },
    ],
  ),
  "circuit-builder": makeSim(
    "Circuit Builder Simulator",
    "Design and test virtual sensor circuits before physical build.",
    [
      { id: "1", title: "Power rail", instruction: "Connect 5V and GND to breadboard.", taskLabel: "Power distribution verified." },
      { id: "2", title: "Sensor wiring", instruction: "Wire ultrasonic sensor to GPIO pins.", taskLabel: "Trigger and echo pins connected." },
      { id: "3", title: "Test read", instruction: "Simulate distance reading output.", taskLabel: "Sensor returns expected values." },
    ],
  ),
  "ethical-hacking-intro": makeSim(
    "Ethical Hacking Intro Simulator",
    "Practice reconnaissance and vulnerability scanning in Madonna's authorized lab scope.",
    [
      { id: "1", title: "Define scope", instruction: "Confirm written authorization from Madonna IT for lab subnet 10.10.50.0/24.", taskLabel: "Scope letter signed — testing limited to lab VLAN." },
      { id: "2", title: "Reconnaissance", instruction: "Run passive scan to identify hosts on Madonna lab network.", taskLabel: "12 hosts discovered — documented in engagement notes." },
      { id: "3", title: "Vulnerability scan", instruction: "Run simulated scanner against authorized Madonna lab workstations.", taskLabel: "Scan complete — findings logged without exploitation." },
      { id: "4", title: "Responsible disclosure", instruction: "Draft findings report for Madonna IT director with remediation steps.", taskLabel: "Report submitted per Madonna responsible disclosure policy." },
    ],
  ),
  "router-config-simulator": makeSim(
    "Router Configuration Simulator",
    "Configure default gateway, DHCP scope, and NAT for Madonna campus router.",
    [
      { id: "1", title: "Interface setup", instruction: "Configure WAN and LAN interfaces on Madonna core router.", taskLabel: "WAN IP assigned — LAN gateway set to 10.10.0.1." },
      { id: "2", title: "DHCP scope", instruction: "Create DHCP pool for Madonna student VLAN 10 (10.10.10.100–200).", taskLabel: "DHCP scope active with correct gateway and DNS." },
      { id: "3", title: "NAT configuration", instruction: "Enable NAT overload for Madonna student internet access.", taskLabel: "NAT verified — student devices reach internet." },
      { id: "4", title: "Save and test", instruction: "Save config and ping 8.8.8.8 from Madonna test Chromebook.", taskLabel: "End-to-end connectivity confirmed." },
    ],
  ),
  "network-troubleshoot-simulator": makeSim(
    "Network Troubleshoot Simulator",
    "Diagnose connectivity failures across Madonna classrooms.",
    [
      { id: "1", title: "Gather symptoms", instruction: "Room 204 reports no internet — gather details from Madonna teacher.", taskLabel: "Symptoms documented — entire room affected, wired and Wi-Fi." },
      { id: "2", title: "Layer 1 check", instruction: "Verify link lights on Madonna IDF patch panel port 14.", taskLabel: "Link light off — suspected cable or port failure." },
      { id: "3", title: "Cable cert", instruction: "Run cable certifier on Run 204-A — found open on pair 3.", taskLabel: "Faulty cable identified — replacement scheduled." },
      { id: "4", title: "Verify fix", instruction: "Replace cable, confirm ping to Madonna gateway and internet.", taskLabel: "Room 204 restored — end-to-end ping successful." },
    ],
  ),
  "adobe-workflow-simulator": makeSim(
    "Adobe Workflow Simulator",
    "Walk through Madonna Athletics poster from concept to print-ready PDF.",
    [
      { id: "1", title: "New document", instruction: "Create 18×24 in document with Madonna bleed and safety margins.", taskLabel: "Document set up with correct dimensions and guides." },
      { id: "2", title: "Place assets", instruction: "Import Madonna logo, athlete photo, and brand fonts.", taskLabel: "Assets placed on grid with proper clear space." },
      { id: "3", title: "Design pass", instruction: "Apply Madonna Blue headline, Gold accents, and event details.", taskLabel: "Poster design matches Madonna brand standards." },
      { id: "4", title: "Export PDF", instruction: "Export print-ready CMYK PDF with bleed for Madonna print shop.", taskLabel: "PDF passes preflight — ready for Homecoming print run." },
    ],
  ),
  "camera-settings-simulator": makeSim(
    "Camera Settings Simulator",
    "Adjust exposure for Madonna auditorium stage lighting scenarios.",
    [
      { id: "1", title: "Low light stage", instruction: "Set ISO, aperture, shutter for dimly lit Madonna musical scene.", taskLabel: "Settings: ISO 3200, f/2.8, 1/125 — properly exposed." },
      { id: "2", title: "Spotlight solo", instruction: "Compensate for bright spotlight on single performer.", taskLabel: "Exposure compensation -1 EV — no blown highlights." },
      { id: "3", title: "Full stage wash", instruction: "Balance exposure for full-stage lighting during finale.", taskLabel: "Even exposure across entire stage." },
    ],
  ),
  "social-analytics-simulator": makeSim(
    "Social Analytics Simulator",
    "Analyze Madonna Athletics post performance and recommend content pivots.",
    [
      { id: "1", title: "Review reach", instruction: "Compare Instagram vs TikTok reach for Madonna game highlights.", taskLabel: "TikTok reach 3x higher for video content." },
      { id: "2", title: "Engagement rate", instruction: "Calculate engagement rate on top 5 Madonna Athletics posts.", taskLabel: "Average engagement 4.2% — above school benchmark." },
      { id: "3", title: "Recommend pivot", instruction: "Recommend content strategy shift based on data.", taskLabel: "Recommendation: increase TikTok game clips by 40%." },
    ],
  ),
  "nutrition-label-simulator": makeSim(
    "Nutrition Label Simulator",
    "Read and create nutrition labels for Madonna cafeteria menu items.",
    [
      { id: "1", title: "Read a label", instruction: "Interpret nutrition facts on Madonna chicken wrap label.", taskLabel: "Calories, protein, and sodium documented." },
      { id: "2", title: "Check allergens", instruction: "Identify wheat and dairy allergens on cafeteria items.", taskLabel: "Allergen icons applied to 5 menu items." },
      { id: "3", title: "Create label", instruction: "Build nutrition label for new Madonna salad bar item.", taskLabel: "Label meets FDA formatting requirements." },
    ],
  ),
  "stats-tracker-simulator": makeSim(
    "Stats Tracker Simulator",
    "Record live basketball stats and generate Madonna game summary reports.",
    [
      { id: "1", title: "Enter roster", instruction: "Load Madonna varsity roster with jersey numbers.", taskLabel: "15 players entered in stat tracker." },
      { id: "2", title: "Track Q1 stats", instruction: "Record points, rebounds, assists for first quarter.", taskLabel: "Q1 stats complete — no entry errors." },
      { id: "3", title: "Generate report", instruction: "Export box score and game summary for Madonna Athletics.", taskLabel: "Box score published to athletics site." },
    ],
  ),
  "cue-sheet-simulator": makeSim(
    "Cue Sheet Simulator",
    "Build and execute lighting and sound cue sheets for Madonna productions.",
    [
      { id: "1", title: "Build cue list", instruction: "List 15 lighting and 10 sound cues for Act I.", taskLabel: "Cue sheet drafted with trigger descriptions." },
      { id: "2", title: "Program board", instruction: "Enter lighting cues on ETC board with fade times.", taskLabel: "All cues programmed and labeled." },
      { id: "3", title: "Cue-to-cue run", instruction: "Execute cue-to-cue without actors — verify timing.", taskLabel: "Cue-to-cue complete — 2 timing adjustments noted." },
    ],
  ),
  "leadership-survey-simulator": makeSim(
    "Leadership Survey Simulator",
    "Gather student feedback and prioritize Madonna campus initiative ideas.",
    [
      { id: "1", title: "Design survey", instruction: "Create 10-question survey on campus improvement priorities.", taskLabel: "Survey approved by student council advisor." },
      { id: "2", title: "Collect responses", instruction: "Distribute survey — target 50+ Madonna student responses.", taskLabel: "62 responses collected." },
      { id: "3", title: "Prioritize ideas", instruction: "Rank top 3 initiatives by vote count and feasibility.", taskLabel: "Top initiative: upgraded cafeteria seating (38 votes)." },
    ],
  ),
};

export function getInteractiveSimulator(slug: string): ComponentType | null {
  return INTERACTIVE_SIMULATORS[slug] ?? null;
}
