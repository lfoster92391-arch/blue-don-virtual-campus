import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { isSupabaseAdminConfigured } from "@/config/env";

/**
 * Service-role Supabase client for privileged, server-only operations such as
 * administering other users' auth records. The service-role key bypasses Row
 * Level Security, so this client must never be imported into client components.
 */
export function createAdminClient(): SupabaseClient | null {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
