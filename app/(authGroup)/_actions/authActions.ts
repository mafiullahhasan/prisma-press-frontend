"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  accessCookieOptions,
  api,
  refreshCookieOptions,
} from "@/lib/api";
import type { ActionState, User } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim();

/** POST /api/auth/login */
export const loginAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) return { success: false, message: "Enter a valid email" };
  if (!password) return { success: false, message: "Password is required" };

  const result = await api<{ accessToken: string; refreshToken: string }>(
    "/api/auth/login",
    { method: "POST", body: { email, password }, auth: false },
  );

  if (!result.success || !result.data?.accessToken) {
    // Backend answers 404 (P2025) for an unknown email — show a generic message.
    const message =
      result.statusCode === 404 || result.statusCode === 401
        ? "Invalid email or password"
        : result.message || "Login failed";
    return { success: false, message };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, result.data.accessToken, accessCookieOptions);
  cookieStore.set(REFRESH_COOKIE, result.data.refreshToken, refreshCookieOptions);

  const next = str(formData, "next");
  // Only allow internal paths to avoid open redirects.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard");
};

/** POST /api/users/register */
export const registerAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const name = str(formData, "name");
  const email = str(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const profilePhoto = str(formData, "profilePhoto");

  if (name.length < 2) return { success: false, message: "Name must be at least 2 characters" };
  if (!EMAIL_RE.test(email)) return { success: false, message: "Enter a valid email" };
  if (password.length < 6)
    return { success: false, message: "Password must be at least 6 characters" };
  if (profilePhoto && !URL.canParse(profilePhoto))
    return { success: false, message: "Profile photo must be a valid URL" };

  const result = await api<User>("/api/users/register", {
    method: "POST",
    body: { name, email, password, profilePhoto: profilePhoto || undefined },
    auth: false,
  });

  if (!result.success) {
    return { success: false, message: result.message || "Registration failed" };
  }

  redirect("/login?registered=1");
};
