import { Suspense } from "react";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { isSupabaseConfigured } from "@/config/env";

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ForgotPasswordForm supabaseConfigured={isSupabaseConfigured()} />
    </Suspense>
  );
}
