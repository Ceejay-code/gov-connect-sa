import crypto from "node:crypto";
import type { H3Event } from "h3";

// export const ADMIN_SESSION_COOKIE = "govconnect_admin_session";
export const ADMIN_SESSION_COOKIE = "civilink_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;

type AttemptRecord = {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number;
};

const failedAttempts = new Map<string, AttemptRecord>();
let ephemeralSecret: string | undefined;

/**
 * Compares two strings in constant time by hashing both to fixed-length digests.
 */
export function verifyPasswordConstantTime(input: string, expected: string): boolean {
  if (!input || !expected) return false;
  const inputDigest = crypto.createHash("sha256").update(input, "utf8").digest();
  const expectedDigest = crypto.createHash("sha256").update(expected, "utf8").digest();
  return crypto.timingSafeEqual(inputDigest, expectedDigest);
}

/**
 * Creates an HMAC-SHA256 signed session token containing issued-at and expiry timestamps.
 */
export function createSessionToken(
  secret: string,
  ttlSeconds: number = ADMIN_SESSION_TTL_SECONDS,
  nowMs: number = Date.now(),
): string {
  const nowSec = Math.floor(nowMs / 1000);
  const payload = {
    iat: nowSec,
    exp: nowSec + ttlSeconds,
    jti: crypto.randomBytes(16).toString("hex"),
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64, "utf8")
    .digest("base64url");
  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token and checks its expiration.
 */
export function verifySessionToken(
  token: string | undefined,
  secret: string,
  nowMs: number = Date.now(),
): boolean {
  if (!token || !secret) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) return false;

  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payloadB64, "utf8")
    .digest("base64url");

  const sigBuf = Buffer.from(signatureB64, "utf8");
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return false;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as {
      iat?: unknown;
      exp?: unknown;
    };
    if (typeof parsed.iat !== "number" || typeof parsed.exp !== "number") return false;
    const nowSec = Math.floor(nowMs / 1000);
    return parsed.exp > nowSec && parsed.iat <= nowSec + 60;
  } catch {
    return false;
  }
}

export function getAdminPassword(): string {
  const config = useRuntimeConfig();
  const password = (config.adminPassword as string) || process.env.ADMIN_PASSWORD || "";
  if (!password) {
    throw createError({
      statusCode: 503,
      statusMessage: "Admin access is not configured on the server.",
    });
  }
  return password;
}

export function getAdminSessionSecret(): string {
  const config = useRuntimeConfig();
  const configured =
    (config.adminSessionSecret as string) || process.env.ADMIN_SESSION_SECRET || "";
  if (configured) return configured;
  if (!ephemeralSecret) {
    ephemeralSecret = crypto.randomBytes(32).toString("hex");
  }
  return ephemeralSecret;
}

export function isAdminAuthenticated(event: H3Event): boolean {
  const token = getCookie(event, ADMIN_SESSION_COOKIE);
  if (!token) return false;
  return verifySessionToken(token, getAdminSessionSecret());
}

export function requireAdminSession(event: H3Event): void {
  if (!isAdminAuthenticated(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized.",
    });
  }
}

export function setAdminSessionCookie(event: H3Event): void {
  const token = createSessionToken(getAdminSessionSecret());
  setCookie(event, ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(event: H3Event): void {
  deleteCookie(event, ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

function getClientKey(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) || "unknown";
}

export function assertLoginAllowed(event: H3Event, nowMs: number = Date.now()): void {
  const key = getClientKey(event);
  const record = failedAttempts.get(key);
  if (!record) return;

  if (record.lockedUntil > nowMs) {
    const retryAfterSec = Math.ceil((record.lockedUntil - nowMs) / 1000);
    setResponseHeader(event, "Retry-After", retryAfterSec);
    throw createError({
      statusCode: 429,
      statusMessage: "Too many failed login attempts. Try again later.",
    });
  }

  if (nowMs - record.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    failedAttempts.delete(key);
  }
}

export function recordFailedLogin(event: H3Event, nowMs: number = Date.now()): void {
  const key = getClientKey(event);
  const existing = failedAttempts.get(key);

  if (!existing || nowMs - existing.firstAttemptAt > ATTEMPT_WINDOW_MS) {
    failedAttempts.set(key, { count: 1, firstAttemptAt: nowMs, lockedUntil: 0 });
    return;
  }

  const nextCount = existing.count + 1;
  failedAttempts.set(key, {
    count: nextCount,
    firstAttemptAt: existing.firstAttemptAt,
    lockedUntil: nextCount >= MAX_FAILED_ATTEMPTS ? nowMs + LOCKOUT_MS : 0,
  });
}

export function clearFailedLogins(event: H3Event): void {
  failedAttempts.delete(getClientKey(event));
}
