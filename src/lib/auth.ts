import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

import { getAuthSecret } from "@/lib/auth-secret";
import { COOKIE } from "@/lib/constants";
import { baseCookie } from "@/lib/cookies";
import type { SessionUser } from "@/lib/types";

function key() {
  return new TextEncoder().encode(getAuthSecret());
}

export async function signSession(user: SessionUser) {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(key());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, key());
    if (typeof payload.sub !== "string" || typeof payload.email !== "string" || typeof payload.name !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role === "ADMIN" ? "ADMIN" : "CUSTOMER",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE.session)?.value;
  if (!token) return null;
  return readSessionToken(token);
}

export async function setSession(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE.session, await signSession(user), {
    ...baseCookie,
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE.session);
}
