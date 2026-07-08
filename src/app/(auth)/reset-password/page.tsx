import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { isSupabaseConfigured } from "@/config/env";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ResetPasswordForm supabaseConfigured={isSupabaseConfigured()} />
    </Suspense>
  );
}
