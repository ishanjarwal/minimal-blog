import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "blog_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

function getSecretKey(): string {
  const secret = process.env.ADMIN_SECRET_KEY;
  if (!secret) {
    throw new Error("ADMIN_SECRET_KEY is not defined in environment variables");
  }
  return secret;
}

function generateSignature(payload: string): string {
  return createHmac("sha256", getSecretKey()).update(payload).digest("hex");
}

/**
 * Validates whether the supplied secret matches the environment ADMIN_SECRET_KEY.
 * Uses timingSafeEqual to guard against timing attacks.
 */
export function verifyAdminPasskey(passkey: string): boolean {
  try {
    const expected = Buffer.from(getSecretKey());
    const actual = Buffer.from(passkey.trim());

    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Issues an httpOnly, SameSite=Lax signed session cookie to authenticate the admin.
 */
export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const timestamp = Date.now().toString();
  const signature = generateSignature(timestamp);
  const token = `${timestamp}.${signature}`;

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

/**
 * Checks if the current request has a valid, non-tampered admin session cookie.
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return false;
    }

    const [timestamp, signature] = token.split(".");
    if (!timestamp || !signature) {
      return false;
    }

    // Verify signature
    const expectedSignature = generateSignature(timestamp);
    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
      return false;
    }

    // Check expiration (7 days)
    const ageSeconds = (Date.now() - parseInt(timestamp, 10)) / 1000;
    if (ageSeconds > SESSION_MAX_AGE || isNaN(ageSeconds)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Destroys the admin session cookie upon logout.
 */
export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Guard utility for Server Actions and API handlers. Throws if caller is not the admin.
 */
export async function assertAdmin(): Promise<void> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    throw new Error("Unauthorized: Admin passkey session required");
  }
}
