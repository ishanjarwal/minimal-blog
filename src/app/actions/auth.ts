"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifyAdminPasskey,
  createAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
} from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function loginAdminAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

  // Strict rate limit on admin passkey attempts (max 5 attempts per minute)
  const rateLimit = checkRateLimit(`admin-auth:${ip}`, {
    intervalMs: 60 * 1000,
    maxRequests: 5,
  });

  if (!rateLimit.success) {
    return {
      success: false,
      error: `Too many login attempts. Please wait ${rateLimit.reset} seconds.`,
    };
  }

  const passkey = formData.get("passkey") as string;
  if (!passkey) {
    return { success: false, error: "Passkey is required" };
  }

  const isValid = verifyAdminPasskey(passkey);
  if (!isValid) {
    return { success: false, error: "Invalid admin passkey" };
  }

  await createAdminSession();
  return { success: true };
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSession();
  redirect("/");
}

export async function getAdminStatus(): Promise<{ authenticated: boolean }> {
  const authenticated = await isAdminAuthenticated();
  return { authenticated };
}
