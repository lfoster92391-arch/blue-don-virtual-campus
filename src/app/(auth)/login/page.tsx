import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/config/env";
import { getDevPhoneAccessHint } from "@/lib/dev-lan";

export default async function LoginPage() {
  const phoneAccessHint = await getDevPhoneAccessHint();

  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <LoginForm
        supabaseConfigured={isSupabaseConfigured()}
        phoneAccessHint={phoneAccessHint}
      />
    </Suspense>
  );
}
