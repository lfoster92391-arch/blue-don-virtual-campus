import type { ComponentType } from "react";

import { ActiveDirectoryLab } from "./active-directory-lab";
import { HelpDeskLab } from "./help-desk-lab";
import { PHASE15_LAB_DEFS } from "./phase15-lab-defs";
import { StepFlowLab, type StepFlowStep } from "./step-flow-lab";

const CHROMEBOOK_STEPS: StepFlowStep[] = [
  {
    id: "diagnose",
    title: "Diagnose power issue",
    instruction: "Check charger LED, battery health, and power button response.",
    taskLabel: "I verified charger connection and confirmed battery is not fully depleted.",
  },
  {
    id: "hard-reset",
    title: "Perform hard reset",
    instruction: "Hold Refresh + Power for 10 seconds to force reboot.",
    taskLabel: "I performed a hard reset and the device powered on.",
  },
  {
    id: "recovery",
    title: "Enter recovery mode if needed",
    instruction: "Use Esc + Refresh + Power to access Chrome OS recovery.",
    taskLabel: "I accessed recovery mode and verified OS integrity (or documented need for reimage).",
  },
  {
    id: "document",
    title: "Document repair in ticket",
    instruction: "Log steps taken, parts used, and return device to student.",
    taskLabel: "I closed the ticket with resolution notes and student sign-off.",
  },
];

const NETWORK_RACK_STEPS: StepFlowStep[] = [
  {
    id: "rack-switch",
    title: "Install core switch",
    instruction: "Mount 24-port managed switch in rack unit 12. Connect power and management cable.",
    taskLabel: "Core switch installed and powered on with link lights active.",
  },
  {
    id: "rack-router",
    title: "Connect router and firewall",
    instruction: "Place router at U10, firewall at U11. Connect WAN and LAN interfaces.",
    taskLabel: "Router WAN connected; firewall rules applied for student VLAN.",
  },
  {
    id: "rack-ap",
    title: "Cable access point",
    instruction: "Run Cat6 from switch PoE port to ceiling AP. Verify SSID broadcast.",
    taskLabel: "AP-Campus-01 online with correct VLAN tagging.",
  },
  {
    id: "troubleshoot",
    title: "Troubleshoot connectivity",
    instruction: "A classroom reports no internet. Trace cable from patch panel to switch port.",
    taskLabel: "I found a loose patch cable on port 14 and restored connectivity.",
    hint: "Check link lights, VLAN assignment, and DHCP scope.",
  },
];

const GOOGLE_WORKSPACE_STEPS: StepFlowStep[] = [
  {
    id: "create-user",
    title: "Create Google Workspace user",
    instruction: "Admin Console → Users → Add user with organizational unit assignment.",
    taskLabel: "I created student@campus.org in the Students OU.",
  },
  {
    id: "groups",
    title: "Assign groups and licenses",
    instruction: "Add user to academy groups and assign Education Standard license.",
    taskLabel: "User added to IT-Academy group with license assigned.",
  },
  {
    id: "drive-share",
    title: "Configure shared drive access",
    instruction: "Grant view access to academy shared drive folder.",
    taskLabel: "Student can access IT Academy resources shared drive.",
  },
];

const BROADCAST_STUDIO_STEPS: StepFlowStep[] = [
  {
    id: "camera-setup",
    title: "Set up cameras",
    instruction: "Mount tripods, white balance, and frame shots for 3-camera setup.",
    taskLabel: "Cameras A, B, C framed and focused on set positions.",
  },
  {
    id: "audio-mix",
    title: "Configure audio board",
    instruction: "Patch mics to channels 1–4, set levels, enable monitor mix.",
    taskLabel: "Audio levels set with no clipping on host mic.",
  },
  {
    id: "switcher",
    title: "Program live switch",
    instruction: "Rehearse camera cuts and lower-thirds for 5-minute segment.",
    taskLabel: "I ran a clean rehearsal with smooth transitions.",
  },
];

const CRICUT_STEPS: Record<string, StepFlowStep[]> = {
  "material-lab": [
    { id: "select", title: "Select material", instruction: "Choose vinyl type for indoor signage.", taskLabel: "Selected permanent vinyl, 12×12 sheet." },
    { id: "mat", title: "Prepare mat", instruction: "Apply material to LightGrip mat aligned to grid.", taskLabel: "Material loaded with no bubbles." },
    { id: "settings", title: "Load settings", instruction: "Select Vinyl — Permanent in Design Space.", taskLabel: "Correct material and pressure selected." },
  ],
  "blade-lab": [
    { id: "inspect", title: "Inspect blade", instruction: "Check Fine-Point blade for debris.", taskLabel: "Blade clean and seated in Clamp B." },
    { id: "test", title: "Test cut", instruction: "Run test square on scrap vinyl.", taskLabel: "Clean cut through vinyl, not mat." },
    { id: "adjust", title: "Adjust pressure", instruction: "Increase/decrease pressure if needed.", taskLabel: "Blade pressure optimized for material." },
  ],
  "heat-press-lab": [
    { id: "temp", title: "Set temperature", instruction: "HTV requires 305°F for 15 seconds.", taskLabel: "Press preheated to correct temperature." },
    { id: "press", title: "Apply HTV", instruction: "Cover with Teflon sheet, press with firm pressure.", taskLabel: "HTV bonded with no peeling edges." },
    { id: "peel", title: "Peel carrier", instruction: "Warm peel carrier sheet at 45° angle.", taskLabel: "Clean peel with full adhesion." },
  ],
  "production-lab": [
    { id: "batch", title: "Batch designs", instruction: "Arrange 25 senior shirt designs on mat layout.", taskLabel: "Designs nested efficiently for minimal waste." },
    { id: "cut", title: "Production cut", instruction: "Run cuts in batches by size (S, M, L, XL).", taskLabel: "All 25 HTV transfers cut successfully." },
    { id: "press-batch", title: "Heat press batch", instruction: "Press shirts in production order with QC checks.", taskLabel: "25 shirts pressed, weeded, and folded for delivery." },
  ],
};

function ScaffoldLab({ steps, title, description }: { steps: StepFlowStep[]; title: string; description: string }) {
  return (
    <StepFlowLab
      title={title}
      description={description}
      steps={steps}
    />
  );
}

export const INTERACTIVE_LABS: Record<string, ComponentType> = {
  "active-directory-basics": ActiveDirectoryLab,
  "help-desk-lab": HelpDeskLab,
  "chromebook-repair-lab": () => (
    <ScaffoldLab
      title="Chromebook Repair Lab"
      description="Virtual repair workflow — diagnose, reset, recover, and document."
      steps={CHROMEBOOK_STEPS}
    />
  ),
  "network-rack-lab": () => (
    <ScaffoldLab
      title="Network Rack Lab"
      description="Interactive rack simulation — install switch, router, firewall, AP, and troubleshoot cabling."
      steps={NETWORK_RACK_STEPS}
    />
  ),
  "google-workspace-lab": () => (
    <ScaffoldLab
      title="Google Workspace Lab"
      description="Practice user provisioning, groups, and shared drive access."
      steps={GOOGLE_WORKSPACE_STEPS}
    />
  ),
  "broadcast-studio": () => (
    <ScaffoldLab
      title="Broadcast Studio Lab"
      description="Camera, audio, and live switcher rehearsal for production segments."
      steps={BROADCAST_STUDIO_STEPS}
    />
  ),
  "material-lab": () => (
    <ScaffoldLab title="Material Lab" description="Select and prepare vinyl and HTV materials." steps={CRICUT_STEPS["material-lab"]} />
  ),
  "blade-lab": () => (
    <ScaffoldLab title="Blade Lab" description="Inspect, test, and tune Cricut blade settings." steps={CRICUT_STEPS["blade-lab"]} />
  ),
  "heat-press-lab": () => (
    <ScaffoldLab title="Heat Press Lab" description="Apply HTV with correct temperature and peel technique." steps={CRICUT_STEPS["heat-press-lab"]} />
  ),
  "production-lab": () => (
    <ScaffoldLab title="Production Lab" description="Batch production workflow for the 25 senior shirts order." steps={CRICUT_STEPS["production-lab"]} />
  ),
  ...Object.fromEntries(
    Object.entries(PHASE15_LAB_DEFS).map(([slug, def]) => [
      slug,
      () => <ScaffoldLab title={def.title} description={def.description} steps={def.steps} />,
    ]),
  ),
};

export function getInteractiveLab(slug: string): ComponentType | null {
  return INTERACTIVE_LABS[slug] ?? null;
}
