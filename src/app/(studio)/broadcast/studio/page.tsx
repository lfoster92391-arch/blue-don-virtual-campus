import { redirect } from "next/navigation";

/**
 * Broadcast Studio / OBS console is no longer a campus destination.
 * Record and Go Live live on the Control Room and phone camera.
 */
export default function BroadcastStudioRedirectPage() {
  redirect("/organizations/broadcasting?tab=media");
}
