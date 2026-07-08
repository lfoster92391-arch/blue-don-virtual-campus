import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { AuthShell } from "@/components/auth/auth-shell";

export function SupabaseRequiredPage() {
  return (
    <AuthShell
      title="Supabase setup required"
      description="Authentication is configured but your environment variables still need real Supabase project values."
    >
      <SupabaseSetupNotice />
    </AuthShell>
  );
}
