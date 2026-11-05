import type { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { User } from "@repo/db";

// replaces next-auth's JWT session strategy: the session is a signed token
// stored in an httpOnly cookie, so nothing is kept in the database
export const SESSION_COOKIE = "pridictx.session-token";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days, same as next-auth

export interface Session {
  user: {
    id: number;
    email: string;
    role: User["role"];
  };
  expires: string;
}

interface SessionToken {
  sub: string;
  email: string;
  role: User["role"];
  exp: number;
}

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

// what goes into the token (next-auth's `jwt` callback)
function toToken(user: Pick<User, "id" | "email" | "role">) {
  return { sub: String(user.id), email: user.email, role: user.role };
}

// what the client gets back (next-auth's `session` callback)
function toSession(token: SessionToken): Session {
  return {
    user: { id: Number(token.sub), email: token.email, role: token.role },
    expires: new Date(token.exp * 1000).toISOString(),
  };
}

export function createSession(res: Response, user: Pick<User, "id" | "email" | "role">) {
  const token = jwt.sign(toToken(user), getSecret(), {
    expiresIn: SESSION_MAX_AGE_SECONDS,
  });

  res.cookie(SESSION_COOKIE, token, {
    ...cookieOptions(),
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
  });

  return toSession(jwt.decode(token) as SessionToken);
}

// null when there is no cookie, or the token is invalid / expired
export function getSession(req: Request): Session | null {
  const token: unknown = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string") return null;

  try {
    const payload = jwt.verify(token, getSecret());
    if (typeof payload === "string" || !payload.sub) return null;
    return toSession(payload as SessionToken);
  } catch {
    return null;
  }
}

export function destroySession(res: Response) {
  res.clearCookie(SESSION_COOKIE, cookieOptions());
}
