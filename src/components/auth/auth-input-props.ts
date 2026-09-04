import type { ComponentProps } from "react";

type AuthInputAttrs = Pick<
  ComponentProps<"input">,
  | "type"
  | "inputMode"
  | "autoComplete"
  | "autoCapitalize"
  | "autoCorrect"
  | "spellCheck"
>;

/** Stops iOS/Android from auto-capitalizing or “correcting” the email. */
export const AUTH_EMAIL_INPUT_PROPS = {
  type: "email",
  inputMode: "email",
  autoComplete: "email",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
} as const satisfies AuthInputAttrs;

/** Stops the first password character from being capitalized on phones. */
export const AUTH_CURRENT_PASSWORD_INPUT_PROPS = {
  type: "password",
  autoComplete: "current-password",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
} as const satisfies AuthInputAttrs;

export const AUTH_NEW_PASSWORD_INPUT_PROPS = {
  type: "password",
  autoComplete: "new-password",
  autoCapitalize: "none",
  autoCorrect: "off",
  spellCheck: false,
} as const satisfies AuthInputAttrs;
