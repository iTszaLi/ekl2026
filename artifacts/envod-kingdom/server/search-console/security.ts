import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";

const SESSION_COOKIE = "__Host-envod_gsc_admin";
const STATE_COOKIE = "envod_gsc_oauth_state";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function signature(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function constantTimeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function cookieValue(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const item of header.split(";")) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() === name) {
      return decodeURIComponent(item.slice(separator + 1).trim());
    }
  }
  return undefined;
}

function isSecureRequest(req: Request): boolean {
  return req.secure || process.env.NODE_ENV === "production";
}

function serializeCookie(
  name: string,
  value: string,
  req: Request,
  options: { maxAge: number; path: string },
): string {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (isSecureRequest(req)) parts.push("Secure");
  return parts.join("; ");
}

export function setOAuthStateCookie(
  req: Request,
  res: Response,
  state: string,
  path: string,
): void {
  res.append(
    "Set-Cookie",
    serializeCookie(STATE_COOKIE, state, req, { maxAge: 600, path }),
  );
}

export function clearOAuthStateCookie(
  req: Request,
  res: Response,
  path: string,
): void {
  res.append(
    "Set-Cookie",
    serializeCookie(STATE_COOKIE, "", req, { maxAge: 0, path }),
  );
}

export function getOAuthStateCookie(req: Request): string | undefined {
  return cookieValue(req, STATE_COOKIE);
}

export function setAdminSessionCookie(
  req: Request,
  res: Response,
  email: string,
  secret: string,
  now = Date.now(),
): void {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      expiresAt: now + SESSION_TTL_SECONDS * 1000,
    }),
  ).toString("base64url");
  const value = `${payload}.${signature(payload, secret)}`;
  res.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, value, req, {
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    }),
  );
}

export function clearAdminSessionCookie(req: Request, res: Response): void {
  res.append(
    "Set-Cookie",
    serializeCookie(SESSION_COOKIE, "", req, {
      maxAge: 0,
      path: "/",
    }),
  );
}

export function getAdminSession(
  req: Request,
  secret: string | undefined,
  allowedEmail: string | undefined,
  now = Date.now(),
): { email: string; expiresAt: number } | null {
  if (!secret || !allowedEmail) return null;
  const value = cookieValue(req, SESSION_COOKIE);
  if (!value) return null;
  const separator = value.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  if (!constantTimeEqual(suppliedSignature, signature(payload, secret))) {
    return null;
  }

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (!decoded || typeof decoded !== "object") return null;
    const session = decoded as { email?: unknown; expiresAt?: unknown };
    if (
      typeof session.email !== "string" ||
      typeof session.expiresAt !== "number" ||
      !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= now
    ) {
      return null;
    }
    const email = session.email.trim().toLowerCase();
    if (email !== allowedEmail.trim().toLowerCase()) return null;
    return { email, expiresAt: session.expiresAt };
  } catch {
    return null;
  }
}

export const searchConsoleSessionCookieName = SESSION_COOKIE;
