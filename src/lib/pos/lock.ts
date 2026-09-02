import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

import {
  POS_PIN_LENGTH,
  POS_UNLOCK_COOKIE,
  POS_UNLOCK_MAX_AGE_SECONDS,
} from "@/config/pos";

/**
 * The lock on the Cricut Club register.
 *
 * The PIN is read from the environment on the server and compared on the
 * server. It is never sent to the browser and never reaches a client bundle —
 * like `lib/supabase/admin.ts`, this module must not be imported from a
 * component marked `"use client"`.
 *
 * Set `POS_PIN` (four digits) in the deployment environment to change it. The
 * built-in fallback is the PIN the office already uses, so an unconfigured
 * deployment still opens for staff instead of locking them out.
 */
const FALLBACK_PIN = "0901";

/** A correct PIN mints this; the cookie carries no PIN, only a signed grant. */
type UnlockGrant = {
  userId: string;
  expiresAt: number;
};

function configuredPin(): string {
  const raw = process.env.POS_PIN?.trim();
  return raw && new RegExp(`^\\d{${POS_PIN_LENGTH}}$`).test(raw)
    ? raw
    : FALLBACK_PIN;
}

/**
 * Signing key for the unlock cookie, so a crafted cookie cannot open the
 * register. Any server-only secret works; the PIN is the last resort and is
 * never transmitted, only used as key material.
 */
function signingKey(): string {
  return (
    process.env.POS_SESSION_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    configuredPin()
  );
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function isPosPinShape(value: string): boolean {
  return new RegExp(`^\\d{${POS_PIN_LENGTH}}$`).test(value);
}

/** Constant-time PIN comparison so timing cannot leak a digit. */
export function verifyPosPin(candidate: string): boolean {
  if (!isPosPinShape(candidate)) {
    return false;
  }
  return constantTimeEquals(candidate, configuredPin());
}

function encodeGrant(grant: UnlockGrant): string {
  const payload = `${grant.userId}.${grant.expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function decodeGrant(raw: string): UnlockGrant | null {
  const lastDot = raw.lastIndexOf(".");
  if (lastDot <= 0) {
    return null;
  }

  const payload = raw.slice(0, lastDot);
  const signature = raw.slice(lastDot + 1);
  if (!constantTimeEquals(signature, sign(payload))) {
    return null;
  }

  const split = payload.lastIndexOf(".");
  if (split <= 0) {
    return null;
  }

  const expiresAt = Number.parseInt(payload.slice(split + 1), 10);
  if (!Number.isFinite(expiresAt)) {
    return null;
  }

  return { userId: payload.slice(0, split), expiresAt };
}

function unlockCookieOptions(): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: POS_UNLOCK_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  };
}

/**
 * Whether this browser holds an open register for this cashier. The grant is
 * bound to the user, so it does not survive a switch of accounts.
 */
export async function isRegisterUnlocked(userId: string): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(POS_UNLOCK_COOKIE)?.value;
  if (!raw) {
    return false;
  }

  const grant = decodeGrant(raw);
  if (!grant || grant.userId !== userId) {
    return false;
  }

  return grant.expiresAt > Date.now();
}

/** Open the register for one shift. Only callable from a Server Action. */
export async function grantRegisterUnlock(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(
    POS_UNLOCK_COOKIE,
    encodeGrant({
      userId,
      expiresAt: Date.now() + POS_UNLOCK_MAX_AGE_SECONDS * 1000,
    }),
    unlockCookieOptions(),
  );
}

/** Close the register — the next visit asks for the PIN again. */
export async function clearRegisterUnlock(): Promise<void> {
  const jar = await cookies();
  jar.delete({
    name: POS_UNLOCK_COOKIE,
    path: "/",
    ...(process.env.NODE_ENV === "production" ? { secure: true } : {}),
  });
}
