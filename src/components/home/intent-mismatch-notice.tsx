import { intentMismatchMessage, type LoginIntent } from "@/config/login-audience";
import type { CampusRole } from "@/config/roles";

export function IntentMismatchNotice({
  intent,
  role,
}: {
  intent: LoginIntent | null;
  role: CampusRole;
}) {
  if (!intent) {
    return null;
  }

  const message = intentMismatchMessage(intent, role);
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      className="rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-3 text-sm text-[#0A2342] dark:text-white"
    >
      {message}
    </p>
  );
}
