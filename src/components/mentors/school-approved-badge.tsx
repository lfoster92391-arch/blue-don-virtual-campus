import { ShieldCheck } from "lucide-react";

import { MENTOR_APPROVAL_COPY } from "@/config/mentor-network";

export function SchoolApprovedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#2E8B57]/10 px-2 py-0.5 text-xs font-medium text-[#2E8B57]">
      <ShieldCheck className="size-3" />
      {MENTOR_APPROVAL_COPY.schoolApprovedBadge}
    </span>
  );
}
