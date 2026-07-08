import { Suspense } from "react";

import { RegisterForm } from "@/components/auth/register-form";
import { isSupabaseConfigured } from "@/config/env";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <RegisterForm supabaseConfigured={isSupabaseConfigured()} />
    </Suspense>
  );
}
