import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/config/env";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginForm supabaseConfigured={isSupabaseConfigured()} />
    </Suspense>
  );
}
