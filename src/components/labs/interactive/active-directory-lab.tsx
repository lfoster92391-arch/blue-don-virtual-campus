"use client";

import { StepFlowLab } from "./step-flow-lab";

const AD_STEPS = [
  {
    id: "create-user",
    title: "Create a new user account",
    instruction:
      "Open Active Directory Users and Computers. Navigate to the Students OU and create a new user with first name, last name, and login name.",
    taskLabel: "I created user jdoe with display name Jane Doe in the Students OU.",
    hint: "Right-click the OU → New → User. Set User logon name to jdoe@campus.local.",
  },
  {
    id: "reset-password",
    title: "Reset a user password",
    instruction:
      "Locate an existing user account and reset their password. Require password change at next logon.",
    taskLabel: "I reset the password for jdoe and checked 'User must change password at next logon'.",
    hint: "Right-click user → Reset Password. Use a temporary password meeting complexity rules.",
  },
  {
    id: "join-domain",
    title: "Join a workstation to the domain",
    instruction:
      "Configure a Windows workstation to join the campus.local domain using a domain admin account.",
    taskLabel: "I joined workstation LAB-PC-04 to campus.local and verified domain membership.",
    hint: "System Properties → Change → Domain: campus.local. Reboot after successful join.",
  },
  {
    id: "group-policy",
    title: "Apply a Group Policy object",
    instruction:
      "Link a GPO to the Students OU that maps a network printer and sets a desktop wallpaper.",
    taskLabel: "I linked GPO-Student-Defaults to Students OU and ran gpupdate /force on a test PC.",
    hint: "Group Policy Management → right-click OU → Link Existing GPO. Test with gpresult /r.",
  },
];

export function ActiveDirectoryLab() {
  return (
    <StepFlowLab
      title="Active Directory Lab"
      description="Practice core AD tasks: user management, password resets, domain join, and Group Policy."
      steps={AD_STEPS}
      completionMessage="AD Lab complete — you practiced user creation, password reset, domain join, and GPO deployment."
    />
  );
}
