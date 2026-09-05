"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  GUEST_HOME_PATH,
  LOGIN_COPY,
  LOGIN_INTENTS,
  type LoginIntent,
} from "@/config/login-audience";

function buildSchoolHref(input: {
  next: string | null;
  role?: LoginIntent;
}): string {
  const params = new URLSearchParams();
  params.set("audience", "school");
  if (input.role) {
    params.set("role", input.role);
  }
  if (input.next) {
    params.set("next", input.next);
  }
  return `/login?${params.toString()}`;
}

export function LoginAudienceChooser({ next }: { next: string | null }) {
  return (
    <div className="space-y-3">
      <Button
        variant="action"
        size="lg"
        className="h-auto min-h-12 w-full flex-col items-start gap-1 whitespace-normal px-5 py-4 text-left"
        nativeButton={false}
        render={
          <Link href={buildSchoolHref({ next })}>
            <span className="block text-base font-semibold">
              {LOGIN_COPY.schoolLabel}
            </span>
            <span className="block text-sm font-normal text-white/85">
              {LOGIN_COPY.schoolBlurb}
            </span>
          </Link>
        }
      />
      <Button
        variant="action"
        size="lg"
        className="h-auto min-h-12 w-full flex-col items-start gap-1 whitespace-normal px-5 py-4 text-left"
        nativeButton={false}
        render={
          <Link href={GUEST_HOME_PATH}>
            <span className="block text-base font-semibold">
              {LOGIN_COPY.guestLabel}
            </span>
            <span className="block text-sm font-normal text-white/85">
              {LOGIN_COPY.guestBlurb}
            </span>
          </Link>
        }
      />
    </div>
  );
}

export function LoginRoleChooser({ next }: { next: string | null }) {
  return (
    <div className="space-y-3">
      {LOGIN_INTENTS.map((intent) => (
        <Button
          key={intent}
          variant="action"
          size="lg"
          className="h-auto min-h-12 w-full flex-col items-start gap-1 whitespace-normal px-5 py-4 text-left"
          nativeButton={false}
          render={
            <Link href={buildSchoolHref({ next, role: intent })}>
              <span className="block text-base font-semibold">
                {LOGIN_COPY.roles[intent].label}
              </span>
              <span className="block text-sm font-normal text-white/85">
                {LOGIN_COPY.roles[intent].blurb}
              </span>
            </Link>
          }
        />
      ))}
      <p className="pt-1 text-center text-sm">
        <Link
          href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
          className="font-medium text-[#0A2342] hover:underline dark:text-white"
        >
          All sign-in options
        </Link>
      </p>
    </div>
  );
}
