import {
  GUEST_HOME_PATH,
  SCHOOL_HOME_PATH,
  parseLoginIntent,
  type LoginIntent,
} from "@/config/login-audience";

function isSafeNextPath(value: string | null | undefined): value is string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return false;
  }
  if (value.startsWith("/login") || value.startsWith("/register")) {
    return false;
  }
  return true;
}

/** School home for a chosen login intent. Guest never uses this. */
export function schoolHomePath(intent?: LoginIntent | null): string {
  if (!intent) {
    return SCHOOL_HOME_PATH;
  }
  return `${SCHOOL_HOME_PATH}?intent=${intent}`;
}

/**
 * Where to send someone after they pick a door on login.
 * Role buttons only set intent — they do not grant a role.
 */
export function destinationAfterLogin(input: {
  intent?: LoginIntent | null;
  next?: string | null;
}): string {
  if (isSafeNextPath(input.next) && input.next !== SCHOOL_HOME_PATH) {
    if (!input.intent) {
      return input.next;
    }
    const separator = input.next.includes("?") ? "&" : "?";
    if (input.next.includes("intent=")) {
      return input.next;
    }
    return `${input.next}${separator}intent=${input.intent}`;
  }

  return schoolHomePath(input.intent);
}

export function destinationFromLoginSearch(
  searchParams: URLSearchParams,
): string {
  const audience = searchParams.get("audience");
  if (audience === "guest") {
    return GUEST_HOME_PATH;
  }

  return destinationAfterLogin({
    intent: parseLoginIntent(searchParams.get("role") ?? searchParams.get("intent")),
    next: searchParams.get("next"),
  });
}
